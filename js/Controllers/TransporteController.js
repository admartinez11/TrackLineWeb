fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
            credentials: "include" 
        })
        .then(res => {
            if (!res.ok) throw new Error("No autorizado");
        })
        
.catch(() => {
    window.location.href = "Login.html";
});


import {
    getTransportista,
    createTransportista,
    updateTransportista,
    deleteTransportista
} from "../Services/TransporteService.js";

document.addEventListener("DOMContentLoaded", () => {
    const transportista = document.getElementById("transportista");
    const btnAdd = document.getElementById("guardarTransporte");
    const idGuardado = localStorage.getItem("id");

    // Acción: Crear transportista
    btnAdd.addEventListener("click", async (e) => {
        e.preventDefault();

        // 🔹 Validación
        if (!transportista.value.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Campo obligatorio",
                text: "Debes ingresar el nombre del transportista."
            });
            return;
        }

        const data = {
            nombre: transportista.value.trim()
        };

        console.log("📤 Enviando al backend:", data);

        try {
            const id = await createTransportista(data); // recibimos el objeto creado
            console.log("Transportista creado con data:", data);

            // Guardar ID en el label (si existe)
            const lblIdTransportista = document.getElementById("idTransportista");
            if (lblIdTransportista) {
                lblIdTransportista.textContent = id;
                console.log("ID guardado en el label hidden:", id);
            } else {
                console.warn("⚠️ No se encontró el label para guardar el ID");
            }

            // Guardar en localStorage
            localStorage.setItem("idTransportista", id);

            // 🔹 Éxito
            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "Transportista creado correctamente"
            });
        } catch (err) {
            console.error("Error al crear Transportista:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo crear el transportista."
            });
        }

        // Función auxiliar: inicializar carga de transportistas
        function init() {
            LoadTransportistas();
        }

        // Función asíncrona para cargar los datos de la API y llenar el select
        async function LoadTransportistas() {
            try {
                const response = await getTransportista();

                if (!response.ok) {
                    throw new Error(`Error en la petición: ${response.status}`);
                }

                const transportistas = await response.json();
                const selectElement = document.getElementById("transportista");

                // Limpiar el select antes de llenarlo
                selectElement.innerHTML = "";

                // Agrega una opción por defecto
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "--- Seleccione un transportista ---";
                selectElement.appendChild(defaultOption);

                // Itera sobre la lista y crea las opciones
                transportistas.forEach((t) => {
                    const option = document.createElement("option");
                    option.value = t.idTransportista;
                    option.textContent = t.nombre;
                    selectElement.appendChild(option);
                });

            } catch (error) {
                console.error("❌ Error al cargar transportistas:", error);
                const selectElement = document.getElementById("transportista");
                selectElement.innerHTML = "<option>Error al cargar datos</option>";

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Hubo un problema al cargar los transportistas."
                });
            }
        }
    }); // Aquí termina el evento click
});
