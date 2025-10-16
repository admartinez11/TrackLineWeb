const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiServicioTransporte";


// Obtener empleados con paginación
export async function getServicioTransportePaginacion(page = 0, size = 5) {
    const res = await fetch(`${API__URL}/data?page=${page}&size=${size}`, {credentials: "include"});
    if (!res.ok) throw new Error("Error al obtener Servicio Transporte");
    const data = await res.json();

    if (data.data && data.data.content) return data.data;
    if (data.content) return data;
    if (Array.isArray(data)) return { content: data, totalPages: 1 };
    return { content: [], totalPages: 0 };
}

export async function getServicioTransporte() {
    const res = await fetch(`${API__URL}/data`);
    return res.json();
}

export async function createServicioTransporte(data) {
    const response = await fetch(`${API__URL}/postST`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error creando empleado:", errorText);
        throw new Error("Error al Servicio Transporte");
    }
    return await response.json();
}

export async function updateServicioTransporte(id, data) {
    const response = await fetch(`${API__URL}/patchST/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error actualizando empleado:", errorText);
        throw new Error("Error al actualizar Servicio Transporte");
    }
    return await response.json();
}

export async function deleteServicioTransporte(id) {
    const response = await fetch(`${API__URL}/deleteST/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    const data = await response.json(); // leer respuesta del backend

    if (!response.ok) {
        // Lanzar error con el mensaje real del backend
        throw new Error(data.message || "Error al eliminar Servicio Transporte");
    }

    // Retornar data para que el frontend pueda usarla
    return data;
}
