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
    createUsers,
    updateUsers,
    deleteUsers,
    getUsuarioPaginacion
} from "../Services/UserServices.js";

import {
    getRolByName,
    getRoles
} from "../Services/RolServices.js";

let currentPage = 0;
let totalPages = 0;
const pageSize = 10;

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#usersTable tbody"); //Tbody - Cuerpo de la tabla
    const form = document.getElementById("userForm");//Formulario dentro del modal
    const modal = new bootstrap.Modal(document.getElementById("userModal")); //Modal
    const lblModal = document.getElementById("userModalLabel"); // Titulo del modal
    const btnAdd = document.getElementById("btnAddUser");  //Boton para abrir modal
    const rolSelect = document.getElementById("userRol"); // <<-- esto faltaba

    //Cargar roles en el combo box
    async function loadRoles() {
        try {
            const roles = await getRoles();
            rolSelect.innerHTML = `<option value="">Seleccione un rol</option>`;
            roles.forEach(r => {
                rolSelect.innerHTML += `<option value="${r.idRol}">${r.rol}</option>`;
            });
        } catch (err) {
            console.error("Error cargando roles:", err);
        }
    }

    //Accion cuando el boton de Agregar nuevo usuario es presionado (Abrir modal)
    btnAdd.addEventListener("click", async () => {
        form.reset();
        form.userId.value = "";
        lblModal.textContent = "Agregar usuario";
        await loadRoles(); //llenar combo cuando abras el modal
        // 🔓 Habilitar campo de contraseña al agregar nuevo usuario
        form.userPassword.disabled = false;
        modal.show();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); //Evitamos que el formulario se envie al hacer "submit"


        // Construcción del objeto usuario
        const id = form.userId.value;
        const data = {
            usuario: form.userName.value.trim(),
            contrasenia: form.userPassword.value.trim(),
            idRol: form.userRol.value
        };

        // Validación de usuario
        const letrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
        const passRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*.,;:]).+$/; // al menos un número y un caracter especial

        // Validaciones con SweetAlert
        if (data.usuario && data.usuario.length > 20) {
            return Swal.fire("Error", "El usuario no debe superar los 20 caracteres.", "error");
        }

        if (!data.usuario || !data.contrasenia || !data.idRol) {
            return Swal.fire("Error", "Todos los campos son obligatorios.", "error");
        }

        if (data.usuario.length < 4) {
            return Swal.fire("Error", "El usuario debe tener al menos 4 caracteres.", "error");
        }

        if (data.contrasenia.length < 6) {
            return Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres.", "error");
        }

        if (!passRegex.test(data.contrasenia)) {
            return Swal.fire({
                icon: "warning",
                title: "⚠️ Contraseña insegura",
                text: "La contraseña debe contener al menos un número y un caracter especial."
            });
        }

        try {
            let response;
            if (id) {
                response = await updateUsers(id, data);
            } else {
                response = await createUsers(data);
            }

            // Si llegamos a esta parte, la operación fue exitosa
            Swal.fire({
                icon: "success",
                title: "Operación exitosa",
                text: response.message || "Usuario guardado correctamente."
            });

            // Cerrar modal y recargar tabla
            modal.hide();
            await loadUsers();

        } catch (err) {
            // Si hay un error, lo manejamos aquí
            console.error("Error: ", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message || "Ocurrió un problema al guardar el usuario."
            });
        }
    });

    async function loadUsers(page = 0, size = pageSize) {
        try {
            const response = await getUsuarioPaginacion(page, size);
            const users = response.content || [];
            totalPages = response.totalPages || 1;
            currentPage = page;

            tableBody.innerHTML = ""; //Vaciamos la tabla


            if (!users || users.length == 0) {
                tableBody.innerHTML = '<td colspan="5"> Actualmente no hay registros </td>'
                return;
            }

            users.forEach((us) => {
                const tr = document.createElement("tr"); //Se crea el elemento con JS
                tr.innerHTML = `
                <td>${us.idUsuario}</td>
                <td>${us.usuario}</td>
                <td>${us.rol}</td>
                <td>
                        <button class="btn btn-sm btn-outline-secondary edit-btn">Editar</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn">Eliminar</button>
                    </td>
                `;

                //Funcionalidad para el boton de editar
                tr.querySelector(".edit-btn").addEventListener("click", () => {
                    form.userId.value = us.idUsuario;
                    form.userName.value = us.usuario;
                    form.userPassword.value = us.contrasenia;

                    // 🔒 Deshabilitar campo de contraseña al editar
                    form.userPassword.value = "••••••"; // Mostrar puntos, no la real
                    form.userPassword.disabled = true;

                    loadRoles().then(() => {
                        rolSelect.value = us.idRol; //seleccionar rol correcto  
                    });

                    lblModal.textContent = "Editar usuario";
                    modal.show();
                });

                //Funcionalidad para los botones de Eliminar
                tr.querySelector(".delete-btn").addEventListener("click", () => {
                    Swal.fire({
                        title: "¿Desea eliminar este usuario?",
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#727475ff",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar"
                    }).then((resultado) => {
                        if (resultado.isConfirmed) {
                            deleteUsers(us.idUsuario).then(() => {
                                loadUsers(currentPage);
                                return Swal.fire({
                                    icon: "success",
                                    title: "Eliminado",
                                    text: "El usuario ha sido eliminado correctamente"
                                });
                            }).catch(() => {
                                return Swal.fire({
                                    icon: "error",
                                    title: "Error",
                                    text: "Ocurrió un problema al eliminar el usuario"
                                });
                            });
                        }
                    });
                });

                tableBody.appendChild(tr); //Se le concatena la nueva fila creada

            });

            renderPagination();
        } catch (err) {
            console.error("Error cargando usuarios: ", err);
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
            if (currentPage > 0) loadUsers(currentPage - 1);
        });
        pagination.appendChild(prevLi);

        for (let i = 0; i < totalPages; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === currentPage ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            li.addEventListener("click", (e) => {
                e.preventDefault();
                loadUsers(i);
            });
            pagination.appendChild(li);
        }

        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
        nextLi.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage < totalPages - 1) loadUsers(currentPage + 1);
        });
        pagination.appendChild(nextLi);
    }

    loadUsers();
}); 