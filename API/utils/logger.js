const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

// Configuración de directorios para logs
const logDir = path.join(__dirname, '..', 'logs');

// Definir formato personalizado para los logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Configurar transporte para rotación diaria de archivos
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, '%DATE%-app.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // Mantener logs por 14 días
  maxSize: '20m', // Tamaño máximo de cada archivo
  level: 'info'
});

// Configurar transporte para logs de errores
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, '%DATE%-error.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d', // Mantener logs de errores por 30 días
  maxSize: '20m',
  level: 'error'
});

// Crear logger con configuración personalizada
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'ctpga-manager' },
  transports: [
    // Consola para desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ''}`
        )
      ),
      level: 'debug'
    }),
    // Archivos rotados para producción
    fileRotateTransport,
    errorFileRotateTransport
  ]
});

// Función para registrar acciones de usuarios
const logUserAction = (userId, action, details) => {
  logger.info('User action', { userId, action, details });
};

// Función para registrar errores de autenticación
const logAuthError = (userId, error) => {
  logger.warn('Authentication error', { userId, error });
};

// Función para registrar accesos a la API
const logApiAccess = (req, res, responseTime) => {
  logger.info('API access', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user ? req.user.id : 'anonymous',
    statusCode: res.statusCode,
    responseTime
  });
};

// Función para registrar errores del sistema
const logSystemError = (error, context) => {
  logger.error('System error', { error, context });
};

module.exports = {
  logger,
  logUserAction,
  logAuthError,
  logApiAccess,
  logSystemError
};