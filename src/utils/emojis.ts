// Mapeo de categoría -> emoji con su descripción
export const emojiPorCategoria: { emoji: string; descripcion: string; keywords: string[] }[] = [
    { emoji: "❤️", descripcion: "Amor",              keywords: ["amor"] },
    { emoji: "🎂", descripcion: "Cumpleaños",         keywords: ["cumpleaños", "cumple"] },
    { emoji: "🎉", descripcion: "Felicidades",        keywords: ["felicidades", "felicitacion", "felicitación"] },
    { emoji: "🥳", descripcion: "Celebración",        keywords: ["celebracion", "celebración", "fiesta"] },
    { emoji: "🏆", descripcion: "Logro",              keywords: ["logro", "logros"] },
    { emoji: "🌟", descripcion: "Reconocimiento",     keywords: ["reconocimiento"] },
    { emoji: "💐", descripcion: "Cariño",             keywords: ["cariño"] },
    { emoji: "🎁", descripcion: "Regalo",             keywords: ["regalo"] },
    { emoji: "✨", descripcion: "Especial",           keywords: ["especial"] },
    { emoji: "👏", descripcion: "Felicitación",       keywords: ["felicitacion", "felicitación"] },
    { emoji: "🙌", descripcion: "Alegría",            keywords: ["alegria", "alegría"] },
    { emoji: "🌹", descripcion: "Amor/afecto",        keywords: ["amor", "afecto"] },
];

// Emoji por defecto si ninguna keyword matchea
export const EMOJI_DEFAULT = { emoji: "🔖", descripcion: "General" };

// Quita tildes y pasa a minúsculas para comparar sin problemas
export function normalizar(texto: string): string {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

// Busca el primer emoji cuyo keyword aparezca dentro del nombre de la categoría
export function getEmojiPorCategoria(
    nombreCategoria: string
): { emoji: string; descripcion: string } {

    const nombreNormalizado = normalizar(nombreCategoria);

    const match = emojiPorCategoria.find(({ keywords }) =>
        keywords.some(
            (kw) => nombreNormalizado.includes(normalizar(kw))
        )
    );

    return match ?? EMOJI_DEFAULT;
}
