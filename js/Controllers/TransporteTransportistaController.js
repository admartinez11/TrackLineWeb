// ===================== VALIDAR SESIÓN =====================
fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
    credentials: "include"
})
    .then(res => {
        if (!res.ok) throw new Error("No autorizado");
    })
    .catch(() => {
        window.location.href = "Login.html";
    });

document.addEventListener("DOMContentLoaded", async () => {
    const combo = document.getElementById("transportista");
    const btnGuardar = document.getElementById("guardarTransporte");

    if (!combo || !btnGuardar) return;

    // 🔑 CAMBIO AÑADIDO: Leer el ID de la orden de edición
    const idToSelect = localStorage.getItem("tempIdTransporteToLoad");

    // --- Cargar opciones del combo ---
    try {
        console.log("Iniciando carga de datos del transporte...");

        const [resTransporte, resTransportistas, resServicios] = await Promise.all([
            // 1. Obtener Transportes (la tabla de relación)
            fetch("https://apitrackline-3047cf7af332.herokuapp.com/apiTransporte/getTransporte", { credentials: "include" }),
            // 2. Obtener Transportistas (los nombres/apellidos)
            fetch("https://apitrackline-3047cf7af332.herokuapp.com/apiTransportista/dataTransportista", { credentials: "include" }),
            // 3. Obtener Servicios de Transporte (las placas)
            fetch("https://apitrackline-3047cf7af332.herokuapp.com/apiServicioTransporte/get", { credentials: "include" })
        ]);

        if (!resTransporte.ok || !resTransportistas.ok || !resServicios.ok) {
            // Muestra qué petición falló
            console.error("Fallo de API:", {
                transporte: resTransporte.status,
                transportistas: resTransportistas.status,
                servicios: resServicios.status
            });
            throw new Error("Error al obtener datos de una o más APIs.");
        }

        const transporteData = await resTransporte.json();
        const transportistasData = await resTransportistas.json();
        const serviciosData = await resServicios.json();

        const transportes = transporteData.content || transporteData;
        const transportistas = transportistasData.content || transportistasData;
        const servicios = serviciosData.content || serviciosData;

        // 4. Mapeo y Join de datos
        const lista = transportes.map(t => {
            const tr = transportistas.find(tr => tr.idTransportista === t.idTransportista);
            const st = servicios.find(s => s.idServicioTransporte === t.idServicioTransporte);

            return {
                idTransporte: t.idTransporte,
                placa: st?.placa || "Sin placa",
                nombreCompleto: tr ? `${tr.nombre} ${tr.apellido || ""}`.trim() : "Sin asignar"
            };
        });

        // 5. Llenado del Combo
        combo.innerHTML = '<option value="">Seleccione un transporte</option>';
        lista.forEach(item => {
            const option = document.createElement("option");
            option.value = item.idTransporte;
            option.textContent = `${item.placa} - ${item.nombreCompleto}`;
            combo.appendChild(option);
        });
        if (idToSelect && idToSelect !== "null" && idToSelect !== "undefined") {
            combo.value = idToSelect; // Establece el valor guardado para mostrarlo
            localStorage.removeItem("tempIdTransporteToLoad"); // Limpiamos la clave
            console.log(`✅ Transporte ${idToSelect} preseleccionado y mostrado.`);
        }

        console.log(`✅ Combo cargado con ${lista.length} opciones.`);

    } catch (err) {
        console.error("❌ Error CRÍTICO cargando transportistas:", err);
        combo.innerHTML = '<option value="">Error cargando transportistas</option>';
    }

    // --- Evento guardar (Tu lógica existente de localStorage) ---
    btnGuardar.addEventListener("click", (e) => {
        e.preventDefault();

        const selectedOption = combo.options[combo.selectedIndex];
        if (!selectedOption || !selectedOption.value) {
            Swal.fire({
                icon: "warning",
                title: "Campo obligatorio",
                text: "Debe seleccionar un transporte antes de continuar.",
                confirmButtonText: "Entendido"
            });
            return;
        }

        const idTransporte = selectedOption.value;
        localStorage.setItem("idTransporte", idTransporte);

        Swal.fire({
            icon: "success",
            title: "Información de Transporte guardada correctamente",
            timer: 1500,
            showConfirmButton: false,
        })
    });
});