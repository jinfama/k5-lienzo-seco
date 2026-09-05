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
index.html              Portada con cuadro castellano animado (3 paletas).
explorer.html           Aplicación principal (panel unificado).
css/styles.css          Sistema visual: papel crema + acento terracota,
                        bordes cuadrados, paleta CAHE.
img/                    Logo, favicon. Si pones img/portada.jpg se usa como
                        cuadro de fondo en lugar del SVG procedural.
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
| Entrada                | índice + 15 botones   | rail con iniciales     | Portada cuadro animado    |
| Visualización          | iframe autocontenido  | una vista por click    | Panel unificado 4 vistas  |
| Filtros                | dentro del iframe     | sidebar separado       | barra superior compartida |
| Mapa y serie           | páginas separadas     | tabs                   | lado a lado               |
| Comparativa global     | otro botón            | otra categoría         | sección propia            |
| Paleta                 | OWID-ish              | sobria                 | crema + terracota         |
| Forma                  | bordes redondeados    | bordes redondeados     | todo cuadrado             |

## Cambiar el cuadro de la portada

Por defecto la portada compone un paisaje castellano procedural (SVG con cielo,
sierras, llanura, olivos, pájaros y motas de polvo animados). El selector
"Portada" arriba a la derecha cambia entre **Castilla** (dorado), **Olivar**
(verde oliva) y **Costa** (azul-rosa).

Para usar un cuadro real:

1. Mete una imagen en `img/portada.jpg`.
2. La portada la detecta y la usa como fondo en lugar del SVG procedural.
3. Las animaciones (rayos de luz que siguen el cursor, motas de polvo) siguen
   funcionando encima.

## Regenerar `data/`

Ya no se sincroniza desde v2: el generador vive aquí.

```powershell
$env:CAHE_DATA_RAW = "<carpeta con los CSV data_raw>"
python build\generate_data.py
```

`build/sync_from_v2.py` queda obsoleto (pendiente de borrado por el autor).

## Reglas para agentes

- **No tocar** `../web_cahe/` (v1) ni `../web_cahe_v2/`: son archivo histórico y
  este visor ya no depende de ellos. No volver a introducir rutas `../web_cahe`.
- **No editar `data/` a mano** — regenerar con `build/generate_data.py`.
- El audio que sirve la web son los MP3. Los WAV maestros no se publican
  (`.gitignore`); si se regenera audio, volver a convertir con
  `ffmpeg -i <wav> -ac 1 -ar 24000 -codec:a libmp3lame -b:a 64k <mp3>`.
- App estática, sin frameworks ni bundler. ES6 modules + D3 por CDN.
- Idioma de interfaz: español.
- Bordes cuadrados (border-radius:0). Paleta crema/terracota/oliva.

## Protocolo Perspectivas

Para nuevas entradas de `Perspectivas`, seguir
`docs/PERSPECTIVAS_BLOG_AUDIO_PROTOCOL.md`. El flujo canonico es
`blog-science` para texto y `debate-audio` para audio/podcast.
