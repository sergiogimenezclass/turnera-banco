/**
 * operador.js - Lógica de la terminal del operador bancario
 * Administración de colas con prioridad y llamado mediante BroadcastChannel
 */

// 1. Instancia del canal de comunicación
const canal = new BroadcastChannel('canal_turnero');

// 2. Estado de colas en memoria
const colaPrioritaria = [];
const colaGeneral = [];
let turnoEnAtencion = null;

// 3. Referencias al DOM
const selectCaja = document.getElementById('select-caja');
const servingCajaLabel = document.getElementById('serving-caja-label');
const contadorPrioritario = document.getElementById('contador-prioritario');
const contadorGeneral = document.getElementById('contador-general');
const turnoActualNumero = document.getElementById('turno-actual-numero');
const turnoActualMeta = document.getElementById('turno-actual-meta');
const btnLlamar = document.getElementById('btn-llamar');
const ultimoDespachado = document.getElementById('ultimo-despachado');

// 4. Actualizar contadores de telemetría en pantalla
function actualizarContadores() {
  contadorPrioritario.textContent = colaPrioritaria.length;
  contadorGeneral.textContent = colaGeneral.length;
}

// 5. Escuchar eventos del canal (recepción de nuevos turnos emitidos por clientes)
canal.onmessage = (evento) => {
  const data = evento.data;
  if (!data) return;

  if (data.accion === 'NUEVO_TURNO' && data.turno) {
    if (data.turno.tipo === 'Prioritario') {
      colaPrioritaria.push(data.turno);
    } else {
      colaGeneral.push(data.turno);
    }
    actualizarContadores();
  }
};

// 6. Lógica de llamado con prioridad estricta
function llamarSiguiente() {
  let turnoSeleccionado = null;

  // REGLA FUNDAMENTAL: Se vacía primero la cola prioritaria
  if (colaPrioritaria.length > 0) {
    turnoSeleccionado = colaPrioritaria.shift();
  } else if (colaGeneral.length > 0) {
    turnoSeleccionado = colaGeneral.shift();
  } else {
    // Alerta visual no invasiva en caso de colas vacías
    turnoActualMeta.textContent = 'No hay clientes en espera en este momento';
    turnoActualMeta.style.color = '#ef4444';
    setTimeout(() => {
      turnoActualMeta.style.color = '#94a3b8';
      if (!turnoEnAtencion) {
        turnoActualMeta.textContent = 'Sin turno activo en este puesto';
      } else {
        turnoActualMeta.textContent = `${turnoEnAtencion.tipo} • ${turnoEnAtencion.caja}`;
      }
    }, 2500);
    return;
  }

  // Refrescar contadores
  actualizarContadores();

  const cajaActiva = selectCaja.value;
  const ahora = new Date().toTimeString().substring(0, 5);

  turnoEnAtencion = {
    numero: turnoSeleccionado.numero,
    tipo: turnoSeleccionado.tipo,
    caja: cajaActiva,
    hora: ahora
  };

  // Actualizar la interfaz del operador
  turnoActualNumero.textContent = turnoEnAtencion.numero;
  turnoActualMeta.textContent = `${turnoEnAtencion.tipo} • ${cajaActiva}`;
  ultimoDespachado.textContent = `${turnoEnAtencion.numero} (${turnoEnAtencion.tipo}) a las ${ahora}`;

  // Emitir mensaje por BroadcastChannel hacia la pantalla de TV y clientes
  canal.postMessage({
    accion: 'TURNO_LLAMADO',
    numero: turnoEnAtencion.numero,
    tipo: turnoEnAtencion.tipo,
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
