fetch("https://apitrackline-3047cf7af332.herokuapp.com/api/auth/me", {
    credentials: "include"
})
    .then(res => {
        if (!res.ok) throw new Error("No autorizado");
    })

    .catch(() => {
        window.location.href = "Login.html";
    });


//============================================================
//  IMPORTACIONES DE SERVICIO
//============================================================
import {
  createCargo,
  getTipoDatoContable,
} from "../Services/CargosService.js";


//============================================================
//  VARIABLES GLOBALES
//============================================================
let tiposCargosData = [];

const staticInputMapCargos = {
  'impuestoCargo': 'IVA',
  'complementoCargo': 'Retención de IVA',
  'transporteCargo': 'Transp. Local',
  'permisosCargo': 'Permisos',
  'otrosCargos': 'Pag. Adicionales'
};

const rowInputIdsCargos = [
  { cargo: 'impuestoCargo', cb: 'cbImpuestoCargo', cant: 'cantidadImpuestoCargo', carga: 'cargaImpuestoCargo', total: 'totalImpuestoCargo' },
  { cargo: 'complementoCargo', cb: 'cbComplementoCargo', cant: 'cantidadComplementoCargo', carga: 'cargaComplementoCargo', total: 'totalComplementoCargo' },
  { cargo: 'transporteCargo', cb: 'cbTransporteCargo', cant: 'cantidadTransporteCargo', carga: 'cargaTransporteCargo', total: 'totalTransporteCargo' },
  { cargo: 'permisosCargo', cb: 'cbPermisosCargo', cant: 'cantidadPermisosCargo', carga: 'cargaPermisosCargo', total: 'totalPermisosCargo' },
  { cargo: 'otrosCargos', cb: 'cbOtrosCargos', cant: 'cantidadOtrosCargos', carga: 'cargaOtrosCargos', total: 'totalOtrosCargos' },
];


//============================================================
//  INICIALIZACIÓN
//============================================================
document.addEventListener('DOMContentLoaded', async () => {
  const inputCuenta = document.getElementById('totalGeneralCargos');
  if (inputCuenta) inputCuenta.readOnly = true;

  const btnSaveAndNext = document.getElementById('addAndSaveCargos');

  await loadTiposCargos();
  populateStaticCargosFields();
  setupRowListeners();
  calculateTotalCuentaCargos();

  if (btnSaveAndNext) {
    btnSaveAndNext.addEventListener('click', saveActiveRowsCargos);
  } else {
    console.error('Botón "Guardar y Siguiente" no encontrado (ID: addAndSaveCargos)');
  }


  //============================================================
  //  FUNCIONES DE DATOS Y LÓGICA
  //============================================================

  async function loadTiposCargos() {
    try {
      tiposCargosData = await getTipoDatoContable();
      console.log('✅ Tipos de cargos cargados:', tiposCargosData);

      if (!tiposCargosData || tiposCargosData.length === 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'Sin datos',
          text: 'No hay registros en Tb_TipoDatosContables.',
          confirmButtonColor: '#3085d6'
        });
      }

    } catch (error) {
      console.error('Error al cargar Tipos de Cargos:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al cargar datos',
        text: 'No se pudieron cargar los tipos de cargos desde el servidor.',
        confirmButtonColor: '#d33'
      });
    }
  }


  function populateStaticCargosFields() {
    if (tiposCargosData.length === 0) return;

    for (const inputId in staticInputMapCargos) {
      const expectedName = staticInputMapCargos[inputId];
      const inputElement = document.getElementById(inputId);

      if (inputElement) {
        const cargo = tiposCargosData.find(tipo => tipo.nombre === expectedName);
        if (cargo) {
          inputElement.value = cargo.nombre;
          inputElement.dataset.cargoId = cargo.idTipoDatoContable;
        } else {
          console.warn(`No se encontró "${expectedName}" en Tb_TipoDatosContables`);
        }
      }
    }
  }


  function setupRowListeners() {
    rowInputIdsCargos.forEach(ids => {
      const checkbox = document.getElementById(ids.cb);
      const cantidadInput = document.getElementById(ids.cant);
      const cargaInput = document.getElementById(ids.carga);
      const totalInput = document.getElementById(ids.total);

      if (!checkbox || !cantidadInput || !cargaInput || !totalInput) {
        console.warn(`Fila incompleta para ${ids.cargo}`);
        return;
      }

      const initialHandler = () => handleRowState(checkbox, cantidadInput, cargaInput, totalInput);
      checkbox.addEventListener('change', initialHandler);
      initialHandler();

      const calcHandler = () => calculateRowTotal(checkbox, cantidadInput, cargaInput, totalInput);
      cantidadInput.addEventListener('input', calcHandler);
      cargaInput.addEventListener('input', calcHandler);
    });
  }


  function handleRowState(checkbox, cantidadInput, cargaInput, totalInput) {
    const isChecked = checkbox.checked;
    totalInput.readOnly = true;
    cantidadInput.readOnly = !isChecked;
    cargaInput.readOnly = !isChecked;

    if (!isChecked) {
      cantidadInput.value = '';
      cargaInput.value = '';
      totalInput.value = '';
    } else {
      calculateRowTotal(checkbox, cantidadInput, cargaInput, totalInput);
    }

    calculateTotalCuentaCargos();
  }


  function calculateRowTotal(checkbox, cantidadInput, cargaInput, totalInput) {
    if (!checkbox.checked) {
      totalInput.value = '';
      calculateTotalCuentaCargos();
      return;
    }

    const cantidad = parseFloat(cantidadInput.value) || 0;
    const carga = parseFloat(cargaInput.value) || 0;
    const total = cantidad * carga;

    totalInput.value = total.toFixed(2);
    calculateTotalCuentaCargos();
  }


  function calculateTotalCuentaCargos() {
    const inputCuenta = document.getElementById('totalGeneralCargos');
    if (!inputCuenta) return;

    let totalSum = 0;
    rowInputIdsCargos.forEach(ids => {
      const checkbox = document.getElementById(ids.cb);
      const totalInput = document.getElementById(ids.total);
      if (checkbox && checkbox.checked && totalInput) {
        totalSum += parseFloat(totalInput.value) || 0;
      }
    });

    inputCuenta.value = totalSum.toFixed(2);
  }


  async function saveActiveRowsCargos() {
    console.log('💾 Guardando cargos activos...');
    const promises = [];
    let successCount = 0;

    for (const ids of rowInputIdsCargos) {
      const checkbox = document.getElementById(ids.cb);
      if (checkbox && checkbox.checked) {
        const cargoInput = document.getElementById(ids.cargo);
        const cantidadInput = document.getElementById(ids.cant);
        const cargaInput = document.getElementById(ids.carga);
        const totalInput = document.getElementById(ids.total);
        const idTipoDatoContable = cargoInput ? cargoInput.dataset.cargoId : null;

        if (idTipoDatoContable && cantidadInput.value && cargaInput.value && totalInput.value) {
          const dataToSave = {
            idTipoDatoContable: parseInt(idTipoDatoContable),
            cantidad: parseFloat(cantidadInput.value),
            monto: parseFloat(cargaInput.value),
            total: parseFloat(totalInput.value)
          };

          const savePromise = createCargo(dataToSave)
            .then(() => {
              successCount++;
              checkbox.checked = false;
              handleRowState(checkbox, cantidadInput, cargaInput, totalInput);
            })
            .catch(error => {
              console.error(`Error al guardar ${cargoInput.value}:`, error);
              Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: `No se pudo guardar el cargo "${cargoInput.value}".`,
                confirmButtonColor: '#d33'
              });
            });

          promises.push(savePromise);
        } else {
          console.warn(`Fila de ${cargoInput.value} incompleta.`);
        }
      }
    }

    if (promises.length === 0) {
      await Swal.fire({
        icon: 'info',
        title: 'Sin cargos seleccionados',
        text: 'Selecciona al menos un cargo antes de guardar.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    await Promise.allSettled(promises);

    await Swal.fire({
      icon: 'success',
      title: 'Cargos guardados',
      text: `${successCount} cargo(s) registrados correctamente.`,
      confirmButtonColor: '#28a745'
    });
  }
});