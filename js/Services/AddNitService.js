// Services/AddNitService.js
export const API_URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiClientes";

// 🔹 Obtener todos los clientes
export async function getCliente() {
    try {
        const response = await fetch(`${API_URL}/clientes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },  
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`❌ Error en la petición: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📦 Clientes recibidos:", data); // 👀 Debug
        return data;

    } catch (error) {
        console.error("⚠️ Ha ocurrido un error al cargar los clientes:", error);
        throw error;
    }
}
