# 🏦 Sistema de Turnero Inteligente con Prioridad (Sala de Espera)

En este proyecto vamos a construir un sistema interactivo de turnos bancarios con atención prioritaria, compuesto por **tres interfaces independientes sincronizadas en tiempo real**:

1. **Tótem de autoservicio bancario (`totem.html`):** Simulador de la columna física de ingreso a la sucursal, con pantalla táctil integrada y ranura dispensadora mecánica de donde emerge el ticket impreso.
2. **Panel del operador (`operador.html`):** Interfaz para el cajero o representante bancario, donde elige su puesto/caja y despacha los turnos aplicando prioridad.
3. **Pantalla de sala de espera (`tv.html`):** Formato TV horizontal (16:9) con tipografía gigante, caja asignada, distintivo de prioridad, historial y locución por voz.

El objetivo pedagógico es aprender a diseñar experiencias de usuario contextualizadas para cada tipo de pantalla y resolver la lógica de colas con prioridad, sincronización multi-pantalla y síntesis de voz usando **JavaScript Vanilla** asistido por Inteligencia Artificial.

El trabajo se realiza con **baby steps**: una funcionalidad pequeña y concreta por vez, verificándola antes de avanzar al siguiente paso.

---

## Las tres vistas del proyecto

```mermaid
flowchart LR
    subgraph V1["Vista 1: Tótem (totem.html)"]
        direction TB
        C1["Formato: Kiosco / Columna de Ingreso"]
        C2["Pantalla Tactil: Turno General / Prioritario"]
        C3["Dispensador Mecanico: Ticket Termico Impreso"]
    end

    subgraph V2["Vista 2: Operador (operador.html)"]
        direction TB
        O1["Formato: Panel de Caja / Escritorio"]
        O2["Selecciona Puesto de Atencion"]
        O3["Monitorea Colas y Despacha con Prioridad"]
    end

    subgraph V3["Vista 3: TV (tv.html)"]
        direction TB
        T1["Formato: Pantalla de Sala (16:9)"]
        T2["Hero: Turno Gigante y Destino"]
        T3["Historial de Llamados y Locucion por Voz"]
    end
```

La comunicación entre las tres pestañas se realiza en tiempo real y sin necesidad de un backend ni dependencias externas, aprovechando la API nativa **`BroadcastChannel`** del navegador.

---

## Estructura de archivos

```text
turnera-bancos/
├── index.html         -> Portada institucional y lanzador de las 3 vistas
├── style-index.css    -> Estilos de la portada principal
├── totem.html         -> Tótem de autoservicio bancario (pantalla táctil y dispensador)
├── operador.html      -> Panel del empleado para despachar turnos
├── tv.html            -> Pantalla de sala de espera (vista TV 16:9)
├── style-totem.css    -> Estilos de columna física y ranura de ticket
├── style-operador.css -> Estilos funcionales para estación de trabajo/caja
├── style-tv.css       -> Estilos para pantalla grande y visión a distancia
├── totem.js           -> Emite turnos e imprime físicamente el ticket térmico
├── operador.js        -> Administra colas con prioridad y llama al siguiente
└── tv.js              -> Recibe llamados, actualiza pantalla y reproduce voz
```

---

## Cómo ejecutar el proyecto

Para que la comunicación por `BroadcastChannel` funcione correctamente entre pestañas o ventanas separadas, deben estar servidas bajo el mismo origen.

Iniciá un servidor local desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

Luego visitá en tu navegador:
* **Portada Principal:** `http://localhost:8000/` (o `index.html`)

Desde la portada podés:
1. Abrir cada vista en una pestaña nueva con su respectivo botón:
   - **Tótem (Autoservicio):** `totem.html`.
   - **Operador (Caja):** `operador.html`.
   - **Pantalla TV:** `tv.html`.
2. O pulsar **"Abrir las 3 Vistas en Pestañas Nuevas"** para lanzarlas todas juntas con un solo clic.

---

## Flujo del sistema

```mermaid
sequenceDiagram
    autonumber
    actor Totem as Tótem (Ingreso)
    participant Canal as BroadcastChannel ('canal_turnero')
    actor Operador as Operador (Caja)
    participant TV as Pantalla TV (Sala)

    Note over Totem: Cliente pulsa General o Prioritario
    Totem->>Totem: Imprime ticket fisico por ranura
    Totem->>Canal: postMessage({ accion: 'NUEVO_TURNO', turno })
    Canal->>Operador: onmessage (actualiza colas en espera)

    Note over Operador: Presiona "Llamar Siguiente" (aplica prioridad)
    Operador->>Canal: postMessage({ accion: 'TURNO_LLAMADO', numero, tipo, caja })
    Canal->>TV: onmessage (renderiza Hero + Historial)
    Note over TV: window.speechSynthesis (vocaliza llamado)
```

1. **El cliente** ingresa a la sucursal y en la pantalla táctil del **Tótem de autoservicio** elige *"Turno General"* o *"Turno Prioritario"*. El tótem imprime su ticket térmico por la ranura y emite el evento al canal.
2. **El operador** ve actualizarse los contadores de espera en su panel. Al presionar *"Llamar Siguiente"*, el sistema atiende primero a los turnos prioritarios. Al despachar, emite el turno convocado junto a su caja (ej. `Caja 2`).
3. **La pantalla de TV** recibe el turno llamado, lo muestra en grande en la zona principal, pasa el anterior al historial de llamados y reproduce la locución de voz en español.

---

## Cómo trabajar con los prompts

No le pidas a la IA que construya todo el sistema de una sola vez. Copiá un prompt por vez, revisá las modificaciones sugeridas, probalas en el navegador y recién después continuá con el siguiente.

Antes de cada paso, compartí el código de los archivos involucrados para que la IA trabaje sobre la base existente en lugar de sobreescribirla por completo.

### Reglas generales de código y maquetación
- **Grid:** Utilizar CSS Grid para el layout general y la estructura contenedora de cada vista.
- **Flexbox:** Utilizar Flexbox exclusivamente dentro de los componentes internos (tarjetas, botones, headers, badges).
- **Colores directos:** Definir colores en formato hexadecimal o RGB directamente en las reglas CSS (sin variables CSS `:root` / `var(...)`).
- **Unidades de medida:** Emplear únicamente `px` y `%` para dimensiones, espaciados y tipografías (sin `rem`, `em`, `vh`, `vw`).
- **Responsividad:** Diseñar interfaces adaptables mediante Media Queries estándar con puntos de quiebre en `px`.
- **JavaScript Vanilla:** Sin librerías, dependencias ni frameworks externos.
- **Nomenclatura y separación:** Respetar los nombres de clases e IDs acordados y mantener separados HTML, CSS y JS.
- **Comentarios:** Explicar conceptos clave y lógica de negocio con comentarios concisos en el código.

---

## Prompt 1: Emisión física de turnos en el tótem de autoservicio (`totem.html` y `totem.js`)

```text
Actuá como desarrollador frontend trabajando con JavaScript Vanilla.
Tengo el archivo totem.html maquetado con la estructura de un tótem bancario físico (pantalla táctil y ranura dispensadora) y su script totem.js.

Necesito programar la lógica del tótem para dispensar turnos en 4 categorías:
1. Mantener 4 contadores independientes autoincrementales en memoria:
   - contadorPrioritario (prefijo 'P')
   - contadorCaja (prefijo 'C')
   - contadorTarjetas (prefijo 'T')
   - contadorCreditos (prefijo 'A')
2. Al pulsar cada botón del tótem (#btn-prioritario, #btn-caja, #btn-tarjetas, #btn-creditos):
   - Generar el código correlativo de dos dígitos (ej. "P-01", "C-01", "T-01", "A-01").
   - Crear un objeto turno: { numero, tipo, servicio, prefijo, fecha, hora }.
   - Renderizar el ticket térmico (#ticket-impreso) que emerge animadamente por la ranura con el número, el servicio, fecha, hora, badge y código de barras.
   - Enviar el mensaje al canal nativo: canal.postMessage({ accion: 'NUEVO_TURNO', turno }).
3. Programar el botón #btn-nuevo-ticket para simular que el cliente retiró el ticket impreso de la boca del dispensador.

Escribí el código para totem.js con comentarios claros y directos.
```

### Comprobar
- Al presionar cualquiera de los 4 botones en `totem.html`, el ticket físico desciende animadamente por la ranura con el código y servicio correcto.
- En la consola del navegador se verifica el envío del objeto al `BroadcastChannel`.

---

## Prompt 2: Telemetría de 4 colas y llamado prioritario en la terminal del operador (`operador.html` y `operador.js`)

```text
Continuamos con la vista del empleado de atención en operador.html y su script operador.js.

La interfaz del operador cuenta con:
- Un selector #select-caja con opciones ("Caja 2", "Caja 1", "Box 1", "Box 2").
- Cuatro contadores de telemetría (#contador-prioritario, #contador-caja, #contador-tarjetas, #contador-asesoria).
- Un botón principal #btn-llamar ("Llamar Siguiente Turno").
- Un área para mostrar el turno y servicio actualmente en atención (#turno-actual-numero, #turno-actual-servicio).

Implementá la lógica en operador.js:
1. Conectar a 'canal_turnero' mediante BroadcastChannel.
2. Mantener 4 arrays en memoria: colaPrioritaria, colaCaja, colaTarjetas y colaAsesoria.
3. Al recibir un mensaje con accion === 'NUEVO_TURNO', clasificar el turno en la cola que corresponda y actualizar los contadores.
4. Al hacer clic en #btn-llamar:
   - Regla 1 (Prioridad absoluta): Si hay turnos en colaPrioritaria, extraer siempre el primero (shift()).
   - Regla 2 (Afinidad de puesto): Si no hay prioritarios, atender según el puesto seleccionado (Cajas atienden colaCaja, Box 1 atiende colaTarjetas, Box 2 atiende colaAsesoria). Si la cola propia está vacía, atender cualquier otra cola pendiente.
   - Si todas las colas están vacías, mostrar un mensaje de aviso en pantalla indicando que no hay clientes en espera.
   - Actualizar el área de atención y emitir al canal:
     canal.postMessage({ accion: 'TURNO_LLAMADO', numero: turno.numero, tipo: turno.tipo, servicio: turno.servicio, caja: puestoSeleccionado, hora });

Mantené el código modular, sin librerías externas y comentado.
```

### Comprobar
- Al emitir turnos desde `totem.html`, los contadores de las 4 colas en `operador.html` suben en tiempo real.
- Al pulsar "Llamar Siguiente", los turnos prioritarios `P` se atienden antes que cualquier otro servicio.
- Al despachar, el evento `TURNO_LLAMADO` se publica en el `BroadcastChannel`.

---

## Prompt 3: Recepción e interfaz hero en la pantalla de TV (`tv.html` y `tv.js`)

```text
Tengo la vista de sala de espera en tv.html, su estilo style-tv.css y su script tv.js.

Necesito implementar en tv.js la recepción de los llamados del operador y su visualización:
1. Conectar a 'canal_turnero' mediante BroadcastChannel.
2. Escuchar mensajes con accion === 'TURNO_LLAMADO'.
3. Al recibir un llamado, actualizar la Zona Principal (Hero):
   - Elemento #tv-numero: código del turno en tipografía gigante.
   - Elemento #tv-servicio: nombre del servicio solicitado.
   - Elemento #tv-destino: puesto asignado (ej. "Caja 2", "Box 1").
   - Elemento #tv-categoria: badge destacado según si es prioritario o general.
4. Mantener un array historialLlamados con un máximo de 4 turnos previos y renderizarlos en la Zona Secundaria (#tv-historial-lista) con distintivos de color según el prefijo.
5. Agregar una clase CSS temporal 'animar-llamado' al contenedor hero para generar un efecto visual de pulso cada vez que entra un nuevo llamado.

Escribí el código para tv.js y las reglas de animación en style-tv.css.
```

### Comprobar
- Al presionar "Llamar Siguiente" en el panel del operador, la pantalla de TV actualiza inmediatamente el turno gigante y la caja asignada.
- El turno anterior pasa a la lista de historial secundario.
- El badge visual distingue claramente si la atención es prioritaria o general.
- Se ejecuta la animación visual de llamado.

---

## Prompt 4: Síntesis de voz y accesibilidad en la TV (`tv.js`)

```text
Quiero agregar feedback sonoro en la TV usando la API nativa window.speechSynthesis en tv.js.

Requerimientos:
1. Crear una función reproducirLocucion(numero, caja):
   - Armar la frase: "Turno [numero], dirigirse a [caja]".
   - Crear una instancia de SpeechSynthesisUtterance con el texto.
   - Configurar el idioma en español ('es-ES' o 'es-AR').
   - Ajustar la velocidad (rate = 0.9) y tono para una locución clara institucional.
   - Antes de reproducir, cancelar cualquier audio en curso con window.speechSynthesis.cancel().
   - Ejecutar window.speechSynthesis.speak().
2. Debido a las políticas de los navegadores que bloquean el audio automático sin interacción previa, incluir en tv.html un botón flotante discreto #btn-audio ("Activar Audio") que al ser pulsado reproduzca un sonido de prueba corto o inicialice la síntesis de voz y luego se oculte.

Escribí la implementación para tv.js y el botón en tv.html.
```

### Comprobar
- Al pulsar "Activar Audio" una sola vez en la TV, queda habilitado el sintetizador.
- Con cada nuevo turno llamado por el operador, la TV anuncia por voz el turno y la caja en español.
- Si se llama rápido a dos turnos, el audio anterior se corta prolijamente para enunciar el nuevo.

---

## Prompt 5: Animación mecánica y ciclo de retiro en el tótem (`totem.js` y `style-totem.css`)

```text
Para pulir la experiencia de autoservicio en el tótem físico (totem.html):

Requerimientos:
1. En style-totem.css, diseñar una animación CSS de corte e impresión mecánica (@keyframes print-ticket):
   - El ticket debe simular que desciende y emerge desde la ranura de corte (transform: translateY).
2. En totem.js:
   - Al pulsar "Atención Prioritaria" o "Atención General", reiniciar la animación de salida para que cada nuevo ticket se imprima de forma fluida.
   - Programar el botón #btn-nuevo-ticket ("Simular retiro del ticket") para reiniciar el estado de la boca del dispensador y dejarla lista para el próximo visitante.
   - Mantener actualizado el reloj institucional en el cabezal del tótem cada segundo.

Escribí los ajustes de animación para style-totem.css y la lógica en totem.js.
```

### Comprobar
- Cada vez que se emite un turno en el tótem, el ticket emerge con una animación que simula la salida de papel térmico de la ranura.
- Al pulsar "Simular retiro del ticket", la ranura queda limpia y disponible para el siguiente usuario.
