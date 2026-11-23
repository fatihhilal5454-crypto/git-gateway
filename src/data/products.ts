import { Product, ProductSize } from '../types';

export const CLUB_INFO = {
  name: 'ASV Happing e.V.',
  shortName: 'ASV Happing',
  abbr: 'ASV',
  founded: '1961',
  colors: ['#581c87', '#ffffff'],
  city: 'Happing (Rosenheim)',
  homeGround: 'Sportanlage ASV Happing, Happinger Str. 77, 83026 Rosenheim (Deutschland)',
  currentBatchDeadline: '15. des Monats',
  pickupPoint: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim (Deutschland)',
  pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr & an Heimspieltagen',
  partnerBrand: 'Erima® Sportswear',
  logoUrl: 'https://www.btv.de/.imaging/mte/btv/logo-300hw/vereine/imported/asv-happing/logoImage/LOGO_ASV_HAPPING.jpg.jpeg'
};

const makeSizesWithKids = (kidsPrice: number, adultPrice: number): ProductSize[] => [
  { size: '116', available: true, stockNote: 'Auf Lager (Kinder)', price: kidsPrice, isKids: true },
  { size: '128', available: true, stockNote: 'Auf Lager (Kinder)', price: kidsPrice, isKids: true },
  { size: '140', available: true, stockNote: 'Auf Lager (Kinder)', price: kidsPrice, isKids: true },
  { size: '152', available: true, stockNote: 'Auf Lager (Kinder)', price: kidsPrice, isKids: true },
  { size: '164', available: true, stockNote: 'Auf Lager (Kinder)', price: kidsPrice, isKids: true },
  { size: 'XS', available: true, stockNote: 'Auf Lager', price: adultPrice, isKids: false },
  { size: 'S', available: true, stockNote: 'Auf Lager', price: adultPrice, isKids: false },
  { size: 'M', available: true, stockNote: 'Auf Lager', price: adultPrice, isKids: false },
  { size: 'L', available: true, stockNote: 'Auf Lager', price: adultPrice, isKids: false },
  { size: 'XL', available: true, stockNote: 'Auf Lager', price: adultPrice, isKids: false },
  { size: 'XXL', available: true, stockNote: 'Auf Lager', price: adultPrice, isKids: false },
  { size: '3XL', available: true, stockNote: 'Lieferzeit +2 Tage', price: adultPrice, isKids: false }
];

const makeAdultSizes = (price: number): ProductSize[] => [
  { size: 'XS', available: true, stockNote: 'Auf Lager', price, isKids: false },
  { size: 'S', available: true, stockNote: 'Auf Lager', price, isKids: false },
  { size: 'M', available: true, stockNote: 'Auf Lager', price, isKids: false },
  { size: 'L', available: true, stockNote: 'Auf Lager', price, isKids: false },
  { size: 'XL', available: true, stockNote: 'Auf Lager', price, isKids: false },
  { size: 'XXL', available: true, stockNote: 'Auf Lager', price, isKids: false },
  { size: '3XL', available: true, stockNote: 'Auf Lager', price, isKids: false }
];

export const PRODUCTS: Product[] = [
  {
    id: 'asv-erima-sixwings-tee-purple',
    name: 'ASV Happing - INTRO Shirt function',
    tagline: 'Offizielles ASV Happing Erima® INTRO Shirt function in Vereinsfarbe Violett',
    sku: '2082636',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/26221.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-065e675c391fd17ed278fe1e3571316c-122116.jpg',
    imageFilename: 'IMG-20260926-WA0045.jpg',
    productType: 'tshirt',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 19.90,
    kidsPrice: 19.90,
    adultPrice: 21.90,
    originalPrice: 24.95,
    initialsInclusive: true,
    category: 'Trikots & Funktionsshirts',
    gender: 'Kinder / Herren / Unisex',
    colors: [
      {
        id: 'club-purple',
        name: 'Violett',
        hex: '#581c87',
        borderHex: '#3b0764',
        textColor: '#ffffff',
        accentHex: '#ffffff'
      }
    ],
    sizes: makeSizesWithKids(19.90, 21.90),
    description:
      'Das offizielle Erima® INTRO Shirt function 2082636 für den ASV Happing kombiniert athletische Schnittführung mit atmungsaktivem, schnelltrocknendem Funktionspolyester und offiziellem Vereinsflock. Spielerinitialen unter dem Erima-Logo sind inklusive!',
    bulletPoints: [
      'Original Erima® INTRO Shirt function 2082636 aus dem offiziellen ASV Happing Shop',
      'Kindergrößen (116 – 164: 19,90 €) & Erwachsenengrößen (XS – 3XL: 21,90 €)',
      'Spielerinitialen unter dem Erima-Logo an der ##-Position kostenlos inklusive!',
      'Offizielles ASV Happing Wappen auf der Brust',
      'Atmungsaktives, feuchtigkeitsregulierendes Erima Quick-Dry Funktionspolyester'
    ],
    specs: {
      material: '100% Recyceltes Funktionspolyester (Erima Quick-Dry)',
      fit: 'Erima Regular Fit (sportlich normal ausfallend)',
      weight: 'ca. 140 g/m² (ultraleicht & strapazierfähig)',
      origin: 'Veredelt in Deutschland (OEKO-TEX® zertifizierter Flock)',
      care: [
        'Maschinenwäsche bei 40°C Pflegeleicht',
        'Auf links waschen und bügeln',
        'Nicht im Wäschetrockner trocknen',
        'Keinen Weichspüler verwenden (schützt den Flock)'
      ]
    },
    deliveryInfo: {
      estimatedDays: '5–8 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim (Deutschland)',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-sixwings-tee-white',
    name: 'ASV Happing - Rolli',
    tagline: 'Offizieller ASV Happing Erima® Rolli in Vereinsfarbe Weiß',
    sku: '933003',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/17357.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-a0d370a94c877344908624a79599de56-122098.jpg',
    imageFilename: 'IMG-20260926-WA0069.jpg',
    productType: 'tshirt',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 37.90,
    adultPrice: 37.90,
    originalPrice: 42.90,
    category: 'Trikots & Funktionsshirts',
    gender: 'Herren / Unisex',
    colors: [
      {
        id: 'sport-white',
        name: 'Weiß',
        hex: '#ffffff',
        borderHex: '#e2e8f0',
        textColor: '#581c87',
        accentHex: '#581c87'
      }
    ],
    sizes: makeAdultSizes(37.90),
    description:
      'Offizieller ASV Happing Erima® Rolli 933003 mit klassischem Stehkragen, violettem ASV Happing Vereinsflock und optionalen Spielerinitialen.',
    bulletPoints: [
      'Original ASV Happing Rolli 933003 aus dem offiziellen Erima Club-Shop',
      'Strahlend weißes Funktionsmaterial mit violettem Vereinsflock',
      'Freigestelltes ASV Happing Vereinswappen auf der Brust',
      'Leicht, feuchtigkeitsableitend und schnell trocknend'
    ],
    specs: {
      material: '100% Quick-Dry Polyester',
      fit: 'Regular Fit',
      weight: 'ca. 140 g/m²',
      origin: 'Veredelt in Deutschland',
      care: ['40°C Maschinenwäsche', 'Auf links bügeln', 'Kein Weichspüler']
    },
    deliveryInfo: {
      estimatedDays: '5–8 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-sixwings-polo-white',
    name: 'ASV Happing - TS Poloshirt',
    tagline: 'Offizielles ASV Happing Erima® TS Poloshirt mit Knopfleiste & Kragen',
    sku: '2112608',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/26291.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-403c6a80b9d0d2295b0ab6a3bc4a088a-122111.jpg',
    imageFilename: 'IMG-20260926-WA0058.jpg',
    productType: 'polo',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 29.90,
    adultPrice: 29.90,
    originalPrice: 39.95,
    category: 'Trikots & Funktionsshirts',
    gender: 'Herren / Unisex',
    colors: [
      {
        id: 'sport-white',
        name: 'Weiß',
        hex: '#ffffff',
        borderHex: '#e2e8f0',
        textColor: '#581c87',
        accentHex: '#581c87'
      }
    ],
    sizes: makeAdultSizes(29.90),
    description:
      'Klassisches Poloshirt für Trainer, Betreuer und Repräsentationszwecke des ASV Happing. Bequemer Schnitt aus atmungsaktivem Mischgewebe mit geripptem Kragen und dezenter Knopfleiste.',
    bulletPoints: [
      'Original Erima® TS Poloshirt 2112608 mit edlem Rippstrick-Kragen',
      'Gestochen scharfer ASV Happing Vereinsflock',
      'Hochwertige 3-Loch-Knopfleiste',
      'Formbeständig und strapazierfähig'
    ],
    specs: {
      material: '65% Baumwolle, 35% Polyester',
      fit: 'Klassischer Polo-Schnitt',
      weight: 'ca. 190 g/m²',
      origin: 'Veredelt in Deutschland',
      care: ['40°C Maschinenwäsche', 'Auf links bügeln', 'Kein Bleichmittel']
    },
    deliveryInfo: {
      estimatedDays: '5–8 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-sixwings-hoodie-sand',
    name: 'ASV Happing - TS Hoody',
    tagline: 'Offizieller ASV Happing Erima® TS Hoody mit Kängurutasche',
    sku: '2072581',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/26755.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-bb794ca7b64ee1df52b1239c0850020d-122112.jpg',
    imageFilename: 'IMG-20260926-WA0053.jpg',
    productType: 'hoodie',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 29.90,
    kidsPrice: 29.90,
    adultPrice: 29.90,
    originalPrice: 49.95,
    category: 'Hoodies & Pullover',
    gender: 'Kinder / Herren / Unisex',
    colors: [
      {
        id: 'club-sand',
        name: 'Beige',
        hex: '#e2d9cc',
        borderHex: '#cbd5e1',
        textColor: '#581c87',
        accentHex: '#581c87'
      }
    ],
    sizes: makeSizesWithKids(29.90, 29.90),
    description:
      'Gemütlicher Erima® TS Hoody mit Kapuze und Kängurutasche für kalte Spieltage, Aufwärmphasen und die Freizeit. Weiches Sweat-Material mit gebürsteter Innenseite.',
    bulletPoints: [
      'Original Erima® TS Hoody aus der Club-Kollektion',
      'Kinder- und Erwachsenengrößen (116 – 164 & XS – 3XL: 29,90 €)',
      'Große Kängurutasche für warme Hände & Accessoires',
      'Gefütterte Kapuze mit Kordelzug',
      'Elastische Bündchen an Ärmeln und Saum'
    ],
    specs: {
      material: '60% Baumwolle, 40% Polyester (angerautes Fleece)',
      fit: 'Bequemer Regular Fit',
      weight: 'ca. 280 g/m²',
      origin: 'Veredelt in Deutschland',
      care: ['40°C Schonwäsche', 'Nicht in den Trockner', 'Auf links bügeln']
    },
    deliveryInfo: {
      estimatedDays: '5–8 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-sixwings-quarterzip-white',
    name: 'ASV Happing - INTRO Training Hose',
    tagline: 'Offizielle ASV Happing Erima® INTRO Training Hose mit durchgehendem RV',
    sku: '1032652',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/26744.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-094193557a55ae5e07a3dfc58810b42d-122113.jpg',
    imageFilename: 'IMG-20260926-WA0050.jpg',
    productType: 'jacket',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 21.90,
    kidsPrice: 21.90,
    adultPrice: 21.90,
    originalPrice: 39.95,
    category: 'Trainingstops & Jacken',
    gender: 'Kinder / Herren / Unisex',
    colors: [
      {
        id: 'sport-white',
        name: 'Weiß',
        hex: '#ffffff',
        borderHex: '#e2e8f0',
        textColor: '#581c87',
        accentHex: '#581c87'
      }
    ],
    sizes: makeSizesWithKids(21.90, 21.90),
    description:
      'Die vielseitige Erima® INTRO Training Hose 1032652 für den ASV Happing mit Stehkragen, durchgehendem Reißverschluss und seitlichen Taschen.',
    bulletPoints: [
      'Original Erima® INTRO Training Hose 1032652',
      'Kindergrößen (116 – 164: 21,90 €) & Erwachsenengrößen (XS – 3XL: 21,90 €)',
      'Durchgehender Front-Reißverschluss mit Kinnschutz',
      'Seitliche Reißverschlusstaschen für Smartphone & Schlüssel',
      'Atmungsaktives, schnelltrocknendes Funktionsmaterial'
    ],
    specs: {
      material: '100% Polyester (Shiny Tricot / Quick-Dry)',
      fit: 'Sportliche Trainingspassform',
      weight: 'ca. 220 g/m²',
      origin: 'Veredelt in Deutschland',
      care: ['40°C Maschinenwäsche', 'Reißverschlüsse vor dem Waschen schließen']
    },
    deliveryInfo: {
      estimatedDays: '5–8 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-sixwings-quarterzip-purple',
    name: 'ASV Happing - INTRO Training Shorts',
    tagline: 'Offizielles ASV Happing Erima® INTRO Training Shorts mit kurzem Zipper',
    sku: '1262610',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/26746.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-c2f82fc461d33cbfa4a4a5840d2d2a4c-122114.jpg',
    imageFilename: 'IMG-20260926-WA0056.jpg',
    productType: 'quarterzip',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 18.90,
    kidsPrice: 18.90,
    adultPrice: 18.90,
    originalPrice: 42.95,
    category: 'Trainingstops & Jacken',
    gender: 'Kinder / Herren / Unisex',
    colors: [
      {
        id: 'club-purple',
        name: 'Violett',
        hex: '#581c87',
        borderHex: '#3b0764',
        textColor: '#ffffff',
        accentHex: '#ffffff'
      }
    ],
    sizes: makeSizesWithKids(18.90, 18.90),
    description:
      'Das klassische Erima® INTRO Training Shorts für intensive Einheiten bei wechselhaftem Wetter. Elastisches Material und kurzer Reißverschluss für optimale Wärmeregulierung.',
    bulletPoints: [
      'Original Erima® INTRO Training Shorts im ASV-Design',
      'Kinder- und Erwachsenengrößen (116 – 164 & XS – 3XL: 18,90 €)',
      '1/4-Front-Reißverschluss mit Stehkragen',
      'Ergonomische Ärmelführung für volle Bewegungsfreiheit',
      'Leichtes, isolierendes Stretchmaterial'
    ],
    specs: {
      material: '100% Polyester (Brushed Piqué)',
      fit: 'Athletischer Schnitt',
      weight: 'ca. 200 g/m²',
      origin: 'Veredelt in Deutschland',
      care: ['40°C Maschinenwäsche', 'Auf links waschen']
    },
    deliveryInfo: {
      estimatedDays: '5–8 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-sixwings-tanktop-white',
    name: 'ASV Erima® Six Wings Tank Top - Weiß',
    tagline: 'Ärmelloses Funktions-Top für maximale Belüftung & Bewegungsfreiheit',
    sku: 'ERI-1082208-ASV-WHT',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/tank-top-2282401.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/2024/2282401_V.jpg',
    imageFilename: 'IMG-20260926-WA0054.jpg',
    productType: 'tanktop',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 16.90,
    adultPrice: 16.90,
    originalPrice: 32.95,
    category: 'Trikots & Funktionsshirts',
    gender: 'Herren / Unisex',
    colors: [
      {
        id: 'sport-white',
        name: 'Weiß',
        hex: '#ffffff',
        borderHex: '#e2e8f0',
        textColor: '#581c87',
        accentHex: '#581c87'
      }
    ],
    sizes: [
      { size: 'S', available: true, stockNote: 'Auf Lager', price: 16.90, isKids: false },
      { size: 'M', available: true, stockNote: 'Auf Lager', price: 16.90, isKids: false },
      { size: 'L', available: true, stockNote: 'Auf Lager', price: 16.90, isKids: false },
      { size: 'XL', available: true, stockNote: 'Auf Lager', price: 16.90, isKids: false },
      { size: 'XXL', available: true, stockNote: 'Auf Lager', price: 16.90, isKids: false }
    ],
    description:
      'Atmungsaktives ärmelloses Shirt für warme Sommertage, Workouts und schweißtreibende Trainingseinheiten mit ASV Happing Vereinsflock.',
    bulletPoints: [
      'Breiter Rundhalsausschnitt und tiefe Armausschnitte für volle Beweglichkeit',
      'Superleichtes, schnelltrocknendes Funktionsmaterial',
      'ASV Happing Wappen auf der linken Brust',
      'Ideal für Krafttraining, Beachvolleyball & Sommerfitness'
    ],
    specs: {
      material: '100% Quick-Dry Polyester',
      fit: 'Sportliche ärmellose Passform',
      weight: 'ca. 120 g/m²',
      origin: 'Veredelt in Deutschland',
      care: ['40°C Maschinenwäsche', 'Auf links waschen']
    },
    deliveryInfo: {
      estimatedDays: '5–8 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-sixwings-shorts-black',
    name: 'TS Hoody',
    tagline: 'Offizielle ASV Happing Erima® INTRO Shorts 1152622 ohne Innenslip',
    sku: '1152622',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/25565.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-3f7cb49c065f49ca062ba1fb31818d6a-122119.jpg',
    imageFilename: 'IMG-20260926-WA0057.jpg',
    productType: 'shorts',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 29.99,
    kidsPrice: 29.99,
    adultPrice: 29.99,
    originalPrice: 39.95,
    category: 'Hoodies & Pullover',
    gender: 'Kinder / Herren / Unisex',
    colors: [
      {
        id: 'deep-black',
        name: 'Schwarz',
        hex: '#171717',
        borderHex: '#262626',
        textColor: '#ffffff',
        accentHex: '#ffffff'
      }
    ],
    sizes: makeSizesWithKids(29.99, 29.99),
    description:
      'Federleichte Erima® INTRO Shorts 1152622 passend zu allen Trikots und Trainingsjacken. Elastischer Bund mit integriertem Kordelzug für perfekten Halt im Zweikampf.',
    bulletPoints: [
      'Original Erima® INTRO Shorts 1152622 im Vereinsdesign',
      'Kinder- und Erwachsenengrößen (116 – 164 & XS – 3XL: 29,99 €)',
      'Atmungsaktives, feuchtigkeitsregulierendes Material',
      'Elastikbund mit Innenkordel',
      'ASV Happing Wappen auf dem rechten Oberschenkel'
    ],
    specs: {
      material: '100% Polyester (Quick-Dry)',
      fit: 'Sportliche Beinlänge, ohne störenden Innenslip',
      weight: 'ca. 110 g/m²',
      origin: 'Veredelt in Deutschland',
      care: ['40°C Maschinenwäsche', 'Kein Weichspüler']
    },
    deliveryInfo: {
      estimatedDays: '5–8 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-sixwings-pants-black',
    name: 'ASV Happing - INTRO Training Jacket',
    tagline: 'Offizielle ASV Happing Erima® INTRO Training Jacket mit Bein-Zipper',
    sku: '1102610',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/26729.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-5dbf756b1076f7f2b96e5114c00a6c0c-122120.jpg',
    imageFilename: 'IMG-20260926-WA0059.jpg',
    productType: 'pants',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 21.90,
    kidsPrice: 21.90,
    adultPrice: 23.90,
    originalPrice: 29.95,
    category: 'Hoodies & Pullover',
    gender: 'Kinder / Herren / Unisex',
    colors: [
      {
        id: 'deep-black',
        name: 'Schwarz',
        hex: '#171717',
        borderHex: '#262626',
        textColor: '#ffffff',
        accentHex: '#ffffff'
      }
    ],
    sizes: makeSizesWithKids(21.90, 23.90),
    description:
      'Klassische Erima® INTRO Training Jacket 1102610 mit schmal zulaufendem Beinabschluss und Reißverschlüssen an den Knöcheln für schnelles An- und Ausziehen über den Fußballschuhen.',
    bulletPoints: [
      'Original Erima® INTRO Training Jacket 1102610',
      'Kindergrößen (116 – 164: 21,90 €) & Erwachsenengrößen (XS – 3XL: 23,90 €)',
      'Reißverschluss am Saum für bequemes Überziehen',
      'Seitliche Eingrifftaschen mit Reißverschluss',
      'Robuster, abriebfester Funktionspolyester'
    ],
    specs: {
      material: '100% Polyester (Durable Double-Knit)',
      fit: 'Tapered Fit (am Unterschenkel anliegend)',
      weight: 'ca. 240 g/m²',
      origin: 'Veredelt in Deutschland',
      care: ['40°C Maschinenwäsche', 'Reißverschlüsse schließen']
    },
    deliveryInfo: {
      estimatedDays: '5–8 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-sixwings-bag-black',
    name: 'ASV Happing - SIX WINGS Sporttasche mit Bodenfach',
    tagline: 'Offizielle ASV Happing Erima® SIX WINGS Sporttasche mit separatem Schuhfach',
    sku: '7232407',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/25372.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-9e90ba62762b3ee3ee481d96e594d232-122127.jpg',
    imageFilename: 'IMG-20260926-WA0051.jpg',
    productType: 'bag',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 29.90,
    adultPrice: 29.90,
    originalPrice: 39.95,
    category: 'Taschen & Ausrüstung',
    gender: 'Unisex',
    colors: [
      {
        id: 'deep-black',
        name: 'Schwarz',
        hex: '#171717',
        borderHex: '#262626',
        textColor: '#ffffff',
        accentHex: '#ffffff'
      }
    ],
    sizes: [
      { size: 'S (ca. 35 L)', available: true, stockNote: 'Auf Lager', price: 29.90, isKids: false },
      { size: 'M (ca. 55 L)', available: true, stockNote: 'Auf Lager', price: 29.90, isKids: false },
      { size: 'L (ca. 80 L)', available: true, stockNote: 'Auf Lager', price: 29.90, isKids: false }
    ],
    description:
      'Die ultimative Erima® SIX WINGS Sporttasche 7232407 mit integriertem Bodenfach zur sauberen Trennung von Schmutzwäsche oder Stollen- und Hallenschuhen.',
    bulletPoints: [
      'Original Erima® SIX WINGS Sporttasche 7232407 aus dem offiziellen Shop',
      'Geräumiges Bodenfach für Schuhe & feuchte Trainingskleidung',
      'Verstellbarer Schultergurt mit bequemer Polsterung',
      'Seitliche Netztasche für Trinkflasche & Duschgel'
    ],
    specs: {
      material: '100% 600D Polyester (wasserabweisend)',
      fit: 'Großzügiges Stauvolumen mit stabiler Bodenwanne',
      weight: 'ca. 850 g',
      origin: 'Veredelt in Deutschland',
      care: ['Mit feuchtem Tuch abwischbar', 'Nicht waschmaschinengeeignet']
    },
    deliveryInfo: {
      estimatedDays: '3–5 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-intro-sweatshirt-purple',
    name: 'ASV Happing - INTRO Sweatshirt',
    tagline: 'Offizielles ASV Happing Erima® INTRO Sweatshirt in Vereinsfarbe Violett',
    sku: '1072608',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/intro-sweatshirt-1072608.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-ac21060d2d1b9104a97110afc6d28e76-122115.jpg',
    imageFilename: 'custom-ac21060d2d1b9104a97110afc6d28e76-122115.jpg',
    productType: 'sweatshirt',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 21.90,
    kidsPrice: 21.90,
    adultPrice: 23.90,
    originalPrice: 29.95,
    category: 'Hoodies & Pullover',
    gender: 'Kinder / Herren / Unisex',
    colors: [
      {
        id: 'club-purple',
        name: 'Violett',
        hex: '#581c87',
        borderHex: '#3b0764',
        textColor: '#ffffff',
        accentHex: '#ffffff'
      }
    ],
    sizes: makeSizesWithKids(21.90, 23.90),
    description:
      'Klassisches Erima® INTRO Sweatshirt 1072608 für den ASV Happing mit Rundhalsausschnitt, gerippten Bündchen und offiziellem Vereinsflock.',
    bulletPoints: [
      'Original Erima® INTRO Sweatshirt 1072608 aus dem offiziellen Shop',
      'Kindergrößen (116 – 164: 21,90 €) & Erwachsenengrößen (XS – 3XL: 23,90 €)',
      'Offizielles ASV Happing Vereinswappen auf der Brust',
      'Weiches, formbeständiges Sweat-Funktionsmaterial',
      'Rippbündchen an Ärmeln und Saum für optimalen Sitz'
    ],
    specs: {
      material: '60% Baumwolle, 40% Polyester (French Terry)',
      fit: 'Regular Fit',
      weight: 'ca. 280 g/m²',
      origin: 'Veredelt in Deutschland',
      care: ['40°C Maschinenwäsche', 'Auf links bügeln', 'Kein Trockner']
    },
    deliveryInfo: {
      estimatedDays: '5–8 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-sixwings-backpack-black',
    name: 'ASV Happing - SIX WINGS Rucksack',
    tagline: 'Offizieller ASV Happing Erima® SIX WINGS Rucksack mit Ballnetz & Bodenfach',
    sku: '7232408',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/sixwings-rucksack-7232408.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-4d0d4ab8c385cbd16baec07f835a80e1-122124.jpg',
    imageFilename: 'custom-4d0d4ab8c385cbd16baec07f835a80e1-122124.jpg',
    productType: 'backpack',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 26.90,
    adultPrice: 26.90,
    originalPrice: 34.95,
    category: 'Taschen & Ausrüstung',
    gender: 'Unisex',
    colors: [
      {
        id: 'deep-black',
        name: 'Schwarz',
        hex: '#171717',
        borderHex: '#262626',
        textColor: '#ffffff',
        accentHex: '#ffffff'
      }
    ],
    sizes: [
      { size: 'Einheitsgröße (ca. 25 L)', available: true, stockNote: 'Auf Lager', price: 26.90, isKids: false }
    ],
    description:
      'Der funktionelle Erima® SIX WINGS Rucksack 7232408 für Sportler des ASV Happing. Mit geräumigem Hauptfach, separatem Schuh-Bodenfach, Netz-Seitentaschen, verstellbarem Gummizug vorne und ergonomisch gepolsterten Trägern.',
    bulletPoints: [
      'Original Erima® SIX WINGS Rucksack 7232408 aus dem offiziellen Shop',
      'Separates Bodenfach für Schuhe & schmutzige Kleidung',
      'Seitliche Mesh-Fächer für Trinkflaschen',
      'Inklusive abnehmbarem Ballnetz',
      'ASV Happing Vereinswappen und optionale Initialen-Veredelung'
    ],
    specs: {
      material: '100% 600D Polyester (wasserabweisend)',
      fit: 'Ergonomische Passform mit gepolsterten Tragegurten',
      weight: 'ca. 650 g (Volumen ca. 25 Liter)',
      origin: 'Veredelt in Deutschland',
      care: ['Mit feuchtem Schwamm abwaschbar']
    },
    deliveryInfo: {
      estimatedDays: '3–5 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  },
  {
    id: 'asv-erima-sixwings-sporttasche-classic-black',
    name: 'ASV Happing - Knit Beanie',
    tagline: 'Offizielle ASV Happing Erima® Knit Beanie',
    sku: '7232406',
    brand: 'Erima® Sportswear',
    imageUrl: '/products/sixwings-sporttasche-7232406.jpg',
    fallbackImageUrl: 'https://api.erima-online.com/uploads/smu/custom-ecf35562d32c01831ff5fe9eadeebe46-122125.jpg',
    imageFilename: 'custom-ecf35562d32c01831ff5fe9eadeebe46-122125.jpg',
    productType: 'bag',
    clubName: 'ASV Happing',
    clubAbbr: 'ASV',
    clubCity: 'Happing (Rosenheim)',
    price: 12.90,
    adultPrice: 12.90,
    originalPrice: 34.95,
    category: 'Taschen & Ausrüstung',
    gender: 'Unisex',
    colors: [
      {
        id: 'deep-black',
        name: 'Schwarz',
        hex: '#171717',
        borderHex: '#262626',
        textColor: '#ffffff',
        accentHex: '#ffffff'
      }
    ],
    sizes: [
      { size: 'S (ca. 28 L)', available: true, stockNote: 'Auf Lager', price: 12.90, isKids: false },
      { size: 'M (ca. 50 L)', available: true, stockNote: 'Auf Lager', price: 12.90, isKids: false },
      { size: 'L (ca. 76 L)', available: true, stockNote: 'Auf Lager', price: 12.90, isKids: false }
    ],
    description:
      'Klassische Erima® Knit Beanie für den ASV Happing mit praktischer Ausstattung und offiziellem Vereinsflock.',
    bulletPoints: [
      'Original Erima® Knit Beanie aus dem offiziellen Shop',
      'Geräumiges Hauptfach mit Zwei-Wege-Reißverschluss',
      'Belüftete Seitentasche für feuchte Textilien',
      'Verstellbarer, gepolsterter Schultergurt & Doppelgriffe',
      'ASV Happing Vereinsflock & Option für Spielerinitialen'
    ],
    specs: {
      material: '100% 600D Polyester (reißfest & pflegeleicht)',
      fit: 'Sporttaschen-Klassiker mit praktischer Innenaufteilung',
      weight: 'ca. 700 g',
      origin: 'Veredelt in Deutschland',
      care: ['Mit feuchtem Tuch abwischbar']
    },
    deliveryInfo: {
      estimatedDays: '3–5 Werktage',
      pickupAvailable: true,
      pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
      pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
    }
  }
];

export const SIZE_CHART = [
  { size: '116', chest: '57 - 60 cm', waist: '54 - 56 cm', hip: '61 - 65 cm', height: '111 - 122 cm' },
  { size: '128', chest: '61 - 65 cm', waist: '57 - 60 cm', hip: '66 - 70 cm', height: '123 - 132 cm' },
  { size: '140', chest: '66 - 71 cm', waist: '61 - 65 cm', hip: '71 - 76 cm', height: '133 - 144 cm' },
  { size: '152', chest: '72 - 78 cm', waist: '66 - 70 cm', hip: '77 - 82 cm', height: '145 - 156 cm' },
  { size: '164', chest: '79 - 85 cm', waist: '71 - 75 cm', hip: '83 - 88 cm', height: '157 - 168 cm' },
  { size: 'XS', chest: '86 - 91 cm', waist: '73 - 78 cm', hip: '87 - 92 cm', height: '168 - 172 cm' },
  { size: 'S', chest: '92 - 97 cm', waist: '79 - 84 cm', hip: '93 - 98 cm', height: '172 - 176 cm' },
  { size: 'M', chest: '98 - 103 cm', waist: '85 - 90 cm', hip: '99 - 104 cm', height: '176 - 180 cm' },
  { size: 'L', chest: '104 - 109 cm', waist: '91 - 96 cm', hip: '105 - 110 cm', height: '180 - 184 cm' },
  { size: 'XL', chest: '110 - 115 cm', waist: '97 - 102 cm', hip: '111 - 116 cm', height: '184 - 188 cm' },
  { size: 'XXL', chest: '116 - 122 cm', waist: '103 - 109 cm', hip: '117 - 123 cm', height: '188 - 192 cm' },
  { size: '3XL', chest: '123 - 129 cm', waist: '110 - 116 cm', hip: '124 - 130 cm', height: '190 - 195 cm' }
];
