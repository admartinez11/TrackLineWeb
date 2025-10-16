const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiUsuario";

export async function getUserByUser(user) {
    const response = await fetch(`${API__URL}/buscarUsuarioPorNombre/${user}`, {credentials: "include"});
    if (!response.ok) {
        return null; 
    }
    return await response.json();
}
