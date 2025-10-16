fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
    credentials: "include" 
})
    .then(res => {
        if (!res.ok) throw new Error("No autorizado");
    })
    .catch(() => {
        window.location.href = "Login.html";
    });


// --- 2. Importaciones de Servicios (Actualizado para Recoleccion) ---
import { 
    createRecoleccion, 
    updateRecoleccion, // Asumimos que esta función existe en tu servicio
    // getRecoleccionById // Puedes usarla para precargar si es necesario
} from "../Services/RecoleccionService.js"; 

document.addEventListener("DOMContentLoaded", () => {
    // --- 3. Referencias a inputs del formulario ---
    const transporteInput = document.getElementById("transporte");
    const recoleccionEntregaInput = document.getElementById("recoleccionEntrega");
    const numeroDocInput = document.getElementById("documento");
    const lugarOrigenInput = document.getElementById("lugarOrigen");
    const paisOrigenInput = document.getElementById("paisOrigen");
    const lugarDestinoInput = document.getElementById("lugarDestino");
    const paisDestinoInput = document.getElementById("paisDestino");

    // --- ID de Referencia y Persistencia ---
    const idOrdenEncabezado = localStorage.getItem("idOrdenEncabezado"); 
    // Usamos 'let' para poder actualizarlo si se crea un registro nuevo
    let idRecoleccion = localStorage.getItem("idRecoleccion"); 

    // --- Botón ---
    // 🛑 CRÍTICO: Asegúrate de que este selector apunte al botón de Guardar/Actualizar
    const btnAddRecoleccion = document.querySelector(".accordion[data-step='4'] .buttons-form"); 

    // Regex para validar letras y espacios (con tildes y ñ)
    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

    // --- 4. Función: Validaciones según DTO (Se mantiene tu código) ---
    function validateForm() {
        // [TU CÓDIGO DE VALIDACIÓN EXISTENTE]
        // ... (Se asume que toda la lógica de validación de campos es correcta)
        
        // numeroDoc -> máximo 10
        if (!numeroDocInput.value.trim()) {
            Swal.fire({ icon: "warning", title: "Atención", text: "Debes ingresar el número de documento" });
            return false;
        }
        if (numeroDocInput.value.trim().length > 10) {
            Swal.fire({ icon: "warning", title: "Atención", text: "El número de documento no puede superar 10 caracteres" });
            return false;
        }

        // lugarOrigen
        if (!lugarOrigenInput.value.trim()) {
            Swal.fire({ icon: "warning", title: "Atención", text: "Debes ingresar el lugar de origen" });
            return false;
        }
        if (!regexLetras.test(lugarOrigenInput.value.trim())) {
            Swal.fire({ icon: "error", title: "Error", text: "El lugar de origen solo debe contener letras y espacios" });
            return false;
        }
        if (lugarOrigenInput.value.trim().length > 50) {
            Swal.fire({ icon: "error", title: "Error", text: "El lugar de origen no puede superar 50 caracteres" });
            return false;
        }

        // paisOrigen
        if (!paisOrigenInput.value.trim()) {
            Swal.fire({ icon: "warning", title: "Atención", text: "Debes ingresar el país de origen" });
            return false;
        }
        if (!regexLetras.test(paisOrigenInput.value.trim())) {
            Swal.fire({ icon: "error", title: "Error", text: "El país de origen solo debe contener letras y espacios" });
            return false;
        }
        if (paisOrigenInput.value.trim().length > 50) {
            Swal.fire({ icon: "error", title: "Error", text: "El país de origen no puede superar 50 caracteres" });
            return false;
        }

        // lugarDestino
        if (!lugarDestinoInput.value.trim()) {
            Swal.fire({ icon: "warning", title: "Atención", text: "Debes ingresar el lugar de destino" });
            return false;
        }
        if (!regexLetras.test(lugarDestinoInput.value.trim())) {
            Swal.fire({ icon: "error", title: "Error", text: "El lugar de destino solo debe contener letras y espacios" });
            return false;
        }
        if (lugarDestinoInput.value.trim().length > 50) {
            Swal.fire({ icon: "error", title: "Error", text: "El lugar de destino no puede superar 50 caracteres" });
            return false;
        }

        // paisDestino
        if (!paisDestinoInput.value.trim()) {
            Swal.fire({ icon: "warning", title: "Atención", text: "Debes ingresar el país de destino" });
            return false;
        }
        if (!regexLetras.test(paisDestinoInput.value.trim())) {
            Swal.fire({ icon: "error", title: "Error", text: "El país de destino solo debe contener letras y espacios" });
            return false;
        }
        if (paisDestinoInput.value.trim().length > 50) {
            Swal.fire({ icon: "error", title: "Error", text: "El país de destino no puede superar 50 caracteres" });
            return false;
        }
        
        return true;
    }

    // --- Función auxiliar: armar JSON (Añadiendo la FK) ---
    function buildRecoleccionData() {
        const currentIdOrdenEncabezado = localStorage.getItem("idOrdenEncabezado");
        
        const data = {
            // CRÍTICO: Incluir la Foreign Key
            idOrdenEncabezado: parseInt(currentIdOrdenEncabezado),
            
            transporte: transporteInput.checked,
            recoleccionEntrega: recoleccionEntregaInput.checked,
            numeroDoc: numeroDocInput.value.trim(),
            lugarOrigen: lugarOrigenInput.value.trim(),
            paisOrigen: paisOrigenInput.value.trim(),
            lugarDestino: lugarDestinoInput.value.trim(),
            paisDestino: paisDestinoInput.value.trim()
        };
        console.log("📤 Enviando JSON Recolección:", JSON.stringify(data, null, 2));
        return data;
    }

    // --- GUARDAR O ACTUALIZAR RECOLECCIÓN ---
    if (btnAddRecoleccion) {
        btnAddRecoleccion.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!validateForm()) return;

            // 🛑 CRÍTICO: Verificar que el Encabezado ya fue creado.
            if (!idOrdenEncabezado || idOrdenEncabezado === "null") {
                Swal.fire("Error", "Debe crear el Encabezado de la Orden primero.", "warning");
                return;
            }
            
            const data = buildRecoleccionData();
            
            // Revisa el valor actual del ID antes de la operación
            const currentIdRecoleccion = localStorage.getItem("idRecoleccion");
            const isUpdate = currentIdRecoleccion && currentIdRecoleccion !== "null" && currentIdRecoleccion !== "undefined";
            
            const successTitle = isUpdate ? "¡Actualizado! ✅" : "¡Guardado! ✅";
            const successText = isUpdate ? "Recolección actualizada correctamente" : "Recolección guardada correctamente";

            // Líneas de Diagnóstico
            console.log("-----------------------------------------");
            console.log("MÓDULO: RECOLECCIÓN");
            console.log("ID de Recolección en LocalStorage:", currentIdRecoleccion);
            console.log("¿Es Modo Actualización (isUpdate)?", isUpdate);
            console.log("-----------------------------------------");
            
            try {
                let recoleccionResult;

                if (isUpdate) {
                    console.log("➡️ Ejecutando: updateRecoleccion (PUT/PATCH) con ID:", currentIdRecoleccion);
                    // Modo Edición: Actualizar
                    recoleccionResult = await updateRecoleccion(currentIdRecoleccion, data); 

                    // Verificación de error de negocio (si aplica)
                    if (recoleccionResult && recoleccionResult.success === false) { 
                        throw new Error(recoleccionResult.message || "La actualización falló en el servidor.");
                    }
                } else {
                    console.log("➡️ Ejecutando: createRecoleccion (POST)");
                    // Modo Creación: Crear y guardar el nuevo ID
                    recoleccionResult = await createRecoleccion(data);
                    
                    // CRÍTICO: Verifica que el ID fue devuelto
                    if (recoleccionResult && recoleccionResult.data && recoleccionResult.data.idRecoleccion) {
                        // Inserción exitosa: Guardar el nuevo ID para futuras actualizaciones
                        idRecoleccion = recoleccionResult.data.idRecoleccion; // Actualiza la variable local
                        localStorage.setItem("idRecoleccion", idRecoleccion);
                         console.log("✅ Nuevo ID de Recolección guardado en LocalStorage:", idRecoleccion);
                    } else {
                        // Inserción fallida: Forzar el catch si el ID no vino
                        const serverMessage = recoleccionResult ? (recoleccionResult.message || JSON.stringify(recoleccionResult)) : "Respuesta de la API vacía o inválida.";
                        throw new Error("No se pudo insertar Recolección. Mensaje del servidor: " + serverMessage);
                    }
                }

                // Muestra el éxito directamente, sin pedir confirmación previa
                Swal.fire({
                    icon: "success",
                    title: "Información de Recolección guardada correctamente",
                    timer: 1500,
                    showConfirmButton: false,
                })
                
            } catch (error) {
                console.error("❌ Error al guardar/actualizar Recolección:", error);
                Swal.fire({ 
                    icon: "error", 
                    title: "Error", 
                    text: error.message || "Hubo un problema al guardar Recolección." 
                });
            }
        });
    }
});