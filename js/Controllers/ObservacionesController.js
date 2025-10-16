// ===================== VALIDAR SESIÓN =====================
fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
  credentials: "include"
})
  .then(res => {
    if (!res.ok) throw new Error("No autorizado");
  })
  .catch(() => {
    window.location.href = "Login.html";
  });

// ===================== IMPORTAR SERVICIOS =====================
import {
  getObservacion,
  createObservacion,
  updateObservacion,
  deleteObservacion
} from "../Services/ObservacionesService.js";

// ===================== INICIO DEL CONTROLADOR =====================
document.addEventListener("DOMContentLoaded", () => {

  // --- Referencias a inputs del formulario ---
  const estadoInput = document.getElementById("estado");
  const observacionesInput = document.getElementById("observaciones");

  // --- Botones ---
  const btnAdd = document.getElementById("guardarObservacion");
  const btnList = document.getElementById("btnListObservacion");
  const btnDelete = document.getElementById("btnDeleteObservacion");

  // --- IDs de Referencia y Persistencia ---
  const idOrdenEncabezado = localStorage.getItem("idOrdenEncabezado");
  // Se usa 'idObservaciones' (plural) consistente con la BD y el Service.
  let idObservaciones = localStorage.getItem("idObservaciones");


  // ===================== VALIDACIÓN =====================
  function validateForm() {
    // ... (validación de campos inalterada) ...
    if (!estadoInput.value || estadoInput.value === '0') {
      Swal.fire({ icon: "error", title: "Campos obligatorios", text: "Debes seleccionar un estado." });
      return false;
    }
    if (!observacionesInput.value.trim()) {
      Swal.fire({ icon: "error", title: "Campos obligatorios", text: "Debes ingresar las observaciones." });
      return false;
    }
    if (observacionesInput.value.trim().length > 50) {
      Swal.fire({ icon: "error", title: "Error", text: "Las observaciones no pueden superar 50 caracteres." });
      return false;
    }
    return true;
  }

  // ===================== CONSTRUCCIÓN DE JSON =====================
  function buildObservacionData() {
    const currentIdOrdenEncabezado = localStorage.getItem("idOrdenEncabezado");

    return {
      idOrdenEncabezado: parseInt(currentIdOrdenEncabezado),
      idSelectivo: Number(estadoInput.value),
      observaciones: observacionesInput.value.trim()
    };
  }

  // ===================== GUARDAR O ACTUALIZAR OBSERVACIÓN =====================
  if (btnAdd) {
    btnAdd.addEventListener("click", async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      if (!idOrdenEncabezado || idOrdenEncabezado === "null") {
        Swal.fire("Error", "Debe crear el Encabezado de la Orden primero.", "warning");
        return;
      }

      const data = buildObservacionData();

      // Leemos el ID actual con la clave correcta.
      const currentIdObservaciones = localStorage.getItem("idObservaciones");

      // 🛑 LÓGICA REFORZADA: Solo es update si es un número válido y positivo.
      const isUpdate = currentIdObservaciones
        && currentIdObservaciones.trim() !== ""
        && !isNaN(Number(currentIdObservaciones))
        && Number(currentIdObservaciones) > 0;

      const successTitle = isUpdate ? "¡Actualizado! ✅" : "¡Guardado! ✅";
      const successText = isUpdate ? "Observación actualizada correctamente" : "Observación guardada correctamente";

      try {
        let observacionResult;

        if (isUpdate) {
          // --- MODO ACTUALIZACIÓN ---
          // Usamos toString() aquí como doble seguridad para la URL del PUT.
          observacionResult = await updateObservacion(currentIdObservaciones.toString(), data);

          if (observacionResult && observacionResult.success === false) {
            throw new Error(observacionResult.message || "La actualización falló en el servidor.");
          }

        } else {
          // --- MODO CREACIÓN: Crear y guardar el nuevo ID ---
          observacionResult = await createObservacion(data);

          // 🛑 CRÍTICO - Verifica que el ID fue devuelto del servicio con la clave 'idObservaciones'
          if (observacionResult && observacionResult.data && observacionResult.data.idObservaciones) {
            // Inserción exitosa: Guardar el nuevo ID para futuras actualizaciones
            // 🔑 FIX DEFINITIVO: Convertir explícitamente a String antes de guardar.
            idObservaciones = String(observacionResult.data.idObservaciones);

            // Escribimos la clave correcta en localStorage
            localStorage.setItem("idObservaciones", idObservaciones);

            const labelIdObs = document.getElementById("idObservacion");
            if (labelIdObs) labelIdObs.textContent = idObservaciones;

          } else {
            const serverMessage = observacionResult ? (observacionResult.message || JSON.stringify(observacionResult)) : "Respuesta de la API vacía o inválida.";
            throw new Error("No se pudo insertar Observación. Mensaje del servidor: " + serverMessage);
          }
        }

        // Muestra el éxito directamente, sin pedir confirmación previa
        Swal.fire({
          icon: "success",
          title: "Información de Observación guardada correctamente",
          timer: 1500,
          showConfirmButton: false,
        })

      } catch (error) {
        console.error("❌ Error al guardar/actualizar Observación:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Hubo un problema al guardar la observación."
        });
      }
    });
  }
});