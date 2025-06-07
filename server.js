import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { router as chatRoutes } from './routes/chatRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificación de la API Key
if (!process.env.OPENAI_API_KEY) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  ADVERTENCIA: No se encontró la variable OPENAI_API_KEY');
  console.log('\x1b[36m%s\x1b[0m', 'Para configurar la API key de OpenAI:');
  console.log('1. Crea un archivo .env en la carpeta backend');
  console.log('2. Añade la línea: OPENAI_API_KEY=tu-api-key-de-openai');
  console.log('3. Reinicia el servidor\n');

  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('\x1b[31m%s\x1b[0m', 'No se encontró el archivo .env');
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración CORS más específica
app.use(cors({
  origin: ['https://asistente-front.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/chat', chatRoutes);

// Ruta raíz mejorada
app.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'API de Asistente funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error('Error detallado:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Error interno del servidor',
    path: req.path,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
});

// Manejo del favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
