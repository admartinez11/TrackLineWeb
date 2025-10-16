const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiViaje";

// 🔹 Obtener todos los pedidos (sin paginación avanzada)
export async function getPedidos(page = 0, size = 100) {
  try {
    const res = await fetch(`${API_URL}/datosViaje?page=${page}&size=${size}`, {credentials: "include"});
    if (!res.ok) {
      console.error("Error en fetch:", res.status, res.statusText);
      return { content: [], totalPages: 1 };a
    }
    return await res.json(); // retorna { content, totalPages, ... }
  } catch (error) {
    console.error("Error cargando viajes:", error);
    return { content: [], totalPages: 1 };
  }
}

// 🔹 Obtener un pedido por ID
export async function getPedidoById(id) {
  try {
    const res = await fetch(`${API_URL}/buscarPorId/${id}`, {credentials: "include"});
    if (!res.ok) {
      console.error("Error al obtener el pedido:", res.status, res.statusText);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Error cargando pedido por ID:", error);
    return null;
  }
}
