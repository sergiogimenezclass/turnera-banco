# 🏦 Sistema de Turnero Inteligente con Prioridad (Sala de Espera)

En este proyecto vamos a construir un sistema interactivo de turnos bancarios con atención prioritaria, compuesto por dos interfaces sincronizadas en tiempo real: la **pantalla de la sala de espera (TV horizontal)** y el **panel de control y emisión de turnos (móvil/tótem)**.

El objetivo pedagógico es aprender a diseñar experiencias de usuario claras para situaciones de espera y resolver la lógica de colas con prioridad, sincronización entre ventanas del navegador y síntesis de voz usando **JavaScript Vanilla** asistido por Inteligencia Artificial.

El trabajo se realiza con **baby steps**: una funcionalidad pequeña y concreta por vez, verificándola antes de avanzar al siguiente paso.

---

## Las dos vistas del proyecto

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Vista A: tv.html       → Pantalla de pared (formato TV 16:9)           │
│                          Muestra el turno actual gigante, caja e hist. │
├────────────────────────────────────────────────────────────────────────┤
│ Vista B: control.html  → Simulador dual (Tótem de clientes + Operador) │
│                          Genera turnos y despacha llamadas             │
└────────────────────────────────────────────────────────────────────────┘
```

La comunicación entre ambas vistas se realiza en tiempo real y sin necesidad de un backend ni dependencias externas, aprovechando la API nativa **`BroadcastChannel`** del navegador.

---

## Archivos principales

```text
turnera-bancos/
├── tv.html          -> Pantalla de sala de espera (vista TV 16:9)
├── control.html     -> Simulador unificado: Tótem de clientes + Panel de caja
├── style-tv.css     -> Estilos para pantalla grande y visión a distancia
├── style-ctrl.css   -> Estilos táctiles para interfaz de operador/tótem
├── tv.js            -> Recibe el turno, actualiza la vista y reproduce la locución
└── control.js       -> Gestiona las colas con prioridad y emite los llamados
```

---

## Cómo ejecutar el proyecto

Para que la comunicación por `BroadcastChannel` funcione correctamente entre pestañas o ventanas separadas, ambas deben estar servidas bajo el mismo origen.

Iniciá un servidor local desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

Luego abrí en dos ventanas de tu navegador:
* **Pantalla TV:** `http://localhost:8000/tv.html`
* **Control / Operador:** `http://localhost:8000/control.html`

Colocá una ventana al lado de la otra para observar la sincronización en vivo.

---

## ¿Qué hace el sistema terminado?

- **Emisión de turnos:** Genera códigos autoincrementales diferenciados para turnos Generales (`G-01`, `G-02`...) y Prioritarios (`P-01`, `P-02`...).
- **Contadores en vivo:** Informa en tiempo real cuántas personas esperan en cada categoría.
- **Atención con prioridad estricta:** Al solicitar el siguiente turno, atiende siempre a la cola prioritaria si contiene elementos; únicamente si está vacía pasa a la cola general.
- **Sincronización instantánea:** El operador selecciona su puesto de atención (ej. *Caja 1*, *Caja 2*, *Box 3*) y, al llamar, el turno se refleja al instante en la TV mediante `BroadcastChannel`.
- **Jerarquía visual a distancia:** La TV muestra el turno convocado en tamaño extragrande con distintivo de categoría (badge de color) y destino claro.
- **Historial de llamados:** Mantiene en la TV una lista secundaria con los últimos turnos atendidos.
- **Accesibilidad y feedback:** Reproduce una locución en español usando `window.speechSynthesis` y resalta con una animación de pulso cada nuevo llamado.

---

## Cómo trabajar con los prompts

No le pidas a la IA que construya todo el sistema de una sola vez. Copiá un prompt por vez, revisá las modificaciones sugeridas, probalas en el navegador y recién después continuá con el siguiente.

Antes de cada paso, compartí el código de los archivos involucrados para que la IA trabaje sobre la base existente en lugar de sobreescribirla por completo.

### Reglas para todos los pasos
- Usar **JavaScript Vanilla** estándar; no agregar librerías externas ni frameworks.
- Respetar los nombres de clases, identificadores y atributos HTML acordados.
- Mantener separados los estilos (`style-*.css`) de la lógica (`*.js`).
- Explicar las funciones y conceptos clave con comentarios breves y claros en el código.
- Verificar manualmente cada punto de control antes de avanzar.

---

## Prompt 1: Generación de turnos y contadores de espera

```text
Actuá como desarrollador frontend trabajando con JavaScript Vanilla.
Tengo el archivo control.html y su archivo de script control.js.

Necesito implementar la lógica para emitir turnos en el bloque del Tótem:
1. Definir dos colas en memoria: colaGeneral y colaPrioritaria como arrays vacíos.
2. Mantener dos contadores independientes autoincrementales que arranquen en 1.
3. Al presionar el botón #btn-turno-general, generar un código con formato "G-01", "G-02", etc. (con ceros a la izquierda para dos dígitos), agregarlo al final de colaGeneral y refrescar el contador en pantalla.
4. Al presionar el botón #btn-turno-prioritario, generar un código con formato "P-01", "P-02", etc., agregarlo al final de colaPrioritaria y refrescar el contador en pantalla.
5. Actualizar en el elemento #indicador-espera la cantidad de turnos pendientes de cada tipo (por ejemplo: "En espera: 2 generales | 1 prioritario").

Escribí el código para control.js de forma clara y comentada, sin dependencias externas.
```

### Comprobar
- Al hacer clic en "+ Turno General", se genera correlativamente `G-01`, `G-02`, etc.
- Al hacer clic en "+ Turno Prioritario", se genera correlativamente `P-01`, `P-02`, etc.
- El texto del indicador refleja la cantidad exacta en espera en cada lista.

---

## Prompt 2: Despacho de turnos con criterio de prioridad

```text
Continuamos con control.js. Ahora vamos a programar la acción del Operador bancario.

En la interfaz contamos con:
- Un selector #select-caja con opciones ("Caja 1", "Caja 2", "Box 3").
- Un botón principal #btn-llamar ("Llamar Siguiente").
- Un historial local en memoria llamado historial (array).

Implementá la función llamarSiguiente():
1. Si ambas colas (colaPrioritaria y colaGeneral) están vacías, mostrar un mensaje visual en pantalla informando que no hay clientes en espera (no uses alert()).
2. Si hay elementos en colaPrioritaria, extraer el primer turno (shift()) y registrar su tipo como 'Prioritario'.
3. Si colaPrioritaria está vacía pero hay elementos en colaGeneral, extraer el primero de colaGeneral y registrar su tipo como 'General'.
4. Obtener el puesto seleccionado en #select-caja.
5. Guardar el turno llamado en el historial y actualizar los contadores de espera.
6. Devolver o registrar un objeto con los datos del llamado: { numero, tipo, caja, hora }.

Mantené el código modular, limpio y comentado.
```

### Comprobar
- Si existen turnos prioritarios, se despachan antes que cualquier turno general, sin importar quién llegó primero.
- Si no hay turnos prioritarios, se despachan los generales por orden de llegada.
- Si no hay ningún turno, no se produce error y se muestra el aviso de espera vacía.

---

## Prompt 3: Sincronización en tiempo real con BroadcastChannel

```text
Necesito conectar control.js con tv.js usando la API nativa BroadcastChannel.

1. En control.js:
   - Crear una instancia de BroadcastChannel con el nombre 'canal_turnero'.
   - Cada vez que llamarSiguiente() despache un turno exitosamente, emitir un mensaje con el objeto del turno:
     canal.postMessage({ numero, tipo, caja, hora });

2. En tv.js:
   - Crear una instancia del mismo canal: new BroadcastChannel('canal_turnero').
   - Escuchar los mensajes con onmessage.
   - Al recibir los datos, llamar a una función actualizarPantalla(turno) que imprima por consola los datos recibidos y prepare el DOM para los siguientes pasos.

Explicá brevemente en comentarios cómo funciona BroadcastChannel y qué precauciones de origen (Same-Origin) se deben tener en cuenta.
```

### Comprobar
- Al presionar "Llamar Siguiente" en `control.html`, la consola de `tv.html` recibe y muestra el objeto con el turno, la caja y el tipo.
- La comunicación se produce instantáneamente entre las dos ventanas abiertas.

---

## Prompt 4: Actualización visual e historial en la pantalla de TV

```text
Tengo tv.html, style-tv.css y tv.js. Necesito implementar la actualización visual del turno en la pantalla de la TV.

Requerimientos:
1. En tv.js, crear la lógica para reflejar el turno convocado en la Zona Principal (Hero):
   - El número de turno (#turno-numero) en tipografía destacada.
   - El destino asignado (#turno-caja, ej. "Dirigirse a Caja 2").
   - Una etiqueta badge (#turno-tipo) que cambie visualmente según si es "Atención Prioritaria" o "Atención General" (asignando una clase CSS adecuada).
2. Mantener un array historialTurnos con los últimos llamados.
3. Renderizar en la Zona Secundaria (#historial-lista) los últimos 3 o 4 turnos llamados, indicando su código y la caja que los atendió.
4. Agregar una clase temporal de animación (ej. 'animar-llamado') al contenedor principal cada vez que llega un nuevo turno para producir un efecto de pulso/parpadeo visual, removiéndola al finalizar la animación.

Escribí la función actualizarPantalla(turno) y las reglas CSS necesarias en style-tv.css.
```

### Comprobar
- La pantalla de la TV muestra el turno actual grande y legible.
- El badge cambia de color o estilo según sea prioritario o general.
- La lista de historial se desplaza mostrando los últimos 3 o 4 llamados previos.
- Se ejecuta la animación de pulso al convocarse un nuevo turno.

---

## Prompt 5: Locución y feedback sonoro accesible

```text
Quiero agregar feedback sonoro y accesible en la TV utilizando la API nativa window.speechSynthesis en tv.js.

Requerimientos:
1. Crear una función reproducirLocucion(numero, caja):
   - Armar el mensaje: "Turno [numero], dirigirse a [caja]".
   - Crear una instancia de SpeechSynthesisUtterance con el texto.
   - Configurar el idioma en español ('es-ES' o 'es-AR').
   - Ajustar el tono (pitch) y la velocidad (rate) para que suene claro y pausado.
   - Cancelar cualquier locución anterior antes de emitir la nueva con window.speechSynthesis.cancel().
   - Ejecutar window.speechSynthesis.speak().
2. Manejar la política de autoplay del navegador: si el navegador bloquea el audio hasta la primera interacción del usuario, mostrar un botón flotante sutil "Activar Audio" en la TV que habilite el contexto tras el primer clic.

Escribí la función y el manejo de audio para tv.js.
```

### Comprobar
- Cada vez que se despacha un turno, la computadora vocaliza claramente el número y la caja.
- Si se convocan dos turnos consecutivos, la locución previa se interrumpe prolijamente para dar paso a la nueva.
- Se resuelve adecuadamente la restricción de interacción previa requerida por los navegadores para reproducir sonido.
