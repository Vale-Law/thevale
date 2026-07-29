// Solid-color approximations of src/styles/tokens.css's rgba text/line
// tokens, for use in email HTML where CSS custom properties and alpha
// compositing aren't reliably supported by mail clients. Each value below
// is the token's foreground color flattened over its own theme's --surface
// background at the token's stated opacity — see the design system's
// Section 13 (Transactional Email) and Section 17 (token contract).
export const light = {
  ground: '#F4F2EA',
  surface: '#FFFFFF',
  surfaceSunk: '#FBFAF5',
  text: '#101C17',
  text2: '#5C6561',
  text3: '#838986',
  accent: '#6B8A5E',
  accentOn: '#F1F2ED',
  line: '#E8E8E6',
};

export const dark = {
  ground: '#14140F',
  surface: '#1A1A16',
  surfaceSunk: '#14140F',
  text: '#E9ECE4',
  text2: '#ABADA6',
  text3: '#8A8B85',
  accent: '#8FAF80',
  accentOn: '#0C1512',
  line: '#33332F',
};

export const fontHuman = "Georgia, 'Times New Roman', serif";
export const fontSystem = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
