// ─────────────────────────────────────────────────────────
// DESTIN8 Design Tokens — extracted directly from Stitch HTML
// Primary scheme: #52396F (plum/lavender)
// Typography: Epilogue (headlines) + Manrope (body/labels)
// ─────────────────────────────────────────────────────────

export const Colors = {
  // Core brand
  primary:       '#52396F',   // Stitch: surface-tint / primary
  primaryDim:    '#7A5DA1',   // Stitch: primary-dim
  lavender:      '#967BB6',   // Stitch: login CTA gradient
  lavenderLight: '#B29CCF',   // Stitch: lavender-light
  plum:          '#52396F',

  // Backgrounds & surfaces
  background:    '#F8F9FA',   // Stitch: background / surface
  surface:       '#F8F9FA',
  surfaceHigh:   '#E7E8E9',   // Stitch: surface-container-high
  surfaceLow:    '#F3F4F5',   // Stitch: surface-container-low
  surfaceLowest: '#FFFFFF',   // Stitch: surface-container-lowest
  surfaceContainer: '#EDEEEF', // Stitch: surface-container
  surfaceDim:    '#D9DADB',   // Stitch: surface-dim

  // Text
  onSurface:     '#191C1D',   // Stitch: on-surface
  onSurfaceVariant: '#595C5D', // Stitch: on-surface-variant
  onBackground:  '#191C1D',
  white:         '#FFFFFF',

  // Accent
  secondary:     '#5152B9',
  tertiary:      '#751F6B',

  // Semantic
  error:         '#BA1A1A',
  errorBg:       '#FFDAD6',
  success:       '#1B7A4A',
  successBg:     '#DDF3E4',
  warning:       '#E28413',
  warningBg:     '#FFF2E0',

  // Outline
  outline:       '#7B757F',
  outlineVariant:'#CCC4CF',

  // Other
  textFaint:     'rgba(89,92,93,0.5)',
  shadowTint:    'rgba(106,81,136,0.25)',
};

export const Typography = {
  displayXL: { fontFamily: 'Epilogue_700Bold', fontSize: 48, lineHeight: 52, letterSpacing: -1 },
  displayLG: { fontFamily: 'Epilogue_700Bold', fontSize: 36, lineHeight: 40, letterSpacing: -0.5 },
  headlineLG: { fontFamily: 'Epilogue_600SemiBold', fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  headlineMD: { fontFamily: 'Epilogue_600SemiBold', fontSize: 22, lineHeight: 28 },
  headlineSM: { fontFamily: 'Epilogue_600SemiBold', fontSize: 18, lineHeight: 24 },
  bodyLG: { fontFamily: 'Manrope_400Regular', fontSize: 16, lineHeight: 24 },
  bodyMD: { fontFamily: 'Manrope_400Regular', fontSize: 14, lineHeight: 20 },
  bodySM: { fontFamily: 'Manrope_400Regular', fontSize: 12, lineHeight: 18 },
  labelLG: { fontFamily: 'Manrope_700Bold', fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' },
  labelMD: { fontFamily: 'Manrope_700Bold', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  labelSM: { fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#6A5188',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  editorial: {
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 6,
  },
  tint: {
    shadowColor: '#6A5188',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
  },
};
