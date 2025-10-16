const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiTransportista";

export async function getTransportista() {
    const response = await fetch(`${API__URL}/dataTransportista`, {credentials: "include"});
    if (!response.ok) {
        throw new Error("Error obteniendo transportista");
    }
    return await response.json();
}