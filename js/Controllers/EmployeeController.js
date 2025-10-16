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
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesPaginacion
} from "../Services/EmployeeServices.js";

import { getUserByUser } from "../Services/EmployeeUserServices.js";


let currentPage = 0;
let totalPages = 0;
const pageSize = 5;

let allEmployees = []; //Arreglo global para almacenar empleados


document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#employeesTable tbody"); //Tbody - Cuerpo de la tabla
    const form = document.getElementById("employeeForm");//Formulario dentro del modal
    const modal = new bootstrap.Modal(document.getElementById("employeeModal")); //Modal
    const lblModal = document.getElementById("employeeModalLabel"); // Titulo del modal
    const btnAdd = document.getElementById("btnAddEmployee");  //Boton para abrir modal
    let isEditing = false;  //Bandera global dentro del controlador

    //Accion cuando el boton de Agregar nuevo empleado es presionado (Abrir modal)
    btnAdd.addEventListener("click", () => {
        form.reset();
        form.employeeId.value = "";
        isEditing = false;
        lblModal.textContent = "Agregar empleado";
        modal.show();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); //Evitamos que el formulario se envie al hacer "submit"

        const formData = new FormData(form);
        const username = formData.get("employeeUser").trim();

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
            if (user.idRol !== 2) {
                return Swal.fire({
                    icon: "error",
                    title: "Error de rol",
                    text: "❌ Solo se pueden asignar empleados con rol Empleado"
                });
            }


            // Construcción del objeto empleado
            const id = form.employeeId.value;
            const data = {
                nombre: form.employeeName.value.trim(),
                apellido: form.employeeLastName.value.trim(),
                telefono: form.employeePhone.value.trim(),
                correo: form.employeeEmail.value.trim(),
                idUsuario: user.idUsuario,
                NIT: form.employeeNit.value.trim()
            };

            if (!data.nombre.match(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)) {
                return Swal.fire("Error", "El nombre es obligatorio y solo puede contener letras y espacios", "error");
            }
            if (data.apellido && !data.apellido.match(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)) {
                return Swal.fire("Error", "El apellido solo puede contener letras y espacios", "error");
            }
            if (data.telefono && !/^[0-9]{4}-[0-9]{4}$/.test(data.telefono)) {
                return Swal.fire("Error", "El teléfono debe tener el formato 0000-0000", "error");
            }
            if (data.correo && !data.correo.includes("@")) {
                return Swal.fire("Error", "El correo debe contener @", "error");
            }
            if (!data.NIT.match(/^[0-9]{4}-[0-9]{6}-[0-9]{3}-[0-9]{1}$/)) {
                return Swal.fire("Error", "El NIT es obligatorio y debe estar en formato ####-######-###-#", "error");
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
            if (data.apellido && data.apellido.length > 30) {
                return Swal.fire("Error", "El apellido no debe superar los 30 caracteres", "error");
            }
            if (data.correo && !data.correo.includes("@")) {
                return Swal.fire("Error", "El correo debe contener @", "error");
            }
            if (data.correo && !/^[\w.-]+@(gmail\.com|yahoo\.com|outlook\.com)$/.test(data.correo)) {
                return Swal.fire({
                    icon: "error",
                    title: "Error en correo",
                    text: "El correo solo puede ser de dominio @gmail.com, @yahoo.com o @outlook.com"
                });
            }

            // Validar NIT único (solo cuando es agregar, no editar)
            if (!isEditing) {
                const nitExists = allEmployees.some(e => e.employeeNit === data.NIT);
                if (nitExists) {
                    return Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Ya existe un empleado registrado con este NIT"
                    });
                }
            }


            // Guardar empleado
            let response;
            if (isEditing) {
                response = await updateEmployee(id, data);
            } else {
                response = await createEmployee(data);
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
                await loadEmployees();
            }

        } catch (err) {
            console.error("❌ Error: ", err);
            Swal.fire({
                icon: "error",
                title: "Error inesperado",
                text: err.message || "Error al guardar el empleado"
            });
        }
    });

    async function loadEmployees(page = 0, size = pageSize) {
        try {
            const response = await getEmployeesPaginacion(page, size);
            const employees = response.content || [];
            totalPages = response.totalPages || 1;
            currentPage = page; 

            allEmployees = employees; // Actualizar el arreglo global

            tableBody.innerHTML = ""; //Vaciamos la tabla

            if (!employees || employees.length == 0) {
                tableBody.innerHTML = '<td colspan="5"> Actualmente no hay registros </td>'
                return;
            }

            employees.forEach((emp) => {
                const tr = document.createElement("tr"); //Se crea el elemento con JS
                tr.innerHTML = `
                <td>${emp.idEmpleado}</td>
                <td>${emp.nombre}</td>
                <td>${emp.apellido}</td>
                <td>${emp.telefono}</td>
                <td>${emp.correo}</td>
                <td>${emp.usuario}</td>
                <td>${emp.NIT}</td>
                <td>
                        <button class="btn btn-sm btn-outline-secondary edit-btn">Editar</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn">Eliminar</button>
                    </td>
                `;

                //Funcionalidad para el boton de editar
                tr.querySelector(".edit-btn").addEventListener("click", () => {
                    form.employeeId.value = emp.idEmpleado;
                    form.employeeName.value = emp.nombre;
                    form.employeeLastName.value = emp.apellido;
                    form.employeePhone.value = emp.telefono;
                    form.employeeEmail.value = emp.correo;
                    form.employeeUser.value = emp.usuario;
                    form.employeeNit.value = emp.NIT;
                    lblModal.textContent = "Editar empleado";

                    isEditing = true; 

                    //El modal se carga hasta que el formulario ya tenga los datos cargados
                    modal.show();
                });

                //Funcionalidad para los botones de Eliminar
                tr.querySelector(".delete-btn").addEventListener("click", () => {
                    Swal.fire({
                        title: "¿Desea eliminar este empleado?",
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#727475ff",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar"
                    }).then((resultado) => {
                        if (resultado.isConfirmed) {
                            deleteEmployee(emp.idEmpleado).then(() => {
                                loadEmployees(currentPage);
                                return Swal.fire({
                                    icon: "success",
                                    title: "Eliminado",
                                    text: "El empleado ha sido eliminado correctamente"
                                });
                            }).catch(() => {
                                return Swal.fire({
                                    icon: "error",
                                    title: "Error",
                                    text: "Ocurrió un problema al eliminar el empleado"
                                });
                            });
                        }
                    });
                });

                tableBody.appendChild(tr); //Se le concatena la nueva fila creada
            });

            renderPagination(); 
        } catch (err) {
            console.error("Error cargando empleados: ", err);
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
            if (currentPage > 0) loadEmployees(currentPage - 1);
        });
        pagination.appendChild(prevLi);

        for (let i = 0; i < totalPages; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === currentPage ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            li.addEventListener("click", (e) => {
                e.preventDefault();
                loadEmployees(i);
            });
            pagination.appendChild(li);
        }

        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
        nextLi.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage < totalPages - 1) loadEmployees(currentPage + 1);
        });
        pagination.appendChild(nextLi);
    }

    loadEmployees();

}); 