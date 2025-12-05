const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/residences', require('./routes/residences'));
app.use('/api/service-costs', require('./routes/serviceCosts'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/amenities', require('./routes/amenities'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Administración de Residencias',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      residences: '/api/residences',
      serviceCosts: '/api/service-costs',
      payments: '/api/payments',
      reports: '/api/reports',
      complaints: '/api/complaints',
      activities: '/api/activities',
      amenities: '/api/amenities'
    }
  });
});

// Ruta para verificar salud del servidor
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Sincronizar base de datos y arrancar servidor
const PORT = process.env.PORT || 3000;

// Modo de sincronización de base de datos
// - { alter: true }: Actualiza las tablas sin borrar datos (recomendado)
// - { force: true }: Recrea todas las tablas (BORRA TODOS LOS DATOS - solo para desarrollo)
// - {}: Solo crea tablas si no existen (producción)
const syncOptions = process.env.DB_FORCE_SYNC === 'true'
  ? { force: true }
  : process.env.DB_ALTER_SYNC === 'true'
    ? { alter: true }
    : {};

sequelize.sync(syncOptions)
  .then(() => {
    if (syncOptions.force) {
      console.log('⚠️  Base de datos sincronizada - TABLAS RECREADAS (datos borrados)');
    } else if (syncOptions.alter) {
      console.log('✅ Base de datos sincronizada - Tablas actualizadas sin perder datos');
    } else {
      console.log('✅ Base de datos sincronizada - Tablas verificadas');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📝 Documentación de API disponible en http://localhost:${PORT}`);
      console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al sincronizar base de datos:', err);
    process.exit(1);
  });

module.exports = app;