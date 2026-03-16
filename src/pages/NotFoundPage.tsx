import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { PageMeta } from '@/components/layout/PageMeta';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <>
      <PageMeta title="Not Found" />
      <Container className="py-32 text-center">
        <h1 className="font-display text-6xl font-bold text-accent mb-4">404</h1>
        <p className="text-text-secondary text-lg mb-8">Page not found</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </Container>
    </>
  );
}
