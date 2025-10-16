const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiTipoCliente";

export async function getType() {
    const response = await fetch(`${API__URL}/obtenerTodos`, {credentials: "include"});
    if (!response.ok) {
        throw new Error("Error obteniendo tipo de cliente");
    }
    return await response.json();
}