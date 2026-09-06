/* como-trabajamos.js — CAHE's methods section: which numbers were counted and which we built.

   Same component and same data contract as the Atlas de Andalucía, but CAHE ships in Spanish
   and English, so the prose comes in both and the section is rendered with the current language.

   Figures in {curly braces} are filled from data/provenance/index.json at render time, so the
   text can be rewritten without the numbers going stale.

   2026-09-06. Tres cosas cambian respecto al borrador anterior, las tres pedidas por Juan:
     1. El texto ya no abre con una cronología («las series arrancan en 1860») sino con el
        PROCEDIMIENTO y en su orden: reunir varias fuentes, compararlas entre sí, revisar su
        fiabilidad y solo entonces rellenar huecos; y lo publicado identifica, celda a celda,
        el origen y el método de estimación.
     2. Las cuatro series de ejemplo van rotuladas como lo que son —un ejemplo de CULTIVOS— y
        cada una lleva escrito qué dificultad enseña.
     3. La sección se maqueta a dos columnas: la prosa dejaba vacía la mitad derecha de la
        pantalla mientras bajaba novecientos píxeles por la izquierda.
*/

import ProvenancePanel from './provenance-panel.js?v=20260906k';

/* The whole agricultural dataset, not just the four series on screen. From
   05_projects/spain/datasets/agriculture/data/final/_provenance_summary.json (pipeline 2026-06-30):
   1.736.145 filas, 110.831 observadas (6,4 %), 1.595.329 estimadas, 0 estimadas sin método. */
const FULL = { rows: 1736145, observed: 110831, pct: 6.4, no_method: 0 };

const N = (v, lang) => new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'es-ES').format(v);
const PCT = (v, lang) => new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'es-ES',
    { maximumFractionDigits: 1 }).format(v);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const PROSE = {
  es: `
<p>Una serie de siglo y medio no sale de una fuente: sale de varias, y el trabajo consiste en
ponerlas de acuerdo. El procedimiento tiene un orden y el orden importa. Primero se
<b>reúnen todas las fuentes</b> que miden el mismo indicador —anuarios estadísticos, censos
agrarios, inventarios forestales, registros administrativos y reconstrucciones publicadas por
otros equipos—.</p>

<p>Después se <b>comparan entre sí</b> en los años en que se solapan. Ahí, y no en el promedio,
se ve si dos fuentes miden de verdad lo mismo o si una cambió de definición a mitad de camino.
De esa comparación sale una <b>revisión de fiabilidad</b>: cada fuente recibe un juicio explícito
—qué cubre, con qué criterio, cuánto se separa de las demás— y ese juicio decide cuál manda
cuando dos se contradicen.</p>

<p>Solo entonces se <b>rellenan los huecos</b> que no cubrió ninguna. Rellenar antes de comparar
es la manera más rápida de dar por bueno un salto que en realidad era un cambio de criterio, y
por eso el relleno va al final y nunca al principio.</p>

<p>Y lo que se publica no esconde ese trabajo: la base sale con <b>procedencia celda a
celda</b>. Cada valor dice si es <b>observado</b> —y en qué fuente— o <b>estimado</b> —y con qué
método—, de modo que cualquiera puede separar lo contado de lo construido sin tener que fiarse
de nuestra palabra.</p>

<p>Conviene decir la cifra incómoda. En el conjunto de la base agraria —{full_rows} celdas de
cultivo, año, provincia e indicador— solo el <b>{full_pct}%</b> es dato observado en una fuente;
el resto está construido por nosotros. Ninguna de esas estimaciones queda sin método declarado:
son {full_nomethod} las filas estimadas sin decir cómo.</p>

<p>Esa cifra global engaña si se lee sola. <b>El detalle provincial es lo que tira del porcentaje
hacia abajo</b>: durante largos tramos del siglo XIX y del XX solo se publicaba el total
nacional, y el reparto entre provincias es reconstrucción nuestra escalada desde ese total. Las
series nacionales están mucho mejor sostenidas: <b>{pct}% de sus {celdas} celdas son observación
directa</b>.</p>

<p>Los métodos de relleno son deliberadamente pocos y explícitos: <b>interpolación lineal</b>
entre dos observaciones, <b>proxy de crecimiento</b> cuando existe una serie relacionada que sí
está medida, <b>arrastre</b> del último valor conocido en tramos cortos, <b>reparto desde un año
de referencia</b> para bajar de nacional a provincial y <b>derivación</b> cuando un indicador
sale de otros dos (el rendimiento es producción dividida entre superficie: no se observa nunca,
se calcula siempre). Cada celda guarda cuál de ellos se le aplicó.</p>
`,
  en: `
<p>A series a century and a half long does not come from one source: it comes from several, and
the work is to make them agree. The procedure has an order, and the order matters. First we
<b>gather every source</b> that measures the same indicator — statistical yearbooks, agricultural
censuses, forest inventories, administrative registers and reconstructions published by other
teams.</p>

<p>Then we <b>compare them against each other</b> over the years where they overlap. That, not
the average, is where you see whether two sources really measure the same thing or whether one of
them changed its definition halfway through. Out of that comparison comes a <b>reliability
review</b>: every source gets an explicit judgement — what it covers, on what criterion, how far
it departs from the others — and that judgement decides which one wins when two disagree.</p>

<p>Only then do we <b>fill the gaps</b> that no source covered. Filling before comparing is the
quickest way to accept a jump that was really a change of criterion, which is why filling comes
last and never first.</p>

<p>And what gets published does not hide that work: the database ships with <b>cell-level
provenance</b>. Every value states whether it is <b>observed</b> — and in which source — or
<b>estimated</b> — and by which method — so that anyone can separate what was counted from what
was built without taking our word for it.</p>

<p>The uncomfortable figure, plainly. Across the whole agricultural database — {full_rows} cells
of crop, year, province and indicator — only <b>{full_pct}%</b> are observed in a source; the rest
we built. None of those estimates is left without a declared method: {full_nomethod} estimated
rows fail to say how they were produced.</p>

<p>Read on its own that headline misleads. <b>The provincial detail is what drags the share
down</b>: for long stretches of the nineteenth and twentieth centuries only the national total was
published, and the split across provinces is our own reconstruction, scaled down from that total.
The national series rest on much firmer ground: <b>{pct}% of their {celdas} cells are direct
observations</b>.</p>

<p>The filling methods are deliberately few and explicit: <b>linear interpolation</b> between two
observations, a <b>growth proxy</b> where a related series was actually measured, <b>carrying</b>
the last known value across short gaps, <b>distribution from a benchmark year</b> to go from
national to provincial, and <b>derivation</b> where one indicator comes out of two others (yield
is production divided by area: it is never observed, always computed). Every cell records which
one was applied to it.</p>
`,
};

/* El campo territory del fichero de procedencia viene sin eñe. Aquí se corrige lo que se
   enseña en pantalla, no el dato. */
const DISPLAY = { Vinedo: 'Viñedo' };

/* Lo que enseña cada una de las cuatro series del ejemplo. Todo lo que se afirma aquí sale de
   data/provenance/superficie_cultivo_nacional__<serie>.json: años observados, métodos y huecos. */
const SERIES_NOTE = {
  es: {
    Vinedo: 'El techo de cobertura. La estadística agraria persigue el viñedo año a año desde 1891, así que de ahí en adelante casi todo es observación. Lo estimado se concentra en el arranque, 1860-1890, resuelto por interpolación entre censos muy separados.',
    Trigo: 'El cultivo con más fuentes y más discrepancias entre ellas. Observado desde 1901; las cuatro décadas anteriores están estimadas, casi todas por interpolación. Y tres años —1936, 1937 y 1938— se quedan en hueco: la guerra interrumpió la estadística y aquí no se inventa lo que no se midió.',
    Olivar: 'El caso del agujero en medio. Observado desde 1891, pero entre 1962 y 1980 la fuente desaparece y ese tramo de diecinueve años es interpolación lineal: justo donde la interpolación no puede ver una crisis si la hubo.',
    Girasol: 'El caso del cero que no es hueco. No hay cultivo relevante hasta los años cuarenta —el primer dato observado es de 1941—, así que los años anteriores valen cero estructural, ausencia de cultivo, no ausencia de dato. Confundir las dos cosas es la forma más común de inventar una tendencia.',
  },
  en: {
    Vinedo: 'The coverage ceiling. Spanish agricultural statistics track the vineyard year by year from 1891, so from there on almost everything is observed. The estimates sit at the start, 1860-1890, filled by interpolation between widely spaced censuses.',
    Trigo: 'The crop with the most sources and the most disagreement between them. Observed from 1901; the four preceding decades are estimated, mostly by interpolation. And three years — 1936, 1937 and 1938 — stay empty: the civil war interrupted the statistics and we do not invent what was not measured.',
    Olivar: 'The hole in the middle. Observed from 1891, but between 1962 and 1980 the source disappears and that nineteen-year stretch is linear interpolation: precisely where interpolation cannot see a crisis if there was one.',
    Girasol: 'The zero that is not a gap. There is no significant crop until the 1940s — the first observed figure is 1941 — so the earlier years are a structural zero, absence of crop rather than absence of data. Confusing the two is the commonest way to invent a trend.',
  },
};

const T = {
  es: {
    title: 'Cómo trabajamos',
    seriesTitle: 'Ejemplo: cuatro series de cultivos',
    seriesLede: `
      <p>Las cuatro series de abajo son <b>un ejemplo, y las cuatro son de cultivos</b>: la
      superficie nacional de viñedo, trigo, olivar y girasol. CAHE cubre además energía,
      materiales, emisiones, bosques y usos del suelo con la misma disciplina de procedencia; se
      enseñan estas cuatro porque son las que ya tienen la comprobación hecha celda a celda y
      porque entre ellas cubren los cuatro problemas que reaparecen en todas las demás: cobertura
      alta, fuentes que se contradicen, un agujero en medio de la serie y un cero que no es
      hueco.</p>
      <p>Los gráficos no suavizan la diferencia: <b>punto sólido</b> donde hay dato observado,
      <b>trazo discontinuo</b> —un color por método— donde hay estimación y <b>hueco</b>, nunca
      una recta, donde no hay ninguna de las dos cosas. Pase el ratón o toque cualquier año para
      ver de dónde sale. El interruptor «ver solo los años observados» deja a la vista el
      esqueleto documental desnudo <b>sin mover los ejes</b>, que es lo que permite comparar las
      dos versiones.</p>`,
    coverageTitle: 'Cobertura del conjunto',
    limitsTitle: 'Límites que conviene tener presentes',
    sourcesTitle: 'De dónde salen los valores observados',
    cells: 'celdas de cultivo × año',
    observed: 'dato observado',
    estimated: 'estimados',
    nodata: 'sin dato',
    cellsUnit: 'celdas',
    loading: 'Cargando la procedencia de las series…',
    failed: 'No se pudo cargar la procedencia de las series',
    limits: [
      'La <b>interpolación lineal no ve las crisis</b>. Una plaga, una sequía o el desplome de un cultivo entre dos observaciones desaparece de la serie: la línea sube o baja suavemente donde hubo un salto.',
      'El <b>rendimiento nunca es dato observado</b>: se calcula dividiendo producción entre superficie. Si cualquiera de las dos está estimada, el rendimiento hereda esa incertidumbre multiplicada, y en los cultivos marginales produce valores que el control de calidad marca como implausibles.',
      'El <b>reparto por provincias</b> desde un total nacional supone que la distribución de un año de referencia vale para los años vecinos. Es razonable a corto plazo y cada vez peor cuanto más se aleja del año de referencia.',
      'Un <b>cero estructural</b> (el cultivo aún no existía) y un <b>hueco</b> (existía pero no se midió) son cosas distintas y aquí se distinguen. Confundirlos es la forma más común de inventar una tendencia.',
      'La <b>fiabilidad declarada</b> es del valor, no de la fuente: un anuario mal levantado sigue siendo dato observado. Marcar algo como observado dice de dónde viene, no que sea correcto.',
    ],
  },
  en: {
    title: 'How we work',
    seriesTitle: 'Example: four crop series',
    seriesLede: `
      <p>The four series below are <b>an example, and all four are crops</b>: the national area
      under vineyard, wheat, olive and sunflower. CAHE also covers energy, materials, emissions,
      forests and land use with the same provenance discipline; these four are shown because they
      are the ones already checked cell by cell, and because between them they cover the four
      problems that reappear in all the others: high coverage, sources that contradict each other,
      a hole in the middle of a series, and a zero that is not a gap.</p>
      <p>The charts do not smooth the difference away: a <b>solid dot</b> where the figure was
      observed, a <b>dashed stroke</b> — one colour per method — where it was estimated, and a
      <b>gap</b>, never a straight line, where there is neither. Hover or tap any year to see where
      it came from. The "observed years only" switch strips the series back to its documentary
      skeleton <b>without moving the axes</b>, which is what makes the two versions comparable.</p>`,
    coverageTitle: 'Coverage of the whole set',
    limitsTitle: 'Limits worth keeping in mind',
    sourcesTitle: 'Where the observed values come from',
    cells: 'crop × year cells',
    observed: 'observed',
    estimated: 'estimated',
    nodata: 'no data',
    cellsUnit: 'cells',
    loading: 'Loading the provenance of the series…',
    failed: 'The provenance of the series could not be loaded',
    limits: [
      '<b>Linear interpolation cannot see a crisis.</b> A blight, a drought or a crop collapse between two observations vanishes from the series: the line rises or falls smoothly where there was a jump.',
      '<b>Yield is never an observed figure</b>: it is production divided by area. If either is estimated, yield inherits that uncertainty compounded, and on marginal crops it produces values the quality checks flag as implausible.',
      '<b>Splitting a national total across provinces</b> assumes the distribution of one benchmark year holds for its neighbours. Reasonable in the short run, and worse the further you get from the benchmark.',
      'A <b>structural zero</b> (the crop did not exist yet) and a <b>gap</b> (it existed but was not measured) are different things, and they are distinguished here. Confusing them is the commonest way to invent a trend.',
      '<b>Declared reliability</b> belongs to the value, not the source: a badly compiled yearbook is still an observation. Marking something as observed says where it came from, not that it is right.',
    ],
  },
};

function fill(tpl, idx, lang) {
  const t = idx.totales;
  const map = {
    celdas: N(t.celdas, lang), observadas: N(t.observadas, lang),
    estimadas: N(t.estimadas, lang), sin_dato: N(t.sin_dato, lang),
    pct: PCT(t.pct_observado, lang),
    full_rows: N(FULL.rows, lang), full_pct: PCT(FULL.pct, lang),
    full_nomethod: FULL.no_method === 0 ? (lang === 'en' ? 'zero' : 'cero') : N(FULL.no_method, lang),
  };
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
}

const ComoTrabajamos = {
  _lang: null,

  /** Render into `host`. Re-renders when the language changes; otherwise it is a no-op. */
  async render(host, lang = 'es') {
    if (!host) return;
    const L = T[lang] || T.es;
    if (this._lang === lang && host.dataset.pvReady === '1') return;

    host.innerHTML = `<div class="pv-section"><p class="pv-empty">${esc(L.loading)}</p></div>`;
    try {
      const { index, series, coverage } = await ProvenancePanel.load('data/provenance');
      this._lang = lang;

      const t = index.totales;
      const sources = Object.entries(index.fuentes || {})
        .filter(([k]) => k && !['estimated', 'missing'].includes(k))
        .sort((a, b) => b[1] - a[1]);

      /* Dos columnas en pantalla ancha. Antes la prosa era una tira de 473 px que bajaba 886 px
         por la izquierda con la mitad derecha de la pantalla en blanco; las cifras y los límites
         se mudan a esa mitad y dejan de ir apilados debajo. */
      host.innerHTML = `
        <div class="pv-section">
          <h2>${esc(L.title)}</h2>
          <div class="pv-intro">
            <div class="pv-prose">${fill(PROSE[lang] || PROSE.es, index, lang)}</div>
            <aside class="pv-aside">
              <div class="pv-headline">
                <div><b>${N(t.celdas, lang)}</b><span>${esc(L.cells)}</span></div>
                <div><b>${PCT(t.pct_observado, lang)} %</b><span>${esc(L.observed)}</span></div>
                <div><b>${N(t.estimadas, lang)}</b><span>${esc(L.estimated)}</span></div>
                <div><b>${N(t.sin_dato, lang)}</b><span>${esc(L.nodata)}</span></div>
              </div>
              <div class="pv-limits">
                <h3>${esc(L.limitsTitle)}</h3>
                <ul>${L.limits.map(x => `<li>${x}</li>`).join('')}</ul>
              </div>
            </aside>
          </div>
          <h3 class="pv-h3">${esc(L.seriesTitle)}</h3>
          <div class="pv-lede">${L.seriesLede}</div>
          <div class="pv-grid" id="pv-series"></div>
          <h3 class="pv-h3">${esc(L.coverageTitle)}</h3>
          <div id="pv-coverage"></div>
          ${sources.length ? `
          <div class="pv-sources">
            <h3>${esc(L.sourcesTitle)}</h3>
            <table><tbody>${sources.map(([k, v]) =>
              `<tr><td>${esc(k)}</td><td>${N(v, lang)} ${esc(L.cellsUnit)}</td></tr>`).join('')}
            </tbody></table>
          </div>` : ''}
        </div>`;

      const grid = host.querySelector('#pv-series');
      const notes = SERIES_NOTE[lang] || SERIES_NOTE.es;
      series
        .sort((a, b) => b.cobertura.pct_observado - a.cobertura.pct_observado)
        .forEach(s => {
          const box = document.createElement('div');
          grid.appendChild(box);
          ProvenancePanel.renderSeries(box, s);
          /* qué enseña esta serie en concreto: va bajo el título del panel, no en la prosa */
          const head = box.querySelector('.pv-head');
          const shown = DISPLAY[s.territory];
          if (shown && head) head.querySelector('h3').textContent = shown;
          const note = notes[s.territory];
          if (note && head) {
            const p = document.createElement('p');
            p.className = 'pv-note';
            p.textContent = note;
            head.appendChild(p);
          }
        });
      if (coverage) ProvenancePanel.renderCoverage(host.querySelector('#pv-coverage'), coverage);
      host.dataset.pvReady = '1';
    } catch (err) {
      host.dataset.pvReady = '';
      host.innerHTML = `<div class="pv-section"><p class="pv-empty">${esc(L.failed)} ` +
        `(${esc(err.message)}). <code>data/provenance/</code></p></div>`;
      console.error('como-trabajamos:', err);
    }
  },
};

export default ComoTrabajamos;
