/**
 * Script de migración de datos para actualizar tipos de reportes
 *
 * Este script actualiza los tipos de reportes antiguos a los nuevos tipos
 * Mapeo de tipos antiguos a nuevos:
 * - 'Incendio' -> 'Seguridad'
 * - 'Eléctrico' -> 'Instalaciones'
 * - 'Agua' -> 'Instalaciones'
 * - 'Robo' -> 'Seguridad'
 * - 'Otro' -> 'Otro' (sin cambios)
 */

const { Report, sequelize } = require('../models');

const typeMapping = {
  'Incendio': 'Seguridad',
  'Eléctrico': 'Instalaciones',
  'Agua': 'Instalaciones',
  'Robo': 'Seguridad',
  'Otro': 'Otro'
};

async function migrateReportTypes() {
  console.log('🔄 Iniciando migración de tipos de reportes...\n');

  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida\n');

    // Obtener todos los reportes
    const reports = await Report.findAll();
    console.log(`📊 Total de reportes encontrados: ${reports.length}\n`);

    if (reports.length === 0) {
      console.log('ℹ️  No hay reportes para migrar');
      return;
    }

    // Agrupar reportes por tipo
    const reportsByType = {};
    reports.forEach(report => {
      const tipo = report.tipo;
      if (!reportsByType[tipo]) {
        reportsByType[tipo] = [];
      }
      reportsByType[tipo].push(report);
    });

    console.log('📋 Distribución de tipos actuales:');
    Object.entries(reportsByType).forEach(([tipo, reports]) => {
      console.log(`   - ${tipo}: ${reports.length} reporte(s)`);
    });
    console.log('');

    // Identificar tipos que necesitan migración
    const typesToMigrate = Object.keys(reportsByType).filter(
      tipo => tipo !== 'Mantenimiento' &&
              tipo !== 'Limpieza' &&
              tipo !== 'Seguridad' &&
              tipo !== 'Instalaciones' &&
              tipo !== 'Otro'
    );

    if (typesToMigrate.length === 0) {
      console.log('✅ Todos los reportes ya usan los tipos correctos. No hay nada que migrar.');
      return;
    }

    console.log('🔧 Tipos que serán migrados:', typesToMigrate.join(', '));
    console.log('');

    // Realizar la migración
    let migratedCount = 0;
    const transaction = await sequelize.transaction();

    try {
      for (const oldType of typesToMigrate) {
        const newType = typeMapping[oldType] || 'Otro';
        const reportsToUpdate = reportsByType[oldType] || [];

        console.log(`Migrando '${oldType}' -> '${newType}' (${reportsToUpdate.length} reporte(s))...`);

        for (const report of reportsToUpdate) {
          await report.update({ tipo: newType }, { transaction });
          migratedCount++;
        }
      }

      await transaction.commit();
      console.log('');
      console.log(`✅ Migración completada exitosamente!`);
      console.log(`📊 Total de reportes migrados: ${migratedCount}`);

      // Mostrar nueva distribución
      const updatedReports = await Report.findAll();
      const updatedByType = {};
      updatedReports.forEach(report => {
        const tipo = report.tipo;
        if (!updatedByType[tipo]) {
          updatedByType[tipo] = 0;
        }
        updatedByType[tipo]++;
      });

      console.log('');
      console.log('📋 Nueva distribución de tipos:');
      Object.entries(updatedByType).forEach(([tipo, count]) => {
        console.log(`   - ${tipo}: ${count} reporte(s)`);
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('');
    console.log('👋 Conexión cerrada');
  }
}

// Ejecutar la migración si se llama directamente
if (require.main === module) {
  migrateReportTypes()
    .then(() => {
      console.log('');
      console.log('✅ Script de migración finalizado');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error fatal:', err);
      process.exit(1);
    });
}

module.exports = { migrateReportTypes };
