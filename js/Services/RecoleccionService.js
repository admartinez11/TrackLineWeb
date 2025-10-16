const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiRecoleccion";

export async function createRecoleccion(data){
    //"data" son los datos que se guardan
    const res = await fetch(`${API_URL}/agregarRecoleccion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        throw new Error("Error al crear la recolección");
    }

    return await res.json(); // devuelve la orden creada con ID
}

export async function getRecoleccion(id) {
    const res = await fetch(`${API_URL}/obtenerRecoleccionPorId/${id}`, { credentials: "include" });
    return res.json();
}

export async function updateRecoleccion(id, data) {
    //el "id" se usa para saber cual actualizaremos y "data" para recibir los datos
    await fetch(`${API_URL}/actualizarRecoleccion/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });
}