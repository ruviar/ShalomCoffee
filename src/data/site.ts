export const site = {
  name: "shalom",
  descriptor: "speciality coffee",
  /** Grafia britanica, tal cual aparece en el rotulo del escaparate. No corregir. */
  legalName: "Shalom Speciality Coffee",
  tagline: "Café de especialidad en Zaragoza.",
  url: "https://shalomcoffee.es",

  address: {
    street: "C. Luces de la Ciudad, 21",
    /** Verificado contra la ficha de Google Business. No es 50018. */
    postalCode: "50019",
    city: "Zaragoza",
    region: "Aragón",
    country: "ES",
  },

  /**
   * Telefono de la ficha de Google Business. `href` va en formato E.164 para
   * que el marcador del movil no tenga que adivinar el prefijo; `display`
   * lleva la agrupacion con la que se lee en voz alta en España.
   */
  phone: {
    display: "608 71 42 25",
    href: "tel:+34608714225",
    e164: "+34608714225",
  },

  social: {
    instagram: {
      handle: "@shalomcoffee__",
      url: "https://www.instagram.com/shalomcoffee__/",
    },
  },

  rating: {
    value: 4.9,
    /** Formateado para es-ES. La coma decimal es intencional. */
    display: "4,9",
    best: 5,
    /**
     * Numero real de resenas en Google. Necesario para que el JSON-LD de
     * AggregateRating sea valido: Google descarta el bloque si falta.
     * Mientras sea null, el rating no se emite en datos estructurados.
     */
    count: null as number | null,
  },

  maps: {
    /** Embed sin clave de API. Consulta por direccion, no por coordenadas. */
    embed:
      "https://www.google.com/maps?q=Calle+Luces+de+la+Ciudad+21,+50019+Zaragoza&output=embed",
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=Calle+Luces+de+la+Ciudad+21+50019+Zaragoza",
  },
} as const;

export const fullAddress = `${site.address.street}, ${site.address.postalCode} ${site.address.city}`;
