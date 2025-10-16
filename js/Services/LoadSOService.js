// Services/LoadOrdenService.js
import { getOrdenServicioById } from "./OrdenServicioService.js";

const API_ENCABEZADO = "https://apitrackline-3047cf7af332.herokuapp.com/apiOrden";
const API_EMBARQUE = "https://apitrackline-3047cf7af332.herokuapp.com/apiInfoEmbarque";
const API_ADUANA = "https://apitrackline-3047cf7af332.herokuapp.com/apiAduana";
const API_TRANSPORTE = "https://apitrackline-3047cf7af332.herokuapp.com/apiTransporte";
const API_RECO = "https://apitrackline-3047cf7af332.herokuapp.com/apiRecoleccion";
const API_OBS = "https://apitrackline-3047cf7af332.herokuapp.com/apiObservaciones";

async function fetchWithInclude(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Error al obtener datos de ${url}`);
  return await res.json();
}

export async function loadOrdenCompleta(idOrdenServicio) {
  try {
    // 1️⃣ Traer la orden principal
    const orden = await getOrdenServicioById(idOrdenServicio);
    console.log("📦 Orden completa:", orden);

    const {
      idOrdenEncabezado,
      idInfoEmbarque,
      idAduana,
      idTransporte,
      idRecoleccion,
      idObservaciones
    } = orden;

    // 2️⃣ Cargar submódulos
    const [encabezado, embarque, aduana, transporte, recoleccion, observaciones] =
      await Promise.all([
        idOrdenEncabezado ? fetchWithInclude(`${API_ENCABEZADO}/buscarPorId/${idOrdenEncabezado}`) : null,
        idInfoEmbarque ? fetchWithInclude(`${API_EMBARQUE}/buscarPorId/${idInfoEmbarque}`) : null,
        idAduana ? fetchWithInclude(`${API_ADUANA}/buscarPorId/${idAduana}`) : null,
        idTransporte ? fetchWithInclude(`${API_TRANSPORTE}/buscarPorId/${idTransporte}`) : null,
        idRecoleccion ? fetchWithInclude(`${API_RECO}/buscarPorId/${idRecoleccion}`) : null,
        idObservaciones ? fetchWithInclude(`${API_OBS}/buscarPorId/${idObservaciones}`) : null,
      ]);

    // 3️⃣ Llenar formulario HTML
    if (encabezado) {
      document.getElementById("fecha").value = encabezado.fecha || "";
      document.getElementById("encargado1").value = encabezado.encargado1 || "";
      document.getElementById("referencia").value = encabezado.referencia || "";
      document.getElementById("importador").value = encabezado.importador || "";
      document.getElementById("nit1").value = encabezado.nit || "";
    }

    if (embarque) {
      document.getElementById("facturas").value = embarque.facturas || "";
      document.getElementById("proveedor").value = embarque.proveedorRef || "";
      document.getElementById("bultos").value = embarque.bultos || "";
      document.getElementById("kilos").value = embarque.kilos || "";
    }

    if (aduana) {
      document.getElementById("tipoServicio").value = aduana.tipoServicio || "";
      document.getElementById("tramitador").value = aduana.tramitador || "";
    }

    if (recoleccion) {
      document.getElementById("lugarOrigen").value = recoleccion.lugarOrigen || "";
      document.getElementById("lugarDestino").value = recoleccion.lugarDestino || "";
      document.getElementById("paisOrigen").value = recoleccion.paisOrigen || "";
      document.getElementById("paisDestino").value = recoleccion.paisDestino || "";
    }

    if (observaciones) {
      document.getElementById("estado").value = observaciones.estado || "";
      document.getElementById("observaciones").value = observaciones.observacion || "";
    }

    if (transporte) {
      document.getElementById("transportista").value = transporte.transportista || "";
    }

    Swal.fire({
      icon: "success",
      title: "Orden cargada",
      text: "Los datos fueron cargados correctamente.",
    });

  } catch (error) {
    console.error("❌ Error cargando la orden:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo cargar la orden.",
    });
  }
}