import Functions from './Functions';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomeView() {
  return (
    <div className="h-screen w-screen flex items-center justify-center relative">
      <div
        style={{
          mask: 'url(/pattern.png) repeat center / contain',
          maskSize: '160px 160px, cover',
          background:
            'radial-gradient(50% 43% at 93.5% 93.10000000000001%, hsl(var(--card-foreground)) 0%, rgba(0, 0, 0, 0) 100%)'
        }}
        className="fixed left-0 top-0 z-[-1] h-full w-full opacity-[0.36]"
      />
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="max-w-[48rem] flex flex-col gap-4">
        <Functions />
      </div>
    </div>
  );
}
