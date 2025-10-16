const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiOrdenServicio";

export async function getUltimaOrdenServicio() {
    try {
        const res = await fetch(`${API_URL}/buscarUltimoId`, { credentials: "include" });
        if (!res.ok) throw new Error(`Error en la petición: ${res.status} ${res.statusText}`);
        return await res.json();
    } catch (error) {
        console.error("Ha ocurrido un error al cargar la orden:", error);
        throw error;
    }
}

export async function createOrdenServicio(data) {
    try {
        const res = await fetch(`${API_URL}/crear`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error(`Error al crear la orden: ${res.status} ${res.statusText}`);

        const json = await res.json();
        console.log("Respuesta completa del backend:", json);
        return json;
    } catch (error) {
        console.error("Error en createOrdenServicio:", error);
        throw error;
    }
}

export async function putOrdenServicio(id, data) {
    const res = await fetch(`${API_URL}/actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Error al actualizar la orden: ${res.status} ${res.statusText}`);
    return await res.json();
}

export async function deleteOrdenServicio(id) {
    const res = await fetch(`${API_URL}/eliminar/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!res.ok) throw new Error(`Error al eliminar la orden: ${res.status} ${res.statusText}`);
    return await res.json();
}

// Endpoints auxiliares
const API_ENCABEZADO = "https://apitrackline-3047cf7af332.herokuapp.com/apiOrden";
const API_EMBARQUE = "https://apitrackline-3047cf7af332.herokuapp.com/apiInfoEmbarque";
const API_ADUANA = "https://apitrackline-3047cf7af332.herokuapp.com/apiAduana";
const API_TRANSPORTE = "https://apitrackline-3047cf7af332.herokuapp.com/apiTransporte";
const API_RECO = "https://apitrackline-3047cf7af332.herokuapp.com/apiRecoleccion";
const API_OBS = "https://apitrackline-3047cf7af332.herokuapp.com/apiObservaciones";

export async function getOrdenesPaginacion(page = 0, size = 5) {
    const res = await fetch(`${API_URL}/datosOrdenesServicio?page=${page}&size=${size}`);
    if (!res.ok) throw new Error("Error al obtener ordenes");
    const data = await res.json();

    if (data.data && data.data.content) return data.data;
    if (data.content) return data;
    if (Array.isArray(data)) return { content: data, totalPages: 1 };
    return { content: [], totalPages: 0 };
}

export async function deleteOrden(id) {
    const response = await fetch(`${API_URL}/eliminar/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Error al eliminar la orden");
    return await response.json();
}

export async function deleteEncabezado(id) {
    const res = await fetch(`${API_ENCABEZADO}/deleteOrden/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando encabezado");
}

export async function deleteInfoEmbarque(id) {
    const res = await fetch(`${API_EMBARQUE}/eliminarInfoEmbarque/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando info embarque");
}

export async function deleteAduana(id) {
    const res = await fetch(`${API_ADUANA}/eliminarAduana/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando aduana");
}

export async function deleteTransporte(id) {
    const res = await fetch(`${API_TRANSPORTE}/eliminar/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando transporte");
}

export async function deleteRecoleccion(id) {
    const res = await fetch(`${API_RECO}/eliminarRecoleccion/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando recolección");
}

export async function deleteObservaciones(id) {
    const res = await fetch(`${API_OBS}/eliminarObservacion/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando observaciones");
}
 
// 🔹 Obtener orden por ID (para editar / cargar campos)
export async function getOrdenServicioById(id) {
    const res = await fetch(`${API_URL}/buscarPorId/${id}`, {
        credentials: "include"
    });
 
    if (!res.ok) {
        throw new Error(`Error al obtener orden ${id}: ${res.status} ${res.statusText}`);
    }
 
    return await res.json();
}
 