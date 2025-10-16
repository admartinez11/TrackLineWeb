const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiOrdenServicio"; // OrdenServicio
const API_ENCABEZADO = "https://apitrackline-3047cf7af332.herokuapp.com/apiOrden";
const API_EMBARQUE = "https://apitrackline-3047cf7af332.herokuapp.com/apiInfoEmbarque";
const API_ADUANA = "https://apitrackline-3047cf7af332.herokuapp.com/apiAduana";
const API_TRANSPORTE = "https://apitrackline-3047cf7af332.herokuapp.com/apiTransporte";
const API_RECO = "https://apitrackline-3047cf7af332.herokuapp.com/apiRecoleccion";
const API_OBS = "https://apitrackline-3047cf7af332.herokuapp.com/apiObservaciones";

export async function getOrdenById(id) {
    const res = await fetch(`${API_URL}/buscarPorId/${id}`,
        { credentials: "include" });

    if (!res.ok) throw new Error("Error al obtener la orden");
    return await res.json();
}

// 🔹 Obtener órdenes con paginación
export async function getOrdenesPaginacion(page = 0, size = 5) {
    const res = await fetch(`
        ${API_URL}/datosOrdenesServicio?page=${page}&size=${size}`,
        { credentials: "include" }
    );

    if (!res.ok) throw new Error("Error al obtener órdenes");
    const data = await res.json();

    // Compatibilidad con varias respuestas del backend
    if (data.data && data.data.content) return data.data;
    if (data.content) return data;
    if (Array.isArray(data)) return { content: data, totalPages: 1 };
    return { content: [], totalPages: 0 };
}

// 🔹 Eliminar orden completa
export async function deleteOrden(id) {
    const res = await fetch(`${API_URL}/eliminar/${id}`, { credentials: "include", method: "DELETE" });

    if (!res.ok) throw new Error("Error al eliminar la orden");
    return await res.json();

}

// 🔹 Eliminar encabezado
export async function deleteEncabezado(id) {
    const res = await fetch(`${API_ENCABEZADO}/deleteOrden/${id}`, {
        credentials: "include",
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error eliminando encabezado");
}

// 🔹 Eliminar información de embarque
export async function deleteInfoEmbarque(id) {
    const res = await fetch(`${API_EMBARQUE}/eliminarInfoEmbarque/${id}`, {
        credentials: "include",
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error eliminando info embarque");
}

// 🔹 Eliminar aduana
export async function deleteAduana(id) {
    const res = await fetch(`${API_ADUANA}/eliminarAduana/${id}`, {
        credentials: "include",
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error eliminando aduana");
}

// 🔹 Eliminar transporte
export async function deleteTransporte(id) {
    const res = await fetch(`${API_TRANSPORTE}/eliminar/${id}`, {
        credentials: "include",
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error eliminando transporte");
}

// 🔹 Eliminar recolección
export async function deleteRecoleccion(id) {
    const res = await fetch(`${API_RECO}/eliminarRecoleccion/${id}`, {
        credentials: "include",
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error eliminando recolección");
}

// 🔹 Eliminar observaciones
export async function deleteObservaciones(id) {
    const res = await fetch(`${API_OBS}/eliminarObservacion/${id}`, {
        credentials: "include",
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error eliminando observaciones");
}

// 🔹 (Opcional) Actualizar orden
export async function updateOrden(id, data) {
    const res = await fetch(`${API_URL}/updateOrden/${id}`, {
        credentials: "include",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text || "Error al actualizar orden");

    try {
        return JSON.parse(text);
    } catch {
        return { status: "Éxito", mensaje: text };
    }
}