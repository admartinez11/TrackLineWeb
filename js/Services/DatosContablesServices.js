const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiTipoDatoContable";

export async function getDC() {
    const res = await fetch(`${API__URL}/dataDatoContable`, {credentials: "include"});
    return res.json();
}

export async function createDC(data) {
    const response = await fetch(`${API__URL}/agregarTipoDatoContable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    // Leer el texto de la respuesta primero
    const text = await response.text();

    // Si la respuesta no fue exitosa (por ejemplo, 400 Bad Request), lanzar un error.
    if (!response.ok) {
        throw new Error(text || "Error al crear transportista");
    }

    // Si la respuesta fue exitosa, intentar analizarla como JSON.
    try {
        return JSON.parse(text); 
    } catch {
        // Si no es JSON pero la respuesta fue exitosa, devolver un objeto de éxito.
        return { status: "Éxito", mensaje: text };
    }
}

export async function updateDc(id, data) {
    const response = await fetch(`${API__URL}/actualizarDatoContable/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    const text = await response.text();
    if (!response.ok) {
        throw new Error(text || "Error al actualizar transportista");
    }

    try {
        return JSON.parse(text);
    } catch {
        return { status: "Éxito", mensaje: text };
    }
}


export async function deleteDC(id) {
  const response = await fetch(`${API__URL}/eliminarDatoContable/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!response.ok) {
    // Si hay error, intenta leer el mensaje del backend (si existe)
    const errorText = await response.text();
    throw new Error(errorText || "Error al eliminar transportista");
  }

  return { status: "Éxito" };
}