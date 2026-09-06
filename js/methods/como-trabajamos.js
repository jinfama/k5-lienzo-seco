/* como-trabajamos.js — CAHE's methods section: which numbers were counted and which we built.

   Same component and same data contract as the Atlas de Andalucía, but CAHE ships in Spanish
   and English, so the prose comes in both and the section is rendered with the current language.

   Figures in {curly braces} are filled from data/provenance/index.json at render time, so the
   text can be rewritten without the numbers going stale.

   NOTA PARA JUAN: la prosa es un BORRADOR del 2026-09-05, pendiente de tu revisión — en los dos
   idiomas. Los datos y las cifras sí están medidos y se rellenan solos.
*/

import ProvenancePanel from './provenance-panel.js?v=20260906f';

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
<p>Las series de CAHE arrancan en <b>1860</b> y llegan a la actualidad. Ninguna fuente cubre ese
siglo y medio de un tirón: hay anuarios que aparecen y desaparecen, estadísticas que cambian de
criterio a mitad de camino, provincias que dejan de publicar durante décadas y una guerra por en
medio. Todo lo que ve en este visor es el resultado de <b>empalmar</b> esas fuentes y de
<b>rellenar</b> lo que ninguna recogió.</p>

<p>Conviene decir de entrada la cifra incómoda. En el conjunto de la base agraria —{full_rows}
celdas de cultivo, año, provincia e indicador— solo el <b>{full_pct}%</b> son dato observado en
una fuente. El resto está construido por nosotros. Ninguna de esas estimaciones queda sin método
declarado: son {full_nomethod} las filas estimadas sin decir cómo.</p>

<p>Esa cifra global engaña si se lee sola, y por eso conviene desmenuzarla. <b>El detalle
provincial es lo que tira del porcentaje hacia abajo</b>: durante largos tramos del siglo XIX y
XX solo se publicaba el total nacional, y el reparto por provincias lo hemos reconstruido
escalando desde ese total. Las series nacionales, que son las que enseñan los paneles de abajo,
están mucho mejor sostenidas: <b>{pct}% de sus {celdas} celdas son observación directa</b>.</p>

<p>Los métodos que usamos son deliberadamente pocos y explícitos: <b>interpolación lineal</b>
entre dos observaciones, <b>proxy de crecimiento</b> cuando existe una serie relacionada que sí
está medida, <b>arrastre</b> del último valor conocido en tramos cortos, <b>reparto desde un año
de referencia</b> para bajar de nacional a provincial, y <b>derivación</b> cuando un indicador
sale de otros dos (el rendimiento, por ejemplo, es producción dividida por superficie: no se
observa nunca, se calcula siempre). Cada celda guarda cuál de ellos se le aplicó.</p>

<p>Los gráficos no suavizan la diferencia: <b>punto sólido</b> donde hay dato observado,
<b>trazo discontinuo y de otro color</b> donde hay estimación —un color por método—, y
<b>hueco</b>, nunca una recta, donde no hay ninguna de las dos cosas. Pase el ratón o toque
cualquier año para ver de dónde sale. El interruptor «ver solo los años observados» deja a la
vista el esqueleto documental desnudo, que es la prueba más honesta de qué sostiene cada serie.</p>

<p>Las cuatro series elegidas no son las mejores: son las que enseñan el rango, del viñedo —el
cultivo mejor documentado de la estadística agraria española— al girasol, que no existe como
cultivo relevante hasta mediados del siglo XX y arrastra por eso una larga tira de ceros que no
son ausencia de dato sino ausencia de cultivo. Los datos completos, con todas sus columnas de
procedencia, se descargan desde cada panel y están depositados con DOI en Zenodo.</p>
`,
  en: `
<p>The CAHE series start in <b>1860</b> and run to the present. No single source covers that
century and a half: yearbooks appear and vanish, statistics change their criteria halfway
through, provinces stop reporting for decades, and there is a civil war in the middle. Everything
in this viewer is the result of <b>splicing</b> those sources together and <b>filling in</b> what
none of them recorded.</p>

<p>The uncomfortable figure first. Across the whole agricultural database — {full_rows} cells of
crop, year, province and indicator — only <b>{full_pct}%</b> are observed in a source. The rest we
built. None of those estimates is left without a declared method: {full_nomethod} estimated rows
fail to say how they were produced.</p>

<p>Read on its own that headline misleads, so it is worth unpacking. <b>The provincial detail is
what drags the share down</b>: for long stretches of the nineteenth and twentieth centuries only
the national total was published, and the split across provinces is our reconstruction, scaled
down from that total. The national series — the ones in the panels below — rest on much firmer
ground: <b>{pct}% of their {celdas} cells are direct observations</b>.</p>

<p>The methods are deliberately few and explicit: <b>linear interpolation</b> between two
observations, a <b>growth proxy</b> where a related series was actually measured, <b>carrying</b>
the last known value across short gaps, <b>distribution from a benchmark year</b> to go from
national to provincial, and <b>derivation</b> where one indicator comes out of two others (yield,
for instance, is production divided by area: it is never observed, always computed). Every cell
records which one was applied to it.</p>

<p>The charts do not smooth the difference away: a <b>solid dot</b> where the figure was observed,
a <b>dashed stroke in another colour</b> where it was estimated — one colour per method — and a
<b>gap</b>, never a straight line, where there is neither. Hover or tap any year to see where it
came from. The "observed years only" switch strips the series back to its documentary skeleton,
which is the most honest test of what holds it up.</p>

<p>The four series were not chosen for being the best: they show the range, from the vineyard —
the best-documented crop in Spanish agricultural statistics — to sunflower, which does not exist
as a significant crop until the mid twentieth century and therefore carries a long run of zeros
that mean absence of the crop, not absence of data. The full data, with every provenance column,
downloads from each panel and is deposited with a DOI on Zenodo.</p>
`,
};

const T = {
  es: {
    title: 'Cómo trabajamos',
    seriesTitle: 'Cuatro series, del techo al suelo de la cobertura',
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
    seriesTitle: 'Four series, from the best-covered to the worst',
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

      host.innerHTML = `
        <div class="pv-section">
          <h2>${esc(L.title)}</h2>
          <div class="pv-prose">${fill(PROSE[lang] || PROSE.es, index, lang)}</div>
          <div class="pv-headline">
            <div><b>${N(t.celdas, lang)}</b><span>${esc(L.cells)}</span></div>
            <div><b>${PCT(t.pct_observado, lang)} %</b><span>${esc(L.observed)}</span></div>
            <div><b>${N(t.estimadas, lang)}</b><span>${esc(L.estimated)}</span></div>
            <div><b>${N(t.sin_dato, lang)}</b><span>${esc(L.nodata)}</span></div>
          </div>
          <h3 style="margin:26px 0 12px">${esc(L.seriesTitle)}</h3>
          <div class="pv-grid" id="pv-series"></div>
          <h3 style="margin:30px 0 10px">${esc(L.coverageTitle)}</h3>
          <div id="pv-coverage"></div>
          <div class="pv-limits">
            <h3>${esc(L.limitsTitle)}</h3>
            <ul>${L.limits.map(x => `<li>${x}</li>`).join('')}</ul>
          </div>
          ${sources.length ? `
          <div class="pv-sources">
            <h3>${esc(L.sourcesTitle)}</h3>
            <table><tbody>${sources.map(([k, v]) =>
              `<tr><td>${esc(k)}</td><td>${N(v, lang)} ${esc(L.cellsUnit)}</td></tr>`).join('')}
            </tbody></table>
          </div>` : ''}
        </div>`;

      const grid = host.querySelector('#pv-series');
      series
        .sort((a, b) => b.cobertura.pct_observado - a.cobertura.pct_observado)
        .forEach(s => {
          const box = document.createElement('div');
          grid.appendChild(box);
          ProvenancePanel.renderSeries(box, s);
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
