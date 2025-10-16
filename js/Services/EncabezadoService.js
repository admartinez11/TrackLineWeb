//Parte CRUD
const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiOrden";


export async function getDataOrden() {
    const res = await fetch(`${API_URL}/dataOrden`, { credentials: "include" });
    return res.json();
}

export async function getEncabezadoById(id) {
  try {
    const response = await fetch(`${API_URL}/buscarPorId/${id}`, {
      method: "GET",
      credentials: "include", // 👈 importante para autenticación
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener el encabezado");
    }

    // ✅ Aquí definimos correctamente 'data'
    const data = await response.json();
    return data;

  } catch (error) {
    console.error("❌ Error en getEncabezadoById:", error);
    throw error;
  }
}


export async function createOrden(data) {
    //"data" son los datos que se guardan

    const res = await fetch(`${API_URL}/postOrden`, {
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

export async function updateOrden(id, data) {
    //el "id" se usa para saber cual actualizaremos y "data" para recibir los datos
    await fetch(`${API_URL}/updateOrden/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });
}

export async function deleteOrden(id) {
    await fetch(`${API_URL}/deleteOrden/${id}`, {
        method: "DELETE",
        credentials: "include"
    });
}

export async function getEncabezado(id) {
    const res = await fetch(`${API_URL}/buscarPorId/${id}`, { credentials: "include" });
    return res.json();
}
