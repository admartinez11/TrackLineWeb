document.getElementById("btnIngresar").addEventListener("click", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const contrasenia = document.getElementById("contraseña").value.trim();

    if (!usuario || !contrasenia) {
        Swal.fire({
            icon: "warning",
            title: "Campos vacíos",
            text: "Por favor ingresa tu usuario y contraseña antes de continuar.",
            confirmButtonColor: "#0A1D37"
        });
        return;
    }

    try {
        const res = await fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ usuario, contrasenia })
        });

        if (res.ok) {
            Swal.fire({
                icon: "success",
                title: "Inicio de sesión exitoso",
                text: "¡Bienvenido!",
                confirmButtonColor: "#0A1D37"
            }).then(() => {
                window.location.href = "index.html"; // Página principal
            });
        } else {
            const text = await res.text();
            Swal.fire({
                icon: "error",
                title: "Error de inicio de sesión",
                text: text || "Usuario o contraseña incorrectos.",
                confirmButtonColor: "#d33"
            });
        }
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor. Intenta nuevamente más tarde.",
            confirmButtonColor: "#d33"
        });
    }
});