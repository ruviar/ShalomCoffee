export type Review = {
  id: string;
  quote: string;
  author: string;
  context: string;
  /** Marca de contenido provisional. Ver aviso al principio del archivo. */
  placeholder: boolean;
};

/**
 * AVISO IMPORTANTE
 *
 * Estas entradas son PROVISIONALES. No son resenas reales de Google.
 * Se han escrito unicamente para dimensionar el componente y validar el layout.
 *
 * Antes de publicar hay que sustituirlas por el texto literal de resenas
 * reales de Google Maps, con el nombre tal como aparece en el perfil publico
 * de quien la escribio. Publicar testimonios inventados atribuidos a personas
 * es fabricar prueba social y no debe llegar a produccion.
 *
 * La puntuacion 4,9/5 de `site.rating` si es real.
 */
export const reviews: Review[] = [
  {
    id: "r1",
    quote: "¡Qué maravilla tener una cafetería así en el barrio! Personal súper amable y muy atento. ¿El café? Exquisito de especialidad.",
    author: "Guille Lomener",
    context: "Reseña en Google",
    placeholder: false,
  },
  {
    id: "r2",
    quote: "Hemos ido a desayunar y nos ha encantado!!! El ambiente super acogedor, los chicos muy amables y la comida riquísima.",
    author: "Clara",
    context: "Reseña en Google",
    placeholder: false,
  },
  {
    id: "r3",
    quote: "Café de 10. La única cafetería con café decente del barrio. Para repetir una y mil veces más. Atención de lujo.",
    author: "Carlos Colorado",
    context: "Reseña en Google",
    placeholder: false,
  },
];
