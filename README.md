# 🏦 Sistema de Turnero Inteligente con Prioridad (Sala de Espera)

En este proyecto vamos a construir un sistema interactivo de turnos bancarios con atención prioritaria, compuesto por **tres interfaces independientes sincronizadas en tiempo real**:

1. **Pantalla de sala de espera (`tv.html`):** Formato TV horizontal (16:9) con tipografía gigante, caja asignada, distintivo de prioridad e historial.
2. **Panel del operador (`operador.html`):** Interfaz para el cajero o representante bancario, donde elige su puesto/caja y despacha los turnos aplicando prioridad.
3. **App móvil del cliente (`cliente.html`):** Simulador de celular (diseño vertical para pantalla táctil) donde la persona solicita su turno (General o Prioritario) y visualiza su ticket emitido.

El objetivo pedagógico es aprender a diseñar experiencias de usuario contextualizadas para cada tipo de pantalla y resolver la lógica de colas con prioridad, sincronización multi-pantalla y síntesis de voz usando **JavaScript Vanilla** asistido por Inteligencia Artificial.

El trabajo se realiza con **baby steps**: una funcionalidad pequeña y concreta por vez, verificándola antes de avanzar al siguiente paso.

---

## Las tres vistas del proyecto

```mermaid
flowchart LR
    subgraph V1["Vista 1: Cliente (cliente.html)"]
        direction TB
        C1["Formato: Celular (9:16)"]
        C2["Solicita Turno (General / Prioritario)"]
        C3["Visualiza Ticket Digital"]
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
├── cliente.html       -> App móvil del usuario para solicitar turno (vista celular)
├── operador.html      -> Panel del empleado para despachar turnos
├── tv.html            -> Pantalla de sala de espera (vista TV 16:9)
├── style-cliente.css  -> Estilos táctiles adaptados a formato móvil
├── style-operador.css -> Estilos funcionales para estación de trabajo/caja
├── style-tv.css       -> Estilos para pantalla grande y visión a distancia
├── cliente.js         -> Emite nuevos turnos y muestra el ticket del usuario
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
   - **Cliente (Celular):** `cliente.html` *(podés abrir las DevTools en modo simulación de dispositivo móvil)*.
   - **Operador (Caja):** `operador.html`.
   - **Pantalla TV:** `tv.html`.
2. O pulsar **"Abrir las 3 Vistas en Pestañas Nuevas"** para lanzarlas todas juntas con un solo clic.

---

## Flujo del sistema

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente (Móvil)
    participant Canal as BroadcastChannel ('canal_turnero')
    actor Operador as Operador (Caja)
    participant TV as Pantalla TV (Sala)

    Note over Cliente: Selecciona Tipo (General / Prioritario)
    Cliente->>Canal: postMessage({ accion: 'NUEVO_TURNO', turno })
    Canal->>Operador: onmessage (actualiza colas en espera)

    Note over Operador: Presiona "Llamar Siguiente" (aplica prioridad)
    Operador->>Canal: postMessage({ accion: 'TURNO_LLAMADO', numero, tipo, caja })
    Canal->>TV: onmessage (renderiza Hero + Historial)
    Note over TV: window.speechSynthesis (vocaliza llamado)
    Canal->>Cliente: onmessage (notifica si su ticket fue llamado)
```

1. **El cliente** elige *"Turno General"* o *"Turno Prioritario"*. Su app le confirma su número (ej. `P-01`) y emite el evento al canal.
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

## Prompt 1: Emisión de turnos en la app del cliente (`cliente.html` y `cliente.js`)

```text
Actuá como desarrollador frontend trabajando con JavaScript Vanilla.
Tengo el archivo cliente.html maquetado con apariencia de pantalla de celular (modo vertical) y su archivo cliente.js.

Necesito programar la lógica del cliente para solicitar un turno:
1. Mantener dos contadores independientes autoincrementales en memoria: uno para turnos generales (inicia en 1) y otro para prioritarios (inicia en 1).
2. Al pulsar el botón #btn-general:
   - Generar el código "G-01", "G-02", etc. (con dos dígitos).
   - Crear un objeto con el turno: { numero: "G-01", tipo: "General", fecha: new Date().toLocaleTimeString() }.
   - Mostrar un ticket de confirmación en la pantalla del celular (#ticket-resultado) indicando el número asignado y el mensaje "Aguarde su llamado en la sala".
3. Al pulsar el botón #btn-prioritario:
   - Generar el código "P-01", "P-02", etc.
   - Crear el objeto correspondiente con tipo "Prioritario" y mostrar el ticket con un distintivo visual de prioridad.
4. Conectar con un canal de BroadcastChannel llamado 'canal_turnero' y enviar un mensaje cada vez que se genera un turno:
   canal.postMessage({ accion: 'NUEVO_TURNO', turno });

Escribí el código para cliente.js con comentarios claros y directos.
```

### Comprobar
- Al presionar cada botón en `cliente.html`, se muestra el ticket con el número correspondiente y formato de 2 dígitos.
- En la consola del navegador se verifica el envío del mensaje por el `BroadcastChannel`.

---

## Prompt 2: Recepción de colas y llamado prioritario en el panel del operador (`operador.html` y `operador.js`)

```text
Continuamos con la vista del empleado de atención en operador.html y su script operador.js.

La interfaz del operador cuenta con:
- Un selector #select-caja con opciones ("Caja 1", "Caja 2", "Box 3").
- Un panel indicador de espera (#contador-general y #contador-prioritario).
- Un botón principal #btn-llamar ("Llamar Siguiente").
- Un área para mostrar el turno que el operador está atendiendo actualmente (#turno-actual).

Implementá la lógica en operador.js:
1. Conectar al mismo 'canal_turnero' mediante BroadcastChannel.
2. Mantener dos arrays en memoria: colaGeneral y colaPrioritaria.
3. Al recibir un mensaje con accion === 'NUEVO_TURNO', agregar el turno a la cola correspondiente según su tipo y actualizar los contadores en pantalla.
4. Al hacer clic en #btn-llamar:
   - Si ambas colas están vacías, mostrar un mensaje de aviso en pantalla indicando que no hay clientes en espera.
   - Si hay turnos en colaPrioritaria, extraer el primero (shift()).
   - Si colaPrioritaria está vacía pero hay en colaGeneral, extraer el primero de colaGeneral.
   - Obtener la caja seleccionada en #select-caja.
   - Actualizar el área #turno-actual en el panel del operador.
   - Emitir al canal un mensaje con accion === 'TURNO_LLAMADO':
     canal.postMessage({ accion: 'TURNO_LLAMADO', numero: turno.numero, tipo: turno.tipo, caja: cajaSeleccionada });
   - Actualizar los contadores de espera.

Mantené el código modular, sin librerías externas y comentado.
```

### Comprobar
- Cuando se emite un turno desde `cliente.html`, los contadores de `operador.html` aumentan automáticamente sin recargar.
- Al pulsar "Llamar Siguiente", los turnos prioritarios se atienden siempre antes que los generales.
- Al despachar, el evento `TURNO_LLAMADO` se publica en el `BroadcastChannel`.

---

## Prompt 3: Recepción e interfaz hero en la pantalla de TV (`tv.html` y `tv.js`)

```text
Tengo la vista de sala de espera en tv.html, su estilo style-tv.css y su script tv.js.

Necesito implementar en tv.js la recepción de los llamados del operador y su visualización:
1. Conectar a 'canal_turnero' mediante BroadcastChannel.
2. Escuchar mensajes con accion === 'TURNO_LLAMADO'.
3. Al recibir un llamado, actualizar la Zona Principal (Hero):
   - Elemento #turno-numero: código del turno en tipografía gigante.
   - Elemento #turno-caja: texto indicando destino (ej. "Dirigirse a Caja 2").
   - Elemento #turno-tipo: badge o etiqueta destacada ("Atención Prioritaria" o "Atención General") asignando la clase CSS adecuada según el tipo.
4. Mantener un array historialTurnos con un máximo de 4 turnos previos y renderizarlos en la Zona Secundaria (#historial-lista).
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

## Prompt 5: Sincronización del estado de cola en la app del cliente (`cliente.js`)

```text
Para cerrar la experiencia móvil del cliente en cliente.html y cliente.js:

Requerimientos:
1. Escuchar en cliente.js los mensajes de 'canal_turnero'.
2. Cuando llegue una accion === 'TURNO_LLAMADO':
   - Si el turno llamado coincide con el turno que el usuario tiene en su ticket activo, cambiar el estado del ticket a "¡Es tu turno! Dirigite a [caja]" con un fondo destacado o alerta visual en la app del celular.
   - Mostrar cuántos turnos faltan para que sea su turno si aún está en la fila.
3. Permitir al cliente solicitar un nuevo turno una vez que el anterior fue llamado o descartado mediante un botón "Pedir otro turno".

Escribí la lógica para cliente.js manteniendo la persistencia simple del turno propio.
```

### Comprobar
- El celular del cliente informa en tiempo real cuando su número específico es convocado por el operador.
- Permite reiniciar el flujo para pedir un nuevo turno.
