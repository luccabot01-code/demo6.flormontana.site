
export interface Theme {
    id: string;
    name: string;
    color: string; // Base HEX color (approx 500)
}

export const themes: Theme[] = [
    { id: 'rose', name: 'Classic Rose', color: '#f43f5e' },
    { id: 'burgundy', name: 'Burgundy', color: '#800020' },
    { id: 'marsala', name: 'Marsala', color: '#955251' },
    { id: 'blush', name: 'Blush Pink', color: '#ffb7c5' },
    { id: 'coral', name: 'Coral Reef', color: '#ff7f50' },
    { id: 'peach', name: 'Peach', color: '#ffcba4' },
    { id: 'terracotta', name: 'Terracotta', color: '#e2725b' },
    { id: 'dusty-rose', name: 'Dusty Rose', color: '#dcae96' },
    { id: 'sapphire', name: 'Sapphire Blue', color: '#0f52ba' },
    { id: 'navy', name: 'Navy Blue', color: '#000080' },
    { id: 'midnight', name: 'Midnight Blue', color: '#191970' },
    { id: 'royal', name: 'Royal Blue', color: '#4169e1' },
    { id: 'sky', name: 'Sky Blue', color: '#87ceeb' },
    { id: 'powder', name: 'Powder Blue', color: '#b0e0e6' },
    { id: 'dusty-blue', name: 'Dusty Blue', color: '#5b7c99' },
    { id: 'teal', name: 'Teal', color: '#008080' },
    { id: 'turquoise', name: 'Turquoise', color: '#40e0d0' },
    { id: 'emerald', name: 'Emerald Green', color: '#50c878' },
    { id: 'hunter', name: 'Hunter Green', color: '#355e3b' },
    { id: 'forest', name: 'Forest Green', color: '#228b22' },
    { id: 'sage', name: 'Sage Green', color: '#9dc183' },
    { id: 'olive', name: 'Olive', color: '#808000' },
    { id: 'moss', name: 'Moss Green', color: '#8a9a5b' },
    { id: 'mint', name: 'Mint', color: '#98ff98' },
    { id: 'gold', name: 'Classic Gold', color: '#ffd700' },
    { id: 'champagne', name: 'Champagne', color: '#f7e7ce' },
    { id: 'mustard', name: 'Mustard', color: '#ffdb58' },
    { id: 'violet', name: 'Violet', color: '#8f00ff' },
    { id: 'lavender', name: 'Lavender', color: '#e6e6fa' },
    { id: 'plum', name: 'Plum', color: '#8e4585' },
    { id: 'lilac', name: 'Lilac', color: '#c8a2c8' },
    { id: 'mauve', name: 'Mauve', color: '#e0b0ff' },
    { id: 'orchid', name: 'Orchid', color: '#da70d6' },
    { id: 'chocolate', name: 'Chocolate', color: '#7b3f00' },
    { id: 'rust', name: 'Rust', color: '#b7410e' },
    { id: 'sand', name: 'Sand', color: '#c2b280' },
    { id: 'taupe', name: 'Taupe', color: '#483c32' },
    { id: 'grey', name: 'Classic Grey', color: '#808080' },
    { id: 'charcoal', name: 'Charcoal', color: '#36454f' },
    { id: 'slate', name: 'Slate', color: '#708090' },
    { id: 'silver', name: 'Silver', color: '#c0c0c0' },
    { id: 'black', name: 'Modern Black', color: '#000000' },
    { id: 'bordeaux', name: 'Bordeaux', color: '#4c0013' },
    { id: 'crimson', name: 'Crimson', color: '#dc143c' },
    { id: 'fuchsia', name: 'Fuchsia', color: '#ff00ff' },
    { id: 'magenta', name: 'Magenta', color: '#ff0090' },
    { id: 'tangerine', name: 'Tangerine', color: '#f28500' },
    { id: 'cinnabar', name: 'Cinnabar', color: '#e34234' },
    { id: 'indigo', name: 'Indigo', color: '#4b0082' },
    { id: 'periwinkle', name: 'Periwinkle', color: '#ccccff' }
];

// Helper to convert hex to RGB object
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

// Mix color with white (tint) or black (shade)
const mix = (color: { r: number, g: number, b: number }, mixColor: { r: number, g: number, b: number }, weight: number) => {
    return {
        r: Math.round(color.r * (1 - weight) + mixColor.r * weight),
        g: Math.round(color.g * (1 - weight) + mixColor.g * weight),
        b: Math.round(color.b * (1 - weight) + mixColor.b * weight)
    };
};

const colorToHex = (c: { r: number, g: number, b: number }) => {
    return "#" + ((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1);
};

export const generatePalette = (baseHex: string) => {
    const base = hexToRgb(baseHex);
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };

    // Generate 50-950 scale conceptually. 
    // Tailwind default palette roughly:
    // 50: 95% white
    // 100: 90% white
    // 200: 80% white
    // 300: 60% white
    // 400: 30% white
    // 500: Base
    // 600: 10% black
    // 700: 30% black
    // 800: 50% black
    // 900: 70% black

    return {
        50: colorToHex(mix(base, white, 0.95)),
        100: colorToHex(mix(base, white, 0.9)),
        200: colorToHex(mix(base, white, 0.8)),
        300: colorToHex(mix(base, white, 0.6)),
        400: colorToHex(mix(base, white, 0.3)),
        500: baseHex,
        600: colorToHex(mix(base, black, 0.1)),
        700: colorToHex(mix(base, black, 0.3)),
        800: colorToHex(mix(base, black, 0.5)),
        900: colorToHex(mix(base, black, 0.7)),
    };
};

export const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId) || themes.find(t => t.id === 'charcoal') || themes[0];
    const palette = generatePalette(theme.color);

    const root = document.documentElement;
    Object.entries(palette).forEach(([key, value]) => {
        root.style.setProperty(`--color-primary-${key}`, value);
    });
};
