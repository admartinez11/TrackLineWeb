const API_URL_TRANSPORTE = "https://apitrackline-3047cf7af332.herokuapp.com/apiTransporte"; 

// ======================================================================
// FUNCIÓN PRINCIPAL: ASIGNAR/ACTUALIZAR TRANSPORTE EN LA ORDEN DE SERVICIO
// ======================================================================

export async function updateTransporte(data) {
    const url = API_URL_TRANSPORTE; // Endpoint para la actualización
    
    try {
        const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include", 
            // 🔑 Se espera que el backend reciba { idTransporte, idOrdenServicio } y actualice Tb_OrdenServicios
            body: JSON.stringify(data) 
        });
        
        // Manejo de errores (capturará el 403 Forbidden, 401 Unauthorized, etc.)
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw { status: res.status, message: errorData.message || res.statusText, errors: errorData };
        }
        
        const result = await res.json();
        return { success: true, data: result };

    } catch (error) {
        console.error("Error en updateTransporte service:", error);
        return { 
            success: false, 
            message: error.message || "Fallo en la conexión o en el servidor al actualizar el transporte." 
        };
    }
}