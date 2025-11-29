# 🚀 Instrucciones de Deploy - Sistema de Recursos Marte

## 📦 Despliegue con Docker

### 1. Construir y levantar contenedor
```bash
# Construir imagen
docker-compose build

# Levantar servicios (backend en puerto 3001)
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Detener servicios
docker-compose down
```

### 2. Verificar que funciona
```bash
# Probar endpoint básico
curl http://localhost:3001/api/resources

# Probar alertas críticas
curl http://localhost:3001/api/resources/alerts

# Probar historial reciente (últimos 10 minutos)
curl "http://localhost:3001/api/resources/history/recent?minutes=10"
```

---

## 🤖 Configuración Bot de Telegram con N8N

### Paso 1: Crear Bot en Telegram

1. Buscar **@BotFather** en Telegram
2. Enviar `/newbot`
3. Elegir nombre: `Mars Resources Bot`
4. Elegir username: `mars_resources_bot` (o el que quieras)
5. **Guardar el TOKEN** que te da (ej: `7123456789:AAHxxx...`)

### Paso 2: Configurar comandos del bot

Enviar a @BotFather:
```
/setcommands
```

Seleccionar tu bot y pegar:
```
start - Iniciar el bot
all - Ver todos los recursos
oxygen - Nivel de oxígeno
water - Nivel de agua
food - Alimentos disponibles
parts - Spare parts disponibles
alerts - ⚠️ Recursos críticos
status - Estado general de la base
```

### Paso 3: Crear Workflow en N8N

#### A. Nodo 1: Telegram Trigger
- **Agregar nodo**: `Telegram Trigger`
- **Credential**: Pegar tu TOKEN del bot
- **Updates**: `Message`

#### B. Nodo 2: Detectar Comando (Code)
```javascript
// Extraer el comando del mensaje
const message = $input.item.json.message.text || '';
const command = message.toLowerCase().trim();

return {
  json: {
    command: command,
    chatId: $input.item.json.message.chat.id
  }
};
```

#### C. Nodo 3: Switch (Dirigir comandos)
Agregar **Switch** con casos:
- Ruta 1: `command` = `/start` → Mensaje de bienvenida
- Ruta 2: `command` = `/all` → HTTP Request a `/api/resources`
- Ruta 3: `command` = `/oxygen` → HTTP Request a `/api/resources/category/oxygen`
- Ruta 4: `command` = `/water` → HTTP Request a `/api/resources/category/water`
- Ruta 5: `command` = `/food` → HTTP Request a `/api/resources/category/food`
- Ruta 6: `command` = `/parts` → HTTP Request a `/api/resources/category/spare_parts`
- Ruta 7: `command` = `/alerts` → HTTP Request a `/api/resources/alerts`
- Ruta 8: `command` = `/status` → HTTP Request a `/api/resources`

#### D. Nodos HTTP Request (para cada ruta)

**Ejemplo para `/all`:**
- **Method**: GET
- **URL**: `http://localhost:3001/api/resources`
- *(Si N8N está en Docker, usar: `http://host.docker.internal:3001/api/resources`)*

**Ejemplo para `/alerts`:**
- **Method**: GET
- **URL**: `http://localhost:3001/api/resources/alerts`

**Ejemplo para `/oxygen`:**
- **Method**: GET
- **URL**: `http://localhost:3001/api/resources/category/oxygen`

#### E. Nodo: Formatear Respuesta (Code)

**Para `/start`:**
```javascript
return {
  json: {
    chatId: $input.item.json.chatId,
    message: `🚀 *Bienvenido al Sistema de Recursos de Marte*\n\n` +
             `Comandos disponibles:\n` +
             `/all - Ver todos los recursos\n` +
             `/oxygen - Nivel de oxígeno\n` +
             `/water - Nivel de agua\n` +
             `/food - Alimentos\n` +
             `/parts - Spare parts\n` +
             `/alerts - Recursos críticos ⚠️\n` +
             `/status - Estado general`
  }
};
```

**Para `/all` o `/status`:**
```javascript
const resources = $input.item.json.resources || [];
let message = '📊 *Estado de Recursos - Base Marte*\n\n';

resources.forEach(r => {
  const name = r.resourceData.name;
  const qty = r.quantity;
  const unit = r.unit;
  const critical = r.criticalLevel;
  
  // Determinar emoji según nivel
  let emoji = '✅';
  if (qty <= critical) emoji = '🔴';
  else if (qty <= critical * 1.5) emoji = '⚠️';
  
  message += `${emoji} *${name}*: ${qty} ${unit}\n`;
  message += `   └ Crítico: ${critical} | Máx: ${r.maximumLevel}\n\n`;
});

return {
  json: {
    chatId: $input.item.json.chatId,
    message: message
  }
};
```

**Para `/alerts`:**
```javascript
const resources = $input.item.json.resources || [];
const count = resources.length;

if (count === 0) {
  return {
    json: {
      chatId: $input.item.json.chatId,
      message: '✅ *Todo bien!*\n\nNo hay recursos en estado crítico.'
    }
  };
}

let message = `🚨 *ALERTA: ${count} recursos críticos*\n\n`;

resources.forEach(r => {
  const name = r.resourceData.name;
  const qty = r.quantity;
  const unit = r.unit;
  const critical = r.criticalLevel;
  
  message += `🔴 *${name}*: ${qty} ${unit}\n`;
  message += `   └ Nivel crítico: ${critical} ${unit}\n\n`;
});

return {
  json: {
    chatId: $input.item.json.chatId,
    message: message
  }
};
```

**Para categorías específicas (`/oxygen`, `/water`, etc):**
```javascript
const resources = $input.item.json.resources || [];

if (resources.length === 0) {
  return {
    json: {
      chatId: $input.item.json.chatId,
      message: '❌ No se encontraron recursos en esta categoría.'
    }
  };
}

const r = resources[0];
const name = r.resourceData.name;
const qty = r.quantity;
const unit = r.unit;
const critical = r.criticalLevel;
const max = r.maximumLevel;

let emoji = '✅';
let status = 'ÓPTIMO';
if (qty <= critical) {
  emoji = '🔴';
  status = 'CRÍTICO';
} else if (qty <= critical * 1.5) {
  emoji = '⚠️';
  status = 'BAJO';
}

const message = `${emoji} *${name}* - ${status}\n\n` +
                `📊 Cantidad actual: *${qty} ${unit}*\n` +
                `⚠️ Nivel crítico: ${critical} ${unit}\n` +
                `✅ Nivel máximo: ${max} ${unit}\n\n` +
                `Porcentaje: ${Math.round((qty/max)*100)}%`;

return {
  json: {
    chatId: $input.item.json.chatId,
    message: message
  }
};
```

#### F. Nodo Final: Telegram Send Message
- **Credential**: Mismo TOKEN del bot
- **Chat ID**: `{{ $json.chatId }}`
- **Text**: `{{ $json.message }}`
- **Parse Mode**: `Markdown`

---

## 📱 Workflow Extra: Alertas Automáticas Diarias

### Crear segundo workflow para alertas programadas

#### 1. Nodo Schedule Trigger
- **Interval**: `Everyday at 8:00 AM` (o la hora que prefieras)

#### 2. HTTP Request
- **Method**: GET
- **URL**: `http://localhost:3001/api/resources/alerts`

#### 3. Code - Formatear alerta
```javascript
const resources = $input.item.json.resources || [];
const count = resources.length;

if (count === 0) {
  return {
    json: {
      message: '✅ *Reporte Diario*\n\nTodos los recursos en niveles óptimos. ¡Todo bajo control! 🚀'
    }
  };
}

let message = `🚨 *REPORTE DIARIO DE ALERTAS*\n\n`;
message += `Se detectaron ${count} recursos críticos:\n\n`;

resources.forEach(r => {
  const name = r.resourceData.name;
  const qty = r.quantity;
  const unit = r.unit;
  
  message += `🔴 *${name}*: ${qty} ${unit}\n`;
});

message += `\n⚠️ Se requiere atención inmediata.`;

return {
  json: {
    message: message
  }
};
```

#### 4. IF Node
- **Condition**: `count` > 0
- Si TRUE → Enviar mensaje de alerta
- Si FALSE → No hacer nada (opcional: enviar reporte positivo)

#### 5. Telegram Send Message
- **Chat ID**: Tu Chat ID personal o de grupo
- **Text**: `{{ $json.message }}`
- **Parse Mode**: `Markdown`

---

## 🔧 Solución de Problemas

### N8N no puede conectarse al backend

Si N8N está en **Docker**:
```
http://host.docker.internal:3001/api/resources
```

Si N8N está en la **nube** (n8n.cloud):
- Necesitas exponer localhost con **ngrok**:
```bash
ngrok http 3001
```
- Usar la URL que te da ngrok en los HTTP Request nodes

### Bot no responde

1. Verificar que el workflow está **activado** en N8N (toggle en ON)
2. Verificar que el backend está corriendo: `curl http://localhost:3001/api/resources`
3. Revisar logs del workflow en N8N

### Cron jobs no funcionan

Los cron jobs se ejecutan automáticamente:
- **Monitoreo**: cada 1 minuto (crea 7 registros de historial)
- **Limpieza**: diario a las 3:00 AM (elimina registros > 30 días)

Verificar en logs del servidor: `[CRON] 7 registros creados`

---

## 📊 Endpoints Disponibles

```bash
# Recursos
GET  /api/resources                          # Todos los recursos
GET  /api/resources/:id                      # Un recurso
GET  /api/resources/category/:category       # Por categoría (oxygen/water/food/spare_parts)
GET  /api/resources/alerts                   # Recursos críticos
PUT  /api/resources/:id/update-quantity      # Actualizar cantidad

# Historial
GET  /api/resources/history/recent?minutes=60           # Historial reciente
GET  /api/resources/:resourceId/history?limit=100       # Historial de recurso
GET  /api/resources/:resourceId/stats                   # Estadísticas 24h
POST /api/resources/change-history                      # Crear registro manual
```

---

## ✅ Checklist Final

- [ ] Backend corriendo en Docker o local (puerto 3001)
- [ ] Bot creado en Telegram con @BotFather
- [ ] Comandos configurados en el bot
- [ ] Workflow principal en N8N (responder comandos)
- [ ] Workflow de alertas diarias (opcional)
- [ ] Probar cada comando del bot
- [ ] Verificar que los cron jobs están activos

---

**¡Listo! 🚀 Sistema completamente funcional.**
