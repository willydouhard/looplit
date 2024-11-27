import { useTheme } from './ThemeProvider';
import LogoDark from '@/assets/logo_dark.svg';
import LogoLight from '@/assets/logo_light.svg';

interface Props {
  className: string;
}

export const Logo = ({ className }: Props) => {
  const { theme } = useTheme();

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <img
      src={currentTheme === 'dark' ? LogoDark : LogoLight}
      alt="logo"
      className={className}
    />
  );
};
