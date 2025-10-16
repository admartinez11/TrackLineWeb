import { me, logout } from "../Services/LoginServices";

// Estado de sesión global
export const auth = {
  ok: false, //Indica si la sesión está activa
  user: null, //Guarda datos del usuario autenticado
};

//Función para administrar el menu
export function ensureMenuLinks(shouldShow) {
  const mainMenu = document.getElementById("bottom-menu");
}

export async function renderUser() {
  try {
    const info = await me();
    
    console.log("Respuesta de /me:", info);

    auth.ok = !!info?.authenticated;
    auth.user = info?.user ?? null;
    
    if (auth.ok) {
      ensureMenuLinks(true);

      // Listener para logout
      document
        .getElementById("btncerrarSesion")
        ?.addEventListener("click", async () => {
          await logout(); // llama al backend para cerrar sesión
          auth.ok = false;
          auth.user = null;
          ensureMenuLinks(false); // limpia enlaces del menú
          window.location.replace("Login.html"); // redirige al login
        });
    } else {
      //Caso: no autenticado
      auth.ok = false;
      auth.user = null;
      ensureMenuLinks(false);
    }
  } catch {
    // Caso: error consultando /me → se trata como no autenticado
    auth.ok = false;
    auth.user = null;
    ensureMenuLinks(false);
  }
}


// Verifica si hay sesión activa
// Si no existe sesión y redirect es true, se envía al login
export async function requireAuth({ redirect = true } = {}) {
  try {
    const info = await me();             // consulta al backend
    auth.ok = !!info?.authenticated;
    auth.user = info?.user ?? null;
  } catch {
    auth.ok = false;
    auth.user = null;
  }

  if (!auth.ok && redirect) {
    window.location.replace("Login.html");
  }
  return auth.ok; // devuelve booleano indicando si hay sesión
}

export function getUserRole(){
    //"Administrador" | "Transportista" | "Cliente" (o undefined)
    return auth.user?.rol || "";
}

export function hasAuthority(authority){
    // "ROlE_Administrador", "ROLE_Transportista", "ROLE_Cliente"
    return Array.isArray(auth.user?.authorities)
        ? auth.user.authorities.includes(authority)
        : false;
}


export const role = { 
  isAdmin: () =>
    getUserRole() === "Administrador" || hasAuthority("ROLE_Administrador"),

  isTransportista: () =>
    getUserRole() === "Transportista" || hasAuthority("ROLE_Transportista"),

  isCliente: () =>
    getUserRole() === "Cliente" || hasAuthority("ROLE_Cliente"),

  isEmpleado: () =>
    getUserRole() === "Empleado" || hasAuthority("ROLE_Empleado"),
};

// Refresca automáticamente la sesión y el menú al volver con botón Atrás (bfcache)
window.addEventListener("pageshow", async () => {
    await renderUser();
});