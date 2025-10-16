fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
  credentials: "include"
})
  .then(res => {
    if (!res.ok) throw new Error("No autorizado");
  })

  .catch(() => {
    window.location.href = "Login.html";
  });


import { getTrackingById, updateEstado, updateTracking, createTracking, createEstado, updateOrdenServicio } from "../Services/ProductTrackingService.js";

// =========================================================================
// 1. DEFINICIONES GLOBALES Y UTILIDADES
// =========================================================================

const DEFAULT_TRACKING_DATA = (idOS) => ({
  idViaje: null,
  idOrdenServicio: idOS,
  idTransporteViaje: null,
  idEstado: null,
  documentos: 0, clasificacion: 0, digitacion: 0, registro: 0, pago: 0,
  idSelectivo: null,
  levantePago: 0, equipoTransporte: 0, carga: 0,
  enCamino: 0, entregada: 0, facturacion: 0,
  horaSalida: null, horaEstimadaLlegada: null, horaLLegada: null,
  lugarPartida: "", coordenadaPartida: "", lugarLLegada: "", coordenadaLlegada: ""
});

function formatToOracleTimestamp(dateString) {
  if (!dateString || dateString.trim() === "") return null;
  try {
    if (dateString.includes("T")) {
      return dateString.length === 16 ? dateString + ":00" : dateString;
    }
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19);
  } catch (e) {
    console.error("Error al formatear fecha:", e);
    return null;
  }
}

const parseDateToHTML = (oracleDate) => {
  if (!oracleDate) return '';
  try {
    const date = new Date(oracleDate);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
  } catch (e) {
    return '';
  }
};

// =========================================================================
// 2. FUNCIÓN PARA CARGAR COMBOBOX DE TRANSPORTES
// =========================================================================

async function cargarTransportesCombo(comboElement, tracking = {}) {
  if (!comboElement) {
    console.error("❌ Elemento comboTransportista no encontrado en el DOM.");
    return;
  }
  try {
    const [resTransporte, resTransportistas, resServicios] = await Promise.all([
      fetch("https://apitrackline-3047cf7af332.herokuapp.com/apiTransporte/getTransporte", { credentials: "include" }),
      fetch("https://apitrackline-3047cf7af332.herokuapp.com/apiTransportista/dataTransportista", { credentials: "include" }),
      fetch("https://apitrackline-3047cf7af332.herokuapp.com/apiServicioTransporte/get", { credentials: "include" })
    ]);

    if (!resTransporte.ok || !resTransportistas.ok || !resServicios.ok)
      throw new Error("Error al obtener datos de transportes");

    const transporteData = await resTransporte.json();
    const transportistasData = await resTransportistas.json();
    const serviciosData = await resServicios.json();

    const transportes = transporteData.content || transporteData;
    const transportistas = transportistasData.content || transportistasData;
    const servicios = serviciosData.content || serviciosData;

    const lista = transportes.map(t => {
      const tr = transportistas.find(tr => tr.idTransportista === t.idTransportista);
      const st = servicios.find(s => s.idServicioTransporte === t.idServicioTransporte);
      const placa = st?.placa || "Sin placa";
      const nombreCompleto = tr ? `${tr.nombre || ''} ${tr.apellido || ""}`.trim() : "Transportista sin asignar";
      return { idTransporte: t.idTransporte, placa, nombreCompleto };
    });

    comboElement.innerHTML = '<option value="">Seleccione un transporte</option>';
    let transporteInicial = null;

    lista.forEach(item => {
      const option = document.createElement("option");
      option.value = item.idTransporte;
      option.textContent = `${item.placa} - ${item.nombreCompleto}`;
      if (tracking?.idTransporteViaje === item.idTransporte) transporteInicial = item.idTransporte;
      comboElement.appendChild(option);
    });

    if (transporteInicial) comboElement.value = transporteInicial;

  } catch (err) {
    console.error("Error cargando transportistas:", err);
    comboElement.innerHTML = '<option value="">Error cargando transportistas</option>';
  }
}

// =========================================================================
// 3. LÓGICA PRINCIPAL DEL CONTROLADOR
// =========================================================================

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(location.search);

  const idViajeURL = urlParams.get("idViaje");
  const idOrdenServicio = urlParams.get("idOrdenServicio");

  if (!idOrdenServicio) {
    console.error("❌ Falta idOrdenServicio en la URL.");
    return;
  }

  let idViaje = idViajeURL ? parseInt(idViajeURL, 10) : null;
  let idEstado = urlParams.get("idEstado") || localStorage.getItem(`idEstado_${idOrdenServicio}`);
  let trackingData = DEFAULT_TRACKING_DATA(idOrdenServicio);
  let isNewViaje = !idViaje;

  const comboTransportista = document.getElementById("transportista");
  const selectivo = document.getElementById("selectivo");

  // 🔍 Si no vino idViaje, intenta obtenerlo desde la Orden de Servicio
  if (!idViaje) {
    try {
      const resOrden = await fetch(`https://apitrackline-3047cf7af332.herokuapp.com/apiOrdenServicio/buscarPorId/${idOrdenServicio}`, {
        credentials: "include"
      });
      if (resOrden.ok) {
        const ordenData = await resOrden.json();
        idViaje = ordenData.idViaje || null;
      }
    } catch (e) {
      console.error("❌ Error al obtener idViaje desde Orden:", e);
    }
  }

  console.log("📦 idOrdenServicio:", idOrdenServicio);
  console.log("🟢 idViaje (final):", idViaje);

  // 🟩 Cargar viaje existente sin mezclar IDs de combo
  if (idViaje) {
    try {
      const result = await getTrackingById(idViaje);
      if (result && result.idViaje) {
        trackingData = { ...DEFAULT_TRACKING_DATA(idOrdenServicio), ...result };
        idEstado = result.idEstado;
        localStorage.setItem(`idEstado_${idOrdenServicio}`, idEstado);
        isNewViaje = false;
      } else {
        console.warn("⚠️ No se encontró viaje. Modo creación.");
        isNewViaje = true;
      }
    } catch (error) {
      console.error("❌ Error cargando viaje existente:", error);
      isNewViaje = true;
    }
  }

  // ======================================================
  // Carga inicial UI
  // ======================================================
  await cargarTransportesCombo(comboTransportista, trackingData);

  document.querySelectorAll("input[type='checkbox']").forEach(input => {
    const field = input.dataset.field;
    if (field && trackingData[field] !== undefined) {
      input.checked = trackingData[field] == 1;
    }
  });

  if (selectivo) selectivo.value = trackingData.idSelectivo || "";
  document.getElementById("horaSalida").value = parseDateToHTML(trackingData.horaSalida);
  document.getElementById("horaEstimadaLlegada").value = parseDateToHTML(trackingData.horaEstimadaLlegada);
  document.getElementById("horaLlegada").value = parseDateToHTML(trackingData.horaLLegada);
  document.getElementById("lugarPartida").value = trackingData.lugarPartida || '';
  document.getElementById("coordPartida").value = trackingData.coordenadaPartida || '';
  document.getElementById("lugarLlegada").value = trackingData.lugarLLegada || '';
  document.getElementById("coordLlegada").value = trackingData.coordenadaLlegada || '';

  // ===================================================================
  // BOTONES
  // ===================================================================
  const btnFinalizar = document.getElementById("btnFinalizar");
  const btnGuardarTransporte = document.getElementById("guardarTransporte");

  // -------------------------------
  // Botón: Finalizar Estado
  // -------------------------------
  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", async (e) => {
      e.preventDefault();
      const estado = {};
      document.querySelectorAll("input[type='checkbox']").forEach(input => {
        const field = input.dataset.field;
        if (field) estado[field] = input.checked ? 1 : 0;
      });
      estado.idSelectivo = selectivo.value ? parseInt(selectivo.value, 10) : null;

      try {
        if (!idEstado) {
          const response = await createEstado(estado);
          if (response?.idEstado) {
            idEstado = response.idEstado;
            localStorage.setItem(`idEstado_${idOrdenServicio}`, idEstado);
            Swal.fire({ title: "Éxito", text: "Estado creado.", icon: "success" });
          } else throw new Error("No devolvió idEstado.");
        } else {
          await updateEstado(idEstado, estado);
          Swal.fire({ title: "Éxito", text: "Estado actualizado.", icon: "success" });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error", text: "No se pudo crear/actualizar el estado." });
      }
    });
  }

  // -------------------------------
  // Botón: Guardar Transporte/Viaje
  // -------------------------------
  if (btnGuardarTransporte) {
    btnGuardarTransporte.addEventListener("click", async (e) => {
      e.preventDefault();

      const idTransporteSeleccionado = parseInt(comboTransportista?.value, 10);
      const estadoIdToUse = parseInt(idEstado, 10);
      const idOrdenServicioNum = parseInt(idOrdenServicio, 10);

      if (!estadoIdToUse || isNaN(idTransporteSeleccionado)) {
        return Swal.fire({ title: "Advertencia", text: "Debe crear el Estado y seleccionar un transporte.", icon: "info" });
      }

      const viajePayload = {
        idTransporteViaje: idTransporteSeleccionado,
        idEstado: estadoIdToUse,
        horaSalida: formatToOracleTimestamp(document.getElementById("horaSalida")?.value),
        horaEstimadaLlegada: formatToOracleTimestamp(document.getElementById("horaEstimadaLlegada")?.value),
        horaLLegada: formatToOracleTimestamp(document.getElementById("horaLlegada")?.value),
        lugarPartida: document.getElementById("lugarPartida")?.value || null,
        coordenadaPartida: document.getElementById("coordPartida")?.value || null,
        lugarLLegada: document.getElementById("lugarLlegada")?.value || null,
        coordenadaLlegada: document.getElementById("coordLlegada")?.value || null,
      };

      try {
        if (isNewViaje) {
          const response = await createTracking({ idOrdenServicio: idOrdenServicioNum, ...viajePayload });
          if (response?.data?.idViaje) {
            const nuevoIdViaje = response.data.idViaje;
            await updateOrdenServicio(idOrdenServicioNum, { idViaje: nuevoIdViaje });
            await Swal.fire({
              icon: "success",
              title: "Pedido guardado",
              text: "La orden de servicio fue guardada correctamente",
              confirmButtonText: "OK"
            });
            window.location.href = `${location.pathname}?idViaje=${nuevoIdViaje}&idOrdenServicio=${idOrdenServicioNum}`;
          }
        } else {
          await updateTracking(idViaje, viajePayload);
          Swal.fire({ title: "Éxito", text: "Viaje actualizado correctamente.", icon: "success" });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error", text: "No se pudo guardar el viaje." });
      }
    });
  }

  const btnVolverOrdenes = document.getElementById("btnVolverOrdenes");
  if (btnVolverOrdenes) {
    btnVolverOrdenes.addEventListener("click", () => {
      window.location.href = "AllOrders.html";
    });
  }
});