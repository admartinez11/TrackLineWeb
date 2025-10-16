fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
    credentials: "include"
})
    .then(res => {
        if (!res.ok) throw new Error("No autorizado");
    })
    .catch(() => {
        window.location.href = "Login.html";
    });

import { createOrden, updateOrden, getEncabezadoById } from "../Services/EncabezadoService.js";

document.addEventListener('DOMContentLoaded', async () => {
    // --- Referencias a elementos del DOM ---
    const fecha = document.getElementById('fecha');
    const encargado1 = document.getElementById('encargado1');
    const referencia = document.getElementById('referencia');
    const importador = document.getElementById('importador');
    const nit1 = document.getElementById('nit1');
    const registroIva1 = document.getElementById('registroIVA1');
    const facturarA = document.getElementById('facturarA');
    const encargado2 = document.getElementById('encargado2');
    const nit2 = document.getElementById('nit2');
    const registroIva2 = document.getElementById('registroIVA2');
    const btnAdd = document.getElementById('submitEncabezado');

    // Se mantiene para usar en la función Guardar/Actualizar
    const idOrdenEncabezado = localStorage.getItem("idOrdenEncabezado");

    // --- Fecha: solo hoy ---
    if (fecha) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const todayStr = `${yyyy}-${mm}-${dd}`;
        fecha.setAttribute("min", todayStr);
        fecha.setAttribute("max", todayStr);
    }

    // --- Formatear fecha para backend en dd-MM-yyyy ---
    function formatDateDDMMYYYY(dateStr) {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // --- Convertir fecha del backend (DD-MM-YYYY) al formato del input (YYYY-MM-DD) ---
    function convertirFechaAInput(fechaStr) {
        if (!fechaStr) return "";
        const [dia, mes, año] = fechaStr.split("-");
        return `${año}-${mes}-${dia}`;
    }

    // --- Validación personalizada ---
    function validarEncabezado() {
        const regexNIT = /^[0-9A-Za-z-]{1,18}$/;
        const regexIVA = /^.{1,10}$/;

        if (!fecha.value || !encargado1.value.trim() || !importador.value.trim()) {
            Swal.fire({
                icon: "error",
                title: "Campos obligatorios",
                text: "Los campos Fecha, Encargado e Importador son obligatorios."
            });
            return false;
        }
        if (encargado1.value.trim().length > 100) {
            Swal.fire("Error", "El 'Encargado' no debe superar los 100 caracteres.", "error");
            return false;
        }
        if (referencia.value && referencia.value.length > 20) {
            Swal.fire("Error", "La 'Referencia' no debe superar los 20 caracteres.", "error");
            return false;
        }
        if (importador.value.trim().length > 100) {
            Swal.fire("Error", "El 'Importador' no debe superar los 100 caracteres.", "error");
            return false;
        }
        if (nit1.value && !regexNIT.test(nit1.value)) {
            Swal.fire("Error", "El NIT 1 debe tener máximo 18 caracteres (letras, números o guiones).", "error");
            return false;
        }
        if (registroIva1.value && !regexIVA.test(registroIva1.value)) {
            Swal.fire("Error", "El Registro IVA 1 debe tener máximo 10 caracteres.", "error");
            return false;
        }
        if (facturarA.value && facturarA.value.length > 20) {
            Swal.fire("Error", "El campo 'Facturar A' no debe superar los 20 caracteres.", "error");
            return false;
        }
        if (encargado2.value && encargado2.value.length > 100) {
            Swal.fire("Error", "El 'Encargado 2' no debe superar los 100 caracteres.", "error");
            return false;
        }
        if (nit2.value && !regexNIT.test(nit2.value)) {
            Swal.fire("Error", "El NIT 2 debe tener máximo 18 caracteres (letras, números o guiones).", "error");
            return false;
        }
        if (registroIva2.value && !regexIVA.test(registroIva2.value)) {
            Swal.fire("Error", "El Registro IVA 2 debe tener máximo 10 caracteres.", "error");
            return false;
        }
        return true;
    }

    // --- Guardar o Actualizar ---
    btnAdd.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!validarEncabezado()) return;

        const data = {
            fecha: formatDateDDMMYYYY(fecha.value),
            encargado: encargado1.value.trim(),
            referencia: referencia.value.trim() || null,
            importador: importador.value.trim(),
            NIT: nit1.value.trim() || null,
            registroIVA: registroIva1.value.trim() || null,
            facturaA: facturarA.value.trim() || null,
            encargado2: encargado2.value.trim() || null,
            NIT2: nit2.value.trim() || null,
            registroIVA2: registroIva2.value.trim() || null,
        };

        // Volver a obtener el ID actual justo antes de guardar (por si fue creado)
        const currentIdOrdenEncabezado = localStorage.getItem("idOrdenEncabezado");

        try {
            let ordenResult;
            if (currentIdOrdenEncabezado && currentIdOrdenEncabezado !== "null" && currentIdOrdenEncabezado !== "undefined") {
                // Modo Edición: Actualizar
                ordenResult = await updateOrden(currentIdOrdenEncabezado, data);
            } else {
                // Modo Creación: Crear y guardar el nuevo ID
                ordenResult = await createOrden(data);
                // 🛑 Guardar el nuevo ID de encabezado para futuras actualizaciones
                localStorage.setItem("idOrdenEncabezado", ordenResult.data.idOrdenEncabezado);
            }

            Swal.fire({
                icon: "success",
                title: "Encabezado guardado correctamente",
                timer: 1500,
                showConfirmButton: false,
            })
        } catch (err) {
            console.error("❌ Error al guardar encabezado:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message || "No se pudo guardar el encabezado",
            });
        }
    });
});