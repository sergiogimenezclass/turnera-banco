/**
 * demo.js - Coordinador de la Demostración Automática en Vivo
 * Sincronización entre iframes, iluminación perimetral y relato narrativo
 */

// 1. Referencias al DOM
const frameTotem = document.getElementById('frame-box-totem');
const frameOperador = document.getElementById('frame-box-operador');
const frameTv = document.getElementById('frame-box-tv');

const pillTotem = document.getElementById('pill-totem');
const pillOperador = document.getElementById('pill-operador');
const pillTv = document.getElementById('pill-tv');

const narradorCaja = document.getElementById('narrador-caja');
const narradorPaso = document.getElementById('narrador-paso');
const narradorTexto = document.getElementById('narrador-texto');
const narradorDot = document.getElementById('narrador-dot');

const btnToggleDemo = document.getElementById('btn-toggle-demo');
const btnPlayIcon = document.getElementById('btn-play-icon');
const btnPlayText = document.getElementById('btn-play-text');
const btnReiniciarDemo = document.getElementById('btn-reiniciar-demo');
const selectVelocidad = document.getElementById('select-velocidad');

const iframeTotem = document.getElementById('iframe-totem');
const iframeOperador = document.getElementById('iframe-operador');
const iframeTv = document.getElementById('iframe-tv');

// 2. Estado de la simulación
let enEjecucion = false;
let pasoActual = 0;
let temporizador = null;

// 3. Función para cambiar el foco visual perimetral (Glow de marco)
function establecerFoco(objetivo, etiquetaEstado, colorBorde) {
  // Limpiar clases de foco previas
  frameTotem.className = 'screen-frame-container';
  frameOperador.className = 'screen-frame-container';
  frameTv.className = 'screen-frame-container';

  pillTotem.textContent = 'En Espera';
  pillTotem.style.backgroundColor = '';
  pillTotem.style.color = '';

  pillOperador.textContent = 'En Espera';
  pillOperador.style.backgroundColor = '';
  pillOperador.style.color = '';

  pillTv.textContent = 'En Espera';
  pillTv.style.backgroundColor = '';
  pillTv.style.color = '';

  if (objetivo === 'totem') {
    frameTotem.classList.add('active-totem');
    pillTotem.textContent = etiquetaEstado || 'Accionando';
    narradorCaja.style.borderLeftColor = '#0284c7';
  } else if (objetivo === 'operador') {
    frameOperador.classList.add('active-operador');
    pillOperador.textContent = etiquetaEstado || 'Despachando';
    narradorCaja.style.borderLeftColor = '#059669';
  } else if (objetivo === 'tv') {
    frameTv.classList.add('active-tv');
    pillTv.textContent = etiquetaEstado || 'Convocando';
    narradorCaja.style.borderLeftColor = '#d97706';
  } else {
    narradorCaja.style.borderLeftColor = '#2563eb';
  }
}

// 4. Utilidad para accionar un botón dentro de un iframe
function clickearEnIframe(iframeEl, botonId) {
  try {
    const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
    if (doc) {
      const boton = doc.getElementById(botonId);
      if (boton) {
        // Simular efecto de pulsación táctil
        boton.style.transform = 'scale(0.95)';
        setTimeout(() => { boton.style.transform = ''; }, 200);
        boton.click();
        return true;
      }
    }
  } catch (error) {
    console.warn('Error accediendo al iframe:', error);
  }
  return false;
}

// 5. Guión de pasos de la demostración
const guionDemo = [
  {
    paso: 'PASO 1 DE 7',
    foco: 'totem',
    etiqueta: 'Solicitando Caja',
    texto: 'Un cliente ingresa a la sucursal y pulsa "Operaciones por Caja" en la pantalla táctil del Tótem. El ticket C-01 se imprime por la ranura mecánica.',
    accion: () => {
      clickearEnIframe(iframeTotem, 'btn-caja');
    }
  },
  {
    paso: 'PASO 2 DE 7',
    foco: 'totem',
    etiqueta: 'Solicitando Tarjetas',
    texto: 'Llega un segundo cliente y solicita turno para "Tarjetas y Cuentas". El tótem emite el ticket correlativo T-01 y lo comunica al operador.',
    accion: () => {
      clickearEnIframe(iframeTotem, 'btn-tarjetas');
    }
  },
  {
    paso: 'PASO 3 DE 7',
    foco: 'totem',
    etiqueta: 'Llegada Prioritaria',
    texto: 'Llega una persona mayor y pulsa el botón destacado "Atención Prioritaria". El tótem emite el ticket P-01 con sello distintivo de prioridad.',
    accion: () => {
      clickearEnIframe(iframeTotem, 'btn-prioritario');
    }
  },
  {
    paso: 'PASO 4 DE 7',
    foco: 'operador',
    etiqueta: 'Aplicando Prioridad',
    texto: 'El Operador en Caja 2 presiona "Llamar Siguiente Turno". Por regla de negocio estricta, el sistema atiende primero a P-01, postergando a C-01 y T-01 que llegaron antes.',
    accion: () => {
      clickearEnIframe(iframeOperador, 'btn-llamar');
    }
  },
  {
    paso: 'PASO 5 DE 7',
    foco: 'tv',
    etiqueta: 'Convocando en Sala',
    texto: 'La pantalla TV de la sala recibe el llamado en vivo: parpadea, resalta en tipografía gigante el turno P-01 hacia Caja 2 y anuncia por voz el destino.',
    accion: () => {
      // La TV se actualiza automáticamente mediante BroadcastChannel
    }
  },
  {
    paso: 'PASO 6 DE 7',
    foco: 'operador',
    etiqueta: 'Despacho General',
    texto: 'El Operador vuelve a presionar "Llamar Siguiente". Como la cola prioritaria ya está vacía, el sistema despacha al primer turno de Cajas en espera (C-01).',
    accion: () => {
      clickearEnIframe(iframeOperador, 'btn-llamar');
    }
  },
  {
    paso: 'PASO 7 DE 7',
    foco: 'tv',
    etiqueta: 'Historial en Sala',
    texto: 'La TV convoca a C-01 hacia Caja 2 y traslada el turno P-01 a la lista lateral de llamados previos. ¡Ciclo completo de prioridad verificado con éxito!',
    accion: () => {
      // Fin del ciclo
    }
  }
];

// 6. Ejecución del paso actual
function ejecutarPaso() {
  if (pasoActual >= guionDemo.length) {
    pausarDemo();
    narradorPaso.textContent = 'DEMOSTRACIÓN FINALIZADA';
    narradorTexto.textContent = 'El ciclo de atención y prioridad estricta se completó. Puede reiniciar la simulación con el botón "Reiniciar".';
    establecerFoco('ninguno');
    return;
  }

  const configuracion = guionDemo[pasoActual];

  // Actualizar narrador
  narradorPaso.textContent = configuracion.paso;
  narradorTexto.textContent = configuracion.texto;
  narradorDot.classList.add('pulsing');

  // Actualizar iluminación perimetral
  establecerFoco(configuracion.foco, configuracion.etiqueta);

  // Ejecutar acción
  if (typeof configuracion.accion === 'function') {
    configuracion.accion();
  }

  pasoActual++;

  // Programar siguiente paso
  if (enEjecucion) {
    const intervaloMs = parseInt(selectVelocidad.value, 10) || 3200;
    temporizador = setTimeout(ejecutarPaso, intervaloMs);
  }
}

// 7. Controles de inicio y pausa
function iniciarDemo() {
  enEjecucion = true;
  btnPlayIcon.textContent = '⏸';
  btnPlayText.textContent = 'Pausar';
  btnToggleDemo.classList.add('playing');
  ejecutarPaso();
}

function pausarDemo() {
  enEjecucion = false;
  if (temporizador) clearTimeout(temporizador);
  btnPlayIcon.textContent = '▶';
  btnPlayText.textContent = 'Reanudar';
  btnToggleDemo.classList.remove('playing');
  narradorDot.classList.remove('pulsing');
}

function reiniciarDemo() {
  pausarDemo();
  pasoActual = 0;
  btnPlayText.textContent = 'Iniciar Demostración';

  // Recargar los 3 iframes para resetear contadores y estados
  iframeTotem.src = iframeTotem.src;
  iframeOperador.src = iframeOperador.src;
  iframeTv.src = iframeTv.src;

  establecerFoco('ninguno');
  narradorPaso.textContent = 'LISTO PARA INICIAR';
  narradorTexto.textContent = 'Presione "Iniciar Demostración" para ver la interacción sincronizada de las tres pantallas con iluminación de marco perimetral.';
}

// 8. Event listeners
btnToggleDemo.addEventListener('click', () => {
  if (enEjecucion) {
    pausarDemo();
  } else {
    iniciarDemo();
  }
});

btnReiniciarDemo.addEventListener('click', reiniciarDemo);

// Inicializar estado sin foco activo
establecerFoco('ninguno');
