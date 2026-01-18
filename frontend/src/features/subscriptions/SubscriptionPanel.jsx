import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../../api/resources';
import { Loader } from '../../components/Loader';

export function SubscriptionPanel() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [token, setToken] = useState('');

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: subscriptionApi.plans,
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.current,
  });

  const { data: discounts = [] } = useQuery({
    queryKey: ['discounts'],
    queryFn: subscriptionApi.discounts,
  });

  const changePlan = useMutation({
    mutationFn: (planCode) => subscriptionApi.changePlan(planCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  });

  const sendInvite = useMutation({
    mutationFn: (email) => subscriptionApi.invite(email),
    onSuccess: () => setInviteEmail(''),
  });

  const acceptInvite = useMutation({
    mutationFn: (inviteToken) => subscriptionApi.acceptInvite(inviteToken),
    onSuccess: () => {
      setToken('');
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });

  if (plansLoading || subLoading) {
    return <Loader label="Loading subscription..." />;
  }

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <section className="panel">
        <h3 style={{ marginBottom: '1rem' }}>Available plans</h3>
        <div className="grid grid--two">
          {plans.map((plan) => (
            <article
              key={plan.code}
              className="panel"
              style={{
                border:
                  subscription?.plan?.code === plan.code
                    ? '1px solid rgba(59,130,246,0.8)'
                    : '1px solid rgba(148,163,184,0.2)',
              }}
            >
              <h4 style={{ margin: 0 }}>{plan.name}</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{plan.description || plan.quality}</p>
              <p style={{ fontSize: '1.5rem', margin: '0.75rem 0' }}>${(plan.monthlyPrice / 100).toFixed(2)}/mo</p>
              <button
                className="btn"
                disabled={subscription?.plan?.code === plan.code || changePlan.isPending}
                onClick={() => changePlan.mutate(plan.code)}
              >
                {subscription?.plan?.code === plan.code ? 'Current plan' : 'Switch'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3 style={{ marginBottom: '1rem' }}>Invite & discounts</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendInvite.mutate(inviteEmail);
          }}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}
        >
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="friend@example.com"
            required
          />
          <button className="btn" type="submit" disabled={sendInvite.isPending}>
            {sendInvite.isPending ? 'Sending...' : 'Send invite'}
          </button>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            acceptInvite.mutate(token);
          }}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
        >
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Invitation token" required />
          <button className="btn btn-secondary" type="submit" disabled={acceptInvite.isPending}>
            {acceptInvite.isPending ? 'Applying...' : 'Apply token'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem' }}>
          <h4>Active discounts</h4>
          {discounts.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No discounts active</p>
          ) : (
            <ul>
              {discounts.map((discount) => (
                <li key={discount.id}>
                  Active until {new Date(discount.endsAt).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

