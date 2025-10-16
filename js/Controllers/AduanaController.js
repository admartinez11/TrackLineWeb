fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
    credentials: "include"
})
    .then(res => {
        if (!res.ok) throw new Error("No autorizado");
    })
    .catch(() => {
        window.location.href = "Login.html";
    });


// Importar servicios 
import {
    getAduana,
    createAduana,
    updateAduana,
    deleteAduana
} from "../Services/AduanaService.js";

document.addEventListener("DOMContentLoaded", () => {

    // --- Referencias a inputs del formulario ---
    const tipoDeServicioInput = document.getElementById("tipoServicio");
    const primeraModalidadInput = document.getElementById("primeraModalidad");
    const segundaModalidadInput = document.getElementById("segundaModalidad");
    const declaracionInput = document.getElementById("declaracion");
    const digitadorInput = document.getElementById("digitador");
    const tramitadorInput = document.getElementById("tramitador");

    // --- Botones (Mantenemos referencias, usamos btnAdd para el flujo principal) ---
    const btnAdd = document.getElementById("btnAddAduana");
    const btnList = document.getElementById("btnListAduana");
    const btnDelete = document.getElementById("btnDeleteAduana");

    // --- IDs de Referencia y Persistencia ---
    const idOrdenEncabezado = localStorage.getItem("idOrdenEncabezado");
    // Usamos 'let' para actualizarlo si se crea un registro nuevo
    let idAduana = localStorage.getItem("idAduana");

    // --- Función: validar campos ---
    function validateForm() {
        const tipoServicio = tipoDeServicioInput.value.trim();
        const primeraModalidad = primeraModalidadInput.value.trim();
        const segundaModalidad = segundaModalidadInput.value.trim();
        const declaracion = declaracionInput.value.trim();
        const digitador = digitadorInput.value.trim();
        const tramitador = tramitadorInput.value.trim();

        const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

        // --- Tipo Servicio ---
        if (!tipoServicio || tipoServicio === "0") {
            Swal.fire({
                icon: "error",
                title: "Campos obligatorios",
                text: "Debes seleccionar un tipo de servicio."
            });
            return false;
        }

        // --- DM ---
        if (!declaracion) {
            Swal.fire({
                icon: "error",
                title: "Campos obligatorios",
                text: "El campo DM (Declaración) es obligatorio."
            });
            return false;
        }
        if (declaracion.length > 50) {
            Swal.fire({
                icon: "error",
                title: "Validación",
                text: "El campo DM no puede tener más de 50 caracteres."
            });
            return false;
        }

        // --- Primera Modalidad ---
        if (!primeraModalidad) {
            Swal.fire({
                icon: "error",
                title: "Campos obligatorios",
                text: "La primera modalidad es obligatoria."
            });
            return false;
        }
        if (!regexLetras.test(primeraModalidad)) {
            Swal.fire({
                icon: "error",
                title: "Validación",
                text: "La primera modalidad solo debe contener letras y espacios."
            });
            return false;
        }
        if (primeraModalidad.length > 10) {
            Swal.fire({
                icon: "error",
                title: "Validación",
                text: "La primera modalidad no puede tener más de 10 caracteres."
            });
            return false;
        }

        // --- Segunda Modalidad ---
        if (!segundaModalidad) {
            Swal.fire({
                icon: "error",
                title: "Campos obligatorios",
                text: "La segunda modalidad es obligatoria."
            });
            return false;
        }
        if (!regexLetras.test(segundaModalidad)) {
            Swal.fire({
                icon: "error",
                title: "Validación",
                text: "La segunda modalidad solo debe contener letras y espacios."
            });
            return false;
        }
        if (segundaModalidad.length > 10) {
            Swal.fire({
                icon: "error",
                title: "Validación",
                text: "La segunda modalidad no puede tener más de 10 caracteres."
            });
            return false;
        }

        // --- Digitador ---
        if (!digitador) {
            Swal.fire({
                icon: "error",
                title: "Campos obligatorios",
                text: "El digitador es obligatorio."
            });
            return false;
        }
        if (!regexLetras.test(digitador)) {
            Swal.fire({
                icon: "error",
                title: "Validación",
                text: "El digitador solo debe contener letras y espacios."
            });
            return false;
        }
        if (digitador.length > 30) {
            Swal.fire({
                icon: "error",
                title: "Validación",
                text: "El digitador no puede tener más de 30 caracteres."
            });
            return false;
        }

        // --- Tramitador ---
        if (!tramitador) {
            Swal.fire({
                icon: "error",
                title: "Campos obligatorios",
                text: "El tramitador es obligatorio."
            });
            return false;
        }
        if (!regexLetras.test(tramitador)) {
            Swal.fire({
                icon: "error",
                title: "Validación",
                text: "El tramitador solo debe contener letras y espacios."
            });
            return false;
        }
        if (tramitador.length > 50) {
            Swal.fire({
                icon: "error",
                title: "Validación",
                text: "El tramitador no puede tener más de 50 caracteres."
            });
            return false;
        }

        return true;
    }

    // --- Función auxiliar: armar JSON (Añadiendo la FK) ---
    function buildAduanaData() {
        const currentIdOrdenEncabezado = localStorage.getItem("idOrdenEncabezado");

        return {
            idOrdenEncabezado: parseInt(currentIdOrdenEncabezado),
            idTipoServicio: Number(tipoDeServicioInput.value),
            DM: declaracionInput.value.trim(),
            primeraModalidad: primeraModalidadInput.value.trim(),
            segundaModalidad: segundaModalidadInput.value.trim(),
            tramitador: tramitadorInput.value.trim(),
            digitador: digitadorInput.value.trim()
        };
    }

    // 🛑 ACCIÓN UNIFICADA: GUARDAR O ACTUALIZAR ADUANA (SIN CONFIRMACIÓN) 
    if (btnAdd) {
        btnAdd.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!validateForm()) return;

            // 🛑 CRÍTICO: Verificar que el Encabezado ya fue creado.
            if (!idOrdenEncabezado || idOrdenEncabezado === "null") {
                Swal.fire("Error", "Debe crear el Encabezado de la Orden primero.", "warning");
                return;
            }

            const data = buildAduanaData();

            // Revisa el valor actual del ID antes de la operación
            const currentIdAduana = localStorage.getItem("idAduana");
            const isUpdate = currentIdAduana && currentIdAduana !== "null" && currentIdAduana !== "undefined";

            const successTitle = isUpdate ? "¡Actualizado! ✅" : "¡Guardado! ✅";
            const successText = isUpdate ? "Aduana actualizada correctamente" : "Aduana guardada correctamente";

            try {
                let aduanaResult;

                if (isUpdate) {
                    // Modo Edición: Actualizar
                    aduanaResult = await updateAduana(currentIdAduana, data);

                    // 🛑 VERICACIÓN 1: Asegura que la API no devolvió un error de negocio en el cuerpo 200
                    if (aduanaResult && aduanaResult.success === false) {
                        throw new Error(aduanaResult.message || "La actualización falló en el servidor.");
                    }
                } else {
                    // Modo Creación: Crear y guardar el nuevo ID
                    aduanaResult = await createAduana(data);

                    // 🛑 VERICACIÓN 2: CRÍTICO - Verifica que el ID fue devuelto
                    if (aduanaResult && aduanaResult.data && aduanaResult.data.idAduana) {
                        // Inserción exitosa: Guardar el nuevo ID para futuras actualizaciones
                        idAduana = aduanaResult.data.idAduana; // Actualiza la variable local
                        localStorage.setItem("idAduana", idAduana);
                    } else {
                        // Inserción fallida: Forzar el catch si el ID no vino
                        const serverMessage = aduanaResult ? (aduanaResult.message || JSON.stringify(aduanaResult)) : "Respuesta de la API vacía o inválida.";
                        throw new Error("No se pudo insertar Aduana. Mensaje del servidor: " + serverMessage);
                    }
                }

                // Muestra el éxito directamente, sin pedir confirmación previa
                Swal.fire({
                    icon: "success",
                    title: "Información de Aduana guardada correctamente",
                    timer: 1500,
                    showConfirmButton: false,
                })

            } catch (error) {
                console.error("❌ Error al guardar/actualizar Aduana:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "Hubo un problema al guardar Aduana."
                });
            }
        });
    }

    // --- ACCIONES SECUNDARIAS (Se mantienen los tuyos) ---

    // Acción: Listar Aduanas
    if (btnList) {
        btnList.addEventListener("click", async () => {
            try {
                const aduanas = await getAduana();
                console.table(aduanas);
                Swal.fire({ icon: "info", title: "Listado", text: "Las aduanas se listaron en la consola." });
            } catch (error) {
                console.error("❌ Error al listar Aduanas:", error);
                Swal.fire({ icon: "error", title: "Error", text: "Hubo un problema al listar Aduanas." });
            }
        });
    }

    // Acción: Eliminar Aduana (Se mantiene la confirmación, pues es una acción destructiva)
    if (btnDelete) {
        btnDelete.addEventListener("click", async (e) => {
            e.preventDefault();

            const { value: id } = await Swal.fire({
                title: "Eliminar Aduana",
                text: "Ingrese el ID de la Aduana a eliminar",
                input: "number",
                inputPlaceholder: "Ejemplo: 101",
                showCancelButton: true,
                confirmButtonText: "Eliminar",
                cancelButtonText: "Cancelar"
            });

            if (!id) {
                Swal.fire({ icon: "warning", title: "Atención", text: "Debes ingresar un ID válido." });
                return;
            }

            Swal.fire({
                title: "¿Está seguro?",
                text: "Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#727475ff",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await deleteAduana(id);
                        Swal.fire({ icon: "success", title: "Eliminado", text: "Aduana eliminada correctamente ✅" });
                    } catch (error) {
                        console.error("Error al eliminar Aduana:", error);
                        Swal.fire({ icon: "error", title: "Error", text: error.message || "Hubo un problema al eliminar Aduana." });
                    }
                }
            });
        });
    }
});