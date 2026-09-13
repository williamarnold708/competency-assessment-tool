export const color = {
  bg: '#f3f2f2',
  surface: '#eae9e9',
  text: '#201e1d',
  accent: '#ec3013',
  divider: 'rgba(32,30,29,0.4)',

  neutral100: '#f8f4f4',
  neutral200: '#eae7e7',
  neutral300: '#d7d3d3',
  neutral400: '#bab6b6',
  neutral500: '#9b9797',
  neutral600: '#7d7979',
  neutral700: '#605d5d',
  neutral800: '#444141',
  neutral900: '#2d2b2b',

  accent100: '#fff2ef',
  accent200: '#ffe0d9',
  accent300: '#ffc4b8',
  accent400: '#ff9783',
  accent500: '#ff563c',
  accent600: '#dd2b0f',
  accent700: '#ae1800',
  accent800: '#7c1405',
  accent900: '#4d170e',

  white: '#ffffff',
};

export const font = {
  heading: 'Archivo_800ExtraBold',
  semibold: 'Archivo_600SemiBold',
  body: 'Archivo_400Regular',
};

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
};

// Org timezone for displaying recorded timestamps. Always format explicit to
// this zone — never rely on device/locale defaults (that's what produced the
// wrong sign-off times in the old Power Apps tool).
export const ORG_TIMEZONE = 'Europe/London';
export const ORG_TIMEZONE_LABEL = 'Europe/London (UK)';

export function formatSignedTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ORG_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatSignedDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ORG_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
