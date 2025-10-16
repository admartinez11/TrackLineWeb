// ============================
// ProductTrackingService.js (CORREGIDO)
// ============================

const API_TRACKING_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiViaje";
const API_TRANSPORTE_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiTransporte";
const API_ESTADOS_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiEstados";
const API_ORDEN_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiOrdenServicio";

// ============================
// 🧱 ORDEN DE SERVICIO
// ============================
export async function updateOrdenServicio(id, data) {
  try {
    const res = await fetch(`${API_ORDEN_URL}/actualizarParcial/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar la orden de servicio");
    return await res.json();
  } catch (error) {
    console.error("Error en updateOrdenServicio:", error);
    throw error;
  }
}

// ============================
// 🚚 VIAJE (TRACKING)
// ============================

// 🔹 Obtener viaje por ID
export async function getTrackingById(idTracking) {
  try {
    // ✅ CORRECCIÓN 404: Se usa API_TRACKING_URL (singular)
    const res = await fetch(`${API_TRACKING_URL}/buscarPorId/${idTracking}`, { credentials: "include" });

    if (res.status === 404) {
      console.warn(`⚠️ No se encontró viaje con ID ${idTracking}.`);
      return null;
    }

    if (!res.ok) {
      throw new Error(`Error al obtener viaje: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("Error en getTrackingById:", error);
    return null;
  }
}

// 🔹 Crear viaje
export async function createTracking(data) {
  // ✅ MANTENEMOS ESTA LÓGICA: Solo envía el payload al endpoint de Viaje.
  // El controlador se encarga de que la 'data' tenga el formato correcto (incluyendo campos de Estado si es necesario).

  const res = await fetch(`${API_TRACKING_URL}/crear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include"
  });

  if (!res.ok) {
    // Captura el error para ver si es un 400 (mal formato) o un 500 (interno)
    const errorText = await res.text();
    throw new Error(`Error al crear viaje: ${res.status} - ${errorText}`);
  }

  return res.json();
}

// 🔹 Actualizar viaje
export async function updateTracking(id, data) {
  try {
    const res = await fetch(`${API_TRACKING_URL}/actualizarParcial/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Error al actualizar viaje: ${res.status} ${err.message || ""}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error en updateTracking:", error);
    throw error;
  }
}

// ============================
// 🔄 ESTADOS
// ============================

// 🔹 Crear estado
export async function createEstado(data) {
  try {
    console.log("🟡 Enviando nuevo ESTADO:", data);
    const res = await fetch(`${API_ESTADOS_URL}/agregarEstado`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Error desconocido" }));
      throw new Error(`Error al crear estado: ${res.status} - ${errorData.message}`);
    }

    const result = await res.json();
    console.log("🟢 Respuesta API_ESTADOS:", result);
    return result.data || result;
  } catch (error) {
    console.error("❌ Error en createEstado:", error);
    throw error;
  }
}


// 🔹 Actualizar estado
export async function updateEstado(idEstado, data) {
  try {
    const res = await fetch(`${API_ESTADOS_URL}/actualizarParcialmente/${idEstado}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al actualizar estado");

    const result = await res.json();
    return result.data || result;
  } catch (error) {
    console.error("Error en updateEstado:", error);
    throw error;
  }
}