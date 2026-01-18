-- Ensure API user account exists (created via DB init script)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'api_user_account') THEN
    CREATE ROLE api_user_account LOGIN;
  END IF;
END
$$;

-- Grant basic connection
GRANT CONNECT ON DATABASE streamflix TO api_user_account;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO api_user_account;

-- Create view for public account information
CREATE OR REPLACE VIEW view_accounts_public AS
SELECT 
  id,
  email,
  status,
  "trialEndsAt",
  "createdAt"
FROM "Account"
WHERE status = 'ACTIVE';

-- Grant access to view
GRANT SELECT ON view_accounts_public TO api_user_account;

-- Create view for profiles with age filtering
CREATE OR REPLACE VIEW view_profiles_with_filters AS
SELECT 
  p.id,
  p."accountId",
  p.name,
  p."ageCategory",
  p.preferences,
  a.status as account_status,
  a.email as account_email
FROM "Profile" p
JOIN "Account" a ON p."accountId" = a.id
WHERE a.status = 'ACTIVE';

-- Grant access to view
GRANT SELECT ON view_profiles_with_filters TO api_user_account;

-- Create stored procedure for logging viewing events
CREATE OR REPLACE FUNCTION sp_log_viewing_event(
  p_account_id TEXT,
  p_profile_id TEXT,
  p_title_id TEXT,
  p_episode_id TEXT DEFAULT NULL,
  p_watch_seconds INTEGER DEFAULT 0,
  p_completed BOOLEAN DEFAULT FALSE
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id TEXT;
BEGIN
  -- Insert or update watch event
  INSERT INTO "WatchEvent" (
    id,
    "profileId",
    "accountId",
    "titleId",
    "episodeId",
    "durationWatched",
    completed,
    "startedAt",
    "finishedAt"
  )
  VALUES (
    gen_random_uuid()::TEXT,
    p_profile_id,
    p_account_id,
    p_title_id,
    p_episode_id,
    p_watch_seconds,
    p_completed,
    CURRENT_TIMESTAMP,
    CASE WHEN p_completed THEN CURRENT_TIMESTAMP ELSE NULL END
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_event_id;

  -- If completed, remove from watchlist
  IF p_completed THEN
    DELETE FROM "WatchlistItem"
    WHERE "profileId" = p_profile_id AND "titleId" = p_title_id;
  END IF;

  RETURN COALESCE(v_event_id, 'event_logged');
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION sp_log_viewing_event TO api_user_account;

-- Create stored procedure for applying invitation discounts
CREATE OR REPLACE FUNCTION sp_apply_invitation_discount(
  p_invitation_token TEXT,
  p_invitee_account_id TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
  v_discount_id TEXT;
BEGIN
  -- Find invitation
  SELECT * INTO v_invitation
  FROM "Invitation"
  WHERE token = p_invitation_token
    AND status = 'PENDING'
    AND "inviteeEmail" = (SELECT email FROM "Account" WHERE id = p_invitee_account_id);

  IF NOT FOUND THEN
    RETURN 'INVALID_INVITATION';
  END IF;

  -- Check if already used
  IF v_invitation."acceptedAccountId" IS NOT NULL THEN
    RETURN 'ALREADY_USED';
  END IF;

  -- Create discount ledger entry
  INSERT INTO "DiscountLedger" (
    id,
    "accountId",
    "invitationId",
    "startsAt",
    "endsAt"
  )
  VALUES (
    gen_random_uuid()::TEXT,
    p_invitee_account_id,
    v_invitation.id,
    COALESCE(v_invitation."discountStartsAt", CURRENT_TIMESTAMP),
    COALESCE(v_invitation."discountEndsAt", CURRENT_TIMESTAMP + INTERVAL '30 days')
  )
  RETURNING id INTO v_discount_id;

  -- Update invitation
  UPDATE "Invitation"
  SET 
    status = 'ACCEPTED',
    "acceptedAccountId" = p_invitee_account_id
  WHERE id = v_invitation.id;

  RETURN 'SUCCESS';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION sp_apply_invitation_discount TO api_user_account;

-- Create stored procedure for updating profile preferences
CREATE OR REPLACE FUNCTION sp_update_profile_preferences(
  p_profile_id TEXT,
  p_preferences JSONB
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate JSON structure (basic validation)
  IF p_preferences IS NULL THEN
    RETURN 'INVALID_PREFERENCES';
  END IF;

  -- Update profile preferences
  UPDATE "Profile"
  SET 
    preferences = p_preferences,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE id = p_profile_id;

  IF NOT FOUND THEN
    RETURN 'PROFILE_NOT_FOUND';
  END IF;

  RETURN 'SUCCESS';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION sp_update_profile_preferences TO api_user_account;

-- Create stored procedure for toggling account status
CREATE OR REPLACE FUNCTION sp_toggle_account_status(
  p_account_id TEXT,
  p_new_status TEXT,
  p_actor_role TEXT DEFAULT 'SYSTEM'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate status
  IF p_new_status NOT IN ('PENDING', 'ACTIVE', 'BLOCKED') THEN
    RETURN 'INVALID_STATUS';
  END IF;

  -- Update account status
  UPDATE "Account"
  SET 
    status = p_new_status::"AccountStatus",
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE id = p_account_id;

  IF NOT FOUND THEN
    RETURN 'ACCOUNT_NOT_FOUND';
  END IF;

  -- Log the change (could be extended with audit table)
  RETURN 'SUCCESS';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION sp_toggle_account_status TO api_user_account;

-- Create trigger function for account status changes audit
CREATE OR REPLACE FUNCTION audit_account_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Log status change (in production, this would write to an audit table)
    RAISE NOTICE 'Account % status changed from % to %', NEW.id, OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for account status changes
CREATE TRIGGER trigger_account_status_audit
  BEFORE UPDATE ON "Account"
  FOR EACH ROW
  EXECUTE FUNCTION audit_account_status_change();

-- Create trigger function for auto-updating updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Create trigger for Profile updatedAt
CREATE TRIGGER trigger_profile_updated_at
  BEFORE UPDATE ON "Profile"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for Subscription updatedAt
CREATE TRIGGER trigger_subscription_updated_at
  BEFORE UPDATE ON "Subscription"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant SELECT on necessary tables for views
GRANT SELECT ON "Account" TO api_user_account;
GRANT SELECT ON "Profile" TO api_user_account;
GRANT SELECT ON "Title" TO api_user_account;
GRANT SELECT ON "WatchEvent" TO api_user_account;
GRANT SELECT ON "WatchlistItem" TO api_user_account;
GRANT SELECT ON "Subscription" TO api_user_account;
GRANT SELECT ON "SubscriptionPlan" TO api_user_account;
GRANT SELECT ON "Invitation" TO api_user_account;
GRANT SELECT ON "DiscountLedger" TO api_user_account;

-- Grant INSERT/UPDATE on necessary tables
GRANT INSERT, UPDATE ON "WatchEvent" TO api_user_account;
GRANT INSERT, UPDATE ON "WatchlistItem" TO api_user_account;
GRANT INSERT, UPDATE ON "Profile" TO api_user_account;
GRANT INSERT, UPDATE ON "DiscountLedger" TO api_user_account;
GRANT UPDATE ON "Invitation" TO api_user_account;

