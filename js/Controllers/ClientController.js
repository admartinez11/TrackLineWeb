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
    getClient,
    createClient,
    updateClient,
    deleteClient,
    getClientsPaginacion
} from "../Services/ClientServices.js";

import { getUserByUser } from "../Services/ClientUserServices.js";

import {
    getType
} from "../Services/ClientTypeServices.js";

let currentPage = 0;
let totalPages = 0;
const pageSize = 5;

let allClients = []; //Arreglo global para almacenar los clientes


document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#clientsTable tbody"); //Tbody - Cuerpo de la tabla
    const form = document.getElementById("clientForm");//Formulario dentro del modal
    const modal = new bootstrap.Modal(document.getElementById("clientModal")); //Modal
    const lblModal = document.getElementById("clientModalLabel"); // Titulo del modal
    const btnAdd = document.getElementById("btnAddClient");  //Boton para abrir modal
    const typeSelect = document.getElementById("clientType"); // <<-- esto faltaba
    const clientNameInput = document.getElementById("clientName");       // Nombre completo
    const clientLastNameInput = document.getElementById("clientLastName"); // Nombre empresa
    let isEditing = false;  //Bandera global dentro del controlador

    //Cargar tipo Cliente en el combo box
    async function loadTypeClients() {
        try {
            const tipos = await getType();
            typeSelect.innerHTML = `<option value="">Seleccione</option>`;
            tipos.forEach(t => {
                typeSelect.innerHTML += `<option value="${t.idTipoCliente}">${t.tipo}</option>`;
            });
        } catch (err) {
            console.error("Error cargando tipo de cliente:", err);
        }
    }

    // Escuchar cambios en el tipo de cliente
    typeSelect.addEventListener("change", () => {
        const selected = typeSelect.value;

        if (selected === "1") {
            // Si es tipo 1, Inhabilitar Nombre Empresa, habilitar Nombre Completo
            clientLastNameInput.disabled = true;
            clientLastNameInput.value = ""; // Limpia su contenido
            clientNameInput.disabled = false;
        }
        else if (selected === "2") {
            // Si es tipo 2, Inhabilitar Nombre Completo, habilitar Nombre Empresa
            clientNameInput.disabled = true;
            clientNameInput.value = "";
            clientLastNameInput.disabled = false;
        }
        else {
            // Si no hay selección, habilita ambos
            clientNameInput.disabled = false;
            clientLastNameInput.disabled = false;
        }
    });


    //Accion cuando el boton de Agregar nuevo cliente es presionado (Abrir modal)
    btnAdd.addEventListener("click", () => {
        form.reset();
        form.clientNit.value = "";
        isEditing = false;
        lblModal.textContent = "Agregar cliente";
        modal.show();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); //Evitamos que el formulario se envie al hacer "submit"

        const formData = new FormData(form);
        const username = formData.get("clientUser").trim();

        if (!username) {
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El usuario es obligatorio'
            });
        }

        try {
            // Buscar usuario en backend por nombre
            const userResponse = await getUserByUser(username);

            // Validar respuesta
            if (!userResponse || userResponse.status !== "Éxito" || !userResponse.data) {
                return Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "El usuario ingresado no existe en la base de datos"
                });
            }

            // Extraer usuario válido
            const user = userResponse.data;

            // VALIDAR ROL DEL USUARIO
            if (user.idRol !== 3) {
                return Swal.fire({
                    icon: "error",
                    title: "Error de rol",
                    text: "Solo se pueden asignar clientes con rol Cliente"
                });
            }


            // Construcción del objeto cliente
            const nit = form.clientNit.value;
            const data = {
                idTipoCliente: form.clientType.value,
                nombre: form.clientName.value.trim(),
                apellido: form.clientLastName.value.trim(),
                telefono: form.clientPhone.value.trim(),
                correo: form.clientEmail.value.trim(),
                codEmpresa: form.clientCode.value.trim(),
                idUsuario: user.idUsuario
            };


            // Validaciones
            if (data.idTipoCliente === "1") {
                // Tipo 1: nombre completo obligatorio
                if (!data.nombre.trim()) {
                    return Swal.fire("Error", "El nombre completo es obligatorio para este tipo de cliente", "error");
                }
            } else if (data.idTipoCliente === "2") {
                // Tipo 2: nombre de empresa obligatorio
                if (!data.apellido.trim()) {
                    return Swal.fire("Error", "El nombre de empresa es obligatorio para este tipo de cliente", "error");
                }
            }
            // Validar formato del nombre completo solo si existe
            if (data.nombre && !data.nombre.match(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)) {
                return Swal.fire("Error", "El nombre solo puede contener letras y espacios", "error");
            }
            // Validar formato del nombre de empresa solo si existe
            if (data.apellido && !data.apellido.match(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/)) {
                return Swal.fire("Error", "El nombre de empresa solo puede contener letras, números y espacios", "error");
            }
            if (data.telefono && !/^[0-9]{4}-[0-9]{4}$/.test(data.telefono)) {
                return Swal.fire("Error", "El teléfono debe tener el formato 0000-0000", "error");
            }
            if (data.correo && !data.correo.includes("@")) {
                return Swal.fire("Error", "El correo debe contener @", "error");
            }
            if (!nit.match(/^[0-9]{4}-[0-9]{6}-[0-9]{3}-[0-9]{1}$/)) {
                return Swal.fire("Error", "El NIT es obligatorio y debe estar en formato ####-######-###-#", "error");
            }
            if (!data.idTipoCliente) {
                return Swal.fire("Error", "Tipo cliente es obligatorio.", "error");
            }
            if (!data.idUsuario) {
                return Swal.fire("Error", "El usuario es obligatorio", "error");
            }
            if (data.correo && data.correo.length > 50) {
                return Swal.fire("Error", "El correo no debe superar los 50 caracteres", "error");
            }
            if (data.nombre && data.nombre.length > 30) {
                return Swal.fire("Error", "El nombre no debe superar los 30 caracteres", "error");
            }
            if (data.apellido && data.apellido.length > 50) {
                return Swal.fire("Error", "El nombre de empresa no debe superar los 50 caracteres", "error");
            }
            if (data.codEmpresa && data.codEmpresa.length > 50) {
                return Swal.fire("Error", "El código de empresa no debe superar los 50 caracteres", "error");
            }
            if (data.correo && !data.correo.includes("@")) {
                return Swal.fire("Error", "El correo debe contener @", "error");
            }

            // 🔹 Validación de NIT único (solo cuando es agregar, no editar)
            if (!isEditing) {
                const nitExists = allClients.some(c => c.clienteNit === nit);
                if (nitExists) {
                    return Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Ya existe un cliente registrado con este NIT"
                    });
                }
            }


            // Guardar cliente
            let response;
            if (isEditing) {
                response = await updateClient(nit, data);
            } else {
                data.clienteNit = nit;
                response = await createClient(data);
            }

            // Mostrar resultado con SweetAlert2
            Swal.fire({
                icon: response.status === "Éxito" ? "success" : "error",
                title: response.status === "Éxito" ? "Operación exitosa" : "Error",
                text: response.mensaje || "Operación completada"
            });

            // Si fue éxito → cerrar modal y recargar tabla
            if (response.status === "Éxito") {
                modal.hide();
                await loadClients(currentPage);
            }

        } catch (err) {
            console.error("Error: ", err);
            Swal.fire({
                icon: "error",
                title: "Error inesperado",
                text: err.message || "Error al guardar el cliente"
            });
        }
    });

    async function loadClients(page = 0, size = pageSize) {
        try {
            const response = await getClientsPaginacion(page, size);
            const clients = response.content || [];
            totalPages = response.totalPages || 1;
            currentPage = page;
            allClients = clients; // Actualizar el arreglo global

            tableBody.innerHTML = "";

            if (clients.length === 0) {
                tableBody.innerHTML = '<td colspan="8" class="text-center">Actualmente no hay clientes</td>';
                return;
            }

            clients.forEach((cli) => {
                const tr = document.createElement("tr"); //Se crea el elemento con JS
                tr.innerHTML = `
                <td>${cli.clienteNit}</td>
                <td>${cli.tipo}</td>
                <td>${cli.nombre}</td>
                <td>${cli.apellido}</td>
                <td>${cli.telefono}</td>
                <td>${cli.correo}</td>
                <td>${cli.codEmpresa}</td>
                <td>${cli.usuario}</td>
                <td>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary edit-btn">Editar</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn">Eliminar</button>
                    </div>
                </td>
                `;

                //Funcionalidad para el boton de editar
                tr.querySelector(".edit-btn").addEventListener("click", () => {
                    form.clientNit.value = cli.clienteNit;
                    form.clientName.value = cli.nombre;
                    form.clientLastName.value = cli.apellido;
                    form.clientPhone.value = cli.telefono;
                    form.clientEmail.value = cli.correo;
                    form.clientUser.value = cli.usuario;
                    form.clientCode.value = cli.codEmpresa;

                    loadTypeClients().then(() => {
                        typeSelect.value = cli.idTipoCliente; //seleccionar tipo correcto
                    });

                    lblModal.textContent = "Editar cliente";

                    isEditing = true;
                    lblModal.textContent = "Editar cliente";
                    //El modal se carga hasta que el formulario ya tenga los datos cargados
                    modal.show();
                });

                tr.querySelector(".delete-btn").addEventListener("click", () => {
                    Swal.fire({
                        title: "¿Desea eliminar este cliente?",
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#727475ff",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar"
                    }).then((resultado) => {
                        if (resultado.isConfirmed) {
                            deleteClient(cli.clienteNit).then(() => {
                                loadClients(currentPage);
                                return Swal.fire({
                                    icon: "success",
                                    title: "Eliminado",
                                    text: "El cliente ha sido eliminado correctamente"
                                });
                            }).catch(() => {
                                return Swal.fire({
                                    icon: "error",
                                    title: "Error",
                                    text: "Ocurrió un problema al eliminar el cliente"
                                });
                            });
                        }
                    });
                });

                tableBody.appendChild(tr); //Se le concatena la nueva fila creada

            });

            renderPagination();
        } catch (err) {
            console.error("Error cargando clientes: ", err);
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
            if (currentPage > 0) loadClients(currentPage - 1);
        });
        pagination.appendChild(prevLi);

        for (let i = 0; i < totalPages; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === currentPage ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            li.addEventListener("click", (e) => {
                e.preventDefault();
                loadClients(i);
            });
            pagination.appendChild(li);
        }

        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
        nextLi.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage < totalPages - 1) loadClients(currentPage + 1);
        });
        pagination.appendChild(nextLi);
    }

    loadClients(); //Cargar clientes al iniciar
    loadTypeClients(); //Cargar tipos de cliente al iniciar

}); //Esto no se toca