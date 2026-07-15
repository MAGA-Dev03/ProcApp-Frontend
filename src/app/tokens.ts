export const fonts = {
  display: '"Libre Caslon Text", "Iowan Old Style", Georgia, serif',
  body: '"Public Sans", -apple-system, "Segoe UI", sans-serif',
};

export const paletteTokens = {
  light: {
    paper: '#F2F4EC',
    paperRaised: '#FBFCF8',
    ink: '#1E2A22',
    rule: '#C9D2C1',
    ruleStrong: '#A8B39E',
    accent: '#2B6E63',
    accentDeep: '#17453D',
    accentInk: '#F2F4EC',
    slate: '#5C6B60',
  },
  dark: {
    paper: '#12211B',
    paperRaised: '#17281F',
    ink: '#E7ECE3',
    rule: '#2C3D33',
    ruleStrong: '#3C4F44',
    accent: '#4FA393',
    accentDeep: '#7CC4B5',
    accentInk: '#0C1712',
    slate: '#93A69B',
  },
};

export const statusTokens = {
  light: {
    draft: { fg: '#55708A', bg: '#E1E7EC' },
    sent: { fg: '#B07C2E', bg: '#F3E8D4' },
    responsesReceived: { fg: '#3B7A8C', bg: '#DCEAEE' },
    closed: { fg: '#6B7A72', bg: '#E4E7E0' },
    pendingApproval: { fg: '#B07C2E', bg: '#F3E8D4' },
    approved: { fg: '#3E7D4E', bg: '#E4EDE1' },
    rejected: { fg: '#A13F3A', bg: '#F1DEDB' },
    issued: { fg: '#2B6E63', bg: '#DCEAE7' },
    pending: { fg: '#B07C2E', bg: '#F3E8D4' },
    submitted: { fg: '#55708A', bg: '#E1E7EC' },
    awarded: { fg: '#3E7D4E', bg: '#E4EDE1' },
  },
  dark: {
    draft: { fg: '#8FADC4', bg: '#202E3A' },
    sent: { fg: '#D9A354', bg: '#3A2E17' },
    responsesReceived: { fg: '#7FC3D6', bg: '#1B333A' },
    closed: { fg: '#9CACA3', bg: '#26302B' },
    pendingApproval: { fg: '#D9A354', bg: '#3A2E17' },
    approved: { fg: '#6FBE82', bg: '#1D3323' },
    rejected: { fg: '#E08076', bg: '#3B211E' },
    issued: { fg: '#4FA393', bg: '#183B36' },
    pending: { fg: '#D9A354', bg: '#3A2E17' },
    submitted: { fg: '#8FADC4', bg: '#202E3A' },
    awarded: { fg: '#6FBE82', bg: '#1D3323' },
  },
};

export type StatusTone = keyof typeof statusTokens.light;
export type ThemeMode = 'light' | 'dark';
