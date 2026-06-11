document.addEventListener('DOMContentLoaded', () => {
    // ----- Referencias al DOM -----
    const lista = document.getElementById('lista-servicios');
    const estadoCarga = document.getElementById('estado-carga');
    const estadoVacio = document.getElementById('estado-vacio');
    const filtroCategoria = document.getElementById('filtro-categoria');
    const plantilla = document.getElementById('plantilla-tarjeta');

    const form = document.getElementById('form-servicio');
    const inputId = document.getElementById('servicio-id');
    const inputNombre = document.getElementById('nombre');
    const inputCategoria = document.getElementById('categoria');
    const inputDescripcion = document.getElementById('descripcion');
    const inputPrecio = document.getElementById('precio');
    const inputDisponible = document.getElementById('disponible');

    const formTitulo = document.getElementById('form-titulo');
    const formEyebrow = document.getElementById('form-eyebrow');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const formMensaje = document.getElementById('form-mensaje');

    let servicios = [];

    const formateador = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });

    // ----- Cargar servicios desde la API -----
    async function cargarServicios() {
        estadoCarga.classList.remove('estado--oculto');
        estadoVacio.classList.add('estado--oculto');
        lista.innerHTML = '';

        try {
            const respuesta = await fetch('/api/servicios');
            if (!respuesta.ok) throw new Error('No se pudieron cargar los servicios.');

            servicios = await respuesta.json();
            renderizarServicios();
        } catch (error) {
            console.error(error);
            estadoCarga.textContent = '❌ No se pudo conectar con el servidor. Intenta más tarde.';
        }
    }

    // ----- Renderizar tarjetas según el filtro -----
    function renderizarServicios() {
        const categoriaSeleccionada = filtroCategoria.value;
        const filtrados = categoriaSeleccionada === 'todas'
            ? servicios
            : servicios.filter((s) => s.categoria === categoriaSeleccionada);

        lista.innerHTML = '';
        estadoCarga.classList.add('estado--oculto');

        if (filtrados.length === 0) {
            estadoVacio.classList.remove('estado--oculto');
            estadoVacio.textContent = servicios.length === 0
                ? 'Aún no hay servicios registrados. Agrega el primero desde el formulario de abajo.'
                : 'No hay servicios en esta categoría.';
            return;
        }

        estadoVacio.classList.add('estado--oculto');

        filtrados.forEach((servicio) => {
            const nodo = plantilla.content.cloneNode(true);

            nodo.querySelector('.tarjeta__categoria').textContent = servicio.categoria;

            const estado = nodo.querySelector('.tarjeta__estado');
            if (servicio.disponible) {
                estado.textContent = 'Disponible';
                estado.classList.add('tarjeta__estado--disponible');
            } else {
                estado.textContent = 'No disponible';
                estado.classList.add('tarjeta__estado--no-disponible');
            }

            nodo.querySelector('.tarjeta__nombre').textContent = servicio.nombre;
            nodo.querySelector('.tarjeta__descripcion').textContent =
                servicio.descripcion && servicio.descripcion.trim() !== ''
                    ? servicio.descripcion
                    : 'Sin descripción adicional.';
            nodo.querySelector('.tarjeta__precio').textContent = formateador.format(servicio.precio);

            nodo.querySelector('.btn--editar').addEventListener('click', () => iniciarEdicion(servicio));
            nodo.querySelector('.btn--eliminar').addEventListener('click', () => eliminarServicio(servicio._id, servicio.nombre));

            lista.appendChild(nodo);
        });
    }

    // ----- Mostrar mensaje en el formulario -----
    function mostrarMensaje(texto, tipo) {
        formMensaje.textContent = texto;
        formMensaje.className = 'form-mensaje';
        if (tipo) {
            formMensaje.classList.add(`form-mensaje--${tipo}`);
        }
    }

    // ----- Iniciar modo edición -----
    function iniciarEdicion(servicio) {
        inputId.value = servicio._id;
        inputNombre.value = servicio.nombre;
        inputCategoria.value = servicio.categoria;
        inputDescripcion.value = servicio.descripcion || '';
        inputPrecio.value = servicio.precio;
        inputDisponible.checked = servicio.disponible;

        formEyebrow.textContent = 'Edición';
        formTitulo.textContent = `Editando: ${servicio.nombre}`;
        btnGuardar.textContent = 'Guardar cambios';
        btnCancelar.classList.remove('btn--oculto');
        mostrarMensaje('', null);

        document.getElementById('agregar').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ----- Cancelar edición / volver a modo "agregar" -----
    function cancelarEdicion() {
        form.reset();
        inputId.value = '';
        inputDisponible.checked = true;

        formEyebrow.textContent = 'Administración';
        formTitulo.textContent = 'Agregar nuevo servicio';
        btnGuardar.textContent = 'Agregar servicio';
        btnCancelar.classList.add('btn--oculto');
        mostrarMensaje('', null);
    }

    // ----- Enviar formulario (crear o actualizar) -----
    async function manejarEnvio(evento) {
        evento.preventDefault();

        const datos = {
            nombre: inputNombre.value.trim(),
            categoria: inputCategoria.value,
            descripcion: inputDescripcion.value.trim(),
            precio: inputPrecio.value,
            disponible: inputDisponible.checked
        };

        const id = inputId.value;
        const esEdicion = Boolean(id);
        const url = esEdicion ? `/api/servicios/${id}` : '/api/servicios';
        const metodo = esEdicion ? 'PUT' : 'POST';

        btnGuardar.disabled = true;

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                mostrarMensaje(`❌ ${resultado.error || 'Ocurrió un error.'}`, 'error');
                return;
            }

            mostrarMensaje(`✅ ${resultado.mensaje}`, 'exito');
            cancelarEdicion();
            await cargarServicios();
        } catch (error) {
            console.error(error);
            mostrarMensaje('❌ No se pudo conectar con el servidor.', 'error');
        } finally {
            btnGuardar.disabled = false;
        }
    }

    // ----- Eliminar servicio -----
    async function eliminarServicio(id, nombre) {
        const confirmado = window.confirm(`¿Seguro que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`);
        if (!confirmado) return;

        try {
            const respuesta = await fetch(`/api/servicios/${id}`, { method: 'DELETE' });
            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                alert(`No se pudo eliminar: ${resultado.error || 'error desconocido'}`);
                return;
            }

            // Si se estaba editando el mismo servicio que se eliminó, reiniciar el formulario
            if (inputId.value === id) {
                cancelarEdicion();
            }

            await cargarServicios();
        } catch (error) {
            console.error(error);
            alert('No se pudo conectar con el servidor para eliminar el servicio.');
        }
    }

    // ----- Eventos -----
    form.addEventListener('submit', manejarEnvio);
    btnCancelar.addEventListener('click', cancelarEdicion);
    filtroCategoria.addEventListener('change', renderizarServicios);

    // ----- Carga inicial -----
    cargarServicios();
});
