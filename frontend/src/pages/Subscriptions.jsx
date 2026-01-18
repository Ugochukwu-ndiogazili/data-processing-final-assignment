import { PageHeader } from '../components/PageHeader';
import { SubscriptionPanel } from '../features/subscriptions/SubscriptionPanel';

export function SubscriptionsPage() {
  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <PageHeader
        title="Subscription & invites"
        subtitle="Upgrade plans, share invites, and track discounts"
      />
      <SubscriptionPanel />
    </div>
  );
}




