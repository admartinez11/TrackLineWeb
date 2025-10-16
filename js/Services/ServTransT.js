const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiServicioTransporte";

export async function getServTrans() {
    const response = await fetch(`${API__URL}/get`, {credentials: "include"});
    if (!response.ok) {
        throw new Error("Error obteniendo Servicio de Transporte");
    }
    return await response.json();
}