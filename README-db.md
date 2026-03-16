# Base de datos — creación y carga de seeds (paso a paso)

Este documento explica cómo crear la base de datos y ejecutar los seeds para el backend del proyecto.

Precondiciones
- Sistema: Linux / bash
- Node.js >= 18 y npm
- MySQL o MariaDB accesible (local o remoto)
- Ubicación del backend en el repo: `libro-clases-backend/`

Rutas relevantes
- Carpeta del backend: `/home/fcorreas/Desktop/libro_de_clases/libro-clases-backend`
- Scripts de seed: `prisma/seed.ts` (invocado con `npm run prisma:seed`)

1) Hacer backup (si tienes datos que quieras preservar)

- Reemplaza DB_USER/DB_NAME por tus valores:

```bash
mysqldump -u DB_USER -p DB_NAME > ~/backup_libro_clases.sql
```

2) Preparar la base (crear base y usuario) — ejemplo con cliente mysql

- Crear la base (ejemplo `libro_clases_dev`):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS libro_clases_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

- (Opcional) crear usuario y dar permisos:

```bash
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'libro'@'%' IDENTIFIED BY 'password'; GRANT ALL PRIVILEGES ON libro_clases_dev.* TO 'libro'@'%'; FLUSH PRIVILEGES;"
```

3) Configurar variable de entorno DATABASE_URL

- En la carpeta `libro-clases-backend` crea o edita un archivo `.env` con:

```env
DATABASE_URL="mysql://libro:password@localhost:3306/libro_clases_dev"
```

- O exporta temporalmente en la terminal:

```bash
export DATABASE_URL="mysql://libro:password@localhost:3306/libro_clases_dev"
```

4) Instalar dependencias y generar Prisma Client

```bash
cd /home/fcorreas/Desktop/libro_de_clases/libro-clases-backend
npm install
npx prisma generate
```

5A) (Desarrollo — destructivo) Reset + migraciones + Seed

> Atención: los siguientes pasos borran los datos existentes. Hacer backup antes.

```bash
# Resetea la base (borra y recrea tablas según migraciones)
npx prisma migrate reset --force
# Ejecuta los seeds definidos en prisma/seed.ts
npm run prisma:seed
```

5B) (Producción / no destructivo) Aplicar migraciones y (opcional) seed

```bash
# Aplica migraciones sin reset (uso recomendado en producción)
npx prisma migrate deploy
# Ejecutar seed si corresponde (revisar lo que hace el seed antes de correrlo en prod)
npm run prisma:seed
```

6) Verificar

```bash
# Levantar servidor en modo desarrollo
npm run start:dev
# Probar endpoints (ejemplo)
curl -sS http://localhost:3000/api/courses | jq
```

7) Alternativa rápida con Docker (si no tienes DB local)

```bash
# Levantar MariaDB temporal
docker run --name libro-db -e MARIADB_ROOT_PASSWORD=rootpw -e MARIADB_DATABASE=libro_clases_dev -p 3306:3306 -d mariadb:10.11
# Esperar a que esté listo y luego exportar
export DATABASE_URL="mysql://root:rootpw@127.0.0.1:3306/libro_clases_dev"
# Generar cliente, reset y seed
npx prisma generate
npx prisma migrate reset --force
npm run prisma:seed
```

8) Problemas comunes y soluciones rápidas

- Error Prisma P2003 al eliminar: hay filas dependientes (ej. `grades`) que referencian la fila que intentas borrar. Debes eliminar o reasociar esas dependencias primero o cambiar la política de borrado en el esquema con precaución.
- `event.currentTarget is null` en formularios con await: captura `const form = event.currentTarget` antes de las operaciones `await` (ya aplicado en el frontend).
- Ejecuta `npx prisma generate` después de modificar `schema.prisma`.
- Si `npm run prisma:seed` falla por tablas faltantes, ejecuta migraciones primero (`npx prisma migrate reset --force` o `npx prisma migrate deploy`).
- Verifica que `DATABASE_URL` tenga usuario, contraseña, host y puerto correctos.

9) Recomendaciones

- Siempre realiza backup antes de resetear o seedear en bases con datos importantes.
- En producción evita `migrate reset`; usa `migrate deploy` y un plan de backup/migración.
- Mantén secretos (DATABASE_URL, JWT_SECRET) fuera del repositorio.

Resumen rápido de comandos (desde la carpeta backend)

```bash
npm install
npx prisma generate
npx prisma migrate reset --force   # dev, destructivo
npm run prisma:seed
npm run start:dev
```

Si quieres que también cree un `docker-compose.yml` para levantar la BD + backend y así automatizar el flujo, dímelo y lo añado.
