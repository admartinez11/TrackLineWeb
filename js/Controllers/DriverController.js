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
    getDrivers,
    createDriver,
    updateDriver,
    deleteDriver
} from "../Services/DriverServices.js";

import { getUserByUser } from "../Services/DriverUserServices.js";

let allDrivers = [];

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#driversTable tbody"); //Tbody - Cuerpo de la tabla
    const form = document.getElementById("driverForm");//Formulario dentro del modal
    const modal = new bootstrap.Modal(document.getElementById("driverModal")); //Modal
    const lblModal = document.getElementById("driverModalLabel"); // Titulo del modal
    const btnAdd = document.getElementById("btnAddDriver");  //Boton para abrir modal
    let isEditing = false;  //Bandera global dentro del controlador
    //const paginacionDiv = document.getElementById("paginacion");
    init(); //Aun no existe


    //Accion cuando el boton de Agregar nuevo transportista es presionado (Abrir modal)
    btnAdd.addEventListener("click", () => {
        form.reset();
        form.driverId.value = "";
        isEditing = false;
        lblModal.textContent = "Agregar transportista";
        modal.show();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); //Evitamos que el formulario se envie al hacer "submit"

        const formData = new FormData(form);
        const username = formData.get("driverUser").trim();

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
            if (user.idRol !== 4) {
                return Swal.fire({
                    icon: "error",
                    title: "Error de rol",
                    text: "❌ Solo se pueden asignar transportistas con rol Transportista"
                });
            }

            // Construcción del objeto transportista
            const id = form.driverId.value;
            const data = {
                nombre: form.driverName.value.trim(),
                apellido: form.driverLastName.value.trim(),
                telefono: form.driverPhone.value.trim(),
                correo: form.driverEmail.value.trim(),
                idUsuario: user.idUsuario,
                NIT: form.driverNit.value.trim()
            };


            for (const [key, value] of Object.entries(data)) {
                if (!value) {
                    return Swal.fire("Error", `El campo ${key.toUpperCase()} es obligatorio`, "error");
                }
            }
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
                const nitExists = allDrivers.some(d => d.driverNit === data.NIT);
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
                response = await updateDriver(id, data);
            } else {
                response = await createDriver(data);
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
                await loadDrivers();
            }

        } catch (err) {
            console.error("❌ Error: ", err);
            Swal.fire({
                icon: "error",
                title: "Error inesperado",
                text: err.message || "Error al guardar el transportista"
            });
        }
    });

    async function loadDrivers() {
        try {
            const drivers = await getDrivers();

            allDrivers = drivers;

            tableBody.innerHTML = ""; //Vaciamos la tabla

            if (!drivers || drivers.length == 0) {
                tableBody.innerHTML = '<td colspan="5"> Actualmente no hay registros </td>'
                return;
            }

            drivers.forEach((trans) => {
                const tr = document.createElement("tr"); //Se crea el elemento con JS
                tr.innerHTML = `
                <td>${trans.idTransportista}</td>
                <td>${trans.nombre}</td>
                <td>${trans.apellido}</td>
                <td>${trans.telefono}</td>
                <td>${trans.correo}</td>
                <td>${trans.nombreUsuario}</td>
                <td>${trans.NIT}</td>
                <td>
                        <button class="btn btn-sm btn-outline-secondary edit-btn">Editar</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn">Eliminar</button>
                    </td>
                `;

                //Funcionalidad para el boton de editar
                tr.querySelector(".edit-btn").addEventListener("click", () => {
                    form.driverId.value = trans.idTransportista;
                    form.driverName.value = trans.nombre;
                    form.driverLastName.value = trans.apellido;
                    form.driverPhone.value = trans.telefono;
                    form.driverEmail.value = trans.correo;
                    form.driverUser.value = trans.nombreUsuario;
                    form.driverNit.value = trans.NIT;
                    lblModal.textContent = "Editar transportista";

                    isEditing = true;

                    //El modal se carga hasta que el formulario ya tenga los datos cargados
                    modal.show();
                });

                //Funcionalidad para los botones de Eliminar
                tr.querySelector(".delete-btn").addEventListener("click", () => {
                    Swal.fire({
                        title: "¿Desea eliminar este transportista?",
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#727475ff",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar"
                    }).then(async (resultado) => {
                        if (resultado.isConfirmed) {
                            try {
                                const res = await deleteDriver(trans.idTransportista);
                                if (res.status === "Éxito") {
                                    await loadDrivers(); // Recarga la tabla
                                    Swal.fire({
                                        icon: "success",
                                        title: "Eliminado",
                                        text: "El transportista ha sido eliminado correctamente"
                                    });
                                }
                            } catch (err) {
                                console.error(err);
                                Swal.fire({
                                    icon: "error",
                                    title: "Error",
                                    text: "Ocurrió un problema al eliminar el transportista"
                                });
                            }
                        }
                    });
                });

                tableBody.appendChild(tr); //Se le concatena la nueva fila creada

            });


        } catch (err) {
            console.error("Error cargando transportista: ", err);
        }
    }

    function init() {
        loadDrivers();
    }

}); //Esto no se toca