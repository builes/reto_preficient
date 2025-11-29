# 🔴 TIEMPO REAL CON WEBSOCKETS

## ✅ Sistema Implementado

**WebSocket con Socket.IO integrado:**
- ✅ Servidor WebSocket funcionando en puerto 3001
- ✅ Cron jobs emitiendo datos cada minuto
- ✅ Dashboard HTML en tiempo real
- ✅ Actualización automática sin refrescar página

---

## 🖥️ Ver Dashboard en Tiempo Real

### Opción 1: Local (Desarrollo)

1. **Asegúrate que el servidor esté corriendo:**
```bash
npm run start
```

2. **Abre en tu navegador:**
```
http://localhost:3001/realtime-dashboard.html
```

3. **Verás:**
- 🟢 Estado de conexión
- 📊 Total de recursos
- ⏰ Última actualización
- 🔄 Contador de actualizaciones
- 📋 Tarjetas de recursos que se actualizan automáticamente
- 📝 Log de eventos en tiempo real

4. **Cada minuto (automático):**
- El cron job crea 7 registros
- WebSocket emite evento `resources:updated`
- Dashboard se actualiza SIN refrescar
- Animación visual en las tarjetas

---

## 🚀 Deploy en Railway con WebSockets

### 1. Variables de Entorno (Railway)

Agregar en Railway → Variables:
```env
PORT=3001
DB_HOST=aws-1-us-east-2.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.qtgtpvmzutorznttxurn
DB_PASSWORD=survivingInMars1.
```

### 2. Railway detectará automáticamente:
- Socket.IO instalado en `package.json`
- WebSocket funcionará automáticamente

### 3. Después del deploy:

**URL del dashboard:**
```
https://tu-app.railway.app/realtime-dashboard.html
```

**Cambiar URL en el HTML:**
Editar `public/realtime-dashboard.html` línea ~215:
```javascript
// ANTES (local):
const socket = io('http://localhost:3001');

// DESPUÉS (Railway):
const socket = io('https://tu-app.railway.app');
```

O mejor aún, usar detección automática:
```javascript
const socket = io(); // Se conecta automáticamente a la misma URL
```

---

## 📡 Eventos WebSocket Disponibles

### Eventos del Servidor → Cliente

#### 1. `welcome` (al conectarse)
```javascript
{
  message: "Conectado al sistema de monitoreo en tiempo real",
  timestamp: "2025-11-29T14:47:00.000Z"
}
```

#### 2. `resources:updated` (cada minuto)
```javascript
{
  resources: [
    {
      id: 1,
      name: "Oxygen",
      category: "oxygen",
      quantity: 15000,
      timestamp: "2025-11-29T14:47:00.000Z"
    },
    // ... más recursos
  ],
  count: 7,
  timestamp: "2025-11-29T14:47:00.000Z"
}
```

---

## 🔌 Usar WebSocket en Frontend Personalizado

### Instalación Cliente
```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
```

### Código Básico
```javascript
// Conectar
const socket = io('http://localhost:3001');

// Escuchar conexión
socket.on('connect', () => {
  console.log('✅ Conectado');
});

// Escuchar actualizaciones de recursos (cada minuto)
socket.on('resources:updated', (data) => {
  console.log('📊 Nuevos datos:', data);
  
  // data.resources = array de recursos
  // data.count = cantidad
  // data.timestamp = timestamp
  
  // Actualizar tu UI aquí
  updateDashboard(data.resources);
});

// Escuchar desconexión
socket.on('disconnect', () => {
  console.log('❌ Desconectado');
});
```

### Ejemplo React
```jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function Dashboard() {
  const [resources, setResources] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('resources:updated', (data) => {
      setResources(data.resources);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h1>Estado: {connected ? '🟢 Conectado' : '🔴 Desconectado'}</h1>
      {resources.map(r => (
        <div key={r.id}>
          {r.name}: {r.quantity}
        </div>
      ))}
    </div>
  );
}
```

---

## 🤖 Integrar con N8N (Webhook desde WebSocket)

### Opción 1: Endpoint HTTP para N8N
Agregar en `src/routes/resource.routes.js`:
```javascript
router.get('/realtime/latest', async (req, res) => {
  // N8N puede consultar este endpoint
  const resources = await getAllResourcesService();
  res.json({
    resources,
    timestamp: new Date().toISOString()
  });
});
```

### Opción 2: N8N escuchar WebSocket (avanzado)
N8N puede conectarse a WebSocket con un nodo Custom n8n node.

---

## 📊 Ver Logs en Tiempo Real

**En el servidor (terminal):**
```
[CRON] 7 registros creados - 29/11/2025, 2:47:01 p.m.
[WebSocket] Datos enviados a clientes conectados
[WebSocket] Cliente conectado: ABC123XYZ
[WebSocket] Cliente desconectado: ABC123XYZ
```

**En el dashboard HTML:**
- Log de eventos en la parte inferior
- Muestra todas las actualizaciones
- Timestamps precisos

---

## 🎯 Flujo Completo

1. **Cron Job** (cada minuto)
   - Crea 7 registros en `change_history`
   - Obtiene datos de recursos
   - Emite evento WebSocket `resources:updated`

2. **WebSocket Server**
   - Recibe evento del cron
   - Transmite a TODOS los clientes conectados
   - Mantiene conexión persistente

3. **Dashboard/Frontend**
   - Escucha evento `resources:updated`
   - Actualiza UI automáticamente
   - Animación visual de cambios
   - No requiere polling ni refresh

---

## ✅ Ventajas del Sistema Actual

- ✅ **Tiempo real**: Datos cada minuto sin polling
- ✅ **Eficiente**: Solo envía cuando hay cambios
- ✅ **Escalable**: Múltiples clientes simultáneos
- ✅ **Bidireccional**: Servidor puede enviar a clientes
- ✅ **Reconexión automática**: Si se cae la conexión
- ✅ **Cross-platform**: Funciona en web, mobile, desktop

---

## 🔧 Troubleshooting

**WebSocket no conecta en Railway:**
- Railway soporta WebSocket por defecto
- Asegurar que CORS está habilitado (ya está)
- Usar `https://` en producción

**Dashboard no actualiza:**
- Verificar que el servidor esté corriendo
- Abrir consola del navegador (F12)
- Ver si aparecen errores de conexión

**Múltiples clientes:**
- El sistema soporta múltiples clientes
- Cada cliente recibe las actualizaciones
- No hay límite de conexiones

---

## 📱 Próximos Pasos

**Para producción:**
1. Deploy a Railway
2. Cambiar URL de Socket.IO en el HTML
3. Compartir URL del dashboard
4. Opcional: agregar autenticación

**Para mejorar:**
- Agregar gráficas con Chart.js
- Historial de últimos 24h
- Alertas visuales para recursos críticos
- Notificaciones push del navegador

---

## 🎉 Resultado Final

**Ahora tienes:**
- ✅ API REST funcionando
- ✅ Cron jobs cada minuto
- ✅ WebSocket en tiempo real
- ✅ Dashboard visual actualizado automáticamente
- ✅ Sistema completo de monitoreo

**Abre:** `http://localhost:3001/realtime-dashboard.html`

**¡Espera 1 minuto y verás la actualización automática!** 🚀
