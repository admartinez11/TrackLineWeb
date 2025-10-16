fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
            credentials: "include" 
        })
        .then(res => {
            if (!res.ok) throw new Error("No autorizado");
        })
        
.catch(() => {
    window.location.href = "Login.html";
});


import { getPedidos } from "../Services/OrdersService.js";

document.addEventListener("DOMContentLoaded", () => {
  const listaPedidos = document.getElementById("listaPedidos");
  let pedidos = [];

  // 🔹 Cargar pedidos desde la API
  async function loadPedidos() {
    try {   
      const res = await getPedidos(0, 50); // Trae hasta 50 pedidos
      pedidos = res.content || [];

      renderPedidos(pedidos);
    } catch (error) {
      listaPedidos.innerHTML = `<p style="color:red">Error al cargar los pedidos.</p>`;
      console.error(error);
    }
  }

  // 🔹 Renderizar tarjetas de pedidos
  function renderPedidos(lista) {
    if (!lista || lista.length === 0) {
      listaPedidos.innerHTML = `<p>No hay pedidos disponibles.</p>`;
      return;
    }

    listaPedidos.innerHTML = lista.map(p => `
      <div class="pedido">
        <h3>Pedido #${p.idViaje}</h3>
        <p>Hora salida: ${p.horaSalida ? new Date(p.horaSalida).toLocaleString() : "N/A"}</p>
        <p>Hora estimada llegada: ${p.horaEstimadaLlegada ? new Date(p.horaEstimadaLlegada).toLocaleString() : "N/A"}</p>
        <a href="ProductTracking.html?id=${p.idViaje}" class="detalle-link">Más información</a>
      </div>
    `).join('');
  }

  loadPedidos();
});


/*
// =======================
// Seguimiento de productos (círculo de progreso)
// =======================
document.addEventListener('DOMContentLoaded', () => {
  const steps = document.querySelectorAll('.step');
  const progressCircle = document.querySelector('.progress-ring-fill');
  const progressText = document.querySelector('.progress-text');
  const progressContainer = document.querySelector('.progress-container');

  if (!progressCircle || !progressText) return; // seguridad

  const radius = 100;
  const circumference = 2 * Math.PI * radius;

  progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  progressCircle.style.strokeDashoffset = circumference;

  function actualizarProgreso() {
    const total = steps.length;
    const completados = [...steps].filter(step => step.checked).length;
    const porcentaje = Math.round((completados / total) * 100);

    const offset = circumference - (porcentaje / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;

    let estado = "";
    if (porcentaje === 0) estado = "Pendiente";
    else if (porcentaje < 50) estado = "En Proceso";
    else if (porcentaje < 100) estado = "Progresando";
    else estado = "Entregado";

    progressText.innerHTML = `${porcentaje}%<br><span><b>${estado}</b></span>`;
  }

  steps.forEach(step => step.addEventListener('change', actualizarProgreso));
  actualizarProgreso();
});
*/


