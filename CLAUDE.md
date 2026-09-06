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
index.html              PORTADA Y PUERTA DE ENTRADA. Es la portada aprobada
                        "La costa pintada" (V5), autocontenida: lleva dentro su
                        propio <style> y su propio <script>, no usa css/styles.css
                        ni js/. Ver "Entrada" mas abajo.
explorer.html           LA APLICACIÓN (panel unificado). Se entra desde la
                        portada con un ancla: explorer.html#<seccion>.
portada/                Kits de datos que dibuja la portada (spain.js, cahe.js).
                        Copiados desde 07_temp/portadas_visores_2026-09/data/
                        por tools/integrar_portada.py. Solo los lee index.html.
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

`index.html` es la portada aprobada `V5_costa-pintada.html` ("La costa
pintada"), integrada el 2026-09-06 con
`06_dev/docs/visores_2026-09/tools/integrar_portada.py cahe --apply`. Es un
único fichero autocontenido: su CSS y su JS van en línea, y lo único que carga
de fuera son las dos fuentes de Google y los dos kits de `portada/`. **No
depende de `css/styles.css` ni de `js/`**: tocar el cromo del visor no la
cambia, y al revés.

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
(`datos`, `metodos`, `perspectivas`, `publicaciones`, `equipo`, `acerca`,
`novedades`), grupos (`global`, `macro`, `sectorial`, `commodities`) e
indicadores sueltos (`energia`, `emisiones`, `bosques`, `tendencias`…).

**Idioma.** La portada es solo en español y no toca el idioma. El conmutador
ES/EN vive en la cabecera de `explorer.html` y guarda la elección en
`localStorage.cahe_lang`; sigue funcionando igual que antes.

**Lo que se quitó el 2026-09-06** (portada vieja: globo 3D + franjas
climáticas, que abría `explorer.html` dentro de un `<iframe>`):

- el `index.html` anterior entero (marcado, i18n de portada, franjas, iframe);
- `js/globe.js` (lo pedía solo aquel index);
- en `css/styles.css`, el bloque `PORTADA` completo (`.portada*`,
  `.hero-*`, `.stripes-*`, `.globe-container`, `#globe-canvas`,
  `.viewer-frame`, `body.home-page`) y sus tres bloques `@media`.
  Por eso `explorer.html` pide `css/styles.css?v=20260906i`.

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
- El audio que sirve la web son los MP3. Los WAV maestros no se publican
  (`.gitignore`); si se regenera audio, volver a convertir con
  `ffmpeg -i <wav> -ac 1 -ar 24000 -codec:a libmp3lame -b:a 64k <mp3>`.
- App estática, sin frameworks ni bundler. ES6 modules + D3 por CDN.
- Idioma de interfaz: español.
- Bordes cuadrados (border-radius:0). Ver la seccion "Paleta" para el detalle
  de tokens y de las cuatro excepciones de esquina redonda.

## Paleta

**El visor sigue la portada aprobada `V5_costa-pintada.html`**
(`07_temp/portadas_visores_2026-09/cahe/V5_costa-pintada.html`, "La costa
pintada": azul de Prusia, cobre y cardenillo). Aplicada al cromo el 2026-09-06.

La portada es de fondo oscuro y el visor de fondo claro: se traslada el
*pigmento*, no la inversion. La cal de la portada (`--cal #EFE8D8`) pasa a ser
el fondo del visor, y el azul de Prusia pasa a ser la tinta y la barra lateral.

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

**Tipografia.** Sin cambios: `DM Serif Display` + `Source Sans 3` desde la hoja
de Google Fonts que ya pedia el visor. La portada usa Fraunces/Geist, pero aqui
la instruccion fue "paleta y esquinas, nada mas", asi que la voz tipografica se
dejo intacta.

## Protocolo Perspectivas

Para nuevas entradas de `Perspectivas`, seguir
`docs/PERSPECTIVAS_BLOG_AUDIO_PROTOCOL.md`. El flujo canonico es
`blog-science` para texto y `debate-audio` para audio/podcast.
