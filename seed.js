// Script opcional: precarga servicios de ejemplo en la base de datos.
// Úsalo solo UNA vez, ejecutándolo localmente con: node seed.js
// Requiere que tu archivo .env tenga MONGO_URI configurado.

require('dotenv').config();
const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
    nombre: String,
    categoria: String,
    descripcion: String,
    precio: Number,
    disponible: Boolean,
    creadoEn: { type: Date, default: Date.now }
});

const Servicio = mongoose.model('Servicio', servicioSchema);

const serviciosEjemplo = [
    {
        nombre: 'Consulta General',
        categoria: 'Consulta',
        descripcion: 'Valoración médica general con médico de guardia.',
        precio: 300,
        disponible: true
    },
    {
        nombre: 'Consulta de Pediatría',
        categoria: 'Consulta',
        descripcion: 'Atención especializada para niñas y niños.',
        precio: 450,
        disponible: true
    },
    {
        nombre: 'Urgencias',
        categoria: 'Urgencias',
        descripcion: 'Atención inmediata las 24 horas del día.',
        precio: 500,
        disponible: true
    },
    {
        nombre: 'Laboratorio Básico',
        categoria: 'Laboratorio',
        descripcion: 'Biometría hemática, química sanguínea y examen general de orina.',
        precio: 400,
        disponible: true
    },
    {
        nombre: 'Rayos X',
        categoria: 'Imagenología',
        descripcion: 'Estudio radiográfico simple de la zona indicada por el médico.',
        precio: 800,
        disponible: true
    },
    {
        nombre: 'Ultrasonido',
        categoria: 'Imagenología',
        descripcion: 'Estudio de ultrasonido abdominal o pélvico.',
        precio: 750,
        disponible: false
    },
    {
        nombre: 'Hospitalización (por día)',
        categoria: 'Hospitalización',
        descripcion: 'Incluye habitación, monitoreo y atención de enfermería.',
        precio: 3500,
        disponible: true
    }
];

async function ejecutar() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB Atlas');

        await Servicio.deleteMany({});
        console.log('🗑️  Colección de servicios limpiada');

        await Servicio.insertMany(serviciosEjemplo);
        console.log(`✅ ${serviciosEjemplo.length} servicios de ejemplo insertados`);

        await mongoose.disconnect();
        console.log('👋 Desconectado');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

ejecutar();
