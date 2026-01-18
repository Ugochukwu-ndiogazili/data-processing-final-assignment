import { PageHeader } from '../components/PageHeader';
import { InternalConsole } from '../features/admin/InternalConsole';

export function AdminPage() {
  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <PageHeader
        title="Internal console"
        subtitle="Emulate DBMS tooling for junior/mid/senior roles"
      />
      <InternalConsole />
    </div>
  );
}




