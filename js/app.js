/* CAHE — app.js
   - Perspectiva global: 4 análisis nativos con todos los controles de v1
   - Indicadores y Sectores: visor nativo unificado (línea/área/tabla + tendencia/mapa)
   - Mapas integrados como sub-vista de los indicadores que los tienen
*/

const els = {
  nav: document.getElementById("main-nav"),
  groupNav: document.getElementById("header-group-nav"),
  groupBar: document.getElementById("group-bar"),
  workspace: document.getElementById("workspace"),
  tooltip: document.getElementById("tooltip"),
  brand: document.querySelector(".brand"),
  home: document.getElementById("btn-home"),
  lang: document.getElementById("lang-toggle"),
  modal: document.getElementById("modal"),
  modalContent: document.getElementById("modal-content"),
};

const state = {
  section: "visualizacion",
  subsection: "landing",
  group: "global",
  vizId: null,
  /* Filtros indicador */
  ind_variable: null, ind_tipoMulti: null, ind_tipo2: null,
  ind_scale: "linear", ind_display: "linea",
  ind_view: "tendencia", ind_mapCombo: null,
  ind_optionsOpen: true, componentMenuOpen: false, indTimelineKey: null,
  /* Filtros global */
  trendIndicator: "Emisiones de CO₂", trendVariable: "Per cápita", trendArea: "Both",
  trendMA: "none", trendShowR2: false, trendShowLine: false,
  trendShowMax: false, trendShowToday: false, trendShowBreaks: false, trendPeriodWindow: null, trendPeriodWindows: [],
  controlsCollapsed: false,
  corrXInd: "PIB", corrXVar: "Per cápita", corrXScale: "linear",
  corrYInd: "Emisiones de CO₂", corrYVar: "Per cápita", corrYScale: "linear",
  corrArea: "Both",
  lmdiIndicator: "Emisiones de CO₂", lmdiArea: "España",
  lmdiChart: "waterfall-additive", lmdiPeriod: "40years", lmdiCustomYears: "1860,1900,1940,1980,2020",
  tapioIndicator: "Emisiones de CO₂", tapioArea: "España", tapioWindow: 5,
  perspectiveTopic: "all", perspectiveAuthor: "all", perspectiveSort: "newest", perspectiveEntry: null,
  pubTags: [], pubAuthor: "all", pubType: "all", pubSort: "newest",
  /* Timeline */
  year: 2020, speed: 4, playing: false,
  globalYear: null, globalSpeed: 4, globalPlaying: false,
  yearStart: null, yearEnd: null, globalYearStart: null, globalYearEnd: null,
  mapMiniOpen: true, mapMiniUserSet: false,
  lang: localStorage.getItem("cahe_lang") || "es",
};
function isCompactViewport(){
  return typeof window !== "undefined" && window.matchMedia?.("(max-width: 640px)").matches;
}

function chartViewport(container, fallbackW = 800, fallbackH = 480, minW = 360, minH = 280){
  const box = container.getBoundingClientRect();
  const compact = isCompactViewport();
  const W = Math.max(compact ? 320 : minW, Math.floor(box.width) || (compact ? minW : fallbackW));
  const H = Math.max(compact ? 250 : minH, Math.floor(box.height) || (compact ? minH : fallbackH));
  return { W, H, compact };
}

function lineChartMargins(kind = "indicator"){
  if(!isCompactViewport()){
    return kind === "global"
      ? { top: 22, right: 132, bottom: 34, left: 74 }
      : { top: 22, right: 130, bottom: 36, left: 80 };
  }
  return kind === "global"
    ? { top: 18, right: 82, bottom: 31, left: 56 }
    : { top: 18, right: 84, bottom: 31, left: 58 };
}

// Assets inherited from CAHE v1, internalised in v3 on 2026-09-05: this viewer
// no longer reads anything from ../web_cahe or ../x9-bruma-cobre.
const V1_DOCS = "data/downloads/docs";
const V1_IMG = "img/team";
const V1_ICONS = "img/icons";
const V1_RAW = "data/global";
const ZENODO_CAHE_URL = "https://zenodo.org/search?q=Contabilidad%20Ambiental%20Hist%C3%B3rica%20de%20Espa%C3%B1a";
const GITHUB_CAHE_URL = "https://github.com/jinfama";
const APP_VERSION = "20260905d";
const ZENODO_LOGO_SRC = "img/logos/zenodo.png";
const GITHUB_LOGO_SRC = "img/logos/github-invertocat.svg";
let perspectiveAudioRuntime = { audioEl: null, entry: null, frame: null, dragging: false, speed: 1, viewportCleanup: null };

const UI = {
  es: {
    visualizacion: "Visualización", datos: "Datos y metodología", metodos: "Cómo trabajamos", perspectivas: "Perspectivas", publicaciones: "Publicaciones", equipo: "Equipo", acerca: "Acerca", portada: "Portada",
    brandSub: "Contabilidad Ambiental Histórica de España", loadingAtlas: "Cargando atlas CAHE", loadingData: "Cargando datos",
    dataXlsx: "Datos", method: "Método", infoMethod: "Información y metodología", cite: "Citar", howToCite: "Cómo citar", zenodo: "Zenodo", github: "GitHub", pending: "Pendiente",
    choosePanel: "Visor de datos", landingIntro: "Explora series históricas ambientales de España con mapas, tendencias, áreas, tablas y herramientas comparativas por indicador, escala territorial y periodo.", openViewer: "Abrir visor", comingSoon: "Próximamente",
    macroEyebrow: "Indicadores macro", sectorEyebrow: "Indicadores sectoriales", commodities: "Commodities", analysis: "Análisis",
    view: "Vista", variable: "Variable", components: "Componentes", scale: "Escala", indicator: "Indicador", metric: "Métrica", geographicArea: "Área",
    area: "Área", window: "Ventana", category: "Categoría", crop: "Cultivo", component: "Componente", map: "Mapa", trend: "Tend.", table: "Tabla",
    lineal: "Lineal", log: "Log", play: "Reproducir timelapse", pause: "Pausar timelapse", speed: "Velocidad", year: "Año",
    nationalSeries: "Serie nacional", variables: "Variables", types: "Tipos", coverage: "Cobertura", fullMethod: "Metodología",
    dataPageTitle: "Datos y metodología", dataPageIntro: "Cada serie se descarga aquí directamente, junto con su documento metodológico. Zenodo y GitHub reunirán los depósitos completos y los paquetes de replicación a medida que se publiquen.",
    dataSeriesTitle: "Series y descargas", zenodoDeposits: "Depósitos Zenodo", community: "Comunidad",
    dataDownload: "Descargar datos", doiPending: "DOI pendiente de depósito",
    perspectivesTitle: "Perspectivas", perspectivesIntro: "Análisis breves y divulgativos en texto y audio, con autoría revisada y apoyo de IA cuando se indica.",
    topic: "Tema", author: "Autor", orderBy: "Orden", allTopics: "Todos los temas", allAuthors: "Todos los autores",
    newest: "Más recientes", oldest: "Más antiguas", titleOrder: "Título A-Z", noEntries: "Sin entradas para este filtro.",
    publicationsTitle: "Publicaciones", publicationsIntro: "Publicaciones científicas del equipo y colaboradores basadas en los datos presentados en este sitio web y en las líneas de investigación que los sustentan.",
    allTags: "Todas las líneas", selectedTags: "Líneas seleccionadas", publicationType: "Tipo", allTypes: "Todos los tipos", noPublications: "Sin publicaciones para este filtro.", results: "resultados",
    coordination: "Coordinación", teamMembers: "Equipo",
    teamTitle: "Equipo CAHE", teamIntro: "Investigadores responsables de la Contabilidad Ambiental Histórica de España.", aboutTitle: "La CAHE",
    noData: "Sin datos.", noSeries: "Sin series para la selección.", mapProvince: "Mapa provincial", mapInfo: "Color escala fija sobre todo el rango temporal. Pasa el ratón sobre una provincia para ver su valor.",
    native: "Visor interactivo", close: "Cerrar", copied: "Copiado",
  },
  en: {
    visualizacion: "Visualization", datos: "Data and methods", metodos: "How we work", perspectivas: "Perspectives", publicaciones: "Publications", equipo: "Team", acerca: "About", portada: "Home",
    brandSub: "Historical Environmental Accounts of Spain", loadingAtlas: "Loading CAHE atlas", loadingData: "Loading data",
    dataXlsx: "Data", method: "Method", infoMethod: "Information and methods", cite: "Cite", howToCite: "How to cite", zenodo: "Zenodo", github: "GitHub", pending: "Pending",
    choosePanel: "Data viewer", landingIntro: "Explore Spain's long-run environmental series through maps, trends, area charts, tables and comparative tools by indicator, territorial scale and period.", openViewer: "Open viewer", comingSoon: "Coming soon",
    macroEyebrow: "Macro indicators", sectorEyebrow: "Sectoral indicators", commodities: "Commodities", analysis: "Analysis",
    view: "View", variable: "Variable", components: "Components", scale: "Scale", indicator: "Indicator", metric: "Metric", geographicArea: "Area",
    area: "Area", window: "Window", category: "Category", crop: "Crop", component: "Component", map: "Map", trend: "Trend", table: "Table",
    lineal: "Linear", log: "Log", play: "Play timelapse", pause: "Pause timelapse", speed: "Speed", year: "Year",
    nationalSeries: "National series", variables: "Variables", types: "Types", coverage: "Coverage", fullMethod: "Methodology",
    dataPageTitle: "Data and methods", dataPageIntro: "Every series can be downloaded here directly, together with its methodology document. Zenodo and GitHub will hold the full deposits and replication packages as they are published.",
    dataSeriesTitle: "Series and downloads", zenodoDeposits: "Zenodo deposits", community: "Community",
    dataDownload: "Download data", doiPending: "DOI pending deposit",
    perspectivesTitle: "Perspectives", perspectivesIntro: "Short public-facing analyses in text and audio, reviewed by their authors and AI-assisted when indicated.",
    topic: "Topic", author: "Author", orderBy: "Order", allTopics: "All topics", allAuthors: "All authors",
    newest: "Newest", oldest: "Oldest", titleOrder: "Title A-Z", noEntries: "No entries for this filter.",
    publicationsTitle: "Publications", publicationsIntro: "Scientific publications by the team and collaborators based on the data presented on this site and on the research lines that support them.",
    allTags: "All lines", selectedTags: "Selected lines", publicationType: "Type", allTypes: "All types", noPublications: "No publications for this filter.", results: "results",
    coordination: "Coordination", teamMembers: "Team",
    teamTitle: "CAHE team", teamIntro: "Researchers responsible for the Historical Environmental Accounts of Spain.", aboutTitle: "The CAHE",
    noData: "No data.", noSeries: "No series for the current selection.", mapProvince: "Provincial map", mapInfo: "Fixed color scale over the whole time range. Hover over a province to see its value.",
    native: "Interactive viewer", close: "Close", copied: "Copied",
  }
};

const LABEL_EN = {
  "Perspectiva global": "Global perspective", "Indicadores macro": "Macro indicators", "Indicadores sectoriales": "Sectoral indicators",
  "España vs Mundo": "Spain vs World", "Forestal · Cultivos · Industria · Sector eléctrico": "Forestry · Crops · Industry · Power sector", "Olivo · Leña · Potasa": "Olive · Fuelwood · Potash",
  "Energía": "Energy", "Emisiones": "Emissions", "Emisiones GEI": "GHG emissions", "Emisiones CO₂": "CO₂ emissions", "Materiales": "Materials", "Tierra": "Land",
  "Forestal": "Forestry", "Bosques": "Forests", "Cultivos": "Crops", "Industria": "Industry", "Sector eléctrico": "Power sector", "Olivo": "Olive", "Potasa": "Potash", "Leña": "Fuelwood", "Ahorro Genuino": "Genuine savings",
  "Dataset integrado": "Integrated dataset", "Consumo de energía": "Energy consumption", "Emisiones de CO₂": "CO₂ emissions", "Flujos materiales": "Material flows", "Usos del suelo": "Land use",
  "PIB": "GDP", "Población": "Population", "IDH": "HDI", "IDH-A": "AHDI", "Agua": "Water", "Nitrógeno": "Nitrogen", "Tierras de cultivo": "Cropland",
  "Tendencias": "Trends", "Correlación": "Correlation", "Descomposición · LMDI": "Decomposition · LMDI", "Desacoplamiento · Tapio": "Decoupling · Tapio",
  "Series por área y variable": "Series by area and variable", "Scatter bivariado": "Bivariate scatter", "Descomposición Kaya": "Kaya decomposition", "Escenarios de elasticidad": "Elasticity scenarios",
  "España": "Spain", "Mundo": "World", "Ambos": "Both", "Absoluto": "Absolute", "Acumulado": "Cumulative", "Intensidad": "Intensity",
  "Porcentaje": "Share", "Índice": "Index", "Per cápita": "Per capita", "Total": "Total", "Nacional": "National", "Provincial": "Provincial",
  "Nacional · Provincial": "National · Provincial", "Nacional · CO₂eq": "National · CO₂eq", "Nacional · con comercio": "National · with trade",
  "En construcción": "Under construction", "Integrado": "Integrated", "Nacional · comercio": "National · trade",
  "Superficie forestal por categorías de monte (alto, bajo, abierto), densidad y stock de carbono. Incluye mapa provincial.": "Forest area by forest categories, density and carbon stock. Includes provincial map.",
  "Superficie cultivada y grandes grupos de cultivos (cereales, frutales, leguminosas, industriales, olivos). Incluye mapa provincial.": "Cropland area and major crop groups. Includes provincial map.",
  "Grandes usos del suelo en España. Incluye mapa provincial de cobertura.": "Major land uses in Spain. Includes provincial land-cover map.",
  "Base longitudinal completa con las principales series de energía, materiales, emisiones, usos del suelo, bosques y cultivos, preparada para reproducir las visualizaciones.": "Complete longitudinal dataset with the main energy, material, emissions, land-use, forest and crop series used to reproduce the visualizations.",
  "Consumo de energía primaria: fuentes modernas (petróleo, gas, electricidad) y tradicionales (leña, alimentos y forraje).": "Primary energy consumption: modern sources (oil, gas, electricity) and traditional sources (fuelwood, food and fodder).",
  "Gases de efecto invernadero (CO₂, CH₄, N₂O y F-gases) expresados en CO₂ equivalente.": "Greenhouse gases (CO₂, CH₄, N₂O and F-gases) expressed as CO₂ equivalent.",
  "Emisiones de CO₂ por combustibles fósiles (carbón, petróleo y gas) y por usos del suelo.": "CO₂ emissions from fossil fuels (coal, oil and gas) and land use.",
  "Gases de efecto invernadero y CO₂: total, gases, grandes actividades y combustibles fósiles.": "Greenhouse gases and CO₂: total, gases, broad activities and fossil fuels.",
  "Gases de efecto invernadero y CO₂: total, gases, grandes actividades, combustibles fósiles y usos del suelo.": "Greenhouse gases and CO₂: total, gases, broad activities, fossil fuels and land use.",
  "Extracción, comercio y consumo aparente de biomasa, fósiles, minerales metálicos y minerales no metálicos.": "Extraction, trade and apparent consumption of biomass, fossil fuels, metallic and non-metallic minerals.",
  "Grandes coberturas del territorio español y reconstrucción de usos del suelo en perspectiva histórica.": "Major Spanish land-cover categories and historical land-use reconstruction.",
  "Superficie forestal por categorías de monte, densidad y stock de carbono, con lectura nacional y provincial.": "Forest area by categories, density and carbon stock, at national and provincial scale.",
  "Superficie cultivada y principales grupos de cultivos, incluyendo cereales, frutales, leguminosas, industriales y olivar.": "Cropland area and major crop groups, including cereals, fruit trees, legumes, industrial crops and olive groves.",
};
Object.assign(LABEL_EN, {
  "Macro indicators": "Macro indicators",
  "Sectoral indicators": "Sectoral indicators",
  "Global perspective": "Global perspective",
  "Área": "Area",
  "Eje X": "X axis",
  "Eje Y": "Y axis",
  "Variable X": "X variable",
  "Variable Y": "Y variable",
  "Escala": "Scale",
  "Vista": "View",
  "Categoría": "Category",
  "Combinación": "Combination",
  "Componentes": "Components",
  "Tipos": "Types",
  "Año inicio": "Start year",
  "Año fin": "End year",
  "Absolutos": "Absolute",
  "Carbón": "Coal",
  "Petróleo": "Oil",
  "Gas": "Gas",
  "Total GEI": "Total GHG",
  "Total CO₂": "Total CO₂",
  "CO₂": "CO₂",
  "CH₄": "CH₄",
  "N₂O": "N₂O",
  "F-gases y otros": "F-gases and other",
  "Bio / AFOLU": "Bio / AFOLU",
  "Energía e industria": "Energy and industry",
  "Por gas": "By gas",
  "Por actividad": "By activity",
  "CO₂ por fuente": "CO₂ by source",
  "Fuente original": "Original source",
  "Agregación": "Aggregation",
  "Electricidad": "Electricity",
  "Leña": "Fuelwood",
  "Alimentos y forraje": "Food and fodder",
  "Hidráulica y eólica": "Hydro and wind",
  "Uso del suelo": "Land use",
  "CO₂ fósiles": "Fossil CO₂",
  "CO₂ uso del suelo": "Land-use CO₂",
  "CH₄ Bio": "CH₄ bio",
  "CH₄ energía/industria": "CH₄ energy/industry",
  "N₂O Bio": "N₂O bio",
  "N₂O energía/industria": "N₂O energy/industry",
  "Otros": "Other",
  "Biomasa": "Biomass",
  "Materiales fósiles": "Fossil materials",
  "Minerales metálicos": "Metal ores",
  "Minerales no metálicos": "Non-metallic minerals",
  "Extracción": "Extraction",
  "Consumo aparente": "Apparent consumption",
  "Importaciones": "Imports",
  "Exportaciones": "Exports",
  "Superficie": "Area",
  "Stock de C": "Carbon stock",
  "Densidad de C": "Carbon density",
  "% de superficie": "% of area",
  "Monte abierto": "Open woodland",
  "Monte alto": "High forest",
  "Monte bajo": "Low forest",
  "Dehesa": "Dehesa",
  "Cultivo herbáceo": "Herbaceous cropland",
  "Cultivo leñoso": "Woody cropland",
  "Pastizal y matorral": "Pasture and shrubland",
  "Herbáceo": "Herbaceous",
  "Leñoso": "Woody crops",
  "Producción": "Production",
  "Rendimiento": "Yield",
  "Barbecho": "Fallow",
  "Cereales y granos": "Cereals and grains",
  "Frutas y frutos secos": "Fruit and nuts",
  "Hortalizas y tubérculos": "Vegetables and tubers",
  "Industriales y otros": "Industrial crops and others",
  "Olivos": "Olives",
  "Energía Final": "Final energy",
  "Energía Primaria": "Primary energy",
  "Manufacturas": "Manufacturing",
  "Línea": "Line",
  "Área": "Area",
  "Tabla": "Table",
  "Mapa": "Map",
  "Tend.": "Trend",
  "Lineal": "Linear",
  "Log": "Log",
  "Serie": "Series",
  "Valor": "Value",
  "datos": "data",
  "método": "method",
  "citar": "cite",
  "Información": "Information",
  "Gases de efecto invernadero (CO₂, CH₄, N₂O, F-gases) en CO₂ equivalente.": "Greenhouse gases (CO₂, CH₄, N₂O and F-gases) expressed as CO₂ equivalent.",
  "CO₂ por combustibles fósiles (petróleo, carbón, gas) y usos del suelo.": "CO₂ from fossil fuels (oil, coal and gas) and land use.",
  "Flujos materiales: biomasa, fósiles, minerales metálicos y no metálicos. Incluye comercio (extracción, consumo aparente, importaciones, exportaciones).": "Material flows: biomass, fossil materials, metal ores and non-metallic minerals. Includes trade: extraction, apparent consumption, imports and exports.",
  "Energía primaria y final, y emisiones de CO₂ por subsectores industriales.": "Primary and final energy, and CO₂ emissions by industrial subsector.",
  "Ahorro Genuino — indicador macro de sostenibilidad débil (próximamente).": "Genuine savings — weak sustainability macro indicator (coming soon).",
  "Sector eléctrico: generación, mix eléctrico, potencia instalada y electrificación (próximamente).": "Power sector: generation, electricity mix, installed capacity and electrification (coming soon).",
  "Olivo: superficie, producción, comercio (próximamente).": "Olive: area, production and trade (coming soon).",
  "Leña: aprovechamiento forestal, energía tradicional y comercio (próximamente).": "Fuelwood: forest use, traditional energy and trade (coming soon).",
  "Potasa: extracción y flujos (próximamente).": "Potash: extraction and flows (coming soon).",
});
Object.assign(LABEL_EN, {
  "Por trabajador": "Per worker",
  "Energía final": "Final energy",
  "Energía primaria": "Primary energy",
  "Energía primaria por fuente": "Primary energy by source",
  "Gasto energético": "Energy expenditure",
  "Emisiones inventario": "Inventory emissions",
  "Valor añadido": "Value added",
  "Trabajadores": "Workers",
  "Fábricas": "Factories",
  "Energía final · Total": "Final energy · Total",
  "Energía primaria · Total": "Primary energy · Total",
  "Energía primaria por fuente · Total": "Primary energy by source · Total",
  "Gasto energético · Total": "Energy expenditure · Total",
  "Emisiones GEI · Total": "GHG emissions · Total",
  "Emisiones inventario · Total": "Inventory emissions · Total",
  "Energía final · Biomasa": "Final energy · Biomass",
  "Energía final · Carbón": "Final energy · Coal",
  "Energía final · Coque": "Final energy · Coke",
  "Energía final · Coque de petróleo": "Final energy · Petroleum coke",
  "Energía final · Coque y gases manufacturados": "Final energy · Coke and manufactured gases",
  "Energía final · Electricidad": "Final energy · Electricity",
  "Energía final · Fuelóleo": "Final energy · Fuel oil",
  "Energía final · Gas": "Final energy · Gas",
  "Energía final · Gasóleo": "Final energy · Diesel oil",
  "Energía final · Gasolina": "Final energy · Gasoline",
  "Energía final · GLP": "Final energy · LPG",
  "Energía final · Hidráulica directa": "Final energy · Direct hydro",
  "Energía final · Otros carbones": "Final energy · Other coal",
  "Energía final · Petróleo": "Final energy · Oil",
  "Energía primaria · Biomasa": "Primary energy · Biomass",
  "Energía primaria · Carbón": "Primary energy · Coal",
  "Energía primaria · Electricidad": "Primary energy · Electricity",
  "Energía primaria · Hidráulica": "Primary energy · Hydro",
  "Energía primaria · Hidráulica directa": "Primary energy · Direct hydro",
  "Energía primaria · Petróleo": "Primary energy · Oil",
  "Energía primaria por fuente · Biomasa": "Primary energy by source · Biomass",
  "Energía primaria por fuente · Carbón": "Primary energy by source · Coal",
  "Energía primaria por fuente · Gas": "Primary energy by source · Gas",
  "Energía primaria por fuente · Hidráulica": "Primary energy by source · Hydro",
  "Energía primaria por fuente · Nuclear": "Primary energy by source · Nuclear",
  "Energía primaria por fuente · Petróleo": "Primary energy by source · Oil",
  "Energía primaria por fuente · Solar": "Primary energy by source · Solar",
  "Energía primaria por fuente · Eólica": "Primary energy by source · Wind",
  "Gasto energético · Biomasa": "Energy expenditure · Biomass",
  "Gasto energético · Carbón": "Energy expenditure · Coal",
  "Gasto energético · Electricidad": "Energy expenditure · Electricity",
  "Gasto energético · Gas": "Energy expenditure · Gas",
  "Gasto energético · Petróleo": "Energy expenditure · Oil",
  "Emisiones GEI · Carbón": "GHG emissions · Coal",
  "Emisiones GEI · Gas": "GHG emissions · Gas",
  "Emisiones GEI · Otros": "GHG emissions · Other",
  "Emisiones GEI · Petróleo": "GHG emissions · Oil",
  "Emisiones GEI · Procesos": "GHG emissions · Processes",
  "Emisiones inventario · Carbón": "Inventory emissions · Coal",
  "Emisiones inventario · Gas": "Inventory emissions · Gas",
  "Emisiones inventario · Petróleo": "Inventory emissions · Oil",
  "Alimentación": "Food",
  "Textil y cuero": "Textiles and leather",
  "Madera": "Wood",
  "Pasta, papel y cartón": "Pulp, paper and cardboard",
  "Química y petroquímica": "Chemicals and petrochemicals",
  "Minerales no metálicos y construcción": "Non-metallic minerals and construction",
  "Cemento, cal y yeso": "Cement, lime and plaster",
  "Ladrillos, piedra y vidrio": "Bricks, stone and glass",
  "Metalurgia": "Metallurgy",
  "Siderurgia": "Iron and steel",
  "Metales no férreos": "Non-ferrous metals",
  "Maquinaria y bienes metálicos": "Machinery and metal goods",
  "Bienes de equipo": "Capital goods",
  "Material de transporte": "Transport equipment",
  "Bienes de consumo": "Consumer goods",
  "Otras industrias": "Other industries",
  "Energía final y primaria, emisiones, gasto energético, valor añadido, fábricas y trabajadores por ramas industriales.": "Final and primary energy, emissions, energy expenditure, value added, factories and workers by industrial branch.",
  "Base industrial 1860-2021 con energía final y primaria, emisiones, gasto energético, valor añadido, fábricas y trabajadores por ramas industriales.": "Industrial database, 1860-2021, with final and primary energy, emissions, energy expenditure, value added, factories and workers by industrial branch.",
});
function t(key){ return (UI[state.lang] && UI[state.lang][key]) || UI.es[key] || key; }
function tx(value){
  const raw = value == null ? "" : String(value);
  if(state.lang !== "en") return raw;
  if(LABEL_EN[raw]) return LABEL_EN[raw];
  if(raw.includes(" · ")) return raw.split(" · ").map(part => LABEL_EN[part] || part).join(" · ");
  return raw;
}
function itemTitle(item){ return tx(item?.label || ""); }
function itemDescription(item){ return state.lang === "en" && item?.descEn ? item.descEn : tx(item?.desc || ""); }

/* Grupos principales; los mapas se integran como sub-vista en su indicador. */
const GROUPS = [
  { id: "global",    label: "Perspectiva global", cls: "global" },
  { id: "macro",     label: "Indicadores macro", cls: "macro" },
  { id: "sectorial", label: "Indicadores sectoriales", cls: "sectorial" },
  { id: "commodities", label: "Commodities", cls: "commodities" },
];

const LANDING_GROUPS = [
  {
    group: "global",
    id: "tendencias",
    label: "Perspectiva global",
    meta: "España vs Mundo",
    desc: "Panel internacional con tendencias, correlación, descomposición LMDI/IPAT y desacoplamiento Tapio. Incluye reproducción temporal en las vistas evolutivas.",
    descEn: "International panel with trends, correlation, LMDI/IPAT decomposition and Tapio decoupling, including temporal playback in evolving views.",
    icon: `${V1_ICONS}/ic-tendencias.png`,
    cls: "global"
  },
  {
    group: "macro",
    id: "energia",
    label: "Indicadores macro",
    meta: "Nacional · Provincial",
    desc: "Energía, emisiones, materiales y tierra. Cada indicador abre una pantalla propia con controles de serie nacional y, cuando existe, mapa provincial sincronizado.",
    descEn: "Energy, emissions, materials and land. Each indicator opens a dedicated view with national series controls and synchronized provincial maps when available.",
    icon: `${V1_ICONS}/ic-energia.png`,
    cls: "macro"
  },
  {
    group: "sectorial",
    id: "bosques",
    label: "Indicadores sectoriales",
    meta: "Forestal · Cultivos · Industria · Sector eléctrico",
    desc: "Lectura sectorial forestal, agraria, industrial y eléctrica, con mapas provinciales en los sectores territoriales y tendencias nacionales cuando existen datos.",
    descEn: "Sectoral forestry, crop, industry and power-sector views, with provincial maps for territorial sectors and national trends when data are available.",
    icon: `${V1_ICONS}/ic-bosques.png`,
    cls: "sectorial"
  },
  {
    group: "commodities",
    id: "olivo",
    label: "Commodities",
    meta: "Olivo · Leña · Potasa",
    desc: "Entrada específica para productos y recursos singulares. Olivo y potasa quedan fuera de los indicadores sectoriales generales y se agrupan aquí.",
    descEn: "A dedicated entry for specific products and resources. Olive, fuelwood and potash sit outside the general sectoral indicators.",
    icon: `${V1_ICONS}/ic-materiales.png`,
    cls: "commodities"
  },
];

const GLOBAL_ANALYSES = [
  { id: "tendencias",     label: "Tendencias",            sub: "Series por área y variable",   icon: `${V1_ICONS}/ic-tendencias.png` },
  { id: "correlacion",    label: "Correlación",           sub: "Scatter bivariado",            icon: `assets/icons/ic-correlacion-dispersion.svg` },
  { id: "descomposicion", label: "Descomposición · LMDI", sub: "Descomposición Kaya",          icon: `${V1_ICONS}/ic-descomposicion.svg` },
  { id: "desacoplamiento", label: "Desacoplamiento · Tapio", sub: "Escenarios de elasticidad", icon: `${V1_ICONS}/ic-desacoplamiento.png` },
];

/* Cada indicador con su dataSlug y, si lo tiene, mapSlug provincial.
   El visor nativo siempre se construye desde data/national/<dataSlug>.json. */
const CATALOG_OTHER = {
  macro: [
    { id: "energia",       dataSlug: "energia",       label: "Energía",        meta: "Nacional",
      icon: `${V1_ICONS}/ic-energia.png`,
      desc: "Consumo de energía primaria: fuentes modernas (petróleo, gas, electricidad) y tradicionales (leña, alimentos y forraje).",
      method: "energia_metodologia.pdf", data: "cahe_datos_energía.xlsx",
      colorMap: { "Petróleo":"#c93324","Gas":"#e6892b","Electricidad":"#e0c032","Carbón":"#3a4147","Leña":"#8b5a3c","Alimentos y forraje":"#a07a3a","Hidráulica y eólica":"#3a6d8a","Total":"#1c1f24" } },
    { id: "emisiones", dataSources: ["emisiones-gei", "emisiones-co2"], label: "Emisiones",  meta: "Nacional · CO₂eq / CO₂",
      icon: `${V1_ICONS}/ic-emisiones.png`,
      desc: "Gases de efecto invernadero y CO₂: total, gases, grandes actividades y combustibles fósiles.",
      descEn: "Greenhouse gases and CO₂: total, gases, broad activities and fossil fuels.",
      method: "emisiones_metodologia.pdf", data: "cahe_datos_emisiones_co2.xlsx",
      colorMap: { "Total":"#1c1f24","Total GEI":"#1c1f24","Total CO₂":"#35424d","CO₂":"#c93324","CH₄":"#e6892b","N₂O":"#e0c032","F-gases y otros":"#8a949e","Bio / AFOLU":"#6f7a3d","Energía e industria":"#3a6d8a","Petróleo":"#c93324","Gas":"#e6892b","Carbón":"#3a4147","Uso del suelo":"#6f7a3d" } },
    { id: "materiales",    dataSlug: "materiales",    label: "Materiales",     meta: "Nacional · con comercio",
      icon: `${V1_ICONS}/ic-materiales.png`,
      desc: "Flujos materiales: biomasa, fósiles, minerales metálicos y no metálicos. Incluye comercio (extracción, consumo aparente, importaciones, exportaciones).",
      method: "materiales_metodologia.pdf", data: "cahe_datos_materiales.xlsx",
      colorMap: { "Biomasa":"#e6892b","Materiales fósiles":"#1c1f24","Minerales metálicos":"#c93324","Minerales no metálicos":"#7eab86","Total":"#04151f" } },
    { id: "tierra",        dataSlug: "uso-suelo",     label: "Tierra",         meta: "Nacional · Provincial",
      icon: `${V1_ICONS}/ic-tierra.png`,
      desc: "Grandes usos del suelo en España. Incluye mapa provincial de cobertura.",
      method: "uso_suelo_metodos_esp.docx", data: "cahe_datos_uso_suelo.xlsx",
      mapSlug: "uso-suelo" },
    { id: "ahorro-genuino", label: "Ahorro Genuino",  meta: "En construcción",
      icon: `${V1_ICONS}/ic-materiales.png`,
      desc: "Ahorro Genuino — indicador macro de sostenibilidad débil (próximamente).",
      descEn: "Genuine savings — weak sustainability macro indicator (coming soon).", comingSoon: true },
  ],
  sectorial: [
    { id: "bosques",   dataSlug: "bosques",  label: "Forestal",   meta: "Nacional · Provincial",
      icon: `${V1_ICONS}/ic-bosques.png`,
      desc: "Superficie forestal por categorías de monte (alto, bajo, abierto), densidad y stock de carbono. Incluye mapa provincial.",
      method: "bosques_metodologia.pdf", data: "cahe_datos_bosques.xlsx",
      mapSlug: "bosques" },
    { id: "cultivos",  dataSlug: "cultivos", label: "Cultivos",  meta: "Nacional · Provincial",
      icon: `${V1_ICONS}/ic-cultivos.png`,
      desc: "Superficie cultivada y grandes grupos de cultivos (cereales, frutales, leguminosas, industriales, olivos). Incluye mapa provincial.",
      method: "cultivos_metodos_esp.docx", data: "cahe_datos_cultivos.xlsx",
      mapSlug: "cultivos" },
    { id: "industria", dataSlug: "industria", label: "Industria", meta: "Nacional",
      icon: `${V1_ICONS}/ic-industria.png`,
      desc: "Energía primaria y final, y emisiones de CO₂ por subsectores industriales.",
      descEn: "Primary and final energy, and CO₂ emissions by industrial subsector.",
      desc: "Energía final y primaria, emisiones, gasto energético, valor añadido, fábricas y trabajadores por ramas industriales.",
      descEn: "Final and primary energy, emissions, energy expenditure, value added, factories and workers by industrial branch.",
      method: null, dataHref: "data/downloads/FinalDB_1860_2021.csv" },
    { id: "sector-electrico", label: "Sector eléctrico", meta: "En construcción",
      icon: `${V1_ICONS}/ic-energia.png`,
      desc: "Sector eléctrico: generación, mix eléctrico, potencia instalada y electrificación (próximamente).",
      descEn: "Power sector: generation, electricity mix, installed capacity and electrification (coming soon).", comingSoon: true },
  ],
  commodities: [
    { id: "olivo",  label: "Olivo",   meta: "En construcción",
      icon: `assets/icons/ic-olivo.svg`,
      desc: "Olivo: superficie, producción, comercio (próximamente).",
      descEn: "Olive: area, production and trade (coming soon).", comingSoon: true },
    { id: "lena",  label: "Leña",   meta: "En construcción",
      icon: `assets/icons/ic-lenas.svg`,
      desc: "Leña: aprovechamiento forestal, energía tradicional y comercio (próximamente).",
      descEn: "Fuelwood: forest use, traditional energy and trade (coming soon).", comingSoon: true },
    { id: "potasa", label: "Potasa",  meta: "En construcción",
      icon: `${V1_ICONS}/ic-industria.png`,
      desc: "Potasa: extracción y flujos (próximamente).",
      descEn: "Potash: extraction and flows (coming soon).", comingSoon: true },
  ],
};

const DEFAULT_CITATION = "Infante-Amate, J., Iriarte-Goñi, I., & Aguilera, E. Series de la Contabilidad Ambiental Histórica de España. CAHE — Contabilidad Ambiental Histórica de España. www.cahe.es";
const CITATIONS = {
  "energia": "Sanjuán-Ruiz, Á. (2026). The long persistence: fossil fuels consumption, structural constraints and energy transition in Spanish industry, 1960–2021. Revista de Historia Económica / Journal of Iberian and Latin American Economic History, First View, 1–30. https://doi.org/10.1017/S0212610926100974",
  "emisiones": "Infante-Amate, J., & Aguilera, E. (2024). Beyond fossil fuels: Considering land-based emissions reshapes the carbon intensity of modern economic growth (Spain, 1860–2017). Historical Methods: A Journal of Quantitative and Interdisciplinary History, 57(4), 226–241.",
  "emisiones-gei": "Infante-Amate, J., & Aguilera, E. (2024). Beyond fossil fuels: Considering land-based emissions reshapes the carbon intensity of modern economic growth (Spain, 1860–2017). Historical Methods: A Journal of Quantitative and Interdisciplinary History, 57(4), 226–241.",
  "emisiones-co2": "Infante-Amate, J., & Aguilera, E. (2024). Beyond fossil fuels: Considering land-based emissions reshapes the carbon intensity of modern economic growth (Spain, 1860–2017). Historical Methods: A Journal of Quantitative and Interdisciplinary History, 57(4), 226–241.",
  "materiales": "Infante-Amate, J., Vila, J., Aguilera, E., Sanjuán, Á., Oropesa, F., & de Molina, M. G. (2021). Las bases materiales del desarrollo económico en España (1860-2016). Un estudio desde el metabolismo social. Cuadernos Económicos de ICE, 101.",
  "tierra": "Infante-Amate, J., Aguilera, E., Vila, J., & González de Molina, M. (2025). Serie histórica de cobertura del suelo (España, 1860-2020). Contabilidad Ambiental Histórica de España.",
  "bosques": "Infante-Amate, J., Iriarte-Goñi, I., Urrego-Mesa, A., & Gingrich, S. (2022). From woodfuel to industrial wood: a socio-metabolic reading of the forest transition in Spain (1860-2010). Ecological Economics, 201, 107548.",
  "cultivos": "Infante-Amate, J., Aguilera, E., Vila, J., & González de Molina, M. (2025). Serie histórica de cultivos agrícolas (España, 1860-2020). Contabilidad Ambiental Histórica de España; González de Molina, M., Soto, D., Guzmán, G., Infante-Amate, J., Aguilera, E., Vila, J., & García-Ruiz, R. (2020). The social metabolism of Spanish agriculture, 1900-2008. Springer.",
  "industria": "Sanjuán-Ruiz, Á., Infante-Amate, J., & Aguilera, E. (2026). The climate cost of lateness: decomposing historical drivers of CO2 industrial emissions during Spanish industrialization and deindustrialization, 1890–2021. Journal of Industrial Ecology. https://doi.org/10.1007/s44498-026-00077-1",
  "global": DEFAULT_CITATION,
};

const MODAL_INFO = {
  tendencias: {
    titulo: "Información",
    datos: "Series históricas anuales de consumo energía, materiales, agua, nitrógeno, emisiones de CO₂, emisiones totales y uso de superficie cultivada. Los datos se presentan en valores absolutos, tasas de crecimiento, índice en relación al primer año de la serie e intensidad sobre el PIB, esto es, impacto por unidad de PIB.",
    fuentes: "Los datos de España provienen de estimaciones propias ampliamente basadas en registros históricos y modelización. Los detalles pueden consultarse en la sección de datos o en los paneles de los indicadores específicos en la sección de exploración de datos. Los datos globales provienen de diferentes estudios: emisiones de CO₂ de Friedlingstein et al. (2022), el resto de emisiones de gases de efecto invernadero de Gütschow y Pflüger (2022), consumo de materiales de Krausmann et al. (2009), energía de Malanima (2022), uso de tierra de Hurtt et al. (2020) y PIB histórico del proyecto Maddison. En nitrógeno se estima con FAOSTAT desde 1961 y se extrapola utilizando las tendencia de Smil (2004). La intensidad ambiental, estimada como impacto por unidad de PIB, se calcula utilizando los datos históricos de PIB del proyecto Maddison (Bolt & van Zanden, 2020).",
    interpretacion: "La comparación entre España y el conjunto mundial permite observar la gran aceleración del metabolismo socioeconómico desde mediados del siglo XIX. Tanto en España como en el mundo se produjo un crecimiento sostenido en el uso de recursos y emisiones, con una aceleración muy marcada en la segunda mitad del siglo XX. Sin embargo, desde la crisis de 2008, España muestra una desaceleración o incluso reducción en varios indicadores, especialmente en energía, materiales y emisiones, mientras que las tendencias globales continúan en aumento. Durante la denominada Gran Aceleración, el metabolismo español se intensificó más rápidamente que el promedio mundial, impulsado por la industrialización tardía y la modernización agraria, situándose temporalmente por encima de los promedios globales en consumo energético y emisiones per cápita. No obstante, la trayectoria es diferente según el indicador. Te invitamos a que lo explores tú mismo.",
    referencias: [
      "Bolt, J., & van Zanden, J. L. (2020). The Maddison Project. Retrieved October 14, 2019.",
      "Friedlingstein, P., Jones, M. W., O'Sullivan, M., Andrew, R. M., Bakker, D. C., Hauck, J., … & Zeng, J. (2022). Global carbon budget 2021. Earth System Science Data, 14(4), 1917–2005.",
      "Gütschow, J., & Pflüger, M. (2022). The PRIMAP-hist national historical emissions time series (1750–2021) v2.4.",
      "Hurtt, G. C., Chini, L., Sahajpal, R., Frolking, S., Bodirsky, B. L., Calvin, K., … & Zhang, X. (2020). Harmonization of global land-use change and management for the period 850–2100 (LUH2) for CMIP6. Geoscientific Model Development, 13(11), 5425–5464.",
      "Krausmann, F., Gingrich, S., Eisenmenger, N., Erb, K. H., Haberl, H., & Fischer-Kowalski, M. (2009). Growth in global materials use, GDP and population during the 20th century. Ecological Economics, 68(10), 2696–2705.",
      "Malanima, P. (2022). World Energy Consumption: A Database 1820–2020. Center for History and Economics.",
      "Smil, V. (2004). The world's greatest fix: A history of nitrogen in agriculture. Nature, 431, 909–910."
    ],
    actualizacion: "Marzo 2026"
  },
  correlacion: {
    titulo: "Correlación — scatter bivariado",
    datos: "Gráfico de dispersión temporal entre dos variables seleccionadas. Cada punto representa un año y puede mostrarse para España, el mundo o ambos. El eje X y el eje Y pueden cambiar de indicador, métrica y escala, de modo que el visor permite comparar relaciones entre impactos ambientales, PIB, población e indicadores de desarrollo.",
    fuentes: "Las series españolas proceden de CAHE. Las series internacionales combinan Global Carbon Project, PRIMAP-hist, Maddison, Malanima, Krausmann et al., LUH2 y estimaciones de nitrógeno basadas en FAOSTAT y Smil. El visor solo habilita combinaciones para las que existen datos comparables.",
    interpretacion: "La nube de puntos debe leerse como una trayectoria histórica, no como una correlación estática. La pendiente aproximada, la curvatura, los saltos y los cambios de dirección ayudan a ver cuándo dos procesos avanzan juntos y cuándo se separan. Las opciones de escala lineal/logarítmica y media móvil sirven para distinguir tendencias estructurales de oscilaciones anuales.",
    actualizacion: "Marzo 2026"
  },
  descomposicion: {
    titulo: "Información",
    datos: "Visualización de descomposición de indicadores ambientales (energía, materiales, emisiones de CO₂, emisiones totales, agua, nitrógeno y uso de tierra cultivada) mediante métodos logarítmicos (Ang, 2015), multiplicativos, aditivos y en forma de cascada, mostrando aumentos absolutos y relativos entre periodos.",
    fuentes: "Los datos de España provienen de estimaciones propias ampliamente basadas en registros históricos y modelización. Los detalles pueden consultarse en la sección de datos o en los paneles de los indicadores específicos en la sección de exploración de datos. Los datos globales provienen de diferentes estudios: emisiones de CO₂ de Friedlingstein et al. (2022), el resto de emisiones de gases de efecto invernadero de Gütschow y Pflüger (2022), consumo de materiales de Krausmann et al. (2009), energía de Malanima (2022), uso de tierra de Hurtt et al. (2020) y PIB histórico del proyecto Maddison. En nitrógeno se estima con FAOSTAT desde 1961 y se extrapola utilizando las tendencia de Smil (2004). Los datos de PIB se toman del proyecto Maddison (Bolt & van Zanden, 2020). IPAT es un marco conceptual que descompone el impacto ambiental total (I) en población (P), riqueza o afluencia per cápita (A) e intensidad tecnológica (T), según la ecuación I = P × A × T. LMDI (Logarithmic Mean Divisia Index, Ang, 2015) permite analizar cómo cada factor contribuye al cambio total del impacto entre dos periodos, pudiendo expresarse en forma aditiva (contribuciones absolutas) o multiplicativa (contribuciones relativas, transformadas en logaritmos para sumar exactamente al total observado).",
    interpretacion: "Un valor positivo indica que el factor contribuye a aumentar el impacto ambiental; por ejemplo, ceteris paribus, si la población o la renta per cápita aumentan, incrementan el impacto. Valores negativos muestran que el factor ayuda a reducir el impacto; por ejemplo, mejoras tecnológicas que aumentan la eficiencia o reducen emisiones por unidad de PIB. En los resultados históricos de España, generalmente las primeras fases muestran que población y renta generan aumentos de impacto, mientras que en periodos posteriores la tecnología toma valores negativos, reflejando desacoplamiento parcial y mejoras de eficiencia. La visualización puede presentarse en cascada, logarítmica o aditiva, y permite comparar la contribución relativa de cada componente. Para más detalles sobre las series y cálculos, consultar la sección de datos, incluyendo paneles específicos de cada indicador.",
    referencias: [
      "Ang, B. W. (2015). LMDI decomposition approach: A guide for implementation. Energy Policy, 86, 233-238.",
      "Bolt, J., & van Zanden, J. L. (2020). The Maddison Project. Retrieved October 14, 2019.",
      "Friedlingstein, P., Jones, M. W., O'Sullivan, M., Andrew, R. M., Bakker, D. C., Hauck, J., ... & Zeng, J. (2022). Global carbon budget 2021. Earth System Science Data, 14(4), 1917-2005.",
      "Gütschow, J., & Pflüger, M. (2022). The PRIMAP-hist national historical emissions time series (1750-2021) v2.4.",
      "Hurtt, G. C., Chini, L., Sahajpal, R., Frolking, S., Bodirsky, B. L., Calvin, K., ... & Zhang, X. (2020). Harmonization of global land-use change and management for the period 850-2100 (LUH2) for CMIP6. Geoscientific Model Development, 13(11), 5425-5464.",
      "Krausmann, F., Gingrich, S., Eisenmenger, N., Erb, K. H., Haberl, H., & Fischer-Kowalski, M. (2009). Growth in global materials use, GDP and population during the 20th century. Ecological Economics, 68(10), 2696-2705.",
      "Malanima, P. (2022). World Energy Consumption: A Database 1820-2020. Center for History and Economics.",
      "Prados de La Escosura, L. (2022). Human Development and the Path to Freedom: 1870 to the Present. Cambridge University Press.",
      "Smil, V. (2004). The world's greatest fix: A history of nitrogen in agriculture. Nature, 431, 909-910."
    ],
    actualizacion: "Marzo 2026"
  },
  desacoplamiento: {
    titulo: "Desacoplamiento — Tapio",
    datos: "Clasificación de desacoplamiento basada en Tapio. El visor compara la tasa de cambio de un indicador ambiental con la tasa de cambio del PIB o de la variable económica seleccionada en ventanas móviles. Cada punto resume un periodo: su posición indica cuánto crece o cae el impacto y cuánto crece o cae la economía.",
    fuentes: "El método sigue la elasticidad de Tapio (2005): variación relativa del impacto dividida por variación relativa del PIB. Las series ambientales proceden de CAHE y las series de PIB del proyecto Maddison. Las ventanas móviles permiten comparar periodos históricos equivalentes, pero no sustituyen a una explicación causal.",
    interpretacion: "El desacoplamiento fuerte aparece cuando la economía crece y el impacto cae. El desacoplamiento débil aparece cuando ambos crecen, pero el impacto crece más despacio que la economía. El acoplamiento indica crecimientos similares y el acoplamiento expansivo señala que el impacto aumenta proporcionalmente más. En periodos de recesión, la lectura cambia: una caída simultánea de PIB e impacto no equivale a una mejora estructural. Por eso los colores separan crecimiento, recesión y desacoplamiento, y conviene leerlos junto con el periodo seleccionado.",
    actualizacion: "Marzo 2026"
  },
};

const COLOR_SPAIN = "#1e6091";
const COLOR_WORLD = "#e63946";
const FALLBACK_PALETTE = ["#c93324","#3a6d8a","#6f7a3d","#c79a3b","#8b5a3c","#4f8a64","#a44c2c","#5e6871","#2c5d3e","#e6892b"];
const INDICATOR_STYLES = {
  energia: {
    typeOrder: ["Carb\u00f3n","Petr\u00f3leo","Gas","Electricidad","Hidr\u00e1ulica y e\u00f3lica","Le\u00f1a","Alimentos y forraje","Total"],
    colorMap: {
      "Carb\u00f3n":"#0d1b2a",
      "Petr\u00f3leo":"#415a77",
      "Gas":"#778da9",
      "Electricidad":"#81b29a",
      "Hidr\u00e1ulica y e\u00f3lica":"#219ebc",
      "Le\u00f1a":"#ffc971",
      "Alimentos y forraje":"#fe7f2d",
      "Total":"#000000",
    },
  },
  emisiones: {
    tipo2Order: ["Total","Por gas","Por actividad","CO\u2082 por fuente","Fuente original"],
    typeOrder: ["Total","CO\u2082","CH\u2084","N\u2082O","F-gases y otros","Bio / AFOLU","Energ\u00eda e industria","Total CO\u2082","Uso del suelo","Carb\u00f3n","Petr\u00f3leo","Gas","CO\u2082 uso del suelo","CH\u2084 Bio","N\u2082O Bio","CH\u2084 energ\u00eda/industria","N\u2082O energ\u00eda/industria","CO\u2082 f\u00f3siles","Otros"],
    colorMap: {
      "Total":"#000000",
      "Total GEI":"#000000",
      "Total CO\u2082":"#000000",
      "CO\u2082":"#1b263b",
      "CH\u2084":"#e76f51",
      "N\u2082O":"#f4a261",
      "F-gases y otros":"#dee2e6",
      "Bio / AFOLU":"#84a98c",
      "Energ\u00eda e industria":"#415a77",
      "Uso del suelo":"#84a98c",
      "Carb\u00f3n":"#0d1b2a",
      "Petr\u00f3leo":"#99582a",
      "Gas":"#778da9",
      "Cemento":"#696969",
      "Quema de gas":"#ff6347",
      "CO\u2082 uso del suelo":"#84a98c",
      "CH\u2084 Bio":"#e76f51",
      "N\u2082O Bio":"#f4a261",
      "CH\u2084 energ\u00eda/industria":"#415a77",
      "N\u2082O energ\u00eda/industria":"#778da9",
      "CO\u2082 f\u00f3siles":"#1b263b",
      "Otros":"#dee2e6",
    },
  },
  materiales: {
    tipo2Order: ["Consumo aparente","Extracci\u00f3n","Importaciones","Exportaciones"],
    typeOrder: ["Biomasa","Materiales f\u00f3siles","Minerales met\u00e1licos","Minerales no met\u00e1licos","Total"],
    colorMap: {
      "Biomasa":"#f4a261",
      "Materiales f\u00f3siles":"#1b263b",
      "Minerales met\u00e1licos":"#d62828",
      "Minerales no met\u00e1licos":"#aec3b0",
      "Total":"#000000",
    },
  },
  tierra: {
    typeOrder: ["Total","Cultivo herb\u00e1ceo","Cultivo le\u00f1oso","Pastizal y matorral","Dehesa","Monte bajo","Monte alto","Otros"],
    colorMap: {
      "Otros":"#6f1d1b",
      "Monte alto":"#344e41",
      "Monte bajo":"#588157",
      "Dehesa":"#dad7cd",
      "Pastizal y matorral":"#bb9457",
      "Cultivo le\u00f1oso":"#0a9396",
      "Cultivo herb\u00e1ceo":"#e9c46a",
      "Total":"#000000",
    },
  },
  bosques: {
    tipo2Order: ["Superficie","Stock de C","Densidad de C"],
    typeOrder: ["Monte abierto","Monte alto","Monte bajo","Total"],
    colorMap: {
      "Monte abierto":"#dad7cd",
      "Monte alto":"#344e41",
      "Monte bajo":"#588157",
      "Total":"#000000",
    },
  },
  cultivos: {
    typeOrder: ["Barbecho","Cereales y granos","Olivos","Frutas y frutos secos","Hortalizas y tub\u00e9rculos","Industriales y otros","Total"],
    colorMap: {
      "Barbecho":"#deb887",
      "Cereales y granos":"#ffd700",
      "Olivos":"#6a994e",
      "Frutas y frutos secos":"#f2e8cf",
      "Hortalizas y tub\u00e9rculos":"#bc4749",
      "Industriales y otros":"#590d22",
      "Total":"#000000",
    },
  },
  industria: {
    typeOrder: ["Total","Alimentaci\u00f3n","Textil y cuero","Madera","Pasta, papel y cart\u00f3n","Qu\u00edmica y petroqu\u00edmica","Minerales no met\u00e1licos y construcci\u00f3n","Cemento, cal y yeso","Ladrillos, piedra y vidrio","Metalurgia","Siderurgia","Metales no f\u00e9rreos","Maquinaria y bienes met\u00e1licos","Bienes de equipo","Material de transporte","Bienes de consumo","Otras industrias"],
    flowOrder: ["Total","Carb\u00f3n","Petr\u00f3leo","Gas","Electricidad","Biomasa","Le\u00f1a","Coque","Coque de petr\u00f3leo","Coque y gases manufacturados","Fuel\u00f3leo","Gas\u00f3leo","Gasolina","GLP","Otros carbones","Hidr\u00e1ulica","Hidr\u00e1ulica directa","E\u00f3lica","Nuclear","Solar"],
    colorMap: {
      "Total":"#000000",
      "Alimentaci\u00f3n":"#27ae60",
      "Textil y cuero":"#e67e22",
      "Madera":"#95a5a6",
      "Pasta, papel y cart\u00f3n":"#3498db",
      "Qu\u00edmica y petroqu\u00edmica":"#9b59b6",
      "Minerales no met\u00e1licos y construcci\u00f3n":"#16a085",
      "Cemento, cal y yeso":"#696969",
      "Ladrillos, piedra y vidrio":"#11806a",
      "Metalurgia":"#c0392b",
      "Siderurgia":"#e74c3c",
      "Metales no f\u00e9rreos":"#f39c12",
      "Maquinaria y bienes met\u00e1licos":"#607d8b",
      "Bienes de equipo":"#546a7b",
      "Material de transporte":"#7f8c8d",
      "Bienes de consumo":"#a569bd",
      "Otras industrias":"#34495e",
    },
  },
};
const TAPIO_META = {
  AD: { label: "Absolute decoupling", color: "#2a9d8f" },
  WD: { label: "Weak decoupling", color: "#8ecae6" },
  CG: { label: "Coupling growth", color: "#f4a261" },
  DG: { label: "Divergent growth", color: "#e76f51" },
  RE: { label: "Recessive", color: "#6c757d" },
  DR: { label: "Decoupling recessive", color: "#606c38" },
  ND: { label: "No data", color: "#dee2e6" },
};
const TAPIO_ORDER = ["AD","WD","CG","DG","RE","DR"];

let DATA_LONG = null;
let DATA_ANALYSIS = null;
let PUBLICATIONS_DB = null;
const dataCache = new Map();
let GEO = null;

function versionedLocalUrl(url){
  if(!url || /^(https?:)?\/\//.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}v=${APP_VERSION}`;
}
async function loadJson(url){
  const key = `${url}::${APP_VERSION}`;
  if(!dataCache.has(key)){
    dataCache.set(key, fetch(versionedLocalUrl(url)).then(r => r.ok ? r.json() : Promise.reject(r.status)).catch(() => null));
  }
  return dataCache.get(key);
}
async function loadPublications(){
  if(!PUBLICATIONS_DB){
    PUBLICATIONS_DB = await loadJson("data/publications.json") || { tagMeta: {}, items: [] };
  }
  return PUBLICATIONS_DB;
}
async function loadGlobalData(){
  if(!DATA_LONG){
    DATA_LONG = await d3.csv(`${V1_RAW}/web_todos_long_csv.csv`, d => ({
      year: +d.year, area: d.area, indicador: d.indicador, variable: d.variable,
      valor: d.valor === "NA" ? null : +d.valor, variable_unidad: d.variable_unidad,
    })).catch(() => []);
  }
  if(!DATA_ANALYSIS){
    DATA_ANALYSIS = await d3.csv(`${V1_RAW}/web_todos_analysis_csv.csv`, d => {
      const o = { year: +d.year, area: d.area, variable: d.variable };
      INDICATORS_WITH_GDP.forEach(k => { o[k] = d[k] === "NA" ? null : +d[k]; });
      return o;
    }).catch(() => []);
  }
}

const VIZ_ALIASES = { "emisiones-gei": "emisiones", "emisiones-co2": "emisiones" };
function resolveVizId(id){ return VIZ_ALIASES[id] || id; }

function slugId(value){
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sourceSeries(data, tipo, variable){
  return data?.series?.find(s => s.tipo === tipo && s.variable === variable) || null;
}

function sumSeriesValues(seriesList, length){
  return Array.from({ length }, (_, i) => {
    let sum = 0, seen = false;
    seriesList.forEach(s => {
      const value = s?.values?.[i];
      if(value != null && Number.isFinite(value)){
        sum += value;
        seen = true;
      }
    });
    return seen ? sum : null;
  });
}

function indexFromAbsolute(values){
  const base = values.find(v => v != null && Number.isFinite(v) && v !== 0);
  return base ? values.map(v => v == null || !Number.isFinite(v) ? null : v / base) : values.map(() => null);
}

function plainKey(value){
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isIndexVariable(variable){
  return plainKey(variable) === "indice";
}

function absoluteVariableName(data){
  return (data?.variables || []).find(v => String(v || "").startsWith("Absoluto")) || null;
}

function sameSeriesIdentity(a, b){
  return a && b && a.tipo === b.tipo && (a.tipo2 || null) === (b.tipo2 || null);
}

function rebaseIndexSeriesForRange(data, series, years, start, end){
  if(!isIndexVariable(state.ind_variable)) return series;
  const absoluteVariable = absoluteVariableName(data);
  if(!absoluteVariable) return series;
  return series.map(s => {
    const abs = (data.series || []).find(candidate =>
      candidate.variable === absoluteVariable && sameSeriesIdentity(candidate, s)
    );
    if(!abs?.values?.length) return s;
    const baseIndex = years.findIndex((year, i) => {
      const value = abs.values[i];
      return year >= start && year <= end && value != null && Number.isFinite(value) && value !== 0;
    });
    if(baseIndex < 0) return s;
    const base = abs.values[baseIndex];
    const baseYear = years[baseIndex];
    return {
      ...s,
      unit: "Índice",
      variableUnit: `Índice (${baseYear} = 1)`,
      values: abs.values.map(value => value == null || !Number.isFinite(value) ? null : value / base)
    };
  });
}

function cloneEmissionSeries(series, tipo, tipo2, color){
  if(!series) return null;
  return {
    ...series,
    id: `emisiones-${slugId(tipo2)}-${slugId(tipo)}-${slugId(series.variable)}`,
    tipo,
    tipo2,
    color,
    values: (series.values || []).slice(),
  };
}

function buildEmissionComponentSeries(source, config, variables, years, denominatorAbs){
  const { tipo, tipo2, components, color } = config;
  const absSources = components.map(component => sourceSeries(source, component, "Absoluto")).filter(Boolean);
  const absValues = sumSeriesValues(absSources, years.length);
  return variables.map(variable => {
    let values = null;
    let template = components.map(component => sourceSeries(source, component, variable)).find(Boolean);
    if(variable === "Índice"){
      values = indexFromAbsolute(absValues);
      template = template || components.map(component => sourceSeries(source, component, "Absoluto")).find(Boolean);
    }else{
      const pieces = components.map(component => sourceSeries(source, component, variable)).filter(Boolean);
      if(pieces.length) values = sumSeriesValues(pieces, years.length);
      else if(variable === "Intensidad" && denominatorAbs?.length){
        const totalIntensity = sourceSeries(source, "Total", "Intensidad");
        values = absValues.map((value, i) => {
          const denom = denominatorAbs[i], total = totalIntensity?.values?.[i];
          return value != null && denom && total != null && Number.isFinite(value) && Number.isFinite(denom) && Number.isFinite(total)
            ? value / denom * total
            : null;
        });
        template = totalIntensity || template;
      }
    }
    if(!values || !values.some(v => v != null && Number.isFinite(v))) return null;
    const variableUnit = variable === "Índice"
      ? `Índice (${years[0]} = 1)`
      : (template?.variableUnit || template?.unit || variable);
    const unit = variable === "Índice" ? "Índice" : (template?.unit || variableUnit);
    return {
      id: `emisiones-${slugId(tipo2)}-${slugId(tipo)}-${slugId(variable)}`,
      tipo,
      tipo2,
      variable,
      unit,
      variableUnit,
      color,
      values,
    };
  }).filter(Boolean);
}

function buildUnifiedEmissionsDataset(datasets, item){
  const gei = datasets.find(d => d?.id === "emisiones-gei") || datasets[0];
  const co2 = datasets.find(d => d?.id === "emisiones-co2") || datasets[1];
  if(!gei) return null;
  const years = gei.years || co2?.years || [];
  const variables = gei.variables || co2?.variables || [];
  const color = key => itemColorMap(item)[key] || colorFor(key);
  const geiTotalAbs = sourceSeries(gei, "Total", "Absoluto")?.values || [];
  const co2TotalAbs = sourceSeries(co2, "Total", "Absoluto")?.values || [];
  const series = [];

  variables.forEach(variable => {
    const total = cloneEmissionSeries(sourceSeries(gei, "Total", variable), "Total", "Total", color("Total"));
    if(total) series.push(total);
  });

  const gasGroups = [
    { tipo: "CO₂", tipo2: "Por gas", components: ["CO₂ fósiles", "CO₂ uso del suelo"], color: color("CO₂") },
    { tipo: "CH₄", tipo2: "Por gas", components: ["CH₄ Bio", "CH₄ energía/industria"], color: color("CH₄") },
    { tipo: "N₂O", tipo2: "Por gas", components: ["N₂O Bio", "N₂O energía/industria"], color: color("N₂O") },
    { tipo: "F-gases y otros", tipo2: "Por gas", components: ["Otros"], color: color("F-gases y otros") },
  ];
  const activityGroups = [
    { tipo: "Bio / AFOLU", tipo2: "Por actividad", components: ["CH₄ Bio", "N₂O Bio", "CO₂ uso del suelo"], color: color("Bio / AFOLU") },
    { tipo: "Energía e industria", tipo2: "Por actividad", components: ["CH₄ energía/industria", "N₂O energía/industria", "CO₂ fósiles"], color: color("Energía e industria") },
    { tipo: "F-gases y otros", tipo2: "Por actividad", components: ["Otros"], color: color("F-gases y otros") },
  ];
  [...gasGroups, ...activityGroups].forEach(group => {
    variables.forEach(variable => {
      const built = buildEmissionComponentSeries(gei, group, [variable], years, geiTotalAbs);
      series.push(...built);
    });
  });

  if(co2){
    variables.forEach(variable => {
      const totalCo2 = cloneEmissionSeries(sourceSeries(co2, "Total", variable), "Total CO₂", "CO₂ por fuente", color("Total CO₂"));
      if(totalCo2) series.push(totalCo2);
    });
    ["Carbón", "Gas", "Petróleo", "Uso del suelo"].forEach(tipo => {
      variables.forEach(variable => {
        series.push(...buildEmissionComponentSeries(co2, {
          tipo,
          tipo2: "CO₂ por fuente",
          components: [tipo],
          color: color(tipo),
        }, [variable], co2.years || years, co2TotalAbs));
      });
    });
  }

  (gei.tipos || []).forEach(tipo => {
    variables.forEach(variable => {
      const original = cloneEmissionSeries(sourceSeries(gei, tipo, variable), tipo, "Fuente original", color(tipo));
      if(original) series.push(original);
    });
  });

  const tipo2s = ["Total", "Por gas", "Por actividad", "CO₂ por fuente", "Fuente original"]
    .filter(tipo2 => series.some(s => s.tipo2 === tipo2));
  const tipos = Array.from(new Set(series.map(s => s.tipo)));
  return {
    ...gei,
    id: "emisiones",
    label: "Emisiones",
    description: item?.desc || gei.description || "",
    years,
    variables,
    defaultVariable: gei.defaultVariable || "Absoluto",
    tipos,
    tipo2s,
    defaultTipo2: "Por gas",
    series,
    sourceIds: datasets.map(d => d?.id).filter(Boolean),
  };
}

async function loadIndicatorDataset(item){
  let data = null;
  if(item?.dataSources?.length){
    const datasets = await Promise.all(item.dataSources.map(slug => loadJson(`data/national/${slug}.json`)));
    data = buildUnifiedEmissionsDataset(datasets.filter(Boolean), item);
  }else{
    data = await loadJson(`data/national/${item.dataSlug}.json`);
  }
  return applyItemDatasetStyle(data, item);
}
function indicatorStyle(item){
  return INDICATOR_STYLES[item?.id] || {};
}

function itemColorMap(item){
  return { ...(item?.colorMap || {}), ...(indicatorStyle(item).colorMap || {}) };
}

function orderRank(value, preferred){
  const idx = preferred.indexOf(value);
  return idx === -1 ? Number.POSITIVE_INFINITY : idx;
}

function compareByPreferred(a, b, preferred, ai = 0, bi = 0){
  const ra = orderRank(a, preferred);
  const rb = orderRank(b, preferred);
  if(ra !== rb) return ra - rb;
  return ai - bi;
}

function orderValues(values = [], preferred = []){
  if(!preferred?.length) return values.slice();
  return values.map((value, i) => ({ value, i }))
    .sort((a, b) => compareByPreferred(a.value, b.value, preferred, a.i, b.i))
    .map(d => d.value);
}

function orderCompoundValues(values = [], preferredHeads = [], preferredTails = []){
  let ordered = orderValues(values, preferredHeads);
  if(!preferredTails?.length) return ordered;
  const firstHeadIndex = new Map();
  ordered.forEach((value, i) => {
    const head = splitCompoundOption(value).head;
    if(!firstHeadIndex.has(head)) firstHeadIndex.set(head, i);
  });
  return ordered.map((value, i) => ({ value, i, parts: splitCompoundOption(value) }))
    .sort((a, b) => {
      const headDelta = (firstHeadIndex.get(a.parts.head) ?? a.i) - (firstHeadIndex.get(b.parts.head) ?? b.i);
      if(headDelta) return headDelta;
      return compareByPreferred(a.parts.tail, b.parts.tail, preferredTails, a.i, b.i);
    })
    .map(d => d.value);
}

function styleSeriesSortDelta(a, b, style, ai = 0, bi = 0){
  const tipo2Order = style.tipo2Order || [];
  const flowOrder = style.flowOrder || [];
  if(tipo2Order.length || flowOrder.length){
    const pa = splitCompoundOption(a.tipo2);
    const pb = splitCompoundOption(b.tipo2);
    if(tipo2Order.length && pa.head !== pb.head){
      const headDelta = compareByPreferred(pa.head, pb.head, tipo2Order, ai, bi);
      if(headDelta) return headDelta;
    }else if(pa.head !== pb.head){
      return ai - bi;
    }
    if(flowOrder.length && pa.tail !== pb.tail){
      const tailDelta = compareByPreferred(pa.tail, pb.tail, flowOrder, ai, bi);
      if(tailDelta) return tailDelta;
    }
  }
  const typeDelta = compareByPreferred(a.tipo, b.tipo, style.typeOrder || [], ai, bi);
  if(typeDelta) return typeDelta;
  return ai - bi;
}

function applyItemDatasetStyle(data, item){
  if(!data) return data;
  const style = indicatorStyle(item);
  const colorMap = itemColorMap(item);
  const styled = { ...data };
  if(Array.isArray(data.tipos)) styled.tipos = orderValues(data.tipos, style.typeOrder || []);
  if(Array.isArray(data.tipo2s)){
    styled.tipo2s = orderCompoundValues(data.tipo2s, style.tipo2Order || [], style.flowOrder || []);
  }
  if(Array.isArray(data.series)){
    styled.series = data.series.map((series, i) => ({
      ...series,
      _sourceIndex: i,
      color: colorMap[series.tipo] || series.color,
    })).sort((a, b) => styleSeriesSortDelta(a, b, style, a._sourceIndex, b._sourceIndex))
      .map(({ _sourceIndex, ...series }) => series);
  }
  return styled;
}

const INDICATORS = ["Emisiones de CO₂","Emisiones GEI","Energía","Materiales","Tierras de cultivo","Agua","Nitrógeno"];
const INDICATORS_WITH_GDP = ["PIB","Población","IDH","IDH-A", ...INDICATORS];
const VARIABLES_G = ["Absoluto","Per cápita","Intensidad"];
const TREND_VARIABLE_ORDER = ["Absoluto","Per cápita","Intensidad","Acumulado","Acumulado per cápita","Tasa anual","Índice"];

function colorFor(key, idx = 0, customMap = null){
  if(customMap && customMap[key]) return customMap[key];
  if(!key) return FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];
  let h = 0;
  for(let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) & 0xffffffff;
  return FALLBACK_PALETTE[Math.abs(h) % FALLBACK_PALETTE.length];
}
function seriesColor(series, idx = 0, item = null){
  const colorMap = itemColorMap(item);
  return colorMap[series?.tipo] || series?.color || colorFor(series?.tipo, idx, colorMap);
}
function typeColorFromData(data, tipo, item = null){
  const series = data?.series?.find(s => s.tipo === tipo && s.color) || null;
  return seriesColor(series || { tipo }, 0, item);
}
function normalizedUnitParts(unit = ""){
  const raw = String(unit || "").trim();
  if(!raw) return { value: "", label: "" };
  const paren = raw.match(/\(([^()]+)\)\s*$/);
  const prefix = paren ? raw.slice(0, raw.lastIndexOf("(")).trim().replace(/\s+/g, " ") : raw;
  const metricPrefix = /^(Absolutos?|Porcentaje|Percentage|Share|Per cápita|Per capita|Intensidad|Intensity|Acumulado(?:\s+(?:p\.c\.?|per cápita))?|Accumulated(?:\s+p\.c\.?)?|Tasa anual|Annual rate)$/i;
  if(paren && metricPrefix.test(prefix)){
    const token = paren[1].trim();
    return { value: token, label: `(${token})` };
  }
  return { value: raw, label: raw };
}
function valueUnit(unit = ""){
  return normalizedUnitParts(unit).value;
}
function displayUnitLabel(unit = ""){
  return normalizedUnitParts(unit).label;
}
function fmt(v, u = ""){
  if(v == null || !Number.isFinite(v)) return "s/d";
  const a = Math.abs(v);
  let out;
  if(a >= 1e9) out = d3.format(".2s")(v).replace("G","B");
  else if(a >= 1e6) out = d3.format(".3s")(v);
  else if(a >= 1000) out = d3.format(",.0f")(v);
  else if(a >= 10) out = d3.format(",.1f")(v);
  else out = d3.format(",.2f")(v);
  const unit = valueUnit(u);
  return unit ? `${out} ${unit}` : out;
}
function escAttr(v){ return String(v ?? "").replace(/"/g, "&quot;"); }
function escHtml(v){
  return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;" }[c]));
}
function compact(t, max = 30){ const v = String(t || ""); return v.length > max ? v.slice(0, max - 1) + "…" : v; }
function shortSeriesName(value){
  const raw = String(value || "");
  if(!isCompactViewport()) return raw;
  const replacements = [
    [/minerales no met/i, "Min. no met."],
    [/minerales met/i, "Min. met."],
    [/materiales f/i, "Mat. fósiles"],
    [/biomasa/i, "Biomasa"],
    [/alimentos/i, "Alim. y forraje"],
    [/hid/i, "Hidr. y eólica"],
    [/electricidad/i, "Electricidad"],
    [/pet/i, "Petróleo"],
    [/carb/i, "Carbón"],
    [/uso del suelo/i, "Uso suelo"],
    [/energ/i, "Energía"],
    [/industr/i, "Industria"],
    [/monte abierto/i, "Monte abierto"],
    [/monte alto/i, "Monte alto"],
    [/monte bajo/i, "Monte bajo"],
  ];
  for(const [pattern, label] of replacements){
    if(pattern.test(raw)) return label;
  }
  return raw;
}
function endLabelText(value, max = 30){
  return compact(shortSeriesName(value), max);
}
function endLabelLines(text){
  const value = String(text || "");
  if(!isCompactViewport() || value.length <= 13) return [value];
  if(value.includes(" y ")){
    const [first, ...rest] = value.split(" y ");
    return [first.trim(), `y ${rest.join(" y ").trim()}`].filter(Boolean);
  }
  const parts = value.split(/\s+/);
  if(parts.length < 2) return [value];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")].filter(Boolean);
}
function appendEndLabel(g, lbl){
  const lines = lbl.lines || endLabelLines(lbl.text);
  const text = g.append("text").attr("class","series-end-label")
    .attr("x", lbl.x).attr("y", lbl.y).attr("dominant-baseline","middle")
    .attr("fill", lbl.color);
  if(lines.length <= 1){
    text.text(lbl.text);
  }else{
    lines.forEach((line, i) => text.append("tspan")
      .attr("x", lbl.x)
      .attr("dy", i === 0 ? "-0.35em" : "1.1em")
      .text(line));
  }
}
function tooltipHtml(title, rows){
  return `<div class="t-title">${title}</div>` + rows.map(([label, value]) =>
    `<div class="t-row"><span class="t-label">${label}</span><span class="t-val">${value}</span></div>`
  ).join("");
}
function showTooltip(event, title, rows){
  if(!els.tooltip) return;
  els.tooltip.innerHTML = tooltipHtml(title, rows);
  moveTooltip(event);
  els.tooltip.classList.add("visible");
}
function moveTooltip(event){
  if(!els.tooltip) return;
  els.tooltip.style.left = `${event.clientX + 14}px`;
  els.tooltip.style.top = `${event.clientY + 14}px`;
}
function hideTooltip(){
  els.tooltip?.classList.remove("visible");
}
function adjustEndLabels(labels, height, minDistance = 15){
  if(labels.length < 2) return labels;
  const minY = 8;
  const maxY = Math.max(minY, height - 8);
  const sorted = labels.slice().sort((a, b) => a.y - b.y);
  sorted.forEach(d => { d.y = Math.max(minY, Math.min(maxY, d.y)); });
  for(let i = 1; i < sorted.length; i++){
    if(sorted[i].y - sorted[i - 1].y < minDistance) sorted[i].y = sorted[i - 1].y + minDistance;
  }
  for(let i = sorted.length - 1; i >= 0; i--){
    if(sorted[i].y > maxY) sorted[i].y = maxY;
    if(i > 0 && sorted[i].y - sorted[i - 1].y < minDistance) sorted[i - 1].y = sorted[i].y - minDistance;
  }
  sorted.forEach(d => { d.y = Math.max(minY, Math.min(maxY, d.y)); });
  return sorted;
}

function drawActiveYearMarker(g, xScale, year, innerW, innerH){
  const xPos = xScale(year);
  const labelX = Math.min(innerW - 4, Math.max(32, xPos - 7));
  g.append("line")
    .attr("class","active-year-line")
    .attr("x1", xPos).attr("x2", xPos)
    .attr("y1", 0).attr("y2", innerH);
  g.append("text")
    .attr("class","year-active-label")
    .attr("x", labelX).attr("y", 16)
    .attr("text-anchor","end")
    .text(year);
}

function raiseActiveYearLabel(g){
  g.selectAll(".year-active-label").raise();
}

function protectActiveYearLabel(labels, yearX, innerW, minY = 52){
  if(yearX < innerW - 90) return labels;
  labels.forEach(lbl => {
    const nearActiveYear = lbl.x > innerW - 118 || Math.abs(lbl.x - yearX) < 92;
    if(nearActiveYear && lbl.y < minY) lbl.y = minY;
  });
  return labels;
}

function smartYearTicks(xScale, width, approx = 8, minPx = 58){
  const domain = xScale.domain().map(Number);
  const min = Math.round(domain[0]);
  const max = Math.round(domain[1]);
  const baseTicks = xScale.ticks(approx).map(d => Math.round(d));
  const candidates = Array.from(new Set([min, ...baseTicks, max]))
    .filter(d => Number.isFinite(d) && d >= min && d <= max)
    .sort((a, b) => a - b);
  const out = [];
  candidates.forEach(t => {
    const px = xScale(t);
    const last = out.at(-1);
    if(last != null && Math.abs(px - xScale(last)) < minPx){
      if(t === max) out[out.length - 1] = t;
      return;
    }
    out.push(t);
  });
  if(!out.includes(max)){
    while(out.length && Math.abs(xScale(max) - xScale(out.at(-1))) < minPx) out.pop();
    out.push(max);
  }
  return out;
}

function classifyTapio(gdpGrowth, impactGrowth){
  if(!Number.isFinite(gdpGrowth) || !Number.isFinite(impactGrowth)) return "ND";
  if(gdpGrowth === 0 && impactGrowth === 0) return "ND";
  const elasticity = gdpGrowth !== 0 ? impactGrowth / gdpGrowth : null;
  if(gdpGrowth > 0 && impactGrowth < 0) return "AD";
  if(gdpGrowth > 0 && impactGrowth >= 0){
    if(elasticity != null && elasticity < 0.8) return "WD";
    if(elasticity != null && elasticity <= 1.2) return "CG";
    return "DG";
  }
  if(gdpGrowth < 0 && impactGrowth <= 0){
    if(elasticity != null && elasticity > 1.2) return "DR";
    return "RE";
  }
  return "DG";
}

function layoutTopAnnotations(items, width, startY = 18, rowHeight = 15, gap = 12){
  const rows = [];
  return items
    .slice()
    .sort((a, b) => a.x - b.x || a.text.length - b.text.length)
    .map(item => {
      const textWidth = Math.max(46, item.text.length * 5.6);
      const x = Math.max(textWidth / 2 + 2, Math.min(width - textWidth / 2 - 2, item.x));
      const left = x - textWidth / 2;
      const right = x + textWidth / 2;
      let rowIndex = rows.findIndex(rowRight => left > rowRight + gap);
      if(rowIndex === -1){
        rowIndex = rows.length;
        rows.push(right);
      }else{
        rows[rowIndex] = right;
      }
      return { ...item, x, y: startY + rowIndex * rowHeight };
    });
}

function globalVariableOptions(indicador){
  const vars = new Set(DATA_LONG.filter(r => r.indicador === indicador).map(r => r.variable));
  if(vars.has("Absoluto")){
    vars.add("Tasa anual");
    vars.add("Índice");
  }
  return TREND_VARIABLE_ORDER.filter(v => vars.has(v));
}

function normalizeAreaLabel(area){
  return area === "Spain" ? "España" : area;
}

function getTrendSeries(indicador, variable, area, baseStartYear = null){
  if(variable === "Tasa anual" || variable === "Índice"){
    const base = getSeries(indicador, "Absoluto", area);
    if(variable === "Índice"){
      const first = base.find(d =>
        (baseStartYear == null || d.year >= baseStartYear) &&
        d.valor != null && Number.isFinite(d.valor) && d.valor !== 0
      );
      const baseValue = first?.valor;
      return baseValue ? base.map(d => ({
        ...d,
        variable,
        valor: d.valor == null ? null : d.valor / baseValue * 100,
        variable_unidad: `Índice (${first.year}=100)`
      })) : [];
    }
    return base.map((d, idx) => {
      const prev = idx > 0 ? base[idx - 1] : null;
      const valid = prev && prev.valor != null && d.valor != null && Number.isFinite(prev.valor) && Number.isFinite(d.valor) && prev.valor !== 0;
      return {
        ...d,
        variable,
        valor: valid ? (d.valor / prev.valor - 1) * 100 : null,
        variable_unidad: "Tasa anual (%)"
      };
    }).filter(d => d.valor != null && Number.isFinite(d.valor));
  }
  return getSeries(indicador, variable, area);
}

function movingAverageData(data, windowSize){
  const w = +windowSize;
  if(!w || w < 2) return data;
  const half = Math.floor(w / 2);
  return data.map((d, i) => {
    const slice = data.slice(Math.max(0, i - half), Math.min(data.length, i + half + 1))
      .filter(p => p.valor != null && Number.isFinite(p.valor));
    return { ...d, valor: slice.length ? d3.mean(slice, p => p.valor) : null };
  });
}

function linearRegression(data, valueKey = "valor"){
  const pts = data.filter(d => d[valueKey] != null && Number.isFinite(d[valueKey]));
  if(pts.length < 2) return null;
  const n = pts.length;
  const sumX = d3.sum(pts, d => d.year);
  const sumY = d3.sum(pts, d => d[valueKey]);
  const sumXY = d3.sum(pts, d => d.year * d[valueKey]);
  const sumX2 = d3.sum(pts, d => d.year * d.year);
  const denom = n * sumX2 - sumX * sumX;
  if(denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const meanY = sumY / n;
  const ssTotal = d3.sum(pts, d => Math.pow(d[valueKey] - meanY, 2));
  const ssResidual = d3.sum(pts, d => Math.pow(d[valueKey] - (slope * d.year + intercept), 2));
  return { slope, intercept, r2: ssTotal > 0 ? 1 - ssResidual / ssTotal : 0 };
}

function rewindGeometry(geometry){
  if(!geometry) return geometry;
  if(geometry.type === "Polygon"){
    geometry.coordinates.forEach(ring => ring.reverse());
  } else if(geometry.type === "MultiPolygon"){
    geometry.coordinates.forEach(poly => poly.forEach(ring => ring.reverse()));
  }
  return geometry;
}

function prepareGeo(geo){
  if(!geo || geo.__caheRewound) return geo;
  geo.features?.forEach(f => rewindGeometry(f.geometry));
  geo.__caheRewound = true;
  return geo;
}

function clearIndicatorTimer(){
  window.__playTimerToken = (window.__playTimerToken || 0) + 1;
  if(window.__playTimer){
    clearInterval(window.__playTimer);
    window.__playTimer = null;
  }
}

function stopIndicatorPlayback(){
  state.playing = false;
  clearIndicatorTimer();
  document.querySelectorAll("#play-btn").forEach(btn => setPlayButtonState(btn, false));
}

function stopGlobalPlayback(){
  state.globalPlaying = false;
  clearGlobalTimer();
  document.querySelectorAll("#global-play").forEach(btn => setPlayButtonState(btn, false));
}

function stopPlayback(){
  stopIndicatorPlayback();
  stopGlobalPlayback();
}

function timelineDelay(speed){
  return Math.max(45, 360 / Math.max(1, speed || 1));
}

function nearestTimelineYear(years, value){
  if(!years.length) return value;
  const y = +value;
  if(y <= years[0]) return years[0];
  if(y >= years.at(-1)) return years.at(-1);
  return years.reduce((best, cur) => Math.abs(cur - y) < Math.abs(best - y) ? cur : best, years[0]);
}

function timelineKeys(kind){
  return kind === "global"
    ? { start: "globalYearStart", end: "globalYearEnd", current: "globalYear" }
    : { start: "yearStart", end: "yearEnd", current: "year" };
}

function yearsWithinRange(years, start, end){
  return years.filter(y => y >= start && y <= end);
}

function getTimelineRange(kind, years){
  const keys = timelineKeys(kind);
  if(!years.length) return { min: null, max: null, start: null, end: null, years: [] };
  const min = years[0], max = years.at(-1);
  let start = state[keys.start] == null ? min : nearestTimelineYear(years, state[keys.start]);
  let end = state[keys.end] == null ? max : nearestTimelineYear(years, state[keys.end]);
  let startIdx = Math.max(0, years.indexOf(start));
  let endIdx = Math.max(0, years.indexOf(end));
  if(startIdx > endIdx) [startIdx, endIdx] = [endIdx, startIdx];
  if(startIdx === endIdx && years.length > 1){
    if(endIdx < years.length - 1) endIdx += 1;
    else startIdx -= 1;
  }
  start = years[Math.max(0, startIdx)];
  end = years[Math.min(years.length - 1, endIdx)];
  state[keys.start] = start;
  state[keys.end] = end;
  const activeYears = yearsWithinRange(years, start, end);
  if(activeYears.length){
    state[keys.current] = nearestTimelineYear(activeYears, state[keys.current] ?? end);
  }
  return { min, max, start, end, years: activeYears };
}

function setTimelineEndpoint(kind, years, side, rawYear){
  const keys = timelineKeys(kind);
  const range = getTimelineRange(kind, years);
  if(!years.length) return range;
  let startIdx = years.indexOf(range.start);
  let endIdx = years.indexOf(range.end);
  const targetIdx = Math.max(0, years.indexOf(nearestTimelineYear(years, rawYear)));
  if(side === "start"){
    startIdx = years.length > 1 ? Math.min(targetIdx, endIdx - 1) : targetIdx;
  }else{
    endIdx = years.length > 1 ? Math.max(targetIdx, startIdx + 1) : targetIdx;
  }
  state[keys.start] = years[Math.max(0, startIdx)];
  state[keys.end] = years[Math.min(years.length - 1, endIdx)];
  return getTimelineRange(kind, years);
}

function updateTimelineRangeUi(timeline, slider, years, kind){
  if(!timeline || !slider || !years.length) return;
  const range = getTimelineRange(kind, years);
  const denom = range.max - range.min || 1;
  const pct = y => Math.max(0, Math.min(100, ((y - range.min) / denom) * 100));
  const startPct = pct(range.start);
  const endPct = pct(range.end);
  const selection = timeline.querySelector("[data-range-selection]");
  if(selection){
    selection.style.left = `${startPct}%`;
    selection.style.width = `${Math.max(0, endPct - startPct)}%`;
  }
  timeline.querySelectorAll("[data-range-handle]").forEach(handle => {
    const side = handle.dataset.rangeHandle;
    const y = side === "start" ? range.start : range.end;
    const p = pct(y);
    handle.style.left = `${p}%`;
    handle.classList.toggle("edge-start", p < 3);
    handle.classList.toggle("edge-end", p > 97);
    handle.setAttribute("aria-valuemin", String(range.min));
    handle.setAttribute("aria-valuemax", String(range.max));
    handle.setAttribute("aria-valuenow", String(y));
    handle.setAttribute("title", state.lang === "en" ? `Drag to select ${side} year` : `Arrastra para seleccionar el año ${side === "start" ? "inicial" : "final"}`);
    const label = handle.querySelector(".timeline-handle-year");
    if(label) label.textContent = y;
  });
  const startLabel = timeline.querySelector(".timeline-start");
  const endLabel = timeline.querySelector(".timeline-end");
  if(startLabel) startLabel.textContent = range.start;
  if(endLabel) endLabel.textContent = range.end;
  updateTimelineBubble(timeline, slider, state[timelineKeys(kind).current]);
}

function yearFromTimelinePoint(track, years, clientX){
  const rect = track.getBoundingClientRect();
  const pct = rect.width ? Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) : 0;
  return years[0] + pct * (years.at(-1) - years[0]);
}

function bindTimelineRangeHandles(timeline, years, kind, onChange){
  const track = timeline?.querySelector(".timeline-track-wrap");
  if(!track || !years.length || timeline.__rangeHandlesBound) return;
  timeline.__rangeHandlesBound = true;
  let activeHandle = null;
  const slider = timeline.querySelector(".year-slider");
  function move(clientX){
    if(!activeHandle) return;
    stopPlayback();
    setTimelineEndpoint(kind, years, activeHandle.dataset.rangeHandle, yearFromTimelinePoint(track, years, clientX));
    updateTimelineRangeUi(timeline, slider, years, kind);
    onChange?.();
  }
  function onMove(event){ move(event.clientX); }
  function onUp(){
    if(activeHandle) activeHandle.classList.remove("dragging");
    activeHandle = null;
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onUp);
  }
  timeline.querySelectorAll("[data-range-handle]").forEach(handle => {
    handle.addEventListener("pointerdown", event => {
      event.preventDefault();
      activeHandle = handle;
      activeHandle.classList.add("dragging");
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp, { once: true });
      move(event.clientX);
    });
    handle.addEventListener("keydown", event => {
      const delta = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
      if(!delta) return;
      event.preventDefault();
      stopPlayback();
      const range = getTimelineRange(kind, years);
      const side = handle.dataset.rangeHandle;
      const current = side === "start" ? range.start : range.end;
      const idx = Math.max(0, years.indexOf(current));
      const next = years[Math.max(0, Math.min(years.length - 1, idx + delta))];
      setTimelineEndpoint(kind, years, side, next);
      updateTimelineRangeUi(timeline, slider, years, kind);
      onChange?.();
    });
  });
}

function setPlayButtonState(button, playing){
  if(!button) return;
  button.classList.toggle("active", playing);
  button.setAttribute("aria-label", playing ? t("pause") : t("play"));
  button.innerHTML = playing
    ? `<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>`
    : `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`;
}

function speedMenuMarkup(current, speeds){
  return `<div class="speed-menu" data-speed-menu>
    <button class="speed-menu-btn" type="button" aria-label="${t("speed")}" aria-expanded="false">${current}×</button>
    <div class="speed-popover">
      ${speeds.map(s => `<button type="button" data-speed="${s}" class="${s === current ? "active" : ""}">${s}×</button>`).join("")}
    </div>
  </div>`;
}

function bindSpeedMenu(root, getSpeed, setSpeed, onChange){
  const menu = root.querySelector("[data-speed-menu]");
  if(!menu) return;
  const btn = menu.querySelector(".speed-menu-btn");
  const pop = menu.querySelector(".speed-popover");
  function refresh(){
    const speed = getSpeed();
    btn.textContent = `${speed}×`;
    menu.querySelectorAll("[data-speed]").forEach(b => b.classList.toggle("active", +b.dataset.speed === speed));
  }
  btn.addEventListener("click", () => {
    const open = !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  });
  pop.querySelectorAll("[data-speed]").forEach(option => option.addEventListener("click", () => {
    setSpeed(+option.dataset.speed);
    menu.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    refresh();
    onChange();
  }));
  refresh();
}

function syncViewportHeight(){
  const viewport = window.visualViewport;
  const height = Math.round(viewport?.height || window.innerHeight || 0);
  if(height > 0) document.documentElement.style.setProperty("--cahe-viewport-height", `${height}px`);
}

function bindViewportHeight(){
  let raf = null;
  const schedule = () => {
    if(raf != null) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = null;
      syncViewportHeight();
    });
  };
  syncViewportHeight();
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
  if(window.visualViewport){
    window.visualViewport.addEventListener("resize", schedule, { passive: true });
    window.visualViewport.addEventListener("scroll", schedule, { passive: true });
  }
}

function miniSelectMarkup(id, label, value, options){
  return `<div class="field mini-select-field">
    <label>${tx(label)}</label>
    <div class="mini-select" id="${id}" data-mini-select>
      <button class="mini-select-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
        <span>${tx(value)}</span><span class="mini-chevron"></span>
      </button>
      <div class="mini-select-menu" role="listbox">
        <button class="select-menu-close" type="button" data-select-close aria-label="${escAttr(t("close"))}"></button>
        ${options.map(opt => `<button type="button" role="option" data-value="${escAttr(opt)}" class="${opt === value ? "active" : ""}">${tx(opt)}</button>`).join("")}
      </div>
    </div>
  </div>`;
}

function componentMultiSelectMarkup(id, label, options, selected, colorFn){
  const selectedSet = new Set(selected || []);
  const selectedOptions = options.filter(opt => selectedSet.has(opt));
  const summary = selectedOptions.length
    ? `${selectedOptions.length} ${state.lang === "en" ? "selected" : "seleccionados"}`
    : (state.lang === "en" ? "Select" : "Seleccionar");
  const hasTotal = options.includes("Total");
  const regularOptions = options.filter(opt => opt !== "Total");
  const optionMarkup = opt => `<button type="button" role="option" aria-selected="${selectedSet.has(opt)}" class="comp-option${opt === "Total" ? " total-option" : ""}${selectedSet.has(opt) ? " active" : ""}" data-tipo="${escAttr(opt)}"><span class="check">${selectedSet.has(opt) ? "✓" : ""}</span><span class="sw" style="background:${colorFn(opt)}"></span><span>${tx(opt)}</span></button>`;
  const open = id === "f-tipos" && state.componentMenuOpen;
  return `<div class="field field-components inline-components">
    <label>${tx(label)}</label>
    <div class="comp-select${open ? " open" : ""}" id="${id}" data-comp-select>
      <button class="comp-select-btn" type="button" aria-haspopup="listbox" aria-expanded="${open ? "true" : "false"}">
        <span>${summary}</span><span class="mini-chevron"></span>
      </button>
      <div class="comp-select-menu" role="listbox" aria-multiselectable="true">
        <button class="select-menu-close" type="button" data-select-close aria-label="${escAttr(t("close"))}"></button>
        <div class="comp-menu-actions">
          <button type="button" data-component-action="all">${state.lang === "en" ? "All" : "Todos"}</button>
          <button type="button" data-component-action="clear">${state.lang === "en" ? "Clear" : "Limpiar"}</button>
        </div>
        ${hasTotal ? `<div class="comp-option-block comp-total-block">${optionMarkup("Total")}</div>` : ""}
        <div class="comp-option-block">${regularOptions.map(optionMarkup).join("")}</div>
      </div>
      <div class="comp-chips selected-components">
        ${selectedOptions.map(opt => `<button type="button" class="comp-chip active" data-tipo="${escAttr(opt)}" title="${state.lang === "en" ? "Remove" : "Quitar"} ${escAttr(tx(opt))}"><span class="sw" style="background:${colorFn(opt)}"></span>${tx(opt)}<span class="chip-x">×</span></button>`).join("")}
      </div>
    </div>
  </div>`;
}

function closeSelectElement(box){
  if(!box) return;
  box.classList.remove("open");
  box.querySelector(".mini-select-btn,.comp-select-btn")?.setAttribute("aria-expanded", "false");
}

function closeFloatingSelects(root = document){
  root.querySelectorAll("[data-mini-select],[data-comp-select]").forEach(closeSelectElement);
  state.componentMenuOpen = false;
}

function bindMiniSelect(root, id, onChange){
  const box = root.querySelector(`#${id}`);
  if(!box) return;
  const btn = box.querySelector(".mini-select-btn");
  const menu = box.querySelector(".mini-select-menu");
  btn.addEventListener("click", () => {
    stopPlayback();
    const wasOpen = box.classList.contains("open");
    closeFloatingSelects(root);
    const open = !wasOpen;
    box.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  });
  menu.querySelector("[data-select-close]")?.addEventListener("click", event => {
    event.stopPropagation();
    closeFloatingSelects(root);
  });
  menu.querySelectorAll("[data-value]").forEach(option => option.addEventListener("click", () => {
    stopPlayback();
    state.componentMenuOpen = false;
    box.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    onChange(option.dataset.value);
  }));
}

function bindComponentSelect(root, id){
  const box = root.querySelector(`#${id}`);
  if(!box) return;
  const btn = box.querySelector(".comp-select-btn");
  const menu = box.querySelector(".comp-select-menu");
  btn.addEventListener("click", () => {
    stopPlayback();
    const wasOpen = box.classList.contains("open");
    closeFloatingSelects(root);
    const open = !wasOpen;
    state.componentMenuOpen = open;
    box.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  });
  menu?.querySelector("[data-select-close]")?.addEventListener("click", event => {
    event.stopPropagation();
    closeFloatingSelects(root);
  });
}

function updateTimelineBubble(timeline, slider, year){
  const bubble = timeline?.querySelector("[data-year-bubble]");
  if(!bubble || !slider) return;
  const min = Number(slider.min), max = Number(slider.max);
  const denom = max - min || 1;
  const pct = Math.max(0, Math.min(100, ((Number(year) - min) / denom) * 100));
  const startYear = Number(timeline.querySelector('[data-range-handle="start"]')?.getAttribute("aria-valuenow") ?? min);
  const endYear = Number(timeline.querySelector('[data-range-handle="end"]')?.getAttribute("aria-valuenow") ?? max);
  const atBoundary = Number(year) === startYear || Number(year) === endYear;
  bubble.textContent = atBoundary ? "" : year;
  bubble.style.left = `${pct}%`;
  bubble.classList.toggle("boundary", atBoundary);
  bubble.classList.toggle("edge-start", pct < 5);
  bubble.classList.toggle("edge-end", pct > 95);
}

function startIndicatorTimer(years, onTick, onStop){
  clearIndicatorTimer();
  if(!years.length) return;
  const token = (window.__playTimerToken || 0) + 1;
  window.__playTimerToken = token;
  const first = years[0], last = years.at(-1);
  if(state.year >= last){
    state.year = first;
    onTick(state.year);
  } else {
    state.year = nearestTimelineYear(years, state.year);
    onTick(state.year);
  }
  window.__playTimer = setInterval(() => {
    if(window.__playTimerToken !== token || !state.playing){
      clearInterval(window.__playTimer);
      window.__playTimer = null;
      return;
    }
    const idx = Math.max(0, years.findIndex(y => y >= state.year));
    if(idx >= years.length - 1){
      state.year = last;
      state.playing = false;
      clearIndicatorTimer();
      onTick(state.year);
      if(onStop) onStop();
      return;
    }
    state.year = years[idx + 1];
    onTick(state.year);
    if(state.year >= last){
      state.playing = false;
      clearIndicatorTimer();
      if(onStop) onStop();
    }
  }, timelineDelay(state.speed));
}

function setupIndicatorTimeline(timeline, years, onTick){
  if(!timeline || !years.length) return;
  const initialRange = getTimelineRange("indicator", years);
  if(state.year < initialRange.start || state.year > initialRange.end) state.year = initialRange.end;
  state.year = nearestTimelineYear(initialRange.years, state.year);
  const slider = timeline.querySelector("#year-slider");
  const readout = timeline.querySelector("#year-readout");
  const range = timeline.querySelector("#year-range");
  const start = timeline.querySelector("#year-start");
  const end = timeline.querySelector("#year-end");
  const play = timeline.querySelector("#play-btn");
  slider.min = years[0];
  slider.max = years.at(-1);
  slider.step = 1;
  slider.value = state.year;
  if(start) start.textContent = initialRange.start;
  if(end) end.textContent = initialRange.end;
  readout.textContent = state.year;
  if(range) range.textContent = `${initialRange.start}–${initialRange.end}`;
  updateTimelineRangeUi(timeline, slider, years, "indicator");
  updateTimelineBubble(timeline, slider, state.year);
  setPlayButtonState(play, state.playing);
  function updateReadout(y){
    slider.value = y;
    readout.textContent = y;
    updateTimelineRangeUi(timeline, slider, years, "indicator");
    updateTimelineBubble(timeline, slider, y);
  }
  bindTimelineRangeHandles(timeline, years, "indicator", () => {
    const active = getTimelineRange("indicator", years);
    state.year = nearestTimelineYear(active.years, state.year);
    updateReadout(state.year);
    setPlayButtonState(play, false);
    clearIndicatorTimer();
    onTick(state.year);
  });
  slider.addEventListener("input", e => {
    const active = getTimelineRange("indicator", years);
    state.year = nearestTimelineYear(active.years, e.target.value);
    state.playing = false;
    updateReadout(state.year);
    setPlayButtonState(play, false);
    clearIndicatorTimer();
    onTick(state.year);
  });
  play.addEventListener("click", () => {
    const activeYears = getTimelineRange("indicator", years).years;
    if(!state.playing){
      if(!activeYears.length) return;
      state.year = activeYears[0];
      state.playing = true;
      setPlayButtonState(play, true);
      startIndicatorTimer(activeYears, y => {
        updateReadout(y);
        onTick(y);
      }, () => setPlayButtonState(play, false));
      return;
    }
    state.playing = false;
    clearIndicatorTimer();
    setPlayButtonState(play, false);
  });
  bindSpeedMenu(timeline, () => state.speed, v => { state.speed = v; }, () => {
    if(state.playing) startIndicatorTimer(getTimelineRange("indicator", years).years, y => {
      updateReadout(y);
      onTick(y);
    }, () => setPlayButtonState(play, false));
  });
}

function cutoffSeries(series, years, year){
  return series.map(s => ({
    ...s,
    values: s.values.map((v, i) => years[i] <= year ? v : null),
  }));
}

function sliceSeriesByRange(series, years, start, end){
  const indexes = years.map((year, i) => ({ year, i })).filter(d => d.year >= start && d.year <= end);
  return series.map(s => ({ ...s, values: indexes.map(d => s.values[d.i]) }));
}

/* ====== Group bar ====== */
function renderGroupBar(){
  if(els.groupBar) els.groupBar.style.display = "none";
  if(!els.groupNav) return;
  els.groupNav.style.display = "none";
  els.groupNav.innerHTML = "";
}

function switchGroup(groupId){
  state.group = groupId;
  state.subsection = "viz";
  state.vizId = defaultVizId(groupId);
  renderMain();
}

function defaultVizId(groupId){
  if(groupId === "global") return "tendencias";
  const landing = LANDING_GROUPS.find(g => g.group === groupId);
  if(landing) return landing.id;
  const items = CATALOG_OTHER[groupId] || [];
  return (items.find(i => !i.comingSoon) || items[0] || {}).id || null;
}

function sidebarConfig(){
  if(state.group === "global") return { items: GLOBAL_ANALYSES, eyebrow: t("analysis") };
  if(state.group === "macro") return { items: CATALOG_OTHER.macro, eyebrow: t("macroEyebrow") };
  if(state.group === "sectorial") return { items: CATALOG_OTHER.sectorial, eyebrow: t("sectorEyebrow") };
  return { items: CATALOG_OTHER.commodities, eyebrow: t("commodities") };
}

function activeSidebarItem(config = sidebarConfig()){
  return config.items.find(it => it.id === state.vizId) || config.items.find(it => !it.comingSoon) || config.items[0] || null;
}

function activeGroupLabel(){
  const group = LANDING_GROUPS.find(g => g.group === state.group);
  return group ? tx(group.label) : "";
}

function mobileVizPickerMarkup(){
  const config = sidebarConfig();
  const item = activeSidebarItem(config);
  const title = item ? itemTitle(item) : config.eyebrow;
  const meta = state.group === "global" ? config.eyebrow : tx(item?.sub || item?.meta || config.eyebrow);
  const label = state.lang === "en" ? "Choose indicator or category" : "Elegir indicador o categoria";
  return `
    <div class="mobile-viz-picker" style="--side-accent:var(--${state.group === "global" ? "sky" : state.group === "sectorial" ? "olive" : state.group === "commodities" ? "commod" : "warm"})">
      <button class="mobile-viz-picker-btn" id="mobile-viz-picker-btn" type="button" aria-expanded="false" aria-controls="viz-sidebar" aria-label="${escAttr(label)}">
        <span class="mobile-viz-kicker">${escHtml(activeGroupLabel())}</span>
        <strong class="mobile-viz-title">${escHtml(title)}</strong>
        <span class="mobile-viz-meta">${escHtml(meta)}</span>
      </button>
    </div>
    <button class="mobile-viz-backdrop" type="button" data-mobile-viz-close aria-label="${escAttr(t("close"))}"></button>`;
}

function dataLinkForItem(item){
  if(item?.dataHref) return item.dataHref;
  if(item?.data) return `${V1_DOCS}/${item.data}`;
  return null;
}

function logoImg(src, cls, alt){
  return `<img class="${cls}" src="${src}?v=${APP_VERSION}" alt="${escAttr(alt)}" loading="lazy">`;
}
function zenodoIcon(cls = "zenodo-symbol"){
  return logoImg(ZENODO_LOGO_SRC, cls, t("zenodo"));
}
function zenodoBrand(){
  return `<span class="zenodo-brand">${zenodoIcon()}<span>${t("zenodo")}</span></span>`;
}
function githubLogo(cls = "brand-logo github-logo"){
  return logoImg(GITHUB_LOGO_SRC, cls, t("github"));
}

function settingsGearIcon(){
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function renderPanelTools(dataLink, methodLink, info = true, zenodoLink = null, citation = null, controlsToggle = false){
  if(!dataLink && !info && !citation && !controlsToggle) return "";
  return `<div class="tools panel-tools">
    ${dataLink ? `<a class="btn-download" href="${dataLink}" target="_blank" rel="noopener" title="${t("dataXlsx")}" aria-label="${t("dataXlsx")}"><span class="arr">↓</span><span class="tool-text">${t("dataXlsx")}</span></a>` : ""}
    ${citation ? `<button class="btn-cite" id="btn-cite" type="button" title="${t("howToCite")}" aria-label="${t("howToCite")}"><span class="quote-icon" aria-hidden="true"><span>“</span><span>”</span></span><span class="tool-text">${t("cite")}</span></button>` : ""}
    ${info ? `<button class="btn-info" id="btn-info" type="button" title="${t("infoMethod")}" aria-label="${t("infoMethod")}" data-method-link="${methodLink || ""}"><span class="icon">i</span><span class="tool-text">${t("infoMethod")}</span></button>` : ""}
    ${controlsToggle ? `<button class="btn-settings${state.controlsCollapsed ? " active" : ""}" id="btn-controls-toggle" type="button" title="${state.lang === "en" ? "Show or hide controls" : "Mostrar u ocultar controles"}" aria-label="${state.lang === "en" ? "Show or hide controls" : "Mostrar u ocultar controles"}" aria-pressed="${state.controlsCollapsed ? "true" : "false"}">${settingsGearIcon()}<span class="tool-text">${state.lang === "en" ? "Controls" : "Controles"}</span></button>` : ""}
  </div>`;
}

function bindControlsToggle(root){
  const btn = root.querySelector("#btn-controls-toggle");
  const viz = root.querySelector(".viz");
  if(!btn || !viz) return;
  const sync = () => {
    viz.classList.toggle("controls-collapsed", state.controlsCollapsed);
    btn.classList.toggle("active", state.controlsCollapsed);
    btn.setAttribute("aria-pressed", state.controlsCollapsed ? "true" : "false");
  };
  btn.addEventListener("click", () => {
    state.controlsCollapsed = !state.controlsCollapsed;
    sync();
  });
  sync();
}

function renderMain(){
  /* The SVG under the pointer can vanish without ever firing mouseleave (hash
     navigation, back button, timelapse, a tap on a phone), so the tooltip stayed
     pinned over the next section. Clear it on every render. */
  hideTooltip();
  renderGroupBar();
  if(state.section === "visualizacion"){
    if(state.subsection === "landing") renderLanding();
    else if(state.subsection === "group") renderGroupLanding();
    else renderViz();
  } else if(state.section === "perspectivas") renderPerspectivas();
  else if(state.section === "publicaciones") renderPublicaciones();
  else if(state.section === "datos") renderDatos();
  else if(state.section === "metodos") renderComoTrabajamos();
  else if(state.section === "novedades") renderNovedades();
  else if(state.section === "equipo") renderEquipo();
  else if(state.section === "acerca") renderAcerca();
}

/* ====== Landing ====== */
function flipCard(opts){
  const { id, group, label, meta, desc, icon, comingSoon, cls } = opts;
  const csCls = comingSoon ? " coming-soon" : "";
  const description = state.lang === "en" && opts.descEn ? opts.descEn : tx(desc);
  return `<button class="flip-card ${cls || ""}${csCls}" ${comingSoon ? "" : `data-enter="${id}" data-group="${group}"`} type="button"${comingSoon ? " disabled" : ""}>
    <div class="flip-inner">
      <div class="flip-front">
        <span class="badge">${tx(meta || "")}</span>
        <div class="icon-large">${icon ? `<img src="${icon}" alt="">` : ""}</div>
        <div class="name">${tx(label)}</div>
        <span class="swatch"></span>
      </div>
      <div class="flip-back">
        <p>${compact(description, 118)}</p>
        ${comingSoon ? `<span class="open" style="color:var(--warm)">${t("comingSoon")}</span>` : `<span class="open">${t("openViewer")} <span class="arrow">→</span></span>`}
      </div>
    </div>
  </button>`;
}

function renderLanding(){
  const cards = LANDING_GROUPS.map(g => flipCard(g)).join("");

  els.workspace.innerHTML = `
    <div class="viz-landing entry-grid">
      <div class="head">
        <div class="eyebrow">${t("visualizacion")}</div>
        <h1>${t("choosePanel")}</h1>
        <p>${t("landingIntro")}</p>
      </div>
      <div class="flip-grid group-entry">${cards}</div>
    </div>`;
  els.workspace.querySelectorAll("[data-enter]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.group = btn.dataset.group;
      state.vizId = btn.dataset.enter || defaultVizId(state.group);
      state.ind_view = "tendencia";
      state.subsection = "viz";
      renderMain();
    });
  });
}

function globalAnalysisDescription(id){
  const es = MODAL_INFO[id]?.datos || "";
  if(state.lang !== "en") return es;
  const en = {
    tendencias: "Annual Spain and world series with metric, area, moving-average, trend and exploratory controls.",
    correlacion: "Bivariate scatter view for Spain and world, with yearly points connected through time.",
    descomposicion: "IPAT/LMDI decomposition of environmental indicators in additive, multiplicative and waterfall form.",
    desacoplamiento: "Tapio decoupling scenarios comparing environmental impacts and GDP growth with moving windows."
  };
  return en[id] || tx(es);
}

function groupLandingItems(){
  if(state.group === "global") return {
    eyebrow: tx("Perspectiva global"),
    title: state.lang === "en" ? "Spain in global perspective" : "España en perspectiva global",
    intro: state.lang === "en" ? "International series and analysis tools to compare Spain and the world." : "Series internacionales y herramientas de análisis para comparar España y mundo.",
    items: GLOBAL_ANALYSES.map(a => ({ ...a, meta: a.sub, desc: globalAnalysisDescription(a.id), group: "global" }))
  };
  const map = {
    macro: [t("macroEyebrow"), t("macroEyebrow"), state.lang === "en" ? "Energy, emissions, materials and land in national series and provincial maps when available." : "Energía, emisiones, materiales y tierra en serie nacional y, cuando existe, mapa provincial."],
    sectorial: [t("sectorEyebrow"), t("sectorEyebrow"), state.lang === "en" ? "Forestry, crops, industry and power sector with unified navigation." : "Forestal, cultivos, industria y sector eléctrico con navegación unificada."],
    commodities: [t("commodities"), t("commodities"), state.lang === "en" ? "Specific products and resources with their own entry point." : "Productos y recursos singulares con entrada propia."]
  };
  const [eyebrow, title, intro] = map[state.group] || map.macro;
  return { eyebrow, title, intro, items: CATALOG_OTHER[state.group] || [] };
}

function panelEntryCard(item){
  const disabled = item.comingSoon ? " disabled" : "";
  const cls = item.comingSoon ? " coming-soon" : "";
  return `<button class="panel-entry-card${cls}" data-panel-entry="${item.id}" type="button"${disabled}>
    <div class="panel-entry-inner">
      <div class="panel-entry-front">
        <span class="panel-entry-meta">${tx(item.meta || item.sub || "")}</span>
        <span class="panel-entry-icon">${item.icon ? `<img src="${item.icon}" alt="">` : ""}</span>
        <span class="panel-entry-title">${itemTitle(item)}</span>
      </div>
      <div class="panel-entry-back">
        <span class="panel-entry-title">${itemTitle(item)}</span>
        <p>${compact(item.desc ? itemDescription(item) : tx(item.sub || ""), 118)}</p>
        <span class="panel-entry-open">${item.comingSoon ? t("comingSoon") : `${t("openViewer")} →`}</span>
      </div>
    </div>
  </button>`;
}

function renderGroupLanding(){
  const config = groupLandingItems();
  els.workspace.innerHTML = `
    <div class="viz-landing panel-entry-page">
      <div class="head panel-entry-head">
        <div>
          <div class="eyebrow">${config.eyebrow}</div>
          <h1>${config.title}</h1>
          <p>${config.intro}</p>
        </div>
      </div>
      <div class="panel-entry-grid">${config.items.map(panelEntryCard).join("")}</div>
    </div>`;
  els.workspace.querySelectorAll("[data-panel-entry]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.vizId = btn.dataset.panelEntry;
      state.subsection = "viz";
      renderMain();
    });
  });
}

/* ====== Viz ====== */
function renderViz(){
  document.body.classList.remove("mobile-viz-open");
  els.workspace.innerHTML = `
    <div class="viz-container" id="viz-container">
      ${mobileVizPickerMarkup()}
      <aside class="viz-sidebar" id="viz-sidebar"></aside>
      <section class="viz-main" id="viz-main"></section>
    </div>`;
  renderSidebar();
  bindMobileVizPicker();
  if(state.group === "global") renderGlobalViz();
  else renderIndicatorViz();
}

function bindMobileVizPicker(){
  const container = document.getElementById("viz-container");
  const openBtn = document.getElementById("mobile-viz-picker-btn");
  if(!container || !openBtn) return;
  const setOpen = open => {
    container.classList.toggle("mobile-picker-open", open);
    document.body.classList.toggle("mobile-viz-open", open);
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
  };
  openBtn.addEventListener("click", () => setOpen(!container.classList.contains("mobile-picker-open")));
  container.querySelectorAll("[data-mobile-viz-close]").forEach(btn => {
    btn.addEventListener("click", () => setOpen(false));
  });
  document.addEventListener("keydown", event => {
    if(event.key === "Escape" && container.classList.contains("mobile-picker-open")) setOpen(false);
  }, { once: true });
}

function renderSidebar(){
  const sidebar = document.getElementById("viz-sidebar");
  const { items, eyebrow } = sidebarConfig();
  const activeItem = activeSidebarItem({ items, eyebrow });
  const pickerTitle = state.lang === "en" ? "Choose view" : "Elegir vista";

  sidebar.className = `viz-sidebar sidebar-${state.group}`;
  const groupItems = groupId => groupId === "global" ? GLOBAL_ANALYSES : (CATALOG_OTHER[groupId] || []);
  const groupEyebrow = groupId => {
    if(groupId === "global") return t("analysis");
    if(groupId === "macro") return t("macroEyebrow");
    if(groupId === "sectorial") return t("sectorEyebrow");
    return t("commodities");
  };
  const groupSwitch = LANDING_GROUPS.map(g => {
    const activeGroup = g.group === state.group;
    const childItems = activeGroup ? groupItems(g.group) : [];
    return `<div class="side-group-block${activeGroup ? " open" : ""}">
      <button class="side-group-btn ${g.cls || ""}${activeGroup ? " active" : ""}" data-side-group="${g.group}" type="button" aria-expanded="${activeGroup ? "true" : "false"}">
        <span class="side-group-icon">${g.icon ? `<img src="${g.icon}" alt="">` : ""}</span>
        <span>${tx(g.label)}</span>
      </button>
      ${activeGroup ? `<div class="side-group-children" aria-label="${escAttr(groupEyebrow(g.group))}">
        ${childItems.map(it => {
          const meta = g.group === "global" ? "" : (it.sub || it.meta || "");
          return `<button class="viz-side-item side-child-item${it.id === state.vizId ? " active" : ""}${it.comingSoon ? " coming-soon" : ""}" data-id="${it.id}" type="button">
            <span class="icon-box">${it.icon ? `<img src="${it.icon}" alt="">` : ""}</span>
            <span class="label">
              <span class="name">${itemTitle(it)}</span>
              ${meta ? `<span class="meta">${tx(meta)}</span>` : ""}
            </span>
          </button>`;
        }).join("")}
      </div>` : ""}
    </div>`;
  }).join("");
  sidebar.innerHTML = `
    <div class="mobile-sidebar-head">
      <div><span>${pickerTitle}</span><strong>${escHtml(activeItem ? itemTitle(activeItem) : eyebrow)}</strong></div>
      <button class="mobile-sidebar-close" type="button" data-mobile-viz-close aria-label="${escAttr(t("close"))}">×</button>
    </div>
    <div class="side-group-switcher">${groupSwitch}</div>`;
  sidebar.querySelectorAll("[data-side-group]").forEach(btn => {
    btn.addEventListener("click", () => {
      if(btn.dataset.sideGroup === state.group) return;
      switchGroup(btn.dataset.sideGroup);
    });
  });
  sidebar.querySelectorAll("[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.vizId = btn.dataset.id;
      renderViz();
    });
  });
}

function indicatorViewButtons(hasMap, activeMode){
  const items = [
    { id: "linea", label: t("trend"), icon: `<svg viewBox="0 0 20 16"><polyline points="2 13 6 9 9 11 13 5 18 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    { id: "area", label: t("area"), icon: `<svg viewBox="0 0 20 16"><path d="M2 13 6 9 9 11 13 5 18 6v8H2z" fill="currentColor" opacity=".78"/></svg>` },
    { id: "tabla", label: t("table"), icon: `<svg viewBox="0 0 20 16"><rect x="2" y="2" width="16" height="12" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M2 6h16M2 10h16M7 2v12M13 2v12" stroke="currentColor" stroke-width=".95"/></svg>` },
  ];
  if(hasMap) items.unshift({ id: "mapa", label: t("map"), icon: `<svg viewBox="0 0 20 16"><path d="M2.5 3.2 7.2 1.7l5.6 1.8 4.7-1.7v10.9l-4.7 1.6-5.6-1.8-4.7 1.7z" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M7.2 1.7v10.8M12.8 3.5v10.8" fill="none" stroke="currentColor" stroke-width="1.05"/></svg>` });
  return `<div class="view-tabs viz-mode-tabs">${items.map(it => `<button class="view-tab${activeMode === it.id ? " active" : ""}" data-view-mode="${it.id}" type="button"><span class="view-icon">${it.icon}</span><span class="view-label">${it.label}</span></button>`).join("")}</div>`;
}

function bindIndicatorViewButtons(root){
  root.querySelectorAll("[data-view-mode]").forEach(b => {
    b.addEventListener("click", () => {
      stopPlayback();
      state.componentMenuOpen = false;
      const mode = b.dataset.viewMode;
      if(mode === "mapa"){
        state.ind_view = "mapa";
        state.ind_display = "mapa";
      }else if(mode === "tabla" && state.ind_view === "mapa"){
        state.ind_display = "tabla";
      }else{
        state.ind_view = "tendencia";
        state.ind_display = mode;
      }
      renderIndicatorViz();
    });
  });
}

/* ====== INDICATOR VIZ — nativo ====== */

function isAbsoluteIndicatorVariable(variable){
  return String(variable || "").startsWith("Absoluto");
}

function splitCompoundOption(value){
  const raw = String(value || "");
  const parts = raw.split(/\s+\u00b7\s+/);
  return {
    head: parts[0] || raw,
    tail: parts.length > 1 ? parts.slice(1).join(" \u00b7 ") : "Total",
  };
}

function industryIndicatorOptions(data){
  return Array.from(new Set((data.tipo2s || []).map(tipo2 => splitCompoundOption(tipo2).head))).filter(Boolean);
}

function industryFlowOptions(data, indicator, item = null){
  const values = Array.from(new Set((data.tipo2s || [])
    .filter(tipo2 => splitCompoundOption(tipo2).head === indicator)
    .map(tipo2 => splitCompoundOption(tipo2).tail))).filter(Boolean);
  const ordered = orderValues(values, indicatorStyle(item).flowOrder || []);
  return ordered.includes("Total") ? ["Total", ...ordered.filter(value => value !== "Total")] : ordered;
}

function industryTipo2FromParts(data, indicator, flow){
  const options = data.tipo2s || [];
  return options.find(tipo2 => {
    const parts = splitCompoundOption(tipo2);
    return parts.head === indicator && parts.tail === flow;
  }) || options.find(tipo2 => splitCompoundOption(tipo2).head === indicator) || options[0] || null;
}

async function renderIndicatorViz(){
  const main = document.getElementById("viz-main");
  state.globalPlaying = false;
  state.playing = false;
  clearGlobalTimer();
  clearIndicatorTimer();
  const items = CATALOG_OTHER[state.group] || [];
  const item = items.find(i => i.id === state.vizId) || items.find(i => !i.comingSoon);
  if(!item){ main.innerHTML = `<div class="empty">No hay vista.</div>`; return; }
  state.vizId = item.id;

  if(item.comingSoon){
    main.innerHTML = `
      <div class="viz">
        <div class="indicator-head"><div class="meta"><div class="indicator-titleline"><h1>${itemTitle(item)}</h1><span>${itemDescription(item)}</span></div></div></div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:60px;text-align:center">
          <div>
            <strong style="display:block;font-family:var(--ff-serif);font-size:32px;color:var(--ink);margin-bottom:8px">${t("comingSoon")}</strong>
            <p style="color:var(--ink-soft)">${state.lang === "en" ? "This visualization will be published soon." : "Esta visualización se publicará próximamente."}</p>
          </div>
        </div>
      </div>`;
    return;
  }

  // Carga datos nacional y (si existe) provincial
  const data = await loadIndicatorDataset(item);
  if(!data){
    const sourceLabel = item.dataSources?.join(", ") || item.dataSlug;
    main.innerHTML = `<div class="error">No se pudo cargar ${sourceLabel}</div>`;
    return;
  }
  const latestYear = data.years?.at(-1);
  const timelineKey = `${item.id}:${data.years?.[0] || ""}-${latestYear || ""}`;
  if(timelineKey !== state.indTimelineKey){
    state.indTimelineKey = timelineKey;
    state.yearStart = null;
    state.yearEnd = null;
    state.year = latestYear;
  }
  let mapData = null;
  if(item.mapSlug){
    mapData = await loadJson(`data/provincial/${item.mapSlug}.json`);
    if(!GEO) GEO = prepareGeo(await loadJson("data/geo/spain-provinces.geojson"));
  }

  // Estado inicial para esta categoría
  if(state.ind_variable == null || !data.variables.includes(state.ind_variable)){
    state.ind_variable = data.defaultVariable || data.variables[0];
  }
  if(state.ind_tipoMulti == null || !state.ind_tipoMulti.some(t => data.tipos.includes(t))){
    state.ind_tipoMulti = item.id === "industria" && data.tipos.includes("Total")
      ? ["Total"]
      : data.tipos.filter(t => t !== "Total");
    if(!state.ind_tipoMulti.length) state.ind_tipoMulti = ["Total"];
  }
  const tipo2Options = data.tipo2s || [];
  if(state.ind_tipo2 == null || (tipo2Options.length && !tipo2Options.includes(state.ind_tipo2))){
    state.ind_tipo2 = data.defaultTipo2 || tipo2Options[0] || null;
  }
  if(state.year == null) state.year = data.years.at(-1);
  if(mapData && (state.ind_mapCombo == null || !mapData.combos.find(c => c.id === state.ind_mapCombo))){
    state.ind_mapCombo = (mapData.combos.find(c => c.category === "Total") || mapData.combos[0]).id;
  }

  const hasMap = !!mapData;
  const view = (state.ind_view === "mapa" && hasMap) ? "mapa" : "tendencia";

  const dataLink = dataLinkForItem(item);
  const methodLink = item.method ? `${V1_DOCS}/${item.method}` : null;
  const citation = citationForItem(item);
  const toolsHtml = renderPanelTools(dataLink, methodLink, true, item.zenodo || null, citation, true);

  main.innerHTML = `
    <div class="viz${state.controlsCollapsed ? " controls-collapsed" : ""}">
      <div class="indicator-head with-tools">
        <div class="meta">
          <div class="indicator-titleline"><h1>${itemTitle(item)}</h1><span>${itemDescription(item)}</span></div>
        </div>
        ${toolsHtml}
      </div>

      <div id="ind-controls"></div>
      <div class="canvas" id="ind-canvas">
        <div class="chart-area" id="ind-chart"></div>
        <div class="chart-legend" id="ind-legend"></div>
        <div class="viz-timeline" id="ind-timeline" style="display:none">
          <button class="play-btn" id="play-btn" type="button" aria-label="${t("play")}"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button>
          ${speedMenuMarkup(state.speed, [1,2,4,8])}
          <div class="year-readout" id="year-readout">${state.year}</div>
          <div class="timeline-bound timeline-start" id="year-start"></div>
          <div class="timeline-track-wrap">
            <span class="timeline-selection" data-range-selection></span>
            <button class="timeline-limit timeline-limit-start" data-range-handle="start" type="button" role="slider" aria-label="${state.lang === "en" ? "Start year" : "Año inicial"}" aria-valuemin="" aria-valuemax="" aria-valuenow=""><span class="timeline-handle-year"></span></button>
            <input class="year-slider" id="year-slider" type="range">
            <button class="timeline-limit timeline-limit-end" data-range-handle="end" type="button" role="slider" aria-label="${state.lang === "en" ? "End year" : "Año final"}" aria-valuemin="" aria-valuemax="" aria-valuenow=""><span class="timeline-handle-year"></span></button>
            <span class="year-bubble" id="year-bubble" data-year-bubble></span>
          </div>
          <div class="timeline-bound timeline-end" id="year-end"></div>
          <div class="year-range" id="year-range"></div>
        </div>
      </div>
      <div class="info-strip" id="ind-info"></div>
    </div>`;

  const bi = main.querySelector("#btn-info");
  if(bi) bi.addEventListener("click", () => openIndicatorModal(item, data));
  const bc = main.querySelector("#btn-cite");
  if(bc) bc.addEventListener("click", () => openCitationModal(itemTitle(item), citation));
  bindControlsToggle(main);

  if(view === "tendencia") renderIndicatorTendencia(item, data);
  else renderIndicatorMapa(item, mapData);
}

function renderIndicatorTendencia(item, data){
  const ctrls = document.getElementById("ind-controls");
  // A newer async render may have replaced #main already; bail out instead of throwing.
  if(!ctrls) return;
  const tipo2s = data.tipo2s || [];
  const isIndustry = item.id === "industria";
  if(tipo2s.length && !data.series.some(s => s.variable === state.ind_variable && s.tipo2 === state.ind_tipo2)){
    state.ind_tipo2 = tipo2s.find(tipo2 => data.series.some(s => s.variable === state.ind_variable && s.tipo2 === tipo2)) || tipo2s[0];
  }
  let industryParts = null;
  let industryIndicators = [];
  let industryFlows = [];
  if(isIndustry && tipo2s.length){
    industryIndicators = industryIndicatorOptions(data);
    industryParts = splitCompoundOption(state.ind_tipo2);
    if(!industryIndicators.includes(industryParts.head)){
      industryParts.head = industryIndicators[0];
      state.ind_tipo2 = industryTipo2FromParts(data, industryParts.head, "Total");
      industryParts = splitCompoundOption(state.ind_tipo2);
    }
    industryFlows = industryFlowOptions(data, industryParts.head, item);
    if(!industryFlows.includes(industryParts.tail)){
      state.ind_tipo2 = industryTipo2FromParts(data, industryParts.head, industryFlows.includes("Total") ? "Total" : industryFlows[0]);
      industryParts = splitCompoundOption(state.ind_tipo2);
      industryFlows = industryFlowOptions(data, industryParts.head, item);
    }
  }
  const tipos = tipo2s.length
    ? Array.from(new Set(data.series.filter(s => s.variable === state.ind_variable && s.tipo2 === state.ind_tipo2).map(s => s.tipo)))
    : (data.tipos || []);
  if(tipos.length){
    const currentSelection = Array.isArray(state.ind_tipoMulti) ? state.ind_tipoMulti : null;
    const validSelection = (currentSelection || []).filter(t => tipos.includes(t));
    if((currentSelection == null || (currentSelection.length && !validSelection.length))){
      validSelection.push(tipos.find(t => t !== "Total") || tipos[0]);
    }
    if(isAbsoluteIndicatorVariable(state.ind_variable) && validSelection.includes("Total") && validSelection.length > 1){
      state.ind_tipoMulti = ["Total"];
    }else{
      state.ind_tipoMulti = validSelection;
    }
  }
  const tipo2Controls = isIndustry && tipo2s.length
    ? `${miniSelectMarkup("f-industry-indicator-select", state.lang === "en" ? "Indicator type" : "Tipo de indicador", industryParts.head, industryIndicators)}
       ${miniSelectMarkup("f-industry-flow-select", state.lang === "en" ? "Flow/source" : "Flujo/fuente", industryParts.tail, industryFlows)}`
    : `${tipo2s.length ? miniSelectMarkup("f-tipo2-select", item.id === "emisiones" ? "Agregación" : t("types"), state.ind_tipo2, tipo2s) : ""}`;
  const componentLabel = isIndustry ? (state.lang === "en" ? "Sector" : "Sector") : t("components");
  ctrls.innerHTML = `
    <div class="filter-bar compact-controls unified-controls">
      <div class="field field-view"><label>${t("view")}</label>${indicatorViewButtons(!!item.mapSlug, state.ind_display)}</div>
      ${miniSelectMarkup("f-var-select", t("variable"), state.ind_variable, data.variables)}
      ${tipo2Controls}
      ${tipos.length ? componentMultiSelectMarkup("f-tipos", componentLabel, tipos, state.ind_tipoMulti, tipo => typeColorFromData(data, tipo, item)) : ""}
      <div class="field"><label>${t("scale")}</label>
        <div class="mode-toggle" id="f-scale">
          <button data-scale="linear" class="${state.ind_scale === "linear" ? "active" : ""}">${t("lineal")}</button>
          <button data-scale="log" class="${state.ind_scale === "log" ? "active" : ""}">${t("log")}</button>
        </div>
      </div>
    </div>`;

  bindIndicatorViewButtons(ctrls);
  bindMiniSelect(ctrls, "f-var-select", value => { state.ind_variable = value; renderIndicatorViz(); });
  if(isIndustry && tipo2s.length){
    bindMiniSelect(ctrls, "f-industry-indicator-select", value => {
      const currentFlow = splitCompoundOption(state.ind_tipo2).tail;
      state.ind_tipo2 = industryTipo2FromParts(data, value, currentFlow);
      renderIndicatorViz();
    });
    bindMiniSelect(ctrls, "f-industry-flow-select", value => {
      const currentIndicator = splitCompoundOption(state.ind_tipo2).head;
      state.ind_tipo2 = industryTipo2FromParts(data, currentIndicator, value);
      renderIndicatorViz();
    });
  }else if(tipo2s.length){
    bindMiniSelect(ctrls, "f-tipo2-select", value => { state.ind_tipo2 = value; renderIndicatorViz(); });
  }
  bindComponentSelect(ctrls, "f-tipos");
  ctrls.querySelectorAll("[data-tipo]").forEach(b => {
    b.addEventListener("click", () => {
      stopPlayback();
      state.componentMenuOpen = true;
      const t = b.dataset.tipo;
      const cur = new Set(state.ind_tipoMulti);
      if(isAbsoluteIndicatorVariable(state.ind_variable) && t === "Total" && !cur.has("Total")){
        state.ind_tipoMulti = ["Total"];
        renderIndicatorViz();
        return;
      }
      if(cur.has(t)) cur.delete(t); else cur.add(t);
      if(isAbsoluteIndicatorVariable(state.ind_variable) && t !== "Total") cur.delete("Total");
      if(isAbsoluteIndicatorVariable(state.ind_variable) && cur.has("Total") && cur.size > 1){
        state.ind_tipoMulti = ["Total"];
        renderIndicatorViz();
        return;
      }
      if(cur.size === 0) cur.add(tipos.find(x => x !== "Total") || tipos[0]);
      state.ind_tipoMulti = Array.from(cur);
      renderIndicatorViz();
    });
  });
  ctrls.querySelectorAll("[data-component-action]").forEach(b => b.addEventListener("click", () => {
    stopPlayback();
    state.componentMenuOpen = true;
    const action = b.dataset.componentAction;
    const nonTotal = tipos.filter(t => t !== "Total");
    if(action === "all"){
      state.ind_tipoMulti = isAbsoluteIndicatorVariable(state.ind_variable)
        ? (nonTotal.length ? nonTotal : tipos.slice())
        : tipos.slice();
    }else if(action === "clear"){
      state.ind_tipoMulti = [];
    }
    renderIndicatorViz();
  }));
  ctrls.querySelectorAll("[data-scale]").forEach(b => b.addEventListener("click", () => { stopPlayback(); state.componentMenuOpen = false; state.ind_scale = b.dataset.scale; renderIndicatorViz(); }));

  const chart = document.getElementById("ind-chart");
  const legend = document.getElementById("ind-legend");
  const timeline = document.getElementById("ind-timeline");
  const info = document.getElementById("ind-info");

  // Filtra series
  const series = data.series.filter(s => s.variable === state.ind_variable)
    .filter(s => !tipo2s.length || s.tipo2 === state.ind_tipo2)
    .filter(s => state.ind_tipoMulti.includes(s.tipo));

  const showTimeline = true;
  timeline.style.display = showTimeline ? "" : "none";
  function drawCurrent(){
    const activeRange = getTimelineRange("indicator", data.years);
    const activeYears = activeRange.years;
    const rebasedSeries = rebaseIndexSeriesForRange(data, series, data.years, activeRange.start, activeRange.end);
    const rangeSeries = sliceSeriesByRange(rebasedSeries, data.years, activeRange.start, activeRange.end);
    const plottedSeries = showTimeline ? cutoffSeries(rangeSeries, activeYears, state.year) : rangeSeries;
    if(state.ind_display === "tabla") drawIndicatorTable(chart, activeYears, rangeSeries, item, { year: state.year });
    else if(state.ind_display === "area") drawIndicatorChart(chart, activeYears, plottedSeries, item, { stacked: true, year: state.year, domainSeries: rangeSeries });
    else drawIndicatorChart(chart, activeYears, plottedSeries, item, { stacked: false, year: state.year, domainSeries: rangeSeries });

    legend.innerHTML = "";
  }
  if(showTimeline){
    if(state.year < data.years[0] || state.year > data.years.at(-1)) state.year = data.years.at(-1);
    setupIndicatorTimeline(timeline, data.years, drawCurrent);
  } else {
    state.playing = false;
    clearIndicatorTimer();
  }
  drawCurrent();

  // Info strip
  info.innerHTML = `
    <span class="info-eyebrow">${tx(item.meta)}</span>
    <span class="info-text"><strong>${itemTitle(item)}.</strong> ${itemDescription(item)}</span>
    <span style="font-size:10px;letter-spacing:1px;color:var(--ink-mute);font-weight:700;text-transform:uppercase">${t("native")}</span>`;
}

function drawIndicatorChart(container, years, series, item, opts){
  container.innerHTML = "";
  if(!series.length){ container.innerHTML = `<div class="empty">Sin series para la selección.</div>`; return; }
  const dims = chartViewport(container);
  const { W, H } = dims;
  const compactView = dims.compact;
  const margin = lineChartMargins("indicator");
  const innerW = W - margin.left - margin.right, innerH = H - margin.top - margin.bottom;
  const svg = d3.select(container).append("svg").attr("class","chart-svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio","none");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain(d3.extent(years)).range([0, innerW]);
  const colored = series.map((s, i) => ({ ...s, _color: seriesColor(s, i, item) }));
  const domainColored = (opts.domainSeries || series).map((s, i) => ({ ...s, _color: seriesColor(s, i, item) }));

  if(opts.stacked){
    const keys = colored.map(s => s.id);
    const cmap = {}; colored.forEach(s => cmap[s.id] = s._color);
    const domainRows = years.map((y, i) => {
      const r = { year: y };
      domainColored.forEach(s => { r[s.id] = s.values[i] || 0; });
      return r;
    });
    const rows = years.map((y, i) => {
      const r = { year: y };
      colored.forEach(s => { r[s.id] = s.values[i] || 0; });
      return r;
    }).filter(r => opts.year == null || r.year <= opts.year);
    if(!rows.length){ container.innerHTML = `<div class="empty">Sin datos numéricos.</div>`; return; }
    const stack = d3.stack().keys(keys)(rows);
    const domainStack = d3.stack().keys(keys)(domainRows);
    const yMax = d3.max(domainStack, layer => d3.max(layer, d => d[1])) || 1;
    const yScale = (state.ind_scale === "log") ?
      d3.scaleLog().domain([Math.max(1, yMax * 1e-4), yMax]).range([innerH, 0]) :
      d3.scaleLinear().domain([0, yMax]).nice().range([innerH, 0]);

    g.append("g").attr("class","grid").call(d3.axisLeft(yScale).ticks(6).tickSize(-innerW).tickFormat("")).call(s => s.select(".domain").remove());
    g.append("g").attr("class","axis").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickValues(smartYearTicks(x, innerW, 8)).tickFormat(d3.format("d")));
    g.append("g").attr("class","axis").call(d3.axisLeft(yScale).ticks(6).tickFormat(d => fmt(d)));
    if(opts.year != null){
      drawActiveYearMarker(g, x, opts.year, innerW, innerH);
    }

    const areaGen = d3.area().x(d => x(d.data.year)).y0(d => yScale(d[0])).y1(d => yScale(d[1]));
    g.selectAll("path.layer").data(stack).join("path").attr("class","layer").attr("fill", d => cmap[d.key]).attr("opacity", .9).attr("d", areaGen);
    const unit = colored[0]?.variableUnit || colored[0]?.unit || "";
    const yearWidth = innerW / Math.max(1, years.length - 1);
    g.selectAll("rect.hover-year").data(rows).join("rect")
      .attr("class","hover-year")
      .attr("x", d => Math.max(0, x(d.year) - yearWidth / 2))
      .attr("y", 0)
      .attr("width", Math.max(8, yearWidth))
      .attr("height", innerH)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .on("mouseenter mousemove", (event, d) => {
        const rowsTooltip = colored.map(s => [tx(s.tipo), fmt(d[s.id], unit)]);
        const total = d3.sum(colored, s => d[s.id] || 0);
        showTooltip(event, `${itemTitle(item)} · ${d.year}`, [[tx("Total"), fmt(total, unit)], ...rowsTooltip]);
      })
      .on("mouseleave", hideTooltip);
    const labelPositions = [];
    colored.forEach((s, i) => {
      const stackTop = stack[i]?.[stack[i].length - 1];
      if(stackTop){
        const yPos = (yScale(stackTop[0]) + yScale(stackTop[1])) / 2;
        const label = endLabelText(tx(s.tipo), compactView ? 16 : 18);
        labelPositions.push({ x: x(stackTop.data.year) + 6, y: yPos, color: s._color, text: label, lines: endLabelLines(label) });
      }
    });
    protectActiveYearLabel(labelPositions, opts.year == null ? -Infinity : x(opts.year), innerW);
    adjustEndLabels(labelPositions, innerH, 18).forEach(lbl => {
      appendEndLabel(g, lbl);
    });
    raiseActiveYearLabel(g);
  } else {
    const allVals = domainColored.flatMap(s => s.values).filter(v => v != null && Number.isFinite(v) && (state.ind_scale !== "log" || v > 0));
    if(!allVals.length){ container.innerHTML = `<div class="empty">Sin datos numéricos.</div>`; return; }
    const yExt = d3.extent(allVals);
    const yScale = (state.ind_scale === "log") ?
      d3.scaleLog().domain([Math.max(1e-3, yExt[0]), yExt[1]]).range([innerH, 0]).nice() :
      d3.scaleLinear().domain([yExt[0] < 0 ? yExt[0] : 0, yExt[1]]).nice().range([innerH, 0]);

    g.append("g").attr("class","grid").call(d3.axisLeft(yScale).ticks(6).tickSize(-innerW).tickFormat("")).call(s => s.select(".domain").remove());
    g.append("g").attr("class","axis").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickValues(smartYearTicks(x, innerW, 8)).tickFormat(d3.format("d")));
    g.append("g").attr("class","axis").call(d3.axisLeft(yScale).ticks(6).tickFormat(d => fmt(d)));
    if(opts.year != null){
      drawActiveYearMarker(g, x, opts.year, innerW, innerH);
    }

    const unit = colored[0]?.variableUnit || colored[0]?.unit || "";
    if(unit){
      g.append("text").attr("class","axis-label").attr("x", -8).attr("y", -8).attr("text-anchor","start").text(displayUnitLabel(unit));
    }

    const line = d3.line().defined(d => d.v != null && Number.isFinite(d.v) && (state.ind_scale !== "log" || d.v > 0))
      .x(d => x(d.y)).y(d => yScale(d.v));
    colored.forEach((s, seriesIdx) => {
      const pts = years.map((y, i) => ({ y, v: s.values[i] }));
      g.append("path").datum(pts).attr("fill","none").attr("stroke", s._color).attr("stroke-width", 2).attr("opacity", .95).attr("d", line);
      g.selectAll(`circle.hover-line-${seriesIdx}`)
        .data(pts.filter(d => d.v != null && Number.isFinite(d.v) && (state.ind_scale !== "log" || d.v > 0)))
        .join("circle")
        .attr("class", `hover-line-${seriesIdx}`)
        .attr("cx", d => x(d.y))
        .attr("cy", d => yScale(d.v))
        .attr("r", 7)
        .attr("fill", "transparent")
        .style("pointer-events", "all")
        .on("mouseenter mousemove", (event, d) => showTooltip(event, tx(s.tipo), [
          [t("year"), d.y],
          ["Valor", fmt(d.v, unit)]
        ]))
        .on("mouseleave", hideTooltip);
    });
    // Etiquetas finales pegadas a la línea (estilo v1)
    const labelPositions = [];
    colored.forEach(s => {
      const idx = s.values.length - 1;
      let lastV = null, lastY = idx;
      while(lastY >= 0 && lastV == null){ if(s.values[lastY] != null) lastV = s.values[lastY]; else lastY--; }
      if(lastV != null){
        const label = endLabelText(tx(s.tipo), compactView ? 16 : 18);
        labelPositions.push({ x: x(years[lastY]) + 6, y: yScale(lastV), color: s._color, text: label, lines: endLabelLines(label) });
      }
    });
    protectActiveYearLabel(labelPositions, opts.year == null ? -Infinity : x(opts.year), innerW);
    adjustEndLabels(labelPositions, innerH, 18).forEach(lbl => {
      appendEndLabel(g, lbl);
    });
    raiseActiveYearLabel(g);
  }
}

function drawIndicatorTable(container, years, series, item, opts = {}){
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "table-wrap indicator-table-wrap";
  if(!series.length){ wrap.innerHTML = `<div class="empty">Sin series.</div>`; container.appendChild(wrap); return; }
  const current = opts.year == null ? years.at(-1) : nearestTimelineYear(years, opts.year);
  const visibleYears = years.filter(y => y <= current);
  const unit = series[0]?.variableUnit || series[0]?.unit || "";
  const unitDisplay = displayUnitLabel(unit);
  const seriesHead = s => {
    const label = [tx(s.tipo), tx(s.tipo2)].filter(Boolean).join(" · ");
    const title = [label, unitDisplay].filter(Boolean).join(" · ");
    return `<th class="series-head" title="${escAttr(title)}"><span class="series-label">${escHtml(label)}</span>${unitDisplay ? `<span class="series-unit">${escHtml(unitDisplay)}</span>` : ""}</th>`;
  };
  wrap.innerHTML = `<table class="data-table year-rows indicator-table">
    <thead><tr>
      <th>${t("year")}</th>
      ${series.map(seriesHead).join("")}
    </tr></thead>
    <tbody>${visibleYears.map(y => {
      const idx = years.indexOf(y);
      return `<tr class="${y === current ? "active-year-row" : ""}">
        <td>${y}</td>
        ${series.map(s => `<td>${fmt(s.values[idx])}</td>`).join("")}
      </tr>`;
    }).join("")}</tbody></table>`;
  container.appendChild(wrap);
  const active = wrap.querySelector(".active-year-row");
  if(active) active.scrollIntoView({ block: "nearest" });
}

/* ====== Indicator MAPA ====== */
function uniqueMapValues(combos, key){
  return Array.from(new Set(combos.map(c => c[key]).filter(Boolean)));
}
function preferredMapCombo(combos, indicator, category){
  return combos.find(c => c.indicator === indicator && c.category === category) ||
    combos.find(c => c.indicator === indicator && c.category === "Total") ||
    combos.find(c => c.indicator === indicator) ||
    combos[0];
}
function mapCategoryLabel(item){
  if(item?.id === "cultivos") return t("crop");
  if(item?.id === "bosques") return t("category");
  return t("component");
}

function renderIndicatorMapa(item, mapData){
  document.getElementById("ind-canvas")?.classList.add("map-canvas");
  const ctrls = document.getElementById("ind-controls");
  // A newer async render may have replaced #main already; bail out instead of throwing.
  if(!ctrls) return;
  const combos = mapData.combos;
  const activeCombo = combos.find(c => c.id === state.ind_mapCombo) || combos[0];
  const indicators = uniqueMapValues(combos, "indicator");
  const categories = uniqueMapValues(combos.filter(c => c.indicator === activeCombo.indicator), "category");
  const activeView = state.ind_display === "tabla" ? "tabla" : "mapa";
  ctrls.innerHTML = `
    <div class="filter-bar compact-controls unified-controls">
      <div class="field field-view"><label>${t("view")}</label>${indicatorViewButtons(true, activeView)}</div>
      ${miniSelectMarkup("f-mapindicator-select", t("indicator"), activeCombo.indicator, indicators)}
      ${miniSelectMarkup("f-mapcategory-select", mapCategoryLabel(item), activeCombo.category, categories)}
      <div class="spacer"></div>
    </div>`;
  bindIndicatorViewButtons(ctrls);
  bindMiniSelect(ctrls, "f-mapindicator-select", value => {
    const picked = preferredMapCombo(combos, value, activeCombo.category);
    if(picked) state.ind_mapCombo = picked.id;
    renderIndicatorViz();
  });
  bindMiniSelect(ctrls, "f-mapcategory-select", value => {
    const picked = preferredMapCombo(combos, activeCombo.indicator, value);
    if(picked) state.ind_mapCombo = picked.id;
    renderIndicatorViz();
  });

  const chart = document.getElementById("ind-chart");
  const legend = document.getElementById("ind-legend");
  const timeline = document.getElementById("ind-timeline");
  const info = document.getElementById("ind-info");

  timeline.style.display = "";
  const years = mapData.years;
  if(state.year < years[0] || state.year > years.at(-1)) state.year = years.at(-1);
  state.year = nearestTimelineYear(years, state.year);

  function drawCurrentMap(){
    if(state.ind_display === "tabla") drawMapProvinceTable(chart, mapData, item);
    else renderMap(chart, mapData, item);
  }
  drawCurrentMap();
  setupIndicatorTimeline(timeline, years, () => {
    if(state.ind_display === "tabla") drawCurrentMap();
    else if(chart.__updateYear) chart.__updateYear(state.year);
    else drawCurrentMap();
  });

  legend.innerHTML = "";
  info.innerHTML = `
    <span class="info-eyebrow">${tx(item.meta)}</span>
    <span class="info-text"><strong>${t("mapProvince")}:</strong> ${tx(combos.find(c => c.id === state.ind_mapCombo)?.label || "")}. ${t("mapInfo")}</span>
    <span style="font-size:10px;letter-spacing:1px;color:var(--ink-mute);font-weight:700;text-transform:uppercase">${t("native")}</span>`;
}

function drawMapProvinceTable(container, mapData, item){
  container.innerHTML = "";
  const combo = mapData.combos.find(c => c.id === state.ind_mapCombo) || mapData.combos[0];
  const year = nearestTimelineYear(mapData.years, state.year);
  const idx = mapData.years.indexOf(year);
  const rows = Object.entries(mapData.provinces || {}).map(([iso, province]) => {
    const value = combo.values?.[iso]?.[idx];
    return {
      iso,
      name: province?.name || iso,
      value: value != null && Number.isFinite(value) ? value : null
    };
  }).sort((a, b) => {
    if(a.value == null && b.value == null) return a.name.localeCompare(b.name, "es");
    if(a.value == null) return 1;
    if(b.value == null) return -1;
    return b.value - a.value;
  });
  const label = [tx(combo.indicator), tx(combo.category)].filter(Boolean).join(" · ");
  const unit = displayUnitLabel(combo.unit);
  const wrap = document.createElement("div");
  wrap.className = "table-wrap indicator-table-wrap map-table-wrap";
  wrap.innerHTML = `<table class="data-table year-rows indicator-table map-province-table">
    <thead><tr>
      <th>${state.lang === "en" ? "Province" : "Provincia"}</th>
      <th>${state.lang === "en" ? "Year" : "Año"}</th>
      <th>${escHtml(label)}${unit ? ` ${escHtml(unit)}` : ""}</th>
    </tr></thead>
    <tbody>${rows.map(row => `<tr>
      <td>${escHtml(row.name)}</td>
      <td>${year}</td>
      <td>${fmt(row.value, combo.unit)}</td>
    </tr>`).join("")}</tbody>
  </table>`;
  container.appendChild(wrap);
}

function renderMap(container, mapData, item){
  container.innerHTML = "";
  if(!GEO){ container.innerHTML = `<div class="empty">Cargando geografía…</div>`; return; }
  const combo = mapData.combos.find(c => c.id === state.ind_mapCombo) || mapData.combos[0];
  const allVals = []; for(const arr of Object.values(combo.values)) for(const v of arr) if(v != null && Number.isFinite(v)) allVals.push(v);
  const extent = d3.extent(allVals);
  const minVal = Number.isFinite(extent[0]) ? extent[0] : 0;
  const maxVal = Number.isFinite(extent[1]) && extent[1] > minVal ? extent[1] : minVal + 1;
  const mapPalette = ["#fff7d6","#ead77f","#c7b640","#8d9b35","#5f842f","#2d6030","#123624"];
  const colorIndex = d3.scalePow().exponent(0.72).domain([minVal, maxVal]).range([0, mapPalette.length - 1]).clamp(true);
  const color = v => mapPalette[Math.max(0, Math.min(mapPalette.length - 1, Math.floor(colorIndex(v))))];
  const idx = mapData.years.indexOf(state.year);
  const values = new Map();
  for(const [iso, arr] of Object.entries(combo.values)) values.set(iso, arr[idx]);

  const box = container.getBoundingClientRect();
  const W = Math.max(360, box.width || 800), H = Math.max(430, box.height || 560);
  const svg = d3.select(container).append("svg").attr("class","map-svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio","xMidYMid meet");

  const canaryIso = new Set(["ES-GC","ES-TF"]);
  const isCanary = f => canaryIso.has(f.properties.iso_3166_2);
  const hasCanaryData = mapData.combos.some(c =>
    [...canaryIso].some(iso => (c.values?.[iso] || []).some(v => v != null && Number.isFinite(v)))
  );
  const main = { type:"FeatureCollection", features: GEO.features.filter(f => !isCanary(f)) };
  const canary = { type:"FeatureCollection", features: hasCanaryData ? GEO.features.filter(isCanary) : [] };
  const mainExtent = isCompactViewport()
    ? [[10, 44], [W - 10, Math.max(280, H - 138)]]
    : [[24,18],[W-24,H-28]];
  const mainProj = d3.geoMercator().fitExtent(mainExtent, main);
  const mainPath = d3.geoPath(mainProj);

  function fillFor(f){
    const v = values.get(f.properties.iso_3166_2);
    return v == null ? "#ece6d6" : color(v);
  }
  let hoverTarget = null;
  function tooltipRowsFor(iso){
    return [
      [combo.indicator, fmt(values.get(iso), combo.unit)],
      [t("year"), state.year]
    ];
  }
  function bindHover(sel){
    sel.on("mouseenter", (event, f) => {
      const iso = f.properties.iso_3166_2;
      const name = mapData.provinces[iso]?.name || f.properties.name;
      hoverTarget = { event, iso, name };
      showTooltip(event, name, tooltipRowsFor(iso));
    }).on("mousemove", (event, f) => {
      const iso = f.properties.iso_3166_2;
      const name = mapData.provinces[iso]?.name || f.properties.name;
      hoverTarget = { event, iso, name };
      moveTooltip(event);
    }).on("mouseleave", () => {
      hoverTarget = null;
      hideTooltip();
    });
  }

  const mainPaths = svg.append("g").selectAll("path").data(main.features).join("path")
    .attr("class","map-province").attr("d", mainPath).attr("fill", fillFor).call(bindHover);

  let canaryPaths = null;
  if(canary.features.length){
    const cw = Math.min(168, W * 0.15), ch = Math.min(58, H * 0.12);
    const cx = 18, cy = Math.max(18, H - ch - 82);
    const inset = svg.append("g").attr("class", "canarias-inset").attr("transform", `translate(${cx},${cy})`);
    inset.append("rect").attr("width", cw).attr("height", ch).attr("fill","rgba(251,248,241,.78)").attr("stroke","#d2c8b2");
    inset.append("text").attr("x", 6).attr("y", 11).attr("font-family","Inter,sans-serif").attr("font-size",7.5).attr("font-weight",700).attr("letter-spacing",1).attr("fill","#8a8c8f").text("CANARIAS");
    const cProj = d3.geoMercator().fitExtent([[7,17],[cw-7,ch-7]], canary);
    canaryPaths = inset.append("g").selectAll("path").data(canary.features).join("path")
      .attr("class","map-province").attr("d", d3.geoPath(cProj)).attr("fill", fillFor).call(bindHover);
  }

  const mini = drawMapMiniChart(container, mapData, combo, color);

  container.__updateYear = function(year){
    const idx2 = mapData.years.indexOf(year);
    const newV = new Map();
    for(const [iso, arr] of Object.entries(combo.values)) newV.set(iso, arr[idx2]);
    mainPaths.attr("fill", f => { const v = newV.get(f.properties.iso_3166_2); return v == null ? "#ece6d6" : color(v); });
    if(canaryPaths) canaryPaths.attr("fill", f => { const v = newV.get(f.properties.iso_3166_2); return v == null ? "#ece6d6" : color(v); });
    values.clear();
    for(const [k, v] of newV) values.set(k, v);
    mini.update(year);
    if(hoverTarget){
      showTooltip(hoverTarget.event, hoverTarget.name, tooltipRowsFor(hoverTarget.iso));
    }
  };

  const swatches = mapPalette.map(c => `<span style="display:block;flex:1;height:12px;background:${c}"></span>`).join("");
  const flowLegend = document.getElementById("ind-legend");
  if(flowLegend) flowLegend.innerHTML = "";
  container.insertAdjacentHTML("beforeend", `
    <div class="map-legend-overlay">
      <div class="map-legend-title">${tx(combo.indicator)} · ${tx(combo.category)}${displayUnitLabel(combo.unit) ? ` ${displayUnitLabel(combo.unit)}` : ""}</div>
      <div class="map-legend-scale">
        <span>${fmt(minVal)}</span>
        <div class="map-legend-ramp">${swatches}</div>
        <span>${fmt(maxVal)}</span>
      </div>
    </div>`);
}

function drawMapMiniChart(container, mapData, combo){
  const noop = { update(){} };
  if(isCompactViewport() && !state.mapMiniUserSet) state.mapMiniOpen = false;
  const totals = mapData.years.map((year, i) => ({
    year,
    value: d3.sum(Object.values(combo.values), arr => {
      const v = arr?.[i];
      return v != null && Number.isFinite(v) ? v : 0;
    })
  })).filter(d => Number.isFinite(d.value));
  if(!totals.length) return noop;
  if(!state.mapMiniOpen){
    const toggle = document.createElement("button");
    toggle.className = "map-mini-toggle";
    toggle.type = "button";
    toggle.title = "Mostrar serie temporal";
    toggle.textContent = "↗";
    toggle.addEventListener("click", () => {
      state.mapMiniOpen = true;
      state.mapMiniUserSet = true;
      renderMap(container, mapData, CATALOG_OTHER[state.group]?.find(i => i.id === state.vizId) || {});
    });
    container.appendChild(toggle);
    return noop;
  }
  const panel = document.createElement("div");
  panel.className = "map-mini-chart";
  panel.innerHTML = `
    <button type="button" title="Ocultar serie temporal" aria-label="Ocultar serie temporal">×</button>
    <div class="map-mini-title">${tx(combo.indicator)} · ${tx(combo.category)}</div>
    <svg class="map-mini-svg"></svg>`;
  container.appendChild(panel);
  panel.querySelector("button").addEventListener("click", () => {
    state.mapMiniOpen = false;
    state.mapMiniUserSet = true;
    renderMap(container, mapData, CATALOG_OTHER[state.group]?.find(i => i.id === state.vizId) || {});
  });

  const W = 330, H = 124;
  const margin = { top: 10, right: 14, bottom: 24, left: 44 };
  const innerW = W - margin.left - margin.right, innerH = H - margin.top - margin.bottom;
  const svg = d3.select(panel.querySelector("svg")).attr("viewBox", `0 0 ${W} ${H}`);
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const x = d3.scaleLinear().domain(d3.extent(totals, d => d.year)).range([0, innerW]);
  const y = d3.scaleLinear().domain([0, d3.max(totals, d => d.value) || 1]).nice().range([innerH, 0]);
  g.append("g").attr("class","axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickValues(smartYearTicks(x, innerW, 5, 32)).tickFormat(d3.format("d")));
  g.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(3).tickFormat(d => fmt(d)));
  g.append("path")
    .datum(totals)
    .attr("fill","none")
    .attr("stroke", "#344f24")
    .attr("stroke-width", 1.8)
    .attr("d", d3.line().x(d => x(d.year)).y(d => y(d.value)));
  const point = g.append("circle").attr("r", 4.2).attr("fill", "#c93324").attr("stroke", "#fff").attr("stroke-width", 1.4);
  function update(year){
    const d = totals.find(p => p.year === nearestTimelineYear(mapData.years, year)) || totals.at(-1);
    point.attr("cx", x(d.year)).attr("cy", y(d.value));
  }
  update(state.year);
  return { update };
}

function shortList(values = [], max = 7){
  const clean = values.filter(Boolean).map(v => tx(v));
  if(clean.length <= max) return clean.join(", ");
  const rest = clean.length - max;
  return `${clean.slice(0, max).join(", ")} ${state.lang === "en" ? `and ${rest} more` : `y ${rest} más`}`;
}

function countLabel(n, singular, plural){
  return `${n} ${n === 1 ? singular : plural}`;
}

function indicatorCoverageText(data){
  if(!data?.years?.length) return "";
  const first = data.years[0];
  const last = data.years.at(-1);
  const seriesCount = data.series?.length || 0;
  const componentCount = data.tipos?.length || 0;
  const indicatorCount = data.tipo2s?.length || data.variables?.length || 0;
  const indicatorName = data.tipo2s?.length
    ? (state.lang === "en" ? ["indicator", "indicators"] : ["indicador", "indicadores"])
    : (state.lang === "en" ? ["metric", "metrics"] : ["métrica", "métricas"]);
  if(state.lang === "en"){
    return `<p><strong>Coverage.</strong> ${first}-${last}; ${countLabel(seriesCount, "series", "series")}; ${countLabel(componentCount, "component", "components")}; ${countLabel(indicatorCount, indicatorName[0], indicatorName[1])}.</p>`;
  }
  return `<p><strong>Cobertura.</strong> ${first}-${last}; ${countLabel(seriesCount, "serie", "series")}; ${countLabel(componentCount, "componente", "componentes")}; ${countLabel(indicatorCount, indicatorName[0], indicatorName[1])}.</p>`;
}

function indicatorStructureText(item, data){
  const componentList = shortList(data?.tipos || []);
  const dimensionList = shortList((data?.tipo2s?.length ? data.tipo2s : data?.variables) || []);
  const hasMap = !!item?.mapSlug;
  if(state.lang === "en"){
    return `<p><strong>What it measures.</strong> ${componentList ? `Components or categories: ${componentList}. ` : ""}${dimensionList ? `${data?.tipo2s?.length ? "Indicators" : "Metrics"}: ${dimensionList}. ` : ""}${hasMap ? "It also includes provincial maps." : "It is presented as national series."}</p>`;
  }
  return `<p><strong>Qué mide.</strong> ${componentList ? `Componentes o categorías: ${componentList}. ` : ""}${dimensionList ? `${data?.tipo2s?.length ? "Indicadores" : "Métricas"}: ${dimensionList}. ` : ""}${hasMap ? "Incluye también mapas provinciales." : "Se presenta como serie nacional."}</p>`;
}

function openIndicatorModal(item, data){
  const intro = state.lang === "en"
    ? "This viewer shows long-run historical series built from the CAHE databases. It combines trend charts, area views, tables and provincial maps when spatial data are available. The controls change the measured variable, the component or category, the scale and the year shown in the timeline."
    : "Este visor muestra series históricas de largo plazo construidas a partir de las bases CAHE. Combina tendencias, áreas, tablas y mapas provinciales cuando existe información espacial. Los controles permiten cambiar la variable medida, el componente o categoría, la escala y el año mostrado en la línea temporal.";
  const readingGuide = state.lang === "en"
    ? "Values should be read as comparable annual series within each selected unit and category. When several components are active, the chart compares their trajectories; in maps, the color scale is fixed for the selected indicator so that changes through time are comparable."
    : "Los valores deben leerse como series anuales comparables dentro de cada unidad y categoría seleccionada. Cuando se activan varios componentes, la figura compara sus trayectorias; en los mapas, la escala de color queda fijada para el indicador elegido para que el cambio temporal sea comparable.";
  els.modalContent.innerHTML = `
    <span class="modal-eyebrow">${t("infoMethod")} — ${tx(item.meta)}</span>
    <h2>${itemTitle(item)}</h2>
    <p>${itemDescription(item)}</p>
    ${indicatorStructureText(item, data)}
    <p>${intro}</p>
    <p>${readingGuide}</p>
    ${indicatorCoverageText(data)}`;
  els.modal.classList.add("open");
}

function openCitationModal(title, citation){
  els.modalContent.innerHTML = `
    <span class="modal-eyebrow">${t("howToCite")}</span>
    <h2>${tx(title)}</h2>
    <div class="citation-box">${citation}</div>
    <div class="cta-row">
      <button class="cta" type="button" id="copy-citation">${t("cite")}</button>
    </div>`;
  els.modal.classList.add("open");
  const copy = els.modalContent.querySelector("#copy-citation");
  if(copy) copy.addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText(citation);
      copy.textContent = t("copied");
    }catch(_){
      copy.textContent = t("cite");
    }
  });
}

function citationForItem(item){ return item?.citation || CITATIONS[item?.id] || DEFAULT_CITATION; }
function citationForGlobal(){ return CITATIONS.global; }

/* ====== Visor global (4 análisis nativos) ====== */
async function renderGlobalViz(){
  const main = document.getElementById("viz-main");
  const analysis = GLOBAL_ANALYSES.find(a => a.id === state.vizId) || GLOBAL_ANALYSES[0];
  state.globalPlaying = false;
  state.playing = false;
  clearIndicatorTimer();
  clearGlobalTimer();
  const globalCitation = citationForGlobal();
  const globalTools = renderPanelTools(`${V1_DOCS}/cahe_datos_integrados.xlsx`, `${V1_DOCS}/globales_metodologia.pdf`, true, ZENODO_CAHE_URL, globalCitation, true);
  main.innerHTML = `
    <div class="viz${state.controlsCollapsed ? " controls-collapsed" : ""}">
      <div class="indicator-head with-tools global-head">
        <div class="meta global-titleline">
          <h1>${tx(analysis.label)}</h1>
          <span>${tx(analysis.sub)}</span>
        </div>
        ${globalTools}
      </div>
      <div id="viz-body" style="flex:1 1 auto;display:flex;flex-direction:column;min-height:0;gap:10px">
        <div class="loading"><span class="spinner"></span><strong>${t("loadingData")}</strong></div>
      </div>
    </div>`;
  const infoBtn = main.querySelector("#btn-info");
  if(infoBtn) infoBtn.addEventListener("click", () => openGlobalModal(analysis.id));
  const citeBtn = main.querySelector("#btn-cite");
  if(citeBtn) citeBtn.addEventListener("click", () => openCitationModal(tx(analysis.label), globalCitation));
  bindControlsToggle(main);

  await loadGlobalData();
  const body = main.querySelector("#viz-body");
  if(analysis.id === "tendencias")          renderTendencias(body);
  else if(analysis.id === "correlacion")    renderCorrelacion(body);
  else if(analysis.id === "descomposicion") renderLMDI(body);
  else if(analysis.id === "desacoplamiento") renderTapio(body);
}

function translatedGlobalInfo(id){
  const base = MODAL_INFO[id] || {};
  if(state.lang !== "en") return base;
  const info = {
    tendencias: {
      titulo: "Information",
      datos: "Annual historical series for energy, materials, water, nitrogen, CO₂ emissions, total emissions and cropland use. Data can be displayed as absolute values, growth rates, index values and intensity over GDP.",
      fuentes: "Spanish data come from CAHE estimates based on historical records and modelling. Global data combine the Global Carbon Project, PRIMAP-hist, Krausmann et al., Malanima, LUH2, Maddison and FAOSTAT/Smil-based nitrogen estimates.",
      interpretacion: "Comparing Spain with the world highlights the Great Acceleration since the mid-twentieth century. Spain shows strong industrialization and later slowdowns after 2008 in several indicators, while global trends often continue to rise."
    },
    correlacion: {
      titulo: "Correlation — bivariate scatter",
      datos: "A temporal scatter plot between two selected variables. Each point represents one year and can be shown for Spain, the world or both. The X and Y axes can use different indicators, metrics and scales.",
      fuentes: "Spanish series come from CAHE. International series combine Global Carbon Project, PRIMAP-hist, Maddison, Malanima, Krausmann et al., LUH2 and FAOSTAT/Smil-based nitrogen estimates. The viewer only enables combinations with comparable data.",
      interpretacion: "Read the point cloud as a historical trajectory rather than as a static correlation. Slope, curvature, jumps and direction changes show when two processes move together and when they diverge."
    },
    descomposicion: {
      titulo: "Information",
      datos: "Decomposition of environmental indicators through logarithmic, multiplicative, additive and waterfall views, showing absolute and relative changes between periods.",
      fuentes: "IPAT decomposes impact as Population × Affluence × Technology. LMDI follows Ang (2015) and attributes the total change between two periods to each factor.",
      interpretacion: "Positive values increase total impact; negative values reduce it. Waterfall and additive views show how each factor contributes to the observed change."
    },
    desacoplamiento: {
      titulo: "Decoupling — Tapio",
      datos: "Tapio decoupling classification comparing the growth rate of an environmental indicator with the growth rate of GDP or the selected economic variable over moving windows.",
      fuentes: "The method follows Tapio (2005): the relative change in impact divided by the relative change in GDP. Environmental series come from CAHE and GDP from the Maddison Project.",
      interpretacion: "Strong decoupling means GDP grows while impact falls. Weak decoupling means both grow but impact grows more slowly. Coupling means similar growth, while expansive coupling means impact grows proportionally faster. Recession periods are read separately because simultaneous decline in GDP and impact is not the same as structural improvement."
    }
  };
  return { ...base, ...(info[id] || {}), referencias: base.referencias, actualizacion: base.actualizacion };
}

function openGlobalModal(id){
  const m = translatedGlobalInfo(id);
  els.modalContent.innerHTML = `
    <span class="modal-eyebrow">${state.lang === "en" ? "Information" : "Información"}</span>
    <h2>${tx(m.titulo || "—")}</h2>
    ${m.datos ? `<h3>${state.lang === "en" ? "What it shows" : "Qué muestra"}</h3><p>${m.datos}</p>` : ""}
    ${m.fuentes ? `<h3>${state.lang === "en" ? "How it is built" : "Cómo se construye"}</h3><p>${m.fuentes}</p>` : ""}
    ${m.interpretacion ? `<h3>${state.lang === "en" ? "How to read it" : "Cómo leerlo"}</h3><p>${m.interpretacion}</p>` : ""}
    <p style="margin-top:14px;font-style:italic;color:var(--ink-mute);font-size:12px">${state.lang === "en" ? "Updated" : "Actualización"}: ${m.actualizacion || "—"}</p>`;
  els.modal.classList.add("open");
}
function closeModal(){ els.modal.classList.remove("open"); }

function getSeries(indicador, variable, area){
  return DATA_LONG.filter(r => r.indicador === indicador && r.variable === variable && r.area === area).filter(r => r.valor != null).sort((a, b) => a.year - b.year);
}

function timelineYearsFromSeries(series){
  const years = new Set();
  series.forEach(s => s.data.forEach(d => {
    if(d.year != null && d.valor != null && Number.isFinite(d.valor)) years.add(d.year);
  }));
  return Array.from(years).sort((a, b) => a - b);
}

function ensureGlobalYear(years){
  if(!years.length) return null;
  const min = years[0], max = years[years.length - 1];
  if(state.globalYear == null || state.globalYear < min || state.globalYear > max) state.globalYear = max;
  state.globalYear = nearestTimelineYear(years, state.globalYear);
  return state.globalYear;
}

function clearGlobalTimer(){
  window.__globalPlayTimerToken = (window.__globalPlayTimerToken || 0) + 1;
  if(window.__globalPlayTimer){
    clearInterval(window.__globalPlayTimer);
    window.__globalPlayTimer = null;
  }
}

function startGlobalTimer(years, rerender){
  clearGlobalTimer();
  if(!years.length) return;
  const token = (window.__globalPlayTimerToken || 0) + 1;
  window.__globalPlayTimerToken = token;
  const first = years[0], last = years.at(-1);
  if(state.globalYear >= last){
    state.globalYear = first;
    rerender();
  } else {
    state.globalYear = nearestTimelineYear(years, state.globalYear);
    rerender();
  }
  window.__globalPlayTimer = setInterval(() => {
    if(window.__globalPlayTimerToken !== token || !state.globalPlaying){
      clearInterval(window.__globalPlayTimer);
      window.__globalPlayTimer = null;
      return;
    }
    const idx = Math.max(0, years.findIndex(y => y >= state.globalYear));
    if(idx >= years.length - 1){
      state.globalYear = last;
      state.globalPlaying = false;
      clearGlobalTimer();
      rerender();
      return;
    }
    state.globalYear = years[idx + 1];
    if(state.globalYear >= last){
      state.globalPlaying = false;
      clearGlobalTimer();
    }
    rerender();
  }, timelineDelay(state.globalSpeed));
}

function bindGlobalTimeline(body, years, rerender){
  const tl = body.querySelector("#global-timeline");
  if(!tl || !years.length) return;
  const play = tl.querySelector("#global-play");
  const slider = tl.querySelector("#global-year-slider");
  const initialRange = getTimelineRange("global", years);
  const current = ensureGlobalYear(initialRange.years);
  slider.min = years[0];
  slider.max = years[years.length - 1];
  slider.step = 1;
  slider.value = current;
  tl.querySelector("#global-year-readout").textContent = current;
  const start = tl.querySelector("#global-year-start");
  const end = tl.querySelector("#global-year-end");
  const range = tl.querySelector("#global-year-range");
  if(start) start.textContent = initialRange.start;
  if(end) end.textContent = initialRange.end;
  if(range) range.textContent = `${initialRange.start}–${initialRange.end}`;
  updateTimelineRangeUi(tl, slider, years, "global");
  updateTimelineBubble(tl, slider, current);
  setPlayButtonState(play, state.globalPlaying);
  bindTimelineRangeHandles(tl, years, "global", () => {
    const active = getTimelineRange("global", years);
    state.globalYear = nearestTimelineYear(active.years, state.globalYear);
    slider.value = state.globalYear;
    tl.querySelector("#global-year-readout").textContent = state.globalYear;
    updateTimelineRangeUi(tl, slider, years, "global");
    setPlayButtonState(play, false);
    clearGlobalTimer();
    rerender();
  });
  play.addEventListener("click", () => {
    state.globalPlaying = !state.globalPlaying;
    setPlayButtonState(play, state.globalPlaying);
    if(state.globalPlaying) startGlobalTimer(getTimelineRange("global", years).years, rerender);
    else {
      clearGlobalTimer();
      setPlayButtonState(play, false);
    }
  });
  slider.addEventListener("input", e => {
    const active = getTimelineRange("global", years);
    state.globalYear = nearestTimelineYear(active.years, e.target.value);
    state.globalPlaying = false;
    clearGlobalTimer();
    updateTimelineRangeUi(tl, slider, years, "global");
    updateTimelineBubble(tl, slider, state.globalYear);
    rerender();
  });
  bindSpeedMenu(tl, () => state.globalSpeed, v => { state.globalSpeed = v; }, () => {
    if(state.globalPlaying) startGlobalTimer(getTimelineRange("global", years).years, rerender);
  });
}

function globalTimelineMarkup(){
  return `<div class="viz-timeline global-timeline" id="global-timeline">
    <button class="play-btn${state.globalPlaying ? " active" : ""}" id="global-play" type="button" aria-label="${t("play")}"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button>
    ${speedMenuMarkup(state.globalSpeed, [1,2,4,8])}
    <div class="year-readout" id="global-year-readout">${state.globalYear ?? ""}</div>
    <div class="timeline-bound timeline-start" id="global-year-start"></div>
    <div class="timeline-track-wrap">
      <span class="timeline-selection" data-range-selection></span>
      <button class="timeline-limit timeline-limit-start" data-range-handle="start" type="button" role="slider" aria-label="${state.lang === "en" ? "Start year" : "Año inicial"}" aria-valuemin="" aria-valuemax="" aria-valuenow=""><span class="timeline-handle-year"></span></button>
      <input class="year-slider" id="global-year-slider" type="range">
      <button class="timeline-limit timeline-limit-end" data-range-handle="end" type="button" role="slider" aria-label="${state.lang === "en" ? "End year" : "Año final"}" aria-valuemin="" aria-valuemax="" aria-valuenow=""><span class="timeline-handle-year"></span></button>
      <span class="year-bubble" id="global-year-bubble" data-year-bubble></span>
    </div>
    <div class="timeline-bound timeline-end" id="global-year-end"></div>
    <div class="year-range" id="global-year-range"></div>
  </div>`;
}

function renderTendencias(body){
  const i = state.trendIndicator;
  const variableOptions = globalVariableOptions(i);
  if(!variableOptions.includes(state.trendVariable)){
    state.trendVariable = variableOptions.includes("Per cápita") ? "Per cápita" : (variableOptions[0] || "Absoluto");
  }
  const v = state.trendVariable, a = state.trendArea;
  body.innerHTML = `
    <div class="controls-shell" id="global-controls-shell">
      <div class="filter-bar compact-controls global-controls">
        ${miniSelectMarkup("t-ind-select", t("indicator"), i, INDICATORS)}
        ${miniSelectMarkup("t-var-select", t("metric"), v, variableOptions)}
        <div class="field">
          <label>${t("geographicArea")}</label>
          <div class="mode-toggle" id="t-area-toggle">
            <button data-area="Both" class="${a === "Both" ? "active" : ""}">${tx("Ambos")}</button>
            <button data-area="España" class="${a === "España" ? "active" : ""}">${tx("España")}</button>
            <button data-area="Mundo" class="${a === "Mundo" ? "active" : ""}">${tx("Mundo")}</button>
          </div>
        </div>
        <div class="controls-drawer global-drawer" id="global-options-drawer" aria-label="${state.lang === "en" ? "Global perspective options" : "Opciones de perspectiva global"}">
        <button class="drawer-info" type="button" tabindex="-1" title="${state.lang === "en" ? "Moving average smooths the series. Trend shows R² and a fitted line. Explore marks maximum/minimum, today's level and structural changes. Growth highlights the strongest 5-, 10- and 25-year periods." : "Media móvil suaviza la serie. Tendencia muestra R² y recta ajustada. Explorar marca máximo/mínimo, relación con el valor actual y cambios estructurales. Crecimiento señala los periodos de 5, 10 y 25 años con mayor subida o caída."}" aria-label="${state.lang === "en" ? "Settings information" : "Información de ajustes"}">i</button>
        <div class="drawer-section">
          <label>${state.lang === "en" ? "Moving average" : "Media móvil"}</label>
          <div class="analysis-buttons">
            ${["none","5","10","20"].map(ma => `<button class="analysis-btn${state.trendMA === ma ? " active" : ""}" data-ma="${ma}" type="button" title="${ma === "none" ? "Sin media móvil" : `Media móvil ${ma} años`}">${ma === "none" ? "—" : ma}</button>`).join("")}
          </div>
        </div>
        <div class="drawer-section">
          <label>${state.lang === "en" ? "Trend" : "Tendencia"}</label>
          <div class="analysis-buttons">
            <button class="analysis-btn${state.trendShowR2 ? " active" : ""}" data-trend-flag="trendShowR2" type="button" title="Mostrar R²">R²</button>
            <button class="analysis-btn${state.trendShowLine ? " active" : ""}" data-trend-flag="trendShowLine" type="button" title="Mostrar línea de tendencia">↗</button>
          </div>
        </div>
        <div class="drawer-section">
          <label>${state.lang === "en" ? "Explore" : "Explorar"}</label>
          <div class="analysis-buttons wrap">
            <button class="analysis-btn${state.trendShowMax ? " active" : ""}" data-trend-flag="trendShowMax" type="button" title="Máximo y mínimo">MAX<br>MIN</button>
            <button class="analysis-btn${state.trendShowToday ? " active" : ""}" data-trend-flag="trendShowToday" type="button" title="Relación con el valor actual">←</button>
            <button class="analysis-btn${state.trendShowBreaks ? " active" : ""}" data-trend-flag="trendShowBreaks" type="button" title="Cambios estructurales">ϟ</button>
          </div>
        </div>
        <div class="drawer-section">
          <label>${state.lang === "en" ? "Growth" : "Crecimiento"}</label>
          <div class="analysis-buttons wrap">
            ${[5,10,25].map(w => `<button class="analysis-btn period-btn${state.trendPeriodWindows.includes(w) ? " active" : ""}" data-period-window="${w}" type="button" title="Periodos extremos ${w} años">${w}a</button>`).join("")}
          </div>
        </div>
        </div>
      </div>
    </div>
    <div class="canvas"><div class="chart-area" id="t-chart"></div><div class="chart-legend" id="t-legend"></div></div>
    ${globalTimelineMarkup()}`;
  bindMiniSelect(body, "t-ind-select", value => { state.trendIndicator = value; renderTendencias(body); });
  bindMiniSelect(body, "t-var-select", value => { state.trendVariable = value; renderTendencias(body); });
  body.querySelectorAll("[data-area]").forEach(btn => btn.addEventListener("click", () => { stopPlayback(); state.trendArea = btn.dataset.area; renderTendencias(body); }));
  body.querySelectorAll("[data-ma]").forEach(btn => btn.addEventListener("click", () => { stopPlayback(); state.trendMA = btn.dataset.ma; renderTendencias(body); }));
  body.querySelectorAll("[data-trend-flag]").forEach(btn => btn.addEventListener("click", () => {
    stopPlayback();
    const key = btn.dataset.trendFlag;
    state[key] = !state[key];
    renderTendencias(body);
  }));
  body.querySelectorAll("[data-period-window]").forEach(btn => btn.addEventListener("click", () => {
    stopPlayback();
    const w = +btn.dataset.periodWindow;
    const cur = new Set(state.trendPeriodWindows);
    if(cur.has(w)) cur.delete(w); else cur.add(w);
    state.trendPeriodWindows = Array.from(cur).sort((a, b) => a - b);
    state.trendPeriodWindow = state.trendPeriodWindows[0] || null;
    renderTendencias(body);
  }));
  const sE = getTrendSeries(i, v, "España"), sW = getTrendSeries(i, v, "Mundo");
  const show = [];
  if(a === "España" || a === "Both") show.push({ area: "España", color: COLOR_SPAIN, data: sE });
  if(a === "Mundo"  || a === "Both") show.push({ area: "Mundo",  color: COLOR_WORLD, data: sW });
  const years = timelineYearsFromSeries(show);
  function drawCurrent(){
    const activeRange = getTimelineRange("global", years);
    const current = ensureGlobalYear(activeRange.years);
    const rebasedShow = show.map(s => ({ ...s, data: getTrendSeries(i, v, s.area, activeRange.start) }));
    const unit = rebasedShow[0]?.data?.[0]?.variable_unidad || sE[0]?.variable_unidad || sW[0]?.variable_unidad || "";
    const plotted = rebasedShow.map(s => ({ ...s, data: movingAverageData(s.data, state.trendMA).filter(d => d.year >= activeRange.start && d.year <= activeRange.end) }));
    const visible = plotted.map(s => ({ ...s, data: s.data.filter(d => d.year <= current) }));
    drawTimeLines(body.querySelector("#t-chart"), visible, {
      unit, year: current, domainSeries: plotted, rawSeries: rebasedShow,
      showTrendLine: state.trendShowLine, showR2: state.trendShowR2,
      showMax: state.trendShowMax, showToday: state.trendShowToday,
      showBreaks: state.trendShowBreaks, periodWindows: state.trendPeriodWindows,
      metric: v
    });
    body.querySelector("#t-legend").innerHTML = "";
    const readout = body.querySelector("#global-year-readout");
    const slider = body.querySelector("#global-year-slider");
    if(readout) readout.textContent = current;
    if(slider){
      slider.value = current;
      updateTimelineBubble(body.querySelector("#global-timeline"), slider, current);
    }
  }
  drawCurrent();
  bindGlobalTimeline(body, years, drawCurrent);
}

function drawTimeLines(container, series, opts){
  container.innerHTML = "";
  const dims = chartViewport(container);
  const { W, H } = dims;
  const margin = lineChartMargins("global");
  const innerW = W - margin.left - margin.right, innerH = H - margin.top - margin.bottom;
  const svg = d3.select(container).append("svg").attr("class","chart-svg").attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio","none");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const domainSeries = opts.domainSeries || series;
  const allY = domainSeries.flatMap(s => s.data.map(d => d.year));
  const allV = domainSeries.flatMap(s => s.data.map(d => d.valor)).filter(v => v != null && Number.isFinite(v));
  if(!allY.length){ container.innerHTML = `<div class="empty">Sin datos.</div>`; return; }
  const x = d3.scaleLinear().domain(d3.extent(allY)).range([0, innerW]);
  const yExt = d3.extent(allV);
  const y = d3.scaleLinear().domain([yExt[0] < 0 ? yExt[0] : 0, yExt[1]]).nice().range([innerH, 0]);
  g.append("g").attr("class","grid").call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat("")).call(s => s.select(".domain").remove());
  g.append("g").attr("class","axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickValues(smartYearTicks(x, innerW, 8)).tickFormat(d3.format("d")));
  g.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(6).tickFormat(d => fmt(d)));
  const unitDisplay = displayUnitLabel(opts.unit);
  if(unitDisplay) g.append("text").attr("class","axis-label").attr("x", -8).attr("y", -8).attr("text-anchor","start").text(unitDisplay);
  if(opts.year != null){
    drawActiveYearMarker(g, x, opts.year, innerW, innerH);
  }
  const line = d3.line().defined(d => d.valor != null && Number.isFinite(d.valor)).x(d => x(d.year)).y(d => y(d.valor));
  series.forEach((s, idx) => {
    const valid = s.data.filter(d => d.valor != null && Number.isFinite(d.valor));
    g.append("path").datum(s.data).attr("fill","none").attr("stroke", s.color).attr("stroke-width", 2.2).attr("d", line);
    g.selectAll(`circle.global-hover-${idx}`).data(valid).join("circle")
      .attr("class", `global-hover-${idx}`)
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.valor))
      .attr("r", 7)
      .attr("fill", "transparent")
      .style("pointer-events", "all")
      .style("cursor", "crosshair")
      .on("mouseenter mousemove", (event, d) => showTooltip(event, [s.area, unitDisplay || opts.metric].filter(Boolean).join(" · "), [
        ["Año", d.year],
        ["Valor", fmt(d.valor, opts.unit)]
      ]))
      .on("mouseleave", hideTooltip);
  });

  if(opts.showTrendLine || opts.showR2){
    series.forEach((s, idx) => {
      const valid = s.data.filter(d => d.valor != null && Number.isFinite(d.valor));
      const reg = linearRegression(valid);
      if(!reg) return;
      const x1 = d3.min(valid, d => d.year);
      const x2 = d3.max(valid, d => d.year);
      if(opts.showTrendLine){
        g.append("line")
          .attr("class","trend-line")
          .attr("x1", x(x1)).attr("x2", x(x2))
          .attr("y1", y(reg.slope * x1 + reg.intercept))
          .attr("y2", y(reg.slope * x2 + reg.intercept))
          .attr("stroke", s.color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5 5")
          .attr("opacity", .65);
      }
      if(opts.showR2){
        g.append("text")
          .attr("class","trend-note")
          .attr("x", 8)
          .attr("y", 15 + idx * 16)
          .attr("fill", s.color)
          .text(`R² ${s.area}: ${reg.r2.toFixed(3)}`);
      }
    });
  }

  if(opts.showMax){
    series.forEach((s, idx) => {
      const valid = s.data.filter(d => d.valor != null && Number.isFinite(d.valor));
      if(!valid.length) return;
      const maxP = valid.reduce((best, d) => d.valor > best.valor ? d : best, valid[0]);
      const minP = valid.reduce((best, d) => d.valor < best.valor ? d : best, valid[0]);
      [
        { kind: "MÁX", p: maxP, offset: 0 },
        { kind: "MÍN", p: minP, offset: 12 }
      ].forEach(({ kind, p, offset }) => {
        const labelY = 30 + idx * 34 + offset;
        g.append("line")
          .attr("x1", x(p.year)).attr("x2", x(p.year))
          .attr("y1", labelY + 3).attr("y2", y(p.valor))
          .attr("stroke", s.color)
          .attr("stroke-width", 1.2)
          .attr("stroke-dasharray", "2 3")
          .attr("opacity", .55);
        g.append("text")
          .attr("class","chart-annotation")
          .attr("x", Math.min(innerW - 42, Math.max(42, x(p.year))))
          .attr("y", labelY)
          .attr("text-anchor", "middle")
          .attr("fill", s.color)
          .text(`${kind} ${p.year}`);
      });
    });
  }

  if(opts.showToday){
    series.forEach(s => {
      const valid = s.data.filter(d => d.valor != null && Number.isFinite(d.valor));
      if(valid.length < 8) return;
      const last = valid[valid.length - 1];
      const past = valid.filter(d => d.year < last.year - 5 && d.valor < last.valor).sort((a, b) => b.year - a.year)[0];
      if(!past || Math.abs(x(last.year) - x(past.year)) < 22) return;
      const yPos = y(last.valor);
      g.append("line").attr("x1", x(last.year)).attr("x2", x(past.year)).attr("y1", yPos).attr("y2", yPos)
        .attr("stroke", s.color).attr("stroke-width", 1.8).attr("opacity", .65);
      g.append("path")
        .attr("d", `M${x(past.year)},${yPos}l8,-5v10z`)
        .attr("fill", s.color)
        .attr("opacity", .75);
      g.append("text").attr("class","chart-annotation")
        .attr("x", x(past.year) - 5).attr("y", yPos - 6)
        .attr("text-anchor","end").attr("fill", s.color)
        .text(`≈ ${past.year}`);
    });
  }

  if(opts.showBreaks){
    series.forEach((s, idx) => {
      const valid = s.data.filter(d => d.valor != null && Number.isFinite(d.valor) && d.valor !== 0).sort((a, b) => a.year - b.year);
      if(valid.length < 10) return;
      const changes = [];
      for(let i = 1; i < valid.length; i++){
        const prev = valid[i - 1], cur = valid[i];
        if(prev.valor === 0) continue;
        const pct = (cur.valor / prev.valor - 1) * 100;
        if(Number.isFinite(pct)) changes.push({ year: cur.year, pct, value: cur.valor, abs: Math.abs(pct) });
      }
      if(!changes.length) return;
      const mean = d3.mean(changes, d => d.abs);
      const sd = d3.deviation(changes, d => d.abs) || 0;
      const picked = [];
      changes.filter(d => d.abs > mean + 1.5 * sd).sort((a, b) => b.abs - a.abs).forEach(d => {
        if(picked.length < 3 && !picked.some(p => Math.abs(p.year - d.year) < 8)) picked.push(d);
      });
      picked.sort((a, b) => a.year - b.year).forEach((d, j) => {
        const labelY = 48 + idx * 44 + j * 14;
        g.append("line").attr("x1", x(d.year)).attr("x2", x(d.year)).attr("y1", labelY + 3).attr("y2", y(d.value))
          .attr("stroke", s.color).attr("stroke-width", 1.5).attr("stroke-dasharray","3 3").attr("opacity", .55);
        g.append("text").attr("class","chart-annotation").attr("x", Math.min(innerW - 38, Math.max(38, x(d.year)))).attr("y", labelY)
          .attr("text-anchor","middle").attr("fill", s.color).text(`ϟ ${d.year} ${d.pct > 0 ? "+" : ""}${d.pct.toFixed(1)}%`);
      });
    });
  }

  const periodWindows = opts.periodWindows || (opts.periodWindow ? [opts.periodWindow] : []);
  if(periodWindows.length && opts.metric !== "Tasa anual"){
    const annotations = [];
    periodWindows.forEach((win, winIdx) => {
      series.forEach((s, idx) => {
        const valid = s.data.filter(d => d.valor != null && Number.isFinite(d.valor)).sort((a, b) => a.year - b.year);
        if(valid.length < win) return;
        let maxGrowth = null, maxDecline = null;
        for(let i = 0; i <= valid.length - win; i++){
          const start = valid[i], end = valid[i + win - 1];
          const change = end.valor - start.valor;
          if(!maxGrowth || change > maxGrowth.change) maxGrowth = { start, end, change };
          if(!maxDecline || change < maxDecline.change) maxDecline = { start, end, change };
        }
        [
          { item: maxGrowth, color: "#4f8a64", symbol: "↑" },
          { item: maxDecline, color: "#c93324", symbol: "↓" }
        ].forEach(({ item, color, symbol }, j) => {
          if(!item || item.change === 0 || item.start.valor === 0) return;
          const x0 = x(item.start.year), x1 = x(item.end.year);
          g.append("rect").attr("x", x0).attr("y", 0).attr("width", Math.max(1, x1 - x0)).attr("height", innerH)
            .attr("fill", color).attr("opacity", .042);
          const pct = item.change / item.start.valor * 100;
          annotations.push({
            x: (x0 + x1) / 2,
            color,
            text: `${symbol} ${win}a ${item.start.year}-${item.end.year} ${pct > 0 ? "+" : ""}${pct.toFixed(0)}%`
          });
        });
      });
    });
    layoutTopAnnotations(annotations, innerW).forEach(d => {
      g.append("text").attr("class","chart-annotation")
        .attr("x", d.x).attr("y", d.y)
        .attr("text-anchor","middle").attr("fill", d.color)
        .text(d.text);
    });
  }

  const labelPositions = [];
  series.forEach(s => {
    if(!s.data.length) return;
    const last = s.data[s.data.length - 1];
    labelPositions.push({ x: x(last.year) + 6, y: y(last.valor), color: s.color, text: s.area });
  });
  protectActiveYearLabel(labelPositions, opts.year == null ? -Infinity : x(opts.year), innerW);
  adjustEndLabels(labelPositions, innerH, 19).forEach(lbl => {
    g.append("text").attr("class","series-end-label").attr("x", lbl.x).attr("y", lbl.y).attr("dominant-baseline","middle").attr("fill", lbl.color).text(lbl.text);
  });
  raiseActiveYearLabel(g);
}

function analysisVariableOptions(indicator){
  const options = VARIABLES_G.filter(variable =>
    DATA_ANALYSIS.some(row => row.variable === variable && row[indicator] != null && Number.isFinite(row[indicator]))
  );
  return options.length ? options : ["Absoluto"];
}

function preferredAnalysisVariable(options, current){
  if(options.includes(current)) return current;
  if(options.includes("Per cápita")) return "Per cápita";
  if(options.includes("Absoluto")) return "Absoluto";
  return options[0];
}

function miniSelectInlineMarkup(id, label, value, options){
  return `<div class="axis-mini-select">
    <span>${tx(label)}</span>
    <div class="mini-select" id="${id}" data-mini-select>
      <button class="mini-select-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
        <span>${tx(value)}</span><span class="mini-chevron"></span>
      </button>
      <div class="mini-select-menu" role="listbox">
        ${options.map(opt => `<button type="button" role="option" data-value="${escAttr(opt)}" class="${opt === value ? "active" : ""}">${tx(opt)}</button>`).join("")}
      </div>
    </div>
  </div>`;
}

function correlationAxisMarkup(axisLabel, prefix, indicator, variable, scale, variableOptions, scaleOptions){
  const scaleLabel = (scaleOptions.find(opt => opt.id === scale) || scaleOptions[0]).label;
  return `<div class="field corr-axis-group">
    <label>${tx(axisLabel)}</label>
    <div class="corr-axis-controls">
      ${miniSelectInlineMarkup(`c-${prefix}i-select`, t("indicator"), indicator, INDICATORS_WITH_GDP)}
      ${miniSelectInlineMarkup(`c-${prefix}v-select`, t("variable"), variable, variableOptions)}
      ${miniSelectInlineMarkup(`c-${prefix}scale-select`, t("scale"), scaleLabel, scaleOptions.map(opt => opt.label))}
    </div>
  </div>`;
}

function renderCorrelacion(body){
  const corrAreas = [
    { id: "Both", label: "España + Mundo" },
    { id: "España", label: "España" },
    { id: "Mundo", label: "Mundo" }
  ];
  const corrScales = [
    { id: "linear", label: "Lineal" },
    { id: "log", label: "Log" }
  ];
  const xVarOptions = analysisVariableOptions(state.corrXInd);
  const yVarOptions = analysisVariableOptions(state.corrYInd);
  state.corrXVar = preferredAnalysisVariable(xVarOptions, state.corrXVar);
  state.corrYVar = preferredAnalysisVariable(yVarOptions, state.corrYVar);
  if(!corrScales.some(s => s.id === state.corrXScale)) state.corrXScale = "linear";
  if(!corrScales.some(s => s.id === state.corrYScale)) state.corrYScale = "linear";
  body.innerHTML = `
    <div class="filter-bar compact-controls unified-controls corr-controls">
      ${correlationAxisMarkup("Eje X", "x", state.corrXInd, state.corrXVar, state.corrXScale, xVarOptions, corrScales)}
      ${correlationAxisMarkup("Eje Y", "y", state.corrYInd, state.corrYVar, state.corrYScale, yVarOptions, corrScales)}
      <div class="field">
        <label>${t("area")}</label>
        <div class="mode-toggle" id="c-area-toggle">
          ${corrAreas.map(a => `<button data-corr-area="${a.id}" class="${state.corrArea === a.id ? "active" : ""}" type="button">${a.id === "Both" ? tx("Ambos") : tx(a.id)}</button>`).join("")}
        </div>
      </div>
    </div>
    <div class="canvas"><div class="chart-area" id="c-chart"></div><div class="chart-legend" id="c-legend"></div></div>
    ${globalTimelineMarkup()}`;
  bindMiniSelect(body, "c-xi-select", value => {
    state.corrXInd = value;
    state.corrXVar = preferredAnalysisVariable(analysisVariableOptions(value), state.corrXVar);
    renderCorrelacion(body);
  });
  bindMiniSelect(body, "c-xv-select", value => { state.corrXVar = value; renderCorrelacion(body); });
  bindMiniSelect(body, "c-xscale-select", value => {
    state.corrXScale = (corrScales.find(s => s.label === value) || corrScales[0]).id;
    renderCorrelacion(body);
  });
  bindMiniSelect(body, "c-yi-select", value => {
    state.corrYInd = value;
    state.corrYVar = preferredAnalysisVariable(analysisVariableOptions(value), state.corrYVar);
    renderCorrelacion(body);
  });
  bindMiniSelect(body, "c-yv-select", value => { state.corrYVar = value; renderCorrelacion(body); });
  bindMiniSelect(body, "c-yscale-select", value => {
    state.corrYScale = (corrScales.find(s => s.label === value) || corrScales[0]).id;
    renderCorrelacion(body);
  });
  body.querySelectorAll("[data-corr-area]").forEach(btn => btn.addEventListener("click", () => {
    stopPlayback();
    state.corrArea = btn.dataset.corrArea;
    renderCorrelacion(body);
  }));

  const chart = body.querySelector("#c-chart"), legend = body.querySelector("#c-legend");
  const xLog = state.corrXScale === "log", yLog = state.corrYScale === "log";
  function usablePoint(d){ return (!xLog || d.x > 0) && (!yLog || d.y > 0); }
  function buildXY(area){
    const xRows = DATA_ANALYSIS.filter(r => r.area === area && r.variable === state.corrXVar);
    const yRows = DATA_ANALYSIS.filter(r => r.area === area && r.variable === state.corrYVar);
    const yMap = new Map(yRows.map(r => [r.year, r[state.corrYInd]]));
    return xRows.map(r => ({ year: r.year, x: r[state.corrXInd], y: yMap.get(r.year) }))
      .filter(d => d.x != null && d.y != null && Number.isFinite(d.x) && Number.isFinite(d.y));
  }
  function r2(pts){
    const valid = pts.filter(usablePoint);
    if(valid.length < 3) return null;
    const xs = valid.map(p => xLog ? Math.log(p.x) : p.x);
    const ys = valid.map(p => yLog ? Math.log(p.y) : p.y);
    const mx = d3.mean(xs), my = d3.mean(ys);
    let sxx = 0, syy = 0, sxy = 0;
    for(let i = 0; i < xs.length; i++){ sxx += (xs[i]-mx)**2; syy += (ys[i]-my)**2; sxy += (xs[i]-mx)*(ys[i]-my); }
    if(sxx === 0 || syy === 0) return null;
    const r = sxy / Math.sqrt(sxx * syy);
    return r * r;
  }
  const fullE = state.corrArea === "Mundo" ? [] : buildXY("España");
  const fullW = state.corrArea === "España" ? [] : buildXY("Mundo");
  const allFull = [...fullE, ...fullW];
  const years = Array.from(new Set(allFull.map(d => d.year))).sort((a, b) => a - b);
  function drawCurrent(){
    const activeRange = getTimelineRange("global", years);
    const current = ensureGlobalYear(activeRange.years);
    const domainFull = allFull.filter(d => d.year >= activeRange.start && d.year <= activeRange.end);
    const ptsE = fullE.filter(d => d.year >= activeRange.start && d.year <= current);
    const ptsW = fullW.filter(d => d.year >= activeRange.start && d.year <= current);
    const all = [...ptsE, ...ptsW].filter(usablePoint);
    if(!all.length){ chart.innerHTML = `<div class="empty">${t("noSeries")}</div>`; legend.innerHTML = ""; return; }

    const dims = chartViewport(chart);
    const { W, H } = dims;
    const margin = dims.compact ? { top: 24, right: 28, bottom: 34, left: 50 } : { top: 30, right: 52, bottom: 40, left: 74 };
    const innerW = W - margin.left - margin.right, innerH = H - margin.top - margin.bottom;
    chart.innerHTML = "";
    const svg = d3.select(chart).append("svg").attr("class","chart-svg").attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio","none");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const domainUsable = domainFull.filter(usablePoint);
    const xVals = domainUsable.map(d => d.x).filter(v => Number.isFinite(v) && (!xLog || v > 0));
    const yVals = domainUsable.map(d => d.y).filter(v => Number.isFinite(v) && (!yLog || v > 0));
    if(xVals.length < 2 || yVals.length < 2){ chart.innerHTML = `<div class="empty">${t("noSeries")}</div>`; legend.innerHTML = ""; return; }
    const xScale = xLog ? d3.scaleLog() : d3.scaleLinear();
    const yScale = yLog ? d3.scaleLog() : d3.scaleLinear();
    xScale.domain(d3.extent(xVals)).range([0, innerW]).nice();
    yScale.domain(d3.extent(yVals)).range([innerH, 0]).nice();
    g.append("g").attr("class","grid").call(d3.axisLeft(yScale).ticks(5).tickSize(-innerW).tickFormat("")).call(s => s.select(".domain").remove());
    g.append("g").attr("class","axis").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(xScale).ticks(6, "~s"));
    g.append("g").attr("class","axis").call(d3.axisLeft(yScale).ticks(5, "~s"));
    g.append("text").attr("class","axis-label").attr("x", -8).attr("y", -8).attr("text-anchor","start").text(`${tx(state.corrYInd)} · ${tx(state.corrYVar)}`);
    g.append("text").attr("class","axis-label").attr("x", innerW).attr("y", innerH + 28).attr("text-anchor","end").text(`${tx(state.corrXInd)} · ${tx(state.corrXVar)} →`);

    function plot(pts, color, label, idx){
      if(!pts.length) return null;
      const sorted = pts.filter(usablePoint).sort((a, b) => a.year - b.year);
      if(!sorted.length) return null;
      g.append("path").datum(sorted).attr("fill","none").attr("stroke", color).attr("stroke-width", 1).attr("opacity", .5)
        .attr("d", d3.line().defined(usablePoint).x(d => xScale(d.x)).y(d => yScale(d.y)));
      g.selectAll(`circle.corr-dot-${idx}`).data(sorted).join("circle")
        .attr("class", `corr-dot-${idx}`).attr("cx", d => xScale(d.x)).attr("cy", d => yScale(d.y)).attr("r", 3.4).attr("fill", color).attr("opacity", .82)
        .style("cursor", "crosshair")
        .on("mouseenter mousemove", (event, d) => showTooltip(event, label, [
          ["Año", d.year],
          [tx(state.corrXInd), fmt(d.x)],
          [tx(state.corrYInd), fmt(d.y)]
        ]))
        .on("mouseleave", hideTooltip);
      const last = sorted[sorted.length - 1];
      if(last){
        const lx = Math.min(innerW - 44, Math.max(4, xScale(last.x) + 5));
        const ly = Math.max(16, Math.min(innerH - 16, yScale(last.y)));
        g.append("circle").attr("cx", xScale(last.x)).attr("cy", yScale(last.y)).attr("r", 6.5).attr("fill", "none").attr("stroke", color).attr("stroke-width", 1.5);
        g.append("text").attr("class","series-end-label").attr("x", lx).attr("y", ly - 3).attr("fill", color).text(label);
        g.append("text").attr("class","axis-label").attr("x", lx).attr("y", ly + 11).attr("fill", color).text(last.year);
      }
      return r2(pts);
    }
    const r2E = plot(ptsE, COLOR_SPAIN, tx("España"), 0), r2W = plot(ptsW, COLOR_WORLD, tx("Mundo"), 1);
    const ann = [];
    if(r2E != null) ann.push({ color: COLOR_SPAIN, text: `R² = ${r2E.toFixed(3)} · ${tx("España")}` });
    if(r2W != null) ann.push({ color: COLOR_WORLD, text: `R² = ${r2W.toFixed(3)} · ${tx("Mundo")}` });
    ann.forEach((a, i) => g.append("text").attr("x", 6).attr("y", 14 + i * 16).attr("fill", a.color).attr("font-size", 12).attr("font-weight", 700).text(a.text));
    legend.innerHTML = "";
    const readout = body.querySelector("#global-year-readout");
    const slider = body.querySelector("#global-year-slider");
    if(readout) readout.textContent = current;
    if(slider){
      slider.value = current;
      updateTimelineBubble(body.querySelector("#global-timeline"), slider, current);
    }
  }
  drawCurrent();
  bindGlobalTimeline(body, years, drawCurrent);
}

function renderLMDI(body){
  const lmdiAreas = ["España", "Mundo"];
  const lmdiViews = [
    { id: "waterfall-additive", label: state.lang === "en" ? "Waterfall · additive" : "Waterfall · aditivo" },
    { id: "bar-additive", label: state.lang === "en" ? "Bars · additive" : "Barras · aditivo" },
    { id: "bar-multiplicative", label: state.lang === "en" ? "Bars · multiplicative" : "Barras · multiplicativo" }
  ];
  const lmdiPeriods = [
    { id: "40years", label: state.lang === "en" ? "Every 40 years" : "Cada 40 años" },
    { id: "20years", label: state.lang === "en" ? "Every 20 years" : "Cada 20 años" },
    { id: "full", label: state.lang === "en" ? "Full period" : "Periodo completo" },
    { id: "custom", label: state.lang === "en" ? "Manual" : "Manual" }
  ];
  const viewLabel = (lmdiViews.find(v => v.id === state.lmdiChart) || lmdiViews[0]).label;
  const periodLabel = (lmdiPeriods.find(p => p.id === state.lmdiPeriod) || lmdiPeriods[0]).label;
  body.innerHTML = `
    <div class="filter-bar compact-controls unified-controls">
      ${miniSelectMarkup("l-ind-select", t("indicator"), state.lmdiIndicator, INDICATORS)}
      <div class="field">
        <label>${t("area")}</label>
        <div class="mode-toggle" id="l-area-toggle">
          ${lmdiAreas.map(a => `<button data-lmdi-area="${a}" class="${state.lmdiArea === a ? "active" : ""}" type="button">${tx(a)}</button>`).join("")}
        </div>
      </div>
      ${miniSelectMarkup("l-view-select", t("view"), viewLabel, lmdiViews.map(v => v.label))}
      ${miniSelectMarkup("l-period-select", state.lang === "en" ? "Periods" : "Periodos", periodLabel, lmdiPeriods.map(p => p.label))}
      ${state.lmdiPeriod === "custom" ? `<div class="field lmdi-custom-field">
        <label>${state.lang === "en" ? "Years" : "Años"}</label>
        <input class="period-input" id="l-custom-years" type="text" value="${escAttr(state.lmdiCustomYears)}" placeholder="1860,1900,1940,1980,2020" title="${state.lang === "en" ? "Comma-separated years" : "Años separados por comas"}">
      </div>` : ""}
    </div>
    <div class="canvas"><div class="chart-area" id="l-chart"></div><div class="chart-legend" id="l-legend"></div></div>`;
  bindMiniSelect(body, "l-ind-select", value => { state.lmdiIndicator = value; renderLMDI(body); });
  body.querySelectorAll("[data-lmdi-area]").forEach(btn => btn.addEventListener("click", () => {
    state.lmdiArea = btn.dataset.lmdiArea;
    renderLMDI(body);
  }));
  bindMiniSelect(body, "l-view-select", value => {
    state.lmdiChart = (lmdiViews.find(v => v.label === value) || lmdiViews[0]).id;
    renderLMDI(body);
  });
  bindMiniSelect(body, "l-period-select", value => {
    state.lmdiPeriod = (lmdiPeriods.find(p => p.label === value) || lmdiPeriods[0]).id;
    renderLMDI(body);
  });
  const customYearsInput = body.querySelector("#l-custom-years");
  if(customYearsInput){
    const applyCustomYears = () => {
      state.lmdiCustomYears = customYearsInput.value;
      renderLMDI(body);
    };
    customYearsInput.addEventListener("change", applyCustomYears);
    customYearsInput.addEventListener("keydown", e => {
      if(e.key === "Enter") applyCustomYears();
    });
  }

  const chart = body.querySelector("#l-chart"), legend = body.querySelector("#l-legend");
  const ind = state.lmdiIndicator, area = state.lmdiArea;
  const rows = DATA_ANALYSIS.filter(r => r.area === area && r.variable === "Absoluto").sort((a, b) => a.year - b.year);
  const colors = {
    population: "#e9d8a6",
    affluence: "#f77f00",
    technology: "#669bbc",
    total: "#212529"
  };
  const units = {
    "Agua": "m³",
    "Emisiones GEI": "t CO₂e",
    "Emisiones de CO₂": "t CO₂",
    "Energía": "Mtep",
    "Materiales": "t",
    "Nitrógeno": "t N",
    "Tierras de cultivo": "ha"
  };
  const factorLabels = ["Población", "Afluencia", "Tecnología"];
  const colorMap = {
    "Población": colors.population,
    "Afluencia": colors.affluence,
    "Tecnología": colors.technology
  };
  function logMean(a, b){
    if(a === b) return a;
    if(a <= 0 || b <= 0) return null;
    return (a - b) / Math.log(a / b);
  }
  function valid(r){
    return r && [r[ind], r.PIB, r["Población"]].every(v => v != null && Number.isFinite(v) && v > 0);
  }
  function periodYears(){
    const validYears = rows.filter(valid).map(r => r.year).sort((a, b) => a - b);
    if(validYears.length < 2) return [];
    const first = validYears[0], last = validYears.at(-1);
    if(state.lmdiPeriod === "full") return [first, last];
    if(state.lmdiPeriod === "custom"){
      const validSet = new Set(validYears);
      const custom = Array.from(new Set(String(state.lmdiCustomYears || "")
        .split(/[,\s;]+/)
        .map(x => Number.parseInt(x, 10))
        .filter(y => Number.isFinite(y) && validSet.has(y))))
        .sort((a, b) => a - b);
      return custom.length >= 2 ? custom : [];
    }
    const step = state.lmdiPeriod === "20years" ? 20 : 40;
    const out = [first];
    for(let y = first + step; y < last; y += step){
      const row = rows.find(r => r.year === y);
      if(valid(row)) out.push(y);
    }
    if(out.at(-1) !== last) out.push(last);
    return out;
  }
  function calculateLMDI(data0, data1){
    if(!valid(data0) || !valid(data1)) return null;
    const I0 = data0[ind], I1 = data1[ind];
    const P0 = data0["Población"], P1 = data1["Población"];
    const GDP0 = data0.PIB, GDP1 = data1.PIB;
    const A0 = GDP0 / P0, A1 = GDP1 / P1;
    const T0 = I0 / GDP0, T1 = I1 / GDP1;
    if([A0,A1,T0,T1].some(v => v == null || !Number.isFinite(v) || v <= 0)) return null;
    const L = logMean(I1, I0);
    if(L == null) return null;
    return {
      period: `${data0.year}–${data1.year}`,
      year0: data0.year,
      year1: data1.year,
      additive: {
        population: L * Math.log(P1 / P0),
        affluence: L * Math.log(A1 / A0),
        technology: L * Math.log(T1 / T0),
        total: I1 - I0
      },
      multiplicative: {
        population: P1 / P0,
        affluence: A1 / A0,
        technology: T1 / T0,
        total: I1 / I0
      },
      values: { I0, I1, P0, P1, GDP0, GDP1, A0, A1, T0, T1 }
    };
  }
  const years = periodYears();
  const results = [];
  for(let i = 0; i < years.length - 1; i++){
    const a = rows.find(r => r.year === years[i]);
    const b = rows.find(r => r.year === years[i + 1]);
    const lmdi = calculateLMDI(a, b);
    if(lmdi) results.push(lmdi);
  }
  if(!results.length){ chart.innerHTML = `<div class="empty">No hay descomposición.</div>`; legend.innerHTML = ""; return; }

  const dims = chartViewport(chart);
  const { W, H } = dims;
  const formatAxis = value => {
    const abs = Math.abs(value);
    if(abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if(abs >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
    if(abs >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    if(abs > 0 && abs < 1) return value.toFixed(2);
    return value.toFixed(1);
  };
  const makeSvg = (margin) => {
    chart.innerHTML = "";
    const innerW = W - margin.left - margin.right, innerH = H - margin.top - margin.bottom;
    const svg = d3.select(chart).append("svg").attr("class","chart-svg").attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio","none");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    return { g, innerW, innerH };
  };
  function drawWaterfall(){
    const margin = dims.compact ? { top: 18, right: 14, bottom: 58, left: 50 } : { top: 20, right: 30, bottom: 70, left: 82 };
    const { g, innerW, innerH } = makeSvg(margin);
    const waterfall = [];
    results.forEach((r, i) => {
      if(i === 0){
        waterfall.push({ factor: `${r.year0}`, value: r.values.I0, start: 0, end: r.values.I0, isYear: true });
      }
      const prevTotal = i === 0 ? r.values.I0 : results[i - 1].values.I1;
      let cumulative = prevTotal;
      [
        ["Población", r.additive.population],
        ["Afluencia", r.additive.affluence],
        ["Tecnología", r.additive.technology]
      ].forEach(([factor, value]) => {
        waterfall.push({ factor, value, start: cumulative, end: cumulative + value, baseValue: prevTotal });
        cumulative += value;
      });
      waterfall.push({ factor: `${r.year1}`, value: r.values.I1, start: 0, end: r.values.I1, isYear: true });
    });
    const x = d3.scaleBand().domain(waterfall.map((_, i) => i)).range([0, innerW]).padding(.22);
    const all = waterfall.flatMap(d => [d.start, d.end]);
    const y = d3.scaleLinear().domain([Math.min(0, d3.min(all)), Math.max(0, d3.max(all))]).nice().range([innerH, 0]);
    g.append("g").attr("class","grid").call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat("")).call(s => s.select(".domain").remove());
    g.append("g").attr("class","axis").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickFormat(i => {
        const d = waterfall[i];
        return d.isYear ? d.factor : d.factor.slice(0, 3);
      }))
      .selectAll("text")
      .style("font-weight", i => waterfall[i]?.isYear ? 700 : 500)
      .attr("transform", waterfall.length > 18 ? "rotate(-35)" : null)
      .style("text-anchor", waterfall.length > 18 ? "end" : "middle");
    g.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(6).tickFormat(formatAxis));
    g.append("line").attr("x1", 0).attr("x2", innerW).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", colors.total).attr("opacity", .55);
    waterfall.forEach((d, i) => {
      const px = x(i);
      const fill = d.isYear ? colors.total : colorMap[d.factor];
      if(i < waterfall.length - 1){
        g.append("line")
          .attr("x1", px + x.bandwidth()).attr("x2", x(i + 1))
          .attr("y1", y(d.end)).attr("y2", y(d.end))
          .attr("stroke", "#8a8c8f").attr("stroke-dasharray", "2 3").attr("opacity", .45);
      }
      g.append("rect")
        .attr("x", px).attr("width", x.bandwidth())
        .attr("y", y(Math.max(d.start, d.end)))
        .attr("height", Math.max(1, Math.abs(y(d.start) - y(d.end))))
        .attr("fill", fill)
        .attr("opacity", d.isYear ? .9 : .95)
        .style("cursor", "crosshair")
        .on("mouseenter mousemove", (event) => showTooltip(event, d.isYear ? `Nivel ${d.factor}` : d.factor, [
          [d.isYear ? "Valor" : "Cambio", fmt(d.value, units[ind] || "")],
          ["Inicio", fmt(d.start, units[ind] || "")],
          ["Final", fmt(d.end, units[ind] || "")]
        ]))
        .on("mouseleave", hideTooltip);
      const pct = d.baseValue ? (d.value / d.baseValue) * 100 : null;
      if(!d.isYear && waterfall.length <= 28 && pct != null && Number.isFinite(pct)){
        g.append("text")
          .attr("class","waterfall-value-label")
          .attr("x", px + x.bandwidth() / 2)
          .attr("y", Math.max(10, y(Math.max(d.start, d.end)) - 6))
          .attr("text-anchor","middle")
          .attr("fill", fill)
          .text(`${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`);
      }
    });
    g.append("text").attr("class","axis-label").attr("x", -8).attr("y", -8).attr("text-anchor","start")
      .text(`Nivel de impacto: ${ind} (${units[ind] || ""})`);
  }
  function drawBars(){
    const additive = state.lmdiChart === "bar-additive";
    const margin = dims.compact ? { top: 18, right: 14, bottom: 58, left: 48 } : { top: 22, right: 30, bottom: 70, left: 76 };
    const { g, innerW, innerH } = makeSvg(margin);
    const plotRows = results.map(r => additive ? {
      period: r.period,
      "Población": r.additive.population,
      "Afluencia": r.additive.affluence,
      "Tecnología": r.additive.technology
    } : {
      period: r.period,
      "Población": Math.log(r.multiplicative.population) * 100,
      "Afluencia": Math.log(r.multiplicative.affluence) * 100,
      "Tecnología": Math.log(r.multiplicative.technology) * 100
    });
    const totals = results.map(r => ({
      period: r.period,
      total: additive ? r.additive.total : Math.log(r.multiplicative.total) * 100
    }));
    const stack = d3.stack().keys(factorLabels).offset(d3.stackOffsetDiverging);
    const series = stack(plotRows);
    const x = d3.scaleBand().domain(plotRows.map(d => d.period)).range([0, innerW]).padding(.3);
    const all = series.flatMap(s => s.flatMap(d => [d[0], d[1]])).concat(totals.map(d => d.total));
    const y = d3.scaleLinear().domain([Math.min(0, d3.min(all)), Math.max(0, d3.max(all))]).nice().range([innerH, 0]);
    g.append("g").attr("class","grid").call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat("")).call(s => s.select(".domain").remove());
    g.append("g").attr("class","axis").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x))
      .selectAll("text").attr("transform", plotRows.length > 4 ? "rotate(-35)" : null).style("text-anchor", plotRows.length > 4 ? "end" : "middle");
    g.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(6).tickFormat(formatAxis));
    g.append("line").attr("x1", 0).attr("x2", innerW).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", colors.total).attr("opacity", .55);
    g.selectAll(".lmdi-series").data(series).join("g")
      .attr("fill", d => colorMap[d.key])
      .selectAll("rect").data(d => d.map(p => ({ ...p, factor: d.key }))).join("rect")
      .attr("x", d => x(d.data.period))
      .attr("y", d => y(Math.max(d[0], d[1])))
      .attr("height", d => Math.max(1, Math.abs(y(d[0]) - y(d[1]))))
      .attr("width", x.bandwidth())
      .attr("opacity", .95)
      .style("cursor", "crosshair")
      .on("mouseenter mousemove", (event, d) => showTooltip(event, `${d.factor} · ${d.data.period}`, [
        ["Cambio", additive ? fmt(d.data[d.factor], units[ind] || "") : `${d.data[d.factor].toFixed(2)}%`],
        ["Periodo", d.data.period]
      ]))
      .on("mouseleave", hideTooltip);
    g.selectAll(".total-point").data(totals).join("circle")
      .attr("class","total-point")
      .attr("cx", d => x(d.period) + x.bandwidth() / 2)
      .attr("cy", d => y(d.total))
      .attr("r", 4.2)
      .attr("fill", colors.total)
      .attr("stroke", "#fbf8f1")
      .attr("stroke-width", 1.2)
      .style("cursor", "crosshair")
      .on("mouseenter mousemove", (event, d) => showTooltip(event, `Total · ${d.period}`, [
        ["Cambio total", additive ? fmt(d.total, units[ind] || "") : `${d.total.toFixed(2)}%`]
      ]))
      .on("mouseleave", hideTooltip);
    g.append("text").attr("class","axis-label").attr("x", -8).attr("y", -8).attr("text-anchor","start")
      .text(additive ? `Variación (${units[ind] || ""})` : "Cambio relativo log (%)");
  }
  if(state.lmdiChart === "waterfall-additive") drawWaterfall();
  else drawBars();
  legend.innerHTML = "";
}

function renderTapio(body){
  const tapioAreas = ["España", "Mundo"];
  const tapioWindows = [1,3,5,10].map(w => ({ id: w, label: state.lang === "en" ? `${w} year${w === 1 ? "" : "s"}` : `${w} año${w === 1 ? "" : "s"}` }));
  const tapioWindowLabel = (tapioWindows.find(w => w.id === state.tapioWindow) || tapioWindows[2]).label;
  body.innerHTML = `
    <div class="filter-bar compact-controls unified-controls">
      ${miniSelectMarkup("tp-ind-select", t("indicator"), state.tapioIndicator, INDICATORS)}
      <div class="field">
        <label>${t("area")}</label>
        <div class="mode-toggle" id="tp-area-toggle">
          ${tapioAreas.map(a => `<button data-tapio-area="${a}" class="${state.tapioArea === a ? "active" : ""}" type="button">${tx(a)}</button>`).join("")}
        </div>
      </div>
      ${miniSelectMarkup("tp-w-select", t("window"), tapioWindowLabel, tapioWindows.map(w => w.label))}
    </div>
    <div class="canvas"><div class="chart-area" id="tp-chart"></div><div class="chart-legend" id="tp-legend"></div></div>`;
  bindMiniSelect(body, "tp-ind-select", value => { state.tapioIndicator = value; renderTapio(body); });
  body.querySelectorAll("[data-tapio-area]").forEach(btn => btn.addEventListener("click", () => {
    state.tapioArea = btn.dataset.tapioArea;
    renderTapio(body);
  }));
  bindMiniSelect(body, "tp-w-select", value => {
    state.tapioWindow = (tapioWindows.find(w => w.label === value) || tapioWindows[2]).id;
    renderTapio(body);
  });
  const chart = body.querySelector("#tp-chart"), legend = body.querySelector("#tp-legend");
  const ind = state.tapioIndicator, areaPick = state.tapioArea, win = state.tapioWindow;
  const rows = DATA_ANALYSIS.filter(r => r.area === areaPick && r.variable === "Absoluto").sort((a, b) => a.year - b.year);
  const pts = [];
  for(let i = win; i < rows.length; i++){
    const a = rows[i - win], b = rows[i];
    const G0 = a.PIB, G1 = b.PIB, I0 = a[ind], I1 = b[ind];
    if([G0,G1,I0,I1].some(v => v == null || v <= 0)) continue;
    const gG = Math.pow(G1/G0, 1/win) - 1;
    const gI = Math.pow(I1/I0, 1/win) - 1;
    const elasticity = gG !== 0 ? gI / gG : null;
    pts.push({ year: b.year, gG, gI, elasticity, pat: classifyTapio(gG, gI) });
  }
  if(!pts.length){ chart.innerHTML = `<div class="empty">Sin datos.</div>`; legend.innerHTML = ""; return; }
  const dims = chartViewport(chart);
  const { W, H } = dims;
  const margin = dims.compact ? { top: 24, right: 18, bottom: 34, left: 44 } : { top: 30, right: 30, bottom: 40, left: 60 };
  const innerW = W - margin.left - margin.right, innerH = H - margin.top - margin.bottom;
  chart.innerHTML = "";
  const svg = d3.select(chart).append("svg").attr("class","chart-svg").attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio","none");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const xExt = d3.extent(pts, d => d.gG), yExt = d3.extent(pts, d => d.gI);
  const xMax = Math.max(Math.abs(xExt[0]), Math.abs(xExt[1]), 0.05);
  const yMax = Math.max(Math.abs(yExt[0]), Math.abs(yExt[1]), 0.05);
  const x = d3.scaleLinear().domain([-xMax, xMax]).nice().range([0, innerW]);
  const y = d3.scaleLinear().domain([-yMax, yMax]).nice().range([innerH, 0]);
  g.append("rect").attr("x", x(0)).attr("y", 0).attr("width", innerW - x(0)).attr("height", y(0)).attr("fill","#c93324").attr("opacity",.06);
  g.append("rect").attr("x", x(0)).attr("y", y(0)).attr("width", innerW - x(0)).attr("height", innerH - y(0)).attr("fill","#4f8a64").attr("opacity",.10);
  g.append("rect").attr("x", 0).attr("y", 0).attr("width", x(0)).attr("height", y(0)).attr("fill","#3a4147").attr("opacity",.06);
  g.append("rect").attr("x", 0).attr("y", y(0)).attr("width", x(0)).attr("height", innerH - y(0)).attr("fill","#c79a3b").attr("opacity",.06);
  g.append("line").attr("x1", x(-xMax)).attr("y1", y(-xMax)).attr("x2", x(xMax)).attr("y2", y(xMax)).attr("stroke","#1c1f24").attr("stroke-dasharray","2 4").attr("opacity", .35);
  [0.8, 1.2].forEach(k => {
    const xStart = Math.max(0, x.domain()[0]);
    const xEnd = Math.min(x.domain()[1], y.domain()[1] / k);
    if(xEnd <= xStart) return;
    g.append("line")
      .attr("x1", x(xStart)).attr("y1", y(k * xStart))
      .attr("x2", x(xEnd)).attr("y2", y(k * xEnd))
      .attr("stroke","#1c1f24")
      .attr("stroke-dasharray","5 5")
      .attr("opacity", .18);
  });
  g.append("line").attr("x1", 0).attr("y1", y(0)).attr("x2", innerW).attr("y2", y(0)).attr("stroke","#8a8c8f");
  g.append("line").attr("x1", x(0)).attr("y1", 0).attr("x2", x(0)).attr("y2", innerH).attr("stroke","#8a8c8f");
  g.append("text").attr("class","quad-label").attr("x", innerW - 6).attr("y", 12).attr("text-anchor","end").text("Divergent growth");
  g.append("text").attr("class","quad-label").attr("x", innerW - 6).attr("y", innerH - 6).attr("text-anchor","end").text("Absolute decoupling");
  g.append("text").attr("class","quad-label").attr("x", Math.min(innerW - 8, x(Math.min(xMax, yMax / 1.6)))).attr("y", y(Math.min(yMax * .8, Math.max(.02, yMax * .35)))).attr("text-anchor","end").text("Weak decoupling");
  g.append("text").attr("class","quad-label").attr("x", 6).attr("y", 12).attr("text-anchor","start").text("Recessive");
  g.append("text").attr("class","quad-label").attr("x", 6).attr("y", innerH - 6).attr("text-anchor","start").text("Recessive decoupling");
  g.append("g").attr("class","axis").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("+.1%")));
  g.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("+.1%")));
  g.append("text").attr("class","axis-label").attr("x", -8).attr("y", -8).attr("text-anchor","start").text(`Δ ${ind}`);
  g.append("text").attr("class","axis-label").attr("x", innerW + 4).attr("y", y(0) + 14).attr("text-anchor","end").text("Δ PIB →");
  g.append("path").datum(pts).attr("fill","none").attr("stroke","#1c1f24").attr("stroke-width", .6).attr("opacity", .15).attr("d", d3.line().x(d => x(d.gG)).y(d => y(d.gI)));
  g.selectAll("circle.dot").data(pts).join("circle").attr("class","dot").attr("cx", d => x(d.gG)).attr("cy", d => y(d.gI)).attr("r", 5).attr("fill", d => TAPIO_META[d.pat]?.color || TAPIO_META.ND.color).attr("stroke","#fbf8f1").attr("stroke-width", .9).attr("opacity", .9)
    .style("cursor", "crosshair")
    .on("mouseenter mousemove", (event, d) => showTooltip(event, `${areaPick} · ${d.year}`, [
      ["Patrón", TAPIO_META[d.pat]?.label || "No data"],
      ["Δ PIB", d3.format("+.2%")(d.gG)],
      [`Δ ${ind}`, d3.format("+.2%")(d.gI)],
      ["Elasticidad", d.elasticity == null ? "s/d" : d.elasticity.toFixed(2)],
      ["Ventana", `${win} años`]
    ]))
    .on("mouseleave", hideTooltip);
  const usedPatterns = new Set(pts.map(d => d.pat));
  legend.innerHTML = TAPIO_ORDER.filter(code => usedPatterns.has(code)).map(code =>
    `<span class="legend-row"><span class="legend-swatch" style="background:${TAPIO_META[code].color}"></span>${TAPIO_META[code].label}</span>`
  ).join("");
}

/* ====== Páginas estáticas (perspectivas, datos, novedades, acerca) ====== */
function openVizFromStatic(vizId){
  vizId = resolveVizId(vizId);
  for(const group of ["global","macro","sectorial","commodities"]){
    const items = group === "global" ? GLOBAL_ANALYSES : (CATALOG_OTHER[group] || []);
    const item = items.find(i => i.id === vizId);
    if(item){
      state.section = "visualizacion";
      state.subsection = "viz";
      state.group = group;
      state.vizId = item.id;
      setNavActive("visualizacion");
      window.location.hash = item.id;
      renderMain();
      return;
    }
  }
}

const PERSPECTIVAS = [
  { id: "emisiones-historicas", viz: "emisiones", fig: "line", date: "2025-09-02", authors: ["Juan Infante Amate", "Eduardo Aguilera"], topic: "Emisiones", topic_en: "Emissions", title: "Emisiones históricas de España", title_en: "Spain's historical emissions", summary: "Una lectura larga de la transformación del perfil de emisiones español desde la industrialización hasta la transición energética reciente.", summary_en: "A long-run account of Spain's changing emissions profile from industrialization to the recent energy transition.", body: "España ha experimentado una profunda transformación en su perfil de emisiones a lo largo del último siglo y medio.", body_en: "Spain's emissions profile has changed profoundly over the last century and a half." },
  { id: "huella-acumulada", viz: "tendencias", fig: "line", date: "2026-03-01", authors: ["Juan Infante Amate"], topic: "Huella acumulada", topic_en: "Accumulated footprint", title: "La huella acumulada de España", title_en: "Spain's accumulated footprint", summary: "La responsabilidad histórica cambia según midamos emisiones acumuladas, materiales o velocidad de la transformación.", summary_en: "Historical responsibility changes depending on whether we measure accumulated emissions, materials or the speed of transformation.", body: "En los debates sobre cambio climático, la responsabilidad de un país no se mide solo por lo que emite hoy.", body_en: "In climate debates, a country's responsibility is not measured only by what it emits today." },
  { id: "desacoplamiento-mito-realidad", viz: "desacoplamiento", fig: "tapio", date: "2026-03-01", authors: ["Juan Infante Amate"], topic: "Desacoplamiento", topic_en: "Decoupling", title: "La promesa del desacoplamiento", title_en: "The promise of decoupling", summary: "La eficiencia mejora, pero la pregunta decisiva es si esa mejora basta para reducir el impacto absoluto.", summary_en: "Efficiency improves, but the decisive question is whether that improvement is enough to reduce absolute impact.", body: "Hay un gráfico que a los optimistas les encanta: el de la intensidad ambiental del PIB.", body_en: "There is one chart optimists love: the environmental intensity of GDP." },
  { id: "huella-material", viz: "materiales", fig: "bars", date: "2026-03-15", authors: ["Juan Infante Amate", "Ángel Sanjuán Ruiz"], topic: "Materiales", topic_en: "Materials", title: "El atracón material de España", title_en: "Spain's material binge", summary: "El pico material de 2007 permite leer la burbuja inmobiliaria como un fenómeno físico, no solo financiero.", summary_en: "The 2007 material peak reads the housing bubble as a physical phenomenon, not only a financial one.", body: "En 2007, cada persona que vivía en España consumía directa o indirectamente 20 toneladas de materiales al año.", body_en: "In 2007, each person living in Spain consumed, directly or indirectly, 20 tonnes of materials per year." },
  { id: "transicion-forestal", viz: "bosques", fig: "map", date: "2026-03-15", authors: ["Iñaki Iriarte Goñi", "Juan Infante Amate"], topic: "Forestal", topic_en: "Forestry", title: "España tiene más bosques que nunca", title_en: "Spain has more forests than ever", summary: "La recuperación forestal combina más superficie, más biomasa, cambios de uso y nuevos riesgos de incendio.", summary_en: "Forest recovery combines more area, more biomass, land-use change and new fire risks.", body: "Puede parecer contraintuitivo, pero España tiene hoy más superficie forestal que en cualquier otro momento de los últimos dos siglos.", body_en: "It may seem counterintuitive, but Spain has more forest area today than at any point in the last two centuries." },
  { id: "crecimiento-eficiencia", viz: "correlacion", fig: "scatter", date: "2026-03-15", authors: ["Juan Infante Amate"], topic: "Crecimiento", topic_en: "Growth", title: "Crecer contaminando menos", title_en: "Growing while polluting less", summary: "La intensidad ambiental cae, pero el crecimiento de escala puede anular buena parte de esa ganancia.", summary_en: "Environmental intensity falls, but growth in scale can cancel much of that gain.", body: "La promesa del crecimiento verde es sencilla: que la economía siga creciendo mientras las emisiones bajan.", body_en: "The promise of green growth is simple: the economy keeps growing while emissions fall." },
  { id: "balance-emisiones", viz: "emisiones", fig: "area", date: "2026-03-15", authors: ["Juan Infante Amate", "Eduardo Aguilera"], topic: "Emisiones", topic_en: "Emissions", title: "Las emisiones no están en mínimos", title_en: "Emissions are not at historical lows", summary: "La serie desde 1860 cambia la lectura de los titulares basados solo en inventarios desde 1990.", summary_en: "The series since 1860 changes the reading of headlines based only on inventories from 1990.", body: "A finales de 2023 se dijo que las emisiones caían a mínimos históricos en España. La historia larga cuenta otra cosa.", body_en: "In late 2023, some headlines said Spanish emissions had fallen to historical lows. The long-run record tells a different story." },
];

const PERSPECTIVE_SHOTS = {
  "emisiones-historicas": "img/perspectives/emisiones-historicas.png",
  "huella-acumulada": "img/perspectives/huella-acumulada.png",
  "desacoplamiento-mito-realidad": "img/perspectives/desacoplamiento-mito-realidad.png",
  "huella-material": "img/perspectives/huella-material.png",
  "transicion-forestal": "img/perspectives/transicion-forestal.png",
  "crecimiento-eficiencia": "img/perspectives/crecimiento-eficiencia.png",
  "balance-emisiones": "img/perspectives/balance-emisiones.png",
};

const PERSPECTIVE_READ_MORE = {
  "emisiones-historicas": [
    { title: "The climate cost of lateness", url: "https://doi.org/10.1007/s44498-026-00077-1" }
  ],
  "huella-acumulada": [
    { title: "Green growth in the mirror of history", url: "https://doi.org/10.1038/s41467-025-58777-4" }
  ],
  "desacoplamiento-mito-realidad": [
    { title: "Green growth in the mirror of history", url: "https://doi.org/10.1038/s41467-025-58777-4" }
  ],
  "huella-material": [
    { title: "Las bases materiales del desarrollo económico en España", url: "https://doi.org/10.32796/CICE.2021.101.7194" }
  ],
  "transicion-forestal": [
    { title: "From woodfuel to industrial wood", url: "https://doi.org/10.1016/j.ecolecon.2022.107548" }
  ],
  "crecimiento-eficiencia": [
    { title: "Green growth in the mirror of history", url: "https://doi.org/10.1038/s41467-025-58777-4" }
  ],
  "balance-emisiones": [
    { title: "Beyond fossil fuels", url: "https://doi.org/10.1080/01615440.2024.2378799" }
  ],
};

const AI_ASSISTED_PERSPECTIVES = new Set([
  "emisiones-historicas",
  "huella-acumulada",
  "desacoplamiento-mito-realidad",
  "huella-material",
  "transicion-forestal",
  "crecimiento-eficiencia",
  "balance-emisiones",
]);

const PERSPECTIVE_AUDIO_ES = {
  "emisiones-historicas": { duration: 137 },
  "huella-acumulada": { duration: 230 },
  "desacoplamiento-mito-realidad": { duration: 194 },
  "huella-material": { duration: 181 },
  "transicion-forestal": { duration: 205 },
  "crecimiento-eficiencia": { duration: 143 },
  "balance-emisiones": { duration: 162 },
};

const PERSPECTIVE_AUDIO_EN = {
  "emisiones-historicas": { duration: 144 },
  "huella-acumulada": { duration: 183 },
  "desacoplamiento-mito-realidad": { duration: 168 },
  "huella-material": { duration: 165 },
  "transicion-forestal": { duration: 160 },
  "crecimiento-eficiencia": { duration: 129 },
  "balance-emisiones": { duration: 152 },
};

const PERSPECTIVE_DETAIL_TEXT = {
  "emisiones-historicas": {
    es: [
      "La trayectoria histórica de las emisiones españolas no es una sola curva. Hasta mediados del siglo XX domina una economía de baja energía fósil, con una huella climática relativamente reducida y muy vinculada a los usos del suelo. Desde la industrialización tardía, la urbanización y la expansión del transporte, la serie se acelera y cambia su composición.",
      "La comparación con el mundo ayuda a distinguir escala y calendario: España llega tarde a la gran aceleración, pero durante varias décadas converge con rapidez. La lectura interactiva permite localizar los periodos donde cambia la pendiente, separar España y mundo, y comprobar si el descenso posterior a 2008 es coyuntural o estructural."
    ],
    en: [
      "Spain's emissions history is not a single curve. Until the mid-twentieth century, a low-fossil-energy economy kept climate pressure comparatively limited and strongly tied to land use. With late industrialization, urbanization and transport expansion, the series accelerates and its composition changes.",
      "The comparison with the world separates scale from timing: Spain joins the Great Acceleration late, but converges rapidly for several decades. The interactive view helps locate slope changes, separate Spain and the world, and assess whether the post-2008 decline is cyclical or structural."
    ]
  },
  "balance-emisiones": {
    es: [
      "Separar CO₂ fósil y usos del suelo permite leer la responsabilidad histórica como flujo anual y como acumulación. No mide solo cuánto se emite en un año, sino qué parte de la trayectoria queda incorporada al balance de largo plazo.",
      "El visor permite alternar absoluto, acumulado e intensidad para evitar una lectura única: la misma economía puede reducir intensidad relativa mientras mantiene niveles altos de emisión acumulada."
    ],
    en: [
      "Separating fossil CO₂ and land use makes it possible to read historical responsibility both as annual flow and as accumulation. It is not only about emissions in a given year, but also about what remains in the long-run balance.",
      "The viewer switches between absolute, cumulative and intensity metrics to avoid a single reading: the same economy may reduce relative intensity while retaining high accumulated emissions."
    ]
  },
  "desacoplamiento-mito-realidad": {
    es: [
      "El desacoplamiento depende del periodo elegido, del indicador ambiental y de si se observa cambio absoluto o relativo. Por eso la clasificación Tapio se representa como una secuencia de ventanas temporales, no como una etiqueta fija.",
      "Los colores muestran regímenes distintos de elasticidad entre PIB e impacto. La pregunta central no es si existe un punto aislado de desacoplamiento, sino si aparece una pauta persistente y suficientemente intensa."
    ],
    en: [
      "Decoupling depends on the chosen period, the environmental indicator and whether change is absolute or relative. Tapio classes are therefore shown as a sequence of time windows rather than a fixed label.",
      "Colours identify different elasticity regimes between GDP and impact. The key question is not whether one isolated decoupling point exists, but whether a persistent and strong enough pattern emerges."
    ]
  },
  "crecimiento-eficiencia": {
    es: [
      "Los diagramas bivariados permiten observar si el crecimiento económico se acompaña de mayor presión ambiental o si cambia la pendiente de la relación. La comparación España-mundo añade una lectura de convergencia y divergencia histórica.",
      "La escala lineal o logarítmica y la selección independiente de ejes ayudan a explorar relaciones no lineales, cambios de régimen y periodos donde la eficiencia mejora sin reducir necesariamente el impacto total."
    ],
    en: [
      "Bivariate diagrams show whether economic growth is accompanied by higher environmental pressure or whether the slope of the relationship changes. The Spain-world comparison adds a historical convergence and divergence reading.",
      "Independent axis choices and linear or logarithmic scales help explore nonlinear relationships, regime shifts and periods where efficiency improves without necessarily reducing total impact."
    ]
  },
  "huella-material": {
    es: [
      "La huella material muestra la base física de la economía: biomasa, minerales, combustibles fósiles y comercio. Su lectura es especialmente sensible a la diferencia entre extracción doméstica, consumo aparente e intercambios con el exterior.",
      "El visor permite seguir la composición y ver cuándo el metabolismo español deja de explicarse solo por recursos internos y pasa a depender con más fuerza de importaciones y cadenas materiales externas."
    ],
    en: [
      "The material footprint shows the physical basis of the economy: biomass, minerals, fossil fuels and trade. Its interpretation depends strongly on the difference between domestic extraction, apparent consumption and exchanges with the rest of the world.",
      "The viewer tracks composition and shows when Spain's metabolism can no longer be explained only by domestic resources and becomes increasingly tied to imports and external material chains."
    ]
  },
  "transicion-forestal": {
    es: [
      "La transición forestal combina un cambio de superficie con un cambio de densidad y de stock de carbono. La serie nacional resume la dirección general, pero el mapa provincial muestra que el proceso no avanza igual en todos los territorios.",
      "La figura territorial permite localizar dónde la recuperación forestal es más intensa y dónde la composición del monte cambia de forma distinta. Esa lectura espacial es clave para no reducir la transición a una media nacional."
    ],
    en: [
      "The forest transition combines changes in area, density and carbon stock. The national series summarizes the overall direction, but the provincial map shows that the process is uneven across territories.",
      "The territorial figure locates where forest recovery is strongest and where forest composition changes differently. This spatial reading is essential to avoid reducing the transition to a national average."
    ]
  }
};

const PERSPECTIVE_ORIGINAL_ES = {
  "emisiones-historicas": [
    "España ha experimentado una profunda transformación en su perfil de emisiones a lo largo del último siglo y medio. Desde las primeras etapas de industrialización a finales del siglo XIX, cuando las emisiones de gases de efecto invernadero eran relativamente modestas y estaban vinculadas principalmente a la quema de carbón en la industria siderúrgica y el transporte ferroviario, hasta la explosión del consumo energético asociada al desarrollismo de las décadas de 1960 y 1970, la trayectoria española revela patrones comunes a otros países del sur de Europa, aunque con particularidades propias ligadas a su estructura productiva y a su dotación de recursos naturales.",
    "A partir de la década de 1980, la incorporación de España a la Comunidad Económica Europea y la posterior liberalización económica impulsaron un crecimiento sostenido de las emisiones, especialmente en los sectores del transporte y la construcción. El boom inmobiliario de finales de los años noventa y principios de los dos mil elevó las emisiones a máximos históricos, situando a España entre los países europeos con mayor crecimiento relativo de gases de efecto invernadero respecto a los niveles de 1990. La crisis financiera de 2008 supuso un punto de inflexión, con una reducción notable de las emisiones que, sin embargo, estuvo más vinculada a la contracción económica que a una verdadera descarbonización estructural.",
    "En la última década, los datos muestran una tendencia moderadamente descendente de las emisiones totales, apoyada en el despliegue de energías renovables, el cierre progresivo de centrales térmicas de carbón y mejoras en la eficiencia energética del parque edificatorio y el sector industrial. No obstante, el análisis de largo plazo revela que la intensidad de emisiones por unidad de PIB, aunque decreciente, sigue siendo elevada en comparación con la media de la Unión Europea, lo que sugiere que el camino hacia la neutralidad climática requerirá transformaciones más profundas en el sistema productivo, el modelo de movilidad y los patrones de consumo del conjunto de la sociedad española."
  ],
  "huella-acumulada": [
    "En los debates sobre cambio climático, la responsabilidad de un país no se mide solo por lo que emite hoy. Se mide por lo que ha emitido a lo largo de toda su historia. El CO2 permanece en la atmósfera durante siglos: cada tonelada emitida en 1900 sigue calentando el planeta hoy. Por eso las emisiones acumuladas —la suma de todo lo emitido desde que empezamos a contar— son el indicador más honesto de la responsabilidad histórica de un país.",
    "Nuestra base de datos permite calcular esa cifra para España desde 1860. Y los resultados no son exactamente los que uno esperaría.",
    "Desde 1860, cada habitante de España ha emitido, de media, unas 3,5 toneladas de gases de efecto invernadero por persona y año en términos acumulados. La media mundial es de 6,1 toneladas. Es decir, en responsabilidad histórica de emisiones per cápita, España ha contribuido un 42 % menos que el promedio global.",
    "Esto puede parecer sorprendente para un país de renta alta. La explicación está en la historia: durante casi un siglo, entre 1860 y 1950, España fue un país fundamentalmente agrario con emisiones muy bajas. Mientras el mundo industrializado —Reino Unido, Alemania, Estados Unidos— acumulaba enormes cantidades de CO2 quemando carbón, España apenas estaba empezando. En 1950, las emisiones acumuladas per cápita de España eran de 1,4 toneladas, frente a 4,1 de la media mundial.",
    "La aceleración vino después. Entre 1950 y 2007, España se industrializó a toda velocidad y sus emisiones per cápita superaron la media mundial. Pero el retraso histórico hace que, en el cómputo acumulado, España siga por debajo. Es como un corredor que arrancó tarde: aunque haya esprintado fuerte en las últimas vueltas, lleva menos kilómetros totales.",
    "Si en lugar de emisiones miramos materiales —todo lo que una economía extrae, importa y consume en toneladas—, la imagen cambia. Las emisiones acumuladas per cápita de materiales de España eran prácticamente iguales a las del mundo en el año 2000: 5,6 toneladas en ambos casos. Y en 2022 siguen casi parejas: 7,0 España, 7,2 el mundo.",
    "¿Cómo es posible que España esté por debajo en emisiones pero no en materiales? Por la burbuja inmobiliaria. Los materiales de construcción —arena, grava, cemento— pesan mucho pero no emiten tanto directamente. El pico de 20 toneladas per cápita de materiales en 2007 no tiene equivalente en emisiones. España se empachó de hormigón mucho más que de carbono.",
    "El resultado es que, en su huella material acumulada, España no puede reclamar un papel modesto. Hemos extraído y consumido, por persona, prácticamente lo mismo que la media planetaria. Y eso incluye 160 años en los que la mayor parte del mundo no se había industrializado.",
    "La huella acumulada de España se puede leer en cuatro tiempos: 1860–1950, el país agrario; 1950–1975, la Gran Aceleración; 1975–2007, el sprint; y 2008–2022, la caída. En cada fase cambia no solo el volumen del impacto, sino también su composición y su ritmo.",
    "Si se mide en emisiones acumuladas per cápita, España ha contribuido menos que la media mundial al cambio climático. Si se mide en materiales, prácticamente lo mismo. Lo que es indiscutible es que España concentró su impacto en un período muy corto —la segunda mitad del siglo XX— y que buena parte de la reducción reciente se debe tanto a la crisis como a la eficiencia. La huella acumulada no miente: somos responsables de lo que hemos consumido, y 160 años de datos están ahí para contarlo."
  ],
  "desacoplamiento-mito-realidad": [
    "Hay un gráfico que a los optimistas les encanta: el de la intensidad ambiental del PIB. Muestra cuántas emisiones, cuántos materiales o cuánta energía se necesitan para producir un euro de riqueza. Y la tendencia es inequívoca: cada vez menos. En España, la intensidad de emisiones por unidad de PIB ha caído un 86 % desde 1860. La de materiales, un 87 %. Cada euro que producimos hoy contamina y pesa una fracción de lo que pesaba hace un siglo.",
    "Si la historia acabara ahí, el crecimiento verde sería un hecho consumado. Pero no acaba ahí.",
    "El problema es que la economía ha crecido mucho más rápido de lo que ha mejorado la eficiencia. Las emisiones por euro cayeron un 86 %, sí. Pero el PIB se multiplicó por 45. El resultado neto: las emisiones absolutas se multiplicaron por casi diez entre 1860 y su pico de 2005. Con los materiales el patrón es idéntico: la intensidad bajó un 87 %, pero el consumo total se multiplicó por catorce.",
    "Es lo que los economistas ecológicos llaman la paradoja de Jevons, o el efecto rebote a gran escala: las mejoras de eficiencia no reducen el consumo total, porque se reinvierten en más producción. Cada unidad pesa menos, pero hay muchas más unidades. El coche gasta menos por kilómetro, pero recorremos diez veces más kilómetros.",
    "España parece, a primera vista, un caso de éxito. Las emisiones per cápita han caído de 8,2 toneladas en 2007 a 4,8 en 2022. El consumo de materiales, de 20 a 9 toneladas. El consumo de energía, de 3,3 a 2,5 toneladas equivalentes de petróleo. En todos los indicadores, España consume hoy menos por persona que hace quince años. ¿No es eso desacoplamiento absoluto?",
    "Sí, pero con letra pequeña. La caída no fue gradual: fue un desplome provocado por la crisis de 2008. Los materiales cayeron un 75 % en pocos años, arrastrados por el colapso de la construcción. No fue una transición planificada hacia la sostenibilidad; fue el estallido de una burbuja.",
    "Parte de la mejora reciente es real. La intensidad de emisiones en 2022 es la mitad de la de 2007. Las renovables, la mejora tecnológica y el cambio de estructura económica explican una parte significativa de esa caída. Pero no toda. Sin la crisis, sin la COVID y sin la desindustrialización parcial, las cifras serían muy distintas.",
    "Mientras España baja, el mundo sube. El consumo global de materiales per cápita pasó de 11 toneladas en 2007 a 12,6 en 2022. Las emisiones mundiales apenas se han movido. No hay desacoplamiento absoluto a escala global en ninguno de los grandes indicadores ambientales.",
    "España produce hoy cada euro con muchos menos materiales y emisiones que en 1860. Eso es un logro técnico enorme. Pero no ha sido suficiente para evitar que el impacto absoluto se multiplicara. Ser más eficiente es necesario. Pero la pregunta incómoda sigue en pie: ¿puede una economía crecer indefinidamente en un planeta con recursos finitos?"
  ],
  "huella-material": [
    "En 2007, cada persona que vivía en España consumía —directa o indirectamente— 20 toneladas de materiales al año. Veinte toneladas. Es el peso de cuatro todoterrenos grandes, o de un camión cargado. Cada persona, cada año. No es una metáfora: es lo que mide la Contabilidad del Flujo de Materiales cuando suma todo lo que una economía extrae, importa y consume: arena, grava, cemento, petróleo, alimentos, metales, madera. Todo lo que tiene peso y entra en el sistema económico.",
    "Hoy ese dato ha caído a la mitad. Pero la historia de cómo llegamos a ese pico —y de qué está hecho— es probablemente la mejor radiografía física del modelo de desarrollo español.",
    "En 1860, España consumía unas 64 millones de toneladas de materiales al año. El 88 % era biomasa: cosechas, leña, pasto, pesca. Los minerales no metálicos —la arena, la grava, la piedra caliza con la que se hace el cemento— apenas representaban un 10 %. Los combustibles fósiles, un raquítico 1 %.",
    "En 2023, la fotografía es irreconocible. Los minerales no metálicos, los materiales de la construcción, son ya el tipo dominante. Los combustibles fósiles representan una parte central del metabolismo económico y la biomasa ha perdido el peso relativo que tenía en una economía agraria.",
    "El dato más espectacular de toda la serie es el de los minerales no metálicos. En 1860, España consumía 6 millones de toneladas. En 2007, en el pico de la burbuja inmobiliaria, consumía 612 millones. Se había multiplicado por cien.",
    "No hay ningún otro indicador ambiental en nuestra base de datos que muestre un crecimiento remotamente comparable. Ni las emisiones, ni la energía, ni el consumo de agua. El boom inmobiliario español no fue solo una burbuja financiera: fue una burbuja física, medible en cientos de millones de toneladas de arena, grava y cemento.",
    "A partir de 1957, la balanza material se invirtió para siempre. Desde entonces, España importa más materiales de los que exporta. En 2007, las importaciones netas alcanzaron 177 millones de toneladas. España ya no solo consume sus propios recursos: necesita los de otros.",
    "Desde 2007, el consumo total se ha desplomado. En parte es una buena noticia, pero conviene no engañarse: la crisis de 2008 provocó un colapso de la construcción que explica buena parte de la reducción. No fue una decisión consciente de consumir menos, sino el estallido de un modelo insostenible.",
    "Si pones la economía española en una báscula, lo que ves es la historia de un país que pasó de consumir 4 toneladas por persona en 1860 —casi todo biomasa— a engullir 20 toneladas en 2007 —sobre todo arena, grava y petróleo—. La burbuja inmobiliaria no fue solo un delirio financiero: fue el mayor atracón material de la historia de España."
  ],
  "transicion-forestal": [
    "Puede parecer contraintuitivo, pero España tiene hoy más superficie forestal que en cualquier otro momento de los últimos dos siglos. Los bosques han crecido, se han densificado y acumulan más carbono que nunca. Según nuestra reconstrucción histórica, el stock de carbono forestal pasó de 340 millones de toneladas en 1860 a 844 millones en 2010: se ha multiplicado por 2,5. Es la llamada transición forestal, un fenómeno bien documentado en países industrializados. Pero si rascas un poco, la historia tiene bastantes más aristas de lo que parece.",
    "La idea de transición forestal la formalizó Alexander Mather en los años 90. La lógica es sencilla: un país se industrializa, la agricultura se intensifica, la población migra a las ciudades, las tierras marginales se abandonan y los bosques las recolonizan. En Europa occidental, este proceso lleva décadas en marcha.",
    "En España, el punto de inflexión se sitúa hacia 1950. Antes de esa fecha, los bosques se habían ido degradando durante casi un siglo: entre 1860 y 1950, el stock de biomasa forestal cayó un 25 %. Pero la deforestación propiamente dicha solo explica un tercio de esa caída. Los otros dos tercios se debieron a algo menos visible: la reducción de la densidad de los bosques que quedaban.",
    "Tendemos a pensar que el carbón y el petróleo sustituyeron rápidamente a la leña. Pero la realidad es que la leña siguió siendo una fuente energética fundamental en España hasta bien entrada la década de 1960. La presión sobre el monte no desapareció de golpe: cambió de forma, de región y de intensidad.",
    "A partir de 1950, dos procesos confluyeron para invertir la tendencia. Por un lado, el abandono agrario: las tierras de cultivo marginales, sobre todo en zonas de montaña, fueron abandonadas durante el éxodo rural y los bosques las recolonizaron. Por otro, las reforestaciones del franquismo impulsaron plantaciones masivas, sobre todo de pinos y eucaliptos.",
    "El resultado combinado es que la superficie forestal española prácticamente se ha duplicado desde mediados del siglo XX, y la biomasa acumulada en los bosques ha crecido aún más rápido. Hoy los bosques españoles almacenan más carbono que nunca en la historia registrada.",
    "No todos los bosques son iguales. Gran parte de la recuperación se ha producido con masas forestales jóvenes, de crecimiento rápido y alta inflamabilidad. El tipo de madera que produce España también ha cambiado radicalmente: del combustible doméstico a los usos industriales.",
    "Aquí viene la parte incómoda. La acumulación de biomasa sin gestión forestal activa ha incrementado el riesgo de grandes incendios. Los montes que antes estaban pastoreados, podados y aprovechados para leña ahora acumulan combustible sin control. Es una de las grandes paradojas de la transición forestal: tener más bosques puede significar tener más fuego.",
    "La transición forestal española es real y significativa. Pero no es una historia simple de éxito. Los bosques que tenemos hoy son distintos a los de hace un siglo: están menos gestionados, son más vulnerables al fuego, contienen especies diferentes y su recuperación se ha producido en parte porque consumimos recursos forestales de otros países."
  ],
  "crecimiento-eficiencia": [
    "La promesa del crecimiento verde es sencilla: que la economía siga creciendo mientras las emisiones bajan. En jerga académica se llama desacoplamiento. Pero ¿es algo que esté realmente ocurriendo en España? Y si es así, ¿basta con el ritmo actual? La serie histórica que hemos construido desde 1860 permite responder con perspectiva.",
    "La buena noticia es clara. Si comparamos la evolución del PIB y de las emisiones en España desde 1860, el PIB ha crecido mucho más rápido. Dicho de otro modo: la intensidad de carbono de la economía —las emisiones por euro producido— ha caído de forma casi continua. Hoy generamos mucha más riqueza con menos emisiones por unidad de producto.",
    "Esto no es exclusivo de España. A escala global se observa la misma tendencia. Pero España ha sido particularmente intensa en esa mejora de eficiencia, especialmente desde la transición democrática.",
    "La eficiencia no basta cuando el pastel crece. Las emisiones absolutas han subido enormemente a lo largo del período, a pesar de la mejora en intensidad. Es como un coche que consume menos por kilómetro pero que recorre diez veces más distancia: al final, gasta más gasolina.",
    "El análisis de descomposición permite separar los factores que explican el cambio en las emisiones. En España, el crecimiento demográfico ha contribuido al aumento de emisiones de forma sostenida, pero el gran motor ha sido el enriquecimiento medido como PIB per cápita. El único factor que ha tirado para abajo es la intensidad de carbono, pero no lo suficiente para compensar los otros dos.",
    "Desde 2005, España ha reducido emisiones de forma significativa. Pero conviene descomponer esa caída. Por un lado, se han producido mejoras reales de eficiencia. Sin embargo, una parte importante de la reducción se explica por las crisis económicas. Y no es lo mismo reducir emisiones por eficiencia que por empobrecimiento.",
    "España es hoy mucho más eficiente que hace un siglo. Cada euro produce menos emisiones. Pero eso no ha bastado para frenar el crecimiento absoluto de las emisiones, que solo ha caído recientemente y en parte por razones poco deseables. El desacoplamiento existe, pero es frágil e insuficiente para cumplir los compromisos climáticos."
  ],
  "balance-emisiones": [
    "A finales de 2023 el diario El País titulaba: “Las emisiones de efecto invernadero caen a mínimos históricos en España”. A las pocas líneas se aclaraba que las emisiones de CO2 habían alcanzado su nivel más bajo desde 1990. Salvo que la historia de España empiece en 1990, el titular merece una revisión.",
    "La imprecisión no es solo periodística. El Inventario Nacional de Emisiones arranca en 1990. Antes de esa fecha, simplemente no hay datos oficiales. Por eso hemos construido una serie histórica que se remonta a 1860, disponible en abierto en esta web. Los resultados cuentan una historia bastante distinta.",
    "Entre 1860 y 2017, las emisiones totales de gases de efecto invernadero en España casi se multiplicaron por diez: de 31 a 272 millones de toneladas de CO2 equivalente, con un máximo de 376 millones en 2005, justo antes de la Gran Recesión.",
    "Pero el crecimiento no fue lineal. Durante casi un siglo, entre mediados del XIX y mediados del XX, los niveles fueron relativamente estables. La verdadera aceleración llegó con el despegue económico de los años 50: entre 1950 y 2005 las emisiones crecieron al 3,5 % anual, más del doble que la media del período completo.",
    "Habitualmente asociamos el cambio climático con las fábricas y el carbón. Pero en 1860, el 92 % de las emisiones españolas procedían de actividades agrarias: el metano del ganado y el CO2 de la deforestación, que avanzaba para abrir nuevas tierras de cultivo.",
    "La transición hacia las emisiones fósiles fue progresiva: primero el carbón, luego el petróleo y más recientemente el gas natural. Hoy las emisiones agrarias tienen un peso mucho menor y, paradójicamente, los bosques españoles se han convertido en sumideros netos de carbono gracias a la reforestación.",
    "España comparte con el mundo la aceleración de mediados del siglo XX y la transición de emisiones agrarias a fósiles. Pero con matices: hasta 1950 nuestras emisiones crecieron más lento que la media global; después, las oscilaciones fueron más bruscas.",
    "Las emisiones en España no están en mínimos históricos. Han caído significativamente en dos décadas, sí, pero siguen muy por encima de los niveles que marcarían un espacio seguro para el clima. Entender la trayectoria larga es fundamental para no confundir una mejora relativa con una solución."
  ]
};

const PERSPECTIVE_ORIGINAL_EN = {
  "emisiones-historicas": [
    "Spain's emissions history is not the history of a simple upward curve. For much of the nineteenth and early twentieth centuries, the country remained a relatively low-fossil-energy economy. Its climate pressure was limited when compared with the early industrial powers, and a large share of emissions was still linked to land use, livestock and agriculture.",
    "That pattern changed during the second half of the twentieth century. Industrialization, urban growth, motorization and the expansion of electricity pushed emissions into a much steeper path. The Spanish case shares the broad timing of the Great Acceleration, but with a delay: the acceleration arrives later and is compressed into fewer decades.",
    "The composition of emissions also changes. Coal, oil and later natural gas become central, while land-based emissions lose relative weight. This does not make earlier agrarian emissions irrelevant; it means that the historical balance must be read as a transition between different emission regimes rather than as a single fossil-fuel story.",
    "The peak came in the years before the financial crisis of 2008. After that, emissions declined sharply. Part of that decline reflects real changes in the energy system, including renewables, the closing of coal plants and efficiency gains. But part of it also reflects crisis, deindustrialization and slower economic activity.",
    "The comparison with the world is useful because it separates scale from timing. Spain arrives late, catches up fast and then begins to diverge again in the recent period. The viewer makes it possible to see those shifts by changing metric, area and component.",
    "The main lesson is caution. Recent reductions matter, but they do not erase the long accumulated trajectory. Spain's climate transition is real, but its historical emissions profile shows how difficult it is to distinguish structural decarbonization from temporary economic slowdowns."
  ],
  "huella-acumulada": [
    "In climate debates, a country's responsibility is not measured only by what it emits today. It is also measured by what it has emitted over time. Carbon dioxide remains in the atmosphere for centuries, so cumulative emissions are a central measure of historical responsibility.",
    "CAHE makes it possible to calculate that long-run balance for Spain from 1860. The result is more nuanced than a simple rich-country story. In cumulative per-capita greenhouse-gas emissions, Spain remains below the world average for much of the historical period because it industrialized later than the major early emitters.",
    "For almost a century, between 1860 and 1950, Spain was still largely agrarian and its fossil emissions were relatively low. While Britain, Germany or the United States accumulated large amounts of carbon through coal-based industrialization, Spain was only beginning its own fossil-energy transition.",
    "The acceleration came later. From the 1950s to the housing-bubble years, Spain's per-capita emissions rose quickly and in some years moved above the global average. But the late start still matters in the cumulative count. Historical responsibility depends not only on intensity, but also on when the acceleration begins.",
    "Materials tell a different story. When we look at accumulated material use, Spain is much closer to the world average. The housing boom was crucial here: sand, gravel, cement and other construction materials weigh enormously, even when their direct emissions do not rise in the same proportion.",
    "This contrast is the point of the entry. Spain can appear relatively modest in cumulative emissions while looking much less modest in cumulative material use. The country did not only carbonize; it also built, extracted, imported and consumed a vast physical stock in a short period.",
    "The accumulated footprint therefore has to be read in phases: agrarian low metabolism, late industrial acceleration, the post-1975 sprint, and the fall after 2008. Each phase changes the volume, the rhythm and the composition of environmental pressure.",
    "The long-run record does not offer a single verdict. It shows that responsibility depends on what is measured. For emissions, Spain arrived late. For materials, the country caught up dramatically. Both readings are necessary to understand Spain's place in the global environmental transition."
  ],
  "desacoplamiento-mito-realidad": [
    "There is one chart that optimists love: environmental intensity over GDP. It shows how much emission, energy or material is needed to produce one unit of economic output. In Spain, that curve has improved enormously. Each euro of GDP carries far less environmental pressure today than it did in the nineteenth or early twentieth century.",
    "If the story ended there, green growth would look like a finished success. But it does not end there. Efficiency has improved, while the scale of the economy has expanded even faster. The result is that absolute emissions, material use and energy demand increased for most of the period despite better intensity.",
    "This is the central tension. Relative decoupling is real: the economy produces more value with fewer impacts per unit. Absolute decoupling is much harder: total impacts must fall while the economy keeps growing. The Spanish record contains moments of absolute decline, but many of them coincide with crisis rather than with a smooth planned transition.",
    "The 2008 crisis is the clearest example. Material use collapsed after the end of the construction boom. Emissions also fell. But a large part of that decline came from recession, not only from structural transformation. A fall caused by economic contraction is environmentally important, but it is not the same as a stable decarbonization path.",
    "The Tapio view helps make this distinction. It classifies moving periods according to the relationship between economic growth and environmental change. A single point is not enough. What matters is whether decoupling becomes persistent, strong and compatible with long-run climate and resource constraints.",
    "The global comparison adds another warning. Spain has reduced several per-capita indicators since the mid-2000s, while the world as a whole has not achieved the same absolute decline in the major environmental pressures.",
    "The conclusion is uncomfortable but useful. Efficiency is essential, and Spain has made real progress. But efficiency alone has not been enough to prevent a large historical increase in absolute impact. The question is not whether we can produce more cleanly. The question is whether we can reduce total pressure fast enough."
  ],
  "huella-material": [
    "In 2007, each person living in Spain consumed, directly or indirectly, around 20 tonnes of materials per year. Twenty tonnes: the weight of several large cars, or a loaded truck, per person and per year. This is not a metaphor. It is what material-flow accounting measures when it adds biomass, fossil fuels, metals, construction minerals and imported materials.",
    "That peak is one of the clearest physical signatures of Spain's development model. It shows that the housing bubble was not only a financial episode. It was also a material event, measured in hundreds of millions of tonnes of sand, gravel, cement, stone, fuels and imported goods.",
    "In 1860, the Spanish economy was mostly based on biomass. Crops, wood, pasture and other biological materials dominated the material profile. Non-metallic minerals existed, but their weight was still modest. Fossil fuels were only a small share of the total.",
    "By the early twenty-first century, the picture had changed completely. Construction minerals had become central, fossil materials had become structurally important, and biomass had lost the relative weight it had in an agrarian economy.",
    "The most striking series is non-metallic minerals. Their growth during the second half of the twentieth century, and especially during the housing boom, dwarfs most other environmental indicators in the database. No reading of Spanish economic history is complete if it ignores this physical expansion.",
    "Trade also matters. Spain increasingly consumed materials that were not extracted inside its borders. The material balance therefore connects domestic development with external territories and supply chains.",
    "After 2007, total material use fell sharply. That fall matters, but it should not be romanticized. Much of it came from the collapse of construction after the financial crisis. It was not simply a deliberate transition toward lower material consumption.",
    "Putting Spain on a scale reveals a country that moved from an agrarian metabolism to a construction-heavy, fossil-dependent and trade-connected metabolism in a remarkably short period. The material binge is one of the best ways to read the physical history of modern Spain."
  ],
  "transicion-forestal": [
    "It may seem counterintuitive, but Spain has more forest area today than at any point in the last two centuries. Forests have expanded, become denser and accumulated more carbon. This is usually described as a forest transition, a process documented in many industrialized countries.",
    "The basic mechanism is simple. As a country industrializes, agriculture intensifies, rural populations move to cities and marginal farmland is abandoned. Forests then recolonize part of that land. In Spain, the turning point appears around the middle of the twentieth century.",
    "Before that moment, the story was not one of steady recovery. Forest biomass declined during the nineteenth and early twentieth centuries. Deforestation explains only part of the fall. A large part came from declining density in the forests that remained, driven by grazing, fuelwood extraction and other uses.",
    "Fuelwood is crucial to this story. Coal and oil did not immediately replace wood. Wood remained an important energy source in Spain well into the twentieth century. Pressure on forests did not disappear at once; it changed in form, geography and intensity.",
    "After 1950, abandonment of marginal farmland, rural depopulation and state-led reforestation helped reverse the trend. Forest area expanded and carbon stocks rose. In aggregate terms, the recovery is real and large.",
    "But the recovery is not a simple success story. Many new forests are young, dense, weakly managed and vulnerable to fire. The type of wood produced also changed, from domestic fuel to more industrial uses.",
    "The provincial map is important because the transition is spatially uneven. Some areas recovered strongly, others changed more slowly, and the composition of forests differs across territories. A national average hides much of that geography.",
    "Spain's forest transition therefore has two sides. It is a major environmental recovery, but it also creates new management challenges. More forest can mean more carbon, more landscape recovery and, at the same time, more fire risk if biomass accumulates without active management."
  ],
  "crecimiento-eficiencia": [
    "The promise of green growth is simple: the economy keeps growing while emissions fall. In academic terms, this is decoupling. Spain's long-run series make it possible to ask whether that promise is visible in the historical record.",
    "The good news is clear. GDP has grown much faster than many environmental pressures. Carbon intensity, material intensity and energy intensity have all declined over the long run. Spain produces far more economic value with less impact per unit of output than in the past.",
    "This is a real achievement. It reflects technological change, a different economic structure, more efficient energy use and, in recent decades, the expansion of renewables. The relationship between growth and impact has changed.",
    "But the bivariate view also shows the limits of that achievement. For much of the period, absolute emissions and material use still increased. The economy became cleaner per unit while becoming much larger overall.",
    "The problem is scale. A car that uses less fuel per kilometre can still consume more fuel in total if it travels many more kilometres. The same logic applies to an economy. Efficiency reduces pressure per unit; it does not automatically reduce total pressure.",
    "Since the mid-2000s, Spain shows more signs of absolute decline in some indicators. Yet part of that decline is linked to crisis, slower growth and structural change rather than to efficiency alone.",
    "The historical record therefore offers a balanced message. Spain is much more efficient than it used to be. But the improvement has not been strong enough, for most of the period, to offset the growth in scale. Decoupling exists, but it remains fragile and incomplete."
  ],
  "balance-emisiones": [
    "In late 2023, some headlines said that Spain's greenhouse-gas emissions had fallen to historical lows. Usually, the small print meant historical since 1990, because the official inventory starts there. But Spain's environmental history does not begin in 1990.",
    "CAHE reconstructs a longer series back to 1860. That longer view changes the interpretation. It shows that emissions before 1990 were not invisible; they were part of a long transition from agrarian land-based emissions to fossil and industrial emissions.",
    "Between 1860 and the early twenty-first century, total greenhouse-gas emissions rose dramatically. The increase was not linear. For decades, emissions remained relatively stable. The real acceleration came after the 1950s, with industrial growth, urbanization, transport and fossil-energy expansion.",
    "The composition changed as much as the level. In the nineteenth century, a large share of emissions came from agriculture, livestock and land-use change. Later, fossil fuels became dominant. Today, forests can act as carbon sinks, while energy, transport and industry carry much of the climate burden.",
    "This matters because a short official baseline can mislead public debate. A decline relative to 1990 is important, but it is not the same as a decline relative to the full historical trajectory.",
    "The viewer allows the series to be read in several ways: annual emissions, accumulated emissions, intensity and components. Each metric answers a different question. Annual flows show the present pace; accumulated emissions show historical responsibility; intensity shows how production has changed.",
    "Spain's emissions have fallen significantly in recent decades. That is good news. But they are not at historical lows in the deeper sense, and they remain far above a level compatible with a safe climate space. The long-run record helps avoid confusing recent improvement with a solved problem."
  ]
};

function perspectiveTexts(entry){
  const lang = state.lang === "en" ? "en" : "es";
  if(lang === "en" && PERSPECTIVE_ORIGINAL_EN[entry.id]?.length) return PERSPECTIVE_ORIGINAL_EN[entry.id];
  if(lang === "es" && PERSPECTIVE_ORIGINAL_ES[entry.id]?.length) return PERSPECTIVE_ORIGINAL_ES[entry.id];
  const extra = PERSPECTIVE_DETAIL_TEXT[entry.id]?.[lang] || [];
  return [state.lang === "en" ? entry.body_en : entry.body, ...extra]
    .filter(Boolean);
}

function perspectiveParagraphHtml(entry, limit = null){
  const texts = perspectiveTexts(entry);
  return (limit ? texts.slice(0, limit) : texts)
    .filter(Boolean)
    .map(text => `<p>${text}</p>`)
    .join("");
}

function perspectiveDetailParagraphs(entry){
  return perspectiveParagraphHtml(entry);
}

function perspectiveReadMoreMarkup(entry){
  const links = PERSPECTIVE_READ_MORE[entry.id] || [];
  if(!links.length) return "";
  const label = state.lang === "en" ? "Read more" : "Leer más";
  const intro = state.lang === "en" ? "Related academic publication" : "Publicación académica relacionada";
  return `<aside class="perspective-read-more">
    <span>${intro}</span>
    ${links.map(link => `<a href="${link.url}" target="_blank" rel="noopener">${escHtml(label)}: ${escHtml(link.title)} →</a>`).join("")}
  </aside>`;
}

function miniSeriesPath(points, x, y, key = "valor"){
  const coords = points
    .filter(d => d && d[key] != null && Number.isFinite(d[key]))
    .map(d => ({ x: x(d.year ?? d.x), y: y(d[key]) }))
    .filter(d => Number.isFinite(d.x) && Number.isFinite(d.y));
  return coords.map((d, i) => `${i ? "L" : "M"}${d.x} ${d.y}`).join(" ");
}

function miniPolylinePoints(points, x, y, key = "valor"){
  return points
    .filter(d => d && d[key] != null && Number.isFinite(d[key]))
    .map(d => ({ x: x(d.year ?? d.x), y: y(d[key]) }))
    .filter(d => Number.isFinite(d.x) && Number.isFinite(d.y))
    .map(d => `${d.x.toFixed(1)},${d.y.toFixed(1)}`)
    .join(" ");
}

function miniLastPoint(points, x, y, key = "valor"){
  const valid = points
    .filter(d => d && d[key] != null && Number.isFinite(d[key]))
    .map(d => ({ x: x(d.year ?? d.x), y: y(d[key]), value: d[key] }))
    .filter(d => Number.isFinite(d.x) && Number.isFinite(d.y));
  return valid.at(-1) || null;
}

function miniLineFigure(){
  const spain = getTrendSeries("Emisiones de CO₂", "Per cápita", "España");
  const world = getTrendSeries("Emisiones de CO₂", "Per cápita", "Mundo");
  const all = [...spain, ...world].filter(d => d.valor != null && Number.isFinite(d.valor));
  if(all.length < 4) return null;
  const x = d3.scaleLinear().domain(d3.extent(all, d => d.year)).range([28, 236]);
  const y = d3.scaleLinear().domain([0, d3.max(all, d => d.valor)]).nice().range([96, 18]);
  const spainPts = miniPolylinePoints(spain, x, y);
  const worldPts = miniPolylinePoints(world, x, y);
  const lastSpain = miniLastPoint(spain, x, y);
  const lastWorld = miniLastPoint(world, x, y);
  if(!spainPts || !worldPts || !lastSpain || !lastWorld) return null;
  return `<svg class="perspective-snapshot" viewBox="0 0 260 120" aria-hidden="true"><rect x="0" y="0" width="260" height="120" fill="#f5f7f9"/><g class="mini-grid"><path d="M28 96h214"/><path d="M28 72h214M28 48h214M28 24h214"/></g><path d="M28 16v80h214" fill="none" stroke="#cbd2d8" stroke-width="1"/><polyline points="${worldPts}" fill="none" stroke="#c94132" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${spainPts}" fill="none" stroke="#4f7ea8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${lastSpain.x}" cy="${lastSpain.y}" r="3.8" fill="#4f7ea8"/><circle cx="${lastWorld.x}" cy="${lastWorld.y}" r="3.8" fill="#c94132"/><text x="32" y="112" font-size="8" fill="#6f7b86">1860</text><text x="216" y="112" font-size="8" fill="#6f7b86">2022</text><text x="${Math.min(224, lastSpain.x + 6)}" y="${Math.max(16, lastSpain.y - 4)}" font-size="8" font-weight="700" fill="#4f7ea8">España</text><text x="${Math.min(224, lastWorld.x + 6)}" y="${Math.max(24, lastWorld.y + 10)}" font-size="8" font-weight="700" fill="#c94132">Mundo</text></svg>`;
}

function miniAreaFigure(){
  const spain = getTrendSeries("Emisiones de CO₂", "Absoluto", "España");
  const world = getTrendSeries("Emisiones de CO₂", "Absoluto", "Mundo");
  const all = [...spain, ...world].filter(d => d.valor != null && Number.isFinite(d.valor));
  if(all.length < 4) return null;
  const x = d3.scaleLinear().domain(d3.extent(all, d => d.year)).range([28, 236]);
  const y = d3.scaleLinear().domain([0, d3.max(all, d => d.valor)]).nice().range([96, 18]);
  const areaPath = data => {
    const valid = data.filter(d => d.valor != null && Number.isFinite(d.valor));
    if(valid.length < 2) return "";
    return `${miniSeriesPath(valid, x, y)} L${x(valid.at(-1).year)} 96 L${x(valid[0].year)} 96 Z`;
  };
  return `<svg viewBox="0 0 260 120" aria-hidden="true"><g class="mini-grid"><path d="M28 96h214"/><path d="M28 72h214M28 48h214M28 24h214"/></g><path d="${areaPath(world)}" fill="#c94132" opacity=".26"/><path d="${areaPath(spain)}" fill="#4f7ea8" opacity=".44"/><path d="${miniSeriesPath(world, x, y)}" fill="none" stroke="#c94132" stroke-width="2"/><path d="${miniSeriesPath(spain, x, y)}" fill="none" stroke="#4f7ea8" stroke-width="2"/></svg>`;
}

function miniScatterFigure(){
  const build = area => {
    const xRows = DATA_ANALYSIS.filter(r => r.area === area && r.variable === "Per cápita");
    const yRows = DATA_ANALYSIS.filter(r => r.area === area && r.variable === "Per cápita");
    const yMap = new Map(yRows.map(r => [r.year, r["Emisiones de CO₂"]]));
    return xRows.map(r => ({ year: r.year, x: r.PIB, y: yMap.get(r.year) }))
      .filter(d => d.x > 0 && d.y > 0 && Number.isFinite(d.x) && Number.isFinite(d.y));
  };
  const spain = build("España"), world = build("Mundo");
  const all = [...spain, ...world];
  if(all.length < 4) return null;
  const x = d3.scaleLinear().domain(d3.extent(all, d => d.x)).nice().range([30, 236]);
  const y = d3.scaleLinear().domain(d3.extent(all, d => d.y)).nice().range([96, 18]);
  const dots = (data, color) => data.filter((_, i) => i % 4 === 0).map(d => `<circle cx="${x(d.x)}" cy="${y(d.y)}" r="3.3" fill="${color}" opacity=".82"/>`).join("");
  return `<svg viewBox="0 0 260 120" aria-hidden="true"><g class="mini-grid"><path d="M28 10v86h212"/><path d="M28 74h212M28 50h212M28 26h212"/></g>${dots(world, "#c94132")}${dots(spain, "#4f7ea8")}</svg>`;
}

function miniTapioFigure(){
  const rows = DATA_ANALYSIS.filter(r => r.area === "España" && r.variable === "Absoluto").sort((a, b) => a.year - b.year);
  const pts = [];
  for(let i = 5; i < rows.length; i += 4){
    const a = rows[i - 5], b = rows[i];
    if(!a?.PIB || !b?.PIB || !a["Emisiones de CO₂"] || !b["Emisiones de CO₂"]) continue;
    const gG = (b.PIB / a.PIB) - 1;
    const gI = (b["Emisiones de CO₂"] / a["Emisiones de CO₂"]) - 1;
    const elasticity = gG !== 0 ? gI / gG : null;
    pts.push({ x: gG * 100, y: gI * 100, pat: classifyTapio(gG, gI, elasticity) });
  }
  if(pts.length < 3) return null;
  const maxAbs = Math.max(1, d3.max(pts, d => Math.max(Math.abs(d.x), Math.abs(d.y))));
  const x = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([30, 236]);
  const y = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([96, 18]);
  return `<svg viewBox="0 0 260 120" aria-hidden="true"><g class="mini-grid"><path d="M130 12v92M30 62h210"/><path d="M44 96 216 20"/></g>${pts.map(d => `<circle cx="${x(d.x)}" cy="${y(d.y)}" r="4" fill="${TAPIO_META[d.pat]?.color || "#6c757d"}" opacity=".88"/>`).join("")}</svg>`;
}

function miniBarsFigure(){
  const indicators = ["Energía", "Materiales", "Emisiones de CO₂", "Tierras de cultivo", "Agua"];
  const vals = indicators.map(ind => {
    const s = getTrendSeries(ind, "Absoluto", "España").filter(d => d.valor != null && Number.isFinite(d.valor));
    const first = s[0]?.valor || 1;
    const last = s.at(-1)?.valor || first;
    return { ind, value: first ? last / first : 1 };
  }).filter(d => Number.isFinite(d.value));
  if(vals.length < 3) return null;
  const y = d3.scaleLinear().domain([0, d3.max(vals, d => d.value)]).nice().range([96, 20]);
  return `<svg viewBox="0 0 260 120" aria-hidden="true"><g class="mini-grid"><path d="M30 96h210"/><path d="M30 72h210M30 48h210M30 24h210"/></g>${vals.map((d, i) => `<rect x="${46 + i * 37}" y="${y(d.value)}" width="23" height="${96 - y(d.value)}" fill="${FALLBACK_PALETTE[i]}" opacity=".9"/>`).join("")}</svg>`;
}

function perspectiveFigureMarkup(kind){
  const hasLong = Array.isArray(DATA_LONG) && DATA_LONG.length;
  const hasAnalysis = Array.isArray(DATA_ANALYSIS) && DATA_ANALYSIS.length;
  const live = kind === "line" && hasLong ? miniLineFigure()
    : kind === "area" && hasLong ? miniAreaFigure()
    : kind === "scatter" && hasAnalysis ? miniScatterFigure()
    : kind === "tapio" && hasAnalysis ? miniTapioFigure()
    : kind === "bars" && hasLong ? miniBarsFigure()
    : null;
  if(live) return live;
  if(kind === "scatter") return `<svg viewBox="0 0 260 120" aria-hidden="true"><g class="mini-grid"><path d="M28 10v86h212"/><path d="M28 74h212M28 50h212M28 26h212"/></g><g class="mini-dots blue">${[0,1,2,3,4,5,6,7].map((_,i)=>`<circle cx="${48+i*21}" cy="${82-i*6+(i%2)*8}" r="4"/>`).join("")}</g><g class="mini-dots red">${[0,1,2,3,4,5,6,7].map((_,i)=>`<circle cx="${54+i*22}" cy="${78-i*8-(i%2)*4}" r="4"/>`).join("")}</g></svg>`;
  if(kind === "tapio") return `<svg viewBox="0 0 260 120" aria-hidden="true"><g class="mini-grid"><path d="M130 12v92M30 62h210"/><path d="M44 96 216 20"/></g><circle cx="94" cy="76" r="5" fill="#d0a53f"/><circle cx="138" cy="55" r="5" fill="#c94132"/><circle cx="172" cy="45" r="5" fill="#4f7ea8"/><circle cx="188" cy="73" r="5" fill="#5f8d63"/><circle cx="116" cy="41" r="5" fill="#1c1f24"/></svg>`;
  if(kind === "bars") return `<svg viewBox="0 0 260 120" aria-hidden="true"><g class="mini-grid"><path d="M30 96h210"/><path d="M30 72h210M30 48h210M30 24h210"/></g><rect x="48" y="50" width="22" height="46" fill="#c79a3b"/><rect x="82" y="34" width="22" height="62" fill="#4f7ea8"/><rect x="116" y="68" width="22" height="28" fill="#6f7a3d"/><rect x="150" y="22" width="22" height="74" fill="#c94132"/><rect x="184" y="42" width="22" height="54" fill="#1c1f24"/></svg>`;
  if(kind === "map") return `<svg viewBox="0 0 260 120" aria-hidden="true"><path d="M90 22 140 18 188 38 180 76 140 100 92 84 70 52z" fill="#e1d8b4"/><path d="M94 28 118 25 120 58 100 60z" fill="#6f7a3d"/><path d="M126 25 154 26 148 54 121 58z" fill="#cdbf86"/><path d="M154 30 180 42 172 70 148 55z" fill="#9aa05b"/><path d="M102 64 140 58 136 94 96 80z" fill="#d7cc9a"/><path d="M142 60 174 73 142 96z" fill="#5f6f32"/><circle cx="198" cy="82" r="7" fill="#9aa05b"/></svg>`;
  if(kind === "area") return `<svg viewBox="0 0 260 120" aria-hidden="true"><g class="mini-grid"><path d="M28 96h214"/><path d="M28 72h214M28 48h214M28 24h214"/></g><path d="M34 92 C72 88 86 70 112 72 S152 50 178 38 214 26 236 18 L236 96 L34 96z" fill="#c79a3b" opacity=".55"/><path d="M34 92 C76 82 96 84 120 68 S168 55 194 44 218 42 236 34 L236 96 L34 96z" fill="#c94132" opacity=".55"/></svg>`;
  return `<svg class="perspective-snapshot" viewBox="0 0 260 120" aria-hidden="true"><rect x="0" y="0" width="260" height="120" fill="#f5f7f9"/><g class="mini-grid"><path d="M28 96h214"/><path d="M28 72h214M28 48h214M28 24h214"/></g><path d="M28 16v80h214" fill="none" stroke="#cbd2d8" stroke-width="1"/><polyline points="34,88 62,82 78,76 98,70 126,66 154,48 194,28 236,20" fill="none" stroke="#4f7ea8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><polyline points="34,90 72,86 98,75 118,62 166,50 188,44 214,38 236,30" fill="none" stroke="#c94132" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="236" cy="20" r="3.8" fill="#4f7ea8"/><circle cx="236" cy="30" r="3.8" fill="#c94132"/><text x="32" y="112" font-size="8" fill="#6f7b86">1860</text><text x="216" y="112" font-size="8" fill="#6f7b86">2022</text><text x="198" y="18" font-size="8" font-weight="700" fill="#4f7ea8">España</text><text x="198" y="42" font-size="8" font-weight="700" fill="#c94132">Mundo</text></svg>`;
}

function perspectiveVisualMarkup(entry){
  const shot = PERSPECTIVE_SHOTS[entry.id];
  if(shot){
    const title = state.lang === "en" ? entry.title_en : entry.title;
    return `<img class="perspective-screenshot" src="${shot}" alt="${escAttr(title)}">`;
  }
  return perspectiveFigureMarkup(entry.fig);
}

function optionMarkup(value, label, current){
  return `<option value="${escAttr(value)}"${value === current ? " selected" : ""}>${label}</option>`;
}

function perspectiveTopicLabel(p){
  return state.lang === "en" ? (p.topic_en || p.topic) : p.topic;
}

function perspectiveDateLabel(date){
  const d = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat(state.lang === "en" ? "en-GB" : "es-ES", {
    day: "2-digit", month: "short", year: "numeric"
  }).format(d).replace(/\./g, "");
}

function perspectiveAuthorButtons(authors){
  return (authors || []).map(author => `<button class="perspective-author-link" type="button" data-perspective-author="${escAttr(author)}">${author}</button>`).join(`<span class="meta-sep">·</span>`);
}

function perspectiveAiLabel(){
  return state.lang === "en" ? "AI-assisted entry" : "Entrada asistida por IA";
}

function perspectiveAiProtocolLabel(){
  return state.lang === "en" ? "AI protocol" : "Protocolo IA";
}

function isAiAssistedPerspective(entry){
  return !!entry && AI_ASSISTED_PERSPECTIVES.has(entry.id);
}

function perspectiveAudio(entry){
  if(!entry) return null;
  const audioLang = state.lang === "en" ? "en" : "es";
  const meta = audioLang === "en" ? PERSPECTIVE_AUDIO_EN[entry.id] : PERSPECTIVE_AUDIO_ES[entry.id];
  if(!meta) return null;
  const base = `assets/audio/perspectives/${audioLang}/${entry.id}`;
  return {
    src: `${base}.mp3`,
    timing: `${base}.json`,
    text: `${base}-cleaned.txt`,
    voice: audioLang === "en" ? "kokoro:af_heart" : "kokoro:ef_dora",
    duration: meta.duration || null
  };
}

function formatDuration(seconds){
  if(!seconds || !Number.isFinite(seconds)) return "";
  const min = Math.max(1, Math.round(seconds / 60));
  return state.lang === "en" ? `${min} min` : `${min} min`;
}

function playIconMarkup(){
  return `<span class="audio-play-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>`;
}

function perspectiveAudioAction(entry, variant = "list"){
  const audio = perspectiveAudio(entry);
  if(!audio) return "";
  const duration = formatDuration(audio.duration);
  const label = state.lang === "en" ? "Listen" : "Escuchar";
  const sub = state.lang === "en" ? "Audio entry" : "Entrada en audio";
  if(variant === "hero"){
    return `<button class="perspective-audio-hero" type="button" data-perspective-audio="${escAttr(entry.id)}" aria-label="${label}">
      ${playIconMarkup()}
      <span class="audio-copy"><strong>${label}</strong><small>${sub}${duration ? ` · ${duration}` : ""}</small></span>
    </button>`;
  }
  return `<button class="perspective-audio-action" type="button" data-perspective-audio="${escAttr(entry.id)}" aria-label="${label}">
    ${playIconMarkup()}<span>${label}${duration ? ` <small>${duration}</small>` : ""}</span>
  </button>`;
}

function perspectiveAiBadge(entry, compact = false){
  if(!isAiAssistedPerspective(entry)) return "";
  const label = compact ? "" : perspectiveAiLabel();
  const title = `${perspectiveAiLabel()} · ${perspectiveAiProtocolLabel()}`;
  return `<button class="perspective-ai-badge${compact ? " compact" : ""}" type="button" data-ai-protocol aria-label="${perspectiveAiProtocolLabel()}" title="${escAttr(title)}">
    <span class="ai-mark" aria-hidden="true">IA</span>
    ${label ? `<span>${label}</span><span class="ai-info-dot" aria-hidden="true">i</span>` : ""}
  </button>`;
}

function perspectiveAuthorLine(entry){
  const authors = perspectiveAuthorButtons(entry.authors);
  const ai = perspectiveAiBadge(entry, true);
  return [authors, ai].filter(Boolean).join(`<span class="meta-sep">·</span>`);
}

function openAiProtocolModal(){
  if(state.lang === "en"){
    els.modalContent.innerHTML = `
      <span class="modal-eyebrow">Perspectives · AI protocol</span>
      <h2>AI-assisted entries</h2>
      <p>Some Perspective entries are produced with a semi-automated workflow assisted by artificial intelligence. The label identifies editorial or drafting assistance, not autonomous authorship.</p>
      <p>The human authors define the core argument, the data to be used, the figure or viewer that supports the story, and the interpretation they want to communicate. A custom blog-science skill then helps turn that brief into a synthetic, public-facing draft in a tone consistent with CAHE's human-written entries.</p>
      <p>Every entry is reviewed, corrected and approved by the CAHE team before publication. The AI does not choose the research question, validate the data, decide the interpretation or replace scientific responsibility.</p>
      <h3>In practice</h3>
      <ul>
        <li>Human authors set the message, evidence and limits of the argument.</li>
        <li>The skill assists with structure, style, synthesis and first drafting.</li>
        <li>The final text is checked by the named authors before publication.</li>
      </ul>`;
  } else {
    els.modalContent.innerHTML = `
      <span class="modal-eyebrow">Perspectivas · protocolo IA</span>
      <h2>Entradas asistidas por IA</h2>
      <p>Algunas entradas de Perspectivas se producen mediante un flujo semiautomatizado con apoyo de inteligencia artificial. La etiqueta señala asistencia editorial o de redacción, no autoría autónoma.</p>
      <p>Los autores humanos definen el planteamiento, el mensaje principal, los datos que deben emplearse, la figura o visor que sostiene la lectura y la historia que se quiere contar. A partir de esas indicaciones, una skill propia de blog científico ayuda a convertir el encargo en un borrador sintético, divulgativo y coherente con el estilo de las entradas humanas de CAHE.</p>
      <p>Todas las entradas son revisadas, corregidas y aprobadas por el equipo antes de publicarse. La IA no elige la pregunta, no valida los datos, no decide la interpretación y no sustituye la responsabilidad científica de los autores firmantes.</p>
      <h3>En la práctica</h3>
      <ul>
        <li>Los autores humanos fijan la idea, la evidencia y los límites del argumento.</li>
        <li>La skill ayuda con estructura, estilo, síntesis y primera redacción.</li>
        <li>El texto final se revisa y valida por las personas que firman la entrada.</li>
      </ul>`;
  }
  els.modal.classList.add("open");
}

function bindAiProtocolButtons(root){
  root.querySelectorAll("[data-ai-protocol]").forEach(btn => {
    btn.addEventListener("click", event => {
      event.stopPropagation();
      openAiProtocolModal();
    });
  });
}

function audioTimeLabel(seconds){
  if(!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function audioToggleIconMarkup(paused = true){
  if(paused) return `<span class="audio-play-triangle" aria-hidden="true"></span>`;
  return `<span class="audio-pause-bars" aria-hidden="true"><i></i><i></i></span>`;
}

function updatePerspectiveAudioSurface(player, audioEl){
  if(!player || !audioEl) return;
  const duration = Number.isFinite(audioEl.duration) && audioEl.duration > 0 ? audioEl.duration : 0;
  const current = Math.max(0, audioEl.currentTime || 0);
  const pct = duration ? Math.max(0, Math.min(100, current / duration * 100)) : 0;
  const fill = player.querySelector("[data-audio-fill]");
  const knob = player.querySelector("[data-audio-knob]");
  const currentEl = player.querySelector("[data-audio-current]");
  const durationEl = player.querySelector("[data-audio-duration]");
  const toggle = player.querySelector("[data-audio-toggle]");
  const speed = player.querySelector("[data-audio-speed]");
  const progress = player.querySelector("[data-audio-progress]");
  if(fill) fill.style.width = `${pct}%`;
  if(knob) knob.style.left = `${pct}%`;
  if(currentEl) currentEl.textContent = audioTimeLabel(current);
  if(durationEl) durationEl.textContent = duration ? audioTimeLabel(duration) : "--:--";
  if(toggle){
    toggle.classList.toggle("playing", !audioEl.paused);
    toggle.setAttribute("aria-label", audioEl.paused ? (state.lang === "en" ? "Play audio" : "Reproducir audio") : (state.lang === "en" ? "Pause audio" : "Pausar audio"));
    const icon = toggle.querySelector("[data-audio-toggle-icon]");
    if(icon) icon.innerHTML = audioToggleIconMarkup(audioEl.paused);
  }
  if(speed) speed.textContent = `${perspectiveAudioRuntime.speed}x`;
  if(progress){
    progress.setAttribute("aria-valuenow", Math.round(current));
    progress.setAttribute("aria-valuemax", Math.round(duration || 0));
    progress.setAttribute("aria-valuetext", `${audioTimeLabel(current)} / ${duration ? audioTimeLabel(duration) : "--:--"}`);
  }
}

function updatePerspectiveAudioUi(player, audioEl){
  updatePerspectiveAudioSurface(player, audioEl);
  const reader = document.getElementById("perspective-audio-reader");
  if(reader && reader !== player) updatePerspectiveAudioSurface(reader, audioEl);
  updatePerspectiveReader(reader, audioEl);
}

function stopPerspectiveAudioFrame(){
  if(perspectiveAudioRuntime.frame != null){
    cancelAnimationFrame(perspectiveAudioRuntime.frame);
    perspectiveAudioRuntime.frame = null;
  }
}

function startPerspectiveAudioFrame(player, audioEl){
  stopPerspectiveAudioFrame();
  const tick = () => {
    updatePerspectiveAudioUi(player, audioEl);
    if(!audioEl.paused || perspectiveAudioRuntime.dragging){
      perspectiveAudioRuntime.frame = requestAnimationFrame(tick);
    }else{
      perspectiveAudioRuntime.frame = null;
    }
  };
  perspectiveAudioRuntime.frame = requestAnimationFrame(tick);
}

function seekPerspectiveAudioFromClient(player, audioEl, clientX){
  const progress = player.querySelector("[data-audio-progress]");
  if(!progress || !Number.isFinite(audioEl.duration) || audioEl.duration <= 0) return;
  const rect = progress.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
  audioEl.currentTime = pct * audioEl.duration;
  updatePerspectiveAudioUi(player, audioEl);
}

function bindPerspectiveAudioPlayer(player, audioEl, bindMediaEvents = true){
  const toggle = player.querySelector("[data-audio-toggle]");
  const progress = player.querySelector("[data-audio-progress]");
  const speed = player.querySelector("[data-audio-speed]");
  const speeds = [1, 1.15, 1.3, 1.5, 1.75, 2];
  toggle.addEventListener("click", () => {
    if(audioEl.paused) audioEl.play().catch(() => {});
    else audioEl.pause();
    updatePerspectiveAudioUi(player, audioEl);
  });
  player.querySelectorAll("[data-audio-skip]").forEach(btn => btn.addEventListener("click", () => {
    const delta = Number(btn.dataset.audioSkip) || 0;
    audioEl.currentTime = Math.max(0, Math.min(audioEl.duration || 0, (audioEl.currentTime || 0) + delta));
    updatePerspectiveAudioUi(player, audioEl);
  }));
  speed.addEventListener("click", () => {
    const idx = speeds.findIndex(v => Math.abs(v - perspectiveAudioRuntime.speed) < .001);
    perspectiveAudioRuntime.speed = speeds[(idx + 1) % speeds.length];
    audioEl.playbackRate = perspectiveAudioRuntime.speed;
    updatePerspectiveAudioUi(player, audioEl);
  });
  progress.addEventListener("pointerdown", event => {
    perspectiveAudioRuntime.dragging = true;
    progress.setPointerCapture?.(event.pointerId);
    seekPerspectiveAudioFromClient(player, audioEl, event.clientX);
    startPerspectiveAudioFrame(player, audioEl);
  });
  progress.addEventListener("pointermove", event => {
    if(!perspectiveAudioRuntime.dragging) return;
    seekPerspectiveAudioFromClient(player, audioEl, event.clientX);
  });
  ["pointerup","pointercancel","lostpointercapture"].forEach(type => progress.addEventListener(type, () => {
    perspectiveAudioRuntime.dragging = false;
    updatePerspectiveAudioUi(player, audioEl);
    if(!audioEl.paused) startPerspectiveAudioFrame(player, audioEl);
  }));
  if(bindMediaEvents){
    audioEl.addEventListener("loadedmetadata", () => updatePerspectiveAudioUi(player, audioEl));
    audioEl.addEventListener("timeupdate", () => updatePerspectiveAudioUi(player, audioEl));
    audioEl.addEventListener("play", () => startPerspectiveAudioFrame(player, audioEl));
    audioEl.addEventListener("pause", () => updatePerspectiveAudioUi(player, audioEl));
    audioEl.addEventListener("ended", () => {
      stopPerspectiveAudioFrame();
      updatePerspectiveAudioUi(player, audioEl);
    });
  }
}

function perspectiveReaderDuration(entry, audioEl){
  if(audioEl && Number.isFinite(audioEl.duration) && audioEl.duration > 0) return audioEl.duration;
  return perspectiveAudio(entry)?.duration || 0;
}

function perspectiveReaderSegments(entry, duration){
  const texts = perspectiveTexts(entry);
  const weights = texts.map(text => Math.max(8, String(text || "").trim().split(/\s+/).filter(Boolean).length));
  const total = weights.reduce((sum, n) => sum + n, 0) || texts.length || 1;
  let cursor = 0;
  return texts.map((text, idx) => {
    const share = duration ? weights[idx] / total * duration : 0;
    const start = cursor;
    cursor += share;
    return { text, start, end: idx === texts.length - 1 ? duration : cursor };
  });
}

function activePerspectiveReaderIndex(entry, audioEl){
  const duration = perspectiveReaderDuration(entry, audioEl);
  const current = Math.max(0, audioEl?.currentTime || 0);
  const segments = perspectiveReaderSegments(entry, duration);
  return Math.max(0, segments.findIndex((seg, idx) => current >= seg.start && (current < seg.end || idx === segments.length - 1)));
}

function updatePerspectiveReader(reader, audioEl){
  if(!reader || !audioEl || !perspectiveAudioRuntime.entry) return;
  const idx = activePerspectiveReaderIndex(perspectiveAudioRuntime.entry, audioEl);
  if(String(idx) === reader.dataset.activeLine) return;
  reader.dataset.activeLine = String(idx);
  const lines = [...reader.querySelectorAll("[data-reader-line]")];
  lines.forEach((line, lineIdx) => {
    line.classList.toggle("active", lineIdx === idx);
    line.classList.toggle("past", lineIdx < idx);
  });
  const active = lines[idx];
  active?.scrollIntoView({ block: "center", behavior: "smooth" });
}

function closePerspectiveReader(){
  document.getElementById("perspective-audio-reader")?.remove();
}

function openPerspectiveReader(){
  const entry = perspectiveAudioRuntime.entry;
  const audioEl = perspectiveAudioRuntime.audioEl;
  if(!entry || !audioEl) return;
  closePerspectiveReader();
  const title = state.lang === "en" ? entry.title_en : entry.title;
  const authors = (entry.authors || []).join(" · ");
  const duration = perspectiveReaderDuration(entry, audioEl);
  const segments = perspectiveReaderSegments(entry, duration);
  const reader = document.createElement("div");
  reader.id = "perspective-audio-reader";
  reader.className = "perspective-audio-reader";
  reader.setAttribute("role", "dialog");
  reader.setAttribute("aria-modal", "true");
  reader.setAttribute("aria-label", state.lang === "en" ? "Audiobook reader" : "Lector de audiolibro");
  reader.innerHTML = `
    <div class="reader-shell">
      <header class="reader-top">
        <div class="reader-title">
          <span>${state.lang === "en" ? "CAHE Podcast" : "Podcast CAHE"}</span>
          <h2>${escHtml(title)}</h2>
          <small>${escHtml(authors)}</small>
        </div>
        <button class="reader-close" type="button" data-reader-close aria-label="${t("close")}">×</button>
      </header>
      <main class="reader-transcript" data-reader-transcript>
        ${segments.map((seg, idx) => `<button class="reader-line" type="button" data-reader-line="${idx}" data-reader-start="${seg.start.toFixed(3)}"><span>${escHtml(seg.text)}</span></button>`).join("")}
      </main>
      <footer class="reader-control-bar">
        <div class="perspective-reader-controls">
          <button class="perspective-player-play" type="button" data-audio-toggle aria-label="${state.lang === "en" ? "Listen" : "Escuchar"}">
            <span class="perspective-toggle-icon" data-audio-toggle-icon>${audioToggleIconMarkup(audioEl.paused)}</span>
          </button>
          <button class="perspective-player-skip" type="button" data-audio-skip="-10" aria-label="-10 segundos">-10</button>
          <div class="perspective-player-progress" data-audio-progress role="slider" tabindex="0" aria-valuemin="0" aria-valuenow="0" aria-valuemax="0" aria-valuetext="0:00">
            <div class="perspective-player-progress-track">
              <span class="perspective-player-progress-fill" data-audio-fill></span>
              <span class="perspective-player-progress-knob" data-audio-knob></span>
            </div>
          </div>
          <div class="perspective-player-time"><span data-audio-current>0:00</span><span data-audio-duration>--:--</span></div>
          <button class="perspective-player-skip" type="button" data-audio-skip="10" aria-label="+10 segundos">+10</button>
          <button class="perspective-player-speed" type="button" data-audio-speed aria-label="${state.lang === "en" ? "Playback speed" : "Velocidad de reproduccion"}">1x</button>
        </div>
      </footer>
    </div>`;
  document.body.appendChild(reader);
  reader.querySelector("[data-reader-close]").addEventListener("click", closePerspectiveReader);
  reader.querySelectorAll("[data-reader-line]").forEach(line => {
    line.addEventListener("click", () => {
      const start = Number(line.dataset.readerStart) || 0;
      audioEl.currentTime = Math.max(0, start + .05);
      updatePerspectiveAudioUi(reader, audioEl);
      audioEl.play().catch(() => {});
    });
  });
  bindPerspectiveAudioPlayer(reader, audioEl, false);
  updatePerspectiveAudioUi(reader, audioEl);
  syncPerspectiveAudioViewport();
}

function syncPerspectiveAudioViewport(){
  const player = document.getElementById("perspective-audio-player");
  const reader = document.getElementById("perspective-audio-reader");
  if(!player && !reader) return;
  if(!isCompactViewport()){
    player?.style.removeProperty("--perspective-player-bottom");
    reader?.style.removeProperty("--reader-control-bottom");
    return;
  }
  const vv = window.visualViewport;
  const browserInset = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
  const bottom = Math.max(74, Math.min(112, browserInset + 18));
  const rounded = `${Math.round(bottom)}px`;
  player?.style.setProperty("--perspective-player-bottom", rounded);
  reader?.style.setProperty("--reader-control-bottom", rounded);
}

function bindPerspectiveAudioViewport(){
  if(perspectiveAudioRuntime.viewportCleanup) perspectiveAudioRuntime.viewportCleanup();
  const vv = window.visualViewport;
  const handler = () => syncPerspectiveAudioViewport();
  window.addEventListener("resize", handler, { passive: true });
  if(vv){
    vv.addEventListener("resize", handler, { passive: true });
    vv.addEventListener("scroll", handler, { passive: true });
  }
  perspectiveAudioRuntime.viewportCleanup = () => {
    window.removeEventListener("resize", handler);
    if(vv){
      vv.removeEventListener("resize", handler);
      vv.removeEventListener("scroll", handler);
    }
  };
  syncPerspectiveAudioViewport();
}

function closePerspectiveAudio(){
  const player = document.getElementById("perspective-audio-player");
  if(perspectiveAudioRuntime.audioEl) perspectiveAudioRuntime.audioEl.pause();
  stopPerspectiveAudioFrame();
  closePerspectiveReader();
  if(perspectiveAudioRuntime.viewportCleanup) perspectiveAudioRuntime.viewportCleanup();
  perspectiveAudioRuntime.viewportCleanup = null;
  perspectiveAudioRuntime.audioEl = null;
  perspectiveAudioRuntime.entry = null;
  if(player) player.remove();
}

function openPerspectiveAudio(entry){
  const audio = perspectiveAudio(entry);
  if(!audio) return;
  if(perspectiveAudioRuntime.audioEl) perspectiveAudioRuntime.audioEl.pause();
  stopPerspectiveAudioFrame();
  let player = document.getElementById("perspective-audio-player");
  if(!player){
    player = document.createElement("div");
    player.id = "perspective-audio-player";
    player.className = "perspective-audio-player";
    player.setAttribute("role", "region");
    player.setAttribute("aria-label", "Audio de perspectivas");
    document.body.appendChild(player);
  }
  const title = state.lang === "en" ? entry.title_en : entry.title;
  const authors = (entry.authors || []).join(" · ");
  const playerLabel = state.lang === "en" ? "CAHE Podcast" : "Podcast CAHE";
  player.innerHTML = `
    <div class="perspective-player-copy">
      <span>${playerLabel}</span>
      <strong>${escHtml(title)}</strong>
      <small>${escHtml(authors)}</small>
    </div>
    <div class="perspective-player-controls">
      <button class="perspective-player-play" type="button" data-audio-toggle aria-label="${state.lang === "en" ? "Listen" : "Escuchar"}">
        <span class="perspective-toggle-icon" data-audio-toggle-icon>${audioToggleIconMarkup(true)}</span>
      </button>
      <button class="perspective-player-skip" type="button" data-audio-skip="-10" aria-label="-10 segundos">-10</button>
      <div class="perspective-player-progress" data-audio-progress role="slider" tabindex="0" aria-valuemin="0" aria-valuenow="0" aria-valuemax="0" aria-valuetext="0:00">
        <div class="perspective-player-progress-track">
          <span class="perspective-player-progress-fill" data-audio-fill></span>
          <span class="perspective-player-progress-knob" data-audio-knob></span>
        </div>
      </div>
      <div class="perspective-player-time"><span data-audio-current>0:00</span><span data-audio-duration>--:--</span></div>
      <button class="perspective-player-skip" type="button" data-audio-skip="10" aria-label="+10 segundos">+10</button>
      <button class="perspective-player-speed" type="button" data-audio-speed aria-label="${state.lang === "en" ? "Playback speed" : "Velocidad de reproduccion"}">1x</button>
    </div>
    <audio preload="metadata" src="${versionedLocalUrl(audio.src)}"></audio>
    <button class="perspective-player-fullscreen" type="button" data-audio-reader aria-label="${state.lang === "en" ? "Open audiobook mode" : "Abrir modo audiolibro"}"><span class="fullscreen-glyph" aria-hidden="true"></span></button>
    <button class="perspective-player-close" type="button" aria-label="Cerrar audio">×</button>
  `;
  player.querySelector(".perspective-player-close").addEventListener("click", closePerspectiveAudio);
  player.querySelector("[data-audio-reader]").addEventListener("click", openPerspectiveReader);
  const audioEl = player.querySelector("audio");
  perspectiveAudioRuntime.entry = entry;
  perspectiveAudioRuntime.audioEl = audioEl;
  audioEl.playbackRate = perspectiveAudioRuntime.speed;
  bindPerspectiveAudioViewport();
  bindPerspectiveAudioPlayer(player, audioEl);
  updatePerspectiveAudioUi(player, audioEl);
  audioEl.play().catch(() => {});
}

function bindPerspectiveAudioButtons(root){
  root.querySelectorAll("[data-perspective-audio]").forEach(btn => {
    btn.addEventListener("click", event => {
      event.stopPropagation();
      const entry = PERSPECTIVAS.find(p => p.id === btn.dataset.perspectiveAudio);
      if(entry) openPerspectiveAudio(entry);
    });
  });
}

function bindPerspectiveAuthorLinks(root){
  root.querySelectorAll("[data-perspective-author]").forEach(btn => {
    btn.addEventListener("click", event => {
      event.stopPropagation();
      state.perspectiveEntry = null;
      state.perspectiveAuthor = btn.dataset.perspectiveAuthor;
      renderPerspectivas();
    });
  });
}

function renderPerspectiveDetail(entry){
  const hasShot = !!PERSPECTIVE_SHOTS[entry.id];
  els.workspace.innerHTML = `<div class="page perspective-detail-page">
    <button class="card-action perspective-back" type="button" id="perspective-back">${state.lang === "en" ? "← All entries" : "← Todas las entradas"}</button>
    <article class="perspective-detail">
      <div class="perspective-detail-head">
        <div class="perspective-meta"><time datetime="${entry.date}">${perspectiveDateLabel(entry.date)}</time><span>${perspectiveAuthorLine(entry)}</span></div>
        <span class="card-eyebrow">${perspectiveTopicLabel(entry)}</span>
        <h1>${state.lang === "en" ? entry.title_en : entry.title}</h1>
        <p>${state.lang === "en" ? entry.summary_en : entry.summary}</p>
        ${perspectiveAudioAction(entry, "hero")}
      </div>
      <figure class="perspective-detail-figure${hasShot ? " has-screenshot" : ""}">
        <button class="perspective-figure-link${hasShot ? " has-screenshot" : ""}" type="button" data-perspective-viz="${entry.viz}" aria-label="${t("openViewer")}">
          ${perspectiveVisualMarkup(entry)}
        </button>
      </figure>
      <div class="perspective-figure-actions">
        <button class="card-action" type="button" data-perspective-viz="${entry.viz}">${t("openViewer")} →</button>
      </div>
      <div class="prose perspective-detail-body">
        ${perspectiveDetailParagraphs(entry)}
        ${perspectiveReadMoreMarkup(entry)}
      </div>
    </article>
  </div>`;
  els.workspace.querySelector("#perspective-back").addEventListener("click", () => {
    state.perspectiveEntry = null;
    renderPerspectivas();
  });
  bindPerspectiveAuthorLinks(els.workspace);
  bindAiProtocolButtons(els.workspace);
  bindPerspectiveAudioButtons(els.workspace);
  els.workspace.querySelectorAll("[data-perspective-viz]").forEach(el => {
    el.addEventListener("click", event => {
      event.stopPropagation();
      openVizFromStatic(entry.viz);
    });
  });
}

function renderPerspectivas(){
  if(!DATA_LONG || !DATA_ANALYSIS){
    loadGlobalData().then(() => {
      if(state.section === "perspectivas") renderPerspectivas();
    });
  }
  const activeEntry = state.perspectiveEntry ? PERSPECTIVAS.find(p => p.id === state.perspectiveEntry) : null;
  if(activeEntry){
    renderPerspectiveDetail(activeEntry);
    return;
  }
  const topics = Array.from(new Set(PERSPECTIVAS.map(p => p.topic)));
  const authors = Array.from(new Set(PERSPECTIVAS.flatMap(p => p.authors || []))).sort((a, b) => a.localeCompare(b, "es"));
  const sortOptions = [
    { id: "newest", label: t("newest") },
    { id: "oldest", label: t("oldest") },
    { id: "title", label: t("titleOrder") },
  ];
  if(state.perspectiveTopic !== "all" && !topics.includes(state.perspectiveTopic)) state.perspectiveTopic = "all";
  if(state.perspectiveAuthor !== "all" && !authors.includes(state.perspectiveAuthor)) state.perspectiveAuthor = "all";
  if(!sortOptions.some(o => o.id === state.perspectiveSort)) state.perspectiveSort = "newest";
  let entries = PERSPECTIVAS.filter(p =>
    (state.perspectiveTopic === "all" || p.topic === state.perspectiveTopic) &&
    (state.perspectiveAuthor === "all" || (p.authors || []).includes(state.perspectiveAuthor))
  );
  entries = entries.slice().sort((a, b) => {
    if(state.perspectiveSort === "oldest") return a.date.localeCompare(b.date);
    if(state.perspectiveSort === "title") return (state.lang === "en" ? a.title_en : a.title).localeCompare(state.lang === "en" ? b.title_en : b.title, state.lang === "en" ? "en" : "es");
    return b.date.localeCompare(a.date);
  });
  const aiProtocolSub = state.lang === "en" ? "Editorial protocol" : "Protocolo editorial";
  const aiProtocolTitle = state.lang === "en" ? "AI-assisted<br>entry" : "Entrada asistida<br>por IA";
  els.workspace.innerHTML = `<div class="page perspective-index-page"><div class="page-head perspective-page-head"><div class="perspective-head-copy"><div class="eyebrow">${t("perspectivas")}</div><h1>${t("perspectivesTitle")}</h1><p>${t("perspectivesIntro")}</p></div>
      <button class="perspective-ai-protocol perspective-ai-protocol-head" type="button" data-ai-protocol aria-label="${perspectiveAiProtocolLabel()}">
        <span class="ai-mark" aria-hidden="true">IA</span>
        <span class="ai-label-stack"><strong>${aiProtocolTitle}</strong><small>${aiProtocolSub}</small></span>
      </button>
    </div>
    <div class="filter-bar perspective-toolbar">
      ${miniSelectMarkup("perspective-topic-filter", t("topic"), state.perspectiveTopic === "all" ? t("allTopics") : (state.lang === "en" ? (PERSPECTIVAS.find(p => p.topic === state.perspectiveTopic)?.topic_en || state.perspectiveTopic) : state.perspectiveTopic), [t("allTopics"), ...topics.map(topic => state.lang === "en" ? (PERSPECTIVAS.find(p => p.topic === topic)?.topic_en || topic) : topic)])}
      ${miniSelectMarkup("perspective-author-filter", t("author"), state.perspectiveAuthor === "all" ? t("allAuthors") : state.perspectiveAuthor, [t("allAuthors"), ...authors])}
      ${miniSelectMarkup("perspective-sort-filter", t("orderBy"), (sortOptions.find(opt => opt.id === state.perspectiveSort) || sortOptions[0]).label, sortOptions.map(opt => opt.label))}
    </div>
    <div class="perspective-list">${entries.length ? entries.map(p => `<article class="perspective-article perspective-entry" data-perspective-entry="${p.id}">
      <div class="perspective-copy">
        <div class="perspective-meta"><time datetime="${p.date}">${perspectiveDateLabel(p.date)}</time><span>${perspectiveAuthorLine(p)}</span></div>
        <span class="card-eyebrow">${perspectiveTopicLabel(p)}</span>
        <h3>${state.lang === "en" ? p.title_en : p.title}</h3>
        <p class="perspective-summary">${state.lang === "en" ? p.summary_en : p.summary}</p>
        <div class="perspective-card-actions">
          <button class="card-action" type="button">${state.lang === "en" ? "Read entry" : "Leer entrada"} →</button>
          ${perspectiveAudioAction(p)}
        </div>
      </div>
    </article>`).join("") : `<div class="empty-state">${t("noEntries")}</div>`}</div></div>`;
  bindMiniSelect(els.workspace, "perspective-topic-filter", value => {
    const all = t("allTopics");
    const found = topics.find(topic => (state.lang === "en" ? (PERSPECTIVAS.find(p => p.topic === topic)?.topic_en || topic) : topic) === value);
    state.perspectiveTopic = value === all ? "all" : (found || "all");
    renderPerspectivas();
  });
  bindMiniSelect(els.workspace, "perspective-author-filter", value => {
    state.perspectiveAuthor = value === t("allAuthors") ? "all" : value;
    renderPerspectivas();
  });
  bindMiniSelect(els.workspace, "perspective-sort-filter", value => {
    state.perspectiveSort = (sortOptions.find(opt => opt.label === value) || sortOptions[0]).id;
    renderPerspectivas();
  });
  bindPerspectiveAuthorLinks(els.workspace);
  bindAiProtocolButtons(els.workspace);
  bindPerspectiveAudioButtons(els.workspace);
  els.workspace.querySelectorAll("[data-perspective-entry]").forEach(article => {
    article.addEventListener("click", () => {
      state.perspectiveEntry = article.dataset.perspectiveEntry;
      renderPerspectivas();
    });
  });
}

function publicationTagLabel(tag, tagMeta = {}){
  const meta = tagMeta[tag] || {};
  return state.lang === "en" ? (meta.label_en || meta.label || tag) : (meta.label || tag);
}
function publicationTypeLabel(item){
  return state.lang === "en" ? (item.typeLabelEn || item.typeLabel || item.type) : (item.typeLabel || item.type);
}
function publicationSortLabel(sortOptions, id){
  return (sortOptions.find(opt => opt.id === id) || sortOptions[0]).label;
}
function renderPublicationCard(item, tagMeta){
  const externalUrl = item.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(`${item.title} ${item.authors}`)}`;
  const tags = (item.tags || []).map(tag => {
    const color = (tagMeta[tag] && tagMeta[tag].color) || "#6f7a3d";
    return `<span class="pub-chip" style="--tag-color:${escAttr(color)}">${escHtml(publicationTagLabel(tag, tagMeta))}</span>`;
  }).join("");
  const venueBits = [item.venue, item.publisher, item.pages].filter(Boolean).join(" · ");
  return `<article class="publication-card">
    <div class="publication-topline"><span class="publication-year">${escHtml(item.year || "")}</span><span class="publication-type">${escHtml(publicationTypeLabel(item))}</span></div>
    <h3><a href="${escAttr(externalUrl)}" target="_blank" rel="noopener">${escHtml(item.title)}</a></h3>
    <p class="publication-authors">${escHtml(item.authors)}</p>
    ${venueBits ? `<p class="publication-venue">${escHtml(venueBits)}</p>` : ""}
    <div class="publication-tags">${tags}</div>
  </article>`;
}
function renderPublicaciones(){
  if(!PUBLICATIONS_DB){
    els.workspace.innerHTML = `<div class="page"><div class="loading"><span class="spinner"></span><strong>${t("loadingData")}</strong></div></div>`;
    loadPublications().then(() => {
      if(state.section === "publicaciones") renderPublicaciones();
    });
    return;
  }
  const db = PUBLICATIONS_DB || { tagMeta: {}, items: [] };
  const items = Array.isArray(db.items) ? db.items : [];
  const tagMeta = db.tagMeta || {};
  const tagCounts = new Map();
  items.forEach(item => (item.tags || []).forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)));
  const tags = Object.keys(tagMeta).filter(tag => tagCounts.has(tag));
  const authors = Array.from(new Set(items.flatMap(item => item.people || []))).sort((a, b) => a.localeCompare(b, state.lang === "en" ? "en" : "es"));
  const typeIds = Array.from(new Set(items.map(item => item.type).filter(Boolean)));
  const typeOptions = typeIds.map(id => {
    const found = items.find(item => item.type === id);
    return { id, label: publicationTypeLabel(found || { type: id }) };
  });
  const sortOptions = [
    { id: "newest", label: t("newest") },
    { id: "oldest", label: t("oldest") },
    { id: "author", label: t("author") },
    { id: "type", label: t("publicationType") },
    { id: "title", label: t("titleOrder") },
  ];
  state.pubTags = (state.pubTags || []).filter(tag => tagCounts.has(tag));
  if(state.pubAuthor !== "all" && !authors.includes(state.pubAuthor)) state.pubAuthor = "all";
  if(state.pubType !== "all" && !typeIds.includes(state.pubType)) state.pubType = "all";
  if(!sortOptions.some(opt => opt.id === state.pubSort)) state.pubSort = "newest";
  let filtered = items.filter(item => {
    const tagOk = !state.pubTags.length || state.pubTags.some(tag => (item.tags || []).includes(tag));
    const authorOk = state.pubAuthor === "all" || (item.people || []).includes(state.pubAuthor);
    const typeOk = state.pubType === "all" || item.type === state.pubType;
    return tagOk && authorOk && typeOk;
  });
  filtered = filtered.slice().sort((a, b) => {
    if(state.pubSort === "oldest") return (a.year || 0) - (b.year || 0) || String(a.title).localeCompare(String(b.title), "es");
    if(state.pubSort === "author") return String(a.authors || "").localeCompare(String(b.authors || ""), "es") || (b.year || 0) - (a.year || 0);
    if(state.pubSort === "type") return publicationTypeLabel(a).localeCompare(publicationTypeLabel(b), "es") || (b.year || 0) - (a.year || 0);
    if(state.pubSort === "title") return String(a.title || "").localeCompare(String(b.title || ""), "es");
    return (b.year || 0) - (a.year || 0) || String(a.title).localeCompare(String(b.title), "es");
  });
  const activeLabel = state.pubTags.length
    ? `${t("selectedTags")}: ${state.pubTags.map(tag => publicationTagLabel(tag, tagMeta)).join(" · ")}`
    : t("allTags");
  const tagButtons = [`<button class="pub-tag pub-tag-all${state.pubTags.length ? "" : " active"}" type="button" data-pub-tag="all">${t("allTags")}<span>${items.length}</span></button>`]
    .concat(tags.map(tag => {
      const color = (tagMeta[tag] && tagMeta[tag].color) || "#6f7a3d";
      const active = state.pubTags.includes(tag) ? " active" : "";
      return `<button class="pub-tag${active}" type="button" data-pub-tag="${escAttr(tag)}" style="--tag-color:${escAttr(color)}">${escHtml(publicationTagLabel(tag, tagMeta))}<span>${tagCounts.get(tag) || 0}</span></button>`;
    })).join("");
  els.workspace.innerHTML = `<div class="page publications-page">
    <div class="page-head"><h1>${t("publicationsTitle")}</h1><p>${t("publicationsIntro")}</p></div>
    <section class="publications-panel">
      <div class="publications-taxonomy">
        <div class="publications-taxonomy-head"><span>${escHtml(activeLabel)}</span><strong>${filtered.length} ${t("results")}</strong></div>
        <div class="pub-tags">${tagButtons}</div>
      </div>
      <div class="filter-bar publications-toolbar">
        ${miniSelectMarkup("pub-author-filter", t("author"), state.pubAuthor === "all" ? t("allAuthors") : state.pubAuthor, [t("allAuthors"), ...authors])}
        ${miniSelectMarkup("pub-type-filter", t("publicationType"), state.pubType === "all" ? t("allTypes") : (typeOptions.find(opt => opt.id === state.pubType)?.label || state.pubType), [t("allTypes"), ...typeOptions.map(opt => opt.label)])}
        ${miniSelectMarkup("pub-sort-filter", t("orderBy"), publicationSortLabel(sortOptions, state.pubSort), sortOptions.map(opt => opt.label))}
      </div>
      <div class="publications-list">${filtered.length ? filtered.map(item => renderPublicationCard(item, tagMeta)).join("") : `<div class="empty-state">${t("noPublications")}</div>`}</div>
    </section>
  </div>`;
  els.workspace.querySelectorAll("[data-pub-tag]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.pubTag;
      if(tag === "all") state.pubTags = [];
      else if(state.pubTags.includes(tag)) state.pubTags = state.pubTags.filter(tg => tg !== tag);
      else state.pubTags = [...state.pubTags, tag];
      renderPublicaciones();
    });
  });
  bindMiniSelect(els.workspace, "pub-author-filter", value => {
    state.pubAuthor = value === t("allAuthors") ? "all" : value;
    renderPublicaciones();
  });
  bindMiniSelect(els.workspace, "pub-type-filter", value => {
    state.pubType = value === t("allTypes") ? "all" : (typeOptions.find(opt => opt.label === value)?.id || "all");
    renderPublicaciones();
  });
  bindMiniSelect(els.workspace, "pub-sort-filter", value => {
    state.pubSort = (sortOptions.find(opt => opt.label === value) || sortOptions[0]).id;
    renderPublicaciones();
  });
}

const DATASETS = [
  { label: "Dataset integrado", file: "cahe_datos_integrados.xlsx", desc: "Base longitudinal completa con las principales series de energía, materiales, emisiones, usos del suelo, bosques y cultivos, preparada para reproducir las visualizaciones.", scope: "Integrado", method: "globales_metodologia.pdf" },
  { label: "Consumo de energía", file: "cahe_datos_energía.xlsx", desc: "Consumo de energía primaria: fuentes modernas (petróleo, gas, electricidad) y tradicionales (leña, alimentos y forraje).", scope: "Nacional", method: "energia_metodologia.pdf" },
  { label: "Emisiones", file: "cahe_datos_emisiones_gei.xlsx", desc: "Gases de efecto invernadero y CO₂: total, gases, grandes actividades, combustibles fósiles y usos del suelo.", scope: "Nacional", method: "emisiones_metodologia.pdf" },
  { label: "Flujos materiales", file: "cahe_datos_materiales.xlsx", desc: "Extracción, comercio y consumo aparente de biomasa, fósiles, minerales metálicos y minerales no metálicos.", scope: "Nacional · comercio", method: "materiales_metodologia.pdf" },
  { label: "Usos del suelo", file: "cahe_datos_uso_suelo.xlsx", desc: "Grandes coberturas del territorio español y reconstrucción de usos del suelo en perspectiva histórica.", scope: "Nacional · provincial", method: "uso_suelo_metodos_esp.docx" },
  { label: "Bosques", file: "cahe_datos_bosques.xlsx", desc: "Superficie forestal por categorías de monte, densidad y stock de carbono, con lectura nacional y provincial.", scope: "Nacional · provincial", method: "bosques_metodologia.pdf" },
  { label: "Cultivos", file: "cahe_datos_cultivos.xlsx", desc: "Superficie cultivada y principales grupos de cultivos, incluyendo cereales, frutales, leguminosas, industriales y olivar.", scope: "Nacional · provincial", method: "cultivos_metodos_esp.docx" },
  /* La base industrial no vive en docs/: se internalizó un nivel más arriba. */
  { label: "Industria", file: "FinalDB_1860_2021.csv", dataHref: "data/downloads/FinalDB_1860_2021.csv", desc: "Base industrial 1860-2021 con energía final y primaria, emisiones, gasto energético, valor añadido, fábricas y trabajadores por ramas industriales.", scope: "Nacional" },
];
/* «Cómo trabajamos»: qué cifras se contaron y cuáles construimos nosotros.
   El JSON de procedencia pesa cientos de KB, así que se carga la primera vez que se abre
   la sección, no al arrancar. El módulo se importa en diferido por lo mismo. */
function renderComoTrabajamos(){
  els.workspace.innerHTML = '<div id="pv-root"></div>';
  import("./methods/como-trabajamos.js?v=20260906f").then(m => {
    m.default.render(document.getElementById("pv-root"), state.lang);
  });
}

function renderDatos(){
  const zenodoAction = href => href
    ? `<a class="link zenodo-link" href="${href}" target="_blank" rel="noopener" title="${t("zenodo")}" aria-label="${t("zenodo")}">${zenodoBrand()}</a>`
    : `<span class="link zenodo-link disabled" aria-disabled="true" title="${t("zenodo")}" aria-label="${t("zenodo")}"><span class="action-main">${zenodoBrand()}</span></span>`;
  const githubAction = href => href
    ? `<a class="link github-link" href="${href}" target="_blank" rel="noopener" title="${t("github")}" aria-label="${t("github")}">${githubLogo("brand-logo github-logo")}<span>${t("github")}</span></a>`
    : `<span class="link github-link disabled" aria-disabled="true" title="${t("github")}" aria-label="${t("github")}"><span class="action-main">${githubLogo("brand-logo github-logo")}<span>${t("github")}</span></span></span>`;
  /* Los 24 documentos están internalizados en data/downloads/. Antes esta página solo
     ofrecía dos botones apagados por serie (Zenodo/GitHub, sin depósito todavía), así que
     un revisor no tenía de dónde bajar nada. Ahora la descarga directa es la acción
     principal y Zenodo/GitHub quedan como secundarios hasta que existan los DOI. */
  const fileHref = d => d.dataHref || (d.file ? `${V1_DOCS}/${encodeURIComponent(d.file)}` : null);
  const ext = name => (name.split(".").pop() || "").toUpperCase();
  const downloadAction = d => {
    const href = fileHref(d);
    if(!href) return "";
    return `<a class="link data-download" href="${href}" download title="${escAttr(`${t("dataDownload")} — ${tx(d.label)}`)}" aria-label="${escAttr(`${t("dataDownload")} — ${tx(d.label)}`)}"><span class="arr">↓</span><span>${t("dataDownload")} ${ext(d.file)}</span></a>`;
  };
  const methodAction = d => d.method
    ? `<a class="link data-method" href="${V1_DOCS}/${encodeURIComponent(d.method)}" target="_blank" rel="noopener" title="${escAttr(`${t("fullMethod")} — ${tx(d.label)}`)}" aria-label="${escAttr(`${t("fullMethod")} — ${tx(d.label)}`)}">${t("fullMethod")} ${ext(d.method)}</a>`
    : "";
  els.workspace.innerHTML = `<div class="page"><div class="page-head"><h1>${t("dataPageTitle")}</h1><p>${t("dataPageIntro")}</p></div>
    <section class="section-block"><h2>${t("dataSeriesTitle")}</h2><div class="data-list">${DATASETS.map(d => `<div class="data-row"><div class="data-main"><div class="label">${tx(d.label)}</div><div class="desc">${tx(d.desc)}</div></div><div class="meta">${tx(d.scope || "Repositorio")}</div><div class="data-actions">${downloadAction(d)}${methodAction(d)}</div><div class="data-actions data-actions-repo">${d.zenodo ? zenodoAction(d.zenodo) : `<span class="meta doi-pending">${t("doiPending")}</span>`}${githubAction(d.github || null)}</div></div>`).join("")}</div></section></div>`;
}

function renderNovedades(){
  state.section = "acerca";
  setNavActive("acerca");
  renderAcerca();
  openAcercaPanel(1);
}

const TEAM = [
  { name: "Juan Infante Amate", aff: "Universidad de Granada", role: "Coordinador", role_en: "Coordinator", photo: "infante_foto.jpg",
    links: [{ href: "assets/cv/infante_CV_extended_ES.pdf", title: "CV", icon: "cv-1.png" }, { href: "https://scholar.google.com/citations?user=s89YchgAAAAJ&hl=es", title: "Google Scholar", icon: "google-scholar-1.png" }, { href: "https://www.researchgate.net/profile/Juan-Infante-Amate", title: "ResearchGate", icon: "ResearchGate_icon_SVG.svg.png" }, { href: "https://www.ugr.es/personal/juan-infante-amate", title: "Web", icon: "web.png" }]},
  { name: "Iñaki Iriarte Goñi", aff: "Universidad de Zaragoza", photo: "iriarte_foto-1.jpg",
    links: [{ href: "https://scholar.google.es/citations?user=C0tX2hQAAAAJ&hl=es", title: "Google Scholar", icon: "google-scholar-1.png" }, { href: "https://www.researchgate.net/profile/Inaki-Iriarte-Goni", title: "ResearchGate", icon: "ResearchGate_icon_SVG.svg.png" }, { href: "https://economia_aplicada.unizar.es/personal/jose-ignacio-iriarte-goni", title: "Web", icon: "web.png" }]},
  { name: "Eduardo Aguilera", aff: "CSIC", photo: "aguilera_foto-1.jpg",
    links: [{ href: "https://scholar.google.com/citations?hl=es&user=3c01eqQAAAAJ", title: "Google Scholar", icon: "google-scholar-1.png" }, { href: "https://www.researchgate.net/profile/Eduardo-Aguilera", title: "ResearchGate", icon: "ResearchGate_icon_SVG.svg.png" }, { href: "https://www.cchs.csic.es/es/personal/eduardo-manuel-aguilera-fernandez", title: "Web", icon: "web.png" }]},
  { name: "Ángel Sanjuán Ruiz", aff: "Universidad de Sevilla", photoSrc: "img/angel_sanjuan_gs.jpg", initials: "AS",
    links: [{ href: "https://scholar.google.com/citations?user=KdSHBF4AAAAJ", title: "Google Scholar", icon: "google-scholar-1.png" }, { href: "https://orcid.org/0000-0003-1031-1219", title: "ORCID", text: "iD" }, { href: "https://dialnet.unirioja.es/servlet/autor?codigo=5633763", title: "Dialnet", text: "D" }, { href: "https://www.us.es/trabaja-en-la-us/directorio/angel-sanjuan-ruiz", title: "Web", icon: "web.png" }]},
];
function teamCardsMarkup(items = TEAM){
  return items.map(member => {
    const photoSrc = member.photoSrc || (member.photo ? `${V1_IMG}/${member.photo}` : "");
    const photo = photoSrc
      ? `<img class="photo" src="${photoSrc}" alt="${member.name}" onerror="this.style.display='none'">`
      : `<div class="photo team-avatar" aria-hidden="true">${member.initials || member.name.split(/\s+/).map(p => p[0]).slice(0,2).join("")}</div>`;
    const role = member.role
      ? `<div class="role">${state.lang === "en" ? (member.role_en || member.role) : member.role}</div>`
      : `<div class="role role-placeholder" aria-hidden="true"></div>`;
    const links = member.links.map(link => `<a href="${link.href}" target="_blank" rel="noopener" title="${link.title}" aria-label="${link.title}">${link.icon ? `<img src="${V1_IMG}/${link.icon}" alt="">` : `<span>${link.text || link.title}</span>`}</a>`).join("");
    return `<div class="team-card team-card-round">${photo}<div class="body">${role}<div class="name">${member.name}</div><div class="aff">${member.aff}</div><div class="links">${links}</div></div></div>`;
  }).join("");
}
function renderEquipo(){
  els.workspace.innerHTML = `<div class="page equipo-page"><div class="page-head"><div class="eyebrow">${t("equipo")}</div><h1>${t("teamTitle")}</h1><p>${t("teamIntro")}</p></div>
    <div class="team-grid cahe-team-row">${teamCardsMarkup()}</div></div>`;
}

function applyAcercaIntro(){
  const title = els.workspace.querySelector(".acerca-page .page-head h1");
  const firstHead = els.workspace.querySelector(".acordion-item:first-child .acordion-head span:first-child");
  const firstBody = els.workspace.querySelector(".acordion-item:first-child .acordion-body .prose");
  if(!title || !firstHead || !firstBody) return;
  if(state.lang === "en"){
    title.textContent = "The CAHE";
    firstHead.textContent = "Overview";
    firstBody.innerHTML = `
      <p>The Historical Environmental Accounts of Spain (CAHE) is a site that compiles and analyses long-term statistical series on natural resource use, environmental impacts and economic development in Spain.</p>
      <p><span class="prose-label">Objective</span> The aim is to extend environmental accounts backwards in time. These accounts are now integrated into the main statistical agencies, but they usually cover only recent periods. CAHE offers a long-term perspective, connects them with socio-economic indicators and analyses them historically.</p>
      <p>The series serve a double purpose. First, they help bring the environmental dimension into the narrative of modern economic development. As Dipesh Chakrabarty has argued, understanding the intersection between human history and planetary history is now an unavoidable intellectual task. This also applies to economic history. Second, they provide historical series deep enough for a long-term view to better inform contemporary environmental policy.</p>
      <p><span class="prose-label">Scope</span> The original series, the result of more than a decade of work, cover indicators on energy consumption, material flows, land use, forest and crop area, greenhouse gas emissions and other dimensions. They run from the mid-nineteenth century to the present and are presented at different scales: national, regional and provincial.</p>
      <p><span class="prose-label">Methodology</span> In general, the estimates are based on historical sources and quantitative reconstruction methods. Original sources may contain undetected errors and, of course, estimated values carry uncertainty. However, following Paul Warde, in this kind of work absolute accuracy is not only impossible, but unnecessary: our goal is to obtain trajectories robust enough to document the main temporal and spatial changes.</p>
      <p>In any case, CAHE is committed to open science, transparency and replicability. The series are published openly and are accompanied by detailed methodological documents and, in most cases, replication packages.</p>
      <p><span class="prose-label">Status</span> We are currently working to expand the available series with new indicators and public-facing analyses. If you detect an error, have a suggestion or are interested in collaborating with us, please contact us.</p>`;
    return;
  }
  title.textContent = "La CAHE";
  firstHead.textContent = "Presentación";
  firstBody.innerHTML = `
    <p>La Contabilidad Ambiental Histórica de España (CAHE) es un sitio donde se recopilan y analizan series estadísticas de largo plazo sobre el uso de recursos naturales, los impactos ambientales y el desarrollo económico en España.</p>
    <p><span class="prose-label">Objetivo</span> El objetivo es extender en el tiempo las cuentas ambientales, integradas hoy en las principales agencias estadísticas pero limitadas a períodos recientes, para ofrecer una perspectiva de largo plazo, relacionarlas con indicadores socioeconómicos y analizarlas históricamente.</p>
    <p>Las series responden a un doble propósito. En primer lugar, contribuir a incorporar la variable ambiental en la narrativa del desarrollo económico moderno. Como argumenta Dipesh Chakrabarty, comprender la intersección entre historia humana e historia del planeta es hoy una tarea intelectual ineludible. También para la historia económica. En segundo lugar, ofrecer series históricas suficientemente profundas para que la mirada de largo plazo pueda informar mejor el diseño de la política ambiental contemporánea.</p>
    <p><span class="prose-label">Límites</span> Las series originales, resultado de más de una década de trabajo, cubren indicadores sobre consumo de energía, flujos de materiales, usos del suelo, superficie forestal y de cultivos, y emisiones de gases de efecto invernadero, entre otros. Abarcan desde mediados del siglo XIX hasta la actualidad y se presentan a distintas escalas: nacional, regional y provincial.</p>
    <p><span class="prose-label">Metodología</span> En general, las estimaciones se basan en fuentes históricas y métodos de reconstrucción cuantitativa. Las fuentes originales pueden contener errores no detectados y los métodos de estimación de valores, por supuesto, cuentan con incertidumbre. No obstante, siguiendo a Paul Warde, en este tipo de trabajos la exactitud absoluta no solo es imposible, sino que es innecesaria: nuestro objetivo es obtener trayectorias suficientemente robustas para documentar los principales cambios temporales y espaciales.</p>
    <p>En cualquier caso, en CAHE estamos comprometidos con la ciencia abierta, la transparencia y la replicabilidad. Las series están publicadas en abierto, se acompañan de documentos metodológicos detallados y, en la mayoría de los casos, de paquetes de replicación.</p>
    <p><span class="prose-label">Estado</span> Actualmente seguimos trabajando en ampliar las series disponibles con nuevos indicadores y análisis divulgativos. Si detectas algún error, tienes alguna sugerencia o interés en colaborar con nosotros, no dudes en contactar.</p>`;
}

function renderAcerca(){
  if(state.lang === "en"){
    els.workspace.innerHTML = `<div class="page acerca-page"><div class="page-head"><div class="eyebrow">${t("acerca")}</div><h1>${t("aboutTitle")}</h1></div>
      <div class="acordion" id="acordion">
        <div class="acordion-item"><button class="acordion-head open" data-toggle><span>CAHE</span><span class="ico"></span></button>
          <div class="acordion-body open"><div class="prose">
            <p>The Historical Environmental Accounts of Spain (CAHE) is a research project that reconstructs long-term statistical series on natural resource use, environmental impacts and economic development in Spain.</p>
            <p>The project extends modern environmental accounts backwards in time to provide a broad historical perspective on energy use, material flows, land use, forests, crops and greenhouse gas emissions from the nineteenth century to the present.</p>
            <p>The results are estimates based on historical sources and quantitative reconstruction methods. They are intended to document robust temporal and spatial trajectories rather than administrative annual figures with absolute precision.</p>
          </div></div></div>
        <div class="acordion-item"><button class="acordion-head" data-toggle><span>News</span><span class="ico"></span></button><div class="acordion-body">
          <div class="update-item update-latest"><span class="badge">Latest</span><span class="date">15/03/2026</span><h3>Historical emissions series</h3><p>Update of Spain's emissions series to 2023.</p></div>
          <div class="update-item"><span class="date">15/03/2026</span><h3>Website launch</h3></div>
        </div></div>
        <div class="acordion-item"><button class="acordion-head" data-toggle><span>Funding</span><span class="ico"></span></button><div class="acordion-body"><div class="prose">
          <p>This website has been developed within the DESIMPACTA project (PID2021-123220NB-I00), funded by the Spanish State Research Agency and FEDER. Principal investigators: Juan Infante-Amate and Iñaki Iriarte-Goñi.</p>
          <p>The historical series have also benefited from related research projects and collaborations, including HEDEC, Fundación Ramón Areces and the BBVA Foundation Leonardo grants.</p>
        </div></div></div>
      </div></div>`;
    applyAcercaIntro();
    bindAccordion();
    return;
  }
  els.workspace.innerHTML = `<div class="page acerca-page"><div class="page-head"><div class="eyebrow">${t("acerca")}</div><h1>${t("aboutTitle")}</h1></div>
    <div class="acordion" id="acordion">
      <div class="acordion-item"><button class="acordion-head open" data-toggle><span>La CAHE</span><span class="ico"></span></button>
        <div class="acordion-body open"><div class="prose">
          <p>La Contabilidad Ambiental Histórica de España (CAHE) es un proyecto de investigación que reconstruye series estadísticas de largo plazo sobre el uso de recursos naturales, los impactos ambientales y el desarrollo económico en España. El objetivo es extender en el tiempo las cuentas ambientales —integradas hoy en las principales agencias estadísticas pero limitadas a períodos recientes— para ofrecer una perspectiva histórica amplia.</p>
          <p>Las series responden a un doble propósito. En primer lugar, contribuir a incorporar la variable ambiental en la narrativa del desarrollo económico moderno: como ha argumentado Dipesh Chakrabarty, comprender la intersección entre historia humana e historia del planeta es hoy una tarea intelectual ineludible. En segundo lugar, ofrecer series históricas suficientemente profundas para que la mirada de largo plazo pueda informar mejor el diseño de la política ambiental contemporánea.</p>
          <p>Las series cubren indicadores sobre consumo de energía, flujos de materiales, usos del suelo, superficie forestal y de cultivos, y emisiones de gases de efecto invernadero, entre otros. Abarcan desde mediados del siglo XIX hasta la actualidad y se presentan a distintas escalas: nacional, regional y provincial.</p>
          <p>Los resultados aquí presentados son estimaciones basadas en fuentes históricas y métodos de reconstrucción cuantitativa. Las fuentes originales pueden contener errores no detectados y, en algunos casos, ciertos vacíos se han completado con métodos aproximados. No obstante, como ha señalado <a href="https://histecon.fas.harvard.edu/energyhistory/British_energy_multipliers_Warde_Nov_2016.pdf" target="_blank" rel="noopener">Paul Warde</a>, en este tipo de trabajos la exactitud absoluta no solo es inalcanzable sino innecesaria: el objetivo es obtener trayectorias suficientemente robustas para documentar los principales cambios temporales y espaciales del impacto ambiental. Si algún usuario detecta algún error, agradeceremos que nos lo comunique para poder corregirlo.</p>
          <p>Este proyecto es fruto de más de una década de investigación por un equipo interdisciplinar. En esta web compartimos los datos abiertos, herramientas de visualización interactiva y breves análisis divulgativos. Seguimos ampliando las series con nuevos indicadores, análisis específicos de <em>commodities</em>, desgloses sectoriales y nuevas visualizaciones.</p>
        </div></div></div>
      <div class="acordion-item"><button class="acordion-head" data-toggle><span>Novedades</span><span class="ico"></span></button><div class="acordion-body">
        <div class="update-item update-latest"><span class="badge">Última novedad</span><span class="date">15/03/2026</span><h3>Serie de emisiones históricas</h3><p>Actualización de la series de emisiones para España hasta el año 2023 (previamente hasta 2017).</p></div>
        <div class="update-item"><span class="date">15/03/2026</span><h3>Lanzamos la página web!</h3></div>
      </div></div>
      <div class="acordion-item"><button class="acordion-head" data-toggle><span>Financiación</span><span class="ico"></span></button><div class="acordion-body"><div class="prose">
        <p>Esta página web ha sido desarrollada en el marco del proyecto <strong>DESIMPACTA</strong> (PID2021-123220NB-I00), financiado por la Agencia Estatal de Investigación (AEI) y el Fondo Europeo de Desarrollo Regional (FEDER). IP: Juan Infante-Amate e Iñaki Iriarte Goñi.</p>
        <p>La elaboración de las series históricas se apoya en este proyecto, así como en la colaboración en otros proyectos:</p>
        <ul>
          <li><strong>HEDEC</strong> (2024–2027) — <em>Historical perspectives on economic development and environmental change, 19th–21st centuries</em>. Proyecto coordinado, Agencia Estatal de Investigación.
            <ul>
              <li>Subproyecto 1: <em>History, economy and the environment: Natural resources, institutions and technology</em>. IP: Iñaki Iriarte Goñi, Universidad de Zaragoza.</li>
              <li>Subproyecto 2: <em>Economic Development, International Trade, and the Environment on Both Sides of the Atlantic, 1800–2020</em> — ECOATLANTIC. IP: Juan Infante-Amate, Universidad de Granada.</li>
            </ul>
          </li>
          <li><strong>Fundación Ramón Areces</strong> (2020–2023) — <em>El impacto del crecimiento económico moderno en el cambio climático (España, 1860–2020)</em>. XIX Concurso Nacional de Investigación en Economía. IP: Juan Infante-Amate.</li>
          <li><strong>Becas Leonardo, Fundación BBVA</strong> (2019–2021) — <em>La huella material del desarrollo económico en España (1860–2015)</em>. IP: Juan Infante-Amate.</li>
        </ul>
        <div class="logo-strip" style="margin-top:14px"><img src="${V1_IMG}/MICIUFEDERAEI.jpg" alt="" onerror="this.style.display='none'"><img src="${V1_IMG}/logo-areces.jpg" alt="" onerror="this.style.display='none'"><img src="${V1_IMG}/logo-bbva.jpg" alt="" onerror="this.style.display='none'"></div>
        <p class="funding-disclaimer">Las entidades financiadoras no se hacen responsables de las opiniones expresadas en esta publicación, que son exclusivamente responsabilidad de los autores.</p>
      </div></div></div>
    </div></div>`;
  applyAcercaIntro();
  els.workspace.querySelectorAll("[data-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const head = btn, body = head.nextElementSibling, open = head.classList.contains("open");
    els.workspace.querySelectorAll(".acordion-head").forEach(h => h.classList.remove("open"));
    els.workspace.querySelectorAll(".acordion-body").forEach(b => b.classList.remove("open"));
    if(!open){ head.classList.add("open"); body.classList.add("open"); }
  }));
}

/* ====== Nav ====== */
function bindAccordion(){
  els.workspace.querySelectorAll("[data-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const head = btn, body = head.nextElementSibling, open = head.classList.contains("open");
    els.workspace.querySelectorAll(".acordion-head").forEach(h => h.classList.remove("open"));
    els.workspace.querySelectorAll(".acordion-body").forEach(b => b.classList.remove("open"));
    if(!open){ head.classList.add("open"); body.classList.add("open"); }
  }));
}
function openAcercaPanel(index){
  const heads = [...els.workspace.querySelectorAll(".acordion-head")];
  const bodies = [...els.workspace.querySelectorAll(".acordion-body")];
  if(!heads[index] || !bodies[index]) return;
  heads.forEach(h => h.classList.remove("open"));
  bodies.forEach(b => b.classList.remove("open"));
  heads[index].classList.add("open");
  bodies[index].classList.add("open");
}
function updateChrome(){
  document.documentElement.lang = state.lang;
  document.title = state.lang === "en" ? "CAHE — Historical Environmental Accounts of Spain" : "CAHE — Contabilidad Ambiental Histórica de España";
  const brandSub = document.querySelector(".brand-name .sub");
  if(brandSub) brandSub.textContent = t("brandSub");
  els.nav.querySelector('[data-section="visualizacion"]').textContent = t("visualizacion");
  els.nav.querySelector('[data-section="datos"]').textContent = t("datos");
  els.nav.querySelector('[data-section="metodos"]').textContent = t("metodos");
  els.nav.querySelector('[data-section="perspectivas"]').textContent = t("perspectivas");
  els.nav.querySelector('[data-section="publicaciones"]').textContent = t("publicaciones");
  els.nav.querySelector('[data-section="equipo"]').textContent = t("equipo");
  els.nav.querySelector('[data-section="acerca"]').textContent = t("acerca");
  const homeLabel = els.home?.querySelector("span:last-child");
  if(homeLabel) homeLabel.textContent = t("portada");
  if(els.lang){
    els.lang.textContent = state.lang === "es" ? "EN" : "ES";
    els.lang.setAttribute("aria-label", state.lang === "es" ? "Change language to English" : "Cambiar idioma a español");
  }
}
function setNavActive(section){ els.nav.querySelectorAll("[data-section]").forEach(b => b.classList.toggle("active", b.dataset.section === section)); }
function setHashWithoutRender(hash){
  const next = `${window.location.pathname}${window.location.search}#${hash}`;
  if(window.location.hash === `#${hash}`) return;
  window.history.pushState({ caheSection: hash }, "", next);
}
function navigateTopSection(section){
  stopPlayback();
  closeModal();
  setNavActive(section);
  state.section = section;
  state.subsection = "landing";
  if(section === "perspectivas") state.perspectiveEntry = null;
  setHashWithoutRender(section);
  renderMain();
}
function bindNav(){
  els.nav.addEventListener("pointerdown", event => {
    const btn = event.target.closest("[data-section]");
    if(!btn || !els.nav.contains(btn) || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    navigateTopSection(btn.dataset.section);
  }, { capture: true });
  els.nav.addEventListener("click", event => {
    if(event.detail !== 0) return;
    const btn = event.target.closest("[data-section]");
    if(!btn || !els.nav.contains(btn)) return;
    event.preventDefault();
    event.stopPropagation();
    navigateTopSection(btn.dataset.section);
  });
}
function bindLanguage(){ if(!els.lang) return; els.lang.addEventListener("click", () => { state.lang = state.lang === "es" ? "en" : "es"; localStorage.setItem("cahe_lang", state.lang); updateChrome(); renderMain(); }); }
function goHome(){
  if(window.parent !== window) window.parent.postMessage({ type: "cahe-back" }, "*");
  else window.location.href = "index.html";
}
function bindHome(){
  if(els.home) els.home.addEventListener("click", goHome);
  if(els.brand) els.brand.addEventListener("click", event => {
    if(window.parent === window) return;
    event.preventDefault();
    goHome();
  });
}
function bindModal(){ document.querySelectorAll("[data-modal-close]").forEach(el => el.addEventListener("click", closeModal)); window.addEventListener("keydown", e => { if(e.key === "Escape") closeModal(); }); }
/* Escape volvía a la portada solo si el foco seguía en la página padre; al abrir el
   visor el iframe se lleva el foco, así que la tecla no llegaba a ningún sitio.
   Aquí se atiende dentro del explorer y se reenvía como "cahe-back". */
function bindEscapeToHome(){
  window.addEventListener("keydown", event => {
    if(event.key !== "Escape") return;
    const active = document.activeElement;                            // no sacar al lector de un campo
    if(active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) return;
    if(document.querySelector(".modal.open")) return;                 // el modal se cierra solo
    if(document.querySelector("[data-mini-select].open,[data-comp-select].open")) return;
    if(document.querySelector(".viz-container.mobile-picker-open")) return;
    goHome();
  });
}
function bindFloatingSelectDismissal(){
  document.addEventListener("pointerdown", event => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    /* On a touch screen there is no mouseleave, so a tap on a chart left the tooltip
       pinned. Any pointer press outside an SVG dismisses it. */
    if(!target?.closest("svg")) hideTooltip();
    if(target?.closest("[data-mini-select],[data-comp-select]")) return;
    closeFloatingSelects(document);
  }, { capture: true });
  window.addEventListener("keydown", event => {
    if(event.key === "Escape") closeFloatingSelects(document);
  });
}

function applyHashRoute(){
  hideTooltip();
  const hash = resolveVizId(window.location.hash.replace("#",""));
  if(!hash){
    state.section = "visualizacion";
    state.subsection = "landing";
    return true;
  }
  if(hash === "visualizacion"){
    state.section = "visualizacion";
    state.subsection = "landing";
    state.perspectiveEntry = null;
    return true;
  }
  if(["perspectivas","publicaciones","datos","novedades","equipo","acerca"].includes(hash)){
    state.section = hash;
    state.subsection = "landing";
    if(hash === "perspectivas") state.perspectiveEntry = null;
    return true;
  }
  if(PERSPECTIVAS.some(p => p.id === hash)){
    state.section = "perspectivas";
    state.subsection = "landing";
    state.perspectiveEntry = hash;
    return true;
  }
  if(["global","macro","sectorial","commodities"].includes(hash)){
    state.section = "visualizacion";
    state.subsection = "viz";
    state.group = hash;
    state.vizId = defaultVizId(hash);
    return true;
  }
  for(const g of ["global","macro","sectorial","commodities"]){
    const items = g === "global" ? GLOBAL_ANALYSES : (CATALOG_OTHER[g] || []);
    const item = items.find(i => i.id === hash);
    if(item){ state.section = "visualizacion"; state.subsection = "viz"; state.group = g; state.vizId = item.id; return true; }
  }
  return false;
}

function init(){
  /* bindEscapeToHome va primero: los otros oyentes de Escape cierran modal y selects,
     así que si se registrase después ya no vería nada abierto y saldría a la portada. */
  bindViewportHeight(); bindNav(); bindLanguage(); bindHome(); bindEscapeToHome(); bindModal(); bindFloatingSelectDismissal(); updateChrome();
  applyHashRoute();
  window.addEventListener("hashchange", () => {
    if(applyHashRoute()){ setNavActive(state.section); renderMain(); }
  });
  window.addEventListener("popstate", () => {
    if(applyHashRoute()){ setNavActive(state.section); renderMain(); }
  });
  setNavActive(state.section);
  renderMain();
}
init();
