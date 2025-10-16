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
    getServicioTransportePaginacion as getServicios,
    getServicioTransporte,
    createServicioTransporte as createServicio,
    updateServicioTransporte as updateServicio,
    deleteServicioTransporte as deleteServicio
} from "../Services/TransportServiceServices.js";

let currentPage = 0;
let totalPages = 0;
const pageSize = 5;

let allServicios = []; // Para validaciones en el cliente

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#servicesTable tbody");
    const form = document.getElementById("serviceForm");
    const modal = new bootstrap.Modal(document.getElementById("serviceModal"));
    const lblModal = document.getElementById("serviceModalLabel");
    const btnAdd = document.getElementById("btnAddService");
    let isEditing = false;

    // Abrir modal para agregar
    btnAdd.addEventListener("click", () => {
        form.reset();
        form.serviceId.value = "";
        isEditing = false;
        lblModal.textContent = "Agregar Servicio";
        modal.show();
    });

    // Validar formulario antes de enviar
    function validateForm(placa, tarjeta, capacidad, id = null) {
        if (!placa || !tarjeta || !capacidad) {
            Swal.fire("Error", "Todos los campos son obligatorios", "error");
            return false;
        }

        if (!/^[A-Z0-9-]+$/.test(placa)) {
            Swal.fire("Error", "La placa solo puede contener letras mayúsculas, números y guiones", "error");
            return false;
        }

        if (!/^[0-9]+$/.test(capacidad)) {
            Swal.fire("Error", "La capacidad debe ser un número válido", "error");
            return false;
        }

        if (allServicios.some(s => s.placa.toLowerCase() === placa.toLowerCase() && s.idServicioTransporte != id)) {
            Swal.fire("Error", "La placa ya existe", "error");
            return false;
        }

        if (allServicios.some(s => s.tarjetaCirculacion.toLowerCase() === tarjeta.toLowerCase() && s.idServicioTransporte != id)) {
            Swal.fire("Error", "La tarjeta de circulación ya existe", "error");
            return false;
        }

        return true;
    }

    // 📌 Guardar (crear o actualizar)
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = form.serviceId.value;
        const placa = form.servicePlaca.value.trim().toUpperCase();
        const tarjeta = form.serviceTarjeta.value.trim();
        const capacidad = form.serviceCapacidad.value.trim();

        if (!validateForm(placa, tarjeta, capacidad, id)) return;

        const data = { placa, tarjetaCirculacion: tarjeta, capacidad };

        try {
            let response;
            if (isEditing) {
                response = await updateServicio(id, data);
            } else {
                response = await createServicio(data);
            }

            Swal.fire({
                icon: response.status === "Éxito" ? "success" : "error",
                title: response.status === "Éxito" ? "Operación exitosa" : "Error",
                text: response.message || "Operación completada"
            });

            if (response.status === "Éxito") {
                modal.hide();
                await loadServicios(currentPage);
            }
        } catch (err) {
            console.error("❌ Error:", err);
            Swal.fire("Error", err.message || "Ocurrió un error", "error");
        }
    });

    // 📌 Cargar servicios con paginación
    async function loadServicios(page = 0, size = pageSize) {
        try {
            const response = await getServicios(page, size);
            const servicios = response.content || [];
            totalPages = response.totalPages || 1;
            currentPage = page;

            allServicios = servicios;

            tableBody.innerHTML = "";

            if (servicios.length === 0) {
                tableBody.innerHTML = '<td colspan="5">Actualmente no hay registros</td>';
                return;
            }

            servicios.forEach((s) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${s.idServicioTransporte}</td>
                    <td>${s.placa}</td>
                    <td>${s.tarjetaCirculacion}</td>
                    <td>${s.capacidad || ""}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary edit-btn">Editar</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn">Eliminar</button>
                    </td>
                `;

                // ✏️ Editar
                tr.querySelector(".edit-btn").addEventListener("click", () => {
                    form.serviceId.value = s.idServicioTransporte;
                    form.servicePlaca.value = s.placa;
                    form.serviceTarjeta.value = s.tarjetaCirculacion;
                    form.serviceCapacidad.value = s.capacidad || "";
                    lblModal.textContent = "Editar Servicio";
                    isEditing = true;
                    modal.show();
                });

                tr.querySelector(".delete-btn").addEventListener("click", () => {
                    Swal.fire({
                        title: "¿Desea eliminar este servicio?",
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#727475ff",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar"
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                const response = await deleteServicio(s.idServicioTransporte);

                                // Mostrar éxito si se elimina correctamente
                                Swal.fire(
                                    "Éxito",
                                    response.message || "Servicio eliminado correctamente",
                                    "success"
                                );

                                await loadServicios(currentPage);
                            } catch (err) {
                                const msg = err.message || "";

                                if (msg.includes("ORA-02292")) {
                                    Swal.fire(
                                        "No se puede eliminar",
                                        "Este servicio está asociado a otras órdenes y no se puede eliminar.",
                                        "error"
                                    );
                                } else {
                                    Swal.fire(
                                        "Error",
                                        "No se pudo eliminar el servicio",
                                        "error"
                                    );
                                }
                            }
                        }
                    });
                });

                tableBody.appendChild(tr);
            });

            renderPagination();
        } catch (err) {
            console.error("Error cargando servicios:", err);
            tableBody.innerHTML = '<td colspan="5"> Error al cargar servicios </td>';
        }
    }

    // 📌 Renderizar paginación
    function renderPagination() {
        const pagination = document.getElementById("pagination");
        if (!pagination) return;
        pagination.innerHTML = "";

        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${currentPage === 0 ? "disabled" : ""}`;
        prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
        prevLi.addEventListener("click", e => {
            e.preventDefault();
            if (currentPage > 0) loadServicios(currentPage - 1);
        });
        pagination.appendChild(prevLi);

        for (let i = 0; i < totalPages; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === currentPage ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            li.addEventListener("click", e => {
                e.preventDefault();
                loadServicios(i);
            });
            pagination.appendChild(li);
        }

        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
        nextLi.addEventListener("click", e => {
            e.preventDefault();
            if (currentPage < totalPages - 1) loadServicios(currentPage + 1);
        });
        pagination.appendChild(nextLi);
    }

    // 🚀 Inicial
    loadServicios();
});
