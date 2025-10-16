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
    getDC,
    createDC,
    updateDc,
    deleteDC
} from "../Services/DatosContablesServices.js";


document.addEventListener("DOMContentLoaded", () => {

    // Referencias a inputs del formulario
    const servAduanalesInput = document.getElementById("servAduanales");
    const transLocalInput = document.getElementById("transLocal");
    const transInternoInput = document.getElementById("transInterno");
    const permisosContablesInput = document.getElementById("permisosContables");
    const pagAdicionalInput = document.getElementById("pagAdicional");
    const emisionBLInput = document.getElementById("emisionBL");
    const manejosInput = document.getElementById("manejos");
    const ivaInput = document.getElementById("iva");
    const retencionIVAInput = document.getElementById("retencionIVA");
    const totalContableInput = document.getElementById("totalContable");

    // Botones
    const btnAdd = document.getElementById("btnAddDC");
    const btnUpdate = document.getElementById("btnUpdateDC");
    const btnDelete = document.getElementById("btnDeleteDC");

    // Función: limpiar formulario
    function clearForm() {
        tipoDeServicioInput.value = "";
        primeraModalidadInput.value = "";
        segundaModalidadInput.value = "";
        declaracionInput.value = "";
        digitadorInput.value = "";
        tramitadorInput.value = "";
    }

    // Función: validar campos
    function validateForm() {
        if (!tipoDeServicioInput.value.trim()) {
            Swal.fire({ icon: "error", title: "Campos obligatorios", text: "Debes seleccionar un tipo de servicio." });
            return false;
        }
        if (!primeraModalidadInput.value.trim()) {
            Swal.fire({ icon: "error", title: "Campos obligatorios", text: "Debes ingresar la primera modalidad." });
            return false;
        }
        if (!segundaModalidadInput.value.trim()) {
            Swal.fire({ icon: "error", title: "Campos obligatorios", text: "Debes ingresar la segunda modalidad." });
            return false;
        }
        if (!declaracionInput.value.trim()) {
            Swal.fire({ icon: "error", title: "Campos obligatorios", text: "Debes ingresar la declaración de mercancías." });
            return false;
        }
        if (!digitadorInput.value.trim()) {
            Swal.fire({ icon: "error", title: "Campos obligatorios", text: "Debes ingresar el digitador." });
            return false;
        }
        if (!tramitadorInput.value.trim()) {
            Swal.fire({ icon: "error", title: "Campos obligatorios", text: "Debes ingresar el tramitador." });
            return false;
        }
        return true;
    }

    // Función auxiliar: armar JSON
    function buildAduanaData() {
        return {
            idTipoServicio: Number(tipoDeServicioInput.value),
            DM: declaracionInput.value.trim(),
            primeraModalidad: primeraModalidadInput.value.trim(),
            segundaModalidad: segundaModalidadInput.value.trim(),
            digitador: digitadorInput.value.trim(),
            tramitador: tramitadorInput.value.trim()
        };
    }

    // Acción: Crear Aduana
    if (btnAdd) {
        btnAdd.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!validateForm()) return;

            const data = buildAduanaData();

            Swal.fire({
                title: "¿Desea guardar esta Aduana?",
                text: "Verifica los datos antes de confirmar.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, guardar",
                cancelButtonText: "Cancelar"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await createAduana(data);
                        Swal.fire({ icon: "success", title: "¡Guardado!", text: "Aduana guardada correctamente " });
                    } catch (error) {
                        console.error("Error al guardar Aduana:", error);
                        Swal.fire({ icon: "error", title: "Error", text: error.message || "Hubo un problema al guardar Aduana." });
                    }
                }
            });
        });
    }

    // Acción: Listar Aduanas
    /*if (btnList) {
        btnList.addEventListener("click", async () => {
            try {
                const aduanas = await getAduana();
                console.table(aduanas);
                Swal.fire({ icon: "info", title: "Listado", text: "Las aduanas se listaron en la consola." });
            } catch (error) {
                console.error("Error al listar Aduanas:", error);
                Swal.fire({ icon: "error", title: "Error", text: "Hubo un problema al listar Aduanas." });
            }
        });
    }*/

    // Acción: Actualizar Aduana
    if (btnUpdate) {
        btnUpdate.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!validateForm()) return;

            const data = buildAduanaData();

            Swal.fire({
                title: "¿Desea actualizar esta Aduana?",
                text: "Se guardarán los cambios realizados.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, actualizar",
                cancelButtonText: "Cancelar"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await updateAduana(data);   
                        Swal.fire({ icon: "success", title: "¡Actualizado!", text: "Aduana actualizada correctamente" });
                    } catch (error) {
                        console.error("Error al actualizar Aduana:", error);
                        Swal.fire({ icon: "error", title: "Error", text: error.message || "Hubo un problema al actualizar Aduana." });
                    }
                }
            });
        });
    }

    // Acción: Eliminar Aduana
    if (btnDelete) {
        btnDelete.addEventListener("click", async (e) => {
            e.preventDefault();

            const { value: id } = await Swal.fire({
                title: "Eliminar Aduana",
                text: "Ingrese el ID de la Aduana a eliminar",
                input: "number",
                inputPlaceholder: "Ejemplo: 101",
                showCancelButton: true,
                confirmButtonText: "Eliminar",
                cancelButtonText: "Cancelar"
            });

            if (!id) {
                Swal.fire({ icon: "warning", title: "Atención", text: "Debes ingresar un ID válido." });
                return;
            }

            Swal.fire({
                title: "¿Está seguro?",
                text: "Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#727475ff",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await deleteAduana(id);
                        Swal.fire({ icon: "success", title: "Eliminado", text: "Aduana eliminada correctamente" });
                    } catch (error) {
                        console.error("Error al eliminar Aduana:", error);
                        Swal.fire({ icon: "error", title: "Error", text: error.message || "Hubo un problema al eliminar Aduana." });
                    }
                }
            });
        });
    }

});