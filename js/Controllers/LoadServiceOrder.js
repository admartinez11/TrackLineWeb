// ======================================================================
// 🔹 Cargar datos guardados en el formulario de edición
// ======================================================================
document.addEventListener("DOMContentLoaded", async () => {
  let saved = localStorage.getItem("ordenEdit");

  // Consideramos "falso" no solo null, sino también la cadena "null", "undefined", o "".
  const isEditing = saved && saved !== "null" && saved !== "undefined" && saved.trim() !== "";

  // 🛑 2. Lógica para MODO NUEVA ORDEN: Si NO estamos editando, detenemos la ejecución
  if (!isEditing) {
    console.log("Iniciando ServiceOrder en modo NUEVA ORDEN. Formulario vacío.");

    // 🚨 LIMPIEZA CRÍTICA DE IDS Y DATOS PERSISTENTES 🚨

    // 1. Limpia el ID de la orden anterior. ¡ESTO ES CLAVE PARA FORZAR LA CREACIÓN!
    localStorage.removeItem("idOrdenEncabezado");

    // 2. Limpia los campos del cliente que persisten de AddNit
    const importadorElement = document.getElementById("importador");
    const nit1Element = document.getElementById("nit1");

    if (importadorElement) {
      importadorElement.value = "";
    }
    if (nit1Element) {
      nit1Element.value = "";
    }

    // 3. (Opcional) Si la información del cliente se guarda con otras claves, límpialas aquí.
    // Ejemplo: localStorage.removeItem("clienteNitGuardado"); 

    return; // <--- ¡El script DEBE terminar aquí si es una nueva orden!
  }

  let orden;
  try {
    const parsed = JSON.parse(saved);
    orden = parsed.data || parsed;
    // 🛑 AÑADE ESTO PARA VER EL OBJETO COMPLETO EN EL NAVEGADOR
    console.log("Objeto Orden cargado para Edición:", orden);
  } catch (error) {
    console.error("❌ Error al parsear la orden:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Ocurrió un error al cargar los datos guardados."
    });
    return;
  }

  // para que otros controladores (como el de Permisos) puedan cargarse.
  if (orden.idOrdenServicio) {
    localStorage.setItem("idOrdenServicio", orden.idOrdenServicio);
    console.log(`✅ ID de Orden de Servicio guardado: ${orden.idOrdenServicio}`);
  }
  // Si necesitas el idOrdenEncabezado, también debes guardarlo
  if (orden.idOrdenEncabezado) {
    localStorage.setItem("idOrdenEncabezado", orden.idOrdenEncabezado);
    console.log(`✅ ID de Orden Encabezado guardado: ${orden.idOrdenEncabezado}`);
  }

  // ======================================================================
  // 🔹 Funciones de ayuda
  // ======================================================================
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  };

  const setCheck = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!value;
  };

  // ======================================================================
  // 🔹 Llenar campos del formulario
  // ======================================================================
  // Encabezado
  const normalize = (obj, key) => obj[key] ?? obj[key.toLowerCase()] ?? obj[key.toUpperCase()] ?? "";

  set("pedido-id", orden.idOrdenServicio);
  set("fecha", orden.fechaOrden ? new Date(orden.fechaOrden).toISOString().split("T")[0] : "");
  set("encargado1", orden.encargadoUno);
  set("referencia", orden.referencia);
  set("importador", orden.importador);
  set("nit1", orden.nitUno);
  set("registroIVA1", orden.registroIvaUno);
  set("facturarA", orden.facturaA);
  set("encargado2", orden.encargadoDos);
  set("nit2", orden.nitDos);
  set("registroIVA2", orden.registroIvaDos);

  // Información del embarque
  set("facturas", orden.facturasEmbarque);
  set("proveedor", orden.proveedorRefEmbarque);
  set("bultos", orden.bultosEmbarque);
  set("tipo", orden.tipoEmbarque);
  set("kilos", orden.kilosEmbarque);
  set("volumen", orden.volumenEmbarque);

  // Aduana
  const tipoServicioValor = orden.idTipoServicio || orden.tipoServicio;
  set("tipoServicio", tipoServicioValor);
  set("primeraModalidad", orden.primeraModalidad);
  set("segundaModalidad", orden.segundaModalidad);
  set("declaracion", orden.dm);
  set("digitador", orden.digitador);
  set("tramitador", orden.tramitador);

  // Recolección
  setCheck("transporte", orden.transporteRecoleccion);
  setCheck("recoleccionEntrega", orden.recoleccionEntregaRecoleccion);
  set("documento", orden.numeroDoc);
  set("lugarOrigen", orden.lugarOrigen);
  set("paisOrigen", orden.paisOrigen);
  set("lugarDestino", orden.lugarDestino);
  set("paisDestino", orden.paisDestino);

  // Observaciones
  const colorSelectivo = orden.idSelectivo || orden.colorSelectivo;
  set("estado", colorSelectivo);
  set("observaciones", orden.textoObservacion);

  // Transporte
  const idTransporteGuardado = orden.idTransporte;
  localStorage.setItem("tempIdTransporteToLoad", String(idTransporteGuardado));
  set("idTransporte", String(idTransporteGuardado));

  // ======================================================================
  // 🔹 Financiamiento
  // ======================================================================
  set("impuesto", orden.impuesto);
  set("cantidadImpuesto", orden.cantidadImpuesto);
  set("cargaImpuesto", orden.cargaImpuesto);
  set("totalImpuestos", orden.totalImpuestos);

  set("complemento", orden.complemento);
  set("cantidadComplemento", orden.cantidadComplemento);
  set("cargaComplemento", orden.cargaComplemento);
  set("totalComplemento", orden.totalComplemento);

  set("almacenajes", orden.almacenajes);
  set("cantidadAlmacenajes", orden.cantidadAlmacenajes);
  set("cargaAlmacenajes", orden.cargaAlmacenajes);
  set("totalAlmacenajes", orden.totalAlmacenajes);

  set("transporte", orden.transporteFinanciamiento);
  set("cantidadTransporte", orden.cantidadTransporte);
  set("cargaTransporte", orden.cargaTransporte);
  set("totalTransporte", orden.totalTransporte);

  set("cuadrilla", orden.cuadrilla);
  set("cantidadCuadrilla", orden.cantidadCuadrilla);
  set("cargaCuadrilla", orden.cargaCuadrilla);
  set("totalCuadrilla", orden.totalCuadrilla);

  set("permisos", orden.permisos);
  set("cantidadPermisos", orden.cantidadPermisos);
  set("cargaPermisos", orden.cargaPermisos);
  set("totalPermisosFinanciamiento", orden.totalPermisosFinanciamiento);

  set("multas", orden.multas);
  set("cantidadMultas", orden.cantidadMultas);
  set("cargaMultas", orden.cargaMultas);
  set("totalMultas", orden.totalMultas);

  set("oirsa", orden.oirsa);
  set("cantidadOirsa", orden.cantidadOirsa);
  set("cargaOirsa", orden.cargaOirsa);
  set("totalOirsa", orden.totalOirsa);

  set("flete", orden.flete);
  set("cantidadFlete", orden.cantidadFlete);
  set("cargaFlete", orden.cargaFlete);
  set("totalFlete", orden.totalFlete);

  set("manejo", orden.manejo);
  set("cantidadManejo", orden.cantidadManejo);
  set("cargaManejo", orden.cargaManejo);
  set("totalManejo", orden.totalManejo);

  set("copias", orden.copias);
  set("cantidadCopias", orden.cantidadCopias);
  set("cargaCopias", orden.cargaCopias);
  set("totalCopiasScanner", orden.totalCopiasScanner);

  set("seguridad", orden.seguridad);
  set("cantidadSeguridad", orden.cantidadSeguridad);
  set("cargaSeguridad", orden.cargaSeguridad);
  set("totalSeguridad", orden.totalSeguridad);

  set("impresiones", orden.impresiones);
  set("cantidadImpresiones", orden.cantidadImpresiones);
  set("cargaImpresiones", orden.cargaImpresiones);
  set("totalImpresiones", orden.totalImpresiones);

  set("parqueo", orden.parqueo);
  set("cantidadParqueo", orden.cantidadParqueo);
  set("cargaParqueo", orden.cargaParqueo);
  set("totalParqueo", orden.totalParqueo);

  set("previaMAG", orden.previaMAG);
  set("cantidadPrevia", orden.cantidadPrevia);
  set("cargaPrevia", orden.cargaPrevia);
  set("totalPreviaMAG", orden.totalPreviaMAG);

  // ======================================================================
  // 🔹 Cargos
  // ======================================================================
  set("impuestoCargo", orden.impuestoCargo);
  set("cantidadImpuestoCargo", orden.cantidadImpuestoCargo);
  set("cargaImpuestoCargo", orden.cargaImpuestoCargo);
  set("totalImpuestoCargo", orden.totalImpuestoCargo);

  set("complementoCargo", orden.complementoCargo);
  set("cantidadComplementoCargo", orden.cantidadComplementoCargo);
  set("cargaComplementoCargo", orden.cargaComplementoCargo);
  set("totalComplementoCargo", orden.totalComplementoCargo);

  set("transporteCargo", orden.transporteCargo);
  set("cantidadTransporteCargo", orden.cantidadTransporteCargo);
  set("cargaTransporteCargo", orden.cargaTransporteCargo);
  set("totalTransporteCargo", orden.totalTransporteCargo);

  set("permisosCargo", orden.permisosCargo);
  set("cantidadPermisosCargo", orden.cantidadPermisosCargo);
  set("cargaPermisosCargo", orden.cargaPermisosCargo);
  set("totalPermisosCargo", orden.totalPermisosCargo);

  set("otrosCargos", orden.otrosCargos);
  set("cantidadOtrosCargos", orden.cantidadOtrosCargos);
  set("cargaOtrosCargos", orden.cargaOtrosCargos);
  set("totalOtrosCargos", orden.totalOtrosCargos);

  set("totalGeneralCargos", orden.totalGeneralCargos);

  // ======================================================================
  // 🔹 Confirmación visual
  // ======================================================================
  Swal.fire({
    icon: "success",
    title: "Datos cargados",
    text: "Los datos de la orden se han cargado correctamente.",
    confirmButtonText: "Aceptar",
    timer: 2500
  });
});
