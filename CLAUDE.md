# web_cahe_v3 — CAHE Atlas v3 (refactor unificado)

> Protocolo común de agentes: ver `../../AGENTS.md`.

## Objetivo

Tercera iteración del visor CAHE. Sustituye los múltiples botones-flip y los
HTMLs autocontenidos de v1, y la app modular pero algo abstracta de v2, por
un **panel unificado**: cada indicador (bosques, cultivos, energía…) se ve
en una única pantalla con mapa + tendencia + ranking + composición sincronizados
por una línea temporal compartida. La comparativa España vs Mundo vive en su
propia sección, también unificada (tendencia + ranking + tabla).

**v3 es autónoma desde el 2026-09-05**: no lee nada de `../web_cahe` (v1) ni de
`../web_cahe_v2` en tiempo de ejecución. Los documentos, iconos, fotos de equipo,
logos y los dos CSV globales que antes venían de v1 están ahora dentro de esta
carpeta. v1 y v2 se conservan intactos, pero solo como archivo: se pueden archivar
fuera de OneDrive sin romper este visor.

## Estructura

```
index.html              PORTADA Y PUERTA DE ENTRADA. Portada V7 (2026-09-08):
                        la curva de emisiones sube, se hace contorno de España y
                        el contorno se eleva a un globo que gira. Autocontenida:
                        lleva dentro su propio <style> y su propio <script>, no
                        usa css/styles.css ni js/. Ver "Entrada" mas abajo.
explorer.html           LA APLICACIÓN (panel unificado). Se entra desde la
                        portada con un ancla: explorer.html#<seccion>.
portada/                Kits de datos que dibuja la portada: spain.js, cahe.js y
                        world-110m.js (tierras del globo, copiado del kit de
                        07_temp/portadas_visores_2026-09/data/ el 2026-09-08).
                        cahe-prov.js es un resto de la V6 y ya no lo carga nadie.
                        Solo los lee index.html.
css/styles.css          Sistema visual: cal + azul de Prusia + cobre,
                        bordes cuadrados. Ver "Paleta" mas abajo.
css/provenance.css      Componente "Como trabajamos" (procedencia por celda).
                        Usa los mismos tokens con valor de reserva.
img/                    Logo, favicon.
img/icons/              Iconos ic-*.png/svg heredados de v1 (indicadores y
                        análisis globales) + subcarpetas propias.
img/team/               Fotos del equipo, iconos de enlaces y logos de
                        financiadores heredados de v1.
js/
  app.js                Controlador + render del panel unificado.
  state.js              Estado central (sección, categoría, año, filtros).
  data-loader.js        Carga JSON desde data/.
  views.js              Render primitivos (mapa, trend, ranking, composición,
                        global, tabla, método).
data/
  metadata.json
  national/<slug>.json
  provincial/<slug>.json
  global/global.json                     Series globales del panel.
  global/web_todos_long_csv.csv          CSV heredado de v1 (data_raw).
  global/web_todos_analysis_csv.csv      CSV heredado de v1 (data_raw).
  geo/spain-provinces.geojson
  downloads/FinalDB_1860_2021.csv
  downloads/docs/                        24 xlsx/pdf/docx de datos y
                                         metodología, heredados de v1.
assets/audio/perspectives/{es,en}/       MP3 64 kbps mono + JSON de tiempos.
                        Los WAV maestros siguen aquí pero están en .gitignore.
build/generate_data.py  Genera data/ a partir de los CSV de data_raw. Rescatado
                        de web_cahe_v2 el 2026-09-05. La ruta de los CSV se
                        resuelve con la variable de entorno CAHE_DATA_RAW o, si
                        no está, buscando 05_projects/spain/divulgacion/
                        web_graficas/data_raw y luego
                        ../web_cahe/web_graficas/data_raw.
```

## Servir localmente

Todas las rutas son relativas a esta carpeta, así que se puede servir desde
donde se quiera. Lo habitual en este repo es servir `06_dev` entero:

```powershell
cd C:\Users\jinfa\OneDrive\06_dev
python -m http.server 8790
```

Abrir: `http://127.0.0.1:8790/visores/web_cahe_v3/index.html`

También funciona sirviendo solo `web_cahe_v3/`.

## Diferencias frente a v1 / v2

| Aspecto                | v1 (site/)            | v2 (atlas modular)     | v3 (este)                 |
|------------------------|-----------------------|------------------------|---------------------------|
| Entrada                | índice + 15 botones   | rail con iniciales     | Portada "La costa pintada"|
| Visualización          | iframe autocontenido  | una vista por click    | Panel unificado 4 vistas  |
| Filtros                | dentro del iframe     | sidebar separado       | barra superior compartida |
| Mapa y serie           | páginas separadas     | tabs                   | lado a lado               |
| Comparativa global     | otro botón            | otra categoría         | sección propia            |
| Paleta                 | OWID-ish              | sobria                 | cal + Prusia + cobre      |
| Forma                  | bordes redondeados    | bordes redondeados     | todo cuadrado             |

## Entrada

**La entrada es `index.html`, que es la portada. La aplicación es
`explorer.html`.** Quien abre el visor ve la portada; quien pulsa cualquiera de
sus enlaces aterriza dentro de la aplicación, en la sección que pedía el ancla.
No hay ninguna pantalla de bienvenida intermedia y no debe volver a haberla.

`index.html` es la **portada V7** (2026-09-08, noche), escrita a mano tras la revisión de
Juan de las V6 («me estás poniendo un visor ya en la portada; lo que quiero es algo
estéticamente chulo»). Es un único fichero autocontenido: su CSS y su JS van en línea, y lo
único que carga de fuera son las fuentes de Google (Fraunces, Geist, Geist Mono), D3 v7 y
topojson-client v3 por CDN, y los tres kits de `portada/`. **No depende de `css/styles.css`
ni de `js/`**: tocar el cromo del visor no la cambia, y al revés. Las V5 y V6 quedan en
`C:/Work/scratch/checkpoint/visores_2026-09/web_cahe_v3_backup/index.html.20260908.bak` y
`index.html.20260908-v6.bak`.

Sus seis enlaces, y a dónde llevan:

| enlace de la portada  | destino                    | lo que sale                       |
|-----------------------|----------------------------|-----------------------------------|
| Entrar al visor       | `explorer.html#macro`      | Indicadores macro → Energía, serie 1860-2020 dibujada |
| Perspectivas          | `explorer.html#perspectivas` | listado de entradas con audio   |
| Publicaciones         | `explorer.html#publicaciones` | 40 publicaciones filtrables    |
| Datos y metodología   | `explorer.html#datos`      | series y descargas                |
| Acerca                | `explorer.html#acerca`      | La CAHE                          |
| Novedades             | `explorer.html#novedades`  | La CAHE con el bloque Novedades abierto |

El botón grande apunta a `#macro`, **no** a `#visualizacion`: `#visualizacion`
abre el índice de grupos ("Visor de datos", cuatro tarjetas), que es una
pantalla de navegación sin ninguna figura dentro, y la regla de Juan es que la
portada lleve siempre a una figura. El índice de grupos sigue existiendo y se
llega a él desde "Visualización" en la cabecera de la aplicación. Los anclas
que reconoce el router estan en `applyHashRoute()` de `js/app.js`: secciones
(`datos`, `perspectivas`, `publicaciones`, `acerca`, `novedades`), los dos
alias heredados (`metodos` → `datos` con el bloque desplegado, `equipo` →
`acerca`), grupos (`global`, `macro`, `sectorial`, `commodities`) e
indicadores sueltos (`energia`, `emisiones`, `bosques`, `tendencias`…).

**Idioma.** La portada tiene su propio conmutador EN/ES arriba a la derecha.
Todo nodo traducible lleva su inglés en `data-en` y conserva el español como
texto escrito, así que la página es correcta con JavaScript apagado. La
elección se guarda en `localStorage.cahe_lang`, la misma clave que lee
`explorer.html`, de modo que cruza a la aplicación. El texto que dibuja el
lienzo (unidad del eje, pista de abajo, fichas de provincia, rótulo de
Canarias) no puede llevar `data-en`: vive en el diccionario `STR` del script de
la portada y se repinta cuando el conmutador emite el evento `cahe:lang`.

**Lo que dibuja la portada** (V7, 2026-09-08). Una sola escena en un canvas, sin
paneles, sin leyendas ni contadores:

1. La curva de **emisiones totales de GEI de España, 1860-2023** (`CAHE.series['emisiones-gei']`,
   Mt CO₂e) sube despacio (≈ 5,7 s) en cobre luminoso sobre azul de Prusia, con el año
   corriendo en el rótulo de abajo a la izquierda (`#yr`).
2. Al llegar a 2023 la línea se **convierte en el contorno de la península** (`SPAIN.peninsula`,
   un solo anillo remuestreado a 420 puntos; nada de provincias, así no hay huecos). El anillo
   empieza en Tarifa y recorre el país en el sentido de las agujas del reloj, para que el pico
   de la curva caiga cerca de Cap de Creus y el arranque plano suba por la raya de Portugal.
3. El contorno se **eleva a un globo**: proyección ortográfica de D3 en Canvas 2D (sin WebGL),
   tierras de `portada/world-110m.js` en cardenillo apagado, España (`SPAIN.outline`, con
   Baleares y Canarias) en cobre, atmósfera y sombra suaves, graticulado tenue. El radio inicial
   es el que hace coincidir España con el contorno plano (`S_BIG`) y baja en escala logarítmica
   hasta `R_FIN` (0,40·min(W,H); 0,42 en móvil). La curva queda como una estela fina al fondo.
4. El globo **gira para siempre** (2,6°/s). Arrastrar lo gira (horizontal en táctil, ambos ejes
   con ratón), al soltar sigue con la inercia del gesto y vuelve a la velocidad base. Botón
   pausa/reproduce de 44 px; espacio pausa; Esc salta la intro; ← → giran 8°.
5. `prefers-reduced-motion`: estado final estático (globo con España de frente, sin giro);
   el botón permite arrancar el giro.

Chrome de la escena: rótulo de una línea («Emisiones totales de GEI · España 1860-2023 ·
Mt CO₂e», en dos líneas en móvil), el año, el botón pausa y una pista «Arrastra para girar el
globo» que se apaga sola. Intro completa: 9,85 s. Sonda `window.__probe()` y
`window.__portada.finish()` para la verificación automática.

**Lo que se quitó el 2026-09-06** (portada vieja: globo 3D + franjas
climáticas, que abría `explorer.html` dentro de un `<iframe>`):

- el `index.html` anterior entero (marcado, i18n de portada, franjas, iframe);
- `js/globe.js` (lo pedía solo aquel index);
- en `css/styles.css`, el bloque `PORTADA` completo (`.portada*`,
  `.hero-*`, `.stripes-*`, `.globe-container`, `#globe-canvas`,
  `.viewer-frame`, `body.home-page`) y sus tres bloques `@media`.

`explorer.html` pide hoy `css/provenance.css?v=20260908b`,
`css/styles.css?v=20260908b` y `js/app.js?v=20260908b`; `app.js` importa
`methods/como-trabajamos.js?v=20260906k` y este `methods/provenance-panel.js?v=20260906k`.
Al editar cualquiera de esos ficheros hay que subir el `?v=` en quien lo pide.

Respaldo del estado anterior en
`C:/Work/scratch/checkpoint/visores_2026-09/puerta/web_cahe_v3/` y en
`C:/Work/scratch/checkpoint/visores_2026-09/integracion/web_cahe_v3/<sello>/`
(este último con su `deshacer.ps1`).

`goHome()` de `js/app.js` ya no encuentra un iframe padre, así que el logo y el
botón de portada de la aplicación navegan a `index.html`: vuelven a la portada
nueva. El código de `postMessage("cahe-back")` queda ahí sin efecto.

### Cambiar de portada

Las candidatas viven en `07_temp/portadas_visores_2026-09/cahe/`. Para poner
otra, `integrar_portada.py cahe --portada V6_loquesea.html` (ensayo) y luego
`--apply`. Reescribe los enlaces `../../../06_dev/visores/web_cahe_v3/...` a
rutas relativas, copia sus kits a `portada/` y añade el `noindex`. Lo que **no**
hace es apuntar el botón grande a una figura: eso se corrige a mano después,
como aquí (`#visualizacion` → `#macro`).

## Secciones del explorador

La barra de `explorer.html` tiene **cinco** botones. Eran siete hasta el
2026-09-06: «Cómo trabajamos» y «Equipo» eran secciones hermanas y ahora viven
dentro de la sección a la que pertenecen.

| barra                 | `data-section` | contenido |
|-----------------------|----------------|-----------|
| Visualización         | `visualizacion`| panel unificado; `#visualizacion` es el índice de grupos |
| Datos y metodología   | `datos`        | **1.** bloque plegable «Cómo trabajamos» (arriba del todo) · **2.** «Series y descargas» |
| Perspectivas          | `perspectivas` | entradas de blog con audio |
| Publicaciones         | `publicaciones`| listado filtrable |
| Acerca                | `acerca`       | **1.** «Equipo CAHE» (arriba del todo) · **2.** acordeón La CAHE / Novedades / Financiación |

**«Cómo trabajamos» dentro de «Datos y metodología».** Es la letra pequeña de
todo lo que se descarga debajo, así que encabeza la página, plegada, y se abre
al pincharla (`#metodos-toggle` → `#metodos-body`, estado en
`state.metodosOpen`). El módulo `js/methods/como-trabajamos.js` se importa en
diferido **la primera vez que se abre el bloque**, no al entrar en la sección:
el JSON de procedencia pesa cientos de KB. El ancla `#metodos` sigue
funcionando y llega con el bloque ya desplegado.

Dentro, la sección se maqueta a **dos columnas** en pantallas de 1000 px o más
(`.pv-intro` en `css/provenance.css`): prosa a la izquierda, cifras y «Límites»
a la derecha. Antes la prosa era una columna de 473 px que bajaba 886 px por la
izquierda con 595 px de pantalla vacía a su derecha; medido a 1440 px, ese
hueco es ahora 0. El `<h2>` interno del módulo se oculta porque el título ya lo
pone el bloque plegable.

El texto de esa sección describe un **procedimiento**, no una cronología:
reunir varias fuentes, compararlas entre sí, revisar su fiabilidad y solo
entonces rellenar huecos; y lo publicado identifica, celda a celda, el origen
del valor y el método de estimación. Las cuatro series del final van rotuladas
como lo que son —**un ejemplo, y las cuatro de cultivos**— y cada panel lleva
escrito qué dificultad enseña. Si se reescribe, mantener ese orden y esas
cifras ({full_rows}, {full_pct}, {pct}, {celdas} se rellenan solas desde
`data/provenance/index.json`).

**«Equipo» dentro de «Acerca».** `teamBlockMarkup()` va justo debajo de la
cabecera de la página y por encima del acordeón, en los dos idiomas. El ancla
`#equipo` lleva a `#acerca`. Ya no existe `renderEquipo()`.

## Regenerar `data/`

Ya no se sincroniza desde v2: el generador vive aquí.

```powershell
$env:CAHE_DATA_RAW = "<carpeta con los CSV data_raw>"
python build\generate_data.py
```

`build/sync_from_v2.py` queda obsoleto (pendiente de borrado por el autor).

## Reglas para agentes

- **La entrada es la portada, y la portada lleva a figuras.** No devolver una
  pantalla de bienvenida a `explorer.html`, ni hacer que un enlace de la portada
  caiga en un índice de tarjetas. Ver "Entrada".
- **No tocar** `../web_cahe/` (v1) ni `../web_cahe_v2/`: son archivo histórico y
  este visor ya no depende de ellos. No volver a introducir rutas `../web_cahe`.
- **No editar `data/` a mano** — regenerar con `build/generate_data.py`.
- **Los ejes de un gráfico no se mueven al filtrar lo que se enseña.** En
  `js/methods/provenance-panel.js` los dominios X e Y salen de `points` entero
  y no del subconjunto que deja a la vista el interruptor «ver solo los años
  observados»: si se recalculan sobre lo filtrado, las dos versiones quedan a
  escalas distintas y el interruptor pierde su único sentido. El mismo
  componente, con el fallo todavía dentro, está instalado en `web_andalusia`,
  `web_latam`, `web_minerva_v2` y `web_workers`, y sale de
  `tools/install_methods_kit.py`.
- El audio que sirve la web son los MP3. Los WAV maestros no se publican
  (`.gitignore`); si se regenera audio, volver a convertir con
  `ffmpeg -i <wav> -ac 1 -ar 24000 -codec:a libmp3lame -b:a 64k <mp3>`.
- App estática, sin frameworks ni bundler. ES6 modules + D3 por CDN.
- Idioma de interfaz: español.
- Bordes cuadrados (border-radius:0). Ver la seccion "Paleta" para el detalle
  de tokens y de las cuatro excepciones de esquina redonda.

## Paleta

**Regla (V7, 2026-09-08): la paleta del interior es la de la portada.** Al pulsar
«Entrar al visor» no se cambia de mundo. La portada es azul de Prusia · cal · cobre ·
cardenillo, y desde el 8 de septiembre el **cromo** del explorador va en esos mismos tokens:
cabecera, barra lateral (incluido el conmutador de grupos, antes un bloque de cal) y línea
temporal en Prusia con texto cal y acentos cobre (`--chrome`, `--chrome-2`, `--chrome-3`,
`--chrome-hover`, `--chrome-text`, `--chrome-mute`, `--chrome-rule` en `:root`). El estado
activo de la barra lateral es fondo `--chrome` con filete izquierdo `--warm-hi`; el botón de
reproducir, la selección y el deslizador de la línea temporal son cobre. Los **lienzos de
gráfica siguen en papel claro** (papel sobre mar, como permite el brief): la cal de la portada
(`--cal #EFE8D8`) sigue siendo el fondo de la aplicación y el azul de Prusia la tinta.

Rampas de mapa (`mapPalette` en `renderMap` de `js/app.js`): cal → cardenillo → sombra, siete
tonos separables (`#F3EDDD … #1B4A44`); «sin dato» es una trama de puntos (`<pattern
id="cahe-nodata">`, mismo canal que en los demás visores desde el 7-IX) y la leyenda repite la
muestra. En las comparativas globales España va en cobre (`COLOR_SPAIN #9a4e1d`) y el Mundo en
cardenillo (`COLOR_WORLD #33735e`), como en el globo de la portada. Las miniaturas de
Perspectivas usan los mismos dos tonos. Backups previos en
`C:/Work/scratch/checkpoint/visores_2026-09/web_cahe_v3_backup/*.20260908-v7.bak`.

Tokens de cromo en `css/styles.css` (`:root`):

| token           | valor     | de la portada        | donde se ve                        |
|-----------------|-----------|----------------------|------------------------------------|
| `--paper`       | `#f1ebdd` | `--cal`              | fondo de la aplicacion             |
| `--paper-2`     | `#e7dfcc` | `--cal2`             | barra de filtros, linea temporal   |
| `--paper-3`     | `#dbd1ba` | —                    | pistas y fondos hundidos           |
| `--white`       | `#fbf9f3` | cal casi blanca      | superficie de ficha y de panel     |
| `--ink`         | `#0a1b2c` | `--prusia`           | texto, cabecera oscura, tooltip    |
| `--ink-soft`    | `#3a536b` | `--prusia3` aclarado | prosa secundaria                   |
| `--ink-mute`    | `#4d6274` | `SLATE` oscurecido   | etiquetas y metadatos              |
| `--rule`        | `#dcd3c0` | `--hair`             | filetes                            |
| `--rule-strong` | `#bfb49c` | `--hair2`            | bordes de control                  |
| `--warm`        | `#9a4e1d` | `--cobre` oscurecido | acento sobre fondo claro           |
| `--warm-soft`   | `#c4753c` | `--cobre`            | barras y filetes de acento         |
| `--warm-hi`     | `#e39a5b` | `--cobre-hi`         | acento **sobre** Prusia            |
| `--accent`      | `#4f9c82` | `--verd`             | cardenillo: linea temporal, global |
| `--accent-hi`   | `#8fcbb0` | `--verd-hi`          | cardenillo **sobre** Prusia        |
| `--accent-dark` | `#33735e` | —                    | cardenillo apagado                 |

Barra lateral y superficies oscuras: `#13314a` (base), `#0e2438` (bloques
hijos), `#1c4364` (hover), `#24537c` (activo).

**Lo que NO es cromo y no se toca.** `--olive`, `--forest`, `--gold`,
`--commod` y `--sky` son colores de *categoria*: acompanan a las escalas de
datos, que viven en `js/app.js` y `js/views.js` (`colorMap`, `FALLBACK_PALETTE`,
las rampas del mapa) y se eligieron por lectura y accesibilidad. Cambiarlos
rompe la lectura. Para los tres sitios en que uno de ellos hacia de *texto*
sobre cal y no llegaba a 4.5:1 existen `--gold-ink` y `--olive-ink`, que son el
mismo tono oscurecido; el color de categoria se queda como esta.

**Esquinas.** `border-radius:0` en todo, incluidas las pildoras de 999px. Las
cuatro unicas excepciones estan declaradas en un comentario al final de
`css/styles.css`: los dos retratos circulares del equipo y las dos asas de
arrastre de la linea temporal en tactil.

**Tipografía.** Desde la V7 el interior usa la misma voz que la portada: `--ff-serif`
= Fraunces, `--ff-sans` = Geist, `--ff-mono` = Geist Mono (hoja de Google Fonts en
`explorer.html`). `Cormorant Garamond` se mantiene solo para la prosa de «Acerca»
(`.acerca-page .prose`), que la pide por nombre. DM Serif Display, Source Sans 3 e Inter ya
no se cargan.

## Protocolo Perspectivas

Para nuevas entradas de `Perspectivas`, seguir
`docs/PERSPECTIVAS_BLOG_AUDIO_PROTOCOL.md`. El flujo canonico es
`blog-science` para texto y `debate-audio` para audio/podcast.
