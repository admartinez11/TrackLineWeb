fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
            credentials: "include" 
        })
        .then(res => {
            if (!res.ok) throw new Error("No autorizado");
        })
        
.catch(() => {
    window.location.href = "Login.html";
});


import {
    createTransporte,
    updateTransporte,
    deleteTransporte,
    getTransportePaginacion
} from "../Services/TransportServices.js";

import {
    getTransportista
} from "../Services/TransportistaTServices.js";

import {
    getServTrans
} from "../Services/ServTransT.js";

let currentPage = 0;
let totalPages = 0;
const pageSize = 10;

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#transportsTable tbody"); //Tbody - Cuerpo de la tabla
    const form = document.getElementById("transportForm");//Formulario dentro del modal
    const modal = new bootstrap.Modal(document.getElementById("transportModal")); //Modal
    const lblModal = document.getElementById("transportModalLabel"); // Titulo del modal
    const btnAdd = document.getElementById("btnAddTransport");  //Boton para abrir modal
    const driverSelect = document.getElementById("transportDriver"); // <<-- esto faltaba
    const servSelect = document.getElementById("transportST"); // <<-- esto faltaba

    //Cargar transportista en el combo box
    async function loadTransportista() {
        try {
            const drivers = await getTransportista();
            driverSelect.innerHTML = `<option value="">Seleccione un transportista</option>`;
            drivers.forEach(d => {
                driverSelect.innerHTML += `<option value="${d.idTransportista}">${d.nombre}</option>`;
            });
        } catch (err) {
            console.error("Error cargando transportista:", err);
        }
    }

    //Cargar servicio transportiste en el combo box
    async function loadServTrans() {
        try {
            const serv = await getServTrans();
            servSelect.innerHTML = `<option value="">Seleccione placa del transporte</option>`;
            serv.forEach(d => {
                servSelect.innerHTML += `<option value="${d.idServicioTransporte}">${d.placa}</option>`;
            });
        } catch (err) {
            console.error("Error cargando servicio transporte:", err);
        }
    }

    //Accion cuando el boton de Agregar es presionado (Abrir modal)
    btnAdd.addEventListener("click", async () => {
        form.reset();
        form.transportId.value = "";
        lblModal.textContent = "Agregar transporte";
        await loadTransportista(); //llenar combo cuando abras el modal
        await loadServTrans(); //llenar combo 
        modal.show();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); //Evitamos que el formulario se envie al hacer "submit"


        // Construcción del objeto transporte
        const id = form.transportId.value;
        const data = {
            idTransportista: form.transportDriver.value,
            idServicioTransporte: form.transportST.value
        };

        //AQUI ME QUEDEEEEEEEEEEEEEEEEE

        if (!data.idTransportista || !data.idServicioTransporte) {
            return Swal.fire("Error", "Todos los campos son obligatorios.", "error");
        }

        try {
            let response;
            if (id) {
                response = await updateTransporte(id, data);
            } else {
                response = await createTransporte(data);
            }

            // Si llegamos a esta parte, la operación fue exitosa
            Swal.fire({
                icon: "success",
                title: "Operación exitosa",
                text: response.message || "Transporte guardado correctamente."
            });

            // Cerrar modal y recargar tabla
            modal.hide();
            await loadTransport();

        } catch (err) {
            // Si hay un error, lo manejamos aquí
            console.error("❌ Error: ", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message || "Ocurrió un problema al guardar el transporte."
            });
        }
    });

    async function loadTransport(page = 0, size = pageSize) {
        try {
            const response = await getTransportePaginacion(page, size);
            const transports = response.content || [];
            totalPages = response.totalPages || 1;
            currentPage = page;

            tableBody.innerHTML = ""; //Vaciamos la tabla


            if (!transports || transports.length == 0) {
                tableBody.innerHTML = '<td colspan="5"> Actualmente no hay registros </td>'
                return;
            }

            transports.forEach((t) => {
                const tr = document.createElement("tr"); //Se crea el elemento con JS
                tr.innerHTML = `
                    <td>${t.idTransporte}</td>
                    <td>${t.nombreTransportista}</td>
                    <td>${t.placaServicio}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary edit-btn">Editar</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn">Eliminar</button>
                    </td>
                `;

                //Funcionalidad para el boton de editar
                tr.querySelector(".edit-btn").addEventListener("click", () => {
                    form.transportId.value = t.idTransporte;

                    loadTransportista().then(() => {
                        driverSelect.value = t.idTransportista; //seleccionar transportista correcto
                    });

                    loadServTrans().then(() => {
                        servSelect.value = t.idServicioTransporte; //seleccionar serv trans correcto
                    });


                    lblModal.textContent = "Editar transporte";
                    modal.show();
                });

                //Funcionalidad para los botones de Eliminar
                tr.querySelector(".delete-btn").addEventListener("click", () => {
                    Swal.fire({
                        title: "¿Desea eliminar este transporte?",
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#727475ff",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar"
                    }).then(async (resultado) => {   // <-- async aquí
                        if (resultado.isConfirmed) {
                            try {
                                await deleteTransporte(t.idTransporte); // espera a que borre
                                await loadTransport(currentPage);       // espera a que recargue tabla

                                Swal.fire({
                                    icon: "success",
                                    title: "Eliminado",
                                    text: "El transporte ha sido eliminado correctamente"
                                });
                            } catch (err) {
                                Swal.fire({
                                    icon: "error",
                                    title: "Error",
                                    text: "Ocurrió un problema al eliminar el transporte"
                                });
                            }
                        }
                    });
                });

                tableBody.appendChild(tr); //Se le concatena la nueva fila creada

            });

            renderPagination();
        } catch (err) {
            console.error("Error cargando transportes: ", err);
        }
    }

    function renderPagination() {
        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";

        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${currentPage === 0 ? "disabled" : ""}`;
        prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
        prevLi.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage > 0) loadTransport(currentPage - 1);
        });
        pagination.appendChild(prevLi);

        for (let i = 0; i < totalPages; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === currentPage ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            li.addEventListener("click", (e) => {
                e.preventDefault();
                loadTransport(i);
            });
            pagination.appendChild(li);
        }

        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
        nextLi.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage < totalPages - 1) loadTransport(currentPage + 1);
        });
        pagination.appendChild(nextLi);
    }

    loadTransport();
}); 