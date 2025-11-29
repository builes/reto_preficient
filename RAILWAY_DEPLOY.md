# 🚂 Deploy a Railway - Guía Rápida

## ✅ Estado del Sistema

**TODO FUNCIONA:**
- ✅ Cron jobs activos (monitoreo cada minuto)
- ✅ 7 registros de historial creados automáticamente cada 60 segundos
- ✅ Limpieza automática de registros antiguos (diario 3 AM)
- ✅ Endpoints API funcionando en Postman
- ✅ Base de datos Supabase conectada

---

## 🚀 Pasos para Deploy en Railway

### 1. Crear cuenta en Railway
- Ir a [railway.app](https://railway.app)
- Sign up con GitHub

### 2. Crear nuevo proyecto
- Click en "New Project"
- Seleccionar "Deploy from GitHub repo"
- Autorizar Railway para acceder a tu repo
- Seleccionar: `builes/reto_preficient`
- Branch: `angelica-main`

### 3. Configurar Variables de Entorno

En Railway, ir a tu proyecto → **Variables** y agregar:

```env
PORT=3001
DB_HOST=aws-1-us-east-2.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.qtgtpvmzutorznttxurn
DB_PASSWORD=survivingInMars1.
```

### 4. Railway detectará automáticamente:
- ✅ `package.json` (Node.js project)
- ✅ Start command: `npm start` (ya definido en package.json)
- ✅ Build command: `npm install`

### 5. Deploy
- Railway hará deploy automáticamente
- Te dará una URL pública tipo: `https://reto-preficient-production.up.railway.app`

### 6. Verificar que funciona

Una vez deployado:

```bash
# Probar endpoint básico
curl https://tu-app.up.railway.app/api/resources

# Probar alertas
curl https://tu-app.up.railway.app/api/resources/alerts

# Probar ping
curl https://tu-app.up.railway.app/ping
```

---

## 🤖 Configurar Bot de Telegram con la URL de Railway

### 1. Crear Bot (si no lo has hecho)
- Hablar con @BotFather en Telegram
- `/newbot`
- Guardar el TOKEN

### 2. Configurar comandos del bot
Enviar a @BotFather: `/setcommands`

```
start - Iniciar el bot
all - Ver todos los recursos
oxygen - Nivel de oxígeno
water - Nivel de agua
food - Alimentos disponibles
parts - Spare parts disponibles
alerts - ⚠️ Recursos críticos
status - Estado general
```

### 3. Workflow en N8N

#### Nodo 1: Telegram Trigger
- Token del bot
- Updates: Message

#### Nodo 2: Code - Detectar comando
```javascript
const message = $input.item.json.message.text || '';
const command = message.toLowerCase().trim();

return {
  json: {
    command: command,
    chatId: $input.item.json.message.chat.id
  }
};
```

#### Nodo 3: Switch
Casos:
- `/start` → Mensaje bienvenida
- `/all` → HTTP GET a `https://tu-app.railway.app/api/resources`
- `/alerts` → HTTP GET a `https://tu-app.railway.app/api/resources/alerts`
- `/oxygen` → HTTP GET a `https://tu-app.railway.app/api/resources/category/oxygen`
- `/water` → HTTP GET a `https://tu-app.railway.app/api/resources/category/water`
- `/food` → HTTP GET a `https://tu-app.railway.app/api/resources/category/food`
- `/parts` → HTTP GET a `https://tu-app.railway.app/api/resources/category/spare_parts`

#### Nodo 4: HTTP Request (para cada comando)
**Ejemplo `/all`:**
```
Method: GET
URL: https://tu-app.railway.app/api/resources
```

#### Nodo 5: Code - Formatear respuesta

**Para `/start`:**
```javascript
return {
  json: {
    chatId: $input.item.json.chatId,
    message: `🚀 *Bienvenido al Sistema de Recursos Marte*\n\n` +
             `Comandos:\n` +
             `/all - Todos los recursos\n` +
             `/alerts - Alertas críticas\n` +
             `/oxygen - Oxígeno\n` +
             `/water - Agua\n` +
             `/food - Comida\n` +
             `/parts - Spare parts\n` +
             `/status - Estado general`
  }
};
```

**Para `/all` o `/status`:**
```javascript
const resources = $input.item.json.resources || [];
let message = '📊 *Recursos - Base Marte*\n\n';

resources.forEach(r => {
  const name = r.resourceData.name;
  const qty = r.quantity;
  const unit = r.unit;
  const critical = r.criticalLevel;
  
  let emoji = '✅';
  if (qty <= critical) emoji = '🔴';
  else if (qty <= critical * 1.5) emoji = '⚠️';
  
  message += `${emoji} *${name}*: ${qty} ${unit}\n`;
  message += `   Crítico: ${critical} | Máx: ${r.maximumLevel}\n\n`;
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
      message: '✅ Todo OK! No hay alertas.'
    }
  };
}

let message = `🚨 *${count} RECURSOS CRÍTICOS*\n\n`;

resources.forEach(r => {
  message += `🔴 *${r.resourceData.name}*: ${r.quantity} ${r.unit}\n`;
  message += `   Crítico: ${r.criticalLevel}\n\n`;
});

return {
  json: {
    chatId: $input.item.json.chatId,
    message: message
  }
};
```

**Para categorías específicas:**
```javascript
const resources = $input.item.json.resources || [];

if (resources.length === 0) {
  return {
    json: {
      chatId: $input.item.json.chatId,
      message: '❌ No encontrado'
    }
  };
}

const r = resources[0];
const qty = r.quantity;
const critical = r.criticalLevel;

let emoji = '✅';
let status = 'ÓPTIMO';
if (qty <= critical) {
  emoji = '🔴';
  status = 'CRÍTICO';
} else if (qty <= critical * 1.5) {
  emoji = '⚠️';
  status = 'BAJO';
}

const message = `${emoji} *${r.resourceData.name}* - ${status}\n\n` +
                `📊 Actual: *${qty} ${r.unit}*\n` +
                `⚠️ Crítico: ${critical}\n` +
                `✅ Máximo: ${r.maximumLevel}\n\n` +
                `${Math.round((qty/r.maximumLevel)*100)}%`;

return {
  json: {
    chatId: $input.item.json.chatId,
    message: message
  }
};
```

#### Nodo 6: Telegram Send Message
- Chat ID: `{{ $json.chatId }}`
- Text: `{{ $json.message }}`
- Parse Mode: `Markdown`

---

## 📊 Workflow Extra: Alertas Automáticas Diarias

### Schedule Trigger
- Everyday at 8:00 AM

### HTTP Request
```
GET https://tu-app.railway.app/api/resources/alerts
```

### Code - Formatear
```javascript
const resources = $input.item.json.resources || [];
const count = resources.length;

if (count === 0) {
  return {
    json: {
      message: '✅ *Reporte Diario*\n\nTodo OK! 🚀'
    }
  };
}

let message = `🚨 *REPORTE DIARIO*\n\n${count} recursos críticos:\n\n`;

resources.forEach(r => {
  message += `🔴 *${r.resourceData.name}*: ${r.quantity} ${r.unit}\n`;
});

return { json: { message } };
```

### Telegram Send Message
- Chat ID: Tu ID personal
- Text: `{{ $json.message }}`

---

## 🔧 Verificar Cron Jobs en Railway

Los cron jobs se ejecutan automáticamente:

1. **Monitoreo**: Cada 1 minuto
   - Crea 7 registros de historial
   - Permite seguimiento en tiempo real

2. **Limpieza**: Diario 3:00 AM
   - Elimina registros > 30 días

Ver logs en Railway:
- Dashboard → Tu proyecto → **View Logs**
- Buscar: `[CRON] 7 registros creados`

---

## 📋 Endpoints Disponibles

```bash
GET  /ping                                    # Health check
GET  /api/resources                           # Todos los recursos
GET  /api/resources/:id                       # Un recurso
GET  /api/resources/category/:category        # Por categoría
GET  /api/resources/alerts                    # Recursos críticos
PUT  /api/resources/:id/update-quantity       # Actualizar cantidad
```

**Categorías válidas:** `oxygen`, `water`, `food`, `spare_parts`

---

## ✅ Checklist Final

- [ ] Proyecto deployado en Railway
- [ ] Variables de entorno configuradas
- [ ] URL pública funcionando
- [ ] Bot creado en Telegram
- [ ] Comandos configurados
- [ ] Workflow en N8N creado
- [ ] URLs cambiadas a Railway en HTTP Request nodes
- [ ] Workflow activado (toggle ON)
- [ ] Probado cada comando del bot
- [ ] Cron jobs funcionando (ver logs)

---

## 🎯 Resultado Final

Tendrás:
- ✅ API REST en Railway (pública y funcionando 24/7)
- ✅ Cron jobs automáticos cada minuto
- ✅ Bot de Telegram respondiendo comandos
- ✅ Alertas diarias automáticas (opcional)
- ✅ Sistema de monitoreo en tiempo real

**¡Todo funcionando! 🚀**
