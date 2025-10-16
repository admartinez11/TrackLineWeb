//Parte CRUD
const API_URL = 'https://apitrackline-3047cf7af332.herokuapp.com/apiFinanciamiento';
const API_URL_TIPO = 'https://apitrackline-3047cf7af332.herokuapp.com/apiTipoF';

export async function getTiposFinanciamiento() {
  const res = await fetch(`${API_URL_TIPO}/getSinPaginacion`, { credentials: 'include' });
  return res.json();
}

export async function getFinanciamiento() {
  const res = await fetch(`${API_URL}/get`, { credentials: 'include' });
  return res.json();
}

export async function createFinanciamiento(data) { 
  // 'data' son los datos que se guardan
  await fetch(`${API_URL}/agregarFinanciamiento`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function updateFinanciamiento(id, data) {
  // el 'id' se usa para saber cuál actualizaremos y 'data' para recibir los datos
  await fetch(`${API_URL}/actualizarFinanciamiento/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}

export async function deleteFinanciamiento(id) {
  await fetch(`${API_URL}/eliminarFinanciamiento/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
}

export async function getFinanciamientoById(id) {
    const res = await fetch(`${API_URL}/obtenerFinanciamientoPorId/${id}`, { credentials: "include" });
    return res.json();
}

export async function getCargosByOrden(idOrdenServicio) {
    const res = await fetch(`${API_URL}/obtenerCargosPorOrden/${idOrdenServicio}`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Error al obtener los cargos por orden");
    return await res.json();
}