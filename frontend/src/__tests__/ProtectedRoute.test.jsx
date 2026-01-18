import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { authStore } from '../store/authStore';

function renderWithRouter(ui, initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>{ui}</Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    authStore.setState({
      account: null,
      accessToken: null,
      refreshToken: null,
      selectedProfileId: null,
    });
  });

  it('redirects unauthenticated users to login', () => {
    renderWithRouter(
      <>
        <Route
          path="/secure"
          element={
            <ProtectedRoute>
              <div>Secure Area</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Screen</div>} />
      </>,
      ['/secure']
    );

    expect(screen.getByText(/Login Screen/i)).toBeInTheDocument();
  });

  it('renders children when account is available', () => {
    authStore.setState({
      account: { id: 'acc1', email: 'demo@test.dev' },
      accessToken: 'token',
      refreshToken: 'refresh',
      selectedProfileId: null,
    });

    renderWithRouter(
      <>
        <Route
          path="/secure"
          element={
            <ProtectedRoute>
              <div>Secure Area</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Screen</div>} />
      </>,
      ['/secure']
    );

    expect(screen.getByText('Secure Area')).toBeInTheDocument();
  });
});




