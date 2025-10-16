//Parte CRUD
const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiCargos";
const API_URL_LOCAL = "https://apitrackline-3047cf7af332.herokuapp.com/apiTipoDatoContable";

export async function getCargoPorId(id) {
    const res = await fetch(`${API_URL}/obtenerCargoPorId/${id}`, {
        credentials: "include"
    });
    return res.json();
}

export async function getCargos() {
    const res = await fetch(`${API_URL}/dataCargos`, {
        credentials: "include"
    });
    return res.json();
}

export async function getCargosByOrden(idOrdenServicio) {
    const res = await fetch(`${API_URL}/obtenerCargosPorOrden/${idOrdenServicio}`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Error al obtener los cargos por orden");
    return await res.json();
}

export async function getTipoDatoContable() {
    const res = await fetch(`${API_URL_LOCAL}/dataDatoContable`, {
        credentials: "include"
    });
    return res.json();
}

export async function createCargo(data) {
    await fetch(`${API_URL}/agregarCargo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });
}

export async function updateCargo(id, data) {
    await fetch(`${API_URL}/actualizarCargo/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });
}

export async function deleteCargo(id) {
    await fetch(`${API_URL}/eliminarCargo/${id}`, {
        method: "DELETE",
        credentials: "include"
    });
}