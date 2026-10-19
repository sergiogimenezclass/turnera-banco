/**
 * tv.js - Lógica de la pantalla de sala de espera (TV 16:9)
 * Recepción por BroadcastChannel, actualización Hero, historial y locución por voz
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
function reproducirLocucion(numero, caja) {
  if (!audioHabilitado || !('speechSynthesis' in window)) return;

  // Cancelar audio previo en curso
  window.speechSynthesis.cancel();

  // Armar frase institucional clara
  const mensaje = `Turno ${numero}, dirigirse a ${caja}`;
  const locucion = new SpeechSynthesisUtterance(mensaje);

  locucion.lang = 'es-AR';
  locucion.rate = 0.9;  // Velocidad pausada y clara
  locucion.pitch = 1.0;

  window.speechSynthesis.speak(locucion);
}

// 6. Actualización de la pantalla al recibir un nuevo llamado
function actualizarPantalla(turno) {
  // Desplazar el turno actual al historial antes de mostrar el nuevo (si ya había uno)
  const turnoActualPrevio = tvNumero.textContent;
  const cajaPrevia = tvDestino.textContent;

  if (turnoActualPrevio && turnoActualPrevio !== '--') {
    const esPrioritario = turnoActualPrevio.startsWith('P');
    historialLlamados.unshift({
      numero: turnoActualPrevio,
      tipo: esPrioritario ? 'Prioritario' : 'General',
      caja: cajaPrevia
    });

    if (historialLlamados.length > 4) {
      historialLlamados.pop();
    }

    renderizarHistorial();
  }

  // Actualizar Zona Hero
  tvNumero.textContent = turno.numero;
  tvDestino.textContent = turno.caja;

  if (turno.tipo === 'Prioritario') {
    tvCategoria.textContent = '⭐ Atención Prioritaria';
    tvCategoria.className = 'category-pill pill-priority';
  } else {
    tvCategoria.textContent = '🔹 Atención General';
    tvCategoria.className = 'category-pill pill-general';
  }

  // Disparar animación de pulso visual
  tvHero.classList.remove('animar-llamado');
  void tvHero.offsetWidth; // Forzar reflow para reiniciar keyframe
  tvHero.classList.add('animar-llamado');

  // Reproducir locución por voz
  reproducirLocucion(turno.numero, turno.caja);
}

// 7. Renderizado del historial secundario
function renderizarHistorial() {
  if (historialLlamados.length === 0) {
    tvHistorialLista.innerHTML = '<div class="rail-empty-message">No hay llamados anteriores registrados</div>';
    return;
  }

  tvHistorialLista.innerHTML = historialLlamados.map((item) => `
    <div class="rail-item ${item.tipo === 'Prioritario' ? 'item-priority' : 'item-general'}">
      <div class="rail-item-info">
        <span class="rail-code">${item.numero}</span>
        <span class="rail-type-label">${item.tipo}</span>
      </div>
      <span class="rail-dest">${item.caja}</span>
    </div>
  `).join('');
}

// 8. Habilitación de audio (política de interacción del navegador)
btnAudio.addEventListener('click', () => {
  audioHabilitado = true;
  audioLed.classList.add('active');
  audioEstadoTexto.textContent = 'Audio activo (ES)';
  btnAudio.style.display = 'none';

  // Sonido de confirmación corto
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
