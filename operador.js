/**
 * operador.js - Lógica de la terminal del operador bancario
 * Administración de 4 colas (Prioridad, Cajas, Tarjetas, Asesoría) con prioridad estricta
 */

// 1. Instancia del canal de comunicación nativo
const canal = new BroadcastChannel('canal_turnero');

// 2. Colas en memoria independientes por servicio
const colaPrioritaria = []; // Prefijo P
const colaCaja = [];        // Prefijo C
const colaTarjetas = [];    // Prefijo T
const colaAsesoria = [];    // Prefijo A

let turnoEnAtencion = null;

// 3. Referencias al DOM
const selectCaja = document.getElementById('select-caja');
const servingCajaLabel = document.getElementById('serving-caja-label');

const contadorPrioritario = document.getElementById('contador-prioritario');
const contadorCaja = document.getElementById('contador-caja');
const contadorTarjetas = document.getElementById('contador-tarjetas');
const contadorAsesoria = document.getElementById('contador-asesoria');

const turnoActualNumero = document.getElementById('turno-actual-numero');
const turnoActualServicio = document.getElementById('turno-actual-servicio');
const turnoActualMeta = document.getElementById('turno-actual-meta');
const btnLlamar = document.getElementById('btn-llamar');
const ultimoDespachado = document.getElementById('ultimo-despachado');

// 4. Actualizar contadores de telemetría de las 4 colas
function actualizarContadores() {
  contadorPrioritario.textContent = colaPrioritaria.length;
  contadorCaja.textContent = colaCaja.length;
  contadorTarjetas.textContent = colaTarjetas.length;
  contadorAsesoria.textContent = colaAsesoria.length;
}

// 5. Escuchar nuevos turnos emitidos desde el Tótem
canal.onmessage = (evento) => {
  const data = evento.data;
  if (!data) return;

  if (data.accion === 'NUEVO_TURNO' && data.turno) {
    const turno = data.turno;

    if (turno.prefijo === 'P' || turno.tipo === 'Prioritario') {
      colaPrioritaria.push(turno);
    } else if (turno.prefijo === 'C') {
      colaCaja.push(turno);
    } else if (turno.prefijo === 'T') {
      colaTarjetas.push(turno);
    } else if (turno.prefijo === 'A') {
      colaAsesoria.push(turno);
    }

    actualizarContadores();
  }
};

// 6. Lógica de despacho con prioridad y afinidad de puesto
function llamarSiguiente() {
  let turnoSeleccionado = null;
  const puestoActual = selectCaja.value;

  // REGLA 1: Prioridad absoluta (adultos mayores, embarazadas, personas vulnerables)
  if (colaPrioritaria.length > 0) {
    turnoSeleccionado = colaPrioritaria.shift();
  } else {
    // REGLA 2: Afinidad según el puesto de trabajo del operador
    const esPuestoCaja = puestoActual.includes('Caja');
    const esPuestoTarjetas = puestoActual.includes('Box 1');
    const esPuestoAsesoria = puestoActual.includes('Box 2');

    if (esPuestoCaja && colaCaja.length > 0) {
      turnoSeleccionado = colaCaja.shift();
    } else if (esPuestoTarjetas && colaTarjetas.length > 0) {
      turnoSeleccionado = colaTarjetas.shift();
    } else if (esPuestoAsesoria && colaAsesoria.length > 0) {
      turnoSeleccionado = colaAsesoria.shift();
    } else {
      // Si la cola específica del puesto está vacía, atiende cualquier otra con espera
      if (colaCaja.length > 0) {
        turnoSeleccionado = colaCaja.shift();
      } else if (colaTarjetas.length > 0) {
        turnoSeleccionado = colaTarjetas.shift();
      } else if (colaAsesoria.length > 0) {
        turnoSeleccionado = colaAsesoria.shift();
      }
    }
  }

  // Si todas las colas están vacías
  if (!turnoSeleccionado) {
    turnoActualMeta.textContent = 'No hay clientes en espera en este momento';
    turnoActualMeta.style.color = '#ef4444';
    setTimeout(() => {
      turnoActualMeta.style.color = '#94a3b8';
      if (!turnoEnAtencion) {
        turnoActualMeta.textContent = 'Seleccioná "Llamar Siguiente Turno"';
      } else {
        turnoActualMeta.textContent = `${turnoEnAtencion.servicio} • ${turnoEnAtencion.caja}`;
      }
    }, 2500);
    return;
  }

  // Actualizar los contadores en pantalla
  actualizarContadores();

  const ahora = new Date().toTimeString().substring(0, 5);

  turnoEnAtencion = {
    numero: turnoSeleccionado.numero,
    tipo: turnoSeleccionado.tipo,
    servicio: turnoSeleccionado.servicio,
    caja: puestoActual,
    hora: ahora
  };

  // Actualizar la interfaz del puesto de trabajo
  turnoActualNumero.textContent = turnoEnAtencion.numero;
  turnoActualServicio.textContent = turnoEnAtencion.servicio;
  turnoActualMeta.textContent = `${turnoEnAtencion.tipo} • ${puestoActual}`;
  ultimoDespachado.textContent = `${turnoEnAtencion.numero} (${turnoEnAtencion.servicio}) en ${puestoActual} a las ${ahora}`;

  // Emitir mensaje por BroadcastChannel para la TV de la sala
  canal.postMessage({
    accion: 'TURNO_LLAMADO',
    numero: turnoEnAtencion.numero,
    tipo: turnoEnAtencion.tipo,
    servicio: turnoEnAtencion.servicio,
    caja: turnoEnAtencion.caja,
    hora: ahora
  });
}

// 7. Event listeners
btnLlamar.addEventListener('click', llamarSiguiente);

selectCaja.addEventListener('change', () => {
  servingCajaLabel.textContent = selectCaja.value;
  if (turnoEnAtencion) {
    turnoEnAtencion.caja = selectCaja.value;
    turnoActualMeta.textContent = `${turnoEnAtencion.tipo} • ${selectCaja.value}`;
  }
});

// Inicializar contadores en 0
actualizarContadores();
