const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiTransporte";


export async function getTransportePaginacion(page = 0, size = 5) {
    const res = await fetch(`${API__URL}/get?page=${page}&size=${size}`, {credentials: "include"});
    if (!res.ok) throw new Error("Error al obtener transporte");
    
    const data = await res.json();

    return {
        content: data.content || [],
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        pageNumber: data.number || 0
    };
}

export async function createTransporte(data) {
    const response = await fetch(`${API__URL}/agregar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error creando transporte:", errorText);
        throw new Error("Error al crear transporte");
    }
    return await response.json();
}

export async function updateTransporte(id, data) {
    const response = await fetch(`${API__URL}/actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error actualizando transporte:", errorText);
        throw new Error("Error al actualizar transporte");
    }
    return await response.json();
}

export async function deleteTransporte(id) {
    const response = await fetch(`${API__URL}/eliminar/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Error al eliminar transporte");
    }
}