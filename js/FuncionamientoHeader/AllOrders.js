document.addEventListener("DOMContentLoaded", function () {
    // Elementos del menú
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const inputBusqueda = document.getElementById("inputBusquedaOS");
    const menuItems = document.querySelectorAll('.menu-item.has-submenu');

    if (menuToggle && sideMenu && menuOverlay) {
        // Toggle del menú
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            sideMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = sideMenu.classList.contains('active') ? 'hidden' : 'auto';
        });

        menuOverlay.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // Submenús
    menuItems.forEach(item => {
        const submenuId = item.getAttribute('data-submenu');
        const submenu = document.getElementById(submenuId);
        if (!submenu) return;

        item.addEventListener('click', (e) => {
            e.preventDefault();

            menuItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherSubmenuId = otherItem.getAttribute('data-submenu');
                    if (otherSubmenuId) {
                        const otherSubmenu = document.getElementById(otherSubmenuId);
                        if (otherSubmenu) otherSubmenu.classList.remove('active');
                    }
                }
            });

            item.classList.toggle('active');
            submenu.classList.toggle('active');
        });
    });

    // Cerrar menú con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            menuToggle.classList.remove('active');
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Modales
    const transportModalEl = document.getElementById("transportModal");
    const driverModal = document.getElementById("driverModal");
    const serviceModal = document.getElementById("serviceModal");

    if (driverModal && transportModalEl) {
        driverModal.addEventListener("hidden.bs.modal", function () {
            const transportModal = bootstrap.Modal.getOrCreateInstance(transportModalEl);
            transportModal.show();
        });
    }

    if (serviceModal && transportModalEl) {
        serviceModal.addEventListener("hidden.bs.modal", function () {
            const transportModal = bootstrap.Modal.getOrCreateInstance(transportModalEl);
            transportModal.show();
        });
    }

    // Botón activar contenido
    const botonActivar = document.getElementById('boton-activar');
    const contenidoOculto = document.getElementById('contenido-oculto');

    if (botonActivar && contenidoOculto) {
        botonActivar.addEventListener('click', () => {
            const hijos = contenidoOculto.querySelectorAll('.oculto');
            hijos.forEach(hijo => {
                hijo.style.display = hijo.style.display === 'block' ? 'none' : 'block';
            });
        });
    }

  if (inputBusqueda) {
    inputBusqueda.addEventListener("keyup", () => {
      const filtro = inputBusqueda.value.toLowerCase();
      const filas = document.querySelectorAll("#ordersTable tbody tr");

      filas.forEach(fila => {
        const texto = fila.textContent.toLowerCase();
        fila.style.display = texto.includes(filtro) ? "" : "none";
      });
    });
  }
});

document.getElementById('btncerrarSesion').addEventListener('click', function() {
  window.location.href = 'Login.html';
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

// Filtro de búsqueda
function filtrarOrdenes() {
  const filtro = document.getElementById('inputBusquedaOS').value.toLowerCase();
  const filas = document.querySelectorAll('#ordersTable tbody tr');

  filas.forEach(fila => {
    const texto = fila.textContent.toLowerCase();
    fila.style.display = texto.includes(filtro) ? '' : 'none';
  });
}


