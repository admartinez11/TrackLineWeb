const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiClientes";

export async function getClient() {
    const res = await fetch(`${API__URL}/clientes`, {credentials: "include"});
    return res.json();
}

// Obtener clientes con paginación
export async function getClientsPaginacion(page = 0, size = 5) {
    const res = await fetch(`${API__URL}/datosClientes?page=${page}&size=${size}`, {credentials: "include"});
    if (!res.ok) throw new Error("Error al obtener clientes");
    const data = await res.json();

    if (data.data && data.data.content) return data.data;
    if (data.content) return data;
    if (Array.isArray(data)) return { content: data, totalPages: 1 };
    return { content: [], totalPages: 0 };
}

//Sin paginación
export async function createClient(data) {
    const response = await fetch(`${API__URL}/agregarCliente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error creando cliente:", errorText);
        throw new Error("Error al crear cliente");
    }
    return await response.json();
}

export async function updateClient(nit, data) {
    const response = await fetch(`${API__URL}/actualizarCliente/${nit}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error actualizando cliente:", errorText);
        throw new Error("Error al actualizar cliente");
    }
    return await response.json();
}

export async function deleteClient(nit) {
    const response = await fetch(`${API__URL}/eliminarCliente/${nit}`, {
        method: "DELETE",
        credentials: "include"
    });

    const data = await response.json().catch(() => null); // si viene vacío, evita error

    if (!response.ok) {
        console.error("Error eliminando cliente:", data);
        throw new Error(data?.message || "Error al eliminar cliente");
    }

    return data || { status: "Éxito", message: "Cliente eliminado correctamente" };
}