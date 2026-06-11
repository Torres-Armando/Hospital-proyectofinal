require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ----- Middlewares -----
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ----- Conexión a MongoDB Atlas -----
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch((error) => console.error('❌ Error al conectar a MongoDB:', error));

// ----- Esquema y modelo de Servicio -----
const servicioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        required: true,
        enum: ['Consulta', 'Urgencias', 'Laboratorio', 'Imagenología', 'Hospitalización', 'Otro'],
        default: 'Otro'
    },
    descripcion: {
        type: String,
        trim: true,
        default: ''
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    disponible: {
        type: Boolean,
        default: true
    },
    creadoEn: {
        type: Date,
        default: Date.now
    }
});

const Servicio = mongoose.model('Servicio', servicioSchema);

// ----- Rutas API: CRUD de Servicios -----

// CREATE - agregar nuevo servicio
app.post('/api/servicios', async (req, res) => {
    try {
        const { nombre, categoria, descripcion, precio, disponible } = req.body;

        if (!nombre || !categoria || precio === undefined || precio === '') {
            return res.status(400).json({ error: 'Nombre, categoría y precio son obligatorios.' });
        }

        if (Number(precio) < 0) {
            return res.status(400).json({ error: 'El precio no puede ser negativo.' });
        }

        const nuevoServicio = new Servicio({
            nombre,
            categoria,
            descripcion,
            precio: Number(precio),
            disponible: disponible !== undefined ? disponible : true
        });

        const servicioGuardado = await nuevoServicio.save();
        res.status(201).json({ mensaje: 'Servicio agregado correctamente.', servicio: servicioGuardado });
    } catch (error) {
        console.error('Error al crear servicio:', error);
        res.status(500).json({ error: 'Error en el servidor al crear el servicio.' });
    }
});

// READ - listar todos los servicios
app.get('/api/servicios', async (req, res) => {
    try {
        const servicios = await Servicio.find().sort({ creadoEn: -1 });
        res.json(servicios);
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({ error: 'Error en el servidor al obtener los servicios.' });
    }
});

// READ - obtener un servicio por id
app.get('/api/servicios/:id', async (req, res) => {
    try {
        const servicio = await Servicio.findById(req.params.id);
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado.' });
        }
        res.json(servicio);
    } catch (error) {
        console.error('Error al buscar servicio:', error);
        res.status(500).json({ error: 'Error en el servidor al buscar el servicio.' });
    }
});

// UPDATE - editar un servicio existente
app.put('/api/servicios/:id', async (req, res) => {
    try {
        const { nombre, categoria, descripcion, precio, disponible } = req.body;

        if (!nombre || !categoria || precio === undefined || precio === '') {
            return res.status(400).json({ error: 'Nombre, categoría y precio son obligatorios.' });
        }

        if (Number(precio) < 0) {
            return res.status(400).json({ error: 'El precio no puede ser negativo.' });
        }

        const servicioActualizado = await Servicio.findByIdAndUpdate(
            req.params.id,
            {
                nombre,
                categoria,
                descripcion,
                precio: Number(precio),
                disponible: disponible !== undefined ? disponible : true
            },
            { new: true, runValidators: true }
        );

        if (!servicioActualizado) {
            return res.status(404).json({ error: 'Servicio no encontrado.' });
        }

        res.json({ mensaje: 'Servicio actualizado correctamente.', servicio: servicioActualizado });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({ error: 'Error en el servidor al actualizar el servicio.' });
    }
});

// DELETE - eliminar un servicio
app.delete('/api/servicios/:id', async (req, res) => {
    try {
        const servicioEliminado = await Servicio.findByIdAndDelete(req.params.id);

        if (!servicioEliminado) {
            return res.status(404).json({ error: 'Servicio no encontrado.' });
        }

        res.json({ mensaje: 'Servicio eliminado correctamente.', servicio: servicioEliminado });
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.status(500).json({ error: 'Error en el servidor al eliminar el servicio.' });
    }
});

// ----- Servir el frontend -----
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
