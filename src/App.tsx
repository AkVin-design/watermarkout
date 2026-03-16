import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PWAPrompt } from '@/components/PWAPrompt';
import { useTheme } from '@/hooks/useTheme';
import { usePWA } from '@/hooks/usePWA';
import { HomePage } from '@/pages/HomePage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { AboutPage } from '@/pages/AboutPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { canInstall, isOffline, needsUpdate, install, update } = usePWA();

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onInstallPWA={install}
          canInstall={canInstall}
        />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <PWAPrompt isOffline={isOffline} needsUpdate={needsUpdate} onUpdate={update} />
      </div>
    </BrowserRouter>
  );
}
