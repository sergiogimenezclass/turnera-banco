/**
 * totem.js - Lógica del Tótem de autoservicio bancario (4 servicios)
 * Emisión física simulada de tickets y comunicación por BroadcastChannel
 */

// 1. Canal de comunicación nativo entre pestañas
const canal = new BroadcastChannel('canal_turnero');

// 2. Contadores autoincrementales independientes por servicio
let contadorPrioritario = 0; // Prefijo P
let contadorCaja = 0;        // Prefijo C
let contadorTarjetas = 0;    // Prefijo T
let contadorCreditos = 0;    // Prefijo A

// 3. Referencias a elementos del DOM
const btnPrioritario = document.getElementById('btn-prioritario');
const btnCaja = document.getElementById('btn-caja');
const btnTarjetas = document.getElementById('btn-tarjetas');
const btnCreditos = document.getElementById('btn-creditos');
const relojTotem = document.getElementById('reloj-totem');

const ticketImpreso = document.getElementById('ticket-impreso');
const ticketCategoria = document.getElementById('ticket-categoria');
const ticketServicio = document.getElementById('ticket-servicio');
const ticketNumero = document.getElementById('ticket-numero');
const ticketMensaje = document.getElementById('ticket-mensaje');
const ticketFecha = document.getElementById('ticket-fecha');
const ticketHora = document.getElementById('ticket-hora');

// 4. Actualización del reloj digital en vivo en el cabezal del tótem
function actualizarRelojTotem() {
  const ahora = new Date();
  relojTotem.textContent = ahora.toLocaleTimeString();
}
setInterval(actualizarRelojTotem, 1000);
actualizarRelojTotem();

// 5. Emisión e impresión de nuevo turno
function emitirTurno(tipo, nombreServicio, prefijo) {
  const ahora = new Date();
  const fechaTexto = ahora.toLocaleDateString();
  const horaTexto = ahora.toTimeString().substring(0, 5);
  let codigo = '';

  if (prefijo === 'P') {
    contadorPrioritario++;
    codigo = 'P-' + String(contadorPrioritario).padStart(2, '0');
  } else if (prefijo === 'C') {
    contadorCaja++;
    codigo = 'C-' + String(contadorCaja).padStart(2, '0');
  } else if (prefijo === 'T') {
    contadorTarjetas++;
    codigo = 'T-' + String(contadorTarjetas).padStart(2, '0');
  } else if (prefijo === 'A') {
    contadorCreditos++;
    codigo = 'A-' + String(contadorCreditos).padStart(2, '0');
  }

  const turno = {
    numero: codigo,
    tipo: tipo,
    servicio: nombreServicio,
    prefijo: prefijo,
    fecha: fechaTexto,
    hora: horaTexto
  };

  // Enviar mensaje al BroadcastChannel para que el Operador reciba el turno en cola
  canal.postMessage({
    accion: 'NUEVO_TURNO',
    turno: turno
  });

  // Imprimir físicamente el ticket desde la ranura mecánica del tótem
  renderizarTicketImpreso(turno);
}

// 6. Animación y renderizado del ticket que emerge de la ranura
function renderizarTicketImpreso(turno) {
  // Reiniciar animación CSS de salida de papel
  ticketImpreso.style.display = 'flex';
  ticketImpreso.style.animation = 'none';
  void ticketImpreso.offsetWidth; // Forzar reflow
  ticketImpreso.style.animation = 'print-ticket 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

  ticketNumero.textContent = turno.numero;
  ticketServicio.textContent = turno.servicio;
  ticketFecha.textContent = turno.fecha;
  ticketHora.textContent = turno.hora;
  ticketMensaje.textContent = 'Aguarde su llamado en la pantalla de la sala';

  // Badges diferenciados según el tipo y servicio
  if (turno.prefijo === 'P') {
    ticketCategoria.textContent = 'Prioritario';
    ticketCategoria.className = 'ticket-badge badge-p';
  } else if (turno.prefijo === 'C') {
    ticketCategoria.textContent = 'General';
    ticketCategoria.className = 'ticket-badge badge-c';
  } else if (turno.prefijo === 'T') {
    ticketCategoria.textContent = 'General';
    ticketCategoria.className = 'ticket-badge badge-t';
  } else if (turno.prefijo === 'A') {
    ticketCategoria.textContent = 'General';
    ticketCategoria.className = 'ticket-badge badge-a';
  }
}

// 7. Event listeners de los botones del tótem
btnPrioritario.addEventListener('click', () => {
  emitirTurno('Prioritario', 'Atención Prioritaria', 'P');
});

btnCaja.addEventListener('click', () => {
  emitirTurno('General', 'Operaciones por Caja', 'C');
});

btnTarjetas.addEventListener('click', () => {
  emitirTurno('General', 'Tarjetas y Cuentas', 'T');
});

btnCreditos.addEventListener('click', () => {
  emitirTurno('General', 'Asesoría y Créditos', 'A');
});

// Inicializar un primer ticket de muestra en la ranura
emitirTurno('Prioritario', 'Atención Prioritaria', 'P');
