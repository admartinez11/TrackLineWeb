fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
    credentials: "include"
})
    .then(res => {
        if (!res.ok) throw new Error("No autorizado");
    })

    .catch(() => {
        window.location.href = "Login.html";
    });


import { getCliente } from "../Services/AddNitService.js";
import { createOrdenServicio } from "../Services/OrdenServicioService.js";

// --- Referencias a elementos del DOM ---
document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('listaClientes');
    const seccion = document.getElementById('busquedaNit');
    const botonSi = document.querySelector('.respuestaSi');
    const botonNo = document.getElementById('btnNo');
    const inputBusqueda = document.getElementById('inputBusquedaNit');

    // Iniciar la aplicación
    init();

    function init() {
        botonSi.addEventListener('click', () => {
            seccion.style.display = 'block';
            seccion.scrollIntoView({ behavior: 'smooth' });
            loadClientes();
        });

        botonNo.addEventListener('click', () => {
            window.location.href = '/index.html';
        });

        inputBusqueda.addEventListener('input', filtrarClientes);
        seccion.style.display = 'none';
    }

    // Función para cargar los clientes
    async function loadClientes() {
        contenedor.innerHTML = '';
        try {
            const clientes = await getCliente();

            clientes.forEach(cliente => {
                const div = document.createElement('div');
                div.classList.add('cliente');
                div.dataset.id = cliente.clienteNit;

                const identificador = [cliente.nombre, cliente.apellido]
                    // Filtramos para quedarnos solo con el valor que NO es null/undefined/vacío
                    .filter(valor => valor && String(valor).trim() !== '')
                    .join(''); // Unimos la única pieza restante

                div.innerHTML = `
                    <div class="cliente-info">
                        <strong>NIT:</strong> ${cliente.clienteNit}<br>
                        <strong>Cliente:</strong> ${identificador || 'N/A'}
                    </div>
                    <button class="boton-agregar btNAgregarNit">Agregar NIT</button>
                `;

                const botonAgregarNit = div.querySelector('.btNAgregarNit');
                botonAgregarNit.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const clienteNIT = div.dataset.id;

                    // 🛑 PASO 1: LIMPIAR TODO EL ESTADO DE LA ORDEN ANTERIOR
                    // Esto asegura que ServiceOrder.html inicie de cero.
                    const keysToClear = [
                        "ordenEdit",
                        "idOrdenServicio",
                        "idOrdenEncabezado",
                        "idAduana",
                        "idInfoEmbarque",
                        "idTransporte",
                        "idRecoleccion",
                        "idObservaciones",
                        "clienteNIT" // También limpiamos el NIT antiguo por si acaso
                    ];
                    keysToClear.forEach(key => localStorage.removeItem(key));

                    const data = {
                        clienteNIT: clienteNIT,
                        idOrdenEncabezado: "",
                        idInfoEmbarque: "",
                        idAduana: "",
                        idTransporte: "",
                        idRecoleccion: "",
                        idObservaciones: "",
                    };

                    try {
                        // Crear la orden y obtener la respuesta del backend
                        const respuesta = await createOrdenServicio(data);

                        console.log("Respuesta completa:", respuesta);

                        // Guardar solo clienteNIT y idOrdenServicio en localStorage
                        const idOrdenServicio = respuesta.data?.idOrdenServicio;
                        if (clienteNIT && idOrdenServicio) {
                            localStorage.setItem('clienteNIT', clienteNIT);
                            localStorage.setItem('idOrdenServicio', idOrdenServicio);
                            console.log("clienteNIT y idOrdenServicio guardados en localStorage");
                        } else {
                            console.warn("⚠ No se pudo guardar clienteNIT o idOrdenServicio");
                        }

                        // Redirigir a ServiceOrder.html
                        window.location.href = 'ServiceOrder.html';
                    } catch (err) {
                        console.error("Error al crear la orden:", err);
                        alert("No se pudo crear la orden, revisa la consola");
                    }
                });

                contenedor.appendChild(div);
            });
        } catch (error) {
            console.error('Ha ocurrido un error al cargar los clientes:', error);
            contenedor.innerHTML = '<p>No se pudieron cargar los datos. Inténtalo de nuevo más tarde.</p>';
        }
    }

    function filtrarClientes() {
        const filtro = inputBusqueda.value.toLowerCase();
        const clientesDOM = document.querySelectorAll('#listaClientes .cliente');
        clientesDOM.forEach(cliente => {
            const texto = cliente.textContent.toLowerCase();
            cliente.style.display = texto.includes(filtro) ? '' : 'none';
        });
    }
});
