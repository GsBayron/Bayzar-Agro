import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mensaje',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './mensaje.html',
  styleUrl: './mensaje.scss'
})
export class Mensaje {
  public mensaje: string = '';
  public titulo: string = '';
  public icono: string = '';
  public tipo: string = '';
  public btnClass: string = '';
  public confirmacion: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<Mensaje>
  ) {
    this.dialogRef.disableClose = false;

    this.mensaje = data.mensaje;
    this.titulo = data.titulo || 'Información';
    this.confirmacion = !!data.confirmacion;

    if (this.confirmacion) {
      this.tipo = 'confirmacion';
      this.icono = 'bi bi-question-lg';
      this.btnClass = 'btn-primary';
    } else {
      this.tipo = data.tipo || 'info';

      switch (data.tipo) {
        case 'error':
          this.icono = 'bi bi-x-lg';
          this.btnClass = 'btn-danger';
          break;
        case 'advertencia':
          this.icono = 'bi bi-exclamation-lg';
          this.btnClass = 'btn-warning';
          break;
        case 'exito':
          this.icono = 'bi bi-check2';
          this.btnClass = 'btn-success';
          break;
        default:
          this.icono = 'bi bi-info-lg';
          this.btnClass = 'btn-primary';
          break;
      }
    }
  }

  aceptar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}