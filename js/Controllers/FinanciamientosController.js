//======================================================================
// 1. IMPORTACIONES DE SERVICIO
//======================================================================
import {
  getFinanciamiento,
  updateFinanciamiento,
  deleteFinanciamiento,
  createFinanciamiento,
  getTiposFinanciamiento
} from '../Services/FinanciamientoService.js';

// Variables globales para la lógica
let tiposFinanciamientoData = [];
const API_URL = 'https://apitrackline-3047cf7af332.herokuapp.com/apiFinanciamiento';

// --- MAPEO DE INPUTS ESTÁTICOS A NOMBRES DE CARGOS ---
const staticInputMap = {
  'impuesto': 'Impuesto', 'complemento': 'Complemento', 'almacenajes': 'Almacenajes',
  'transporte': 'Transporte', 'cuadrilla': 'Cuadrilla', 'permisos': 'Permisos',
  'multas': 'Multas', 'oirsa': 'OIRSA', 'flete': 'Flete', 'manejo': 'Manejo',
  'copias': 'Copias/Scaner', 'seguridad': 'Seguridad', 'impresiones': 'Impresiones',
  'parqueo': 'Parqueo', 'previaMAG': 'Previa MAG'
};

// --- MAPEO DE FILAS A SUS IDs DE INPUTS DE VALOR ---
const rowInputIds = [
  { cargo: 'impuesto', cb: 'cbImpuesto', cant: 'cantidadImpuesto', carga: 'cargaImpuesto', total: 'totalImpuestos' },
  { cargo: 'complemento', cb: 'cbComplemento', cant: 'cantidadComplemento', carga: 'cargaComplemento', total: 'totalComplemento' },
  { cargo: 'almacenajes', cb: 'cbAlmacenajes', cant: 'cantidadAlmacenajes', carga: 'cargaAlmacenajes', total: 'totalAlmacenajes' },
  { cargo: 'transporte', cb: 'cbTransporte', cant: 'cantidadTransporte', carga: 'cargaTransporte', total: 'totalTransporte' },
  { cargo: 'cuadrilla', cb: 'cbCuadrilla', cant: 'cantidadCuadrilla', carga: 'cargaCuadrilla', total: 'totalCuadrilla' },
  { cargo: 'permisos', cb: 'cbPermisos', cant: 'cantidadPermisos', carga: 'cargaPermisos', total: 'totalPermisosFinanciamiento' },
  { cargo: 'multas', cb: 'cbMultas', cant: 'cantidadMultas', carga: 'cargaMultas', total: 'totalMultas' },
  { cargo: 'oirsa', cb: 'cbOirsa', cant: 'cantidadOirsa', carga: 'cargaOirsa', total: 'totalOirsa' },
  { cargo: 'flete', cb: 'cbFlete', cant: 'cantidadFlete', carga: 'cargaFlete', total: 'totalFlete' },
  { cargo: 'manejo', cb: 'cbManejo', cant: 'cantidadManejo', carga: 'cargaManejo', total: 'totalManejo' },
  { cargo: 'copias', cb: 'cbCopias', cant: 'cantidadCopias', carga: 'cargaCopias', total: 'totalCopiasScanner' },
  { cargo: 'seguridad', cb: 'cbSeguridad', cant: 'cantidadSeguridad', carga: 'cargaSeguridad', total: 'totalSeguridad' },
  { cargo: 'impresiones', cb: 'cbImpresiones', cant: 'cantidadImpresiones', carga: 'cargaImpresiones', total: 'totalImpresiones' },
  { cargo: 'parqueo', cb: 'cbParqueo', cant: 'cantidadParqueo', carga: 'cargaParqueo', total: 'totalParqueo' },
  { cargo: 'previaMAG', cb: 'cbPrevia', cant: 'cantidadPrevia', carga: 'cargaPrevia', total: 'totalPreviaMAG' },
];

//======================================================================
// 4. INICIALIZACIÓN: Evento 'DOMContentLoaded'
//======================================================================

document.addEventListener('DOMContentLoaded', async () => {
  const inputCuenta = document.querySelector('.grand-total input');
  if (inputCuenta) {
    inputCuenta.readOnly = true;
  }
  const btnSaveAndNext = document.getElementById('addAndSaveFinanciamiento');

  await loadTiposFinanciamiento();
  populateStaticFinanciamientoFields();
  setupRowListeners();
  calculateTotalCuenta();

  if (btnSaveAndNext) {
    btnSaveAndNext.addEventListener('click', saveActiveRows);
  } else {
    console.error('El botón "Guardar y Siguiente" (ID: addAndSaveFinanciamiento) no fue encontrado.');
  }

  //======================================================================
  // 3. FUNCIONES DE LÓGICA DE DATOS Y UTILIDAD
  //======================================================================

  async function loadTiposFinanciamiento() {
    try {
      tiposFinanciamientoData = await getTiposFinanciamiento();
    } catch (error) {
      console.error('Error al cargar Tipos de Financiamiento:', error);
    }
  }

  function populateStaticFinanciamientoFields() {
    if (tiposFinanciamientoData.length === 0) return;

    for (const inputId in staticInputMap) {
      const expectedName = staticInputMap[inputId];
      const inputElement = document.getElementById(inputId);

      if (inputElement) {
        const cargo = tiposFinanciamientoData.find(tipo => tipo.nombre === expectedName);
        if (cargo) {
          inputElement.value = cargo.nombre;
          inputElement.dataset.cargoId = cargo.id;
        }
      }
    }
  }

  function setupRowListeners() {
    rowInputIds.forEach(ids => {
      const checkbox = document.getElementById(ids.cb);
      const cargoInput = document.getElementById(ids.cargo);
      const cantidadInput = document.getElementById(ids.cant);
      const cargaInput = document.getElementById(ids.carga);
      const totalInput = document.getElementById(ids.total);

      if (!checkbox || !cargoInput || !cantidadInput || !cargaInput || !totalInput) {
        console.warn(`Fila incompleta para el cargo ID: ${ids.cargo}. No se asignaron listeners.`);
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

    calculateTotalCuenta();
  }

  function calculateRowTotal(checkbox, cantidadInput, cargaInput, totalInput) {
    if (!checkbox.checked) {
      totalInput.value = '';
      calculateTotalCuenta();
      return;
    }

    const cantidad = parseFloat(cantidadInput.value) || 0;
    const carga = parseFloat(cargaInput.value) || 0;
    const total = cantidad * carga;

    totalInput.value = total.toFixed(2);
    calculateTotalCuenta();
  }

  function calculateTotalCuenta() {
    const inputCuenta = document.querySelector('.grand-total input');
    if (!inputCuenta) return;

    let totalSum = 0;
    rowInputIds.forEach(ids => {
      const checkbox = document.getElementById(ids.cb);
      const totalInput = document.getElementById(ids.total);
      if (checkbox && checkbox.checked && totalInput) {
        const value = parseFloat(totalInput.value) || 0;
        totalSum += value;
      }
    });

    inputCuenta.value = totalSum.toFixed(2);
  }

  async function saveActiveRows() {
    console.log('Iniciando guardado de filas activas...');
    const promises = [];
    let successCount = 0;

    for (const ids of rowInputIds) {
      const checkbox = document.getElementById(ids.cb);
      if (checkbox && checkbox.checked) {
        const cargoInput = document.getElementById(ids.cargo);
        const cantidadInput = document.getElementById(ids.cant);
        const cargaInput = document.getElementById(ids.carga);
        const totalInput = document.getElementById(ids.total);
        const idCargoFinanciamiento = cargoInput ? cargoInput.dataset.cargoId : null;

        if (idCargoFinanciamiento && cantidadInput.value && cargaInput.value && totalInput.value) {
          const dataToSave = {
            idTipoFinanciamiento: idCargoFinanciamiento,
            cantidad: parseFloat(cantidadInput.value),
            carga: parseFloat(cargaInput.value),
            total: parseFloat(totalInput.value)
          };

          console.log('Guardando:', dataToSave);

          const savePromise = createFinanciamiento(dataToSave)
            .then(() => {
              successCount++;
              checkbox.checked = false;
              handleRowState(checkbox, cantidadInput, cargaInput, totalInput);
            })
            .catch(error => {
              console.error(`Error al guardar el cargo ${cargoInput.value}:`, error);
              alert(`Error al guardar el ítem ${cargoInput.value}. Revisa la consola.`);
            });

          promises.push(savePromise);
        } else if (cargoInput && checkbox.checked) {
          console.error(`Fila de ${cargoInput.value} incompleta o con valores nulos. Se omite.`);
        }
      }
    }

    if (promises.length === 0) {
      alert('No hay filas activas para guardar.');
      return;
    }

    await Promise.allSettled(promises);
    alert(`Proceso de guardado finalizado. ${successCount} registro(s) guardado(s) con éxito.`);
  }

  function clearForm(impuestos, complemento, almacenajes, transporteFinanciamiento, impresiones, cuadrilla,
    permisosFinanciamiento, multas, oirsa, parqueo, flete, manejo, copiasScanner, seguridad,
    previaMAG, totalFinanciamiento
  ) {
    impuestos.value = '';
    complemento.value = '';
    almacenajes.value = '';
    transporteFinanciamiento.value = '';
    impresiones.value = '';
    cuadrilla.value = '';
    permisosFinanciamiento.value = '';
    multas.value = '';
    oirsa.value = '';
    parqueo.value = '';
    flete.value = '';
    manejo.value = '';
    copiasScanner.value = '';
    seguridad.value = '';
    previaMAG.value = '';
    totalFinanciamiento.value = '';
  }
});
