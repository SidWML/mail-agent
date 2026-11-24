// Drop into your Next.js project and add to tailwind.config.ts:  presets: [require('./tailwind.preset').default]
// Values are taken 1:1 from the approved Mailbox Agent screens (design-reference/).
import type { Config } from 'tailwindcss';

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#E3000F', dark: '#A8000B', deeper: '#8F0009', tint: '#FDE7E9', tint2: '#FFF5F5' },
        ink: { DEFAULT: '#1A1A1A', 2: '#4A4A4A', 3: '#5A5A5A', muted: '#6B6B6B', faint: '#9A9DA4' },
        surface: { page: '#F3F3F4', card: '#FFFFFF', head: '#ECEDF0', stripe: '#F5F6F8', dark: '#1A1A1C', dark2: '#2B2D31' },
        line: { DEFAULT: '#DCDEE3', soft: '#E3E5E9', header: '#E4E4E4', control: '#C9CBD0', strong: '#C4C7CD', col: '#D0D3D9' },
        // status pills: bg / fg / dot
        st: {
          new: { bg: '#E6EEFC', fg: '#174EA6', dot: '#1D5FD6' },
          progress: { bg: '#FFF0D1', fg: '#7A4A00', dot: '#C97A00' },
          waiting: { bg: '#EFE8FB', fg: '#5B34B5', dot: '#7A4DD8' },
          acted: { bg: '#E3F4EA', fg: '#0A6B3D', dot: '#0E8A4F' },
          deleted: { bg: '#ECECEC', fg: '#555555', dot: '#8A8A8A' },
        },
        urg: {
          high: { bg: '#FDE7E9', fg: '#A8000B', bar: '#E3000F' },
          medium: { bg: '#FFF0D1', fg: '#7A4A00', bar: '#E39A00' },
          low: { bg: '#ECECEC', fg: '#444444', bar: '#C9C9C9' },
        },
        ok: { DEFAULT: '#0E8A4F', dark: '#0A6B3D', bg: '#E3F4EA' },
        // age strip + chart ramp (light -> dark)
        ramp: ['#BFC5CC', '#F2B24B', '#E3000F', '#8F0009'] as any,
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      fontSize: { '2xs': '11px', xs: '12px', 'xs+': '12.5px', sm: '13px', 'sm+': '13.5px', base: '14px', md: '15px', lg: '20px', xl: '24px', '2xl': '30px' },
      maxWidth: { page: '1440px' },
      width: { drawer: '84%' },
      boxShadow: { drawer: '-14px 0 40px rgba(0,0,0,.28)' },
      backgroundColor: { scrim: 'rgba(26,26,28,.52)' },
    },
  },
};
export default preset;
