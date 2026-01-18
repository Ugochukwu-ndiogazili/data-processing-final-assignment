import { PageHeader } from '../components/PageHeader';
import { ProfileList } from '../features/profiles/ProfileList';

export function ProfilesPage() {
  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <PageHeader
        title="Profiles"
        subtitle="Create dedicated spaces with age filters and preferences"
      />
      <ProfileList />
    </div>
  );
}




