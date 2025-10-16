//Parte CRUD
const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiTransportista";
const API_URL_TRANS = "https://apitrackline-3047cf7af332.herokuapp.com/apiTransporte";

export async function getTransportista(){
    const res = await fetch(`${API_URL}/dataTransportista`, {credentials: "include"});
    return res.json();
}

export async function createTransportista(data) { 
    //"data" son los datos que se guardan
    await fetch(`${API_URL}/postTransportista`, {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export async function updateTransportista(id, data) {
    //el "id" se usa para saber cual actualizaremos y "data" para recibir los datos
    await fetch(`${API_URL}/updateTransportista/${id}`, {
        method: "PUT",
        credentials: "include", 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
}

export async function deleteTransportista(id) {
    await fetch(`${API_URL}/deleteTransportista/${id}`, {
        method: "DELETE", 
        credentials: "include"
    });
}

export async function getTransporte(id) {
    const res = await fetch(`${API_OBS_URL}/obtenerTransportePorId/{id}`, { credentials: "include" });
    return res.json();
}