import { Container } from '@/components/layout/Container';
import { PageMeta } from '@/components/layout/PageMeta';
import { termsOfService } from '@/content/terms-of-service';

export function TermsPage() {
  return (
    <>
      <PageMeta title="Terms of Service" description="WatermarkOut terms of service." />
      <Container className="py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="space-y-8">
          {termsOfService.map((section) => (
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
