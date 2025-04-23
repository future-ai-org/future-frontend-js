// Helper function to create rgba color from rgb with opacity
const createColorWithOpacity = (rgb: string, opacity: number) => {
  return rgb.replace("rgb", "rgba").replace(")", `, ${opacity})`);
};

// Helper function to create glow effect from color
const createGlowEffect = (rgb: string, opacity: number, spread: number) => {
  return `0 0 ${spread}px ${createColorWithOpacity(rgb, opacity)}`;
};

// Light theme colors
const LIGHT_PRIMARY_COLOR = "rgb(87, 76, 145)";
const LIGHT_BACKGROUND_COLOR = "rgb(224, 222, 226)";
const LIGHT_TEXT_COLOR = "rgb(65, 62, 62)";
const LIGHT_BEARISH_COLOR = "rgb(211, 116, 212)";
const LIGHT_BULLISH_COLOR = "rgb(90, 192, 114)";

// Dark theme colors
const DARK_PRIMARY_COLOR = "rgb(132, 117, 249)";
const DARK_BACKGROUND_COLOR = "rgb(14, 14, 14)";
const DARK_TEXT_COLOR = "rgb(255, 255, 255)";
const DARK_BEARISH_COLOR = "rgb(243, 151, 208)";
const DARK_BULLISH_COLOR = "rgb(148, 246, 160)";

export const colors = {
  light: {
    primary: LIGHT_PRIMARY_COLOR,
    background: LIGHT_BACKGROUND_COLOR,
    text: LIGHT_TEXT_COLOR,
    bearish: LIGHT_BEARISH_COLOR,
    bullish: LIGHT_BULLISH_COLOR,
    opacity: {
      light: 0.8,
      medium: 0.5,
      dark: 0.3,
      veryLight: 0.1,
      high: 0.8,
      low: 0.2,
    },
    border: createColorWithOpacity(LIGHT_PRIMARY_COLOR, 0.2),
    glow: {
      shadow: createColorWithOpacity(LIGHT_PRIMARY_COLOR, 0.3),
      shadowHover: createColorWithOpacity(LIGHT_PRIMARY_COLOR, 0.5),
    },
    scroll: {
      track: createColorWithOpacity(LIGHT_PRIMARY_COLOR, 0.1),
    },
    card: {
      bg: createColorWithOpacity(LIGHT_TEXT_COLOR, 0.1),
    },
    info: {
      bg: createColorWithOpacity(LIGHT_TEXT_COLOR, 0.2),
    },
    shadow: {
      black: createColorWithOpacity(LIGHT_TEXT_COLOR, 0.2),
      white: createColorWithOpacity(LIGHT_BACKGROUND_COLOR, 0.3),
      trending: {
        light: createColorWithOpacity(LIGHT_PRIMARY_COLOR, 0.5),
        dark: createColorWithOpacity(LIGHT_PRIMARY_COLOR, 0.3),
      },
    },
    textGlow: {
      normal: createGlowEffect(LIGHT_PRIMARY_COLOR, 0.7, 10),
      hover: `${createGlowEffect(LIGHT_PRIMARY_COLOR, 0.7, 30)}, ${createGlowEffect(LIGHT_PRIMARY_COLOR, 0.5, 50)}`,
    },
  },
  dark: {
    primary: DARK_PRIMARY_COLOR,
    background: DARK_BACKGROUND_COLOR,
    text: DARK_TEXT_COLOR,
    bearish: DARK_BEARISH_COLOR,
    bullish: DARK_BULLISH_COLOR,
    opacity: {
      light: 0.8,
      medium: 0.5,
      dark: 0.3,
      veryLight: 0.1,
      high: 0.8,
      low: 0.2,
    },
    border: createColorWithOpacity(DARK_PRIMARY_COLOR, 0.2),
    glow: {
      shadow: createColorWithOpacity(DARK_PRIMARY_COLOR, 0.3),
      shadowHover: createColorWithOpacity(DARK_PRIMARY_COLOR, 0.5),
    },
    scroll: {
      track: createColorWithOpacity(DARK_PRIMARY_COLOR, 0.1),
    },
    card: {
      bg: createColorWithOpacity(DARK_TEXT_COLOR, 0.1),
    },
    info: {
      bg: createColorWithOpacity(DARK_TEXT_COLOR, 0.2),
    },
    shadow: {
      black: createColorWithOpacity(DARK_TEXT_COLOR, 0.2),
      white: createColorWithOpacity(DARK_BACKGROUND_COLOR, 0.3),
      trending: {
        light: createColorWithOpacity(DARK_PRIMARY_COLOR, 0.5),
        dark: createColorWithOpacity(DARK_PRIMARY_COLOR, 0.3),
      },
    },
    textGlow: {
      normal: createGlowEffect(DARK_PRIMARY_COLOR, 0.7, 10),
      hover: `${createGlowEffect(DARK_PRIMARY_COLOR, 0.7, 30)}, ${createGlowEffect(DARK_PRIMARY_COLOR, 0.5, 50)}`,
    },
  },
} as const;

// Inject color variables into CSS
export const injectColorVariables = (theme: "light" | "dark") => {
  const root = document.documentElement;
  const themeColors = colors[theme];

  // Basic colors
  root.style.setProperty("--color-primary", themeColors.primary);
  root.style.setProperty("--color-text", themeColors.text);
  root.style.setProperty("--color-background", themeColors.background);
  root.style.setProperty("--color-bearish", themeColors.bearish);
  root.style.setProperty("--color-bullish", themeColors.bullish);
  root.style.setProperty("--color-border", themeColors.border);

  // Opacity values
  Object.entries(themeColors.opacity).forEach(([key, value]) => {
    root.style.setProperty(`--color-opacity-${key}`, value.toString());
  });

  // Glow effects
  root.style.setProperty("--color-glow-shadow", themeColors.glow.shadow);
  root.style.setProperty(
    "--color-glow-shadow-hover",
    themeColors.glow.shadowHover,
  );

  // Scroll
  root.style.setProperty("--color-scroll-track", themeColors.scroll.track);

  // Card and info backgrounds
  root.style.setProperty("--color-card-bg", themeColors.card.bg);
  root.style.setProperty("--color-info-bg", themeColors.info.bg);

  // Shadows
  root.style.setProperty("--color-shadow-black", themeColors.shadow.black);
  root.style.setProperty("--color-shadow-white", themeColors.shadow.white);
  root.style.setProperty(
    "--color-shadow-trending-light",
    themeColors.shadow.trending.light,
  );
  root.style.setProperty(
    "--color-shadow-trending-dark",
    themeColors.shadow.trending.dark,
  );

  // Text glow effects
  root.style.setProperty(
    "--color-text-glow-normal",
    themeColors.textGlow.normal,
  );
  root.style.setProperty("--color-text-glow-hover", themeColors.textGlow.hover);
};
