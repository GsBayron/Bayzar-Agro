<?php

namespace Tests\Feature;

use App\Models\Costo;
use App\Models\Cultivo;
use App\Models\FertilizanteRegistrado;
use App\Models\Finca;
use App\Models\Ingreso;
use App\Models\PlaguicidaRegistrado;
use App\Models\Plan;
use App\Models\Produccion;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\Passport;
use Tests\TestCase;

class DataIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Plan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->plan = Plan::create([
            'nombre' => 'Pruebas',
            'codigo' => 'pruebas',
            'precio_mensual' => 0,
            'limite_fincas' => 10,
            'estado' => true,
        ]);
    }

    public function test_farmer_only_lists_own_costs_and_administrator_lists_all(): void
    {
        $agricultorA = $this->crearUsuario('a@example.test', 'Agricultor');
        $agricultorB = $this->crearUsuario('b@example.test', 'Agricultor');
        $administrador = $this->crearUsuario('admin@example.test', 'Administrador');

        $this->crearCosto($agricultorA, 'Costo A');
        $this->crearCosto($agricultorB, 'Costo B');

        Passport::actingAs($agricultorA);

        $this->getJson('/api/costos')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.descripcion', 'Costo A');

        Passport::actingAs($administrador);

        $this->getJson('/api/costos')
            ->assertOk()
            ->assertJsonCount(2);
    }

    public function test_farmer_cannot_delete_financial_records_owned_by_another_user(): void
    {
        $propietario = $this->crearUsuario('propietario@example.test', 'Agricultor');
        $atacante = $this->crearUsuario('atacante@example.test', 'Agricultor');
        $finca = Finca::create([
            'id_usuario' => $propietario->id_usuario,
            'nombre' => 'Finca privada',
            'estado' => true,
        ]);
        $cultivo = Cultivo::create([
            'id_finca' => $finca->id_finca,
            'nombre' => 'Café',
            'estado_cultivo' => 'Activo',
            'estado' => true,
        ]);
        $costo = $this->crearCosto($propietario, 'Costo privado');
        $produccion = Produccion::create([
            'id_usuario' => $propietario->id_usuario,
            'id_finca' => $finca->id_finca,
            'id_cultivo' => $cultivo->id_cultivo,
            'fecha' => '2026-08-01',
            'cantidad' => 10,
            'unidad_medida' => 'kg',
            'estado' => true,
        ]);
        $ingreso = Ingreso::create([
            'id_usuario' => $propietario->id_usuario,
            'id_finca' => $finca->id_finca,
            'id_cultivo' => $cultivo->id_cultivo,
            'id_produccion' => $produccion->id_produccion,
            'fecha' => '2026-08-01',
            'descripcion' => 'Venta privada',
            'cantidad_vendida' => 5,
            'unidad_medida' => 'kg',
            'precio_unitario' => 100,
            'monto_total' => 500,
            'estado' => true,
        ]);

        Passport::actingAs($atacante);

        $this->deleteJson('/api/costos/'.$costo->id_costo)->assertNotFound();
        $this->deleteJson('/api/produccion/'.$produccion->id_produccion)->assertNotFound();
        $this->deleteJson('/api/ingresos/'.$ingreso->id_ingreso)->assertNotFound();

        $this->assertDatabaseHas('tbl_costo', ['id_costo' => $costo->id_costo]);
        $this->assertDatabaseHas('tbl_produccion', ['id_produccion' => $produccion->id_produccion]);
        $this->assertDatabaseHas('tbl_ingreso', ['id_ingreso' => $ingreso->id_ingreso]);
    }

    public function test_farmer_cannot_link_own_cost_to_another_users_farm(): void
    {
        $propietario = $this->crearUsuario('dueno-finca@example.test', 'Agricultor');
        $atacante = $this->crearUsuario('dueno-costo@example.test', 'Agricultor');
        $fincaAjena = Finca::create([
            'id_usuario' => $propietario->id_usuario,
            'nombre' => 'Finca ajena',
            'estado' => true,
        ]);
        $costo = $this->crearCosto($atacante, 'Costo propio');

        Passport::actingAs($atacante);

        $this->putJson('/api/costos/'.$costo->id_costo, [
            'id_finca' => $fincaAjena->id_finca,
            'id_cultivo' => null,
            'id_actividad' => null,
            'tipo_costo' => 'Insumo',
            'descripcion' => 'Intento de enlace',
            'cantidad_personas' => null,
            'horas_trabajadas' => null,
            'costo_por_hora' => null,
            'monto' => 100,
            'fecha' => '2026-08-01',
            'observaciones' => null,
            'estado' => true,
        ])->assertForbidden();

        $this->assertDatabaseHas('tbl_costo', [
            'id_costo' => $costo->id_costo,
            'id_finca' => null,
            'descripcion' => 'Costo propio',
        ]);
    }

    public function test_empty_dashboard_and_report_return_safe_defaults(): void
    {
        $agricultor = $this->crearUsuario('vacio@example.test', 'Agricultor');

        Passport::actingAs($agricultor);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('total_costos', 0)
            ->assertJsonPath('total_ingresos', 0)
            ->assertJsonPath('proximas_actividades', [])
            ->assertJsonPath('ultimos_ingresos', []);

        $this->getJson('/api/reportes/financiero')
            ->assertOk()
            ->assertJsonPath('resumen.total_ingresos', 0)
            ->assertJsonPath('resumen.total_costos', 0)
            ->assertJsonPath('resumen.margen_ganancia', 0)
            ->assertJsonPath('ingresos_por_cultivo', [])
            ->assertJsonPath('produccion_por_cultivo', []);
    }

    public function test_unknown_roles_are_rejected_before_reaching_private_controllers(): void
    {
        $usuario = $this->crearUsuario('rol-invalido@example.test', 'Invitado');

        Passport::actingAs($usuario);

        $this->getJson('/api/dashboard')
            ->assertForbidden()
            ->assertJsonPath('message', 'El rol del usuario no es válido');
    }

    public function test_administrator_can_delete_registered_product_catalogs(): void
    {
        $administrador = $this->crearUsuario('catalogos@example.test', 'Administrador');
        $plaguicida = PlaguicidaRegistrado::create([
            'nombre_comercial' => 'Producto de prueba',
            'estado' => true,
        ]);
        $fertilizante = FertilizanteRegistrado::create([
            'nombre_comercial' => 'Fertilizante de prueba',
            'estado' => true,
        ]);

        Passport::actingAs($administrador);

        $this->deleteJson('/api/plaguicidas-registrados/'.$plaguicida->id_plaguicida_registrado)
            ->assertOk();
        $this->deleteJson('/api/fertilizantes-registrados/'.$fertilizante->id_fertilizante_registrado)
            ->assertOk();

        $this->assertDatabaseMissing('tbl_plaguicida_registrado', [
            'id_plaguicida_registrado' => $plaguicida->id_plaguicida_registrado,
        ]);
        $this->assertDatabaseMissing('tbl_fertilizante_registrado', [
            'id_fertilizante_registrado' => $fertilizante->id_fertilizante_registrado,
        ]);
    }

    private function crearUsuario(string $correo, string $rol): Usuario
    {
        return Usuario::create([
            'id_plan' => $this->plan->id_plan,
            'nombre' => 'Usuario',
            'apellidos' => 'Prueba',
            'correo' => $correo,
            'acceso' => $correo,
            'secreto' => Hash::make('Contraseña-segura-123'),
            'rol' => $rol,
            'estado' => true,
            'estado_pago' => 'Activo',
        ]);
    }

    private function crearCosto(Usuario $usuario, string $descripcion): Costo
    {
        return Costo::create([
            'id_usuario' => $usuario->id_usuario,
            'tipo_costo' => 'Insumo',
            'descripcion' => $descripcion,
            'monto' => 100,
            'fecha' => '2026-08-01',
            'estado' => true,
        ]);
    }
}
