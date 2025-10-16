import { me, logout } from '../Services/LoginServices.js';

document.getElementById("btnIngresar").addEventListener("click", async (e) => {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const contrasenia = document.getElementById("contraseña").value;

  try {
    const res = await fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ usuario, contrasenia }),
    });

    if (!res.ok) {
      const text = await res.text();
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: text || "Credenciales inválidas",
      });
    }

    // 🔹 Consultar al backend los datos del usuario logueado
    const info = await me();
    console.log("Usuario autenticado:", info);


    // 🔹 Acceso permitido solo a Cliente y Transportista
    Swal.fire({
      icon: "success",
      title: "Bienvenido",
      text: "Inicio de sesión exitoso",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "index.html";

    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor",
    });
  }
});
