# 🔄 Guía de Migración - Actualización de Compatibilidad Backend-Frontend

Esta guía es para usuarios que ya tienen el sistema funcionando y necesitan aplicar las correcciones de compatibilidad.

## 📝 ¿Qué se Corrigió?

### Problemas Críticos Resueltos:

1. **Residencias (Residence)**
   - ✅ Formato de respuestas API corregido
   - ✅ Agregados campos: `tipo_propiedad`, `precio`

2. **Reportes (Report)**
   - ✅ **CRÍTICO:** Tipos de reportes actualizados para coincidir con backend
   - ✅ Formato de respuestas API corregido
   - ✅ Agregados campos: `reportado_por_id`, `fecha_reporte`, `notas_adicionales`

3. **Actividades (Activity)**
   - ✅ Agregado campo `inscritos_count` en frontend
   - ✅ Agregado campo `notas` en backend

4. **Quejas (Complaint)**
   - ✅ Formato de respuestas API corregido

## 🚀 Pasos de Migración

### Paso 1: Obtener el Código Actualizado

```bash
# Asegúrate de estar en la rama correcta
git fetch origin
git checkout claude/fix-compatibility-issues-01LcxhMffA5zteM8uNNvQYJY
git pull origin claude/fix-compatibility-issues-01LcxhMffA5zteM8uNNvQYJY
```

### Paso 2: Configurar Variables de Entorno

Si no tienes un archivo `.env`, créalo:

```bash
cp .env.example .env
```

Edita `.env` y agrega:

```env
# Para actualizar la base de datos sin perder datos
DB_ALTER_SYNC=true
```

### Paso 3: Actualizar la Base de Datos

El campo `notas` necesita ser agregado a la tabla `activities`:

```bash
# Esto actualizará las tablas SIN borrar datos
npm run server:alter
```

**Verás este mensaje:**
```
✅ Base de datos sincronizada - Tablas actualizadas sin perder datos
```

### Paso 4: Migrar Tipos de Reportes (IMPORTANTE)

Si tienes reportes existentes con tipos antiguos, ejecuta:

```bash
npm run migrate:reports
```

Este script convertirá automáticamente:
- `Incendio` → `Seguridad`
- `Eléctrico` → `Instalaciones`
- `Agua` → `Instalaciones`
- `Robo` → `Seguridad`

**Salida esperada:**
```
🔄 Iniciando migración de tipos de reportes...
✅ Conexión a base de datos establecida
📊 Total de reportes encontrados: X
✅ Migración completada exitosamente!
```

### Paso 5: Verificar que Todo Funcione

#### 5.1. Inicia el Backend (Modo Normal)

Después de ejecutar los pasos anteriores, cambia tu `.env`:

```env
# Comenta o elimina DB_ALTER_SYNC para modo normal
# DB_ALTER_SYNC=true
```

Luego inicia:

```bash
npm run server
```

#### 5.2. Inicia el Frontend

```bash
npm start
```

#### 5.3. Prueba la Aplicación

1. **Verifica que carguen las residencias** en `http://localhost:4200`
2. **Verifica el sidebar** - todos los elementos deberían cargar
3. **Verifica los reportes** - deberían mostrar los tipos correctos
4. **Verifica las actividades** - campo `notas` disponible

## ⚠️ Si Algo Sale Mal

### Problema: "Column 'notas' does not exist in table 'activities'"

**Solución:**
```bash
# Vuelve a ejecutar en modo alter
DB_ALTER_SYNC=true npm run server
```

### Problema: Los reportes no cargan o muestran errores

**Solución:**
```bash
# Ejecuta la migración de reportes
npm run migrate:reports
```

### Problema: Necesito empezar de cero

**Solución (ESTO BORRARÁ TODOS LOS DATOS):**
```bash
# Solo si realmente necesitas borrar todo
DB_FORCE_SYNC=true npm run server
```

## 📊 Cambios en la Base de Datos

### Tabla: `activities`
```sql
-- Campo agregado
ALTER TABLE activities ADD COLUMN notas TEXT;
```

### Tabla: `reports`
```sql
-- Los tipos de ENUM ya están actualizados en el modelo
-- La migración de datos actualiza los registros existentes
```

## 🔍 Verificación Post-Migración

### 1. Verifica la Estructura de Activities

```sql
-- Conéctate a tu base de datos
psql -U postgres -d residence_management

-- Verifica que el campo 'notas' exista
\d activities

-- Deberías ver:
-- notas | text |
```

### 2. Verifica los Tipos de Reportes

```sql
-- Cuenta reportes por tipo
SELECT tipo, COUNT(*) FROM reports GROUP BY tipo;

-- Deberías ver solo estos tipos:
-- Mantenimiento, Limpieza, Seguridad, Instalaciones, Otro
```

## 📋 Checklist de Migración

- [ ] Código actualizado (git pull)
- [ ] Archivo `.env` configurado con `DB_ALTER_SYNC=true`
- [ ] Base de datos actualizada (`npm run server:alter` ejecutado)
- [ ] Campo `notas` agregado a `activities`
- [ ] Tipos de reportes migrados (`npm run migrate:reports` ejecutado)
- [ ] Backend funcionando en modo normal
- [ ] Frontend funcionando
- [ ] Residencias cargando correctamente
- [ ] Sidebar mostrando todos los elementos
- [ ] Reportes con tipos correctos

## 🎯 Modo de Operación Normal

Después de completar la migración, tu `.env` debería verse así:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=residence_management
DB_USER=postgres
DB_PASSWORD=tu_password

PORT=3000
NODE_ENV=development

JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d

# No incluir DB_ALTER_SYNC ni DB_FORCE_SYNC
# El sistema solo creará tablas que no existan
```

## 🔐 Para Producción

Antes de desplegar:

1. ✅ Ejecuta TODOS los pasos de migración en un ambiente de staging primero
2. ✅ Haz un backup de la base de datos de producción
3. ✅ Ejecuta `npm run server:alter` UNA sola vez en producción
4. ✅ Ejecuta `npm run migrate:reports` UNA sola vez
5. ✅ Cambia a modo normal (sin DB_ALTER_SYNC)
6. ✅ Configura `NODE_ENV=production`

## 📞 Soporte

Si tienes problemas durante la migración:

1. Revisa los logs del servidor
2. Verifica que PostgreSQL esté corriendo
3. Asegúrate de tener la última versión del código
4. Verifica que todas las variables de entorno estén correctas

---

**¡Listo!** Tu aplicación ahora debería estar funcionando sin problemas de compatibilidad. 🎉
