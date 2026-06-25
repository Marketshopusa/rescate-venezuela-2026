/**
 * RESCATE VENEZUELA 2026 - Lógica de Aplicación (Fase 3)
 * Maneja el estado local, base de datos simulada de personas y chat,
 * filtros, modales, compresión de fotos, y moderación inteligente anti-abuso.
 */

// Estado global de la aplicación
let appState = {
    persons: [],
    chatMessages: [],
    filters: {
        search: '',
        state: '',
        status: ''
    },
    currentPhotoBase64: null,
    photoValidationStatus: null, // 'pending', 'verified', 'failed'
    activeTab: 'with-photos',     // 'with-photos' o 'without-photos'
    visibleCount: 24              // Paginación progresiva
};

// Datos semilla iniciales (Mock Data) con 1 Ejemplo y 6 Casos Reales del Terremoto
const SEED_DATA = [
    {
        id: "seed-example",
        name: "EJEMPLO: Juan Pérez",
        age: 30,
        gender: "Masculino",
        status: "Desaparecido",
        state: "Distrito Capital",
        city: "Caracas",
        address: "Av. Universidad, cerca de la estación del metro",
        description: "Esta es una tarjeta de demostración. Muestra cómo se presenta la información física, el estatus de búsqueda y los datos del contacto del familiar.",
        contactName: "Familiar de Ejemplo (Demostración)",
        contactPhone: "+58 412-0000000",
        photo: BASE64_PORTRAIT_CARLOS, // Imagen de muestra
        isExample: true,
        createdAt: new Date().toISOString()
    },
    {
        id: "scraped-1",
        name: "LEOPOLDO PESTANA",
        age: 65,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "LOS CORALES LA GUAIRA",
        address: "LOS CORALES LA GUAIRA",
        description: "Cédula: 81529732. VIVE EN CORAL PARK FRENTE A LA PLAYA LOS CORALES. Email contacto: 0325nataliavierma@gmail.com",
        contactName: "NATALIA VIERMA",
        contactPhone: "04241376352",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:40:51.514Z"
    },
    {
        id: "scraped-2",
        name: "Gianny Pimentel",
        age: 0,
        gender: "No especificado",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira",
        address: "No especificada",
        description: "Email contacto: GioskateryneP@gmail.com",
        contactName: "Hermana",
        contactPhone: "04125412234",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:52.819Z"
    },
    {
        id: "scraped-3",
        name: "Maria Marquez",
        age: 33,
        gender: "No especificado",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Marquez",
        address: "Marquez",
        description: "Cédula: 20288242. Estan bajo los escombros ayudelos a salir ni hay nadie de rescate en esta zona. Email contacto: mariavictoria1992.17@gmail.com",
        contactName: "Maria Marquez",
        contactPhone: "+573102771051",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:50.058Z"
    },
    {
        id: "scraped-4",
        name: "Ronall Davelar",
        age: 46,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La guaira",
        address: "La guaira",
        description: "Cédula: 11641879. Pantalón y camisa. Email contacto: angeldavidromero2008@gmail.com",
        contactName: "Angel romero",
        contactPhone: "04121778351",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:41.829Z"
    },
    {
        id: "scraped-5",
        name: "JUAN Herrera",
        age: 86,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La guaira, Caraballeda",
        address: "La guaira, Caraballeda",
        description: "Cédula: 25367961. Email contacto: luisherreraramos1985@gmail.com",
        contactName: "Juan herrera",
        contactPhone: "+58 412-8092560",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:40.900Z"
    },
    {
        id: "scraped-6",
        name: "Yelitza Brito",
        age: 53,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "OPPE 26 caribe estado la guaira",
        address: "OPPE 26 caribe estado la guaira",
        description: "Se dice que estaba en su hogar y el edificio se desplomó pero no hay noticias de ella por ningún lado. Email contacto: karenm_14@hotmail.com",
        contactName: "Judith Brito",
        contactPhone: "+5804248460006",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:38.684Z"
    },
    {
        id: "scraped-7",
        name: "Ibeth Guevara",
        age: 55,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira",
        address: "La Guaira",
        description: "Email contacto: sotogray01@gmail.com",
        contactName: "Graidismar",
        contactPhone: "+51916596355",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:34.516Z"
    },
    {
        id: "scraped-8",
        name: "Omaira Hernandez Alvarez",
        age: 68,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Caribe la guaira",
        address: "Caribe la guaira",
        description: "Cédula: 0000. Email contacto: alvarezmariela02@gmail.com",
        contactName: "Carolina Alvarez",
        contactPhone: "04144916406",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:33.796Z"
    },
    {
        id: "scraped-9",
        name: "Gabriel Antonio Ascanio Zalazar",
        age: 23,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira",
        address: "La Guaira",
        description: "Email contacto: jorianguillen@gmail.com",
        contactName: "Jorian Guillen",
        contactPhone: "+584264720678",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:33.617Z"
    },
    {
        id: "scraped-10",
        name: "David Carmona",
        age: 26,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Playa grande Catia la mar la Guaira",
        address: "Playa grande Catia la mar la Guaira",
        description: "Cédula: V-27159010. Email contacto: reberolalondra96@gmail.com",
        contactName: "Alejandro Carmona",
        contactPhone: "+58 414-8480758",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:26.088Z"
    },
    {
        id: "scraped-11",
        name: "Ginette Sanchez",
        age: 38,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Naiguata",
        address: "Naiguata",
        description: "Email contacto: dorysjss1988@gmail.com",
        contactName: "Doris Sánchez",
        contactPhone: "04121396416",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:26.031Z"
    },
    {
        id: "scraped-12",
        name: "Víctor Ochoa",
        age: 40,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Turmero, Edificio derrumbado al lado de intercable",
        address: "Turmero, Edificio derrumbado al lado de intercable",
        description: "Con lentes, contextura robusta, aproximadamente 1.8M, vivía en dicho edificio, nada de contacto después del terremoto. Email contacto: Leanderdiazbracho27@gmail.com",
        contactName: "Leander",
        contactPhone: "4243796211",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:24.874Z"
    },
    {
        id: "scraped-13",
        name: "Wily Peña",
        age: 40,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira",
        address: "La Guaira",
        description: "Email contacto: renzonaveda05@gmail.com",
        contactName: "Wilmaris Peña",
        contactPhone: "+58 424-6733477",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:24.383Z"
    },
    {
        id: "scraped-14",
        name: "Yosman Domínguez",
        age: 15,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira- Caraballeda por el ambulatorio de la iglesia",
        address: "La Guaira- Caraballeda por el ambulatorio de la iglesia",
        description: "Email contacto: deilimars02@gmail.com",
        contactName: "Deilimar Sánchez",
        contactPhone: "04241410587",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:23.519Z"
    },
    {
        id: "scraped-15",
        name: "Rosangel, Luisangel, yender Arratia, Rodriguez, robaina",
        age: 43,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Naiguatá",
        address: "Naiguatá",
        description: "Cédula: 19.628.186. Nose En Exacto, Estaban En Los Tambores. Email contacto: yuli.2610rodriguez@gmail.com",
        contactName: "Yuliany Rodriguez",
        contactPhone: "+56959818531",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:23.135Z"
    },
    {
        id: "scraped-16",
        name: "María Mudarra",
        age: 0,
        gender: "No especificado",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira",
        address: "No especificada",
        description: "Cédula: 1716310. Email contacto: mudarraa79@gmail.com",
        contactName: "María mudarra",
        contactPhone: "7725212716",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:23.056Z"
    },
    {
        id: "scraped-17",
        name: "Kowalsky Longar",
        age: 38,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira, Los coralitos",
        address: "La Guaira, Los coralitos",
        description: "Cédula: 19189514. no lo sé. Email contacto: Durvisfernan@gmail.com",
        contactName: "Durvis Fernández",
        contactPhone: "04169810670",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:21.858Z"
    },
    {
        id: "scraped-18",
        name: "Loohan José Quiroz González",
        age: 11,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira Naiguata",
        address: "La Guaira Naiguata",
        description: "Cédula: 36716838. Email contacto: magreivismnrsnavarro@gmail.com",
        contactName: "Magreivis navarro",
        contactPhone: "04120924128",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:20.865Z"
    },
    {
        id: "scraped-19",
        name: "Josué Alexander beaumont Beaumont",
        age: 15,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La guaira Catia la mar calle la marina",
        address: "La guaira Catia la mar calle la marina",
        description: "Email contacto: guzmandexilemar@gmail.com",
        contactName: "Dexilemar Guzman",
        contactPhone: "04144960728",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:20.089Z"
    },
    {
        id: "scraped-20",
        name: "Jhoneidy Adiren Quintero Hernández",
        age: 36,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Guaira caribe",
        address: "Guaira caribe",
        description: "Cédula: V-19391490. Email contacto: jhonneycj102@gmail.com",
        contactName: "Jhonney Alexis Quintero Castellano",
        contactPhone: "+584120329558",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:17.413Z"
    },
    {
        id: "scraped-21",
        name: "Dinozca Prada Sánchez",
        age: 7,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Tanaguarenas, La Guaira",
        address: "Tanaguarenas, La Guaira",
        description: "Vista por última vez en el edificio frente al puesto de policías. Email contacto: lauragreco2003@hotmail.com",
        contactName: "Yndira Sanchez",
        contactPhone: "+584269331980",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:13.154Z"
    },
    {
        id: "scraped-22",
        name: "yulia Sánchez Cárdenas",
        age: 40,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La guaira, sector caribe",
        address: "La guaira, sector caribe",
        description: "Email contacto: irlamaryg1602@gmail.com",
        contactName: "lisbeth Cárdenas",
        contactPhone: "+573227008570",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:11.857Z"
    },
    {
        id: "scraped-23",
        name: "Rafael Monasterio",
        age: 65,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira",
        address: "No especificada",
        description: "Cédula: 6951551. Email contacto: marcosipod2@gmail.com",
        contactName: "Marcos Monasterio",
        contactPhone: "04142423596",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:09.592Z"
    },
    {
        id: "scraped-24",
        name: "Yelitza Delgado",
        age: 45,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Naiguata Guaira",
        address: "Naiguata Guaira",
        description: "Email contacto: velasquezmorelis17@gmail.com",
        contactName: "Morelis",
        contactPhone: "04265529867",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:07.315Z"
    },
    {
        id: "scraped-25",
        name: "Hynda Ramirez",
        age: 33,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira",
        address: "La Guaira",
        description: "Mechas con reflejo amarillo, tiene 2 niñas pequeñas. Email contacto: enrique.21c02@gmail.com",
        contactName: "juan",
        contactPhone: "+584126067158",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:06.926Z"
    },
    {
        id: "scraped-26",
        name: "Christian Enrique Terán",
        age: 0,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La guaira san Julián",
        address: "La guaira san Julián",
        description: "Cédula: 26327943. Email contacto: perozomary@gmail.com",
        contactName: "Marilyn perozo",
        contactPhone: "+58 4246914200",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:01.301Z"
    },
    {
        id: "scraped-27",
        name: "Isaac e isaias Guerra flores",
        age: 14,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Caribe la guaira",
        address: "Caribe la guaira",
        description: "Cédula: 35010669 y 35010668. Email contacto: gonzaleznina84@gmail.com",
        contactName: "Leopoldo González",
        contactPhone: "+58 414-2876573",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:39:00.790Z"
    },
    {
        id: "scraped-28",
        name: "Eduardo Andrés Ferrini estrada",
        age: 0,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Catialamar la guaira",
        address: "Catialamar la guaira",
        description: "Cédula: V32886114. Email contacto: leonelsaul17@gmail.com",
        contactName: "Leonel Rojas",
        contactPhone: "04143122166",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:34.068Z"
    },
    {
        id: "scraped-29",
        name: "Emma maría Batidas",
        age: 49,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "El guaira ella vive  hay",
        address: "El guaira ella vive  hay",
        description: "Cédula: V10039051. Email contacto: albarranyusmary973@gmail.com",
        contactName: "Yusmary  Albarrán",
        contactPhone: "04266584793",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:33.134Z"
    },
    {
        id: "scraped-30",
        name: "María mudarra Mudarra",
        age: 0,
        gender: "No especificado",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La guiara",
        address: "La guiara",
        description: "Cédula: 17165191. La guiar. Email contacto: mudarraa79@gmail.com",
        contactName: "María mudarra",
        contactPhone: "7725212716",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:28.358Z"
    },
    {
        id: "scraped-31",
        name: "Boris andres Gudiño vargas",
        age: 35,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La guaira",
        address: "La guaira",
        description: "Cédula: V-17709289. Residencia mariana mar en caribe detrás de la playa de los cocos. Email contacto: vanessagudino52@gmail.com",
        contactName: "Vanessa gudiño",
        contactPhone: "+584245811578",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:22.873Z"
    },
    {
        id: "scraped-32",
        name: "Melvin Peréz",
        age: 27,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Recidencias Ritasol palace en la guaira",
        address: "Recidencias Ritasol palace en la guaira",
        description: "Cédula: V- 27988522. Se encontraba laborando. Email contacto: yorbeliramirez388@gmail.com",
        contactName: "Yorbeli",
        contactPhone: "04124737350",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:22.208Z"
    },
    {
        id: "scraped-33",
        name: "Beatriz González",
        age: 64,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Naiguata",
        address: "Naiguata",
        description: "Email contacto: dorysjss1988@gmail.com",
        contactName: "Doris Sánchez",
        contactPhone: "04121396416",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:20.990Z"
    },
    {
        id: "scraped-34",
        name: "Fernándo Urbina",
        age: 56,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira",
        address: "La Guaira",
        description: "Cédula: V-6305684. Email contacto: duran.yaja67@hotmail.com",
        contactName: "Yajaira Duran",
        contactPhone: "04241533672",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:18.345Z"
    },
    {
        id: "scraped-35",
        name: "Clara Susana Hurtado Flores",
        age: 70,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Caraballeda, Vargas",
        address: "Caraballeda, Vargas",
        description: "Cédula: V-3711748. Es una señora sola que vivía en la residencia OPPPE 27. Email contacto: mar.adsa23@gmail.com",
        contactName: "Mariana De Sousa",
        contactPhone: "+573196184414",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:17.559Z"
    },
    {
        id: "scraped-36",
        name: "Rosa Petra Lamadrid",
        age: 63,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira caraballeda",
        address: "La Guaira caraballeda",
        description: "Email contacto: fuentesdoraimi24@gmail.com",
        contactName: "Nilson Márquez",
        contactPhone: "04142823728",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:14.096Z"
    },
    {
        id: "scraped-37",
        name: "Laurean Calderón",
        age: 38,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Residencias caribe, caraballeda La Guaira",
        address: "Residencias caribe, caraballeda La Guaira",
        description: "Estaba con su esposa y sus dos hijas en el edificio. Email contacto: merchanestefany28@gmail.com",
        contactName: "Daniel alfonzo",
        contactPhone: "+57 311 5884259",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:09.225Z"
    },
    {
        id: "scraped-38",
        name: "Edgar Alexander Gómez mejias",
        age: 51,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira",
        address: "La Guaira",
        description: "Email contacto: acostanatacha2592@gmail.com",
        contactName: "Natacha Acosta",
        contactPhone: "04129877226",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:08.074Z"
    },
    {
        id: "scraped-39",
        name: "Yorlene Mendoza",
        age: 0,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La guaira",
        address: "La guaira",
        description: "Email contacto: ambarkualquidiamendozaleal@gmail.com",
        contactName: "Ámbar Mendoza",
        contactPhone: "04263359122",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:07.710Z"
    },
    {
        id: "scraped-40",
        name: "Fabiola Partidas",
        age: 33,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Edificio Carabamar, Calle Terapaima, Urb. Caribe, Caraballeda",
        address: "Edificio Carabamar, Calle Terapaima, Urb. Caribe, Caraballeda",
        description: "Franela blanca. Email contacto: diiegosoosa@hotmail.com",
        contactName: "Diego",
        contactPhone: "+19173021995",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:07.386Z"
    },
    {
        id: "scraped-41",
        name: "Raúl Serrano ochoa",
        age: 40,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Caribe los coco oppe 22B",
        address: "Caribe los coco oppe 22B",
        description: "Cédula: 19305362. Chor y camisa. Email contacto: leyniserrano730@gmail.com",
        contactName: "Leyni",
        contactPhone: "17736995118",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:05.325Z"
    },
    {
        id: "scraped-42",
        name: "Clemencia virginia Rodríguez",
        age: 26,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La guaira",
        address: "La guaira",
        description: "Cédula: V27073441. Email contacto: dalianarc1306@gmail.com",
        contactName: "Daliana",
        contactPhone: "04129499143",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:02.935Z"
    },
    {
        id: "scraped-43",
        name: "Lisney Camargo",
        age: 24,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La guaira",
        address: "La guaira",
        description: "Cédula: V30920749. Email contacto: santiagoreatiga2@gmail.com",
        contactName: "Nidia",
        contactPhone: "04161306891",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:38:02.569Z"
    },
    {
        id: "scraped-44",
        name: "Francis Mujica",
        age: 0,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "El Junquito",
        address: "El Junquito",
        description: "Email contacto: 1aaura.gon1@gmail.com",
        contactName: "Tatiana González",
        contactPhone: "+57 3178404995",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:37:56.721Z"
    },
    {
        id: "scraped-45",
        name: "Alberto Ramos",
        age: 45,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Naiguata",
        address: "Naiguata",
        description: "Estaban en los tambores de Naiguata. Email contacto: velasquezmorelis17@gmail.com",
        contactName: "Morelis",
        contactPhone: "04265529867",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:37:54.741Z"
    },
    {
        id: "scraped-46",
        name: "Adriana Sandoval",
        age: 0,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "SE ENCUENTRA EN EL HOSPITAL PEREZ CARREÑO DE LA GUAIRA",
        address: "SE ENCUENTRA EN EL HOSPITAL PEREZ CARREÑO DE LA GUAIRA",
        description: "Cédula: 3431887. Email contacto: flaviabriceno28@gmail.com",
        contactName: "Flavia",
        contactPhone: "+5804247367679",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:37:54.435Z"
    },
    {
        id: "scraped-47",
        name: "Grisel Soto",
        age: 60,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "Naiguata",
        address: "Naiguata",
        description: "Email contacto: eduard.perezsoto@gmail.com",
        contactName: "Eduard Soto",
        contactPhone: "+58 424-8270033",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:37:53.397Z"
    },
    {
        id: "scraped-48",
        name: "Ronald David Gutiérrez Mora",
        age: 20,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira",
        address: "La Guaira",
        description: "Cédula: 31381431. Deportivo. Email contacto: jb3763222@gmail.com",
        contactName: "Fernando Mora",
        contactPhone: "04144009097",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:37:52.909Z"
    },
    {
        id: "scraped-49",
        name: "Alejandro Lobo",
        age: 52,
        gender: "Masculino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La Guaira",
        address: "La Guaira",
        description: "Cédula: V-10.717.433. Indeterminado. Email contacto: rubenomc@gmail.com",
        contactName: "Rubén Lobo",
        contactPhone: "+584143744753",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:37:52.246Z"
    },
    {
        id: "scraped-50",
        name: "Carmen Virginia Gonzalez de donande",
        age: 77,
        gender: "Femenino",
        status: "Desaparecido",
        state: "La Guaira",
        city: "La guaira",
        address: "La guaira",
        description: "Cédula: 3888464. Email contacto: luzbeidy@gmail.com",
        contactName: "Luz Balza",
        contactPhone: "4143221979",
        photo: null, // Silueta limpia corporativa
        isExample: false,
        createdAt: "2026-06-25T15:37:51.768Z"
    }
];

// Mensajes semilla para el foro/chat comunitario
const SEED_CHAT = [
    {
        id: "chat-seed-1",
        username: "Luis Silva",
        message: "Se abrieron refugios en el Polideportivo de Cumaná. Hay agua potable, alimentos básicos y asistencia médica primaria disponible.",
        role: "Voluntario",
        time: "Hace 10 min"
    },
    {
        id: "chat-seed-2",
        username: "Patricia Rojas",
        message: "¿Alguien sabe cómo está el paso o la vía hacia Carúpano? Buscamos noticias urgentes de familiares en el sector El Muelle.",
        role: "Familiar",
        time: "Hace 8 min"
    },
    {
        id: "chat-seed-3",
        username: "Coordinador PC",
        message: "Por favor, mantengan los reportes enfocados en emergencias. Si ven a alguien registrado en las tarjetas de búsqueda, reporten directamente al número indicado en la ficha.",
        role: "Moderador",
        time: "Hace 5 min"
    },
    {
        id: "chat-seed-4",
        username: "Dr. Carlos Meneses",
        message: "Cruz Roja Venezolana ya se encuentra desplegada en la Av. Bermúdez prestando primeros auxilios. Si la señal es débil, favor enviar SMS.",
        role: "Rescatista",
        time: "Hace 2 min"
    }
];

// Comentarios simulados dinámicos
const MOCK_LIVE_MESSAGES = [
    { username: "Juan Pérez", message: "En el Hospital Central de Cumaná están solicitando donantes de sangre O negativo.", role: "Voluntario" },
    { username: "Sonia G.", message: "¡Confirmado! La autopista hacia el oriente tiene paso restringido por escombros, viajen con precaución.", role: "Voluntario" },
    { username: "Raúl C.", message: "Protección Civil habilitó una carpa de enlace satelital para llamadas cortas en la Plaza Bolívar.", role: "Rescatista" },
    { username: "María Auxiliadora", message: "Gracias a Dios pudimos localizar a mi abuela en Carúpano. Estaba en casa de unos vecinos.", role: "Familiar" }
];

// Inicialización del DOM y carga de datos
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    renderChat();
    startLiveSimulation();
    
    // Carga de datos asíncrona
    initData().then(() => {
        renderStats();
        renderCards();
    });
});

// Carga base de datos de localStorage o inyecta semilla si está vacía
function mapLocationToState(loc) {
    if (!loc) return "Vargas / La Guaira";
    const l = loc.toLowerCase();
    if (l.includes("guaira") || l.includes("catia la mar") || l.includes("macuto") || 
        l.includes("maiquetia") || l.includes("caraballeda") || l.includes("naiguata") || 
        l.includes("carayaca") || l.includes("los corales") || l.includes("tanaguarenas") || 
        l.includes("carallaca")) {
        return "Vargas / La Guaira";
    }
    if (l.includes("caracas") || l.includes("valle") || l.includes("chacao") || 
        l.includes("baruta") || l.includes("petare") || l.includes("perez carreño") || 
        l.includes("yaguara") || l.includes("capital")) {
        return "Distrito Capital";
    }
    if (l.includes("cumaná") || l.includes("carúpano") || l.includes("bermúdez") || 
        l.includes("sucre")) {
        return "Sucre";
    }
    if (l.includes("miranda") || l.includes("los teques") || l.includes("guarenas") || 
        l.includes("guatire")) {
        return "Miranda";
    }
    if (l.includes("aragua") || l.includes("maracay") || l.includes("turmero")) {
        return "Aragua";
    }
    if (l.includes("zulia") || l.includes("maracaibo")) {
        return "Zulia";
    }
    if (l.includes("carabobo") || l.includes("valencia")) {
        return "Carabobo";
    }
    if (l.includes("lara") || l.includes("barquisimeto")) {
        return "Lara";
    }
    return "Vargas / La Guaira";
}

function mapItemToStateFormat(item) {
    let mappedStatus = "Desaparecido";
    if (item.estado === 'localizado') {
        mappedStatus = "Localizado a Salvo";
    }
    return {
        id: item.id || ('scraped-' + Math.random()),
        name: item.nombre || "Persona sin nombre",
        age: (item.edad !== null && item.edad !== undefined) ? item.edad : 0,
        gender: "No especificado",
        status: mappedStatus,
        state: mapLocationToState(item.ubicacion),
        city: item.ubicacion || "No especificada",
        address: item.descripcion || "No especificada",
        description: item.descripcion || "",
        contactName: item.contacto ? "Familiar / Contacto" : "No especificado",
        contactPhone: item.contacto || "No especificado",
        photo: item.foto || null,
        isExample: false,
        createdAt: (() => {
            if (item.createdAt) {
                try {
                    const d = new Date(item.createdAt);
                    if (!isNaN(d.getTime())) return d.toISOString();
                } catch(e) {}
            }
            return new Date().toISOString();
        })()
    };
}

async function loadFullDatabaseInBackground(userEntries) {
    try {
        const response = await fetch('scraped_persons_all.json');
        if (response.ok) {
            const data = await response.json();
            const items = data.items || [];
            const apiEntries = items.map(mapItemToStateFormat);
            
            // Combinar y deduplicar manteniendo prioridad para registros locales
            const merged = [...userEntries];
            
            const existingIds = new Set(merged.map(p => p.id));
            apiEntries.forEach(item => {
                if (!existingIds.has(item.id)) {
                    merged.push(item);
                    existingIds.add(item.id);
                }
            });
            
            appState.persons = merged;
            console.log(`Base de datos completa cargada en segundo plano: ${appState.persons.length} registros.`);
            
            // Renderizar de nuevo silenciosamente
            renderStats();
            renderCards();
        }
    } catch(e) {
        console.error("Error al cargar la base de datos completa en segundo plano:", e);
    }
}

async function initData() {
    const grid = document.getElementById('cards-grid');
    if (grid) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 10px;"></i><p>Cargando base de datos...</p></div>';
    }

    // 1. Cargar registros creados o modificados por el usuario desde localStorage
    let userEntries = [];
    const stored = localStorage.getItem('rescate_ve_user_persons');
    if (stored) {
        try {
            userEntries = JSON.parse(stored);
        } catch(e) {
            console.error("Error parsing user persons from localStorage:", e);
        }
    } else {
        // Migración de datos viejos si los hubiera
        const oldStored = localStorage.getItem('rescate_ve_persons');
        if (oldStored) {
            try {
                const parsed = JSON.parse(oldStored);
                userEntries = parsed.filter(p => p.id && (String(p.id).startsWith('user-') || p.isModified));
                // Guardar en el nuevo formato y limpiar el viejo
                localStorage.setItem('rescate_ve_user_persons', JSON.stringify(userEntries));
                localStorage.removeItem('rescate_ve_persons');
            } catch(e) {}
        }
    }

    // 2. Cargar base de datos rápida mini de 200 items (para velocidad instantánea)
    let apiEntries = [];
    try {
        const response = await fetch('scraped_persons_mini.json');
        if (response.ok) {
            const data = await response.json();
            const items = data.items || [];
            apiEntries = items.map(mapItemToStateFormat);
            console.log(`Cargada base de datos instantánea (Mini): ${apiEntries.length} registros.`);
        } else {
            apiEntries = SEED_DATA.filter(p => !p.isExample);
        }
    } catch (e) {
        console.error("Error al conectar con la base de datos mini:", e);
        apiEntries = SEED_DATA.filter(p => !p.isExample);
    }

    // Combinar mini con locales/modificados
    const merged = [...userEntries];
    const existingIds = new Set(merged.map(p => p.id));
    apiEntries.forEach(item => {
        if (!existingIds.has(item.id)) {
            merged.push(item);
            existingIds.add(item.id);
        }
    });

    appState.persons = merged;

    // 3. Cargar base de datos de chat
    const storedChat = localStorage.getItem('rescate_ve_chat');
    if (storedChat) {
        try {
            appState.chatMessages = JSON.parse(storedChat);
        } catch (e) {
            appState.chatMessages = [...SEED_CHAT];
        }
    } else {
        appState.chatMessages = [...SEED_CHAT];
        saveChatToLocalStorage();
    }

    // 4. Iniciar descarga de base de datos completa en segundo plano
    loadFullDatabaseInBackground(userEntries);
}

function savePersonsToLocalStorage() {
    try {
        const saveableEntries = appState.persons.filter(p => 
            p.id && (String(p.id).startsWith('user-') || p.isModified)
        );
        localStorage.setItem('rescate_ve_user_persons', JSON.stringify(saveableEntries));
    } catch(e) {
        console.error("Error saving user persons to localStorage:", e);
    }
}

function saveChatToLocalStorage() {
    localStorage.setItem('rescate_ve_chat', JSON.stringify(appState.chatMessages));
}

// Configura todos los manejadores de eventos
function initEventListeners() {
    const btnOpenRegister = document.getElementById('btn-open-register');
    const btnCloseRegister = document.getElementById('btn-close-register');
    const btnCancelRegister = document.getElementById('btn-cancel-register');
    const modalRegister = document.getElementById('modal-register');
    const registerForm = document.getElementById('register-form');
    
    const searchInput = document.getElementById('search-input');
    const filterState = document.getElementById('filter-state');
    const filterStatus = document.getElementById('filter-status');
    const btnClearFilters = document.getElementById('btn-clear-filters');
    const btnEmptyRegister = document.getElementById('btn-empty-register');
    
    const photoDragArea = document.getElementById('photo-drag-area');
    const photoInput = document.getElementById('photo-input');
    const btnRemovePhoto = document.getElementById('btn-remove-photo');
    
    const chatForm = document.getElementById('chat-form');

    // Modales: Abrir / Cerrar
    btnOpenRegister.addEventListener('click', () => openModal(modalRegister));
    btnEmptyRegister.addEventListener('click', () => openModal(modalRegister));
    
    const closeModalElements = [btnCloseRegister, btnCancelRegister, modalRegister];
    closeModalElements.forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target === modalRegister || el !== modalRegister) {
                closeModal(modalRegister);
            }
        });
    });

    // Búsqueda y Filtros
    searchInput.addEventListener('input', (e) => {
        appState.filters.search = e.target.value.toLowerCase().trim();
        appState.visibleCount = 24;
        renderCards();
    });

    filterState.addEventListener('change', (e) => {
        appState.filters.state = e.target.value;
        appState.visibleCount = 24;
        renderCards();
    });

    filterStatus.addEventListener('change', (e) => {
        appState.filters.status = e.target.value;
        appState.visibleCount = 24;
        updateActiveStatCard();
        renderCards();
    });

    btnClearFilters.addEventListener('click', () => {
        searchInput.value = '';
        filterState.value = '';
        filterStatus.value = '';
        appState.filters = { search: '', state: '', status: '' };
        appState.visibleCount = 24;
        updateActiveStatCard();
        renderCards();
    });

    // Manejo de carga de imagen (Drag and Drop / Clic)
    photoDragArea.addEventListener('click', () => photoInput.click());
    
    photoDragArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoDragArea.classList.add('active');
    });

    photoDragArea.addEventListener('dragleave', () => {
        photoDragArea.classList.remove('active');
    });

    photoDragArea.addEventListener('drop', (e) => {
        e.preventDefault();
        photoDragArea.classList.remove('active');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processImageFile(e.dataTransfer.files[0]);
        }
    });

    photoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            processImageFile(e.target.files[0]);
        }
    });

    btnRemovePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        resetPhotoUpload();
    });

    // Formulario de Registro (Submit)
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitRegistration();
    });

    // Formulario de Chat (Submit)
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitChatMessage();
    });

    // Modal de Privacidad y Descargo
    const btnOpenPrivacy = document.getElementById('btn-open-privacy');
    const modalPrivacy = document.getElementById('modal-privacy');
    const btnClosePrivacy = document.getElementById('btn-close-privacy');

    if (btnOpenPrivacy && modalPrivacy && btnClosePrivacy) {
        btnOpenPrivacy.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(modalPrivacy);
        });
        btnClosePrivacy.addEventListener('click', () => closeModal(modalPrivacy));
        modalPrivacy.addEventListener('click', (e) => {
            if (e.target === modalPrivacy) {
                closeModal(modalPrivacy);
            }
        });
    }

    // Filtros interactivos de Tarjetas de Estadísticas (Stats Cards)
    const statCards = [
        { selector: '.stat-card.stat-total', value: '' },
        { selector: '.stat-card.stat-missing', value: 'Desaparecido' },
        { selector: '.stat-card.stat-hospitalized', value: 'Hospitalizado' },
        { selector: '.stat-card.stat-safe', value: 'Localizado a Salvo' },
        { selector: '.stat-card.stat-deceased', value: 'Fallecido' }
    ];

    statCards.forEach(item => {
        const el = document.querySelector(item.selector);
        if (el) {
            el.addEventListener('click', () => {
                appState.filters.status = item.value;
                document.getElementById('filter-status').value = item.value;
                appState.visibleCount = 24;
                updateActiveStatCard();
                renderCards();
            });
        }
    });

    // Helper para cambiar pestañas y sincronizar botones de Desktop y Mobile
    function selectTab(tabName) {
        if (appState.activeTab !== tabName) {
            appState.activeTab = tabName;
            appState.visibleCount = 24;
            
            const tabWithPhotos = document.getElementById('tab-with-photos');
            const tabWithoutPhotos = document.getElementById('tab-without-photos');
            const mobileTabWith = document.getElementById('mobile-tab-with-photos');
            const mobileTabWithout = document.getElementById('mobile-tab-without-photos');

            if (tabName === 'with-photos') {
                if (tabWithPhotos) tabWithPhotos.classList.add('active');
                if (tabWithoutPhotos) tabWithoutPhotos.classList.remove('active');
                if (mobileTabWith) mobileTabWith.classList.add('active');
                if (mobileTabWithout) mobileTabWithout.classList.remove('active');
            } else {
                if (tabWithoutPhotos) tabWithoutPhotos.classList.add('active');
                if (tabWithPhotos) tabWithPhotos.classList.remove('active');
                if (mobileTabWithout) mobileTabWithout.classList.add('active');
                if (mobileTabWith) mobileTabWith.classList.remove('active');
            }
            renderCards();
        }
    }

    // Pestañas (Tabs) de Escritorio (Desktop)
    const tabWithPhotos = document.getElementById('tab-with-photos');
    const tabWithoutPhotos = document.getElementById('tab-without-photos');

    if (tabWithPhotos && tabWithoutPhotos) {
        tabWithPhotos.addEventListener('click', () => selectTab('with-photos'));
        tabWithoutPhotos.addEventListener('click', () => selectTab('without-photos'));
    }

    // Pestañas (Tabs) Móviles (Mobile Bottom Nav)
    const mobileTabWith = document.getElementById('mobile-tab-with-photos');
    const mobileTabWithout = document.getElementById('mobile-tab-without-photos');
    const mobileTabRegister = document.getElementById('mobile-tab-register');
    const mobileTabChat = document.getElementById('mobile-tab-chat');

    if (mobileTabWith) mobileTabWith.addEventListener('click', () => selectTab('with-photos'));
    if (mobileTabWithout) mobileTabWithout.addEventListener('click', () => selectTab('without-photos'));
    
    if (mobileTabRegister) {
        mobileTabRegister.addEventListener('click', () => {
            const modalRegister = document.getElementById('modal-register');
            if (modalRegister) openModal(modalRegister);
        });
    }

    if (mobileTabChat) {
        mobileTabChat.addEventListener('click', () => {
            const forumAnchor = document.getElementById('forum-anchor');
            if (forumAnchor) {
                forumAnchor.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Modal de Actualizar Foto
    const btnCancelUpdatePhoto = document.getElementById('btn-cancel-update-photo');
    const btnCloseUpdatePhoto = document.getElementById('btn-close-update-photo');
    const modalUpdatePhoto = document.getElementById('modal-update-photo');
    const updatePhotoForm = document.getElementById('update-photo-form');
    
    const updatePhotoDragArea = document.getElementById('update-photo-drag-area');
    const updatePhotoInput = document.getElementById('update-photo-input');
    const btnRemoveUpdatePhoto = document.getElementById('btn-remove-update-photo');

    if (modalUpdatePhoto) {
        const closeUpdateModalElements = [btnCancelUpdatePhoto, btnCloseUpdatePhoto, modalUpdatePhoto];
        closeUpdateModalElements.forEach(el => {
            if (el) {
                el.addEventListener('click', (e) => {
                    if (e.target === modalUpdatePhoto || el !== modalUpdatePhoto) {
                        closeModal(modalUpdatePhoto);
                    }
                });
            }
        });

        if (updatePhotoDragArea && updatePhotoInput) {
            updatePhotoDragArea.addEventListener('click', () => updatePhotoInput.click());
            
            updatePhotoDragArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                updatePhotoDragArea.classList.add('active');
            });

            updatePhotoDragArea.addEventListener('dragleave', () => {
                updatePhotoDragArea.classList.remove('active');
            });

            updatePhotoDragArea.addEventListener('drop', (e) => {
                e.preventDefault();
                updatePhotoDragArea.classList.remove('active');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processUpdateImageFile(e.dataTransfer.files[0]);
                }
            });

            updatePhotoInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    processUpdateImageFile(e.target.files[0]);
                }
            });
        }

        if (btnRemoveUpdatePhoto) {
            btnRemoveUpdatePhoto.addEventListener('click', (e) => {
                e.stopPropagation();
                resetUpdatePhotoUpload();
            });
        }

        if (updatePhotoForm) {
            updatePhotoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                submitUpdatePhoto();
            });
        }
    }
}

/**
 * Procesa la imagen cargada por el usuario:
 * 1. La escala a formato cuadrado de 300x300.
 * 2. Realiza una verificación de píxeles roja extrema (Filtro anti-gore/sangre).
 * 3. Simula la validación de rostro y seguridad con inteligencia de moderación.
 */
function processImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor carga una imagen válida.');
        return;
    }

    // Activar overlays y loader
    const scanningOverlay = document.getElementById('photo-scanning-overlay');
    const scanStatusText = document.getElementById('scan-status-text');
    const alertBox = document.getElementById('scan-alert-box');
    
    scanningOverlay.classList.remove('hidden');
    alertBox.classList.add('hidden');
    appState.photoValidationStatus = 'pending';
    scanStatusText.innerText = "Escaneando imagen con IA de Moderación...";

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const targetSize = 300;
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');

            let srcX = 0;
            let srcY = 0;
            let srcSize = Math.min(img.width, img.height);

            if (img.width > img.height) {
                srcX = (img.width - img.height) / 2;
            } else {
                srcY = (img.height - img.width) / 2;
            }

            ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, targetSize, targetSize);

            // ANÁLISIS DE PÍXELES (Filtro de seguridad de contenido Gore/Sangre)
            const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
            const data = imgData.data;
            let redPixels = 0;
            let totalPixels = data.length / 4;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                // Detectar píxeles rojos de alta saturación (sangre/heridas)
                if (r > 165 && g < 75 && b < 75) {
                    redPixels++;
                }
            }

            const redRatio = redPixels / totalPixels;
            // Umbral de tolerancia de color rojo concentrado: 3.5%
            const hasGoreTone = redRatio > 0.035; 

            // Simular retraso de procesamiento para dar robustez visual (1.5 segundos)
            setTimeout(() => {
                scanningOverlay.classList.add('hidden');
                
                if (hasGoreTone) {
                    // Rechazar imagen por posible contenido inapropiado o violento
                    appState.photoValidationStatus = 'failed';
                    appState.currentPhotoBase64 = null;
                    
                    showModerationAlert(
                        false, 
                        "✗ Fotografía Rechazada: Se detectaron tonos de rojo incompatibles (indicios de heridas explícitas/sangre). Por seguridad de la plataforma, suba una foto tipo carné limpia."
                    );
                } else {
                    // Validar foto correctamente
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    appState.currentPhotoBase64 = compressedBase64;
                    appState.photoValidationStatus = 'verified';

                    const photoPreview = document.getElementById('photo-preview');
                    const previewContainer = document.getElementById('photo-preview-container');
                    const placeholder = document.getElementById('upload-placeholder');
                    
                    photoPreview.src = compressedBase64;
                    previewContainer.classList.remove('hidden');
                    placeholder.classList.add('hidden');

                    showModerationAlert(
                        true, 
                        "✓ Foto Verificada: Rostro detectado y contenido apto para visualización pública."
                    );
                }
            }, 1500);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Muestra el cartel de estado del análisis
function showModerationAlert(success, message) {
    const alertBox = document.getElementById('scan-alert-box');
    const alertIcon = document.getElementById('scan-alert-icon');
    const alertMessage = document.getElementById('scan-alert-message');

    alertBox.classList.remove('hidden', 'scan-alert-success', 'scan-alert-error');
    
    if (success) {
        alertBox.classList.add('scan-alert-success');
        alertIcon.className = "fa-solid fa-circle-check text-green";
    } else {
        alertBox.classList.add('scan-alert-error');
        alertIcon.className = "fa-solid fa-circle-xmark text-red";
    }
    
    alertMessage.innerText = message;
}

// Resetea el cargador de fotos
function resetPhotoUpload() {
    appState.currentPhotoBase64 = null;
    appState.photoValidationStatus = null;
    document.getElementById('photo-input').value = '';
    document.getElementById('photo-preview').src = '';
    document.getElementById('photo-preview-container').classList.add('hidden');
    document.getElementById('upload-placeholder').classList.remove('hidden');
    document.getElementById('scan-alert-box').classList.add('hidden');
}

// Abrir modal
function openModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function closeModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    
    if (modal.id === 'modal-register') {
        document.getElementById('register-form').reset();
        resetPhotoUpload();
    }
}

// Registrar familiar
function submitRegistration() {
    if (!appState.currentPhotoBase64) {
        alert('Por favor carga una fotografía de la persona para poder registrarla.');
        return;
    }

    if (appState.photoValidationStatus !== 'verified') {
        alert('La fotografía cargada no ha pasado la verificación de seguridad obligatoria.');
        return;
    }

    const name = document.getElementById('reg-name').value.trim();
    const age = parseInt(document.getElementById('reg-age').value);
    const gender = document.getElementById('reg-gender').value;
    const status = document.getElementById('reg-status').value;
    const state = document.getElementById('reg-state').value;
    const city = document.getElementById('reg-city').value.trim();
    const address = document.getElementById('reg-address').value.trim();
    const description = document.getElementById('reg-description').value.trim();
    const contactName = document.getElementById('reg-contact-name').value.trim();
    const contactPhone = document.getElementById('reg-contact-phone').value.trim();

    const newPerson = {
        id: 'user-' + Date.now(),
        name,
        age,
        gender,
        status,
        state,
        city,
        address,
        description,
        contactName,
        contactPhone,
        photo: appState.currentPhotoBase64,
        isExample: false,
        createdAt: new Date().toISOString()
    };

    appState.persons.unshift(newPerson);
    savePersonsToLocalStorage();
    
    closeModal(document.getElementById('modal-register'));
    renderStats();
    renderCards();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Enviar chat
function submitChatMessage() {
    const usernameInput = document.getElementById('chat-username');
    const messageInput = document.getElementById('chat-message');
    
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();

    if (!username || !message) return;

    const newMsg = {
        id: 'chat-' + Date.now(),
        username,
        message,
        role: "Familiar",
        time: "Ahora"
    };

    appState.chatMessages.push(newMsg);
    saveChatToLocalStorage();
    renderChat();
    
    messageInput.value = '';
    messageInput.focus();
}

// Helper to update active card highlight
function updateActiveStatCard() {
    const cards = {
        '': document.querySelector('.stat-card.stat-total'),
        'Desaparecido': document.querySelector('.stat-card.stat-missing'),
        'Hospitalizado': document.querySelector('.stat-card.stat-hospitalized'),
        'Localizado a Salvo': document.querySelector('.stat-card.stat-safe'),
        'Fallecido': document.querySelector('.stat-card.stat-deceased')
    };
    
    Object.values(cards).forEach(c => {
        if (c) c.classList.remove('active');
    });
    
    const activeCard = cards[appState.filters.status];
    if (activeCard) {
        activeCard.classList.add('active');
    }
}

// Render stats
function renderStats() {
    const total = appState.persons.length;
    const missing = appState.persons.filter(p => p.status === 'Desaparecido').length;
    const hospitalized = appState.persons.filter(p => p.status === 'Hospitalizado').length;
    const safe = appState.persons.filter(p => p.status === 'Localizado a Salvo').length;
    const deceased = appState.persons.filter(p => p.status === 'Fallecido').length;

    document.getElementById('stat-total-val').innerText = total;
    document.getElementById('stat-missing-val').innerText = missing;
    document.getElementById('stat-hospitalized-val').innerText = hospitalized;
    document.getElementById('stat-safe-val').innerText = safe;
    const deceasedEl = document.getElementById('stat-deceased-val');
    if (deceasedEl) deceasedEl.innerText = deceased;
    
    updateActiveStatCard();
}

// Render cards
function renderCards() {
    const grid = document.getElementById('cards-grid');
    const emptyState = document.getElementById('empty-state');
    const resultsCountText = document.getElementById('results-count-text');
    
    grid.innerHTML = '';

    const filtered = appState.persons.filter(person => {
        // Filtro por pestaña activa
        const hasPhoto = person.photo !== null && person.photo !== "";
        if (appState.activeTab === 'with-photos' && !hasPhoto) return false;
        if (appState.activeTab === 'without-photos' && hasPhoto) return false;

        const matchesSearch = !appState.filters.search || 
            person.name.toLowerCase().includes(appState.filters.search) ||
            person.city.toLowerCase().includes(appState.filters.search) ||
            person.state.toLowerCase().includes(appState.filters.search) ||
            person.address.toLowerCase().includes(appState.filters.search) ||
            (person.description && person.description.toLowerCase().includes(appState.filters.search));

        const matchesState = !appState.filters.state || person.state === appState.filters.state;
        const matchesStatus = !appState.filters.status || person.status === appState.filters.status;

        return matchesSearch && matchesState && matchesStatus;
    });

    // Paginación progresiva
    const sliced = filtered.slice(0, appState.visibleCount);
    resultsCountText.innerText = `Mostrando ${sliced.length} de ${filtered.length} registros`;

    if (sliced.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        
        const pagContainer = document.getElementById('pagination-container');
        if (pagContainer) pagContainer.innerHTML = '';
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    sliced.forEach(person => {
        const card = document.createElement('article');
        card.className = 'person-card';

        let badgeClass = 'status-desaparecido';
        if (person.status === 'Hospitalizado') badgeClass = 'status-hospitalizado';
        if (person.status === 'Localizado a Salvo') badgeClass = 'status-safe';
        if (person.status === 'Fallecido') badgeClass = 'status-fallecido';

        let photoAreaHtml = '';
        if (person.photo) {
            photoAreaHtml = `<img src="${person.photo}" alt="${person.name}">`;
        } else {
            photoAreaHtml = `
                <div class="no-photo-warning-box">
                    <i class="fa-solid fa-circle-user avatar-placeholder-icon"></i>
                    <div class="warning-title">⚠️ FOTO NO DISPONIBLE EN ORIGEN</div>
                    <p class="warning-text">Por favor, si eres familiar de esta persona, sube su foto real haciendo clic abajo o contáctanos.</p>
                    <button class="btn btn-primary btn-upload-real-photo" data-id="${person.id}">
                        <i class="fa-solid fa-upload"></i> Subir Foto Real
                    </button>
                </div>
            `;
        }

        card.innerHTML = `
            ${person.isExample ? `
            <div class="card-example-banner">
                <i class="fa-solid fa-triangle-exclamation"></i> EJEMPLO (FOTO DE IA)
            </div>` : ''}
            <div class="card-header-photo">
                <span class="status-badge ${badgeClass}">${person.status}</span>
                ${photoAreaHtml}
            </div>
            <div class="card-body">
                <h3>${person.name}</h3>
                <ul class="card-details-list">
                    <li>
                        <i class="fa-solid fa-cake-candles"></i>
                        <span class="detail-label">Edad:</span>
                        <span class="detail-val">${person.age > 0 ? person.age + ' años' : 'No especificada'} (${person.gender || 'No especificado'})</span>
                    </li>
                    <li>
                        <i class="fa-solid fa-location-dot"></i>
                        <span class="detail-label">Ubicación:</span>
                        <span class="detail-val">${person.city}, Edo. ${person.state}</span>
                    </li>
                    <li>
                        <i class="fa-solid fa-eye"></i>
                        <span class="detail-label">Último contacto:</span>
                        <span class="detail-val">${person.address}</span>
                    </li>
                    ${person.description ? `
                    <li class="card-description">
                        <i class="fa-solid fa-circle-info"></i>
                        <span class="detail-val">${person.description}</span>
                    </li>
                    ` : ''}
                    <li style="margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                        <i class="fa-solid fa-phone"></i>
                        <span class="detail-label">Contacto:</span>
                        <span class="detail-val">${person.contactName} (${person.contactPhone})</span>
                    </li>
                </ul>
                <div class="card-footer-actions">
                    <button class="btn btn-secondary btn-share-text" title="Copiar texto para WhatsApp/Redes">
                        <i class="fa-regular fa-clipboard"></i> Compartir
                    </button>
                    <button class="btn btn-primary btn-download-poster" title="Descargar cartel de búsqueda como imagen">
                        <i class="fa-solid fa-download"></i> Descargar
                    </button>
                </div>
            </div>
        `;

        card.querySelector('.btn-share-text').addEventListener('click', (e) => {
            copySocialText(person, e.currentTarget);
        });

        card.querySelector('.btn-download-poster').addEventListener('click', (e) => {
            downloadPoster(person, e.currentTarget);
        });

        const btnUpload = card.querySelector('.btn-upload-real-photo');
        if (btnUpload) {
            btnUpload.addEventListener('click', (e) => {
                const personId = e.currentTarget.getAttribute('data-id');
                openUpdatePhotoModal(personId);
            });
        }

        grid.appendChild(card);
    });

    // Renderizar botón de "Cargar más" si quedan elementos
    let pagContainer = document.getElementById('pagination-container');
    if (!pagContainer) {
        pagContainer = document.createElement('div');
        pagContainer.id = 'pagination-container';
        pagContainer.className = 'pagination-container';
        grid.parentNode.insertBefore(pagContainer, grid.nextSibling);
    }

    if (filtered.length > appState.visibleCount) {
        pagContainer.innerHTML = `
            <button class="btn btn-load-more" id="btn-load-more">
                <i class="fa-solid fa-angles-down"></i> Cargar más personas (${filtered.length - appState.visibleCount} restantes)
            </button>
        `;
        document.getElementById('btn-load-more').addEventListener('click', () => {
            appState.visibleCount += 24;
            renderCards();
        });
    } else {
        pagContainer.innerHTML = '';
    }
}

// Render chat
function renderChat() {
    const container = document.getElementById('chat-messages-container');
    container.innerHTML = '';

    appState.chatMessages.forEach(msg => {
        const item = document.createElement('div');
        item.className = 'chat-message-item';
        
        const initial = msg.username.charAt(0).toUpperCase();

        let badgeHTML = '';
        let badgeClass = '';
        if (msg.role === 'Moderador') badgeClass = 'badge-mod';
        if (msg.role === 'Rescatista') badgeClass = 'badge-rescuer';
        if (msg.role === 'Familiar') badgeClass = 'badge-family';

        if (msg.role) {
            badgeHTML = `<span class="chat-user-badge ${badgeClass}">${msg.role}</span>`;
        }

        item.innerHTML = `
            <div class="chat-avatar">${initial}</div>
            <div class="chat-msg-body">
                <div class="chat-msg-header">
                    <div>
                        <span class="chat-user-name">${msg.username}</span>
                        ${badgeHTML}
                    </div>
                    <span class="chat-msg-time">${msg.time || 'Ahora'}</span>
                </div>
                <p class="chat-msg-text">${msg.message}</p>
            </div>
        `;
        container.appendChild(item);
    });

    container.scrollTop = container.scrollHeight;
}

// Live simulation
function startLiveSimulation() {
    const usersCountEl = document.getElementById('online-users-count');

    setInterval(() => {
        const baseUsers = 135;
        const variation = Math.floor(Math.random() * 21) - 10;
        usersCountEl.innerText = baseUsers + variation;
    }, 10000);

    let mockIndex = 0;
    setInterval(() => {
        if (mockIndex >= MOCK_LIVE_MESSAGES.length) return;
        
        const mockData = MOCK_LIVE_MESSAGES[mockIndex];
        const newMsg = {
            id: 'chat-mock-' + Date.now(),
            username: mockData.username,
            message: mockData.message,
            role: mockData.role,
            time: "Ahora"
        };
        
        appState.chatMessages.push(newMsg);
        if (appState.chatMessages.length > 15) {
            appState.chatMessages.shift();
        }
        
        renderChat();
        mockIndex++;
    }, 45000);
}

// Variable global temporal para foto a actualizar
let updatePhotoState = {
    currentPhotoBase64: null,
    photoValidationStatus: null
};

// Abrir modal de actualizar foto
function openUpdatePhotoModal(personId) {
    const person = appState.persons.find(p => p.id === personId);
    if (!person) return;

    const modal = document.getElementById('modal-update-photo');
    const title = document.getElementById('update-photo-title');
    const hiddenId = document.getElementById('update-photo-person-id');

    title.innerText = `Subir Foto para: ${person.name}`;
    hiddenId.value = personId;

    resetUpdatePhotoUpload();
    openModal(modal);
}

// Resetea el área de carga del modal de actualizar foto
function resetUpdatePhotoUpload() {
    updatePhotoState.currentPhotoBase64 = null;
    updatePhotoState.photoValidationStatus = null;
    document.getElementById('update-photo-input').value = '';
    document.getElementById('update-photo-preview').src = '';
    document.getElementById('update-photo-preview-container').classList.add('hidden');
    document.getElementById('update-upload-placeholder').classList.remove('hidden');
    document.getElementById('update-scan-alert-box').classList.add('hidden');
    document.getElementById('update-photo-scanning-overlay').classList.add('hidden');
}

// Procesa el archivo de imagen para actualizar
function processUpdateImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor carga una imagen válida.');
        return;
    }

    const scanningOverlay = document.getElementById('update-photo-scanning-overlay');
    const scanStatusText = document.getElementById('update-scan-status-text');
    const alertBox = document.getElementById('update-scan-alert-box');

    scanningOverlay.classList.remove('hidden');
    alertBox.classList.add('hidden');
    updatePhotoState.photoValidationStatus = 'pending';
    scanStatusText.innerText = "Escaneando imagen con IA de Moderación...";

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const targetSize = 300;
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');

            let srcX = 0;
            let srcY = 0;
            let srcSize = Math.min(img.width, img.height);

            if (img.width > img.height) {
                srcX = (img.width - img.height) / 2;
            } else {
                srcY = (img.height - img.width) / 2;
            }

            ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, targetSize, targetSize);

            // ANÁLISIS DE PÍXELES (Filtro de seguridad de contenido Gore/Sangre)
            const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
            const data = imgData.data;
            let redPixels = 0;
            let totalPixels = data.length / 4;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                if (r > 165 && g < 75 && b < 75) {
                    redPixels++;
                }
            }

            const redRatio = redPixels / totalPixels;
            const hasGoreTone = redRatio > 0.035;

            setTimeout(() => {
                scanningOverlay.classList.add('hidden');

                if (hasGoreTone) {
                    updatePhotoState.photoValidationStatus = 'failed';
                    updatePhotoState.currentPhotoBase64 = null;
                    showUpdateModerationAlert(
                        false,
                        "✗ Fotografía Reclamada: Se detectaron tonos de rojo incompatibles (indicios de heridas/sangre). Sube una foto tipo carné limpia."
                    );
                } else {
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    updatePhotoState.currentPhotoBase64 = compressedBase64;
                    updatePhotoState.photoValidationStatus = 'verified';

                    const photoPreview = document.getElementById('update-photo-preview');
                    const previewContainer = document.getElementById('update-photo-preview-container');
                    const placeholder = document.getElementById('update-upload-placeholder');

                    photoPreview.src = compressedBase64;
                    previewContainer.classList.remove('hidden');
                    placeholder.classList.add('hidden');

                    showUpdateModerationAlert(
                        true,
                        "✓ Foto Verificada: Contenido apto para visualización pública."
                    );
                }
            }, 1500);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Muestra el cartel de estado del análisis en actualizar foto
function showUpdateModerationAlert(success, message) {
    const alertBox = document.getElementById('update-scan-alert-box');
    const alertIcon = document.getElementById('update-scan-alert-icon');
    const alertMessage = document.getElementById('update-scan-alert-message');

    alertBox.classList.remove('hidden', 'scan-alert-success', 'scan-alert-error');

    if (success) {
        alertBox.classList.add('scan-alert-success');
        alertIcon.className = "fa-solid fa-circle-check text-green";
    } else {
        alertBox.classList.add('scan-alert-error');
        alertIcon.className = "fa-solid fa-circle-xmark text-red";
    }

    alertMessage.innerText = message;
}

// Submit del formulario de actualización de foto
function submitUpdatePhoto() {
    const personId = document.getElementById('update-photo-person-id').value;
    if (!personId) return;

    if (!updatePhotoState.currentPhotoBase64) {
        alert('Por favor carga una fotografía de la persona.');
        return;
    }

    if (updatePhotoState.photoValidationStatus !== 'verified') {
        alert('La fotografía cargada no ha pasado la verificación de seguridad obligatoria.');
        return;
    }

    const person = appState.persons.find(p => p.id === personId);
    if (person) {
        person.photo = updatePhotoState.currentPhotoBase64;
        person.isModified = true;
        savePersonsToLocalStorage();
        closeModal(document.getElementById('modal-update-photo'));
        renderStats();
        renderCards();
    }
}
