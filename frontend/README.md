# Preparcial: CRUD de Actores con Next.js y React

Solución completa y modular para el preparcial de desarrollo web (**CRUD de Actores con Next.js**), conectando el frontend con el backend en NestJS (**BackArte7**).

---

## 📋 Estructura de la Solución

```text
frontend/
├── app/
│   ├── actors/
│   │   └── page.tsx        # Ruta /actors: Renderiza la lista de actores
│   ├── crear/
│   │   └── page.tsx        # Ruta /crear: Renderiza el formulario de creación
│   ├── globals.css         # Estilos globales y Bootstrap 5
│   ├── layout.tsx          # Layout raíz con ActorProvider y Navbar
│   └── page.tsx            # Redirección de / hacia /actors
├── components/
│   ├── ActorEditModal.tsx  # Modal controlado con useState para editar actores
│   ├── ActorForm.tsx       # Formulario controlado con useState para crear actores
│   ├── ActorList.tsx       # Componente de lista con botones de Editar y Eliminar
│   └── Navbar.tsx          # Barra de navegación entre rutas con indicador de API
├── context/
│   └── ActorContext.tsx    # Contexto global: useEffect con API, CRUD y persistencia
├── types/
│   └── actor.ts            # Interfaces TypeScript para Actor y DTO
├── package.json
└── tsconfig.json
```

---

## 🎯 Cumplimiento de los Puntos del Preparcial

### **Paso 1 – Lista de actores**
- **Componente**: `ActorList.tsx` renderiza la colección de actores en tarjetas de Bootstrap con nombre, foto, nacionalidad, fecha de nacimiento y biografía.
- **Hook `useEffect`**: En `ActorContext.tsx` se ejecuta `useEffect` al montar la aplicación para realizar la petición `fetch('http://localhost:3000/api/v1/actors')`.
- **Página Actores**: Disponible en la ruta `/actors`.

### **Paso 3 – Formulario para crear actores**
- **Formulario controlado**: `ActorForm.tsx` implementa campos para:
  - `nombre` (name)
  - `photo` (URL de la imagen con vista previa interactiva)
  - `nationality` (nacionalidad)
  - `birthday` (fecha de nacimiento mediante input `type="date"`)
  - `biography` (área de texto)
- **Manejo con `useState`**: Cada campo posee su respectivo estado (`useState('')`).
- **Envío**: Valida los campos, ejecuta `addActor(...)` y redirige a la lista.
- **Página**: Ubicado en `/crear`.

### **Paso 4 – Configuración de rutas**
- `/actors` → Lista de actores (`app/actors/page.tsx`).
- `/crear` → Formulario de creación de actor (`app/crear/page.tsx`).
- `/` → Redirección automática a `/actors`.

### **Paso 5 – Conectar formulario y lista**
- **Persistencia entre rutas**: Al estar envuelta la aplicación en `<ActorProvider>` en `RootLayout`, el estado de React se conserva en memoria al navegar entre `/crear` y `/actors`.
- Si el backend está disponible, además envía la petición `POST` al endpoint `/api/v1/actors`.
- Si el backend no está iniciado, el estado local sigue funcionando plenamente con datos simulados y persistentes durante la sesión del navegador.

### **Paso 6 – Editar actores**
- Cada tarjeta de actor cuenta con un botón **"✏️ Editar"**.
- Al presionarlo, se abre `ActorEditModal.tsx` con un formulario controlado pre-cargado con los datos del actor seleccionado (`useState` y `useEffect`).
- Al guardar los cambios, actualiza el estado en el contexto y envía `PUT /api/v1/actors/:id` a la API.

### **Paso 7 – Eliminar actor**
- Cada tarjeta contiene un botón **"🗑️ Eliminar"**.
- Solicita confirmación y ejecuta `deleteActor(id)`, enviando `DELETE /api/v1/actors/:id` y removiendo el actor del estado para actualizar la interfaz al instante.

---

## 🚀 Instrucciones de Ejecución

### 1. Iniciar el Backend (BackArte7)
Abre una terminal en la carpeta `BackArte7`:
```bash
cd BackArte7
docker-compose up
```
*Verifica que el servicio esté corriendo en `http://localhost:3000/api/v1/actors`.*

### 2. Iniciar el Frontend (Next.js)
Abre otra terminal en la carpeta `frontend`:
```bash
cd frontend
pnpm install
pnpm dev
```
*El frontend iniciará en `http://localhost:3001` (para evitar conflicto con el puerto 3000 del backend).*

Visita en tu navegador:
- **`http://localhost:3001/actors`** (Lista de actores)
- **`http://localhost:3001/crear`** (Formulario de creación)
