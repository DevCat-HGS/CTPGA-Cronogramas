# Estructura de MongoDB en CTPGA-Cronogramas

## Nombre de la Base de Datos

**Nombre:** `ctpga-manager`

**URI de Conexión:** `mongodb://localhost:27017/ctpga-manager`

## Colecciones

La base de datos contiene las siguientes colecciones:

### 1. Users

Almacena información de los usuarios del sistema.

**Esquema:**
```javascript
{
  name: String (requerido),
  email: String (requerido, único),
  password: String (requerido),
  role: String (enum: ['superadmin', 'admin', 'instructor'], default: 'instructor'),
  area: String (requerido solo si role es 'admin'),
  status: String (enum: ['pending', 'active', 'rejected'], default: 'pending'),
  isOnline: Boolean (default: false),
  lastActive: Date (default: Date.now),
  createdAt: Date (default: Date.now)
}
```

### 2. Guides

Almacena las guías didácticas creadas por los instructores.

**Esquema:**
```javascript
{
  title: String (requerido),
  instructor: ObjectId (referencia a User, requerido),
  introduction: String (requerido),
  objectives: [String] (requerido),
  materials: [String],
  development: String (requerido),
  evaluation: String (requerido),
  resources: [String],
  tags: [String],
  category: String (enum: ['teorica', 'practica', 'evaluativa', 'complementaria'], default: 'teorica'),
  difficulty: String (enum: ['basica', 'intermedia', 'avanzada'], default: 'intermedia'),
  estimatedTime: Number (tiempo en minutos),
  status: String (enum: ['draft', 'published', 'archived'], default: 'draft'),
  currentVersion: Number (default: 1),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 3. GuideVersions

Almacena las diferentes versiones de las guías.

**Esquema:**
```javascript
{
  guide: ObjectId (referencia a Guide, requerido),
  versionNumber: Number (requerido),
  content: Object (requerido),
  changes: String,
  createdBy: ObjectId (referencia a User, requerido),
  createdAt: Date (default: Date.now)
}
```

### 4. Activities

Almacena las actividades programadas por los instructores.

**Esquema:**
```javascript
{
  title: String (requerido),
  description: String (requerido),
  instructor: ObjectId (referencia a User, requerido),
  startDate: Date (default: Date.now),
  deadline: Date,
  reminderDate: Date,
  priority: String (enum: ['baja', 'media', 'alta'], default: 'media'),
  category: String (enum: ['clase', 'taller', 'evaluacion', 'proyecto', 'otro'], default: 'clase'),
  tags: [String],
  location: String,
  isRecurring: Boolean (default: false),
  recurringPattern: String (enum: ['diario', 'semanal', 'mensual', 'personalizado']),
  status: String (enum: ['pendiente', 'en-progreso', 'completada', 'cancelada'], default: 'pendiente'),
  attachments: [String],
  relatedGuides: [ObjectId] (referencia a Guide),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 5. Events

Almacena eventos programados en el sistema.

**Esquema:**
```javascript
{
  title: String (requerido),
  description: String (requerido),
  startDate: Date (requerido),
  endDate: Date (requerido),
  location: String,
  organizer: ObjectId (referencia a User, requerido),
  participants: [ObjectId] (referencia a User),
  status: String (enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 6. Feedback

Almacena retroalimentación sobre guías, actividades o el sistema.

**Esquema:**
```javascript
{
  user: ObjectId (referencia a User, requerido),
  targetType: String (enum: ['guide', 'activity', 'system'], requerido),
  targetId: ObjectId (refPath: 'targetType', requerido excepto para 'system'),
  rating: Number (min: 1, max: 5, requerido excepto para 'system'),
  comment: String (requerido),
  status: String (enum: ['pending', 'reviewed', 'resolved'], default: 'pending'),
  response: {
    text: String,
    respondedBy: ObjectId (referencia a User),
    respondedAt: Date
  },
  createdAt: Date (default: Date.now)
}
```

### 7. Badges

Almacena insignias que pueden ser otorgadas a los usuarios.

**Esquema:**
```javascript
{
  name: String (requerido, único),
  description: String (requerido),
  icon: String (requerido),
  criteria: String (requerido),
  points: Number (default: 0),
  category: String (enum: ['content', 'participation', 'quality', 'achievement'], requerido),
  createdBy: ObjectId (referencia a User, requerido),
  isActive: Boolean (default: true),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 8. UserBadges

Almacena la relación entre usuarios e insignias obtenidas.

**Esquema:**
```javascript
{
  user: ObjectId (referencia a User, requerido),
  badge: ObjectId (referencia a Badge, requerido),
  earnedAt: Date (default: Date.now),
  progress: Number (min: 0, max: 100, default: 0),
  isCompleted: Boolean (default: false)
}
```
**Índices:**
- Índice compuesto único: { user: 1, badge: 1 }

### 9. Reports

Almacena informes generados en el sistema.

**Esquema:**
```javascript
{
  title: String (requerido),
  description: String (requerido),
  type: String (enum: ['activity', 'instructor', 'event', 'general'], requerido),
  creator: ObjectId (referencia a User, requerido),
  data: Object (requerido),
  format: String (enum: ['excel', 'pdf', 'csv'], default: 'excel'),
  generatedAt: Date (default: Date.now),
  status: String (enum: ['pending', 'generated', 'error'], default: 'pending'),
  downloadUrl: String,
  createdAt: Date (default: Date.now)
}
```

### 10. Templates

Almacena plantillas para guías, actividades o informes.

**Esquema:**
```javascript
{
  name: String (requerido),
  description: String (requerido),
  type: String (enum: ['guide', 'activity', 'report'], requerido),
  creator: ObjectId (referencia a User, requerido),
  structure: Object (requerido),
  isDefault: Boolean (default: false),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 11. Analytics

Almacena datos analíticos sobre el uso del sistema.

**Esquema:**
```javascript
{
  type: String (enum: ['user-activity', 'content-usage', 'system-performance'], requerido),
  data: Object (requerido),
  period: String (enum: ['daily', 'weekly', 'monthly', 'custom'], requerido),
  startDate: Date (requerido),
  endDate: Date (requerido),
  createdAt: Date (default: Date.now)
}
```

## Relaciones entre Colecciones

- **Users** → **Guides**: Un usuario (instructor) puede crear múltiples guías.
- **Users** → **Activities**: Un usuario (instructor) puede crear múltiples actividades.
- **Users** → **Events**: Un usuario puede organizar múltiples eventos y participar en varios eventos.
- **Users** → **Badges**: Un usuario puede crear múltiples insignias.
- **Users** → **UserBadges**: Un usuario puede obtener múltiples insignias.
- **Guides** → **GuideVersions**: Una guía puede tener múltiples versiones.
- **Guides** → **Activities**: Una actividad puede estar relacionada con múltiples guías.
- **Badges** → **UserBadges**: Una insignia puede ser otorgada a múltiples usuarios.

## Índices

Los siguientes índices están configurados para optimizar el rendimiento:

- **UserBadges**: Índice compuesto único en { user: 1, badge: 1 } para evitar duplicados.
- **Users**: Índice único en { email: 1 } para búsquedas rápidas y unicidad.

## Conexión a la Base de Datos

La aplicación se conecta a MongoDB utilizando Mongoose con la siguiente configuración:

```javascript
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ctpga-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```