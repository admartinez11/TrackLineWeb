import { me, logout } from "./Services/LoginServices.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const info = await me();
    const rol = info?.user?.rol?.toLowerCase() || ""; // todo en minúscula
    console.log("ROL DETECTADO:", rol);

    const adminMenu = document.getElementById("boton-activar");
    const subMenu = document.getElementById("contenido-oculto");
    const closeBtn = document.getElementById("btncerrarSesion");

    // 🟢 Lista de roles permitidos por página
    const permisosPorPagina = {
      "clients.html": ["administrador"],
      "drivers.html": ["administrador"],
      "users.html": ["administrador"],
      "employees.html": ["administrador"],
      "transportservice.html": ["administrador"],
      "transport.html": ["administrador"],
      "account.html": ["administrador", "empleado"],
      "serviceorder.html": ["administrador", "empleado"],
      "allorders.html": ["administrador", "empleado"],
      "addnit.html": ["administrador", "empleado"],
      "index.html": ["administrador", "empleado"],
      "producttracking.html": ["administrador", "empleado"],
    };

    
    // Obtenemos la página actual
    const paginaActual = window.location.pathname.split("/").pop().toLowerCase();

    // Validación de acceso por página
    const rolesPermitidos = permisosPorPagina[paginaActual] || [];
    if (!rolesPermitidos.includes(rol)) {
      await logout();
      window.location.href = "Login.html";
      return; // ⚠️ detener ejecución del script
    }

    // Control del menú
    if (rol === "empleado") {
      adminMenu?.remove();
      subMenu?.remove();
    } else if (rol === "administrador") {
      if (subMenu) subMenu.style.display = "none";
      adminMenu?.addEventListener("click", (e) => {
        e.preventDefault();
        subMenu?.classList.remove("hidden")
      });
    }

    // Botón cerrar sesión
    closeBtn?.addEventListener("click", async () => {
      await logout();
      window.location.href = "Login.html";
    });

  } catch (err) {
    console.error("Error al validar rol:", err);
    window.location.href = "Login.html";
  }
});
