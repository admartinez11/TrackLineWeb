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


// Filtro de búsqueda
function filtrarTransportistas() {
  const filtro = document.getElementById('inputBusquedaTransportista').value.toLowerCase();
  const filas = document.querySelectorAll('#driversTable tbody tr');

  filas.forEach(fila => {
    const texto = fila.textContent.toLowerCase();
    fila.style.display = texto.includes(filtro) ? '' : 'none';
  });
}

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

document.getElementById('btncerrarSesion').addEventListener('click', function() {
  window.location.href = 'Login.html';
});