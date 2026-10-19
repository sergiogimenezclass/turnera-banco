/**
 * totem.js - Lógica del Tótem de autoservicio bancario
 * Emisión física simulada de tickets y comunicación por BroadcastChannel
 */

// 1. Canal de comunicación nativo entre pestañas
const canal = new BroadcastChannel('canal_turnero');

// 2. Contadores autoincrementales en memoria
let contadorGeneral = 0;
let contadorPrioritario = 0;

// 3. Referencias a elementos del DOM
const btnGeneral = document.getElementById('btn-general');
const btnPrioritario = document.getElementById('btn-prioritario');
const btnNuevoTicket = document.getElementById('btn-nuevo-ticket');
const relojTotem = document.getElementById('reloj-totem');

const ticketImpreso = document.getElementById('ticket-impreso');
const ticketCategoria = document.getElementById('ticket-categoria');
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
function emitirTurno(tipo) {
  const ahora = new Date();
  const fechaTexto = ahora.toLocaleDateString();
  const horaTexto = ahora.toTimeString().substring(0, 5);
  let codigo = '';

  if (tipo === 'Prioritario') {
    contadorPrioritario++;
    codigo = 'P-' + String(contadorPrioritario).padStart(2, '0');
  } else {
    contadorGeneral++;
    codigo = 'G-' + String(contadorGeneral).padStart(2, '0');
  }

  const turno = {
    numero: codigo,
    tipo: tipo,
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
  ticketFecha.textContent = turno.fecha;
  ticketHora.textContent = turno.hora;
  ticketMensaje.textContent = 'Aguarde su llamado en la pantalla de la sala';

  if (turno.tipo === 'Prioritario') {
    ticketCategoria.textContent = 'Prioritario';
    ticketCategoria.className = 'ticket-badge badge-p';
  } else {
    ticketCategoria.textContent = 'General';
    ticketCategoria.className = 'ticket-badge badge-g';
  }
}

// 7. Event listeners
btnPrioritario.addEventListener('click', () => emitirTurno('Prioritario'));
btnGeneral.addEventListener('click', () => emitirTurno('General'));

btnNuevoTicket.addEventListener('click', () => {
  // Simular que el cliente retiró el papel de la ranura
  ticketImpreso.style.animation = 'none';
  ticketNumero.textContent = '--';
  ticketCategoria.textContent = 'En Espera';
  ticketCategoria.className = 'ticket-badge';
  ticketMensaje.textContent = 'Toque un botón para emitir su turno';
  ticketFecha.textContent = '--/--/----';
  ticketHora.textContent = '--:--';
});

// Inicializar un primer ticket de bienvenida en la ranura
emitirTurno('Prioritario');
