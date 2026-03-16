import { Link } from 'react-router-dom';
import { Droplets, Sun, Moon } from 'lucide-react';
import { Container } from './Container';
import { Button } from '../ui/Button';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onInstallPWA?: () => void;
  canInstall?: boolean;
}

export function Header({ theme, onToggleTheme, onInstallPWA, canInstall }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass">
      <Container>
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Droplets className="w-5 h-5 text-accent" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              Watermark<span className="text-accent">Out</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm text-text-secondary">
            <Link to="/about" className="hover:text-text transition-colors">
              How It Works
            </Link>
            <Link to="/privacy" className="hover:text-text transition-colors">
              Privacy
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {canInstall && (
              <Button variant="secondary" size="sm" onClick={onInstallPWA}>
                Install App
              </Button>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
