import { Container } from '@/components/layout/Container';
import { PageMeta } from '@/components/layout/PageMeta';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { privacyPolicy } from '@/content/privacy-policy';

export function PrivacyPage() {
  return (
    <>
      <PageMeta title="Privacy Policy" description="WatermarkOut privacy policy. Files never leave your browser." />
      <Container className="py-16 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-4">Privacy Policy</h1>
          <PrivacyBadge />
        </div>

        <div className="space-y-8">
          {privacyPolicy.map((section) => (
            <div key={section.heading}>
              <h2 className="font-display text-xl font-semibold mb-2">{section.heading}</h2>
              <p className="text-text-secondary leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-text-muted mt-12">Last updated: March 2026</p>
      </Container>
    </>
  );
}
