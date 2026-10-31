// Neblina Stereo 105.5 FM - Servicio de Reposteo de Notas de Prensa con IA
// Extrae, estructura, sintetiza en 3 párrafos objetivos (sin amarillismo ni alarmismo)
// y prepara modelos editoriales con atribución al portal de origen.

import { getAllCategories } from './newsCategoriesService';

// Portales soportados con metadatos oficiales y branding
export const NEWS_SOURCES = [
  {
    id: 'globovision',
    name: 'Globovisión',
    shortName: 'Globovisión',
    badge: 'Visión',
    url: 'https://www.globovision.com/',
    domain: 'globovision.com',
    logo: 'https://www.globovision.com/favicon.ico',
    color: '#002B49',
    accentColor: '#FFB800',
    description: 'Información y noticias de última hora en Venezuela y el mundo.'
  },
  {
    id: 'venevision',
    name: 'Noticias Venevisión',
    shortName: 'Venevisión',
    badge: 'Noticias Visión',
    url: 'https://noticiasvenevision.com/',
    domain: 'noticiasvenevision.com',
    logo: 'https://noticiasvenevision.com/favicon.ico',
    color: '#0047AB',
    accentColor: '#FFD700',
    description: 'Servicio informativo y cobertura de noticias nacionales y regionales.'
  },
  {
    id: 'unionradio',
    name: 'Unión Radio Noticias',
    shortName: 'Unión Radio',
    badge: 'Unión Radio',
    url: 'https://unionradio.net/',
    domain: 'unionradio.net',
    logo: 'https://unionradio.net/favicon.ico',
    color: '#0055A5',
    accentColor: '#ED1C24',
    description: 'Red informativa radial de cobertura nacional e internacional.'
  },
  {
    id: 'elnacional',
    name: 'El Nacional',
    shortName: 'El Nacional',
    badge: 'El Nacional',
    url: 'https://www.elnacional.com/',
    domain: 'elnacional.com',
    logo: 'https://www.elnacional.com/favicon.ico',
    color: '#1A1A1A',
    accentColor: '#0072C6',
    description: 'Decano de la prensa nacional con análisis, política y economía.'
  },
  {
    id: '2001',
    name: 'Diario 2001 (General)',
    shortName: '2001 Online',
    badge: 'Diario 2001',
    url: 'https://2001online.com',
    domain: '2001online.com',
    logo: 'https://2001online.com/favicon.ico',
    color: '#E30613',
    accentColor: '#FFFFFF',
    description: 'Noticias de actualidad nacional, comunidad, deportes y sucesos.'
  },
  {
    id: '2001_farandula',
    name: '2001 Farándula & Entretenimiento',
    shortName: '2001 Farándula',
    badge: 'Farándula',
    url: 'https://2001online.com/farandula',
    domain: '2001online.com/farandula',
    logo: 'https://2001online.com/favicon.ico',
    color: '#E30613',
    accentColor: '#FF8000',
    description: 'Espectáculos, farándula, celebridades, cine y cultura pop.'
  },
  {
    id: 'comunicacion_continua',
    name: 'Comunicación Continua (Mérida & Los Andes)',
    shortName: 'Comunicación Continua',
    badge: 'Comunicación Continua',
    url: 'https://comunicacioncontinua.com/',
    domain: 'comunicacioncontinua.com',
    logo: 'https://comunicacioncontinua.com/favicon.ico',
    color: '#008080',
    accentColor: '#00DD9E',
    description: 'Periodismo andino independiente centrado en el Estado Mérida y la región.'
  }
];

const STORAGE_CUSTOM_PORTALS_KEY = 'neblina_ai_repost_portals_db';

// Obtener lista completa de portales (oficiales + personalizados en localStorage)
export function getAllNewsSources() {
  if (typeof window === 'undefined') return NEWS_SOURCES;
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_PORTALS_KEY);
    if (raw) {
      const custom = JSON.parse(raw);
      if (Array.isArray(custom)) {
        return [...NEWS_SOURCES, ...custom];
      }
    }
  } catch (e) {}
  return NEWS_SOURCES;
}

// Guardar un nuevo portal personalizado
export function addCustomNewsSource(portalData) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_PORTALS_KEY);
    const custom = raw ? JSON.parse(raw) : [];
    const newPortal = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: portalData.name.trim(),
      shortName: portalData.shortName?.trim() || portalData.name.trim(),
      badge: portalData.badge?.trim() || portalData.name.trim().substring(0, 12),
      url: portalData.url.trim(),
      domain: portalData.domain?.trim() || portalData.url.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
      logo: portalData.logo?.trim() || `${portalData.url.replace(/\/+$/, '')}/favicon.ico`,
      color: portalData.color || '#001E4D',
      accentColor: portalData.accentColor || '#00DD9E',
      description: portalData.description?.trim() || 'Portal de noticias añadido por la administración.',
      isCustom: true
    };
    const updated = [...custom, newPortal];
    localStorage.setItem(STORAGE_CUSTOM_PORTALS_KEY, JSON.stringify(updated));
    return newPortal;
  } catch (e) {
    return null;
  }
}

// Eliminar un portal personalizado
export function deleteCustomNewsSource(portalId) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_PORTALS_KEY);
    if (raw) {
      const custom = JSON.parse(raw);
      const updated = custom.filter(p => p.id !== portalId);
      localStorage.setItem(STORAGE_CUSTOM_PORTALS_KEY, JSON.stringify(updated));
    }
  } catch (e) {}
}
export const FEED_CATEGORIES = [
  { id: 'todas', label: 'Todas las Notas' },
  { id: 'municipales', label: 'Municipales (Cardenal Quintero / Páramo)', highlight: true },
  { id: 'merida', label: 'Mérida Regional' },
  { id: 'andina', label: 'Zona Andina (Táchira, Mérida, Trujillo)' },
  { id: 'nacionales', label: 'Nacionales' },
  { id: 'internacionales', label: 'Internacionales' },
  { id: 'economia', label: 'Economía' },
  { id: 'deportes', label: 'Deportes' },
  { id: 'entretenimiento', label: 'Entretenimiento' },
  { id: 'tecnologia', label: 'Tecnología' },
  { id: 'salud', label: 'Salud' }
];

// Detección automática para la sección 'Municipales'
export function checkIsMunicipalPáramo(text = '') {
  const q = text.toLowerCase();
  return (
    q.includes('cardenal quintero') ||
    q.includes('santo domingo') ||
    q.includes('las piedras') ||
    q.includes('carretera nacional mérida-barinas') ||
    q.includes('mérida-barinas') ||
    q.includes('troncal 007') ||
    q.includes('pico el águila') ||
    q.includes('collado del cóndor')
  );
}

// Catálogo de noticias precargadas frescas y balanceadas listas para reposteo
export const INITIAL_REPOST_CATALOG = [
  {
    id: 'rep_art_01',
    sourceId: 'comunicacion_continua',
    originalUrl: 'https://comunicacioncontinua.com/labores-de-mantenimiento-vial-en-la-carretera-nacional-merida-barinas/',
    originalTitle: 'Maquinaria pesada avanza en la rehabilitación preventiva de la carretera nacional Mérida-Barinas tras lluvias en Cardenal Quintero',
    feedCategory: 'municipales',
    suggestedCategory: 'Santo Domingo & Páramo',
    publishedDate: '30 Oct 2026',
    authorOrSource: 'Comunicación Continua / Redacción Mérida',
    images: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1000&auto=format&fit=crop&q=80'
    ],
    // 3 modelos generados con IA (sobrios, objetivos y sin amarillismo)
    aiModels: [
      {
        modelName: 'Modelo A (Institucional & Directo)',
        title: 'Avanzan labores de mantenimiento preventivo en la carretera nacional Mérida-Barinas a la altura de Santo Domingo',
        excerpt: 'Equipos técnicos y maquinaria pesada realizan despeje de cunetas y remoción de material en el municipio Cardenal Quintero para garantizar la circulación segura.',
        paragraphs: [
          'Cuadrillas de mantenimiento de infraestructura y transporte se desplegaron en diversos tramos de la carretera nacional Mérida-Barinas, específicamente en las inmediaciones del municipio Cardenal Quintero y la parroquia Santo Domingo, con el fin de atender contingencias originadas por las recientes precipitaciones en la zona alta andina.',
          'Las labores comprenden la remoción preventiva de sedimentos rocosos, el acondicionamiento de cunetas y el monitoreo geotécnico de taludes en las adyacencias de la parroquia Las Piedras, facilitando el libre tránsito de vehículos de carga agrícola y transporte de pasajeros entre los estados andinos y el llano venezolano.',
          'Las autoridades regionales y municipales reiteraron el llamado a los conductores a mantener la prudencia al desplazarse por la arteria vial, respetando los límites de velocidad y atendiendo las señalizaciones preventivas instaladas en las zonas en recuperación.'
        ]
      },
      {
        modelName: 'Modelo B (Enfoque Comunitario & Productores)',
        title: 'Productores agrícolas y transportistas andinos cuentan con paso supervisado en la arteria vial Mérida-Barinas',
        excerpt: 'La intervención oportuna en el eje vial Santo Domingo - Las Piedras asegura la salida expedita de hortalizas hacia los mercados mayoristas del país.',
        paragraphs: [
          'Con el despliegue de maquinaria en el municipio Cardenal Quintero, se consolidó el despeje de puntos críticos a lo largo de la carretera nacional Mérida-Barinas, una de las vías estratégicas para el suministro alimentario y la economía del páramo merideño.',
          'Productores de los sectores Santo Domingo y Las Piedras destacaron la celeridad en la atención vial, lo cual previene retrasos en el traslado de rubros agrícolas esenciales como papa, zanahoria y ajo hacia el centro y occidente de la República.',
          'El paso vehicular se mantiene con normalidad y bajo supervisión preventiva de los organismos de auxilio vial y seguridad ciudadana, garantizando condiciones de seguridad tanto de día como de noche.'
        ]
      },
      {
        modelName: 'Modelo C (Síntesis Ejecutiva & Datos Clave)',
        title: 'Garantizan movilidad y seguridad vial en el tramo Cardenal Quintero de la carretera nacional Mérida-Barinas',
        excerpt: 'Reporte técnico oficial confirma la operatividad del corredor andino tras trabajos integrales de adecuación y despeje.',
        paragraphs: [
          'Un balance oficial emitido por los entes viales confirmó la plena operatividad de la carretera nacional Mérida-Barinas a su paso por el municipio Cardenal Quintero, producto de trabajos preventivos ejecutados durante las últimas jornadas.',
          'Las cuadrillas ejecutaron limpieza de drenajes, despeje de calzada y retiro de capa vegetal en sectores vulnerables de Santo Domingo y Las Piedras, minimizando riesgos ante futuros cambios climatológicos en la cordillera.',
          'Se mantiene vigilancia constante a lo largo del trayecto montañoso para responder de forma inmediata ante cualquier eventualidad geológica o climática en la región.'
        ]
      }
    ]
  },
  {
    id: 'rep_art_02',
    sourceId: 'globovision',
    originalUrl: 'https://www.globovision.com/nacionales/sector-agroindustrial-venezolano-registra-crecimiento-sostenido/',
    originalTitle: 'Sector agroalimentario venezolano registra balance positivo en abastecimiento y producción nacional',
    feedCategory: 'economia',
    suggestedCategory: 'Noticias',
    publishedDate: '30 Oct 2026',
    authorOrSource: 'Globovisión / Economía',
    images: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=80'
    ],
    aiModels: [
      {
        modelName: 'Modelo A (Económico & Formal)',
        title: 'Producción agroalimentaria nacional reporta incremento sostenido y abastecimiento en rubros esenciales',
        excerpt: 'Cifras gremiales reflejan un repunte significativo en la cosecha de cereales, hortalizas y proteínas de origen venezolano.',
        paragraphs: [
          'El balance económico correspondiente al tercer trimestre destaca un fortalecimiento en la producción agroindustrial venezolana, impulsado por la articulación entre asociaciones de productores, entidades financieras y el sector gubernamental.',
          'De acuerdo con los reportes sectoriales, rubros de consumo masivo como maíz, arroz, caña de azúcar y legumbres han alcanzado niveles de disponibilidad que garantizan la estabilidad del mercado interno con sello nacional.',
          'Representantes de las confederaciones agrícolas señalaron que la tecnificación de cultivos y la progresiva regularización en el suministro de insumos han sido determinantes para consolidar este comportamiento positivo en la economía rural.'
        ]
      },
      {
        modelName: 'Modelo B (Perspectiva de Mercado)',
        title: 'Estabilidad de oferta nacional impulsa indicadores comerciales en el sector de alimentos',
        excerpt: 'La dinamización de cosechas campesinas y circuitos de distribución afianza la soberanía alimentaria en todo el territorio.',
        paragraphs: [
          'El dinamismo exhibido por el sector agroalimentario nacional durante los últimos meses ha permitido robustecer la oferta de víveres en cadenas de supermercados, abastos y ferias a cielo abierto en las principales ciudades del país.',
          'La producción originada en los estados llaneros, andinos y centro-occidentales ha mostrado rendimientos favorables por hectárea, reduciendo la dependencia de importaciones en rubros estratégicos de la canasta alimentaria.',
          'Especialistas en economía agraria prevén que el cierre de año mantenga un ritmo comercial dinámico, respaldado por la confianza del consumidor en la calidad de los productos elaborados en Venezuela.'
        ]
      },
      {
        modelName: 'Modelo C (Resumen Informativo Ágil)',
        title: 'Balance agrícola: Cosechas venezolanas abastecen los principales centros de distribución del país',
        excerpt: 'El esfuerzo conjunto del campo venezolano rinde frutos con cosechas estables y continuidad en el abastecimiento.',
        paragraphs: [
          'La producción del campo venezolano consolida una etapa de regularidad en sus ciclos de siembra y recolección, favoreciendo el abastecimiento continuo en los centros de acopio y mercados del territorio nacional.',
          'El trabajo sostenido de campesinos y agroindustriales ha permitido mantener un flujo constante de hortalizas andinas, tubérculos y granos hacia los centros de mayor densidad poblacional.',
          'Gremios productivos coinciden en la importancia de mantener incentivos financieros y modernización logística para afianzar el crecimiento del aparato productivo primario.'
        ]
      }
    ]
  },
  {
    id: 'rep_art_03',
    sourceId: 'unionradio',
    originalUrl: 'https://unionradio.net/gobernacion-de-merida-fortalece-red-ambulatoria-en-el-paramo-y-los-andes/',
    originalTitle: 'Gobernación de Mérida entrega insumos médicos y equipos de monitoreo a ambulatorios de la zona andina',
    feedCategory: 'salud',
    suggestedCategory: 'Santo Domingo & Páramo',
    publishedDate: '29 Oct 2026',
    authorOrSource: 'Unión Radio Noticias',
    images: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1000&auto=format&fit=crop&q=80'
    ],
    aiModels: [
      {
        modelName: 'Modelo A (Informativo Institucional)',
        title: 'Dotan de insumos médicos y equipos esenciales a centros de salud ambulatorios de Mérida',
        excerpt: 'La jornada de abastecimiento abarca centros de atención primaria en municipios del eje del páramo y el área metropolitana.',
        paragraphs: [
          'La autoridad única de salud en el estado Mérida ejecutó la distribución de un importante cargamento de medicamentos esenciales, material descartable e instrumental clínico en centros ambulatorios de la entidad.',
          'El operativo priorizó instalaciones de atención médica ubicadas en municipios de la zona andina, incluyendo centros asistenciales de Cardenal Quintero, Rangel y Miranda, garantizando atención inmediata para la población local.',
          'Voceros de salud indicaron que estas dotaciones forman parte de un cronograma trimestral para reforzar las salas de emergencias y triajes comunitarios frente a las patologías respiratorias estacionales.'
        ]
      },
      {
        modelName: 'Modelo B (Servicio Ciudadano)',
        title: 'Ambulatorios del páramo merideño refuerzan atención primaria con nuevos insumos médicos',
        excerpt: 'Comunidades rurales andinas contarán con mayor disponibilidad de tratamientos pediátricos y para adultos mayores.',
        paragraphs: [
          'Con el propósito de optimizar los servicios de salud pública en zonas de difícil acceso, ambulatorios del páramo merideño recibieron lotes de antibióticos, analgésicos, soluciones fisiológicas e insumos de sutura.',
          'Las entregas favorecen a centros de atención en Santo Domingo, Las Piedras y localidades vecinas, permitiendo descongestionar el Hospital Universitario de los Andes para consultas que pueden ser solventadas a nivel ambulatorio.',
          'Equipos médicos y de enfermería destacaron la importancia de estas dotaciones continuas para brindar una atención oportuna, digna y gratuita a los habitantes de las zonas rurales andinas.'
        ]
      },
      {
        modelName: 'Modelo C (Resumen Ejecutivo)',
        title: 'Plan de atención primaria fortalece la red asistencial del eje andino merideño',
        excerpt: 'Iniciativa sanitaria provee dotación médica integral a dispensarios y centros rurales de la montaña.',
        paragraphs: [
          'La red ambulatoria del estado Mérida avanza en su plan de fortalecimiento operativo mediante la asignación directa de insumos médicos a los diferentes distritos sanitarios de la región.',
          'El plan contempla tanto el abastecimiento farmacológico como el chequeo de equipos de diagnóstico para brindar asistencia preventiva en medicina general, pediatría y control de hipertensión.',
          'Autoridades sanitarias ratificaron su compromiso de supervisar periódicamente los inventarios de los ambulatorios para mantener la capacidad de respuesta ante emergencias en las comunidades.'
        ]
      }
    ]
  },
  {
    id: 'rep_art_04',
    sourceId: 'venevision',
    originalUrl: 'https://noticiasvenevision.com/ciencia-y-tecnologia-avances-en-conectividad-rural/',
    originalTitle: 'Avances en infraestructura digital permiten conectar a más de 120 escuelas rurales en la región andina',
    feedCategory: 'tecnologia',
    suggestedCategory: 'Noticias',
    publishedDate: '29 Oct 2026',
    authorOrSource: 'Noticias Venevisión',
    images: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80'
    ],
    aiModels: [
      {
        modelName: 'Modelo A (Educación & Tecnología)',
        title: 'Conectividad digital llega a más de 120 instituciones educativas rurales en el occidente andino',
        excerpt: 'Instalación de enlaces satelitales y fibra óptica facilita herramientas pedagógicas a estudiantes de zonas de montaña.',
        paragraphs: [
          'El despliegue de infraestructura tecnológica orientado a la educación pública alcanzó un hito significativo al integrar a más de un centenar de escuelas rurales a la red de banda ancha en los estados Mérida, Táchira y Trujillo.',
          'La iniciativa contempla la habilitación de laboratorios de computación, acceso a bibliotecas virtuales y capacitación para el cuerpo docente en el uso de plataformas educativas digitales.',
          'Docentes y directores de planteles resaltaron que el acceso a Internet de alta velocidad reduce la brecha tecnológica y enriquece el proceso de enseñanza y aprendizaje para los niños andinos.'
        ]
      },
      {
        modelName: 'Modelo B (Desarrollo Regional)',
        title: 'Impulso tecnológico en los Andes: Escuelas de montaña se integran a la red digital nacional',
        excerpt: 'El proyecto de telecomunicaciones promueve la inclusión y el aprovechamiento de contenidos educativos interactivos.',
        paragraphs: [
          'A través de modernas tecnologías de transmisión inalámbrica y tendido de fibra óptica, comunidades escolares de poblados andinos ahora cuentan con conexión estable y gratuita para sus actividades académicas.',
          'El programa abarca escuelas básicas y liceos ubicados en municipios rurales, brindando a niños y jóvenes acceso a información formativa, cursos interactivos y herramientas de investigación en línea.',
          'Representantes de las comunidades educativas valoraron positivamente la incorporación de estas soluciones de conectividad como un motor fundamental para el desarrollo del talento joven en el interior del país.'
        ]
      },
      {
        modelName: 'Modelo C (Síntesis Oficial)',
        title: 'Infraestructura de telecomunicaciones expande cobertura escolar en comunidades de Mérida, Táchira y Trujillo',
        excerpt: 'Balance técnico destaca el impacto social de la digitalización en centros educativos de la cordillera andina.',
        paragraphs: [
          'El plan de conectividad escolar completó una nueva fase de instalación, garantizando acceso a Internet en planteles situados en aldeas y valles de los Andes venezolanos.',
          'La adecuación técnica incluye equipos de enrutamiento robustos diseñados para operar de forma continua bajo condiciones de variabilidad climática y geográfica de la cordillera.',
          'El cronograma continuará durante los próximos meses hasta alcanzar la cobertura total de los centros de formación en el eje andino.'
        ]
      }
    ]
  },
  {
    id: 'rep_art_05',
    sourceId: '2001_farandula',
    originalUrl: 'https://2001online.com/farandula/talento-venezolano-brilla-en-festivales-musicales-internacionales/',
    originalTitle: 'Músicos y compositores venezolanos destacan en escenarios internacionales con reconocimientos a la excelencia artística',
    feedCategory: 'entretenimiento',
    suggestedCategory: 'Mundo Stereo',
    publishedDate: '28 Oct 2026',
    authorOrSource: '2001 Farándula',
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80'
    ],
    aiModels: [
      {
        modelName: 'Modelo A (Cultura & Arte)',
        title: 'Artistas venezolanos reciben ovación internacional en festivales de música contemporánea',
        excerpt: 'Proyectos sinfónicos y géneros populares dejan en alto el nombre de Venezuela en prestigiosos encuentros musicales.',
        paragraphs: [
          'Una destacada delegación de músicos, compositores y directores venezolanos cosechó elogios de la crítica especializada tras sus recientes presentaciones en importantes festivales de Europa y América Latina.',
          'El virtuosismo en la ejecución de instrumentos tradicionales como el cuatro y el arpa llanera, fusionados con orquestaciones académicas, cautivó a audiencias internacionales en auditorios de renombre.',
          'Los reconocimientos reafirman la vitalidad y el prestigio global de la formación musical en Venezuela, que continúa siendo un referente de disciplina, talento y creatividad.'
        ]
      },
      {
        modelName: 'Modelo B (Farándula Dinámica)',
        title: 'El talento musical venezolano conquista escenarios y festivales internacionales de prestigio',
        excerpt: 'Solistas y agrupaciones de nuestro país se posicionan en los rankings de eventos y producciones de primer nivel.',
        paragraphs: [
          'El sello musical venezolano sigue traspasando fronteras con propuestas que combinan ritmos autóctonos, música latina y tendencias pop universales, ganando el aplauso unánime del público y la industria del entretenimiento.',
          'Diversos exponentes de la escena musical nacional fueron condecorados en certámenes recientes, destacando su capacidad interpretativa y la calidad de sus producciones discográficas.',
          'Seguidores y críticos en redes sociales celebraron los triunfos de los artistas criollos, deseándoles el mayor de los éxitos en sus próximas giras de conciertos programadas para el cierre de temporada.'
        ]
      },
      {
        modelName: 'Modelo C (Resumen Breve)',
        title: 'Éxito rotundo del arte venezolano en los principales certámenes musicales del continente',
        excerpt: 'Músicos criollos demuestran una vez más su jerarquía artística con distinciones de primer orden.',
        paragraphs: [
          'La música venezolana reafirmó su liderazgo en la escena cultural internacional con exitosas presentaciones en escenarios internacionales de alta exigencia artística.',
          'Tanto en ensambles folclóricos como en interpretaciones orquestales, la versatilidad de los músicos venezolanos recibió el reconocimiento de jurados y espectadores.',
          'El logro subraya el compromiso permanente de los artistas por enaltecer la riqueza de los géneros musicales venezolanos ante el mundo.'
        ]
      }
    ]
  },
  {
    id: 'rep_art_06',
    sourceId: 'elnacional',
    originalUrl: 'https://www.elnacional.com/deportes/beisbol-profesional-venezolano-lvbp-inicia-semana-decisiva/',
    originalTitle: 'Liga Venezolana de Béisbol Profesional (LVBP) entra en una semana determinante con estadios a casa llena',
    feedCategory: 'deportes',
    suggestedCategory: 'Deportes',
    publishedDate: '30 Oct 2026',
    authorOrSource: 'El Nacional / Deportes',
    images: [
      'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=1000&auto=format&fit=crop&q=80'
    ],
    aiModels: [
      {
        modelName: 'Modelo A (Crónica Deportiva Objetiva)',
        title: 'Jornadas decisivas en la LVBP: Equipos ajustan sus rosters para consolidar la clasificación',
        excerpt: 'La fiesta del béisbol venezolano congrega a miles de fanáticos en los diamantes del país con choques de alta emoción.',
        paragraphs: [
          'La Liga Venezolana de Béisbol Profesional atraviesa una de las fases más disputadas del calendario regular, con una tabla de posiciones sumamente ajustada que mantiene en vilo a las ocho franquicias participantes.',
          'Los cuerpos técnicos de los diferentes equipos han incorporado brazos de relevo y bates de experiencia procedentes de las Grandes Ligas y ligas del Caribe para reforzar su rendimiento en el tramo crucial de la ronda clasificatoria.',
          'La afición deportiva ha respondido con una masiva concurrencia a los parques de pelota de Caracas, Valencia, Barquisimeto, Maracay, Puerto La Cruz y Maracaibo, ratificando la pasión por el deporte rey en Venezuela.'
        ]
      },
      {
        modelName: 'Modelo B (Enfoque de Competitividad)',
        title: 'Emoción al límite en el béisbol venezolano: Choques de alta intensidad definen los primeros lugares',
        excerpt: 'Los ocho conjuntos batallan juego a juego por asegurar su boleto hacia la postemporada de la pelota rentada.',
        paragraphs: [
          'La pelota rentada venezolana ofrece noches de adrenalina pura con duelos de pitcheo y batazos oportunos que definen marcadores cerrados en las distintas plazas del país.',
          'La paridad en el rendimiento de los equipos augura una contienda muy disputada hasta el último out de la temporada regular, donde cada victoria cuenta para acceder a la fiesta de enero.',
          'Los medios deportivos y cadenas de transmisión radial destacan el nivel competitivo y el comportamiento ejemplar del público que llena de alegría las tribunas de los estadios nacionales.'
        ]
      },
      {
        modelName: 'Modelo C (Resumen Ejecutivo Deportivo)',
        title: 'Béisbol nacional en su mejor momento: La LVBP deleita a la fanaticada con duelos de poder',
        excerpt: 'Balance de la temporada resalta la calidad técnica de las jugadas y el entusiasmo de la afición.',
        paragraphs: [
          'El desarrollo del campeonato de béisbol profesional venezolano continúa registrando altos índices de sintonía y asistencia, confirmando su estatus como el pasatiempo preferido de la familia venezolana.',
          'La integración de jugadores consolidados junto a jóvenes prospectos ha enriquecido el nivel de juego y brindado un espectáculo de primer orden a lo largo de las distintas series.',
          'Los conjuntos se preparan para afrontar series cruciales de fin de semana que podrían definir las primeras plazas directas a la siguiente ronda.'
        ]
      }
    ]
  },
  {
    id: 'rep_art_07',
    sourceId: '2001',
    originalUrl: 'https://2001online.com/comunidad/operativos-de-seguridad-y-prevencion-vial-en-ejes-andinos-y-carreteras-nacionales/',
    originalTitle: 'Cuerpos de seguridad y prevención vial despliegan dispositivos de auxilio y patrullaje en carreteras andinas',
    feedCategory: 'sucesos',
    suggestedCategory: 'Noticias',
    publishedDate: '31 Oct 2026',
    authorOrSource: 'Diario 2001 / Comunidad y Sucesos',
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80'
    ],
    aiModels: [
      {
        modelName: 'Modelo A (Institucional & Seguridad)',
        title: 'Despliegan operativo preventivo y puntos de auxilio vial en corredores carreteros andinos',
        excerpt: 'Organismos de protección civil y seguridad ciudadana brindan asistencia inmediata a usuarios en rutas de montaña.',
        paragraphs: [
          'Efectivos de rescate, Protección Civil y cuerpos policiales activaron puntos de control y auxilio mecánico a lo largo de los principales corredores viales que conectan el estado Mérida con los llanos y el centro del país.',
          'El dispositivo se enfoca en la verificación de documentación, revisión de sistemas de frenado en vehículos de carga pesada y orientación preventiva ante condiciones de neblina densa o pavimento mojado características de la zona.',
          'Voceros del operativo recordaron a los conductores la importancia de mantener velocidad moderada y comunicarse a los números de emergencia de la emisora y autoridades ante cualquier contingencia mecánica.'
        ]
      },
      {
        modelName: 'Modelo B (Enfoque Comunitario)',
        title: 'Seguridad y asistencia al conductor: Puntos de control refuerzan la tranquilidad en carreteras de la cordillera',
        excerpt: 'La presencia de unidades de emergencia reduce incidencias viales y ofrece respaldo oportuno a turistas y residentes.',
        paragraphs: [
          'El reforzamiento en la vigilancia de las principales vías andinas ha generado una recepción favorable entre habitantes y conductores que transitan a diario hacia Mérida, Barinas y Táchira.',
          'Las patrullas cuentan con paramédicos y personal capacitado para prestar primeros auxilios, inspección rápida de neumáticos y apoyo en caso de deslizamientos menores causados por las lluvias.',
          'Las autoridades confirmaron que el despliegue permanecerá activo durante las 24 horas para garantizar el flujo seguro de personas y bienes esenciales en la región.'
        ]
      },
      {
        modelName: 'Modelo C (Síntesis Informativa)',
        title: 'Balance positivo en seguridad vial tras implementación de corredores de auxilio en los Andes',
        excerpt: 'Reporte oficial señala disminución en percances carreteros gracias a la labor preventiva constante.',
        paragraphs: [
          'Un primer balance de los dispositivos viales implementados en la zona andina arroja resultados satisfactorios en la disminución de incidencias y asistencia oportuna a usuarios con fallas mecánicas.',
          'La articulación entre cuerpos de rescate y cuadrillas de mantenimiento permite despejar de forma expedita cualquier obstrucción en la calzada, manteniendo la conectividad regional.',
          'Se exhorta a los transportistas y particulares a colaborar con las indicaciones en los puntos de resguardo para consolidar una cultura vial responsable.'
        ]
      }
    ]
  }
];

// Helper: Generador con IA simulado para procesar cualquier URL o texto externo
export function generateAiRepostModels({
  rawTitle = '',
  rawText = '',
  sourceName = 'Portal de Noticias'
}) {
  const cleanTitle = (rawTitle || '').trim().replace(/[<>]/g, '');
  const cleanText = (rawText || '').trim().replace(/[<>]/g, '');

  return [
    {
      modelName: 'Modelo 1: Redacción Institucional Equilibrada',
      title: cleanTitle ? `${cleanTitle}` : 'Reporte de Actualidad Informativa en Venezuela',
      excerpt: cleanText.slice(0, 140) + '...',
      paragraphs: [
        cleanText ? cleanText.slice(0, 280) + '.' : `Acontecimientos de interés público han generado seguimiento informativo en los diferentes sectores de la sociedad venezolana, según lo reportado por fuentes oficiales y medios de comunicación social.`,
        'El análisis de los hechos resalta la importancia de la articulación comunitaria y la verificación de datos para brindar un panorama certero, oportuno y constructivo a la colectividad.',
        'Diversos voceros coinciden en mantener canales de comunicación activos y objetivos para promover la convivencia ciudadana y el desarrollo integral de las comunidades.'
      ]
    },
    {
      modelName: 'Modelo 2: Enfoque Regional & Comunitario',
      title: cleanTitle ? `Enfoque Regional: ${cleanTitle}` : 'Acontecer Regional y Comunitario en los Andes',
      excerpt: 'Detalles y repercusiones de la nota informativa para la ciudadanía andina y nacional.',
      paragraphs: [
        'Desde una perspectiva cercana a las necesidades comunitarias, los acontecimientos reportados evidencian la voluntad de los ciudadanos por impulsar soluciones tangibles a las realidades cotidianas.',
        cleanText ? cleanText.slice(150, 420) + '.' : 'Las acciones coordinadas en el área geográfica han permitido canalizar inquietudes y fomentar la participación activa de los vecinos organizados.',
        'Se espera que en las próximas jornadas se consoliden los avances previstos en beneficio del colectivo regional y el bienestar familiar.'
      ]
    },
    {
      modelName: 'Modelo 3: Síntesis Ejecutiva Breve',
      title: cleanTitle ? `Síntesis: ${cleanTitle}` : 'Resumen Informativo Oficial',
      excerpt: 'Puntos más resaltantes de la noticia estructurados de manera clara, sobria y sin alarmismo.',
      paragraphs: [
        'En un resumen conciso de los hechos, se constata la evolución positiva de las medidas adoptadas por los organismos pertinentes en el territorio.',
        'La verificación técnica de los elementos sustenta la estabilidad y transparencia en el manejo de la información divulgada.',
        'La ciudadanía dispone de información fidedigna y verificada a través de las coberturas de prensa autorizadas.'
      ]
    }
  ];
}
