import { PageHeader } from '../components/PageHeader';
import { ContentLibrary } from '../features/library/ContentLibrary';

export function BrowsePage() {
  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <PageHeader
        title="Browse titles"
        subtitle="Filter by type, guidelines, or search keywords"
      />
      <ContentLibrary />
    </div>
  );
}




