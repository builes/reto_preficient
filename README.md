# Sistema de Gestión de Recursos - Base Marte

API REST para monitorear y gestionar recursos vitales en una base de Marte. Incluye registro automático cada minuto y bot de Telegram integrado con N8N.

---

## Descripción

Sistema que monitorea recursos críticos (oxígeno, agua, comida, spare parts) con:
- API REST completa
- Registro automático del estado cada minuto
- Alertas de recursos críticos
- Historial completo de cambios
- Niveles estándar por categoría
- Integración con Telegram via N8N

---

## Tecnologías

- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL (Supabase)
- **ORM**: Sequelize
- **Cron Jobs**: node-cron
- **Bot**: Telegram + N8N

---

## Instalación

### 1. Clonar repositorio
```bash
git clone https://github.com/builes/reto_preficient.git
cd reto_preficient
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env`:
```env
DB_HOST=tu-host.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_password
DB_DIALECT=postgres
```

### 4. Configurar base de datos
```bash
npm run db:migrate
npm run db:seed
npm run db:verify
```

### 5. Iniciar servidor
```bash
npm run start
```

Servidor disponible en: `http://localhost:3001`

---

## Endpoints API

### Recursos
- `GET /api/resources` - Todos los recursos
- `GET /api/resources/:id` - Un recurso específico
- `GET /api/resources/category/:category` - Filtrar por categoría (oxygen/water/food/spare_parts)
- `PUT /api/resources/:id/update-quantity` - Actualizar cantidad
- `GET /api/resources/alerts` - Recursos críticos

### Historial
- `GET /api/resources/:resourceId/history` - Historial de un recurso
- `GET /api/resources/history/recent?minutes=60` - Historial reciente
- `GET /api/resources/:resourceId/stats` - Estadísticas (24h)

### Ejemplo de actualización
```bash
curl -X PUT http://localhost:3001/api/resources/1/update-quantity \
  -H "Content-Type: application/json" \
  -d '{"quantity": 20000}'
```

---

## Funcionalidades

### 1. Niveles Estándar (Definidos en Backend)

Los niveles se aplican automáticamente según la categoría:

| Categoría | Min | Critical | Max | Unit |
|-----------|-----|----------|-----|------|
| Oxygen | 3001 | 5000 | 25000 | L |
| Water | 50 | 80 | 500 | L |
| Spare Parts | 10 | 20 | 100 | u |
| Food | 5 | 10 | 70 | kg |

### 2. Registro Automático (Cron Jobs)

**Monitoreo cada minuto:**
- Registra el estado actual de todos los recursos
- Guarda en `change_history` para análisis temporal
- Permite gráficas de tiempo real

**Limpieza diaria (3:00 AM):**
- Elimina registros mayores a 30 días
- Mantiene la base de datos optimizada

### 3. Base de Datos

**Tabla `resource_data`**
- id, name, category

**Tabla `resources`**
- id, quantity, resourceDataId

**Tabla `change_history`**
- id, stock, resourceId, createdAt

Los niveles (min/critical/max/unit) NO están en la DB, se calculan dinámicamente.

---

## Bot de Telegram + N8N

### Configuración del Bot

1. **Crear bot en Telegram:**
   - Buscar `@BotFather`
   - Enviar `/newbot`
   - Guardar el token

2. **Configurar comandos:**
```
start - Iniciar el bot
all - Ver todos los recursos
oxygen - Nivel de oxígeno
water - Nivel de agua
food - Alimentos disponibles
parts - Spare parts
alerts - Recursos críticos
status - Estado general
```

3. **Crear workflow en N8N:**
   - Telegram Trigger (con el token del bot)
   - Code node para detectar intención
   - Switch para dirigir comandos
   - HTTP Request nodes a `http://localhost:3001/api/resources/*`
   - Code node para formatear respuesta
   - Telegram Send Message

4. **Alertas diarias:**
   - Schedule Trigger (8:00 AM)
   - HTTP Request a `/api/resources/alerts`
   - IF (count > 0)
   - Telegram Send Message

---

## Scripts Disponibles

```bash
npm run start              # Inicia el servidor
npm run db:migrate         # Ejecuta migraciones
npm run db:migrate:undo    # Revierte migraciones
npm run db:seed            # Ejecuta seeders
npm run db:seed:undo       # Revierte seeders
npm run db:verify          # Verifica la base de datos
```

---

## Estructura del Proyecto

```
src/
├── server.js              # Configuración del servidor
├── config/
│   └── database.config.js # Configuración de DB
├── constants/
│   └── resource.constants.js # Niveles estándar
├── models/               # Modelos Sequelize
├── migrations/           # Migraciones de DB
├── seeders/             # Datos iniciales
├── services/            # Lógica de negocio
├── controllers/         # Manejadores HTTP
├── routes/              # Rutas de la API
├── cron/                # Tareas programadas
└── utils/               # Utilidades
```

---

## Recursos del Sistema

### Categoría Oxygen
- 1 registro: Oxygen

### Categoría Water
- 1 registro: Water

### Categoría Spare Parts
- 1 registro: Spare Parts

### Categoría Food
- Protein Pack Storage
- Vegetable Reserves
- Carbohydrate Supply
- Emergency Rations

---

## Troubleshooting

**Error de conexión a DB:**
- Verifica credenciales en `.env`
- Asegúrate que Supabase esté activo

**Bot no responde:**
- Workflow debe estar activado en N8N
- Backend debe estar corriendo
- Token de Telegram correcto

**N8N no conecta al backend:**
- Si N8N está en Docker: usa `http://host.docker.internal:3001`
- Si N8N está en la nube: usa ngrok para exponer localhost

---

## Autores

Proyecto desarrollado para la gestión de recursos en misión espacial a Marte.

---

## Licencia

ISC
