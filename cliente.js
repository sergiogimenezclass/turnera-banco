/**
 * cliente.js - Lógica de la app móvil del cliente
 * Comunicación mediante BroadcastChannel nativo
 */

// 1. Canal de comunicación entre pestañas
const canal = new BroadcastChannel('canal_turnero');

// 2. Estado local del cliente
let contadorGeneral = 0;
let contadorPrioritario = 0;
let turnoActualCliente = null;

// 3. Referencias al DOM
const btnGeneral = document.getElementById('btn-general');
const btnPrioritario = document.getElementById('btn-prioritario');
const btnNuevoTurno = document.getElementById('btn-nuevo-turno');
const relojCliente = document.getElementById('reloj-cliente');
const relojBarraEstado = document.getElementById('reloj-barra-estado');

const ticketCard = document.getElementById('tarjeta-ticket');
const ticketCategoria = document.getElementById('ticket-categoria');
const ticketNumero = document.getElementById('ticket-numero');
const ticketMensaje = document.getElementById('ticket-mensaje');
const ticketHora = document.getElementById('ticket-hora');
const ticketEstado = document.getElementById('ticket-estado');

// 4. Actualización del reloj en tiempo real
function actualizarReloj() {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const horaFormateada = `${horas}:${minutos}`;
  relojCliente.textContent = horaFormateada;
  if (relojBarraEstado) {
    relojBarraEstado.textContent = horaFormateada;
  }
}
setInterval(actualizarReloj, 1000);
actualizarReloj();

// 5. Emisión de nuevo turno
function emitirTurno(tipo) {
  const ahora = new Date();
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
    hora: horaTexto
  };

  turnoActualCliente = turno;

  // Notificar al canal que se generó un nuevo turno
  canal.postMessage({
    accion: 'NUEVO_TURNO',
    turno: turno
  });

  // Actualizar la interfaz del ticket en la app
  renderizarTicket(turno);
}

// 6. Renderizar ticket en pantalla
function renderizarTicket(turno) {
  // Reiniciar animación del ticket
  ticketCard.style.animation = 'none';
  void ticketCard.offsetWidth;
  ticketCard.style.animation = 'ticket-appear 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

  ticketNumero.textContent = turno.numero;
  ticketHora.textContent = turno.hora;
  ticketMensaje.textContent = 'Aguardá tu llamado en las pantallas de la sala';
  ticketEstado.textContent = 'En Espera';
  ticketEstado.className = 'status-waiting';

  if (turno.tipo === 'Prioritario') {
    ticketCategoria.textContent = 'Prioritario';
    ticketCategoria.className = 'ticket-category-pill badge-p';
  } else {
    ticketCategoria.textContent = 'General';
    ticketCategoria.className = 'ticket-category-pill badge-g';
  }
}

// 7. Escuchar mensajes del canal (para saber si el operador llamó nuestro turno)
canal.onmessage = (evento) => {
  const data = evento.data;
  if (!data) return;

  if (data.accion === 'TURNO_LLAMADO') {
    if (turnoActualCliente && turnoActualCliente.numero === data.numero) {
      ticketEstado.textContent = '¡ES TU TURNO!';
      ticketEstado.className = 'status-called';
      ticketMensaje.innerHTML = `<strong style="color: #2563eb;">DIRIGITE A ${data.caja.toUpperCase()}</strong>`;
    }
  }
};

// 8. Event listeners
btnPrioritario.addEventListener('click', () => emitirTurno('Prioritario'));
btnGeneral.addEventListener('click', () => emitirTurno('General'));

btnNuevoTurno.addEventListener('click', () => {
  turnoActualCliente = null;
  ticketNumero.textContent = '--';
  ticketCategoria.textContent = 'Sin Turno';
  ticketCategoria.className = 'ticket-category-pill';
  ticketMensaje.textContent = 'Seleccioná una categoría para emitir tu turno';
  ticketHora.textContent = '--:--';
  ticketEstado.textContent = 'Disponible';
  ticketEstado.className = 'status-waiting';
});

// Inicializar primer turno de muestra
emitirTurno('Prioritario');
