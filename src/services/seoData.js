/**
 * Configuración Central y Modular de SEO, Geo-targeting e Inteligencia Artificial (AIO / GEO)
 * para Neblina Stereo 105.5 FM.
 * 
 * Esta estructura está diseñada para que cualquier nueva información (municipios cubiertos,
 * historia, directiva, sedes, etc.) se actualice en un único punto y se propague
 * automáticamente al marcado Schema.org (JSON-LD), OpenGraph, Twitter Cards y
 * motores de búsqueda impulsados por IA (ChatGPT, Gemini, Perplexity, Copilot, etc.).
 */

export const STATION_SEO_CONFIG = {
  // Identidad Oficial de la Emisora
  identity: {
    name: 'Neblina Stereo 105.5 FM',
    shortName: 'Neblina 105.5',
    legalName: 'Neblina Stereo 105.5 FM',
    alternateNames: [
      'Neblina 105.5 FM',
      'Neblina Stereo',
      'Radio Neblina',
      'Neblina Santo Domingo',
      'Neblina Mérida',
      '105.5 FM Santo Domingo',
      'Neblina FM En Vivo'
    ],
    slogan: 'Contigo en la Cima',
    frequency: '105.5 MHz FM',
    band: 'FM',
    callSign: 'Neblina Stereo 105.5 FM',
    establishedYear: 2005,
    domain: 'https://neblina105fm.com',
    canonicalUrl: 'https://neblina105fm.com/',
    streamingUrl: 'https://radios.mipanel.stream:7018/stream',
    backupStreamingUrl: 'https://stream.zeno.fm/bnnrq1fks68uv',
    logoUrl: 'https://neblina105fm.com/icon-512.png',
    faviconUrl: 'https://neblina105fm.com/favicon.svg',
    appleTouchIconUrl: 'https://neblina105fm.com/apple-touch-icon.png'
  },

  // Descripción Oficial Optimizada para Motores de Búsqueda y Modelos de Lenguaje (LLMs)
  description: {
    short: 'Neblina Stereo 105.5 FM - Transmisión en vivo HD, noticias, programación y podcasts. Santo Domingo - Mérida, Venezuela.',
    standard: 'Neblina Stereo 105.5 FM es la emisora radial matriz y plataforma informativa líder en Santo Domingo y los Andes venezolanos. Transmisión digital HD continua 24/7, noticias de última hora, programación musical, ranking y participación comunitaria.',
    extended: 'Neblina Stereo 105.5 FM transmite desde Santo Domingo, Estado Mérida, Venezuela, para toda la región andina y el mundo vía streaming digital HD. Ofrece una parrilla radial variada con programas estelares como "El Monstruo de la Mañana", "Noticiero 102", "Buena Salsa", información ciudadana, pronóstico del tiempo y el Ranking oficial de lo más sonado.'
  },

  // Ubicación Geográfica Oficial y Geotargeting (SEO Local y Regional)
  location: {
    country: 'Venezuela',
    countryCode: 'VE',
    state: 'Mérida',
    stateCode: 'VE-L',
    municipality: 'Cardenal Quintero',
    city: 'Santo Domingo',
    address: 'Santo Domingo, Municipio Cardenal Quintero, Estado Mérida, Venezuela',
    postalCode: '5131',
    coordinates: {
      latitude: 8.8647,
      longitude: -70.7719
    },
    geoPositionTag: '8.8647;-70.7719',
    icbmTag: '8.8647, -70.7719'
  },

  // Cobertura Territorial y Municipios Servidos (Modular y expandible)
  coverageAreas: [
    { name: 'Santo Domingo', type: 'Sede Principal y Estudio de Transmisión', state: 'Mérida' },
    { name: 'Municipio Cardenal Quintero', type: 'Cobertura FM Plena', state: 'Mérida' },
    { name: 'Municipio Pueblo Llano', type: 'Cobertura FM Plena', state: 'Mérida' },
    { name: 'Municipio Rangel (Mucuchíes, San Rafael, Cacute)', type: 'Cobertura FM Regional', state: 'Mérida' },
    { name: 'Municipio Miranda (Timotes, Chachopo)', type: 'Cobertura FM Regional', state: 'Mérida' },
    { name: 'Municipio Libertador (Mérida Capital)', type: 'Cobertura FM y Digital HD', state: 'Mérida' },
    { name: 'Corredor Carretera Trasandina y Páramo Merideño', type: 'Cobertura FM Vial', state: 'Mérida' },
    { name: 'Zona Alta y Piedemonte Andino de Barinas (Altamira, Calderas)', type: 'Cobertura FM Interurbana', state: 'Barinas' },
    { name: 'Audiencia Global en Streaming HD', type: 'Transmisión Digital por Web y PWA', state: 'Internacional' }
  ],

  // Canales y Redes Sociales Oficiales (Señales de Autoridad y SameAs)
  socialProfiles: {
    whatsapp: 'https://wa.me/584247459774',
    whatsappDisplay: '+58 424 745 9774',
    whatsappChannel: 'https://whatsapp.com/channel/0029VaCcXLD8Pgs7z9ZASY31',
    instagram: 'https://www.instagram.com/neblina105fm',
    facebook: 'https://www.facebook.com/share/1CSnfJd56w/',
    youtube: 'https://www.youtube.com/@neblina105fm',
    youtubeShorts: 'https://www.youtube.com/@neblina105fm/shorts'
  },

  // Palabras Clave Estratégicas para SEO y Búsqueda por IA
  keywords: [
    'Neblina Stereo',
    'Neblina 105.5 FM',
    'Radio Santo Domingo Mérida',
    'Emisora en vivo Santo Domingo',
    'Radio en vivo Mérida Venezuela',
    'Noticias Santo Domingo Mérida',
    'Streaming radio andes venezolanos',
    'Escuchar radio online Venezuela',
    'Radio FM Mérida',
    'Ranking Neblina Stereo',
    'Pueblo Llano radio',
    'Cardenal Quintero Mérida radio',
    'Transmisión HD Neblina 105.5',
    'Contigo en la Cima radio'
  ],

  // Preguntas Frecuentes Estructuradas (FAQ Schema para fragmentos enriquecidos en Google y Perplexity)
  faqs: [
    {
      question: '¿Cuál es el dial oficial de Neblina Stereo en señal abierta?',
      answer: 'Neblina Stereo transmite en la frecuencia modulada 105.5 MHz (FM) con cobertura en Santo Domingo, el Páramo andino y municipios del estado Mérida y Barinas.'
    },
    {
      question: '¿Dónde están ubicados los estudios de Neblina Stereo 105.5 FM?',
      answer: 'La sede y estudios principales de Neblina Stereo se encuentran en Santo Domingo, Municipio Cardenal Quintero del Estado Mérida, Venezuela.'
    },
    {
      question: '¿Cómo escuchar la transmisión digital de Neblina 105.5 FM por internet?',
      answer: 'Puedes sintonizar en vivo las 24 horas del día con audio en alta definición (HD) a través de nuestra Web App oficial en neblina105fm.com o instalando la aplicación en tu dispositivo móvil o computadora.'
    },
    {
      question: '¿Cómo solicitar una canción o enviar un saludo a cabina en Neblina 105.5 FM?',
      answer: 'Puedes comunicarte directamente con la cabina de locución y enviar tus complacencias musicales a través de nuestra línea oficial de WhatsApp al número +58 424 745 9774.'
    }
  ]
};

/**
 * Generador Dinámico de Schema.org JSON-LD para Motores de Búsqueda y Agentes de IA
 * Combina entidades: RadioStation, BroadcastService, NewsMediaOrganization, WebSite y FAQPage
 */
export function generateSchemaGraph() {
  const cfg = STATION_SEO_CONFIG;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Entidad Principal de Radio y Medios Informativos
      {
        '@type': ['RadioStation', 'BroadcastService', 'NewsMediaOrganization'],
        '@id': `${cfg.identity.canonicalUrl}#station`,
        'name': cfg.identity.name,
        'alternateName': cfg.identity.alternateNames,
        'legalName': cfg.identity.legalName,
        'slogan': cfg.identity.slogan,
        'description': cfg.description.extended,
        'url': cfg.identity.canonicalUrl,
        'logo': {
          '@type': 'ImageObject',
          'url': cfg.identity.logoUrl,
          'width': 512,
          'height': 512,
          'caption': 'Logotipo e Isotipo Oficial de Neblina Stereo 105.5 FM'
        },
        'image': cfg.identity.logoUrl,
        'broadcastFrequency': cfg.identity.frequency,
        'callSign': cfg.identity.callSign,
        'broadcastServiceTier': 'Free Public Radio & Digital Stream',
        'broadcastTimezone': 'America/Caracas',
        'inLanguage': 'es-VE',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': cfg.location.city,
          'addressRegion': cfg.location.state,
          'addressCountry': cfg.location.countryCode,
          'postalCode': cfg.location.postalCode,
          'streetAddress': cfg.location.address
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': cfg.location.coordinates.latitude,
          'longitude': cfg.location.coordinates.longitude
        },
        'areaServed': cfg.coverageAreas.map(area => ({
          '@type': 'AdministrativeArea',
          'name': area.name,
          'description': `${area.type} - Estado ${area.state}`
        })),
        'telephone': cfg.socialProfiles.whatsappDisplay,
        'sameAs': [
          cfg.socialProfiles.instagram,
          cfg.socialProfiles.facebook,
          cfg.socialProfiles.youtube,
          cfg.socialProfiles.whatsappChannel
        ],
        'potentialAction': [
          {
            '@type': 'ListenAction',
            'target': [
              {
                '@type': 'EntryPoint',
                'urlTemplate': cfg.identity.streamingUrl,
                'actionPlatform': [
                  'http://schema.org/DesktopWebPlatform',
                  'http://schema.org/MobileWebPlatform',
                  'http://schema.org/IOSPlatform',
                  'http://schema.org/AndroidPlatform'
                ],
                'encodingFormat': 'audio/mpeg'
              }
            ],
            'expectsAcceptanceOf': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD',
              'category': 'Free Live Streaming'
            }
          }
        ]
      },

      // 2. Entidad WebSite (para Sitelinks de Google y Búsqueda)
      {
        '@type': 'WebSite',
        '@id': `${cfg.identity.canonicalUrl}#website`,
        'url': cfg.identity.canonicalUrl,
        'name': cfg.identity.name,
        'description': cfg.description.standard,
        'publisher': {
          '@id': `${cfg.identity.canonicalUrl}#station`
        },
        'inLanguage': 'es-VE'
      },

      // 3. Entidad FAQPage para Resultados Enriquecidos (Rich Snippets)
      {
        '@type': 'FAQPage',
        '@id': `${cfg.identity.canonicalUrl}#faq`,
        'mainEntity': cfg.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      }
    ]
  };
}
