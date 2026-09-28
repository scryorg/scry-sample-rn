// Design tokens from scry-playground/SPEC.md (Kettle). Kept numerically identical to the
// web Storybook and the Figma file `okiwUTcdKlV1PmUtbuHjvZ` so a device capture and a Figma
// frame line up in Scry's diff. See ../../SPEC.md in this repo for the full spec.

export const color = {
  bg: '#FBF7F2',
  surface: '#FFFFFF',
  ink: '#2B1D14',
  muted: '#7A6A5E',
  line: '#EADFD3',
  espresso: '#3B2A20',
  caramel: '#B8621B',
  tileFlatWhite: '#C89F7A',
  tileColdBrew: '#5A3B2A',
  tileMatcha: '#8FA876',
  tileCortado: '#A9744F',
  white: '#FFFFFF',
  // #FFFFFF at 35% opacity, the circle drawn on tiles and the hero.
  glow: 'rgba(255, 255, 255, 0.35)',
} as const;

export const radius = {
  card: 16,
  tile: 12,
  hero: 20,
  button: 14,
  stepper: 22,
} as const;

// Loaded via @expo-google-fonts/inter (useFonts in App.tsx and .rnstorybook/index.tsx) so
// every weight is bundled with the app binary — no system font fallback, per the brief.
const fontFamily: Record<400 | 500 | 600 | 700, string> = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
  700: 'Inter_700Bold',
};

/** Inter at a given weight / size / line height, letter spacing 0. RN takes lineHeight in dp. */
export function type(weight: 400 | 500 | 600 | 700, size: number, lineHeight: number) {
  return {
    fontFamily: fontFamily[weight],
    fontSize: size,
    lineHeight,
    letterSpacing: 0,
  } as const;
}

/**
 * A 1px border drawn with RN's border-box sizing (width/height already include the border,
 * same as the web build's inset box-shadow), so padding is measured from the outer edge.
 */
export function insideBorder(borderColor: string = color.line) {
  return { borderWidth: 1, borderColor } as const;
}
