const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiUsuario";


export async function getUsuarioPaginacion(page = 0, size = 5) {
    const res = await fetch(`${API__URL}/dataUsuario?page=${page}&size=${size}`,{credentials: "include"});
    if (!res.ok) throw new Error("Error al obtener usuarios");
    
    const data = await res.json();
    
    // El backend devuelve un objeto Page<DTOUsuario>
    return {
        content: data.content || [],
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        pageNumber: data.number || 0
    };
}

/*export async function getUsers() {
    const res = await fetch(`${API__URL}/obtenerUsuarios`);
    return res.json();
}*/

export async function createUsers(data) {
    const response = await fetch(`${API__URL}/postUsuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error creando usuario:", errorText);
        throw new Error("Error al crear usuario");
    }
    return await response.json();
}

export async function updateUsers(id, data) {
    const response = await fetch(`${API__URL}/updateUsuario/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error actualizando usuario:", errorText);
        throw new Error("Error al actualizar usuario");
    }
    return await response.json();
}

export async function deleteUsers(id) {
    const response = await fetch(`${API__URL}/deleteUsuario/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Error al eliminar usuario");
    }
}