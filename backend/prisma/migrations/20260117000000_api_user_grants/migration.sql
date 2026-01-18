-- Ensure API user exists (created via DB init script)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'api_user_account') THEN
    CREATE ROLE api_user_account LOGIN;
  END IF;
END
$$;

-- Additional grants for api_user_account so the API can manage core entities
GRANT SELECT, INSERT, UPDATE ON "Account" TO api_user_account;
GRANT SELECT, INSERT, UPDATE ON "VerificationToken" TO api_user_account;
GRANT SELECT, INSERT, UPDATE ON "Subscription" TO api_user_account;
GRANT SELECT ON "SubscriptionPlan" TO api_user_account;
GRANT SELECT ON "DiscountLedger" TO api_user_account;
GRANT SELECT ON "Profile" TO api_user_account;
GRANT INSERT, UPDATE ON "Invitation" TO api_user_account;
GRANT SELECT ON "Title" TO api_user_account;
GRANT SELECT ON "Episode" TO api_user_account;
GRANT SELECT ON "Season" TO api_user_account;
GRANT SELECT ON "Subtitle" TO api_user_account;
GRANT SELECT, INSERT, UPDATE ON "WatchEvent" TO api_user_account;
GRANT SELECT, INSERT, UPDATE ON "WatchlistItem" TO api_user_account;
