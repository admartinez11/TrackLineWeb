import {
  putOrdenServicio,
  deleteOrdenServicio
} from "../Services/OrdenServicioService.js"

const menuToggle = document.getElementById('menuToggle');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');
const menuItems = document.querySelectorAll('.menu-item.has-submenu');

// Toggle del menú principal
function toggleMenu() {
  menuToggle.classList.toggle('active');
  sideMenu.classList.toggle('active');
  menuOverlay.classList.toggle('active');
  document.body.style.overflow = sideMenu.classList.contains('active') ? 'hidden' : 'auto';
}

// Cerrar menú
function closeMenu() {
  menuToggle.classList.remove('active');
  sideMenu.classList.remove('active');
  menuOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Event listeners
menuToggle.addEventListener('click', toggleMenu);
menuOverlay.addEventListener('click', closeMenu);

// Submenús desplegables
menuItems.forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault();

    const submenuId = this.getAttribute('data-submenu');
    const submenu = document.getElementById(submenuId);

    // Cerrar otros submenús
    menuItems.forEach(otherItem => {
      if (otherItem !== this) {
        otherItem.classList.remove('active');
        const otherSubmenuId = otherItem.getAttribute('data-submenu');
        if (otherSubmenuId) {
          document.getElementById(otherSubmenuId).classList.remove('active');
        }
      }
    });

    // Toggle del submenú actual
    this.classList.toggle('active');
    submenu.classList.toggle('active');
  });
});

// Cerrar menú con tecla Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeMenu();
  }
});


document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const accordion = header.parentElement;
    accordion.classList.toggle('active');
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById("boton-activar");
  const submenu = document.getElementById("contenido-oculto");
  const flecha = boton.querySelector(".flecha");

  boton.addEventListener("click", function (e) {
    e.preventDefault(); // evita el salto del link
    submenu.style.display = submenu.style.display === "flex" ? "none" : "flex";
    flecha.classList.toggle("rotar");
  });
});

document.getElementById('btncerrarSesion').addEventListener('click', function () {
  window.location.href = 'Login.html';
});



//CRUD
document.getElementById("submit-button").addEventListener("click", async (e) => {
  e.preventDefault();

  // 1. Obtener el idOrdenServicio que ya debería estar en localStorage
  const idOrdenServicio = localStorage.getItem("idOrdenServicio");

  if (!idOrdenServicio) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se encontró el ID de la orden de servicio en localStorage",
    });
    return;
  }

  // 2. Obtener todos los IDs que ya guardaste en localStorage
  const data = {
    idOrdenServicio: idOrdenServicio,
    idOrdenEncabezado: localStorage.getItem("idOrdenEncabezado"),
    idInfoEmbarque: localStorage.getItem("idInfoEmbarque"),
    idAduana: localStorage.getItem("idAduana"),
    idRecoleccion: localStorage.getItem("idRecoleccion"),
    idObservaciones: localStorage.getItem("idObservacion"),
    idTransporte: localStorage.getItem("idTransporte"),
  };

  console.log("📤 Enviando pedido completo:", data);

  try {
    const result = await putOrdenServicio(idOrdenServicio, data);
    console.log("📥 Respuesta backend:", result);

    if (result.status === "Éxito" || result.data?.idOrdenServicio) {
      Swal.fire({
        icon: "success",
        title: "Pedido guardado",
        text: "La orden de servicio fue guardada correctamente",
        confirmButtonText: "OK"
      }).then((res) => {
        if (res.isConfirmed) {
          window.location.href = "AllOrders.html";
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: result.message || "No se pudo guardar el pedido",
      });
    }
  } catch (error) {
    console.error("❌ Error al guardar pedido:", error);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor",
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const cancelButton = document.getElementById("cancel-button");

  if (!cancelButton) return;

  cancelButton.addEventListener("click", async () => {
    const idOrdenServicio = localStorage.getItem("idOrdenServicio");

    if (!idOrdenServicio) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el ID de la orden de servicio",
      });
      return;
    }

    const confirmCancel = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la orden de servicio permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmCancel.isConfirmed) return;

    Swal.fire({
      title: "Eliminando...",
      text: "Por favor espere",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const result = await deleteOrdenServicio(idOrdenServicio);

      Swal.close(); // Cierra el loading

      if (result.status === "Éxito") {
        await Swal.fire({
          icon: "success",
          title: "Orden cancelada",
          text: "La orden de servicio ha sido cancelada correctamente",
        });

        // Limpiar localStorage
        ["idOrdenServicio", "idOrdenEncabezado", "idInfoEmbarque", "idAduana", "idRecoleccion", "idObservacion", "clienteNIT"]
          .forEach(key => localStorage.removeItem(key));

        // Redirigir
        window.location.href = "AddNit.html";
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "No se pudo cancelar la orden",
        });
      }
    } catch (error) {
      console.error("❌ Error al eliminar orden:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor",
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const formPedido = document.getElementById("pedido-form");
  const btnGenerarPDF = document.getElementById("descargar");

  btnGenerarPDF.addEventListener("click", () => {
    const doc = new jspdf.jsPDF();

    // ================= ENCABEZADO =================
    const fecha = document.getElementById("fecha")?.value || "";
    const encargado1 = document.getElementById("encargado1")?.value || "";
    const referencia = document.getElementById("referencia")?.value || "";
    const importador = document.getElementById("importador")?.value || "";
    const nit1 = document.getElementById("nit1")?.value || "";

    doc.setFontSize(16);
    doc.text("Pedido Aduanal", 20, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${fecha}`, 20, 40);
    doc.text(`Encargado: ${encargado1}`, 20, 50);
    doc.text(`Referencia: ${referencia}`, 20, 60);
    doc.text(`Importador: ${importador}`, 20, 70);
    doc.text(`NIT: ${nit1}`, 20, 80);

    // ================= EMBARQUE =================
    const facturas = document.getElementById("facturas")?.value || "";
    const proveedor = document.getElementById("proveedor")?.value || "";
    const bultos = document.getElementById("bultos")?.value || "";
    const kilos = document.getElementById("kilos")?.value || "";

    doc.addPage();
    doc.text("Información del embarque", 20, 20);
    doc.text(`Facturas: ${facturas}`, 20, 40);
    doc.text(`Proveedor Ref.: ${proveedor}`, 20, 50);
    doc.text(`Bultos: ${bultos}`, 20, 60);
    doc.text(`Kilos: ${kilos}`, 20, 70);

    // ================= ADUANA =================
    const tipoServicio = document.getElementById("tipoServicio")?.value || "";
    const tramitador = document.getElementById("tramitador")?.value || "";

    doc.addPage();
    doc.text("Información Aduana", 20, 20);
    doc.text(`Tipo de servicio: ${tipoServicio}`, 20, 40);
    doc.text(`Tramitador: ${tramitador}`, 20, 50);

    // ================= RECOLECCION =================
    const transporte = document.getElementById("transporte")?.checked;
    const recoleccionEntrega = document.getElementById("recoleccionEntrega")?.checked;
    const numeroDocumento = document.getElementById("documento")?.value || "";
    const lugarOrigen = document.getElementById("lugarOrigen")?.value || "";
    const paisOrigen = document.getElementById("paisOrigen")?.value || "";
    const lugarDestino = document.getElementById("lugarDestino")?.value || "";
    const paisDestino = document.getElementById("paisDestino")?.value || "";

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Recolección", 20, 20);
    doc.setFontSize(12);
    doc.text(`Transporte: ${transporte ? "Si" : "No"}`, 20, 40);
    doc.text(`Recolección Entrega: ${recoleccionEntrega ? "Si" : "No"}`, 20, 50);
    doc.text(`Número Documento: ${numeroDocumento}`, 20, 70);
    doc.text(`Lugar Origen: ${lugarOrigen}`, 20, 80);
    doc.text(`País Origen: ${paisOrigen}`, 20, 90);
    doc.text(`Lugar Destino: ${lugarDestino}`, 20, 100);
    doc.text(`País Destino: ${paisDestino}`, 20, 110);

    // ================= PERMISOS =================
    const permisos = [];
    document.querySelectorAll("#permisos-checkboxes-container input[type=checkbox]:checked")
      .forEach(chk => permisos.push(chk.dataset.name));
    const especificar = document.getElementById("especificar-permisos")?.value || "";

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Permisos", 20, 20);
    doc.setFontSize(12);

    if (permisos.length > 0) {
      let y = 40;
      permisos.forEach(p => {
        doc.text(`- ${p}`, 20, y);
        y += 10;
      });
    } else {
      doc.text("Ningún permiso seleccionado", 20, 40);
    }

    if (especificar) {
      doc.text(`Otros permisos: ${especificar}`, 20, 80);
    }

    // ================= DATOS CONTABLES =================
    const serAduanales = document.getElementById("serAduanales")?.value || "";
    const transLocal = document.getElementById("transLocal")?.value || "";
    const transInterno = document.getElementById("transInterno")?.value || "";
    const iva = document.getElementById("iva")?.value || "";
    const totalContable = document.getElementById("totalContable")?.value || "";

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Datos Contables", 20, 20);
    doc.setFontSize(12);
    doc.text(`Serv. Aduanales: ${serAduanales}`, 20, 40);
    doc.text(`Transporte Local: ${transLocal}`, 20, 50);
    doc.text(`Transporte Interno: ${transInterno}`, 20, 60);
    doc.text(`IVA: ${iva}`, 20, 70);
    doc.text(`Total: ${totalContable}`, 20, 80);

    // ================= FINANCIAMIENTOS =================
    const impuestos = document.getElementById("impuestos")?.value || "";
    const complemento = document.getElementById("complemento")?.value || "";
    const flete = document.getElementById("flete")?.value || "";
    const totalFinanciamiento = document.getElementById("totalFinanciamiento")?.value || "";

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Financiamientos", 20, 20);
    doc.setFontSize(12);
    doc.text(`Impuestos: ${impuestos}`, 20, 40);
    doc.text(`Complemento: ${complemento}`, 20, 50);
    doc.text(`Flete: ${flete}`, 20, 60);
    doc.text(`Total: ${totalFinanciamiento}`, 20, 70);

    // ================= OBSERVACIONES =================
    const estado = document.getElementById("estado")?.value || "";
    const observaciones = document.getElementById("observaciones")?.value || "";

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Observaciones", 20, 20);
    doc.setFontSize(12);
    doc.text(`Estado: ${estado}`, 20, 40);
    doc.text(`Observaciones: ${observaciones}`, 20, 50);

    // ================= TRANSPORTE =================
    const transportista = document.getElementById("transportista")?.value || "";

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Asignación de transporte", 20, 20);
    doc.setFontSize(12);
    doc.text(`Transportista: ${transportista}`, 20, 40);

    // Descargar PDF
    doc.save("PedidoAduanal.pdf");
  });
});

// === Bloque 5: Lógica de Guardar (PUT) y Redirección ===
// 🚩 ESTE ES EL CÓDIGO CLAVE CORREGIDO Y UNIFICADO
document.getElementById("submit-button").addEventListener("click", async (e) => {
    e.preventDefault();
 
    // 1. Obtener datos clave de localStorage
    const idOrdenServicio = localStorage.getItem("idOrdenServicio");
   
    // 2. Obtener el valor del select de transportistas
    const transportistaSelect = document.getElementById("transportista");
    const idTransporte = transportistaSelect.value;
   
    // Validaciones
    if (!idOrdenServicio) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se encontró el ID de la orden de servicio en localStorage",
        });
        return;
    }
 
    if (!idTransporte) {
        Swal.fire({
            icon: "warning",
            title: "Advertencia",
            text: "Por favor, seleccione un transportista."
        });
        return;
    }
 
    // 3. Guardar el ID del transportista en localStorage
    localStorage.setItem("idTransporteSeleccionado", idTransporte);
    console.log("✅ idTransporte guardado en localStorage:", idTransporte);
 
    // 4. Crear el objeto de datos a enviar al backend
    const data = {
        idOrdenServicio: idOrdenServicio,
        idOrdenEncabezado: localStorage.getItem("idOrdenEncabezado"),
        idInfoEmbarque: localStorage.getItem("idInfoEmbarque"),
        idAduana: localStorage.getItem("idAduana"),
        idRecoleccion: localStorage.getItem("idRecoleccion"),
        idObservaciones: localStorage.getItem("idObservacion"),
        idTransporte: idTransporte, // Usamos el valor capturado del select
    };
 
    console.log("📤 Enviando pedido completo:", data);
 
    try {
        const result = await putOrdenServicio(idOrdenServicio, data);
        console.log("📥 Respuesta backend:", result);
 
        if (result.status === "Éxito" || result.data?.idOrdenServicio) {
            Swal.fire({
                icon: "success",
                title: "Pedido guardado",
                text: "La orden de servicio fue guardada correctamente",
            }).then(() => {
                // Redirigir a la página de seguimiento
                window.location.href = `ProductTracking.html?idOrdenServicio=${idOrdenServicio}&idTransporte=${idTransporte}`;
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: result.message || "No se pudo guardar el pedido",
            });
        }
    } catch (error) {
        console.error("❌ Error al guardar pedido:", error);
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor",
        });
    }
});
 




