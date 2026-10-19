/**
 * tv.js - Lógica de la pantalla de sala de espera (TV 16:9 - 4 servicios)
 * Recepción por BroadcastChannel, actualización Hero con servicio, historial y locución por voz
 */

// 1. Instancia del canal de comunicación
const canal = new BroadcastChannel('canal_turnero');

// 2. Estado local de la TV
const historialLlamados = [];
let audioHabilitado = false;

// 3. Referencias al DOM
const tvHero = document.getElementById('tv-hero');
const tvCategoria = document.getElementById('tv-categoria');
const tvNumero = document.getElementById('tv-numero');
const tvServicio = document.getElementById('tv-servicio');
const tvDestino = document.getElementById('tv-destino');
const tvHistorialLista = document.getElementById('tv-historial-lista');
const relojTv = document.getElementById('reloj-tv');
const btnAudio = document.getElementById('btn-audio');
const audioLed = document.getElementById('audio-led');
const audioEstadoTexto = document.getElementById('audio-estado-texto');

// 4. Reloj digital en tiempo real
function actualizarRelojTv() {
  const ahora = new Date();
  relojTv.textContent = ahora.toLocaleTimeString();
}
setInterval(actualizarRelojTv, 1000);
actualizarRelojTv();

// 5. Locución por voz con SpeechSynthesis
function reproducirLocucion(numero, servicio, caja) {
  if (!audioHabilitado || !('speechSynthesis' in window)) return;

  // Cancelar audio previo en curso
  window.speechSynthesis.cancel();

  // Frase institucional clara
  const mensaje = `Turno ${numero}, ${servicio}, dirigirse a ${caja}`;
  const locucion = new SpeechSynthesisUtterance(mensaje);

  locucion.lang = 'es-AR';
  locucion.rate = 0.9;
  locucion.pitch = 1.0;

  window.speechSynthesis.speak(locucion);
}

// 6. Actualización de la pantalla al recibir un nuevo llamado
function actualizarPantalla(turno) {
  // Desplazar el turno previo al historial antes de mostrar el nuevo
  const turnoActualPrevio = tvNumero.textContent;
  const cajaPrevia = tvDestino.textContent;
  const servicioPrevio = tvServicio.textContent;

  if (turnoActualPrevio && turnoActualPrevio !== '--') {
    const prefijo = turnoActualPrevio.charAt(0);
    historialLlamados.unshift({
      numero: turnoActualPrevio,
      servicio: servicioPrevio,
      prefijo: prefijo,
      caja: cajaPrevia
    });

    if (historialLlamados.length > 4) {
      historialLlamados.pop();
    }

    renderizarHistorial();
  }

  // Actualizar Zona Hero
  tvNumero.textContent = turno.numero;
  tvServicio.textContent = turno.servicio || 'Atención General';
  tvDestino.textContent = turno.caja;

  if (turno.tipo === 'Prioritario' || turno.numero.startsWith('P')) {
    tvCategoria.textContent = '⭐ Atención Prioritaria';
    tvCategoria.className = 'category-pill pill-priority';
  } else {
    tvCategoria.textContent = '🔹 Atención General';
    tvCategoria.className = 'category-pill pill-general';
  }

  // Disparar animación de pulso visual
  tvHero.classList.remove('animar-llamado');
  void tvHero.offsetWidth; // Forzar reflow
  tvHero.classList.add('animar-llamado');

  // Reproducir locución por voz
  reproducirLocucion(turno.numero, turno.servicio || '', turno.caja);
}

// 7. Renderizado del historial secundario
function renderizarHistorial() {
  if (historialLlamados.length === 0) {
    tvHistorialLista.innerHTML = '<div class="rail-empty-message">No hay llamados anteriores registrados</div>';
    return;
  }

  tvHistorialLista.innerHTML = historialLlamados.map((item) => {
    let claseItem = 'item-general';
    if (item.prefijo === 'P') claseItem = 'item-priority';
    else if (item.prefijo === 'C') claseItem = 'item-caja';
    else if (item.prefijo === 'T') claseItem = 'item-tarjetas';
    else if (item.prefijo === 'A') claseItem = 'item-asesoria';

    return `
      <div class="rail-item ${claseItem}">
        <div class="rail-item-info">
          <span class="rail-code">${item.numero}</span>
          <span class="rail-type-label">${item.servicio}</span>
        </div>
        <span class="rail-dest">${item.caja}</span>
      </div>
    `;
  }).join('');
}

// 8. Habilitación de audio (política de interacción del navegador)
btnAudio.addEventListener('click', () => {
  audioHabilitado = true;
  audioLed.classList.add('active');
  audioEstadoTexto.textContent = 'Audio activo (ES)';
  btnAudio.style.display = 'none';

  if ('speechSynthesis' in window) {
    const prueba = new SpeechSynthesisUtterance('Audio activado');
    prueba.lang = 'es-AR';
    prueba.rate = 1.0;
    window.speechSynthesis.speak(prueba);
  }
});

// 9. Escucha del canal BroadcastChannel
canal.onmessage = (evento) => {
  const data = evento.data;
  if (!data) return;

  if (data.accion === 'TURNO_LLAMADO') {
    actualizarPantalla(data);
  }
};
