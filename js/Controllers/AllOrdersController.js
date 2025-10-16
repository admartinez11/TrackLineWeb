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
    getOrdenesPaginacion,
    deleteOrden,
    deleteEncabezado,
    deleteInfoEmbarque,
    deleteAduana,
    deleteTransporte,
    deleteRecoleccion,
    deleteObservaciones,
    getOrdenById
} from "../Services/AllOrdersService.js";

import { getTrackingById } from "../Services/ProductTrackingService.js";

let currentPage = 0;
let totalPages = 0;
const pageSize = 15;

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#ordersTable tbody");
    const pagination = document.getElementById("pagination");
    const tabla = document.getElementById("ordersTable");

    if (!tabla) return;

    // 🔹 Función principal para cargar órdenes con paginación numérica
    async function loadOrdenes(page = 0, size = pageSize) {
        try {
            const response = await getOrdenesPaginacion(page, size);
            const ordenes = response.content || [];
            totalPages = response.totalPages || 1;
            currentPage = page;

            tableBody.innerHTML = "";

            if (ordenes.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Actualmente no hay órdenes</td></tr>';
                return;
            }

            ordenes.forEach(os => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${os.idOrdenServicio}</td>
                    <td>${os.clienteNIT}</td>
                    <td>
                        <div class="d-flex justify-content-center gap-2">
                            <button class="btn btn-sm btn-outline-secondary edit-btn">Editar</button>
                            <button class="btn btn-sm btn-outline-danger delete-btn">Eliminar</button>
                        </div>
                    </td>
                `;

                // 🟦 Botón Editar
                tr.querySelector(".edit-btn").addEventListener("click", async () => {
                    try {
                        const idOrden = os.idOrdenServicio || os.idOrden || os.id_orden_servicio;
                        console.log("🟢 ID a buscar:", idOrden);

                        // 🛑 PASO CLAVE 1: Limpiar localStorage antes de cargar la nueva orden
                        [
                            "ordenEdit",
                            "idOrdenServicio",
                            "idOrdenEncabezado",
                            "idAduana",
                            "idInfoEmbarque",
                            "idTransporte",
                            "idRecoleccion",
                            "idObservaciones"
                        ].forEach(key => localStorage.removeItem(key));


                        if (!idOrden) {
                            Swal.fire({ icon: "error", title: "Error", text: "No se encontró el ID de la orden." });
                            return;
                        }

                        const ordenCompleta = await getOrdenById(idOrden);
                        console.log("🟢 Orden completa:", ordenCompleta);

                        // Detectar si el backend devuelve data dentro o directamente
                        const data = ordenCompleta?.data || ordenCompleta;
                        if (!data || Object.keys(data).length === 0) {
                            Swal.fire({ icon: "error", title: "Error", text: "No se encontró información de la orden." });
                            return;
                        }

                        // Guardar en localStorage
                        localStorage.setItem("ordenEdit", JSON.stringify(data));
                        console.log("✅ Orden guardada en localStorage:", data);

                        // Guardar los IDs individuales
                        localStorage.setItem("idOrdenServicio", data.idOrdenServicio || "");
                        localStorage.setItem("idOrdenEncabezado", data.idOrdenEncabezado || "");
                        localStorage.setItem("idAduana", data.idAduana || "");
                        localStorage.setItem("idInfoEmbarque", data.idInfoEmbarque || "");
                        localStorage.setItem("idTransporte", data.idTransporte || "");
                        localStorage.setItem("idRecoleccion", data.idRecoleccion || "");
                        localStorage.setItem("idObservaciones", data.idObservaciones || "");

                        // Redirigir a la interfaz de edición
                        window.location.href = "ServiceOrder.html";

                    } catch (error) {
                        console.error("❌ Error al obtener la orden completa:", error);
                        Swal.fire({ icon: "error", title: "Error", text: "No se pudo cargar la orden." });
                    }
                });

                // 🟦 Botón Eliminar con cascada
                tr.querySelector(".delete-btn").addEventListener("click", async () => {
                    const confirmCancel = await Swal.fire({
                        title: "¿Estás seguro?",
                        text: "Se eliminará la orden y todos sus registros asociados.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#626262ff",
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar"
                    });

                    if (!confirmCancel.isConfirmed) return;

                    Swal.fire({
                        title: "Eliminando...",
                        text: "Por favor espere",
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading()
                    });

                    try {
                        const deleteTasks = [];

                        if (os.idRecoleccion) deleteTasks.push(deleteRecoleccion(os.idRecoleccion).catch(() => console.warn("Recolección no encontrada")));
                        if (os.idTransporte) deleteTasks.push(deleteTransporte(os.idTransporte).catch(() => console.warn("Transporte no encontrado")));
                        if (os.idAduana) deleteTasks.push(deleteAduana(os.idAduana).catch(() => console.warn("Aduana no encontrada")));
                        if (os.idInfoEmbarque) deleteTasks.push(deleteInfoEmbarque(os.idInfoEmbarque).catch(() => console.warn("InfoEmbarque no encontrado")));
                        if (os.idOrdenEncabezado) deleteTasks.push(deleteEncabezado(os.idOrdenEncabezado).catch(() => console.warn("Encabezado no encontrado")));
                        if (os.idObservaciones) deleteTasks.push(deleteObservaciones(os.idObservaciones).catch(() => console.warn("Observaciones no encontradas")));

                        await Promise.all(deleteTasks);
                        await deleteOrden(os.idOrdenServicio);

                        Swal.close();

                        await Swal.fire({
                            icon: "success",
                            title: "Orden cancelada",
                            text: "La orden de servicio ha sido eliminada correctamente"
                        });

                        loadOrdenes(currentPage);
                    } catch (error) {
                        console.error("Error al eliminar orden:", error);
                        Swal.close();
                        Swal.fire({
                            icon: "error",
                            title: "Error de conexión",
                            text: "Hubo un problema al eliminar la orden o sus registros asociados."
                        });
                    }
                });

                tableBody.appendChild(tr);
            });

            renderPagination();
        } catch (err) {
            console.error("Error cargando órdenes:", err);
        }
    }

    // 🔹 Paginador numérico estilo clientes
    function renderPagination() {
        pagination.innerHTML = "";

        // Botón anterior
        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${currentPage === 0 ? "disabled" : ""}`;
        prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
        prevLi.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage > 0) loadOrdenes(currentPage - 1);
        });
        pagination.appendChild(prevLi);

        // Números de página
        for (let i = 0; i < totalPages; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === currentPage ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
            li.addEventListener("click", (e) => {
                e.preventDefault();
                loadOrdenes(i);
            });
            pagination.appendChild(li);
        }

        // Botón siguiente
        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
        nextLi.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage < totalPages - 1) loadOrdenes(currentPage + 1);
        });
        pagination.appendChild(nextLi);
    }

    // 🔹 Cargar al iniciar
    loadOrdenes();
});