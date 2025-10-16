//Parte CRUD
const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiAduana";

export async function getAduana() {
    const res = await fetch(`${API_URL}/datosAduana`, { credentials: "include" });
    return res.json();
}

export async function createAduana(data) {
    //"data" son los datos que se guardan
    const res = await fetch(`${API_URL}/agregarAduana`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw new Error("Error al crear la aduana");
    }

    return await res.json(); // devuelve la orden creada con ID
}

export async function updateAduana(id, data) {
    //el "id" se usa para saber cual actualizaremos y "data" para recibir los datos
    await fetch(`${API_URL}/actualizarAduana/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });
}

export async function deleteAduana(id) {
    await fetch(`${API_URL}/eliminarAduana/${id}`, {
        method: "DELETE",
        credentials: "include"
    });
}

export async function getAduanaById(id) {
    const res = await fetch(`${API_URL}//obtenerAduanaPorId/${id}`, { credentials: "include" });
    return res.json();
}

