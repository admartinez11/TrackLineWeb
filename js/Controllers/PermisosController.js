fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
    credentials: "include"
})
    .then(res => {
        if (!res.ok) throw new Error("No autorizado");
    })

    .catch(() => {
        window.location.href = "Login.html";
    });

// ===================== 2. IMPORTAR SERVICIOS =====================
import {
    getPermisos,
    createPermiso,
    createOrdenPermiso
} from "../Services/PermisosService.js";

// ===================== INICIO DEL CONTROLADOR =====================
document.addEventListener("DOMContentLoaded", () => {

    // --- Referencias de DOM ---
    const permisosContainer = document.getElementById("permisos-checkboxes-container");
    const btnAñadirPermiso = document.getElementById("btnAñadirPermiso");
    const btnGuardar = document.getElementById("btnGuardarPermiso");
    const modalPermisos = document.getElementById("modalPermisos");
    const frmAgregarPermisos = document.getElementById("frmAgregarPermisos");
    const inputModalPermisos = document.getElementById("input-modal-permisos");
    const btnCerrarPermisos = document.getElementById("btnCerrarPermisos");
    // Asumo que este ID existe en tu HTML para el botón dentro del modal
    const btnGuardarNuevoPermiso = document.getElementById("btnGuardarNuevoPermiso");

    // --- IDs de Referencia y Persistencia ---
    // El ID de la Orden de Servicio es CRÍTICO para la carga y guardado.
    const idOrdenServicio = localStorage.getItem("idOrdenServicio");

    // --- Variables de estado ---
    // Almacenará los IDs de las relaciones ya existentes { idPermiso: idOrdenPermisos }
    let assignedPermisosMap = new Map();

    // 🧩 Función para cerrar y limpiar modal
    function cerrarModalPermisos() {
        modalPermisos.style.display = "none";
        frmAgregarPermisos?.reset();
    }

    // ======================================================================
    // 🔹 Carga de Permisos y Marcado para Edición
    // ======================================================================
    async function cargarPermisos() {
        if (!permisosContainer) return;

        try {
            permisosContainer.innerHTML = "<p>Cargando permisos...</p>";

            // 1. Obtener todos los permisos disponibles (Maestro)
            const masterPermisos = await getPermisos();

            // 2. Obtener los permisos ASIGNADOS a la orden (si existe idOrdenServicio)
            let assignedPermisos = [];
            if (idOrdenServicio && idOrdenServicio !== "null") {
                // Mapea la lista de asignados para tener { idPermiso: idOrdenPermisos }
                assignedPermisosMap = new Map(assignedPermisos.map(op => [Number(op.idPermiso), op.idOrdenPermisos]));
            } else {
                console.log("Modo nueva orden. No se cargan permisos asignados.");
            }

            // 3. Renderizar y marcar
            permisosContainer.innerHTML = "";
            masterPermisos.forEach(p => {
                const id = Number(p.idPermiso);
                const label = document.createElement("label");
                const checkbox = document.createElement("input");

                checkbox.type = "checkbox";
                checkbox.dataset.id = id;
                checkbox.dataset.name = p.nombrePermiso;

                // Marca el checkbox si existe una relación para este permiso
                if (assignedPermisosMap.has(id)) {
                    checkbox.checked = true;
                }

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(" " + p.nombrePermiso));
                permisosContainer.appendChild(label);
            });
        } catch (err) {
            console.error("Error al cargar permisos:", err);
            permisosContainer.innerHTML = `<p>Error al cargar permisos. ${err.message || ""}</p>`;
        }
    }

    cargarPermisos();

    // ======================================================================
    // 🔹 Lógica para GUARDAR/SINCRONIZAR permisos (Crear y Eliminar)
    // ======================================================================
    btnGuardar?.addEventListener("click", async () => {
        if (!idOrdenServicio || idOrdenServicio === "null") {
            Swal.fire({ icon: "error", title: "Error", text: "No se encontró ID de orden de servicio. Debe guardar el encabezado primero." });
            return;
        }

        const checkboxes = permisosContainer.querySelectorAll("input[type='checkbox']");

        // IDs de los permisos que el usuario QUIERE que existan
        const selectedPermisoIds = new Set(
            Array.from(checkboxes).filter(cb => cb.checked).map(cb => Number(cb.dataset.id))
        );

        // IDs que ya existen en la base de datos (clave de nuestro Map)
        const currentAssignedPermisoIds = new Set(assignedPermisosMap.keys());

        // Operaciones a realizar
        const toCreate = Array.from(selectedPermisoIds).filter(id => !currentAssignedPermisoIds.has(id));
        const toDelete = Array.from(currentAssignedPermisoIds).filter(id => !selectedPermisoIds.has(id));

        const operationPromises = [];
        let errorCount = 0;

        try {
            // 1. ELIMINAR permisos que ya no están seleccionados
            for (const idPermisoToDelete of toDelete) {
                const idOrdenPermisos = assignedPermisosMap.get(idPermisoToDelete);
                // Usamos el ID de la relación intermedia para eliminar
                operationPromises.push(deleteOrdenPermiso(idOrdenPermisos).then(() => {
                    assignedPermisosMap.delete(idPermisoToDelete); // Elimina del Map de control
                }).catch(err => {
                    console.error(`Error al eliminar OrdenPermiso ID ${idOrdenPermisos}:`, err);
                    errorCount++;
                }));
            }

            // 2. CREAR nuevos permisos seleccionados
            for (const idPermisoToCreate of toCreate) {
                operationPromises.push(createOrdenPermiso({
                    idPermiso: idPermisoToCreate,
                    idOrdenServicio: idOrdenServicio,
                    marcado: 1, // Asumo que 1 es 'marcado'
                }).then(newOrdenPermiso => {
                    // Agrega la nueva relación al Map de control
                    assignedPermisosMap.set(Number(newOrdenPermiso.idPermiso), newOrdenPermiso.idOrdenPermisos);
                }).catch(err => {
                    console.error(`Error al crear OrdenPermiso para ID ${idPermisoToCreate}:`, err);
                    errorCount++;
                }));
            }

            // Esperar a que todas las operaciones terminen
            await Promise.allSettled(operationPromises);

            if (errorCount > 0) {
                Swal.fire({
                    icon: "error",
                    title: "Sincronización Incompleta",
                    text: `La sincronización terminó con ${errorCount} errores. Por favor, revisa la consola.`
                });
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Sincronizado",
                    text: "Permisos guardados y actualizados correctamente."
                });
            }

        } catch (error) {
            console.error("Error durante la sincronización de permisos:", error);
            Swal.fire({
                icon: "error",
                title: "Error General",
                text: "Ocurrió un error inesperado al guardar los permisos."
            });
        }
    });

    // ======================================================================
    // 🔹 Lógica para AÑADIR NUEVO PERMISO (Maestro)
    // ======================================================================

    btnAñadirPermiso?.addEventListener("click", () => {
        inputModalPermisos.value = ""; // limpia al abrir
        modalPermisos.style.display = "block";
    });

    btnCerrarPermisos?.addEventListener("click", cerrarModalPermisos);

    btnGuardarNuevoPermiso?.addEventListener("click", async () => {
        const nuevoPermiso = inputModalPermisos.value.trim();
        if (!nuevoPermiso) {
            Swal.fire({ icon: "error", title: "Error", text: "El nombre del permiso no puede estar vacío." });
            return;
        }

        const confirmacion = await Swal.fire({
            title: "¿Deseas agregar este permiso?",
            html: `<b>${nuevoPermiso}</b><br><br><small>⚠️ El permiso se agregará a la lista global.</small>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, agregar",
            cancelButtonText: "Cancelar",
            reverseButtons: true
        });

        if (!confirmacion.isConfirmed) return;

        try {
            // Llama al servicio para crear el permiso maestro
            const permisoCreado = await createPermiso({ nombrePermiso: nuevoPermiso });

            // Agregar el nuevo permiso a la lista (sin recargar todo)
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.dataset.id = permisoCreado.idPermiso;
            checkbox.dataset.name = permisoCreado.nombrePermiso;
            checkbox.checked = false; // No se marca por defecto para la orden actual

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + permisoCreado.nombrePermiso));
            permisosContainer.appendChild(label);

            cerrarModalPermisos();

            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "Permiso añadido correctamente y disponible para seleccionar."
            });
        } catch (error) {
            console.error("Error al agregar permiso:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "No se pudo agregar el permiso."
            });
        }
    });
});