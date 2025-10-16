//Parte CRUD
const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiInfoEmbarque";


export async function getInforEmbarque() {
    const res = await fetch(`${API_URL}/datosInfoEmbarque`, { credentials: "include" });
    return res.json();
}

export async function createInfoEmbarque(data) {
    //"data" son los datos que se guardan
    const res = await fetch(`${API_URL}/agregarInfoEmbarque`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw new Error("Error al crear la orden");
    }

    return await res.json(); // devuelve la orden creada con ID
}

export async function updateInfoEmbarque(id, data) {
    //el "id" se usa para saber cual actualizaremos y "data" para recibir los datos
    await fetch(`${API_URL}/actualizarInfoEmbarque/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });
}

export async function deleteInfoEmbarque(id) {
    await fetch(`${API_URL}/deleteOrden/${id}`, {
        method: "DELETE",
        credentials: "include"
    });
}

export async function getInforEmbarqueById(id) {
    const res = await fetch(`${API_URL}/obtenerInfoEmbarquePorId/{id}/${id}`, { credentials: "include" });
    return res.json();
}
