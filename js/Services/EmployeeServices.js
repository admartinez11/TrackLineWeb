const API__URL = "https://apitrackline-3047cf7af332.herokuapp.com/apiEmpleados";


// Obtener empleados con paginación
export async function getEmployeesPaginacion(page = 0, size = 5) {
    const res = await fetch(`${API__URL}/datosEmpleados?page=${page}&size=${size}`, {credentials: "include"});
    if (!res.ok) throw new Error("Error al obtener empleados");
    const data = await res.json();

    if (data.data && data.data.content) return data.data;
    if (data.content) return data;
    if (Array.isArray(data)) return { content: data, totalPages: 1 };
    return { content: [], totalPages: 0 };
}

export async function getEmployees() {
    const res = await fetch(`${API__URL}/obtenerEmpleados`, {credentials: "include"});
    return res.json();
}

export async function createEmployee(data) {
    const response = await fetch(`${API__URL}/agregarEmpleado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error creando empleado:", errorText);
        throw new Error("Error al crear empleado");
    }
    return await response.json();
}

export async function updateEmployee(id, data) {
    const response = await fetch(`${API__URL}/actualizarEmpleado/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error actualizando empleado:", errorText);
        throw new Error("Error al actualizar empleado");
    }
    return await response.json();
}

export async function deleteEmployee(id) {
    const response = await fetch(`${API__URL}/eliminarEmpleado/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Error al eliminar empleado");
    }
}