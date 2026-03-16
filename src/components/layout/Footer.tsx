import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Container } from './Container';

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <Container>
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Shield className="w-4 h-4 text-success" />
            <span>Files never leave your browser</span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-text-muted">
            <Link to="/privacy" className="hover:text-text transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-text transition-colors">
              Terms
            </Link>
            <Link to="/about" className="hover:text-text transition-colors">
              About
            </Link>
          </nav>

          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} WatermarkOut
          </p>
        </div>
      </Container>
    </footer>
  );
}
