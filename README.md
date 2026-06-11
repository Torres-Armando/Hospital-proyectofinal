# Hospital General "Vida y Salud" — Catálogo de Servicios (CRUD)

Sistema web con catálogo de servicios médicos conectado a MongoDB Atlas.
Permite **crear, ver, editar y eliminar** servicios (CRUD completo) desde una
sola página.

## ⚠️ Antes de subir a GitHub — MUY IMPORTANTE

El archivo `.env` (con tu usuario y contraseña reales de Mongo) **NUNCA**
debe subirse al repositorio. Ya está en `.gitignore`. Verifica con
`git status` que no aparezca antes de hacer commit.

`.env.example` SÍ se sube, pero debe contener `<usuario>` y `<password>`
como marcadores genéricos, **nunca** tus credenciales reales.

## Estructura del proyecto

```
hospital-app/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js
├── seed.js
├── package.json
├── .env.example
└── .gitignore
```

## 1. Configurar variables de entorno (local)

1. Copia `.env.example` y renómbralo a `.env`.
2. Reemplaza `<usuario>` y `<password>` por tus credenciales reales de
   MongoDB Atlas.

## 2. Probar localmente

```bash
npm install
npm start
```

Abre `http://localhost:3000`.

### (Opcional) Precargar servicios de ejemplo

```bash
node seed.js
```

Esto borra la colección `servicios` y la llena con 7 servicios de ejemplo,
útil para que el catálogo no se vea vacío al presentar el proyecto.

## 3. Subir a GitHub

```bash
git init
git add .
git commit -m "CRUD de servicios médicos con MongoDB Atlas"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

Antes de `git add .`, ejecuta `git status` y confirma que `.env` **no**
aparece en la lista.

## 4. Desplegar en Render

1. [render.com](https://render.com) → **New +** → **Web Service** → tu
   repositorio.
2. Configuración:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
3. En **Environment Variables**, agrega:
   - `MONGO_URI` = tu cadena de conexión completa con tus credenciales reales.
4. **Create Web Service**.

## 5. Configurar MongoDB Atlas

1. **Network Access** → agrega `0.0.0.0/0` (Render usa IPs dinámicas).
2. **Database Access** → confirma que el usuario tenga permisos de
   lectura/escritura sobre la base de datos `hospital`.

## Endpoints de la API

| Método | Ruta                  | Descripción                        |
|--------|-----------------------|-------------------------------------|
| GET    | `/api/servicios`      | Lista todos los servicios           |
| GET    | `/api/servicios/:id`  | Obtiene un servicio por id          |
| POST   | `/api/servicios`      | Crea un nuevo servicio              |
| PUT    | `/api/servicios/:id`  | Actualiza un servicio existente     |
| DELETE | `/api/servicios/:id`  | Elimina un servicio                 |

## Modelo de datos (Servicio)

| Campo        | Tipo     | Descripción                                              |
|--------------|----------|-----------------------------------------------------------|
| nombre       | String   | Nombre del servicio (obligatorio)                         |
| categoria    | String   | Consulta, Urgencias, Laboratorio, Imagenología, Hospitalización, Otro |
| descripcion  | String   | Descripción breve del servicio                            |
| precio       | Number   | Precio en MXN (obligatorio, ≥ 0)                          |
| disponible   | Boolean  | Si el servicio está disponible actualmente                |
| creadoEn     | Date     | Fecha de creación (automática)                            |

## Créditos

- **Desarrollador:** Torres Armando
- **Control:** 24308051280809 — Semestre 4° - J
- **Especialidad:** Programación
- CETIS / CBTIS
