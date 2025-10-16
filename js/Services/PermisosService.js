// URLs base de tu API
const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiPermisos";
const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiOrdenPermisos"; // Asumimos esta es la API para Tb_OrdenPermisos

// [GET] Obtener todos los Permisos disponibles
export async function getPermisos() {
    const res = await fetch(`${API_URL}/getPermisos`, { credentials: "include" });
    if (!res.ok) throw new Error("Error al obtener la lista de permisos disponibles");
    return res.json();
}

// [POST] Crear un nuevo Permiso global
export async function createPermiso(data) {
    const res = await fetch(`${API_URL}/agregarPermiso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    // Tu API devuelve status 201 con un objeto { data: permiso }
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.message || "Error al crear permiso");
    }
    // Devolvemos solo el objeto de datos
    return json.data;
}

// Relación OrdenPermiso (Tb_OrdenPermisos)

export async function createOrdenPermiso(data) {
    const res = await fetch(`${API__URL}/agregarOrdenPermiso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    // Tu API devuelve status 201 con un objeto { data: ordenPermiso }
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.message || `Error del servidor: ${res.status}`);
    }
    return json.data;
}

export async function updatePermiso(id, data) {
    // Esta función apunta a /actualizarOrdenPermiso/{id} en el controller original
    await fetch(`${API__URL}/actualizarOrdenPermiso/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });
}