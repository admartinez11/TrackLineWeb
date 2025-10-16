// --- 1. Verificación de Autenticación (Se mantiene) ---
fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
    credentials: "include"
})
    .then(res => {
        if (!res.ok) throw new Error("No autorizado");
    })
    .catch(() => {
        window.location.href = "Login.html";
    });

// --- 2. Importaciones de Servicios (Actualizado) ---
import {
    createInfoEmbarque,
    updateInfoEmbarque,
} from "../Services/InfoEmbarqueService.js";

document.addEventListener('DOMContentLoaded', async () => {
    // --- 3. Referencias a elementos del DOM (Actualizado para Info Embarque) ---
    const facturas = document.getElementById('facturas');
    const proveedorRef = document.getElementById('proveedor');
    const bultos = document.getElementById('bultos');
    const tipo = document.getElementById('tipo');
    const kilos = document.getElementById('kilos');
    const volumen = document.getElementById('volumen');
    const btnAdd = document.getElementById("btnAddInfoEmbarque"); // ID del botón en HTML

    // --- ID de Referencia: idOrdenEncabezado (Se mantiene) ---
    const idOrdenEncabezado = localStorage.getItem("idOrdenEncabezado");

    // 🛑 CORRECCIÓN 2: Leer el ID de InfoEmbarque al cargar la página.
    let idInfoEmbarqueEnEdicion = localStorage.getItem("idInfoEmbarque");

    // --- Función de Validación Personalizada (Se mantiene) ---
    function validarInfoEmbarque() {
        if (!facturas.value.trim() || !proveedorRef.value.trim() || !bultos.value.trim()) {
            Swal.fire({
                icon: "error",
                title: "Campos obligatorios",
                text: "Debes ingresar al menos Facturas, Proveedor y Bultos."
            });
            return false;
        }
        if (facturas.value.length > 40) {
            Swal.fire("Error", "El campo 'Facturas' no debe superar los 40 caracteres.", "error");
            return false;
        }
        if (proveedorRef.value.length > 50) {
            Swal.fire("Error", "El campo 'Proveedor' no debe superar los 50 caracteres.", "error");
            return false;
        }
        if (isNaN(bultos.value) || parseInt(bultos.value) <= 0) {
            Swal.fire("Error", "El campo 'Bultos' debe ser un número válido mayor a 0.", "error");
            return false;
        }
        if (kilos.value && (isNaN(kilos.value) || parseFloat(kilos.value) <= 0)) {
            Swal.fire("Error", "El campo 'Kilos' debe ser un número válido mayor a 0.", "error");
            return false;
        }
        if (volumen.value && (isNaN(volumen.value) || parseFloat(volumen.value) <= 0)) {
            Swal.fire("Error", "El campo 'Volumen' debe ser un número válido mayor a 0.", "error");
            return false;
        }
        if (tipo.value.length > 50) {
            Swal.fire("Error", "El campo 'Tipo' no debe de tener más de 50 caracteres", "error")
            return false;
        }
        return true;
    }

    // --- 4. Guardar o Actualizar (Lógica Adaptada y Corregida) ---
    if (btnAdd) {
        btnAdd.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!validarInfoEmbarque()) return;

            // Asegúrate de que exista un Encabezado antes de intentar guardar la Info Embarque
            const currentIdOrdenEncabezado = localStorage.getItem("idOrdenEncabezado");
            if (!currentIdOrdenEncabezado || currentIdOrdenEncabezado === "null") {
                Swal.fire("Error", "Debe crear el Encabezado de la Orden primero.", "warning");
                return;
            }

            const data = {
                idOrdenEncabezado: parseInt(currentIdOrdenEncabezado),
                facturas: facturas.value.trim(),
                proveedorRef: proveedorRef.value.trim(),
                bultos: parseInt(bultos.value.trim()),
                tipo: tipo.value.trim() || null,
                kilos: parseFloat(kilos.value.trim()) || null,
                volumen: parseFloat(volumen.value.trim()) || null
            };

            // Vuelve a obtener el ID actual antes de la operación (por si se modificó)
            const currentIdInfoEmbarque = localStorage.getItem("idInfoEmbarque");

            try {
                let result;

                // Usamos currentIdInfoEmbarque para la verificación, que es el valor de localStorage
                if (currentIdInfoEmbarque && currentIdInfoEmbarque !== "null" && currentIdInfoEmbarque !== "undefined") {
                    // Modo Edición: Actualizar
                    result = await updateInfoEmbarque(currentIdInfoEmbarque, data);
                } else {
                    // Modo Creación: Crear
                    result = await createInfoEmbarque(data);

                    // 🛑 CORRECCIÓN 1: Guardar el nuevo ID después de la creación
                    if (result && result.data && result.data.idInfoEmbarque) {
                        // Actualizamos localStorage para que las siguientes veces sea UPDATE
                        localStorage.setItem("idInfoEmbarque", result.data.idInfoEmbarque);
                        // Opcional: actualizamos la variable local también
                        idInfoEmbarqueEnEdicion = result.data.idInfoEmbarque;
                    }
                }

                Swal.fire({
                    icon: "success",
                    title: "Información de Embarque guardada correctamente",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } catch (err) {
                console.error("❌ Error al guardar Info Embarque:", err);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: err.message || "No se pudo guardar la información de embarque",
                });
            }
        });
    }
});