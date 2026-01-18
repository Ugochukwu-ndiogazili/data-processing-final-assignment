const { hashPassword, verifyPassword, issueAuthTokens, verifyAccessToken } = require('../src/lib/auth');

describe('auth library', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('Hello123!');
    expect(hash).toMatch(/^\$2[aby]\$/);
    await expect(verifyPassword('Hello123!', hash)).resolves.toBe(true);
    await expect(verifyPassword('nope', hash)).resolves.toBe(false);
  });

  it('issues and verifies JWT tokens', () => {
    const account = { id: 'acc_123', email: 'user@test.dev' };
    const { accessToken } = issueAuthTokens(account);
    const decoded = verifyAccessToken(accessToken);
    expect(decoded.sub).toBe(account.id);
    expect(decoded.email).toBe(account.email);
  });
});

