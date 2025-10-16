const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiRoles";

export async function getRolByName(name) {
    const response = await fetch(`${API__URL}/getRoles/${name}`, {credentials: "include"});
    if (!response.ok) {
        return null; 
    }
    return await response.json();
}

export async function getRoles() {
    const response = await fetch(`${API__URL}/getRoles`, {credentials: "include"});
    if (!response.ok) {
        throw new Error("Error obteniendo roles");
    }
    return await response.json();
}