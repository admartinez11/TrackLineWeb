const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiObservaciones";

// ---------------------------------------------------
// FUNCIONES DE OBSERVACIONES
// ---------------------------------------------------

export async function createObservacion(data) {
  const res = await fetch(`${API_URL}/agregarObservacion`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    // Intentar leer el mensaje de error del servidor si es posible
    const errorBody = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`Error ${res.status}: ${errorBody.message || res.statusText}`);
  }

  const ans = await res.json();

  // 🛑 CORRECCIÓN IMPLEMENTADA: Navegamos a 'data' y luego a 'idObservaciones' y convertimos a String.
  let generatedId = null;

  if (ans && ans.data && ans.data.idObservaciones) {
    generatedId = String(ans.data.idObservaciones);
  } else {
    throw new Error("La API devolvió un formato inesperado o faltó el ID de la Observación.");
  }

  return {
    data: {
      // Devolvemos el ID con la clave 'idObservaciones' (plural) consistente con tu BD y DTO.
      idObservaciones: generatedId
    }
  };
}

export async function getObservacion(id) {
  // Se asume que si no hay 'id', la URL es para listar todas.
  const url = id ? `${API_URL}/obtenerObservacionPorId/${id}` : `${API_URL}/obtenerTodasLasObservaciones`;

  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return await res.json();
}

export async function updateObservacion(id, data) {
  // 🔑 CORRECCIÓN IMPLEMENTADA: Usamos String(id) para forzar el ID a ser una cadena.
  const res = await fetch(`${API_URL}/actualizarObservacion/${String(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw { status: res.status, message: errorData.message || res.statusText, errors: errorData };
  }

  return await res.json();
}

export async function deleteObservacion(id) {
  const res = await fetch(`${API_URL}/eliminarObservacion/${String(id)}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Error ${res.status}: ${errorData.message || res.statusText}`);
  }

  return res.status === 204 ? null : await res.json();
}