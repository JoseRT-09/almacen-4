# 🏢 Sistema de Gestión de Residencias - Guía de Configuración

Esta guía te ayudará a configurar y ejecutar correctamente el sistema de gestión de residencias.

## 📋 Prerequisitos

Asegúrate de tener instalado:

- **Node.js** (v18 o superior) - [Descargar aquí](https://nodejs.org/)
- **PostgreSQL** (v14 o superior) - [Descargar aquí](https://www.postgresql.org/download/)
- **npm** (viene con Node.js)

## 🚀 Instalación Inicial

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd almacen-4
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Base de Datos PostgreSQL

#### Opción A: Crear base de datos manualmente

```sql
-- Conéctate a PostgreSQL
psql -U postgres

-- Crea la base de datos
CREATE DATABASE residence_management;

-- Sal de psql
\q
```

#### Opción B: Usar pgAdmin

1. Abre pgAdmin
2. Crea una nueva base de datos llamada `residence_management`
3. Asegúrate de tener las credenciales listas

### 4. Configurar Variables de Entorno

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=residence_management
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_AQUI

# Servidor
PORT=3000
NODE_ENV=development

# JWT (cambia esto en producción)
JWT_SECRET=tu_secreto_super_seguro_cambialo_en_produccion
JWT_EXPIRES_IN=7d

# Sincronización de BD (ver sección siguiente)
DB_ALTER_SYNC=true
```

## 🔧 Modos de Sincronización de Base de Datos

El sistema ofrece tres modos de sincronización:

### Modo 1: Crear Tablas (Producción)
**Sin variables adicionales en .env**

```bash
npm run server
```

- ✅ Crea tablas si no existen
- ✅ No modifica tablas existentes
- ✅ No borra datos
- ⚠️ No agrega campos nuevos automáticamente

### Modo 2: Actualizar Tablas (Recomendado) ⭐
**Agregar en .env:** `DB_ALTER_SYNC=true`

```bash
npm run server:alter
```

- ✅ Crea tablas si no existen
- ✅ Actualiza estructura de tablas existentes
- ✅ Agrega campos nuevos (como el campo `notas` en activities)
- ✅ Mantiene todos los datos existentes
- ✅ Ideal después de actualizar el código

### Modo 3: Recrear Tablas (PELIGRO - Solo Desarrollo) 💥
**Agregar en .env:** `DB_FORCE_SYNC=true`

```bash
npm run server:force
```

- ⚠️ **BORRA TODOS LOS DATOS**
- ⚠️ Recrea todas las tablas desde cero
- ⚠️ Solo usar en desarrollo inicial o testing

## 🎯 Primer Inicio (Configuración Inicial)

### Opción 1: Desarrollo desde Cero (Recrear todo)

```bash
# 1. Configura .env con DB_FORCE_SYNC=true
echo "DB_FORCE_SYNC=true" >> .env

# 2. Inicia el servidor (esto creará todas las tablas)
npm run server:force

# 3. Detén el servidor (Ctrl+C) y cambia a modo seguro
# Edita .env: cambia DB_FORCE_SYNC=true a DB_ALTER_SYNC=true

# 4. Reinicia en modo normal
npm run server:alter
```

### Opción 2: Actualización de Código Existente (Recomendado)

```bash
# 1. Configura para actualizar sin borrar datos
echo "DB_ALTER_SYNC=true" >> .env

# 2. Inicia el servidor (actualizará las tablas)
npm run server:alter
```

## 📦 Migración de Datos (Reportes)

Si ya tienes reportes con tipos antiguos en la base de datos, ejecuta el script de migración:

```bash
npm run migrate:reports
```

Este script actualizará los tipos de reportes:
- `Incendio` → `Seguridad`
- `Eléctrico` → `Instalaciones`
- `Agua` → `Instalaciones`
- `Robo` → `Seguridad`
- `Otro` → `Otro` (sin cambios)

## 🏃 Ejecutar la Aplicación

### Backend Solo

```bash
# Modo normal (con las opciones del .env)
npm run server

# Modo desarrollo con auto-reload
npm run server:dev

# Modo alter (actualizar tablas sin borrar datos)
npm run server:alter

# Modo force (RECREAR tablas - BORRA DATOS)
npm run server:force
```

### Frontend Solo

```bash
# Modo desarrollo
npm start

# Modo desarrollo con apertura automática
npm run start:dev

# Modo producción
npm run serve:prod
```

### Backend + Frontend Simultáneamente

```bash
# Ejecutar ambos al mismo tiempo (requiere instalar concurrently)
npm install -g concurrently
npm run dev
```

## 🔍 Verificar que Todo Funciona

### 1. Verificar Backend

Abre en el navegador: `http://localhost:3000`

Deberías ver:
```json
{
  "message": "API de Administración de Residencias",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### 2. Verificar Salud del Servidor

Abre: `http://localhost:3000/health`

Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": 123.45
}
```

### 3. Verificar Frontend

Abre: `http://localhost:4200`

Deberías ver la aplicación Angular cargando correctamente.

## ❗ Solución de Problemas Comunes

### Error: "relation does not exist"

**Causa:** Las tablas no existen en la base de datos

**Solución:**
```bash
# Opción 1: Crear desde cero
DB_FORCE_SYNC=true npm run server

# Opción 2: Usar alter
DB_ALTER_SYNC=true npm run server
```

### Error: "column does not exist" (ejemplo: column "notas")

**Causa:** Actualizaste el código pero la base de datos no tiene los campos nuevos

**Solución:**
```bash
# Ejecutar en modo alter para actualizar la estructura
npm run server:alter
```

### Error de conexión a PostgreSQL

**Causa:** Credenciales incorrectas o servicio no iniciado

**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en `.env`
3. Prueba la conexión:
   ```bash
   psql -U postgres -d residence_management
   ```

### La aplicación no carga residencias

**Causa:** Incompatibilidades entre backend y frontend ya corregidas

**Solución:**
1. Asegúrate de estar usando la última versión del código
2. Ejecuta en modo alter para actualizar:
   ```bash
   npm run server:alter
   ```
3. Si tienes reportes con tipos antiguos:
   ```bash
   npm run migrate:reports
   ```

## 📚 Estructura del Proyecto

```
almacen-4/
├── src/                      # Backend (Node.js + Express)
│   ├── config/              # Configuración de BD
│   ├── controllers/         # Controladores de API
│   ├── models/             # Modelos de Sequelize
│   ├── routes/             # Rutas de API
│   ├── middlewares/        # Middlewares (auth, etc.)
│   ├── scripts/            # Scripts de utilidad
│   └── index.js            # Punto de entrada del servidor
├── domain/                  # Frontend - Dominio
│   ├── models/             # Interfaces TypeScript
│   ├── repositories/       # Interfaces de repositorios
│   └── use-cases/          # Casos de uso
├── data/                    # Frontend - Capa de datos
│   └── repositories/       # Implementaciones de repositorios
├── presentation/            # Frontend - UI Components
├── environments/            # Configuración de entornos
└── .env                    # Variables de entorno (crear desde .env.example)
```

## 🔐 Seguridad

### Producción

Antes de desplegar en producción:

1. **Cambia JWT_SECRET** en `.env` a un valor aleatorio seguro
2. **Elimina DB_FORCE_SYNC y DB_ALTER_SYNC** del .env
3. **Configura NODE_ENV=production**
4. **Usa contraseñas seguras** para la base de datos
5. **Configura CORS** apropiadamente

### Desarrollo

- Nunca compartas tu archivo `.env`
- Usa `.env.example` como plantilla
- Mantén credenciales locales separadas

## 📞 Soporte

Si encuentras problemas:

1. Verifica los logs del servidor en la consola
2. Revisa que todas las variables de entorno estén configuradas
3. Asegúrate de que PostgreSQL esté corriendo
4. Verifica que estés usando las versiones correctas de Node.js y npm

## 🎉 ¡Listo!

Tu sistema de gestión de residencias debería estar funcionando correctamente.

**Endpoints principales:**
- Backend API: `http://localhost:3000/api`
- Frontend: `http://localhost:4200`
- Health Check: `http://localhost:3000/health`

¡Feliz desarrollo! 🚀
