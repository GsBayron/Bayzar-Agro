# Despliegue de BayzarAgro en Google Cloud

Esta guía despliega Angular y Laravel juntos en Cloud Run y utiliza una instancia
de prueba gratuita de Cloud SQL para MySQL. Está pensada para la presentación
universitaria, no para una operación permanente.

## Arquitectura

```text
Internet
   |
   v
Cloud Run: Angular + Apache + Laravel
   |
   v
Cloud SQL para MySQL (prueba gratuita de 30 días)
```

Angular consume `/api`, de modo que frontend y API comparten dominio y no se
necesita mantener dos despliegues.

## 1. Preparación en la consola

1. Fusionar la rama de preparación en la rama principal de GitHub.
2. Crear un proyecto exclusivo para la demostración y activar la facturación.
3. Crear un presupuesto pequeño con alertas.
4. En **Cloud SQL > Comenzar**, elegir **Experimenta Cloud SQL sin costo durante
   30 días**.
5. Crear una instancia MySQL con estos valores:
   - ID: `bayzar-agro-db`
   - Región: `us-central1`
   - Contraseña de `root`: una contraseña generada y guardada fuera de Git

Conviene crear Cloud SQL menos de 30 días antes de la presentación. Cloud Run y
Cloud SQL deben estar en `us-central1` para evitar tráfico entre regiones.

Documentación:

- https://cloud.google.com/free
- https://docs.cloud.google.com/sql/docs/mysql/create-free-trial-instance
- https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run

## 2. Abrir Cloud Shell y preparar variables

Cambiar `TU_PROJECT_ID` por el identificador real del proyecto, no por su nombre
visible.

```bash
export PROJECT_ID="TU_PROJECT_ID"
export REGION="us-central1"
export REPOSITORY="bayzar-agro"
export IMAGE_NAME="web"
export SERVICE_NAME="bayzar-agro"
export JOB_NAME="bayzar-agro-setup"
export SQL_INSTANCE="bayzar-agro-db"
export DB_NAME="bayzaragro"
export DB_USER="bayzaragro"

gcloud config set project "$PROJECT_ID"

gcloud services enable \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com
```

## 3. Descargar el proyecto

Después de fusionar el Pull Request:

```bash
git clone https://github.com/GsBayron/Bayzar-Agro.git
cd Bayzar-Agro
```

## 4. Crear Artifact Registry

```bash
gcloud artifacts repositories create "$REPOSITORY" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Imagen de BayzarAgro"
```

## 5. Crear la base, el usuario y los secretos

Los siguientes comandos se ejecutan una sola vez. No copiar sus resultados al
repositorio ni a capturas públicas.

```bash
gcloud sql databases create "$DB_NAME" \
  --instance="$SQL_INSTANCE"

DB_PASSWORD="$(openssl rand -hex 24)"

printf '%s' "$DB_PASSWORD" | \
  gcloud secrets create bayzar-db-password --data-file=-

gcloud sql users create "$DB_USER" \
  --instance="$SQL_INSTANCE" \
  --password="$DB_PASSWORD"

unset DB_PASSWORD
```

Crear la clave de Laravel:

```bash
APP_KEY_VALUE="base64:$(openssl rand -base64 32 | tr -d '\n')"

printf '%s' "$APP_KEY_VALUE" | \
  gcloud secrets create bayzar-app-key --data-file=-

unset APP_KEY_VALUE
```

Crear claves estables de Laravel Passport:

```bash
openssl genpkey \
  -algorithm RSA \
  -pkeyopt rsa_keygen_bits:4096 \
  -out /tmp/bayzar-oauth-private.key

openssl rsa \
  -pubout \
  -in /tmp/bayzar-oauth-private.key \
  -out /tmp/bayzar-oauth-public.key

gcloud secrets create bayzar-oauth-private \
  --data-file=/tmp/bayzar-oauth-private.key

gcloud secrets create bayzar-oauth-public \
  --data-file=/tmp/bayzar-oauth-public.key

rm /tmp/bayzar-oauth-private.key /tmp/bayzar-oauth-public.key
```

Crear la contraseña del administrador inicial:

```bash
ADMIN_PASSWORD="$(openssl rand -hex 12)"

printf '%s' "$ADMIN_PASSWORD" | \
  gcloud secrets create bayzar-admin-password --data-file=-

echo "Contraseña temporal del administrador: $ADMIN_PASSWORD"
```

Guardar esa contraseña en un lugar privado y después ejecutar:

```bash
unset ADMIN_PASSWORD
```

## 6. Crear la identidad de Cloud Run

```bash
gcloud iam service-accounts create bayzar-agro-run \
  --display-name="BayzarAgro Cloud Run"

export RUN_SERVICE_ACCOUNT="bayzar-agro-run@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${RUN_SERVICE_ACCOUNT}" \
  --role="roles/cloudsql.client"

for SECRET_NAME in \
  bayzar-app-key \
  bayzar-db-password \
  bayzar-oauth-private \
  bayzar-oauth-public \
  bayzar-admin-password
do
  gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
    --member="serviceAccount:${RUN_SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done
```

## 7. Construir la imagen

```bash
gcloud builds submit --config=cloudbuild.yaml .

export IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:latest"
export CONNECTION_NAME="$(gcloud sql instances describe "$SQL_INSTANCE" --format='value(connectionName)')"
```

La compilación construye Angular, instala las dependencias de producción de
Laravel y crea la imagen final de Apache/PHP.

## 8. Inicializar la base de datos

El trabajo es idempotente: aplica migraciones, carga los planes, crea el cliente
personal de Passport si falta y crea o actualiza el administrador inicial.

```bash
gcloud run jobs deploy "$JOB_NAME" \
  --image="$IMAGE_URI" \
  --region="$REGION" \
  --execution-environment=gen2 \
  --service-account="$RUN_SERVICE_ACCOUNT" \
  --set-cloudsql-instances="$CONNECTION_NAME" \
  --set-env-vars="APP_ENV=production,APP_DEBUG=false,DB_CONNECTION=mysql,DB_HOST=127.0.0.1,DB_PORT=3306,DB_SOCKET=/cloudsql/${CONNECTION_NAME},DB_DATABASE=${DB_NAME},DB_USERNAME=${DB_USER},INITIAL_ADMIN_EMAIL=admin@bayzaragro.demo,INITIAL_ADMIN_USERNAME=admin,INITIAL_ADMIN_NAME=Administrador,INITIAL_ADMIN_LAST_NAME=Demo" \
  --set-secrets="APP_KEY=bayzar-app-key:latest,DB_PASSWORD=bayzar-db-password:latest,INITIAL_ADMIN_PASSWORD=bayzar-admin-password:latest" \
  --args=setup \
  --tasks=1 \
  --max-retries=0 \
  --task-timeout=10m

gcloud run jobs execute "$JOB_NAME" \
  --region="$REGION" \
  --wait
```

El trabajo debe finalizar con `BayzarAgro quedó inicializado correctamente`.

## 9. Desplegar la aplicación

```bash
gcloud run deploy "$SERVICE_NAME" \
  --image="$IMAGE_URI" \
  --region="$REGION" \
  --execution-environment=gen2 \
  --service-account="$RUN_SERVICE_ACCOUNT" \
  --allow-unauthenticated \
  --add-cloudsql-instances="$CONNECTION_NAME" \
  --set-env-vars="APP_NAME=BayzarAgro,APP_ENV=production,APP_DEBUG=false,APP_URL=https://example.invalid,APP_LOCALE=es,APP_FALLBACK_LOCALE=es,CORS_ALLOWED_ORIGINS=https://example.invalid,LOG_CHANNEL=stderr,LOG_LEVEL=warning,DB_CONNECTION=mysql,DB_HOST=127.0.0.1,DB_PORT=3306,DB_SOCKET=/cloudsql/${CONNECTION_NAME},DB_DATABASE=${DB_NAME},DB_USERNAME=${DB_USER},SESSION_DRIVER=database,SESSION_LIFETIME=120,SESSION_ENCRYPT=true,SESSION_SECURE_COOKIE=true,SESSION_SAME_SITE=lax,CACHE_STORE=database,QUEUE_CONNECTION=sync" \
  --set-secrets="APP_KEY=bayzar-app-key:latest,DB_PASSWORD=bayzar-db-password:latest,/var/www/html/storage/oauth-private.key=bayzar-oauth-private:latest,/var/www/html/storage/oauth-public.key=bayzar-oauth-public:latest" \
  --port=8080 \
  --cpu=1 \
  --memory=512Mi \
  --concurrency=20 \
  --min-instances=0 \
  --max-instances=1 \
  --timeout=60 \
  --cpu-throttling
```

Configurar la URL real que Cloud Run asignó:

```bash
export SERVICE_URL="$(gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --format='value(status.url)')"

gcloud run services update "$SERVICE_NAME" \
  --region="$REGION" \
  --update-env-vars="APP_URL=${SERVICE_URL},CORS_ALLOWED_ORIGINS=${SERVICE_URL}"

echo "$SERVICE_URL"
```

## 10. Verificación

```bash
curl --fail --show-error "$SERVICE_URL/up"
curl --head --fail --show-error "$SERVICE_URL/"
```

Después, abrir `$SERVICE_URL` y comprobar:

1. Página pública.
2. Inicio de sesión con usuario `admin` y la contraseña temporal guardada.
3. Dashboard vacío.
4. Registro de un agricultor con el plan gratuito.
5. Creación y eliminación de una finca o cultivo.
6. Reporte sin datos.

Cloud Run puede tardar algunos segundos en responder después de escalar a cero.
Abrir la aplicación unos minutos antes de la presentación.

## 11. Después de la presentación

No actualizar la instancia gratuita de Cloud SQL a una instancia pagada. Si el
proyecto de Google Cloud se creó exclusivamente para esta demostración, eliminar
el proyecto detiene y elimina todos sus recursos:

```bash
gcloud projects delete "$PROJECT_ID"
```

Este comando es irreversible y solo debe usarse si el proyecto no contiene otros
recursos importantes.
