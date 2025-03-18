const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// @route   POST api/backup/create
// @desc    Crear un respaldo de la base de datos (solo superadmin)
// @access  Private (superadmin)
router.post('/create', auth, async (req, res) => {
  try {
    // Verificar que el usuario sea superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'Acceso denegado. Se requiere rol de superadmin' });
    }

    // Crear directorio de respaldos si no existe
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generar nombre de archivo con fecha y hora
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFileName);

    // Obtener todas las colecciones
    const collections = mongoose.connection.collections;
    const backupData = {};

    // Para cada colección, obtener todos los documentos
    for (const [name, collection] of Object.entries(collections)) {
      const documents = await collection.find({}).toArray();
      backupData[name] = documents;
    }

    // Guardar datos en archivo JSON
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    res.json({
      msg: 'Respaldo creado exitosamente',
      fileName: backupFileName,
      timestamp: new Date(),
      path: backupPath
    });
  } catch (err) {
    console.error('Error al crear respaldo:', err.message);
    res.status(500).send('Error del servidor al crear respaldo');
  }
});

// @route   GET api/backup/list
// @desc    Obtener lista de respaldos disponibles
// @access  Private (superadmin, admin)
router.get('/list', auth, async (req, res) => {
  try {
    // Verificar que el usuario sea admin o superadmin
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    const backupDir = path.join(__dirname, '..', 'backups');
    
    // Verificar si el directorio existe
    if (!fs.existsSync(backupDir)) {
      return res.json({ backups: [] });
    }

    // Leer archivos en el directorio
    const files = fs.readdirSync(backupDir);
    
    // Obtener información de cada archivo
    const backups = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          createdAt: stats.birthtime,
          size: stats.size,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Ordenar por fecha descendente

    res.json({ backups });
  } catch (err) {
    console.error('Error al listar respaldos:', err.message);
    res.status(500).send('Error del servidor al listar respaldos');
  }
});

// @route   POST api/backup/restore/:fileName
// @desc    Restaurar un respaldo específico
// @access  Private (superadmin)
router.post('/restore/:fileName', auth, async (req, res) => {
  try {
    // Verificar que el usuario sea superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'Acceso denegado. Se requiere rol de superadmin' });
    }

    const fileName = req.params.fileName;
    const backupDir = path.join(__dirname, '..', 'backups');
    const backupPath = path.join(backupDir, fileName);

    // Verificar que el archivo exista
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ msg: 'Archivo de respaldo no encontrado' });
    }

    // Leer archivo de respaldo
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    // Restaurar cada colección
    for (const [collectionName, documents] of Object.entries(backupData)) {
      if (documents.length > 0) {
        const collection = mongoose.connection.collection(collectionName);
        
        // Vaciar colección
        await collection.deleteMany({});
        
        // Insertar documentos del respaldo
        if (documents.length > 0) {
          await collection.insertMany(documents);
        }
      }
    }

    res.json({
      msg: 'Respaldo restaurado exitosamente',
      fileName,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error al restaurar respaldo:', err.message);
    res.status(500).send('Error del servidor al restaurar respaldo');
  }
});

module.exports = router;