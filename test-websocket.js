// Test de WebSocket desde Node.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

console.log('🔌 Intentando conectar...');

socket.on('connect', () => {
  console.log('✅ Conectado al servidor WebSocket');
  console.log('ID:', socket.id);
});

socket.on('welcome', (data) => {
  console.log('👋 Mensaje de bienvenida:', data);
});

socket.on('resources:updated', (data) => {
  console.log('\n📊 ACTUALIZACIÓN DE RECURSOS:');
  console.log('Timestamp:', data.timestamp);
  console.log('Cantidad:', data.count);
  console.log('Recursos:');
  data.resources.forEach(r => {
    console.log(`  - ${r.name}: ${r.quantity} (${r.category})`);
  });
});

socket.on('disconnect', () => {
  console.log('❌ Desconectado');
});

socket.on('error', (error) => {
  console.error('❌ Error:', error);
});

console.log('⏳ Esperando actualizaciones cada minuto...');
console.log('Presiona Ctrl+C para salir\n');
