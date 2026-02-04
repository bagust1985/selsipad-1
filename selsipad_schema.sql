


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."assign_safu_badge_if_eligible"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_badge_id UUID;
  v_project_id UUID;
BEGIN
  -- Only proceed if created_token_id is set (platform token)
  IF NEW.created_token_id IS NOT NULL THEN
    
    -- Get SAFU badge ID
    SELECT id INTO v_badge_id
    FROM badge_definitions
    WHERE badge_key = 'SAFU_TOKEN' AND is_active = TRUE;
    
    -- Get project ID from launch_rounds
    v_project_id := NEW.project_id;
    
    -- Only auto-assign if badge exists and project doesn't already have it
    IF v_badge_id IS NOT NULL AND v_project_id IS NOT NULL THEN
      -- Check if badge already exists for this project
      IF NOT EXISTS (
        SELECT 1 FROM project_badges 
        WHERE project_id = v_project_id AND badge_id = v_badge_id
      ) THEN
        -- Insert SAFU badge for the project
        INSERT INTO project_badges (
          project_id,
          badge_id,
          awarded_at,
          awarded_by,
          award_reason
        ) VALUES (
          v_project_id,
          v_badge_id,
          NOW(),
          NULL,  -- Auto-assigned
          'Platform token creation via TokenFactory'
        );
        
        RAISE NOTICE 'SAFU badge auto-assigned to project %', v_project_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."assign_safu_badge_if_eligible"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."assign_safu_badge_if_eligible"() IS 'Auto-assign SAFU badge when launch_round uses platform-created token';



CREATE OR REPLACE FUNCTION "public"."auto_award_dev_kyc_badge"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  dev_kyc_badge_id UUID;
BEGIN
  -- Only proceed if kyc_status changed to verified
  IF NEW.kyc_status IN ('verified', 'VERIFIED', 'CONFIRMED') 
     AND (OLD.kyc_status IS NULL OR OLD.kyc_status NOT IN ('verified', 'VERIFIED', 'CONFIRMED')) THEN
    
    -- Get DEVELOPER_KYC_VERIFIED badge ID
    SELECT id INTO dev_kyc_badge_id
    FROM badge_definitions
    WHERE badge_key = 'DEVELOPER_KYC_VERIFIED';

    -- Only insert if badge exists and user doesn't already have it
    IF dev_kyc_badge_id IS NOT NULL THEN
      INSERT INTO badge_instances (user_id, badge_id, awarded_at, awarded_by, award_reason)
      VALUES (NEW.user_id, dev_kyc_badge_id, NOW(), NULL, 'Auto-awarded from profile KYC verification')
      ON CONFLICT DO NOTHING; -- Avoid duplicates
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_award_dev_kyc_badge"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_award_dev_kyc_badge"() IS 'Automatically awards DEVELOPER_KYC_VERIFIED badge when profiles.kyc_status is set to verified';



CREATE OR REPLACE FUNCTION "public"."auto_award_first_project_badge"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  project_count INTEGER;
BEGIN
  -- Check if this is the user's first project
  SELECT COUNT(*) INTO project_count
  FROM projects
  WHERE owner_user_id = NEW.owner_user_id;
  
  IF project_count = 1 THEN
    -- Award FIRST_PROJECT badge
    INSERT INTO project_badges (project_id, badge_id, reason)
    SELECT 
      NEW.id,
      bd.id,
      'First project created'
    FROM badge_definitions bd
    WHERE bd.badge_key = 'FIRST_PROJECT'
    ON CONFLICT (project_id, badge_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_award_first_project_badge"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_award_kyc_badge"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
    -- Update user's project KYC status if project_id is present
    IF NEW.project_id IS NOT NULL THEN
      UPDATE projects
      SET kyc_status = 'VERIFIED'
      WHERE id = NEW.project_id;
      
      -- Award KYC_VERIFIED badge
      INSERT INTO project_badges (project_id, badge_id, awarded_by, reason)
      SELECT 
        NEW.project_id,
        bd.id,
        NEW.reviewed_by,
        'KYC verification approved'
      FROM badge_definitions bd
      WHERE bd.badge_key = 'KYC_VERIFIED'
      ON CONFLICT (project_id, badge_id) DO NOTHING;
    END IF;
  ELSIF NEW.status = 'REJECTED' AND OLD.status != 'REJECTED' THEN
    -- Update KYC status to rejected
    IF NEW.project_id IS NOT NULL THEN
      UPDATE projects
      SET kyc_status = 'REJECTED'
      WHERE id = NEW.project_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_award_kyc_badge"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_award_scan_badge"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.status = 'PASSED' AND (OLD.status IS NULL OR OLD.status != 'PASSED') THEN
    -- Update project SC scan status
    UPDATE projects
    SET sc_scan_status = 'PASSED'
    WHERE id = NEW.project_id;
    
    -- Award SC_AUDIT_PASSED badge
    INSERT INTO project_badges (project_id, badge_id, reason)
    SELECT 
      NEW.project_id,
      bd.id,
      CONCAT('Smart contract audit passed - ', NEW.scan_provider)
    FROM badge_definitions bd
    WHERE bd.badge_key = 'SC_AUDIT_PASSED'
    ON CONFLICT (project_id, badge_id) DO NOTHING;
  ELSIF NEW.status IN ('FAILED', 'WARNING') THEN
    -- Update project SC scan status
    UPDATE projects
    SET sc_scan_status = NEW.status
    WHERE id = NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_award_scan_badge"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_generate_referral_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_generate_referral_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_update_deployment_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- If contract address is set and deployed_at is set, mark as DEPLOYED
  IF NEW.contract_address IS NOT NULL 
     AND NEW.deployed_at IS NOT NULL 
     AND NEW.deployment_status = 'NOT_DEPLOYED' THEN
    NEW.deployment_status = 'PENDING_FUNDING';
  END IF;
  
  -- If tokens are funded, update status
  IF NEW.tokens_funded_at IS NOT NULL 
     AND NEW.deployment_status = 'PENDING_FUNDING' THEN
    NEW.deployment_status = 'FUNDED';
  END IF;
  
  -- If funded and verified, mark as READY
  IF NEW.deployment_status = 'FUNDED' 
     AND NEW.verification_status = 'VERIFIED' THEN
    NEW.deployment_status = 'READY';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_update_deployment_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_and_mark_round_success"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if all three gates are passed
  IF NEW.result = 'SUCCESS' 
     AND NEW.vesting_status = 'CONFIRMED' 
     AND NEW.lock_status = 'LOCKED'
     AND NEW.success_gated_at IS NULL THEN
    
    -- Mark round as successfully gated
    NEW.success_gated_at = NOW();
    
    -- TODO: Trigger badge awards and other success actions
    -- This would typically be done by a worker job listening to this event
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_and_mark_round_success"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_sessions"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM auth_sessions 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_sessions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_bonding_status_event"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO bonding_events (pool_id, event_type, event_data)
    VALUES (
      NEW.id,
      'STATUS_CHANGED',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'changed_at', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_bonding_status_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_round_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.status = 'REFUNDED' AND OLD.status = 'CONFIRMED' THEN
    -- Decrement total_raised
    UPDATE launch_rounds
    SET 
      total_raised = total_raised - NEW.amount,
      total_participants = GREATEST(total_participants - 1, 0)
    WHERE id = NEW.round_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."decrement_round_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_referral_code"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excludes confusing chars: 0,O,I,1
  code TEXT;
  done BOOLEAN;
BEGIN
  done := false;
  
  -- Keep trying until we get a unique code
  WHILE NOT done LOOP
    code := '';
    
    -- Generate 8-character code
    FOR i IN 1..8 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Check if code already exists
    done := NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = code);
  END LOOP;
  
  RETURN code;
END;
$$;


ALTER FUNCTION "public"."generate_referral_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_primary_wallet"("p_user_id" "uuid") RETURNS TABLE("wallet_id" "uuid", "address" "text", "chain" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT id, address, chain
  FROM wallets
  WHERE user_id = p_user_id
    AND wallet_role = 'PRIMARY'
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_primary_wallet"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_primary_wallet"("p_user_id" "uuid") IS 'Get the primary (EVM) wallet for a user';



CREATE OR REPLACE FUNCTION "public"."get_token_creation_stats"("chain_filter" "text" DEFAULT NULL::"text") RETURNS TABLE("chain" "text", "total_tokens" bigint, "total_fees_collected" numeric, "unique_creators" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.chain,
    COUNT(*)::BIGINT as total_tokens,
    SUM(ct.creation_fee_paid) as total_fees_collected,
    COUNT(DISTINCT ct.creator_id)::BIGINT as unique_creators
  FROM created_tokens ct
  WHERE (chain_filter IS NULL OR ct.chain = chain_filter)
  GROUP BY ct.chain
  ORDER BY total_tokens DESC;
END;
$$;


ALTER FUNCTION "public"."get_token_creation_stats"("chain_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_active_badges"("target_user_id" "uuid") RETURNS TABLE("badge_key" "text", "badge_name" "text", "badge_description" "text", "badge_type" "text", "icon_url" "text", "awarded_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bd.badge_key,
    bd.name,
    bd.description,
    bd.badge_type,
    bd.icon_url,
    bi.awarded_at
  FROM badge_instances bi
  JOIN badge_definitions bd ON bi.badge_id = bd.id
  WHERE bi.user_id = target_user_id
    AND bi.status = 'ACTIVE'
    AND bd.is_active = TRUE
  ORDER BY bi.awarded_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_active_badges"("target_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_active_badges"("target_user_id" "uuid") IS 'Get all active badges for a user with badge details';



CREATE OR REPLACE FUNCTION "public"."get_user_followers"("target_user_id" "uuid", "result_limit" integer DEFAULT 50, "result_offset" integer DEFAULT 0) RETURNS TABLE("user_id" "uuid", "username" "text", "avatar_url" "text", "follower_count" integer, "following_count" integer, "followed_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.username,
    p.avatar_url,
    p.follower_count,
    p.following_count,
    uf.created_at
  FROM user_follows uf
  JOIN profiles p ON uf.follower_id = p.user_id
  WHERE uf.following_id = target_user_id
  ORDER BY uf.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;


ALTER FUNCTION "public"."get_user_followers"("target_user_id" "uuid", "result_limit" integer, "result_offset" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_followers"("target_user_id" "uuid", "result_limit" integer, "result_offset" integer) IS 'Get list of users following the target user';



CREATE OR REPLACE FUNCTION "public"."get_user_following"("target_user_id" "uuid", "result_limit" integer DEFAULT 50, "result_offset" integer DEFAULT 0) RETURNS TABLE("user_id" "uuid", "username" "text", "avatar_url" "text", "follower_count" integer, "following_count" integer, "followed_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.username,
    p.avatar_url,
    p.follower_count,
    p.following_count,
    uf.created_at
  FROM user_follows uf
  JOIN profiles p ON uf.following_id = p.user_id
  WHERE uf.follower_id = target_user_id
  ORDER BY uf.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;


ALTER FUNCTION "public"."get_user_following"("target_user_id" "uuid", "result_limit" integer, "result_offset" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_following"("target_user_id" "uuid", "result_limit" integer, "result_offset" integer) IS 'Get list of users being followed by the target user';



CREATE OR REPLACE FUNCTION "public"."increment_active_referral_count"("user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE profiles
  SET active_referral_count = active_referral_count + 1
  WHERE profiles.user_id = increment_active_referral_count.user_id;
END;
$$;


ALTER FUNCTION "public"."increment_active_referral_count"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_round_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.status = 'CONFIRMED' AND (OLD.status IS NULL OR OLD.status != 'CONFIRMED') THEN
    -- Increment total_raised and total_participants
    UPDATE launch_rounds
    SET 
      total_raised = total_raised + NEW.amount,
      total_participants = total_participants + 1
    WHERE id = NEW.round_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."increment_round_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invalidate_other_wallet_sessions"("p_user_id" "uuid", "p_current_wallet_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete all sessions for this user except the current wallet
  DELETE FROM auth_sessions 
  WHERE wallet_id IN (
    SELECT id FROM wallets 
    WHERE user_id = p_user_id 
      AND id != p_current_wallet_id
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."invalidate_other_wallet_sessions"("p_user_id" "uuid", "p_current_wallet_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."invalidate_other_wallet_sessions"("p_user_id" "uuid", "p_current_wallet_id" "uuid") IS 'Invalidates all sessions for a user except the specified wallet, ensures single-wallet session isolation';



CREATE OR REPLACE FUNCTION "public"."is_user_followable"("target_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  badge_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO badge_count
  FROM badge_instances
  WHERE user_id = target_user_id
    AND status = 'ACTIVE'
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN badge_count > 0;
END;
$$;


ALTER FUNCTION "public"."is_user_followable"("target_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_user_followable"("target_user_id" "uuid") IS 'Check if user has at least one active badge and can be followed';



CREATE OR REPLACE FUNCTION "public"."prevent_audit_log_modification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are append-only. Modifications not allowed.';
END;
$$;


ALTER FUNCTION "public"."prevent_audit_log_modification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_comment_like_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE post_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE post_comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_comment_like_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_follow_counts"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for the user being followed
    UPDATE profiles 
    SET follower_count = follower_count + 1 
    WHERE user_id = NEW.following_id;
    
    -- Increment following count for the follower
    UPDATE profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count for the user being unfollowed
    UPDATE profiles 
    SET follower_count = GREATEST(0, follower_count - 1)
    WHERE user_id = OLD.following_id;
    
    -- Decrement following count for the unfollower
    UPDATE profiles 
    SET following_count = GREATEST(0, following_count - 1)
    WHERE user_id = OLD.follower_id;
  END IF;
  
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_follow_counts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_post_comment_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_post_comment_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_post_like_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_post_like_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_post_view_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_post_view_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_verified_at_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.verification_status = 'VERIFIED' AND OLD.verification_status != 'VERIFIED' THEN
    NEW.verified_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_verified_at_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_created_tokens"("user_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM created_tokens WHERE creator_id = user_uuid
  );
END;
$$;


ALTER FUNCTION "public"."user_has_created_tokens"("user_uuid" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_action_approvals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action_id" "uuid" NOT NULL,
    "approved_by" "uuid" NOT NULL,
    "decision" "text" NOT NULL,
    "reason" "text",
    "approved_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admin_action_approvals_decision_check" CHECK (("decision" = ANY (ARRAY['APPROVE'::"text", 'REJECT'::"text"])))
);


ALTER TABLE "public"."admin_action_approvals" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_action_approvals" IS 'Approval/rejection records for two-man rule actions';



CREATE TABLE IF NOT EXISTS "public"."admin_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text",
    "requested_by" "uuid" NOT NULL,
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone NOT NULL,
    "executed_at" timestamp with time zone,
    "execution_result" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admin_actions_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'APPROVED'::"text", 'REJECTED'::"text", 'EXPIRED'::"text", 'EXECUTED'::"text"])))
);


ALTER TABLE "public"."admin_actions" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_actions" IS 'Two-man rule: critical actions requiring approval - Modul 12';



COMMENT ON COLUMN "public"."admin_actions"."type" IS 'Action type identifier';



COMMENT ON COLUMN "public"."admin_actions"."payload" IS 'Action-specific parameters (JSON)';



CREATE TABLE IF NOT EXISTS "public"."admin_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor_admin_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "after_data" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "before_data" "jsonb",
    "ip_address" "text",
    "user_agent" "text"
);


ALTER TABLE "public"."admin_audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_audit_logs" IS 'Comprehensive audit trail for all admin actions on contract security system';



COMMENT ON COLUMN "public"."admin_audit_logs"."actor_admin_id" IS 'Admin user_id from profiles table';



COMMENT ON COLUMN "public"."admin_audit_logs"."action" IS 'Specific admin action taken';



COMMENT ON COLUMN "public"."admin_audit_logs"."entity_type" IS 'Type of entity being acted upon';



COMMENT ON COLUMN "public"."admin_audit_logs"."entity_id" IS 'ID of entity (UUID as text for flexibility)';



COMMENT ON COLUMN "public"."admin_audit_logs"."after_data" IS 'Entity state after action (JSON)';



COMMENT ON COLUMN "public"."admin_audit_logs"."before_data" IS 'Entity state before action (JSON)';



COMMENT ON COLUMN "public"."admin_audit_logs"."ip_address" IS 'IP address of admin when action performed';



COMMENT ON COLUMN "public"."admin_audit_logs"."user_agent" IS 'User agent string of admin browser';



CREATE TABLE IF NOT EXISTS "public"."admin_permissions" (
    "role" "text" NOT NULL,
    "permission" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_permissions" IS 'Permission matrix defining what each admin role can do (Modul 12 spec)';



CREATE TABLE IF NOT EXISTS "public"."admin_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admin_roles_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'kyc_reviewer'::"text", 'moderator'::"text", 'finance'::"text", 'reviewer'::"text", 'ops'::"text", 'support'::"text"])))
);


ALTER TABLE "public"."admin_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_roles" IS 'Admin user roles (one user can have multiple roles) - Modul 12';



COMMENT ON COLUMN "public"."admin_roles"."role" IS 'Admin role types: super_admin, admin, kyc_reviewer, moderator, finance, reviewer, ops, support';



CREATE TABLE IF NOT EXISTS "public"."ama_join_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ama_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ama_join_tokens_check" CHECK (("expires_at" <= ("created_at" + '00:15:00'::interval))),
    CONSTRAINT "ama_join_tokens_check1" CHECK (("expires_at" >= ("created_at" + '00:05:00'::interval))),
    CONSTRAINT "ama_join_tokens_check2" CHECK ((("used_at" IS NULL) OR ("used_at" <= "expires_at")))
);


ALTER TABLE "public"."ama_join_tokens" OWNER TO "postgres";


COMMENT ON TABLE "public"."ama_join_tokens" IS 'Secure join tokens dengan TTL enforcement';



COMMENT ON COLUMN "public"."ama_join_tokens"."user_id" IS 'Participant user_id (references profiles.user_id)';



COMMENT ON COLUMN "public"."ama_join_tokens"."expires_at" IS 'TTL 5-15 minutes enforced at database level';



CREATE TABLE IF NOT EXISTS "public"."ama_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ama_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "message_type" "text" DEFAULT 'USER'::"text",
    "username" "text",
    "avatar_url" "text",
    "is_developer" boolean DEFAULT false,
    "is_verified" boolean DEFAULT false,
    "is_deleted" boolean DEFAULT false,
    "is_pinned_message" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ama_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ama_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "developer_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "scheduled_at" timestamp with time zone NOT NULL,
    "description" "text" NOT NULL,
    "payment_tx_hash" "text" NOT NULL,
    "payment_amount_bnb" numeric NOT NULL,
    "request_id_bytes32" "text" NOT NULL,
    "chain_id" integer DEFAULT 97,
    "status" "text" DEFAULT 'PENDING'::"text",
    "is_pinned" boolean DEFAULT false,
    "pinned_at" timestamp with time zone,
    "pinned_by" "uuid",
    "rejection_reason" "text",
    "refund_tx_hash" "text",
    "started_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ama_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ama_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "host_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'SUBMITTED'::"text" NOT NULL,
    "scheduled_at" timestamp with time zone NOT NULL,
    "started_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "payment_tx_hash" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ama_sessions_check" CHECK ((("ended_at" IS NULL) OR ("ended_at" > "started_at"))),
    CONSTRAINT "ama_sessions_check1" CHECK ((("started_at" IS NULL) OR ("started_at" >= "scheduled_at"))),
    CONSTRAINT "ama_sessions_status_check" CHECK (("status" = ANY (ARRAY['SUBMITTED'::"text", 'PAID'::"text", 'APPROVED'::"text", 'LIVE'::"text", 'ENDED'::"text", 'CANCELLED'::"text"]))),
    CONSTRAINT "ama_sessions_title_check" CHECK ((("char_length"("title") >= 5) AND ("char_length"("title") <= 200))),
    CONSTRAINT "ama_sessions_type_check" CHECK (("type" = ANY (ARRAY['TEXT'::"text", 'VOICE'::"text", 'VIDEO'::"text"])))
);


ALTER TABLE "public"."ama_sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."ama_sessions" IS 'AMA live sessions (TEXT/VOICE/VIDEO)';



COMMENT ON COLUMN "public"."ama_sessions"."host_id" IS 'Developer/creator user_id (references profiles.user_id)';



CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor_admin_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "before_data" "jsonb",
    "after_data" "jsonb",
    "ip_address" "text",
    "user_agent" "text",
    "trace_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_logs" IS 'Append-only audit log for admin actions (no UPDATE/DELETE allowed)';



CREATE TABLE IF NOT EXISTS "public"."auth_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "wallet_address" "text" NOT NULL,
    "chain" "text" NOT NULL,
    "session_token" "text" NOT NULL,
    "nonce" "text",
    "expires_at" timestamp without time zone NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "last_used_at" timestamp without time zone DEFAULT "now"(),
    "user_agent" "text",
    "ip_address" "text",
    "wallet_id" "uuid"
);


ALTER TABLE "public"."auth_sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."auth_sessions" IS 'Custom authentication sessions using wallet addresses only, no email required';



COMMENT ON COLUMN "public"."auth_sessions"."wallet_address" IS 'Wallet address (normalized: lowercase for EVM, original for Solana)';



COMMENT ON COLUMN "public"."auth_sessions"."chain" IS 'Blockchain network identifier (SOLANA, EVM_1, etc)';



COMMENT ON COLUMN "public"."auth_sessions"."session_token" IS 'Secure random token stored in HTTP-only cookie';



COMMENT ON COLUMN "public"."auth_sessions"."expires_at" IS 'Session expiration timestamp (default 30 days)';



COMMENT ON COLUMN "public"."auth_sessions"."wallet_id" IS 'Direct reference to the wallet used for this session, enables wallet-isolated authentication';



CREATE TABLE IF NOT EXISTS "public"."badge_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "badge_key" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon_url" "text",
    "badge_type" "text" NOT NULL,
    "auto_award_criteria" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "scope" "text" DEFAULT 'PROJECT'::"text",
    CONSTRAINT "badge_definitions_badge_type_check" CHECK (("badge_type" = ANY (ARRAY['KYC'::"text", 'SECURITY'::"text", 'MILESTONE'::"text", 'SPECIAL'::"text"]))),
    CONSTRAINT "badge_definitions_scope_check" CHECK (("scope" = ANY (ARRAY['USER'::"text", 'PROJECT'::"text"])))
);


ALTER TABLE "public"."badge_definitions" OWNER TO "postgres";


COMMENT ON TABLE "public"."badge_definitions" IS 'Master catalog of all available badges (user badges + project badges)';



COMMENT ON COLUMN "public"."badge_definitions"."badge_key" IS 'Standardized badge keys. For developer KYC verification, use DEVELOPER_KYC_VERIFIED only.';



COMMENT ON COLUMN "public"."badge_definitions"."auto_award_criteria" IS 'JSON rules for automatic badge awarding';



COMMENT ON COLUMN "public"."badge_definitions"."scope" IS 'Badge scope: USER (attached to user profile) or PROJECT (attached to project). DEVELOPER_KYC_VERIFIED is a USER badge.';



CREATE TABLE IF NOT EXISTS "public"."badge_instances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'ACTIVE'::"text",
    "awarded_at" timestamp with time zone DEFAULT "now"(),
    "awarded_by" "uuid",
    "revoked_at" timestamp with time zone,
    "revoked_by" "uuid",
    "expires_at" timestamp with time zone,
    "award_reason" "text",
    "revoke_reason" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "badge_instances_status_check" CHECK (("status" = ANY (ARRAY['ACTIVE'::"text", 'EXPIRED'::"text", 'REVOKED'::"text"])))
);


ALTER TABLE "public"."badge_instances" OWNER TO "postgres";


COMMENT ON TABLE "public"."badge_instances" IS 'User badge instances - awarded badges with status tracking (ACTIVE/EXPIRED/REVOKED)';



COMMENT ON COLUMN "public"."badge_instances"."user_id" IS 'User ID from wallets table (wallet-only auth, no auth.users dependency)';



COMMENT ON COLUMN "public"."badge_instances"."status" IS 'Badge status: ACTIVE (currently valid), EXPIRED (time-based expiry), REVOKED (manually removed)';



COMMENT ON COLUMN "public"."badge_instances"."awarded_by" IS 'Admin user ID who awarded the badge (NULL for auto-awards)';



COMMENT ON COLUMN "public"."badge_instances"."revoked_by" IS 'Admin user ID who revoked the badge';



COMMENT ON COLUMN "public"."badge_instances"."expires_at" IS 'NULL for permanent badges, timestamp for time-limited badges';



CREATE TABLE IF NOT EXISTS "public"."bluecheck_purchases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "price_usd" numeric(10,2) DEFAULT 10.00 NOT NULL,
    "payment_chain" "text" NOT NULL,
    "payment_token" "text" NOT NULL,
    "payment_amount" numeric(78,0) NOT NULL,
    "payment_tx_hash" "text",
    "status" "text" DEFAULT 'INTENT'::"text" NOT NULL,
    "intent_expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "bluecheck_purchases_payment_amount_check" CHECK (("payment_amount" > (0)::numeric)),
    CONSTRAINT "bluecheck_purchases_status_check" CHECK (("status" = ANY (ARRAY['INTENT'::"text", 'PENDING'::"text", 'CONFIRMED'::"text", 'FAILED'::"text"])))
);


ALTER TABLE "public"."bluecheck_purchases" OWNER TO "postgres";


COMMENT ON TABLE "public"."bluecheck_purchases" IS 'Blue Check purchase flow ($10 lifetime)';



CREATE TABLE IF NOT EXISTS "public"."bonding_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pool_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "event_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "triggered_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "bonding_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['POOL_CREATED'::"text", 'DEPLOY_INTENT_GENERATED'::"text", 'DEPLOY_FEE_PAID'::"text", 'DEPLOY_STARTED'::"text", 'DEPLOY_CONFIRMED'::"text", 'DEPLOY_FAILED'::"text", 'SWAP_EXECUTED'::"text", 'GRADUATION_THRESHOLD_REACHED'::"text", 'GRADUATION_STARTED'::"text", 'MIGRATION_INTENT_GENERATED'::"text", 'MIGRATION_FEE_PAID'::"text", 'MIGRATION_COMPLETED'::"text", 'MIGRATION_FAILED'::"text", 'LP_LOCK_CREATED'::"text", 'STATUS_CHANGED'::"text", 'POOL_PAUSED'::"text", 'POOL_RESUMED'::"text", 'POOL_FAILED'::"text"])))
);


ALTER TABLE "public"."bonding_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."bonding_events" IS 'Comprehensive audit log for all bonding pool events';



CREATE TABLE IF NOT EXISTS "public"."bonding_pools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "token_mint" "text" NOT NULL,
    "token_name" "text" NOT NULL,
    "token_symbol" "text" NOT NULL,
    "token_decimals" integer DEFAULT 9 NOT NULL,
    "total_supply" bigint NOT NULL,
    "virtual_sol_reserves" bigint NOT NULL,
    "virtual_token_reserves" bigint NOT NULL,
    "actual_sol_reserves" bigint DEFAULT 0 NOT NULL,
    "actual_token_reserves" bigint NOT NULL,
    "deploy_fee_sol" bigint DEFAULT 500000000 NOT NULL,
    "deploy_tx_hash" "text",
    "deploy_tx_verified" boolean DEFAULT false NOT NULL,
    "swap_fee_bps" integer DEFAULT 150 NOT NULL,
    "graduation_threshold_sol" bigint NOT NULL,
    "migration_fee_sol" bigint DEFAULT '2500000000'::bigint NOT NULL,
    "migration_fee_tx_hash" "text",
    "migration_fee_verified" boolean DEFAULT false NOT NULL,
    "status" "text" DEFAULT 'DRAFT'::"text" NOT NULL,
    "failure_reason" "text",
    "target_dex" "text",
    "dex_pool_address" "text",
    "migration_tx_hash" "text",
    "lp_lock_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deployed_at" timestamp with time zone,
    "graduated_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "bonding_pools_actual_sol_reserves_check" CHECK (("actual_sol_reserves" >= 0)),
    CONSTRAINT "bonding_pools_actual_token_reserves_check" CHECK (("actual_token_reserves" >= 0)),
    CONSTRAINT "bonding_pools_deploy_fee_sol_check" CHECK (("deploy_fee_sol" >= 0)),
    CONSTRAINT "bonding_pools_graduation" CHECK (((("status" = 'GRADUATED'::"text") AND ("graduated_at" IS NOT NULL) AND ("lp_lock_id" IS NOT NULL)) OR ("status" <> 'GRADUATED'::"text"))),
    CONSTRAINT "bonding_pools_graduation_threshold_sol_check" CHECK (("graduation_threshold_sol" > 0)),
    CONSTRAINT "bonding_pools_migration_fee_sol_check" CHECK (("migration_fee_sol" >= 0)),
    CONSTRAINT "bonding_pools_status_check" CHECK (("status" = ANY (ARRAY['DRAFT'::"text", 'DEPLOYING'::"text", 'LIVE'::"text", 'GRADUATING'::"text", 'GRADUATED'::"text", 'FAILED'::"text", 'PAUSED'::"text"]))),
    CONSTRAINT "bonding_pools_status_transition" CHECK (((("status" = 'DRAFT'::"text") AND ("deployed_at" IS NULL)) OR (("status" = ANY (ARRAY['DEPLOYING'::"text", 'LIVE'::"text", 'GRADUATING'::"text", 'GRADUATED'::"text", 'PAUSED'::"text"])) AND ("deployed_at" IS NOT NULL)) OR (("status" = 'FAILED'::"text") AND ("failure_reason" IS NOT NULL)))),
    CONSTRAINT "bonding_pools_swap_fee_bps_check" CHECK ((("swap_fee_bps" >= 0) AND ("swap_fee_bps" <= 10000))),
    CONSTRAINT "bonding_pools_target_dex_check" CHECK (("target_dex" = ANY (ARRAY['RAYDIUM'::"text", 'ORCA'::"text"]))),
    CONSTRAINT "bonding_pools_token_decimals_check" CHECK ((("token_decimals" >= 0) AND ("token_decimals" <= 18))),
    CONSTRAINT "bonding_pools_token_name_check" CHECK (("char_length"("token_name") <= 32)),
    CONSTRAINT "bonding_pools_token_symbol_check" CHECK (("char_length"("token_symbol") <= 8)),
    CONSTRAINT "bonding_pools_total_supply_check" CHECK (("total_supply" > 0)),
    CONSTRAINT "bonding_pools_virtual_sol_reserves_check" CHECK (("virtual_sol_reserves" > 0)),
    CONSTRAINT "bonding_pools_virtual_token_reserves_check" CHECK (("virtual_token_reserves" > 0))
);


ALTER TABLE "public"."bonding_pools" OWNER TO "postgres";


COMMENT ON TABLE "public"."bonding_pools" IS 'Solana bonding curve pools with status lifecycle tracking';



COMMENT ON COLUMN "public"."bonding_pools"."virtual_sol_reserves" IS 'Virtual SOL reserves for constant-product AMM formula';



COMMENT ON COLUMN "public"."bonding_pools"."virtual_token_reserves" IS 'Virtual token reserves for constant-product AMM formula';



COMMENT ON COLUMN "public"."bonding_pools"."actual_sol_reserves" IS 'Real SOL collected from swaps (used for graduation threshold)';



COMMENT ON COLUMN "public"."bonding_pools"."swap_fee_bps" IS 'Swap fee in basis points (150 = 1.5%)';



CREATE TABLE IF NOT EXISTS "public"."bonding_swaps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pool_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "swap_type" "text" NOT NULL,
    "input_amount" bigint NOT NULL,
    "output_amount" bigint NOT NULL,
    "price_per_token" bigint NOT NULL,
    "swap_fee_amount" bigint NOT NULL,
    "treasury_fee" bigint NOT NULL,
    "referral_pool_fee" bigint NOT NULL,
    "tx_hash" "text" NOT NULL,
    "signature_verified" boolean DEFAULT false NOT NULL,
    "referrer_id" "uuid",
    "sol_reserves_before" bigint NOT NULL,
    "token_reserves_before" bigint NOT NULL,
    "sol_reserves_after" bigint NOT NULL,
    "token_reserves_after" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "bonding_swaps_fee_split" CHECK ((("treasury_fee" + "referral_pool_fee") = "swap_fee_amount")),
    CONSTRAINT "bonding_swaps_input_amount_check" CHECK (("input_amount" > 0)),
    CONSTRAINT "bonding_swaps_output_amount_check" CHECK (("output_amount" > 0)),
    CONSTRAINT "bonding_swaps_price_per_token_check" CHECK (("price_per_token" > 0)),
    CONSTRAINT "bonding_swaps_referral_pool_fee_check" CHECK (("referral_pool_fee" >= 0)),
    CONSTRAINT "bonding_swaps_swap_fee_amount_check" CHECK (("swap_fee_amount" >= 0)),
    CONSTRAINT "bonding_swaps_swap_type_check" CHECK (("swap_type" = ANY (ARRAY['BUY'::"text", 'SELL'::"text"]))),
    CONSTRAINT "bonding_swaps_treasury_fee_check" CHECK (("treasury_fee" >= 0))
);


ALTER TABLE "public"."bonding_swaps" OWNER TO "postgres";


COMMENT ON TABLE "public"."bonding_swaps" IS 'All buy/sell swaps on bonding curves with fee split (1.5% → 50% Treasury / 50% Referral Pool)';



COMMENT ON COLUMN "public"."bonding_swaps"."treasury_fee" IS '50% of swap fee goes to Treasury';



COMMENT ON COLUMN "public"."bonding_swaps"."referral_pool_fee" IS '50% of swap fee goes to Referral Pool';



CREATE TABLE IF NOT EXISTS "public"."comment_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "comment_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."comment_likes" OWNER TO "postgres";


COMMENT ON TABLE "public"."comment_likes" IS 'Likes on comments';



CREATE TABLE IF NOT EXISTS "public"."contract_audit_proofs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "auditor_name" "text" NOT NULL,
    "report_url" "text" NOT NULL,
    "report_hash" "text",
    "audit_date" "date",
    "scope" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'PENDING'::"text",
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "rejection_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "contract_audit_proofs_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'VERIFIED'::"text", 'REJECTED'::"text"])))
);


ALTER TABLE "public"."contract_audit_proofs" OWNER TO "postgres";


COMMENT ON TABLE "public"."contract_audit_proofs" IS 'Professional audit report submissions for SECURITY_AUDITED badge';



COMMENT ON COLUMN "public"."contract_audit_proofs"."auditor_name" IS 'Name of auditing firm (e.g., Certik, Hacken)';



COMMENT ON COLUMN "public"."contract_audit_proofs"."report_url" IS 'URL to audit report PDF or public page';



COMMENT ON COLUMN "public"."contract_audit_proofs"."report_hash" IS 'SHA256 hash of report for verification';



COMMENT ON COLUMN "public"."contract_audit_proofs"."scope" IS 'JSON: which contracts/functions were audited';



COMMENT ON COLUMN "public"."contract_audit_proofs"."status" IS 'PENDING (awaiting review), VERIFIED (approved), REJECTED (denied)';



CREATE TABLE IF NOT EXISTS "public"."contributions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "round_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "wallet_address" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "chain" "text" NOT NULL,
    "tx_hash" "text" NOT NULL,
    "tx_id" "uuid",
    "status" "text" DEFAULT 'PENDING'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "confirmed_at" timestamp with time zone,
    "claimed_at" timestamp with time zone,
    "claim_tx_hash" "text",
    CONSTRAINT "contributions_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "contributions_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'CONFIRMED'::"text", 'FAILED'::"text", 'REFUNDED'::"text"])))
);


ALTER TABLE "public"."contributions" OWNER TO "postgres";


COMMENT ON TABLE "public"."contributions" IS 'User contributions to launch rounds';



COMMENT ON COLUMN "public"."contributions"."user_id" IS 'User ID - nullable for wallet-only auth where auth.users may not be populated';



COMMENT ON COLUMN "public"."contributions"."chain" IS 'Blockchain where contribution was made (BSC, ETHEREUM, SOLANA, etc.)';



COMMENT ON COLUMN "public"."contributions"."status" IS 'Contribution lifecycle: PENDING -> CONFIRMED/FAILED/REFUNDED';



CREATE TABLE IF NOT EXISTS "public"."created_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "creator_wallet" "text" NOT NULL,
    "token_address" "text" NOT NULL,
    "chain" "text" NOT NULL,
    "token_name" "text" NOT NULL,
    "token_symbol" "text" NOT NULL,
    "decimals" integer DEFAULT 18 NOT NULL,
    "total_supply" numeric NOT NULL,
    "anti_bot_config" "jsonb" DEFAULT '{}'::"jsonb",
    "creation_fee_paid" numeric NOT NULL,
    "creation_fee_token" "text" DEFAULT 'NATIVE'::"text" NOT NULL,
    "creation_tx_hash" "text" NOT NULL,
    "factory_address" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "created_tokens_creation_fee_paid_check" CHECK (("creation_fee_paid" >= (0)::numeric)),
    CONSTRAINT "created_tokens_total_supply_check" CHECK (("total_supply" > (0)::numeric))
);


ALTER TABLE "public"."created_tokens" OWNER TO "postgres";


COMMENT ON TABLE "public"."created_tokens" IS 'Tracks tokens created via platform TokenFactory';



CREATE TABLE IF NOT EXISTS "public"."launch_rounds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "chain" "text" NOT NULL,
    "token_address" "text" NOT NULL,
    "raise_asset" "text" NOT NULL,
    "start_at" timestamp with time zone NOT NULL,
    "end_at" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'DRAFT'::"text",
    "result" "text" DEFAULT 'NONE'::"text",
    "kyc_status_at_submit" "text",
    "scan_status_at_submit" "text",
    "params" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "total_raised" numeric DEFAULT 0,
    "total_participants" integer DEFAULT 0,
    "rejection_reason" "text",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "finalized_by" "uuid",
    "finalized_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "vesting_status" "text" DEFAULT 'NONE'::"text",
    "lock_status" "text" DEFAULT 'NONE'::"text",
    "success_gated_at" timestamp with time zone,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "sale_type" "text" DEFAULT 'presale'::"text",
    "fee_splitter_address" "text",
    "chain_id" integer DEFAULT 97,
    "round_address" "text",
    "vesting_vault_address" "text",
    "schedule_salt" "text",
    "merkle_root" "text",
    "tge_timestamp" bigint,
    "created_token_id" "uuid",
    "listing_premium_bps" integer,
    "final_price" numeric,
    "listing_price" numeric,
    "tokens_deposited_at" timestamp with time zone,
    "security_badges" "text"[] DEFAULT '{}'::"text"[],
    "token_source" "text",
    "pool_address" "text",
    "contract_address" "text",
    "deployment_status" "text" DEFAULT 'NOT_DEPLOYED'::"text",
    "verification_status" "text" DEFAULT 'NOT_VERIFIED'::"text",
    "deployment_tx_hash" "text",
    "deployment_block_number" bigint,
    "deployer_address" "text",
    "deployed_at" timestamp with time zone,
    "verification_guid" "text",
    "verified_at" timestamp with time zone,
    "verification_attempts" integer DEFAULT 0,
    "verification_error" "text",
    "tokens_funded_at" timestamp with time zone,
    "funding_tx_hash" "text",
    "escrow_tx_hash" "text",
    "escrow_amount" numeric(78,0),
    "creation_fee_paid" numeric(78,0),
    "creation_fee_tx_hash" "text",
    "admin_deployer_id" "uuid",
    "paused_at" timestamp with time zone,
    "pause_reason" "text",
    "last_verification_error" "text",
    "vesting_verification_status" "text",
    "vesting_verified_at" timestamp with time zone,
    CONSTRAINT "launch_rounds_deployment_status_check" CHECK (("deployment_status" = ANY (ARRAY['NOT_DEPLOYED'::"text", 'DEPLOYING'::"text", 'DEPLOYED'::"text", 'DEPLOYMENT_FAILED'::"text", 'PENDING_FUNDING'::"text", 'FUNDED'::"text", 'READY'::"text"]))),
    CONSTRAINT "launch_rounds_lock_status_check" CHECK (("lock_status" = ANY (ARRAY['NONE'::"text", 'PENDING'::"text", 'LOCKED'::"text", 'FAILED'::"text"]))),
    CONSTRAINT "launch_rounds_result_check" CHECK (("result" = ANY (ARRAY['NONE'::"text", 'SUCCESS'::"text", 'FAILED'::"text", 'CANCELED'::"text"]))),
    CONSTRAINT "launch_rounds_sale_type_check" CHECK (("sale_type" = ANY (ARRAY['presale'::"text", 'fairlaunch'::"text"]))),
    CONSTRAINT "launch_rounds_status_check" CHECK (("status" = ANY (ARRAY['DRAFT'::"text", 'SUBMITTED'::"text", 'SUBMITTED_FOR_REVIEW'::"text", 'APPROVED'::"text", 'APPROVED_TO_DEPLOY'::"text", 'REJECTED'::"text", 'DEPLOYED'::"text", 'ACTIVE'::"text", 'ENDED'::"text", 'FAILED'::"text", 'CANCELLED'::"text"]))),
    CONSTRAINT "launch_rounds_token_source_check" CHECK (("token_source" = ANY (ARRAY['factory'::"text", 'existing'::"text"]))),
    CONSTRAINT "launch_rounds_total_participants_check" CHECK (("total_participants" >= 0)),
    CONSTRAINT "launch_rounds_total_raised_check" CHECK (("total_raised" >= (0)::numeric)),
    CONSTRAINT "launch_rounds_type_check" CHECK (("type" = ANY (ARRAY['PRESALE'::"text", 'FAIRLAUNCH'::"text"]))),
    CONSTRAINT "launch_rounds_verification_status_check" CHECK (("verification_status" = ANY (ARRAY['NOT_VERIFIED'::"text", 'VERIFICATION_PENDING'::"text", 'VERIFICATION_QUEUED'::"text", 'VERIFIED'::"text", 'VERIFICATION_FAILED'::"text"]))),
    CONSTRAINT "launch_rounds_vesting_status_check" CHECK (("vesting_status" = ANY (ARRAY['NONE'::"text", 'PENDING'::"text", 'CONFIRMED'::"text", 'FAILED'::"text"]))),
    CONSTRAINT "launch_rounds_vesting_verification_status_check" CHECK (("vesting_verification_status" = ANY (ARRAY['NOT_VERIFIED'::"text", 'VERIFICATION_PENDING'::"text", 'VERIFICATION_QUEUED'::"text", 'VERIFIED'::"text", 'VERIFICATION_FAILED'::"text"]))),
    CONSTRAINT "valid_chain" CHECK ((("chain" ~ '^[0-9]+$'::"text") OR ("chain" = 'SOLANA'::"text"))),
    CONSTRAINT "valid_timing" CHECK (("end_at" > "start_at"))
);


ALTER TABLE "public"."launch_rounds" OWNER TO "postgres";


COMMENT ON TABLE "public"."launch_rounds" IS 'Main pool configuration for presale and fairlaunch rounds';



COMMENT ON COLUMN "public"."launch_rounds"."type" IS 'Pool type: PRESALE (fixed price) or FAIRLAUNCH (price discovery)';



COMMENT ON COLUMN "public"."launch_rounds"."kyc_status_at_submit" IS 'Snapshot of project KYC status when round submitted';



COMMENT ON COLUMN "public"."launch_rounds"."scan_status_at_submit" IS 'Snapshot of SC scan status when round submitted';



COMMENT ON COLUMN "public"."launch_rounds"."params" IS 'Pool-specific JSON parameters';



COMMENT ON COLUMN "public"."launch_rounds"."rejection_reason" IS 'Admin rejection reason (visible to owner for resubmission)';



COMMENT ON COLUMN "public"."launch_rounds"."created_by" IS 'FK to profiles.user_id (wallet-only auth compatible)';



COMMENT ON COLUMN "public"."launch_rounds"."success_gated_at" IS 'Timestamp when all three success gates (round, vesting, lock) were passed';



COMMENT ON COLUMN "public"."launch_rounds"."reviewed_by" IS 'Profile user_id of admin who approved/rejected this presale';



COMMENT ON COLUMN "public"."launch_rounds"."reviewed_at" IS 'Timestamp when admin made review decision';



COMMENT ON COLUMN "public"."launch_rounds"."sale_type" IS 'Type of sale: presale (fixed price + hardcap) or fairlaunch (no hardcap, final price = total_raised / tokens_for_sale)';



COMMENT ON COLUMN "public"."launch_rounds"."fee_splitter_address" IS 'Reference to the FeeSplitter contract address for this presale';



COMMENT ON COLUMN "public"."launch_rounds"."chain_id" IS 'Blockchain chain ID (97 = BSC Testnet, 56 = BSC Mainnet)';



COMMENT ON COLUMN "public"."launch_rounds"."round_address" IS 'PresaleRound contract address';



COMMENT ON COLUMN "public"."launch_rounds"."vesting_vault_address" IS 'MerkleVesting contract address';



COMMENT ON COLUMN "public"."launch_rounds"."merkle_root" IS 'Merkle root for token allocations (set during finalization)';



COMMENT ON COLUMN "public"."launch_rounds"."tge_timestamp" IS 'Token Generation Event timestamp';



COMMENT ON COLUMN "public"."launch_rounds"."security_badges" IS 'Array of security badge slugs automatically assigned based on token source and security scan results. Factory tokens get SAFU badge, scanned tokens get badges based on GoPlus API checks.';



COMMENT ON COLUMN "public"."launch_rounds"."token_source" IS 'Source of the token contract. ''factory'' = created via platform TokenFactory (auto-approved, SAFU badge). ''existing'' = user-provided existing contract (requires GoPlus security scan).';



COMMENT ON COLUMN "public"."launch_rounds"."pool_address" IS 'DEX liquidity pool contract address (created after finalization)';



COMMENT ON COLUMN "public"."launch_rounds"."contract_address" IS 'Deployed Fairlaunch or Presale contract address on the specified chain';



COMMENT ON COLUMN "public"."launch_rounds"."deployment_status" IS 'Tracks deployment lifecycle for direct deployment architecture';



COMMENT ON COLUMN "public"."launch_rounds"."verification_status" IS 'Tracks verification status on block explorer';



COMMENT ON COLUMN "public"."launch_rounds"."deployment_tx_hash" IS 'Transaction hash of contract deployment';



COMMENT ON COLUMN "public"."launch_rounds"."deployment_block_number" IS 'Block number where contract was deployed';



COMMENT ON COLUMN "public"."launch_rounds"."deployer_address" IS 'Platform deployer wallet address that deployed the contract';



COMMENT ON COLUMN "public"."launch_rounds"."deployed_at" IS 'Timestamp when admin deployed the contract';



COMMENT ON COLUMN "public"."launch_rounds"."verification_guid" IS 'Block explorer verification GUID for status tracking';



COMMENT ON COLUMN "public"."launch_rounds"."verified_at" IS 'Timestamp when contract was verified on block explorer';



COMMENT ON COLUMN "public"."launch_rounds"."verification_attempts" IS 'Number of verification attempts (max 3)';



COMMENT ON COLUMN "public"."launch_rounds"."verification_error" IS 'Last verification error message if failed';



COMMENT ON COLUMN "public"."launch_rounds"."tokens_funded_at" IS 'Timestamp when tokens were sent to deployed contract';



COMMENT ON COLUMN "public"."launch_rounds"."funding_tx_hash" IS 'Transaction hash of token funding to contract';



COMMENT ON COLUMN "public"."launch_rounds"."escrow_tx_hash" IS 'Transaction hash when tokens were escrowed';



COMMENT ON COLUMN "public"."launch_rounds"."escrow_amount" IS 'Amount of tokens in escrow (in wei)';



COMMENT ON COLUMN "public"."launch_rounds"."creation_fee_paid" IS 'Creation fee paid in native token (in wei)';



COMMENT ON COLUMN "public"."launch_rounds"."creation_fee_tx_hash" IS 'Transaction hash for creation fee payment';



COMMENT ON COLUMN "public"."launch_rounds"."admin_deployer_id" IS 'Profile ID of admin who deployed the contract';



COMMENT ON COLUMN "public"."launch_rounds"."paused_at" IS 'Timestamp when project was paused by admin';



COMMENT ON COLUMN "public"."launch_rounds"."pause_reason" IS 'Reason for pausing the project';



CREATE OR REPLACE VIEW "public"."deployment_pipeline" AS
 SELECT "id",
    "type",
    "contract_address",
    "chain",
    "deployment_status",
    "verification_status",
    "deployer_address",
    "deployment_tx_hash",
    "deployed_at",
    "verified_at",
    "tokens_funded_at",
    "created_at"
   FROM "public"."launch_rounds"
  WHERE ("deployment_status" <> 'NOT_DEPLOYED'::"text")
  ORDER BY "created_at" DESC;


ALTER VIEW "public"."deployment_pipeline" OWNER TO "postgres";


COMMENT ON VIEW "public"."deployment_pipeline" IS 'Overview of all direct deployments';



CREATE TABLE IF NOT EXISTS "public"."dex_migrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pool_id" "uuid" NOT NULL,
    "target_dex" "text" NOT NULL,
    "sol_migrated" bigint NOT NULL,
    "tokens_migrated" bigint NOT NULL,
    "migration_fee_paid" bigint NOT NULL,
    "migration_fee_tx_hash" "text",
    "dex_pool_address" "text" NOT NULL,
    "creation_tx_hash" "text" NOT NULL,
    "lp_token_mint" "text" NOT NULL,
    "lp_amount_locked" bigint NOT NULL,
    "lp_lock_id" "uuid",
    "lp_lock_duration_months" integer NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "failure_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    CONSTRAINT "dex_migrations_completed" CHECK (((("status" = 'COMPLETED'::"text") AND ("completed_at" IS NOT NULL) AND ("lp_lock_id" IS NOT NULL)) OR ("status" <> 'COMPLETED'::"text"))),
    CONSTRAINT "dex_migrations_failed" CHECK (((("status" = 'FAILED'::"text") AND ("failure_reason" IS NOT NULL)) OR ("status" <> 'FAILED'::"text"))),
    CONSTRAINT "dex_migrations_lp_amount_locked_check" CHECK (("lp_amount_locked" > 0)),
    CONSTRAINT "dex_migrations_lp_lock_duration_months_check" CHECK (("lp_lock_duration_months" >= 12)),
    CONSTRAINT "dex_migrations_migration_fee_paid_check" CHECK (("migration_fee_paid" >= 0)),
    CONSTRAINT "dex_migrations_sol_migrated_check" CHECK (("sol_migrated" > 0)),
    CONSTRAINT "dex_migrations_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'COMPLETED'::"text", 'FAILED'::"text"]))),
    CONSTRAINT "dex_migrations_target_dex_check" CHECK (("target_dex" = ANY (ARRAY['RAYDIUM'::"text", 'ORCA'::"text"]))),
    CONSTRAINT "dex_migrations_tokens_migrated_check" CHECK (("tokens_migrated" > 0))
);


ALTER TABLE "public"."dex_migrations" OWNER TO "postgres";


COMMENT ON TABLE "public"."dex_migrations" IS 'DEX migration tracking with LP lock integration (FASE 5)';



COMMENT ON COLUMN "public"."dex_migrations"."lp_lock_duration_months" IS 'LP lock duration in months (minimum 12 enforced)';



CREATE TABLE IF NOT EXISTS "public"."fee_splits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_type" "text" NOT NULL,
    "source_id" "uuid" NOT NULL,
    "total_amount" numeric(78,0) NOT NULL,
    "treasury_amount" numeric(78,0) NOT NULL,
    "referral_pool_amount" numeric(78,0) NOT NULL,
    "asset" "text" NOT NULL,
    "chain" "text" NOT NULL,
    "processed" boolean DEFAULT false NOT NULL,
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "fee_splits_check" CHECK (("treasury_amount" = (("total_amount" * (70)::numeric) / (100)::numeric))),
    CONSTRAINT "fee_splits_check1" CHECK (("referral_pool_amount" = (("total_amount" * (30)::numeric) / (100)::numeric))),
    CONSTRAINT "fee_splits_check2" CHECK ((("treasury_amount" + "referral_pool_amount") = "total_amount")),
    CONSTRAINT "fee_splits_referral_pool_amount_check" CHECK (("referral_pool_amount" > (0)::numeric)),
    CONSTRAINT "fee_splits_source_type_check" CHECK (("source_type" = ANY (ARRAY['PRESALE'::"text", 'FAIRLAUNCH'::"text", 'BONDING'::"text", 'BLUECHECK'::"text"]))),
    CONSTRAINT "fee_splits_total_amount_check" CHECK (("total_amount" > (0)::numeric)),
    CONSTRAINT "fee_splits_treasury_amount_check" CHECK (("treasury_amount" > (0)::numeric))
);


ALTER TABLE "public"."fee_splits" OWNER TO "postgres";


COMMENT ON TABLE "public"."fee_splits" IS '70/30 fee distribution (Treasury vs Referral Pool)';



COMMENT ON COLUMN "public"."fee_splits"."treasury_amount" IS 'Always 70% of total_amount';



COMMENT ON COLUMN "public"."fee_splits"."referral_pool_amount" IS 'Always 30% of total_amount';



CREATE TABLE IF NOT EXISTS "public"."kyc_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "submission_type" "text" NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text",
    "documents_url" "text" NOT NULL,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "rejection_reason" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "kyc_submissions_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'APPROVED'::"text", 'REJECTED'::"text"]))),
    CONSTRAINT "kyc_submissions_submission_type_check" CHECK (("submission_type" = ANY (ARRAY['INDIVIDUAL'::"text", 'BUSINESS'::"text"])))
);


ALTER TABLE "public"."kyc_submissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."kyc_submissions" IS 'KYC document submissions for project owners';



COMMENT ON COLUMN "public"."kyc_submissions"."user_id" IS 'User ID (references profiles.user_id for wallet-only auth)';



COMMENT ON COLUMN "public"."kyc_submissions"."submission_type" IS 'Type: INDIVIDUAL for personal, BUSINESS for company';



COMMENT ON COLUMN "public"."kyc_submissions"."documents_url" IS 'URL to encrypted KYC documents storage';



COMMENT ON COLUMN "public"."kyc_submissions"."reviewed_by" IS 'Admin user_id who reviewed (references profiles.user_id)';



CREATE TABLE IF NOT EXISTS "public"."liquidity_locks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "round_id" "uuid" NOT NULL,
    "chain" "text" NOT NULL,
    "dex_type" "text" NOT NULL,
    "lp_token_address" "text" NOT NULL,
    "lock_amount" numeric(78,0) NOT NULL,
    "locked_at" timestamp with time zone,
    "locked_until" timestamp with time zone,
    "lock_duration_months" integer NOT NULL,
    "locker_contract_address" "text",
    "lock_tx_hash" "text",
    "lock_id" "text",
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    CONSTRAINT "liquidity_locks_check" CHECK ((("locked_until" IS NULL) OR ("locked_until" > "locked_at"))),
    CONSTRAINT "liquidity_locks_check1" CHECK ((("locked_until" IS NULL) OR ("locked_until" >= ("locked_at" + '1 year'::interval)))),
    CONSTRAINT "liquidity_locks_dex_type_check" CHECK (("dex_type" = ANY (ARRAY['UNISWAP_V2'::"text", 'PANCAKE'::"text", 'RAYDIUM'::"text", 'ORCA'::"text", 'OTHER'::"text"]))),
    CONSTRAINT "liquidity_locks_lock_amount_check" CHECK (("lock_amount" > (0)::numeric)),
    CONSTRAINT "liquidity_locks_lock_duration_months_check" CHECK (("lock_duration_months" >= 12)),
    CONSTRAINT "liquidity_locks_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'LOCKED'::"text", 'UNLOCKED'::"text", 'FAILED'::"text"])))
);


ALTER TABLE "public"."liquidity_locks" OWNER TO "postgres";


COMMENT ON TABLE "public"."liquidity_locks" IS 'Liquidity lock records with 12-month minimum enforcement';



COMMENT ON COLUMN "public"."liquidity_locks"."lock_duration_months" IS 'HARD REQUIREMENT: Minimum 12 months enforced at database level';



CREATE OR REPLACE VIEW "public"."pending_verifications" AS
 SELECT "id",
    "contract_address",
    "chain",
    "deployment_status",
    "verification_status",
    "verification_attempts",
    "verification_error",
    "deployed_at",
    "created_at"
   FROM "public"."launch_rounds"
  WHERE (("verification_status" = ANY (ARRAY['NOT_VERIFIED'::"text", 'VERIFICATION_PENDING'::"text", 'VERIFICATION_QUEUED'::"text"])) AND ("contract_address" IS NOT NULL))
  ORDER BY "deployed_at" DESC;


ALTER VIEW "public"."pending_verifications" OWNER TO "postgres";


COMMENT ON VIEW "public"."pending_verifications" IS 'Active contracts awaiting verification';



CREATE TABLE IF NOT EXISTS "public"."post_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "parent_comment_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "like_count" integer DEFAULT 0,
    CONSTRAINT "post_comments_content_check" CHECK ((("char_length"("content") >= 1) AND ("char_length"("content") <= 2000)))
);


ALTER TABLE "public"."post_comments" OWNER TO "postgres";


COMMENT ON TABLE "public"."post_comments" IS 'Comments on posts with nested reply support';



CREATE TABLE IF NOT EXISTS "public"."post_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."post_likes" OWNER TO "postgres";


COMMENT ON TABLE "public"."post_likes" IS 'User likes on posts';



CREATE TABLE IF NOT EXISTS "public"."post_reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reaction_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "post_reactions_reaction_type_check" CHECK (("reaction_type" = ANY (ARRAY['love'::"text", 'haha'::"text", 'wow'::"text", 'sad'::"text", 'angry'::"text"])))
);


ALTER TABLE "public"."post_reactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."post_reactions" IS 'Emoji reactions on posts (love, haha, wow, sad, angry)';



CREATE TABLE IF NOT EXISTS "public"."post_shares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "share_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "post_shares_share_type_check" CHECK (("share_type" = ANY (ARRAY['link'::"text", 'repost'::"text", 'quote'::"text"])))
);


ALTER TABLE "public"."post_shares" OWNER TO "postgres";


COMMENT ON TABLE "public"."post_shares" IS 'Share tracking (link, repost, quote)';



CREATE TABLE IF NOT EXISTS "public"."post_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "ip_address" "text",
    "viewed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."post_views" OWNER TO "postgres";


COMMENT ON TABLE "public"."post_views" IS 'View tracking for posts';



CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "content" "text" NOT NULL,
    "type" "text" NOT NULL,
    "parent_post_id" "uuid",
    "quoted_post_id" "uuid",
    "reposted_post_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "view_count" integer DEFAULT 0,
    "like_count" integer DEFAULT 0,
    "comment_count" integer DEFAULT 0,
    "repost_count" integer DEFAULT 0,
    "share_count" integer DEFAULT 0,
    "edit_count" integer DEFAULT 0,
    "last_edited_at" timestamp with time zone,
    "image_urls" "text"[] DEFAULT '{}'::"text"[],
    "hashtags" "text"[],
    CONSTRAINT "posts_check" CHECK (((("type" = 'POST'::"text") AND ("parent_post_id" IS NULL) AND ("quoted_post_id" IS NULL) AND ("reposted_post_id" IS NULL)) OR (("type" = 'REPLY'::"text") AND ("parent_post_id" IS NOT NULL) AND ("quoted_post_id" IS NULL) AND ("reposted_post_id" IS NULL)) OR (("type" = 'QUOTE'::"text") AND ("parent_post_id" IS NULL) AND ("quoted_post_id" IS NOT NULL) AND ("reposted_post_id" IS NULL)) OR (("type" = 'REPOST'::"text") AND ("parent_post_id" IS NULL) AND ("quoted_post_id" IS NULL) AND ("reposted_post_id" IS NOT NULL)))),
    CONSTRAINT "posts_content_check" CHECK ((("char_length"("content") >= 1) AND ("char_length"("content") <= 5000))),
    CONSTRAINT "posts_type_check" CHECK (("type" = ANY (ARRAY['POST'::"text", 'REPLY'::"text", 'QUOTE'::"text", 'REPOST'::"text"])))
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


COMMENT ON TABLE "public"."posts" IS 'User-generated content dengan Blue Check RLS gating';



COMMENT ON COLUMN "public"."posts"."author_id" IS 'User identifier - references profiles.user_id for wallet-only auth';



COMMENT ON COLUMN "public"."posts"."deleted_by" IS 'Admin user who deleted - references profiles.user_id';



COMMENT ON COLUMN "public"."posts"."view_count" IS 'Cached view count from post_views';



COMMENT ON COLUMN "public"."posts"."like_count" IS 'Cached like count from post_likes';



COMMENT ON COLUMN "public"."posts"."comment_count" IS 'Cached comment count from post_comments';



COMMENT ON COLUMN "public"."posts"."edit_count" IS 'Number of times post was edited';



COMMENT ON COLUMN "public"."posts"."last_edited_at" IS 'Last time post was edited';



COMMENT ON COLUMN "public"."posts"."image_urls" IS 'Array of image URLs uploaded with the post';



CREATE TABLE IF NOT EXISTS "public"."presale_merkle_proofs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "round_id" "uuid",
    "wallet_address" "text" NOT NULL,
    "allocation" "text" NOT NULL,
    "proof" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."presale_merkle_proofs" OWNER TO "postgres";


COMMENT ON TABLE "public"."presale_merkle_proofs" IS 'Merkle proofs for presale token allocations. Generated server-side only. Allocation stored as TEXT to prevent precision loss.';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "username" "text",
    "bio" "text",
    "avatar_url" "text",
    "bluecheck_status" "text" DEFAULT 'NONE'::"text",
    "privacy_hide_address" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "active_referral_count" integer DEFAULT 0 NOT NULL,
    "kyc_status" "text" DEFAULT 'not_started'::"text",
    "kyc_submitted_at" timestamp with time zone,
    "is_admin" boolean DEFAULT false,
    "follower_count" integer DEFAULT 0,
    "following_count" integer DEFAULT 0,
    "nickname" "text",
    "referral_code" "text",
    CONSTRAINT "profiles_active_referral_count_check" CHECK (("active_referral_count" >= 0)),
    CONSTRAINT "profiles_bluecheck_status_check" CHECK (("bluecheck_status" = ANY (ARRAY['NONE'::"text", 'PENDING'::"text", 'ACTIVE'::"text", 'VERIFIED'::"text", 'REVOKED'::"text"]))),
    CONSTRAINT "profiles_follower_count_check" CHECK (("follower_count" >= 0)),
    CONSTRAINT "profiles_following_count_check" CHECK (("following_count" >= 0)),
    CONSTRAINT "profiles_kyc_status_check" CHECK (("kyc_status" = ANY (ARRAY['not_started'::"text", 'pending'::"text", 'verified'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'User profiles with Blue Check status and privacy settings';



COMMENT ON COLUMN "public"."profiles"."user_id" IS 'User identifier - no longer references auth.users for wallet-only auth';



COMMENT ON COLUMN "public"."profiles"."bluecheck_status" IS 'Blue Check verification status';



COMMENT ON COLUMN "public"."profiles"."privacy_hide_address" IS 'If true, hide wallet addresses from public view';



COMMENT ON COLUMN "public"."profiles"."active_referral_count" IS 'Count of activated referrals - required >= 1 for claim gating';



COMMENT ON COLUMN "public"."profiles"."kyc_status" IS 'User KYC verification status (not_started, pending, verified, rejected)';



COMMENT ON COLUMN "public"."profiles"."kyc_submitted_at" IS 'Timestamp when KYC was first submitted';



COMMENT ON COLUMN "public"."profiles"."is_admin" IS 'Whether this user has admin privileges';



COMMENT ON COLUMN "public"."profiles"."follower_count" IS 'Number of users following this user';



COMMENT ON COLUMN "public"."profiles"."following_count" IS 'Number of users this user is following';



COMMENT ON COLUMN "public"."profiles"."referral_code" IS 'Unique referral code for this user (8 characters, alphanumeric)';



CREATE TABLE IF NOT EXISTS "public"."project_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "awarded_at" timestamp with time zone DEFAULT "now"(),
    "awarded_by" "uuid",
    "reason" "text"
);


ALTER TABLE "public"."project_badges" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_badges" IS 'Badges awarded to projects';



COMMENT ON COLUMN "public"."project_badges"."awarded_by" IS 'NULL for auto-awards, admin user_id for manual awards';



CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "symbol" "text",
    "description" "text",
    "logo_url" "text",
    "banner_url" "text",
    "website" "text",
    "twitter" "text",
    "telegram" "text",
    "status" "text" DEFAULT 'DRAFT'::"text",
    "chains_supported" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "kyc_status" "text" DEFAULT 'NONE'::"text",
    "sc_scan_status" "text" DEFAULT 'NONE'::"text",
    "rejection_reason" "text",
    "submitted_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "contract_mode" "text",
    "contract_network" "text",
    "contract_address" "text",
    "factory_address" "text",
    "template_version" "text",
    "implementation_hash" "text",
    "sc_scan_last_run_id" "uuid",
    "chain" "text",
    "chain_id" integer DEFAULT 97 NOT NULL,
    "creator_id" "uuid",
    "creator_wallet" "text",
    "token_address" "text",
    "type" "text" DEFAULT 'FAIRLAUNCH'::"text",
    "discord" "text",
    "deployment_tx_hash" "text",
    "verification_status" "text" DEFAULT 'UNVERIFIED'::"text",
    "token_verification_status" "text",
    "token_verified_at" timestamp with time zone,
    "token_verification_attempts" integer,
    "last_token_verification_error" "text",
    CONSTRAINT "projects_contract_mode_check" CHECK (("contract_mode" = ANY (ARRAY['EXTERNAL_CONTRACT'::"text", 'LAUNCHPAD_TEMPLATE'::"text"]))),
    CONSTRAINT "projects_contract_network_check" CHECK (("contract_network" = ANY (ARRAY['EVM'::"text", 'SOLANA'::"text"]))),
    CONSTRAINT "projects_kyc_status_check" CHECK (("kyc_status" = ANY (ARRAY['NONE'::"text", 'PENDING'::"text", 'VERIFIED'::"text", 'REJECTED'::"text"]))),
    CONSTRAINT "projects_sc_scan_status_check" CHECK (("sc_scan_status" = ANY (ARRAY['IDLE'::"text", 'PENDING'::"text", 'RUNNING'::"text", 'PASS'::"text", 'FAIL'::"text", 'NEEDS_REVIEW'::"text"]))),
    CONSTRAINT "projects_status_check" CHECK (("status" = ANY (ARRAY['DRAFT'::"text", 'SUBMITTED'::"text", 'IN_REVIEW'::"text", 'APPROVED'::"text", 'REJECTED'::"text", 'LIVE'::"text", 'ENDED'::"text"]))),
    CONSTRAINT "projects_token_verification_status_check" CHECK (("token_verification_status" = ANY (ARRAY['PENDING'::"text", 'VERIFYING'::"text", 'VERIFIED'::"text", 'FAILED'::"text"])))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


COMMENT ON TABLE "public"."projects" IS 'Project listings (will expand in FASE 3 with KYC, scan, etc)';



COMMENT ON COLUMN "public"."projects"."owner_user_id" IS 'FK to profiles.user_id (wallet-only auth compatible)';



COMMENT ON COLUMN "public"."projects"."kyc_status" IS 'KYC verification status for project owner';



COMMENT ON COLUMN "public"."projects"."sc_scan_status" IS 'Smart contract audit status';



COMMENT ON COLUMN "public"."projects"."submitted_at" IS 'Timestamp when project submitted for review';



COMMENT ON COLUMN "public"."projects"."approved_at" IS 'Timestamp when project approved by admin';



COMMENT ON COLUMN "public"."projects"."metadata" IS 'Flexible metadata storage for project details (type, chain, raised, target, lp_lock, etc.)';



COMMENT ON COLUMN "public"."projects"."contract_mode" IS 'EXTERNAL_CONTRACT (user brings own) or LAUNCHPAD_TEMPLATE (factory deploy)';



COMMENT ON COLUMN "public"."projects"."contract_network" IS 'Network where contract is deployed: EVM or SOLANA';



COMMENT ON COLUMN "public"."projects"."contract_address" IS 'EVM address or Solana program ID';



COMMENT ON COLUMN "public"."projects"."factory_address" IS 'Factory contract address for template deployments';



COMMENT ON COLUMN "public"."projects"."template_version" IS 'Template version for LAUNCHPAD_TEMPLATE mode';



COMMENT ON COLUMN "public"."projects"."implementation_hash" IS 'Implementation bytecode hash for verification';



COMMENT ON COLUMN "public"."projects"."sc_scan_last_run_id" IS 'FK to sc_scan_results for latest scan run';



COMMENT ON COLUMN "public"."projects"."chain" IS 'Primary chain for single-chain projects (fairlaunch). For multi-chain, use chains_supported array.';



COMMENT ON COLUMN "public"."projects"."chain_id" IS 'Blockchain network ID (97=BSC Testnet, 56=BSC, 1=Ethereum, etc)';



COMMENT ON COLUMN "public"."projects"."creator_id" IS 'Reference to auth.users id';



COMMENT ON COLUMN "public"."projects"."creator_wallet" IS 'Wallet address of the project creator';



COMMENT ON COLUMN "public"."projects"."token_address" IS 'Address of the project token (ERC20)';



CREATE TABLE IF NOT EXISTS "public"."referral_ledger" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "referrer_id" "uuid" NOT NULL,
    "source_type" "text" NOT NULL,
    "source_id" "uuid" NOT NULL,
    "amount" numeric(78,0) NOT NULL,
    "asset" "text" NOT NULL,
    "chain" "text" NOT NULL,
    "status" "text" DEFAULT 'CLAIMABLE'::"text" NOT NULL,
    "claimed_at" timestamp with time zone,
    "claim_tx_hash" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "referral_ledger_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "referral_ledger_source_type_check" CHECK (("source_type" = ANY (ARRAY['PRESALE'::"text", 'FAIRLAUNCH'::"text", 'BONDING'::"text", 'BLUECHECK'::"text"]))),
    CONSTRAINT "referral_ledger_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'CLAIMABLE'::"text", 'CLAIMED'::"text"])))
);


ALTER TABLE "public"."referral_ledger" OWNER TO "postgres";


COMMENT ON TABLE "public"."referral_ledger" IS 'Referral reward ledger (30% dari fee splits)';



COMMENT ON COLUMN "public"."referral_ledger"."chain" IS 'Blockchain where reward is claimable (BSC, ETHEREUM, SOLANA, etc.)';



CREATE TABLE IF NOT EXISTS "public"."referral_relationships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "referrer_id" "uuid" NOT NULL,
    "referee_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "activated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "referral_relationships_check" CHECK (("referrer_id" <> "referee_id"))
);


ALTER TABLE "public"."referral_relationships" OWNER TO "postgres";


COMMENT ON TABLE "public"."referral_relationships" IS 'Referrer-referee relationships dengan activation tracking';



COMMENT ON COLUMN "public"."referral_relationships"."activated_at" IS 'Set when referee makes first qualifying event (Presale/Fairlaunch/BlueCheck/Bonding)';



CREATE TABLE IF NOT EXISTS "public"."refunds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "round_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text",
    "tx_id" "uuid",
    "tx_hash" "text",
    "chain" "text",
    "idempotency_key" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "processed_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    CONSTRAINT "refunds_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "refunds_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'PROCESSING'::"text", 'COMPLETED'::"text", 'FAILED'::"text"])))
);


ALTER TABLE "public"."refunds" OWNER TO "postgres";


COMMENT ON TABLE "public"."refunds" IS 'Refund tracking for failed rounds or over-cap scenarios';



COMMENT ON COLUMN "public"."refunds"."status" IS 'Refund lifecycle: PENDING -> PROCESSING -> COMPLETED/FAILED';



COMMENT ON COLUMN "public"."refunds"."idempotency_key" IS 'Prevents duplicate refund requests';



CREATE TABLE IF NOT EXISTS "public"."round_allocations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "round_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "contributed_amount" numeric NOT NULL,
    "allocation_tokens" numeric NOT NULL,
    "claimable_tokens" numeric DEFAULT 0,
    "refund_amount" numeric DEFAULT 0,
    "claim_status" "text" DEFAULT 'PENDING'::"text",
    "refund_status" "text" DEFAULT 'NONE'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "round_allocations_allocation_tokens_check" CHECK (("allocation_tokens" >= (0)::numeric)),
    CONSTRAINT "round_allocations_claimable_tokens_check" CHECK (("claimable_tokens" >= (0)::numeric)),
    CONSTRAINT "round_allocations_contributed_amount_check" CHECK (("contributed_amount" >= (0)::numeric)),
    CONSTRAINT "round_allocations_refund_amount_check" CHECK (("refund_amount" >= (0)::numeric))
);


ALTER TABLE "public"."round_allocations" OWNER TO "postgres";


COMMENT ON TABLE "public"."round_allocations" IS 'Final token allocations after round finalization';



COMMENT ON COLUMN "public"."round_allocations"."contributed_amount" IS 'Total amount user contributed';



COMMENT ON COLUMN "public"."round_allocations"."allocation_tokens" IS 'Total tokens allocated to user';



COMMENT ON COLUMN "public"."round_allocations"."claimable_tokens" IS 'Tokens available to claim (vesting)';



COMMENT ON COLUMN "public"."round_allocations"."refund_amount" IS 'Amount to refund (over-cap or failed round)';



CREATE TABLE IF NOT EXISTS "public"."round_post_finalize" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "round_id" "uuid" NOT NULL,
    "vesting_setup_status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "vesting_setup_at" timestamp with time zone,
    "vesting_setup_error" "text",
    "lock_setup_status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "lock_setup_at" timestamp with time zone,
    "lock_setup_error" "text",
    "retry_count" integer DEFAULT 0 NOT NULL,
    "last_retry_at" timestamp with time zone,
    "last_error" "text",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "round_post_finalize_lock_setup_status_check" CHECK (("lock_setup_status" = ANY (ARRAY['PENDING'::"text", 'IN_PROGRESS'::"text", 'COMPLETED'::"text", 'FAILED'::"text"]))),
    CONSTRAINT "round_post_finalize_vesting_setup_status_check" CHECK (("vesting_setup_status" = ANY (ARRAY['PENDING'::"text", 'IN_PROGRESS'::"text", 'COMPLETED'::"text", 'FAILED'::"text"])))
);


ALTER TABLE "public"."round_post_finalize" OWNER TO "postgres";


COMMENT ON TABLE "public"."round_post_finalize" IS 'Orchestration progress tracker for post-finalization setup';



CREATE TABLE IF NOT EXISTS "public"."sbt_claims" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" numeric(78,0) NOT NULL,
    "fee_tx_hash" "text" NOT NULL,
    "status" "text" NOT NULL,
    "payout_tx_hash" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "sbt_claims_status_check" CHECK (("status" = ANY (ARRAY['PENDING_FEE'::"text", 'PROCESSING'::"text", 'CONFIRMED'::"text", 'FAILED'::"text"])))
);


ALTER TABLE "public"."sbt_claims" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sbt_rewards_ledger" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "total_accrued" numeric(78,0) DEFAULT 0,
    "total_claimed" numeric(78,0) DEFAULT 0,
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sbt_rewards_ledger" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sbt_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chain" "text" NOT NULL,
    "collection_id" "text" NOT NULL,
    "min_balance" integer DEFAULT 1 NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "sbt_rules_chain_check" CHECK (("chain" = ANY (ARRAY['solana'::"text", 'evm'::"text"])))
);


ALTER TABLE "public"."sbt_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sbt_stakes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "rule_id" "uuid" NOT NULL,
    "wallet_address" "text" NOT NULL,
    "staked_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sbt_stakes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sc_scan_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "contract_address" "text" NOT NULL,
    "chain" "text" NOT NULL,
    "scan_provider" "text" NOT NULL,
    "score" integer,
    "status" "text" DEFAULT 'PENDING'::"text",
    "report_url" "text",
    "findings_summary" "jsonb" DEFAULT '{}'::"jsonb",
    "scan_requested_at" timestamp with time zone DEFAULT "now"(),
    "scan_completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "network" "text",
    "target_address" "text",
    "risk_flags" "jsonb" DEFAULT '[]'::"jsonb",
    "summary" "text",
    "raw_findings" "jsonb" DEFAULT '{}'::"jsonb",
    "override_status" "text",
    "override_reason" "text",
    "override_by" "uuid",
    "override_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"(),
    "finished_at" timestamp with time zone,
    CONSTRAINT "sc_scan_results_network_check" CHECK (("network" = ANY (ARRAY['EVM'::"text", 'SOLANA'::"text"]))),
    CONSTRAINT "sc_scan_results_override_status_check" CHECK (("override_status" = ANY (ARRAY['PASS'::"text", 'FAIL'::"text"]))),
    CONSTRAINT "sc_scan_results_score_check" CHECK ((("score" >= 0) AND ("score" <= 100))),
    CONSTRAINT "sc_scan_results_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'PASSED'::"text", 'FAILED'::"text", 'WARNING'::"text"])))
);


ALTER TABLE "public"."sc_scan_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."sc_scan_results" IS 'Smart contract security audit scan results';



COMMENT ON COLUMN "public"."sc_scan_results"."score" IS 'Security score from 0-100, higher is better';



COMMENT ON COLUMN "public"."sc_scan_results"."status" IS 'Scan execution status';



COMMENT ON COLUMN "public"."sc_scan_results"."findings_summary" IS 'JSON summary of critical/high/medium/low findings';



COMMENT ON COLUMN "public"."sc_scan_results"."network" IS 'Network: EVM or SOLANA';



COMMENT ON COLUMN "public"."sc_scan_results"."target_address" IS 'Contract address being scanned';



COMMENT ON COLUMN "public"."sc_scan_results"."risk_flags" IS 'Array of detected risk patterns: ["reentrancy", "owner_backdoor", ...]';



COMMENT ON COLUMN "public"."sc_scan_results"."summary" IS 'Human-readable summary of scan results';



COMMENT ON COLUMN "public"."sc_scan_results"."raw_findings" IS 'Detailed findings from scan runner';



COMMENT ON COLUMN "public"."sc_scan_results"."override_status" IS 'Admin override decision: PASS or FAIL';



COMMENT ON COLUMN "public"."sc_scan_results"."override_reason" IS 'Admin reason for override (required)';



CREATE TABLE IF NOT EXISTS "public"."template_audits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "network" "text" NOT NULL,
    "factory_address" "text",
    "template_version" "text" NOT NULL,
    "implementation_hash" "text" NOT NULL,
    "audit_report_ref" "text" NOT NULL,
    "audit_provider" "text",
    "audited_at" "date",
    "status" "text" DEFAULT 'VALID'::"text",
    "revoked_reason" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "template_audits_network_check" CHECK (("network" = ANY (ARRAY['EVM'::"text", 'SOLANA'::"text"]))),
    CONSTRAINT "template_audits_status_check" CHECK (("status" = ANY (ARRAY['VALID'::"text", 'REVOKED'::"text"])))
);


ALTER TABLE "public"."template_audits" OWNER TO "postgres";


COMMENT ON TABLE "public"."template_audits" IS 'Registry of audited template versions for STRICT PROJECT_AUDITED inheritance';



COMMENT ON COLUMN "public"."template_audits"."network" IS 'Network: EVM or SOLANA';



COMMENT ON COLUMN "public"."template_audits"."template_version" IS 'Semantic version of template (e.g., 1.0.0)';



COMMENT ON COLUMN "public"."template_audits"."implementation_hash" IS 'Bytecode hash for verification';



COMMENT ON COLUMN "public"."template_audits"."audit_report_ref" IS 'URL or IPFS hash of audit report';



COMMENT ON COLUMN "public"."template_audits"."status" IS 'VALID = can issue PROJECT_AUDITED, REVOKED = removed from eligible list';



COMMENT ON COLUMN "public"."template_audits"."revoked_reason" IS 'Why template audit was revoked (security issue found, etc.)';



CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chain" "text" NOT NULL,
    "tx_hash" "text",
    "type" "text",
    "status" "text" DEFAULT 'CREATED'::"text",
    "user_id" "uuid",
    "project_id" "uuid",
    "round_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "transactions_status_check" CHECK (("status" = ANY (ARRAY['CREATED'::"text", 'SUBMITTED'::"text", 'PENDING'::"text", 'CONFIRMED'::"text", 'FAILED'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."transactions" IS 'Transaction tracking for Tx Manager (multi-chain)';



COMMENT ON COLUMN "public"."transactions"."status" IS 'CREATED -> SUBMITTED -> PENDING -> CONFIRMED/FAILED';



CREATE TABLE IF NOT EXISTS "public"."trending_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "snapshot_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "rank" integer NOT NULL,
    "score" numeric NOT NULL,
    "post_count_24h" integer DEFAULT 0,
    "comment_count_24h" integer DEFAULT 0,
    "category" "text" DEFAULT 'ALL'::"text",
    "chain_scope" "text" DEFAULT 'ALL'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trending_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trending_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "window_start_at" timestamp with time zone NOT NULL,
    "window_end_at" timestamp with time zone NOT NULL,
    "computed_at" timestamp with time zone DEFAULT "now"(),
    "version" "text" DEFAULT 'v1'::"text"
);


ALTER TABLE "public"."trending_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "following_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_follows_check" CHECK (("follower_id" <> "following_id"))
);


ALTER TABLE "public"."user_follows" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_follows" IS 'User follow relationships - tracks who follows whom';



COMMENT ON COLUMN "public"."user_follows"."follower_id" IS 'User ID of the follower (wallet-only auth)';



COMMENT ON COLUMN "public"."user_follows"."following_id" IS 'User ID being followed (wallet-only auth)';



CREATE TABLE IF NOT EXISTS "public"."vesting_allocations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "schedule_id" "uuid" NOT NULL,
    "round_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "allocation_tokens" numeric(78,0) NOT NULL,
    "claimed_tokens" numeric(78,0) DEFAULT 0 NOT NULL,
    "last_claim_at" timestamp with time zone,
    "total_claims" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "vesting_allocations_allocation_tokens_check" CHECK (("allocation_tokens" > (0)::numeric)),
    CONSTRAINT "vesting_allocations_check" CHECK (("claimed_tokens" <= "allocation_tokens")),
    CONSTRAINT "vesting_allocations_claimed_tokens_check" CHECK (("claimed_tokens" >= (0)::numeric))
);


ALTER TABLE "public"."vesting_allocations" OWNER TO "postgres";


COMMENT ON TABLE "public"."vesting_allocations" IS 'Individual user token allocations from vesting schedule';



CREATE TABLE IF NOT EXISTS "public"."vesting_claims" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "allocation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "claim_amount" numeric(78,0) NOT NULL,
    "claimed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "chain" "text" NOT NULL,
    "wallet_address" "text" NOT NULL,
    "tx_hash" "text",
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "idempotency_key" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "vesting_claims_claim_amount_check" CHECK (("claim_amount" > (0)::numeric)),
    CONSTRAINT "vesting_claims_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'CONFIRMED'::"text", 'FAILED'::"text"])))
);


ALTER TABLE "public"."vesting_claims" OWNER TO "postgres";


COMMENT ON TABLE "public"."vesting_claims" IS 'Claim transaction history for audit trail and idempotency';



CREATE TABLE IF NOT EXISTS "public"."vesting_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "round_id" "uuid" NOT NULL,
    "token_address" "text" NOT NULL,
    "chain" "text" NOT NULL,
    "total_tokens" numeric(78,0) NOT NULL,
    "tge_percentage" integer NOT NULL,
    "tge_at" timestamp with time zone NOT NULL,
    "cliff_months" integer DEFAULT 0 NOT NULL,
    "vesting_months" integer NOT NULL,
    "interval_type" "text" NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "contract_address" "text",
    "deployment_tx_hash" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "schedule_salt" "text",
    CONSTRAINT "vesting_schedules_check" CHECK ((("tge_percentage" +
CASE
    WHEN ("vesting_months" > 0) THEN 1
    ELSE 0
END) <= 100)),
    CONSTRAINT "vesting_schedules_cliff_months_check" CHECK (("cliff_months" >= 0)),
    CONSTRAINT "vesting_schedules_interval_type_check" CHECK (("interval_type" = ANY (ARRAY['DAILY'::"text", 'MONTHLY'::"text"]))),
    CONSTRAINT "vesting_schedules_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'CONFIRMED'::"text", 'FAILED'::"text", 'PAUSED'::"text"]))),
    CONSTRAINT "vesting_schedules_tge_percentage_check" CHECK ((("tge_percentage" >= 0) AND ("tge_percentage" <= 100))),
    CONSTRAINT "vesting_schedules_total_tokens_check" CHECK (("total_tokens" > (0)::numeric)),
    CONSTRAINT "vesting_schedules_vesting_months_check" CHECK (("vesting_months" >= 0))
);


ALTER TABLE "public"."vesting_schedules" OWNER TO "postgres";


COMMENT ON TABLE "public"."vesting_schedules" IS 'Vesting configuration for token distribution (TGE, cliff, linear vesting)';



COMMENT ON COLUMN "public"."vesting_schedules"."tge_at" IS 'Token Generation Event timestamp - defaults to round.finalized_at';



COMMENT ON COLUMN "public"."vesting_schedules"."schedule_salt" IS 'Salt for Merkle leaf encoding to prevent cross-round proof replay';



CREATE TABLE IF NOT EXISTS "public"."wallet_link_nonces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "wallet_address" "text" NOT NULL,
    "chain" "text" NOT NULL,
    "nonce" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."wallet_link_nonces" OWNER TO "postgres";


COMMENT ON TABLE "public"."wallet_link_nonces" IS 'Nonces for wallet signature challenge (single-use, expire after 5 minutes)';



CREATE TABLE IF NOT EXISTS "public"."wallets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "chain" "text" NOT NULL,
    "address" "text" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "wallet_role" "text" DEFAULT 'SECONDARY'::"text",
    CONSTRAINT "enforce_evm_primary" CHECK (((("wallet_role" = 'PRIMARY'::"text") AND ("chain" ~~ 'EVM_%'::"text")) OR ("wallet_role" = 'SECONDARY'::"text"))),
    CONSTRAINT "wallets_wallet_role_check" CHECK (("wallet_role" = ANY (ARRAY['PRIMARY'::"text", 'SECONDARY'::"text"])))
);


ALTER TABLE "public"."wallets" OWNER TO "postgres";


COMMENT ON TABLE "public"."wallets" IS 'User wallet addresses with multi-chain and primary wallet support';



COMMENT ON COLUMN "public"."wallets"."user_id" IS 'References profiles.user_id for wallet-only auth';



COMMENT ON COLUMN "public"."wallets"."wallet_role" IS 'Wallet role: PRIMARY (EVM, identity) or SECONDARY (feature-specific like Solana)';



ALTER TABLE ONLY "public"."admin_action_approvals"
    ADD CONSTRAINT "admin_action_approvals_action_id_approved_by_key" UNIQUE ("action_id", "approved_by");



ALTER TABLE ONLY "public"."admin_action_approvals"
    ADD CONSTRAINT "admin_action_approvals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_actions"
    ADD CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_permissions"
    ADD CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("role", "permission");



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."ama_join_tokens"
    ADD CONSTRAINT "ama_join_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ama_join_tokens"
    ADD CONSTRAINT "ama_join_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."ama_messages"
    ADD CONSTRAINT "ama_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ama_requests"
    ADD CONSTRAINT "ama_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ama_sessions"
    ADD CONSTRAINT "ama_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_sessions"
    ADD CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_sessions"
    ADD CONSTRAINT "auth_sessions_session_token_key" UNIQUE ("session_token");



ALTER TABLE ONLY "public"."badge_definitions"
    ADD CONSTRAINT "badge_definitions_badge_key_key" UNIQUE ("badge_key");



ALTER TABLE ONLY "public"."badge_definitions"
    ADD CONSTRAINT "badge_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."badge_instances"
    ADD CONSTRAINT "badge_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bluecheck_purchases"
    ADD CONSTRAINT "bluecheck_purchases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bluecheck_purchases"
    ADD CONSTRAINT "bluecheck_purchases_user_id_status_key" UNIQUE ("user_id", "status") DEFERRABLE INITIALLY DEFERRED;



ALTER TABLE ONLY "public"."bonding_events"
    ADD CONSTRAINT "bonding_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bonding_pools"
    ADD CONSTRAINT "bonding_pools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bonding_pools"
    ADD CONSTRAINT "bonding_pools_token_mint_key" UNIQUE ("token_mint");



ALTER TABLE ONLY "public"."bonding_swaps"
    ADD CONSTRAINT "bonding_swaps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bonding_swaps"
    ADD CONSTRAINT "bonding_swaps_tx_hash_key" UNIQUE ("tx_hash");



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_comment_id_user_id_key" UNIQUE ("comment_id", "user_id");



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contract_audit_proofs"
    ADD CONSTRAINT "contract_audit_proofs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contributions"
    ADD CONSTRAINT "contributions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."created_tokens"
    ADD CONSTRAINT "created_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dex_migrations"
    ADD CONSTRAINT "dex_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fee_splits"
    ADD CONSTRAINT "fee_splits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fee_splits"
    ADD CONSTRAINT "fee_splits_source_type_source_id_key" UNIQUE ("source_type", "source_id");



ALTER TABLE ONLY "public"."kyc_submissions"
    ADD CONSTRAINT "kyc_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."launch_rounds"
    ADD CONSTRAINT "launch_rounds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."liquidity_locks"
    ADD CONSTRAINT "liquidity_locks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_views"
    ADD CONSTRAINT "post_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_views"
    ADD CONSTRAINT "post_views_post_id_session_id_key" UNIQUE ("post_id", "session_id");



ALTER TABLE ONLY "public"."post_views"
    ADD CONSTRAINT "post_views_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."presale_merkle_proofs"
    ADD CONSTRAINT "presale_merkle_proofs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."presale_merkle_proofs"
    ADD CONSTRAINT "presale_merkle_proofs_unique" UNIQUE ("round_id", "wallet_address");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_referral_code_key" UNIQUE ("referral_code");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."project_badges"
    ADD CONSTRAINT "project_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referral_ledger"
    ADD CONSTRAINT "referral_ledger_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referral_ledger"
    ADD CONSTRAINT "referral_ledger_source_type_source_id_key" UNIQUE ("source_type", "source_id");



ALTER TABLE ONLY "public"."referral_relationships"
    ADD CONSTRAINT "referral_relationships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referral_relationships"
    ADD CONSTRAINT "referral_relationships_referrer_id_referee_id_key" UNIQUE ("referrer_id", "referee_id");



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_idempotency_key_key" UNIQUE ("idempotency_key");



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."round_allocations"
    ADD CONSTRAINT "round_allocations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."round_post_finalize"
    ADD CONSTRAINT "round_post_finalize_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."round_post_finalize"
    ADD CONSTRAINT "round_post_finalize_round_id_key" UNIQUE ("round_id");



ALTER TABLE ONLY "public"."sbt_claims"
    ADD CONSTRAINT "sbt_claims_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sbt_rewards_ledger"
    ADD CONSTRAINT "sbt_rewards_ledger_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sbt_rewards_ledger"
    ADD CONSTRAINT "sbt_rewards_ledger_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."sbt_rules"
    ADD CONSTRAINT "sbt_rules_chain_collection_id_key" UNIQUE ("chain", "collection_id");



ALTER TABLE ONLY "public"."sbt_rules"
    ADD CONSTRAINT "sbt_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sbt_stakes"
    ADD CONSTRAINT "sbt_stakes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sbt_stakes"
    ADD CONSTRAINT "sbt_stakes_user_id_rule_id_key" UNIQUE ("user_id", "rule_id");



ALTER TABLE ONLY "public"."sc_scan_results"
    ADD CONSTRAINT "sc_scan_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."template_audits"
    ADD CONSTRAINT "template_audits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trending_projects"
    ADD CONSTRAINT "trending_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trending_projects"
    ADD CONSTRAINT "trending_projects_snapshot_id_category_chain_scope_rank_key" UNIQUE ("snapshot_id", "category", "chain_scope", "rank");



ALTER TABLE ONLY "public"."trending_snapshots"
    ADD CONSTRAINT "trending_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_badges"
    ADD CONSTRAINT "unique_project_badge" UNIQUE ("project_id", "badge_id");



ALTER TABLE ONLY "public"."contributions"
    ADD CONSTRAINT "unique_round_tx" UNIQUE ("round_id", "tx_id");



ALTER TABLE ONLY "public"."round_allocations"
    ADD CONSTRAINT "unique_round_user_allocation" UNIQUE ("round_id", "user_id");



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "unique_round_user_refund" UNIQUE ("round_id", "user_id");



ALTER TABLE ONLY "public"."template_audits"
    ADD CONSTRAINT "unique_template_audit" UNIQUE ("network", "template_version", "implementation_hash");



ALTER TABLE ONLY "public"."created_tokens"
    ADD CONSTRAINT "unique_token_chain" UNIQUE ("token_address", "chain");



ALTER TABLE ONLY "public"."contributions"
    ADD CONSTRAINT "unique_tx_hash" UNIQUE ("chain", "tx_hash");



ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "unique_user_chain_address" UNIQUE ("user_id", "chain", "address");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_follower_id_following_id_key" UNIQUE ("follower_id", "following_id");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vesting_allocations"
    ADD CONSTRAINT "vesting_allocations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vesting_allocations"
    ADD CONSTRAINT "vesting_allocations_schedule_id_user_id_key" UNIQUE ("schedule_id", "user_id");



ALTER TABLE ONLY "public"."vesting_claims"
    ADD CONSTRAINT "vesting_claims_idempotency_key_key" UNIQUE ("idempotency_key");



ALTER TABLE ONLY "public"."vesting_claims"
    ADD CONSTRAINT "vesting_claims_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vesting_schedules"
    ADD CONSTRAINT "vesting_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vesting_schedules"
    ADD CONSTRAINT "vesting_schedules_round_id_key" UNIQUE ("round_id");



ALTER TABLE ONLY "public"."wallet_link_nonces"
    ADD CONSTRAINT "wallet_link_nonces_nonce_key" UNIQUE ("nonce");



ALTER TABLE ONLY "public"."wallet_link_nonces"
    ADD CONSTRAINT "wallet_link_nonces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_action_approvals_action" ON "public"."admin_action_approvals" USING "btree" ("action_id");



CREATE INDEX "idx_action_approvals_approver" ON "public"."admin_action_approvals" USING "btree" ("approved_by");



CREATE INDEX "idx_admin_actions_expires" ON "public"."admin_actions" USING "btree" ("expires_at") WHERE ("status" = 'PENDING'::"text");



CREATE INDEX "idx_admin_actions_requester" ON "public"."admin_actions" USING "btree" ("requested_by");



CREATE INDEX "idx_admin_actions_status" ON "public"."admin_actions" USING "btree" ("status");



CREATE INDEX "idx_admin_actions_type" ON "public"."admin_actions" USING "btree" ("type");



CREATE INDEX "idx_admin_audit_logs_ip" ON "public"."admin_audit_logs" USING "btree" ("ip_address");



CREATE INDEX "idx_admin_logs_action" ON "public"."admin_audit_logs" USING "btree" ("action");



CREATE INDEX "idx_admin_logs_actor" ON "public"."admin_audit_logs" USING "btree" ("actor_admin_id");



CREATE INDEX "idx_admin_logs_created" ON "public"."admin_audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_admin_logs_entity" ON "public"."admin_audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_admin_permissions_role_permission" ON "public"."admin_permissions" USING "btree" ("role", "permission");



CREATE INDEX "idx_admin_roles_role" ON "public"."admin_roles" USING "btree" ("role");



CREATE INDEX "idx_admin_roles_user" ON "public"."admin_roles" USING "btree" ("user_id");



CREATE INDEX "idx_allocations_claim_status" ON "public"."round_allocations" USING "btree" ("claim_status");



CREATE INDEX "idx_allocations_round" ON "public"."round_allocations" USING "btree" ("round_id");



CREATE INDEX "idx_allocations_user" ON "public"."round_allocations" USING "btree" ("user_id");



CREATE INDEX "idx_ama_host" ON "public"."ama_sessions" USING "btree" ("host_id");



CREATE INDEX "idx_ama_project" ON "public"."ama_sessions" USING "btree" ("project_id");



CREATE INDEX "idx_ama_scheduled" ON "public"."ama_sessions" USING "btree" ("scheduled_at");



CREATE INDEX "idx_ama_status" ON "public"."ama_sessions" USING "btree" ("status");



CREATE INDEX "idx_ama_tokens_ama" ON "public"."ama_join_tokens" USING "btree" ("ama_id");



CREATE INDEX "idx_ama_tokens_expires" ON "public"."ama_join_tokens" USING "btree" ("expires_at") WHERE ("used_at" IS NULL);



CREATE INDEX "idx_ama_tokens_token" ON "public"."ama_join_tokens" USING "btree" ("token");



CREATE INDEX "idx_ama_tokens_user" ON "public"."ama_join_tokens" USING "btree" ("user_id");



CREATE INDEX "idx_audit_logs_actor" ON "public"."audit_logs" USING "btree" ("actor_admin_id");



CREATE INDEX "idx_audit_logs_created" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_audit_proofs_pending" ON "public"."contract_audit_proofs" USING "btree" ("status") WHERE ("status" = 'PENDING'::"text");



CREATE INDEX "idx_audit_proofs_project" ON "public"."contract_audit_proofs" USING "btree" ("project_id");



CREATE INDEX "idx_audit_proofs_status" ON "public"."contract_audit_proofs" USING "btree" ("status");



CREATE INDEX "idx_auth_sessions_expires" ON "public"."auth_sessions" USING "btree" ("expires_at");



CREATE INDEX "idx_auth_sessions_token" ON "public"."auth_sessions" USING "btree" ("session_token");



CREATE INDEX "idx_auth_sessions_wallet" ON "public"."auth_sessions" USING "btree" ("wallet_address", "chain");



CREATE INDEX "idx_auth_sessions_wallet_id" ON "public"."auth_sessions" USING "btree" ("wallet_id");



CREATE INDEX "idx_badge_instances_active" ON "public"."badge_instances" USING "btree" ("user_id", "badge_id") WHERE ("status" = 'ACTIVE'::"text");



CREATE INDEX "idx_badge_instances_badge" ON "public"."badge_instances" USING "btree" ("badge_id");



CREATE INDEX "idx_badge_instances_status" ON "public"."badge_instances" USING "btree" ("status");



CREATE INDEX "idx_badge_instances_user" ON "public"."badge_instances" USING "btree" ("user_id");



CREATE INDEX "idx_badge_instances_user_badge" ON "public"."badge_instances" USING "btree" ("user_id", "badge_id");



CREATE INDEX "idx_badge_key" ON "public"."badge_definitions" USING "btree" ("badge_key");



CREATE INDEX "idx_badge_type" ON "public"."badge_definitions" USING "btree" ("badge_type");



CREATE INDEX "idx_bluecheck_status" ON "public"."bluecheck_purchases" USING "btree" ("status");



CREATE INDEX "idx_bluecheck_tx_hash" ON "public"."bluecheck_purchases" USING "btree" ("payment_tx_hash") WHERE ("payment_tx_hash" IS NOT NULL);



CREATE INDEX "idx_bluecheck_user" ON "public"."bluecheck_purchases" USING "btree" ("user_id");



CREATE INDEX "idx_bonding_events_pool" ON "public"."bonding_events" USING "btree" ("pool_id", "created_at" DESC);



CREATE INDEX "idx_bonding_events_triggered_by" ON "public"."bonding_events" USING "btree" ("triggered_by") WHERE ("triggered_by" IS NOT NULL);



CREATE INDEX "idx_bonding_events_type" ON "public"."bonding_events" USING "btree" ("event_type");



CREATE INDEX "idx_bonding_pools_creator" ON "public"."bonding_pools" USING "btree" ("creator_id");



CREATE INDEX "idx_bonding_pools_graduation_threshold" ON "public"."bonding_pools" USING "btree" ("actual_sol_reserves", "graduation_threshold_sol") WHERE ("status" = 'LIVE'::"text");



CREATE INDEX "idx_bonding_pools_project" ON "public"."bonding_pools" USING "btree" ("project_id");



CREATE INDEX "idx_bonding_pools_status" ON "public"."bonding_pools" USING "btree" ("status");



CREATE INDEX "idx_bonding_pools_token_mint" ON "public"."bonding_pools" USING "btree" ("token_mint");



CREATE INDEX "idx_bonding_swaps_pool" ON "public"."bonding_swaps" USING "btree" ("pool_id", "created_at" DESC);



CREATE INDEX "idx_bonding_swaps_referrer" ON "public"."bonding_swaps" USING "btree" ("referrer_id") WHERE ("referrer_id" IS NOT NULL);



CREATE INDEX "idx_bonding_swaps_tx" ON "public"."bonding_swaps" USING "btree" ("tx_hash");



CREATE INDEX "idx_bonding_swaps_user" ON "public"."bonding_swaps" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_comment_likes_comment" ON "public"."comment_likes" USING "btree" ("comment_id");



CREATE INDEX "idx_comment_likes_user" ON "public"."comment_likes" USING "btree" ("user_id");



CREATE INDEX "idx_contributions_chain" ON "public"."contributions" USING "btree" ("chain");



CREATE INDEX "idx_contributions_chain_hash" ON "public"."contributions" USING "btree" ("chain", "tx_hash");



CREATE INDEX "idx_contributions_round" ON "public"."contributions" USING "btree" ("round_id");



CREATE INDEX "idx_contributions_status" ON "public"."contributions" USING "btree" ("status");



CREATE INDEX "idx_contributions_user" ON "public"."contributions" USING "btree" ("user_id");



CREATE INDEX "idx_contributions_user_chain" ON "public"."contributions" USING "btree" ("user_id", "chain");



CREATE INDEX "idx_contributions_wallet" ON "public"."contributions" USING "btree" ("wallet_address");



CREATE INDEX "idx_contributions_wallet_lower" ON "public"."contributions" USING "btree" ("lower"("wallet_address"));



CREATE INDEX "idx_created_tokens_address" ON "public"."created_tokens" USING "btree" ("token_address");



CREATE INDEX "idx_created_tokens_chain" ON "public"."created_tokens" USING "btree" ("chain");



CREATE INDEX "idx_created_tokens_created_at" ON "public"."created_tokens" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_created_tokens_creator" ON "public"."created_tokens" USING "btree" ("creator_id");



CREATE INDEX "idx_dex_migrations_lp_lock" ON "public"."dex_migrations" USING "btree" ("lp_lock_id") WHERE ("lp_lock_id" IS NOT NULL);



CREATE INDEX "idx_dex_migrations_pool" ON "public"."dex_migrations" USING "btree" ("pool_id");



CREATE INDEX "idx_dex_migrations_status" ON "public"."dex_migrations" USING "btree" ("status");



CREATE INDEX "idx_fee_splits_processed" ON "public"."fee_splits" USING "btree" ("processed") WHERE (NOT "processed");



CREATE INDEX "idx_fee_splits_source" ON "public"."fee_splits" USING "btree" ("source_type", "source_id");



CREATE INDEX "idx_kyc_created" ON "public"."kyc_submissions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_kyc_project_id" ON "public"."kyc_submissions" USING "btree" ("project_id");



CREATE INDEX "idx_kyc_status" ON "public"."kyc_submissions" USING "btree" ("status");



CREATE INDEX "idx_kyc_user_id" ON "public"."kyc_submissions" USING "btree" ("user_id");



CREATE INDEX "idx_launch_rounds_admin_deployer" ON "public"."launch_rounds" USING "btree" ("admin_deployer_id");



CREATE INDEX "idx_launch_rounds_chain" ON "public"."launch_rounds" USING "btree" ("chain_id");



CREATE INDEX "idx_launch_rounds_created_token" ON "public"."launch_rounds" USING "btree" ("created_token_id") WHERE ("created_token_id" IS NOT NULL);



CREATE INDEX "idx_launch_rounds_deployed_at" ON "public"."launch_rounds" USING "btree" ("deployed_at");



CREATE INDEX "idx_launch_rounds_escrow_tx" ON "public"."launch_rounds" USING "btree" ("escrow_tx_hash");



CREATE INDEX "idx_launch_rounds_fairlaunch_active" ON "public"."launch_rounds" USING "btree" ("sale_type", "status", "start_at" DESC) WHERE (("sale_type" = 'fairlaunch'::"text") AND ("status" = ANY (ARRAY['UPCOMING'::"text", 'ACTIVE'::"text"])));



COMMENT ON INDEX "public"."idx_launch_rounds_fairlaunch_active" IS 'Optimizes homepage queries for active fairlaunch rounds sorted by start date';



CREATE INDEX "idx_launch_rounds_fee_splitter" ON "public"."launch_rounds" USING "btree" ("fee_splitter_address");



CREATE INDEX "idx_launch_rounds_reviewed_by" ON "public"."launch_rounds" USING "btree" ("reviewed_by") WHERE ("reviewed_by" IS NOT NULL);



CREATE INDEX "idx_launch_rounds_round_address" ON "public"."launch_rounds" USING "btree" ("round_address") WHERE ("round_address" IS NOT NULL);



CREATE INDEX "idx_launch_rounds_sale_type" ON "public"."launch_rounds" USING "btree" ("sale_type");



COMMENT ON INDEX "public"."idx_launch_rounds_sale_type" IS 'Optimizes queries filtering by presale vs fairlaunch';



CREATE INDEX "idx_launch_rounds_security_badges" ON "public"."launch_rounds" USING "gin" ("security_badges");



COMMENT ON INDEX "public"."idx_launch_rounds_security_badges" IS 'Optimizes queries searching for specific security badges using array containment operators';



CREATE INDEX "idx_launch_rounds_status_submitted" ON "public"."launch_rounds" USING "btree" ("status") WHERE ("status" = 'SUBMITTED_FOR_REVIEW'::"text");



CREATE INDEX "idx_launch_rounds_success_gates" ON "public"."launch_rounds" USING "btree" ("vesting_status", "lock_status");



CREATE INDEX "idx_launch_rounds_tokens_deposited" ON "public"."launch_rounds" USING "btree" ("tokens_deposited_at") WHERE ("tokens_deposited_at" IS NOT NULL);



CREATE INDEX "idx_launch_rounds_verification_status" ON "public"."launch_rounds" USING "btree" ("verification_status");



CREATE INDEX "idx_liquidity_locks_chain" ON "public"."liquidity_locks" USING "btree" ("chain");



CREATE INDEX "idx_liquidity_locks_round" ON "public"."liquidity_locks" USING "btree" ("round_id");



CREATE INDEX "idx_liquidity_locks_status" ON "public"."liquidity_locks" USING "btree" ("status");



CREATE INDEX "idx_liquidity_locks_tx_hash" ON "public"."liquidity_locks" USING "btree" ("lock_tx_hash") WHERE ("lock_tx_hash" IS NOT NULL);



CREATE INDEX "idx_merkle_proofs_round" ON "public"."presale_merkle_proofs" USING "btree" ("round_id");



CREATE INDEX "idx_merkle_proofs_wallet" ON "public"."presale_merkle_proofs" USING "btree" ("wallet_address");



CREATE INDEX "idx_nonces_expires" ON "public"."wallet_link_nonces" USING "btree" ("expires_at");



CREATE INDEX "idx_nonces_nonce" ON "public"."wallet_link_nonces" USING "btree" ("nonce");



CREATE UNIQUE INDEX "idx_one_primary_wallet" ON "public"."wallets" USING "btree" ("user_id") WHERE ("wallet_role" = 'PRIMARY'::"text");



CREATE INDEX "idx_post_comments_author" ON "public"."post_comments" USING "btree" ("author_id");



CREATE INDEX "idx_post_comments_parent" ON "public"."post_comments" USING "btree" ("parent_comment_id");



CREATE INDEX "idx_post_comments_post" ON "public"."post_comments" USING "btree" ("post_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_post_likes_post" ON "public"."post_likes" USING "btree" ("post_id");



CREATE INDEX "idx_post_likes_user" ON "public"."post_likes" USING "btree" ("user_id");



CREATE INDEX "idx_post_reactions_post" ON "public"."post_reactions" USING "btree" ("post_id");



CREATE INDEX "idx_post_reactions_type" ON "public"."post_reactions" USING "btree" ("reaction_type");



CREATE INDEX "idx_post_reactions_user" ON "public"."post_reactions" USING "btree" ("user_id");



CREATE INDEX "idx_post_shares_post" ON "public"."post_shares" USING "btree" ("post_id");



CREATE INDEX "idx_post_shares_type" ON "public"."post_shares" USING "btree" ("share_type");



CREATE INDEX "idx_post_shares_user" ON "public"."post_shares" USING "btree" ("user_id");



CREATE INDEX "idx_post_views_post" ON "public"."post_views" USING "btree" ("post_id");



CREATE INDEX "idx_post_views_user" ON "public"."post_views" USING "btree" ("user_id") WHERE ("user_id" IS NOT NULL);



CREATE INDEX "idx_post_views_viewed_at" ON "public"."post_views" USING "btree" ("viewed_at");



CREATE INDEX "idx_posts_author" ON "public"."posts" USING "btree" ("author_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_posts_created" ON "public"."posts" USING "btree" ("created_at" DESC) WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_posts_has_images" ON "public"."posts" USING "btree" ((("array_length"("image_urls", 1) > 0))) WHERE (("deleted_at" IS NULL) AND ("array_length"("image_urls", 1) > 0));



CREATE INDEX "idx_posts_hashtags" ON "public"."posts" USING "gin" ("hashtags");



CREATE INDEX "idx_posts_parent" ON "public"."posts" USING "btree" ("parent_post_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_posts_project" ON "public"."posts" USING "btree" ("project_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_posts_quoted" ON "public"."posts" USING "btree" ("quoted_post_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_posts_reposted" ON "public"."posts" USING "btree" ("reposted_post_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_profiles_active_referrals" ON "public"."profiles" USING "btree" ("active_referral_count") WHERE ("active_referral_count" > 0);



CREATE INDEX "idx_profiles_follower_count" ON "public"."profiles" USING "btree" ("follower_count" DESC) WHERE ("follower_count" > 0);



CREATE INDEX "idx_profiles_following_count" ON "public"."profiles" USING "btree" ("following_count" DESC) WHERE ("following_count" > 0);



CREATE INDEX "idx_profiles_kyc_status" ON "public"."profiles" USING "btree" ("kyc_status");



CREATE INDEX "idx_profiles_nickname" ON "public"."profiles" USING "btree" ("nickname");



CREATE INDEX "idx_profiles_referral_code" ON "public"."profiles" USING "btree" ("referral_code") WHERE ("referral_code" IS NOT NULL);



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "idx_project_badges_badge" ON "public"."project_badges" USING "btree" ("badge_id");



CREATE INDEX "idx_project_badges_project" ON "public"."project_badges" USING "btree" ("project_id");



CREATE INDEX "idx_projects_chain" ON "public"."projects" USING "btree" ("chain");



CREATE INDEX "idx_projects_chain_id" ON "public"."projects" USING "btree" ("chain_id");



CREATE INDEX "idx_projects_contract_mode" ON "public"."projects" USING "btree" ("contract_mode");



CREATE INDEX "idx_projects_creator_id" ON "public"."projects" USING "btree" ("creator_id");



CREATE INDEX "idx_projects_creator_wallet" ON "public"."projects" USING "btree" ("creator_wallet");



CREATE INDEX "idx_projects_metadata_gin" ON "public"."projects" USING "gin" ("metadata");



CREATE INDEX "idx_projects_owner" ON "public"."projects" USING "btree" ("owner_user_id");



CREATE INDEX "idx_projects_scan_status" ON "public"."projects" USING "btree" ("sc_scan_status");



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status");



CREATE INDEX "idx_projects_token_address" ON "public"."projects" USING "btree" ("token_address");



CREATE INDEX "idx_projects_token_verification_status" ON "public"."projects" USING "btree" ("token_verification_status");



CREATE INDEX "idx_projects_type" ON "public"."projects" USING "btree" ("type");



CREATE INDEX "idx_referral_activated" ON "public"."referral_relationships" USING "btree" ("activated_at") WHERE ("activated_at" IS NOT NULL);



CREATE INDEX "idx_referral_code" ON "public"."referral_relationships" USING "btree" ("code");



CREATE INDEX "idx_referral_ledger_chain" ON "public"."referral_ledger" USING "btree" ("chain");



CREATE INDEX "idx_referral_ledger_referrer" ON "public"."referral_ledger" USING "btree" ("referrer_id");



CREATE INDEX "idx_referral_ledger_referrer_chain" ON "public"."referral_ledger" USING "btree" ("referrer_id", "chain");



CREATE INDEX "idx_referral_ledger_source" ON "public"."referral_ledger" USING "btree" ("source_type", "source_id");



CREATE INDEX "idx_referral_ledger_status" ON "public"."referral_ledger" USING "btree" ("status");



CREATE INDEX "idx_referral_referee" ON "public"."referral_relationships" USING "btree" ("referee_id");



CREATE INDEX "idx_referral_referrer" ON "public"."referral_relationships" USING "btree" ("referrer_id");



CREATE INDEX "idx_refunds_idempotency" ON "public"."refunds" USING "btree" ("idempotency_key") WHERE ("idempotency_key" IS NOT NULL);



CREATE INDEX "idx_refunds_round" ON "public"."refunds" USING "btree" ("round_id");



CREATE INDEX "idx_refunds_status" ON "public"."refunds" USING "btree" ("status");



CREATE INDEX "idx_refunds_user" ON "public"."refunds" USING "btree" ("user_id");



CREATE INDEX "idx_round_post_finalize_lock_status" ON "public"."round_post_finalize" USING "btree" ("lock_setup_status");



CREATE INDEX "idx_round_post_finalize_round" ON "public"."round_post_finalize" USING "btree" ("round_id");



CREATE INDEX "idx_round_post_finalize_vesting_status" ON "public"."round_post_finalize" USING "btree" ("vesting_setup_status");



CREATE INDEX "idx_rounds_active_deployments" ON "public"."launch_rounds" USING "btree" ("deployment_status", "created_at") WHERE ("deployment_status" = ANY (ARRAY['DEPLOYING'::"text", 'DEPLOYED'::"text", 'PENDING_FUNDING'::"text"]));



CREATE INDEX "idx_rounds_chain" ON "public"."launch_rounds" USING "btree" ("chain");



CREATE INDEX "idx_rounds_contract_address" ON "public"."launch_rounds" USING "btree" ("contract_address");



CREATE INDEX "idx_rounds_created_by" ON "public"."launch_rounds" USING "btree" ("created_by");



CREATE INDEX "idx_rounds_deployment_status" ON "public"."launch_rounds" USING "btree" ("deployment_status");



CREATE INDEX "idx_rounds_deployment_tx" ON "public"."launch_rounds" USING "btree" ("deployment_tx_hash");



CREATE INDEX "idx_rounds_pending_verification" ON "public"."launch_rounds" USING "btree" ("verification_status", "deployed_at") WHERE ("verification_status" = ANY (ARRAY['NOT_VERIFIED'::"text", 'VERIFICATION_PENDING'::"text", 'VERIFICATION_QUEUED'::"text"]));



CREATE INDEX "idx_rounds_pool_address" ON "public"."launch_rounds" USING "btree" ("pool_address") WHERE ("pool_address" IS NOT NULL);



CREATE INDEX "idx_rounds_project" ON "public"."launch_rounds" USING "btree" ("project_id");



CREATE INDEX "idx_rounds_result" ON "public"."launch_rounds" USING "btree" ("result");



CREATE INDEX "idx_rounds_status" ON "public"."launch_rounds" USING "btree" ("status");



CREATE INDEX "idx_rounds_timing" ON "public"."launch_rounds" USING "btree" ("start_at", "end_at");



CREATE INDEX "idx_rounds_type" ON "public"."launch_rounds" USING "btree" ("type");



CREATE INDEX "idx_rounds_verification_status" ON "public"."launch_rounds" USING "btree" ("verification_status");



CREATE INDEX "idx_sbt_claims_status" ON "public"."sbt_claims" USING "btree" ("status");



CREATE INDEX "idx_sbt_claims_user" ON "public"."sbt_claims" USING "btree" ("user_id");



CREATE INDEX "idx_sbt_stakes_rule" ON "public"."sbt_stakes" USING "btree" ("rule_id");



CREATE INDEX "idx_sbt_stakes_user" ON "public"."sbt_stakes" USING "btree" ("user_id");



CREATE INDEX "idx_scan_contract" ON "public"."sc_scan_results" USING "btree" ("contract_address", "chain");



CREATE INDEX "idx_scan_project_id" ON "public"."sc_scan_results" USING "btree" ("project_id");



CREATE INDEX "idx_scan_project_network" ON "public"."sc_scan_results" USING "btree" ("project_id", "network");



CREATE INDEX "idx_scan_status" ON "public"."sc_scan_results" USING "btree" ("status");



CREATE INDEX "idx_scan_status_needs_review" ON "public"."sc_scan_results" USING "btree" ("status") WHERE ("status" = 'NEEDS_REVIEW'::"text");



CREATE INDEX "idx_scan_target_address" ON "public"."sc_scan_results" USING "btree" ("target_address");



CREATE INDEX "idx_template_audits_network" ON "public"."template_audits" USING "btree" ("network", "status");



CREATE INDEX "idx_template_audits_valid" ON "public"."template_audits" USING "btree" ("network", "template_version") WHERE ("status" = 'VALID'::"text");



CREATE INDEX "idx_template_audits_version" ON "public"."template_audits" USING "btree" ("template_version");



CREATE INDEX "idx_transactions_chain" ON "public"."transactions" USING "btree" ("chain");



CREATE INDEX "idx_transactions_created" ON "public"."transactions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_transactions_status" ON "public"."transactions" USING "btree" ("status");



CREATE UNIQUE INDEX "idx_transactions_unique_chain_tx_hash" ON "public"."transactions" USING "btree" ("chain", "tx_hash") WHERE ("tx_hash" IS NOT NULL);



CREATE INDEX "idx_transactions_user_id" ON "public"."transactions" USING "btree" ("user_id");



CREATE INDEX "idx_trending_projects_project" ON "public"."trending_projects" USING "btree" ("project_id");



CREATE INDEX "idx_trending_projects_snapshot" ON "public"."trending_projects" USING "btree" ("snapshot_id");



CREATE INDEX "idx_trending_snapshots_computed" ON "public"."trending_snapshots" USING "btree" ("computed_at" DESC);



CREATE INDEX "idx_user_follows_check" ON "public"."user_follows" USING "btree" ("follower_id", "following_id");



CREATE INDEX "idx_user_follows_created" ON "public"."user_follows" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_follows_follower" ON "public"."user_follows" USING "btree" ("follower_id");



CREATE INDEX "idx_user_follows_following" ON "public"."user_follows" USING "btree" ("following_id");



CREATE INDEX "idx_vesting_allocations_round" ON "public"."vesting_allocations" USING "btree" ("round_id");



CREATE INDEX "idx_vesting_allocations_schedule" ON "public"."vesting_allocations" USING "btree" ("schedule_id");



CREATE INDEX "idx_vesting_allocations_user" ON "public"."vesting_allocations" USING "btree" ("user_id");



CREATE INDEX "idx_vesting_claims_allocation" ON "public"."vesting_claims" USING "btree" ("allocation_id");



CREATE INDEX "idx_vesting_claims_idempotency" ON "public"."vesting_claims" USING "btree" ("idempotency_key");



CREATE INDEX "idx_vesting_claims_status" ON "public"."vesting_claims" USING "btree" ("status");



CREATE INDEX "idx_vesting_claims_tx_hash" ON "public"."vesting_claims" USING "btree" ("tx_hash") WHERE ("tx_hash" IS NOT NULL);



CREATE INDEX "idx_vesting_claims_user" ON "public"."vesting_claims" USING "btree" ("user_id");



CREATE INDEX "idx_vesting_schedules_chain" ON "public"."vesting_schedules" USING "btree" ("chain");



CREATE INDEX "idx_vesting_schedules_round" ON "public"."vesting_schedules" USING "btree" ("round_id");



CREATE INDEX "idx_vesting_schedules_salt" ON "public"."vesting_schedules" USING "btree" ("schedule_salt");



CREATE INDEX "idx_vesting_schedules_status" ON "public"."vesting_schedules" USING "btree" ("status");



CREATE INDEX "idx_wallets_address" ON "public"."wallets" USING "btree" ("address");



CREATE INDEX "idx_wallets_chain" ON "public"."wallets" USING "btree" ("chain");



CREATE INDEX "idx_wallets_role" ON "public"."wallets" USING "btree" ("wallet_role");



CREATE UNIQUE INDEX "idx_wallets_unique_primary_per_chain" ON "public"."wallets" USING "btree" ("user_id", "chain") WHERE ("is_primary" = true);



CREATE INDEX "idx_wallets_user_id" ON "public"."wallets" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "bonding_pools_status_change_event" AFTER UPDATE ON "public"."bonding_pools" FOR EACH ROW WHEN (("old"."status" IS DISTINCT FROM "new"."status")) EXECUTE FUNCTION "public"."create_bonding_status_event"();



CREATE OR REPLACE TRIGGER "prevent_audit_log_delete" BEFORE DELETE ON "public"."audit_logs" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_audit_log_modification"();



CREATE OR REPLACE TRIGGER "prevent_audit_log_update" BEFORE UPDATE ON "public"."audit_logs" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_audit_log_modification"();



CREATE OR REPLACE TRIGGER "trigger_assign_safu_badge" AFTER INSERT OR UPDATE OF "created_token_id" ON "public"."launch_rounds" FOR EACH ROW WHEN (("new"."created_token_id" IS NOT NULL)) EXECUTE FUNCTION "public"."assign_safu_badge_if_eligible"();



COMMENT ON TRIGGER "trigger_assign_safu_badge" ON "public"."launch_rounds" IS 'Auto-assign SAFU badge when project uses platform token';



CREATE OR REPLACE TRIGGER "trigger_auto_award_dev_kyc_badge" AFTER UPDATE OF "kyc_status" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."auto_award_dev_kyc_badge"();



CREATE OR REPLACE TRIGGER "trigger_auto_award_first_project_badge" AFTER INSERT ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."auto_award_first_project_badge"();



CREATE OR REPLACE TRIGGER "trigger_auto_award_kyc_badge" AFTER UPDATE ON "public"."kyc_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."auto_award_kyc_badge"();



CREATE OR REPLACE TRIGGER "trigger_auto_award_scan_badge" AFTER INSERT OR UPDATE ON "public"."sc_scan_results" FOR EACH ROW EXECUTE FUNCTION "public"."auto_award_scan_badge"();



CREATE OR REPLACE TRIGGER "trigger_auto_deployment_status" BEFORE INSERT OR UPDATE ON "public"."launch_rounds" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_deployment_status"();



CREATE OR REPLACE TRIGGER "trigger_check_round_success" BEFORE UPDATE ON "public"."launch_rounds" FOR EACH ROW WHEN ((("new"."vesting_status" IS DISTINCT FROM "old"."vesting_status") OR ("new"."lock_status" IS DISTINCT FROM "old"."lock_status") OR ("new"."result" IS DISTINCT FROM "old"."result"))) EXECUTE FUNCTION "public"."check_and_mark_round_success"();



CREATE OR REPLACE TRIGGER "trigger_decrement_round_totals" AFTER UPDATE ON "public"."contributions" FOR EACH ROW EXECUTE FUNCTION "public"."decrement_round_totals"();



CREATE OR REPLACE TRIGGER "trigger_generate_referral_code" BEFORE INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."auto_generate_referral_code"();



CREATE OR REPLACE TRIGGER "trigger_increment_round_totals" AFTER INSERT OR UPDATE ON "public"."contributions" FOR EACH ROW EXECUTE FUNCTION "public"."increment_round_totals"();



CREATE OR REPLACE TRIGGER "trigger_update_comment_like_count" AFTER INSERT OR DELETE ON "public"."comment_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_comment_like_count"();



CREATE OR REPLACE TRIGGER "trigger_update_follow_counts" AFTER INSERT OR DELETE ON "public"."user_follows" FOR EACH ROW EXECUTE FUNCTION "public"."update_follow_counts"();



CREATE OR REPLACE TRIGGER "trigger_update_post_comment_count" AFTER INSERT OR DELETE ON "public"."post_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_post_comment_count"();



CREATE OR REPLACE TRIGGER "trigger_update_post_like_count" AFTER INSERT OR DELETE ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_post_like_count"();



CREATE OR REPLACE TRIGGER "trigger_update_post_view_count" AFTER INSERT ON "public"."post_views" FOR EACH ROW EXECUTE FUNCTION "public"."update_post_view_count"();



CREATE OR REPLACE TRIGGER "trigger_update_verified_at" BEFORE UPDATE ON "public"."launch_rounds" FOR EACH ROW WHEN (("new"."verification_status" IS DISTINCT FROM "old"."verification_status")) EXECUTE FUNCTION "public"."update_verified_at_timestamp"();



CREATE OR REPLACE TRIGGER "update_allocations_updated_at" BEFORE UPDATE ON "public"."round_allocations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ama_sessions_updated_at" BEFORE UPDATE ON "public"."ama_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_audit_proofs_updated_at" BEFORE UPDATE ON "public"."contract_audit_proofs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_badge_instances_updated_at" BEFORE UPDATE ON "public"."badge_instances" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_bluecheck_purchases_updated_at" BEFORE UPDATE ON "public"."bluecheck_purchases" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_bonding_pools_updated_at" BEFORE UPDATE ON "public"."bonding_pools" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_created_tokens_updated_at" BEFORE UPDATE ON "public"."created_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_kyc_updated_at" BEFORE UPDATE ON "public"."kyc_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_liquidity_locks_updated_at" BEFORE UPDATE ON "public"."liquidity_locks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_post_comments_updated_at" BEFORE UPDATE ON "public"."post_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_referral_ledger_updated_at" BEFORE UPDATE ON "public"."referral_ledger" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_referral_relationships_updated_at" BEFORE UPDATE ON "public"."referral_relationships" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_round_post_finalize_updated_at" BEFORE UPDATE ON "public"."round_post_finalize" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_rounds_updated_at" BEFORE UPDATE ON "public"."launch_rounds" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sbt_claims_modtime" BEFORE UPDATE ON "public"."sbt_claims" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_sbt_rules_modtime" BEFORE UPDATE ON "public"."sbt_rules" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_scan_updated_at" BEFORE UPDATE ON "public"."sc_scan_results" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_template_audits_updated_at" BEFORE UPDATE ON "public"."template_audits" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_transactions_updated_at" BEFORE UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vesting_allocations_updated_at" BEFORE UPDATE ON "public"."vesting_allocations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vesting_claims_updated_at" BEFORE UPDATE ON "public"."vesting_claims" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vesting_schedules_updated_at" BEFORE UPDATE ON "public"."vesting_schedules" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_wallets_updated_at" BEFORE UPDATE ON "public"."wallets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_action_approvals"
    ADD CONSTRAINT "admin_action_approvals_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "public"."admin_actions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_action_approvals"
    ADD CONSTRAINT "admin_action_approvals_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."admin_actions"
    ADD CONSTRAINT "admin_actions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_actor_admin_id_fkey" FOREIGN KEY ("actor_admin_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ama_join_tokens"
    ADD CONSTRAINT "ama_join_tokens_ama_id_fkey" FOREIGN KEY ("ama_id") REFERENCES "public"."ama_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ama_messages"
    ADD CONSTRAINT "ama_messages_ama_id_fkey" FOREIGN KEY ("ama_id") REFERENCES "public"."ama_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ama_sessions"
    ADD CONSTRAINT "ama_sessions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_actor_admin_id_fkey" FOREIGN KEY ("actor_admin_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."badge_instances"
    ADD CONSTRAINT "badge_instances_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badge_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bluecheck_purchases"
    ADD CONSTRAINT "bluecheck_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bonding_events"
    ADD CONSTRAINT "bonding_events_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "public"."bonding_pools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bonding_events"
    ADD CONSTRAINT "bonding_events_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."bonding_pools"
    ADD CONSTRAINT "bonding_pools_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bonding_pools"
    ADD CONSTRAINT "bonding_pools_lp_lock_id_fkey" FOREIGN KEY ("lp_lock_id") REFERENCES "public"."liquidity_locks"("id");



ALTER TABLE ONLY "public"."bonding_pools"
    ADD CONSTRAINT "bonding_pools_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bonding_swaps"
    ADD CONSTRAINT "bonding_swaps_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "public"."bonding_pools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bonding_swaps"
    ADD CONSTRAINT "bonding_swaps_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."bonding_swaps"
    ADD CONSTRAINT "bonding_swaps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."post_comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contract_audit_proofs"
    ADD CONSTRAINT "contract_audit_proofs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contributions"
    ADD CONSTRAINT "contributions_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."launch_rounds"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contributions"
    ADD CONSTRAINT "contributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."created_tokens"
    ADD CONSTRAINT "created_tokens_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dex_migrations"
    ADD CONSTRAINT "dex_migrations_lp_lock_id_fkey" FOREIGN KEY ("lp_lock_id") REFERENCES "public"."liquidity_locks"("id");



ALTER TABLE ONLY "public"."dex_migrations"
    ADD CONSTRAINT "dex_migrations_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "public"."bonding_pools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auth_sessions"
    ADD CONSTRAINT "fk_auth_sessions_wallet_id" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kyc_submissions"
    ADD CONSTRAINT "kyc_submissions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."launch_rounds"
    ADD CONSTRAINT "launch_rounds_admin_deployer_id_fkey" FOREIGN KEY ("admin_deployer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."launch_rounds"
    ADD CONSTRAINT "launch_rounds_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."launch_rounds"
    ADD CONSTRAINT "launch_rounds_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."launch_rounds"
    ADD CONSTRAINT "launch_rounds_created_token_id_fkey" FOREIGN KEY ("created_token_id") REFERENCES "public"."created_tokens"("id");



ALTER TABLE ONLY "public"."launch_rounds"
    ADD CONSTRAINT "launch_rounds_finalized_by_fkey" FOREIGN KEY ("finalized_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."launch_rounds"
    ADD CONSTRAINT "launch_rounds_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."launch_rounds"
    ADD CONSTRAINT "launch_rounds_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."liquidity_locks"
    ADD CONSTRAINT "liquidity_locks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."liquidity_locks"
    ADD CONSTRAINT "liquidity_locks_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."launch_rounds"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."post_comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_reactions"
    ADD CONSTRAINT "post_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_views"
    ADD CONSTRAINT "post_views_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_parent_post_id_fkey" FOREIGN KEY ("parent_post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_quoted_post_id_fkey" FOREIGN KEY ("quoted_post_id") REFERENCES "public"."posts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_reposted_post_id_fkey" FOREIGN KEY ("reposted_post_id") REFERENCES "public"."posts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."presale_merkle_proofs"
    ADD CONSTRAINT "presale_merkle_proofs_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."launch_rounds"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_badges"
    ADD CONSTRAINT "project_badges_awarded_by_fkey" FOREIGN KEY ("awarded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."project_badges"
    ADD CONSTRAINT "project_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badge_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_badges"
    ADD CONSTRAINT "project_badges_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referral_ledger"
    ADD CONSTRAINT "referral_ledger_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referral_relationships"
    ADD CONSTRAINT "referral_relationships_referee_id_fkey" FOREIGN KEY ("referee_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



COMMENT ON CONSTRAINT "referral_relationships_referee_id_fkey" ON "public"."referral_relationships" IS 'FK to profiles.user_id (wallet-only auth system)';



ALTER TABLE ONLY "public"."referral_relationships"
    ADD CONSTRAINT "referral_relationships_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



COMMENT ON CONSTRAINT "referral_relationships_referrer_id_fkey" ON "public"."referral_relationships" IS 'FK to profiles.user_id (wallet-only auth system)';



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."launch_rounds"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."round_allocations"
    ADD CONSTRAINT "round_allocations_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."launch_rounds"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."round_allocations"
    ADD CONSTRAINT "round_allocations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."round_post_finalize"
    ADD CONSTRAINT "round_post_finalize_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."launch_rounds"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sbt_claims"
    ADD CONSTRAINT "sbt_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sbt_rewards_ledger"
    ADD CONSTRAINT "sbt_rewards_ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sbt_stakes"
    ADD CONSTRAINT "sbt_stakes_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "public"."sbt_rules"("id");



ALTER TABLE ONLY "public"."sbt_stakes"
    ADD CONSTRAINT "sbt_stakes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sc_scan_results"
    ADD CONSTRAINT "sc_scan_results_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."trending_projects"
    ADD CONSTRAINT "trending_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trending_projects"
    ADD CONSTRAINT "trending_projects_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "public"."trending_snapshots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vesting_allocations"
    ADD CONSTRAINT "vesting_allocations_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."launch_rounds"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vesting_allocations"
    ADD CONSTRAINT "vesting_allocations_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."vesting_schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vesting_allocations"
    ADD CONSTRAINT "vesting_allocations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vesting_claims"
    ADD CONSTRAINT "vesting_claims_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "public"."vesting_allocations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vesting_claims"
    ADD CONSTRAINT "vesting_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vesting_schedules"
    ADD CONSTRAINT "vesting_schedules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."vesting_schedules"
    ADD CONSTRAINT "vesting_schedules_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."launch_rounds"("id") ON DELETE CASCADE;



CREATE POLICY "Admin can view audit logs with permission" ON "public"."admin_audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."admin_roles" "ar"
     JOIN "public"."admin_permissions" "ap" ON (("ap"."role" = "ar"."role")))
  WHERE (("ar"."user_id" = "auth"."uid"()) AND (("ap"."permission" = 'audit:view'::"text") OR ("ap"."permission" = '*'::"text"))))));



CREATE POLICY "Admins can manage all badge instances" ON "public"."badge_instances" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."is_admin" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



COMMENT ON POLICY "Admins can manage all badge instances" ON "public"."badge_instances" IS 'Allows admins to insert, update, delete badge instances';



CREATE POLICY "Admins can view all rounds" ON "public"."launch_rounds" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can view approvals" ON "public"."admin_action_approvals" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_roles" "ar"
  WHERE ("ar"."user_id" = "auth"."uid"()))));



CREATE POLICY "Admins can view pending actions" ON "public"."admin_actions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_roles" "ar"
  WHERE ("ar"."user_id" = "auth"."uid"()))));



CREATE POLICY "Admins can view permission matrix" ON "public"."admin_permissions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_roles" "ar"
  WHERE ("ar"."user_id" = "auth"."uid"()))));



CREATE POLICY "Allow contributions insert" ON "public"."contributions" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) OR ("user_id" IS NULL)));



CREATE POLICY "Anyone can read merkle proofs" ON "public"."presale_merkle_proofs" FOR SELECT USING (true);



CREATE POLICY "Anyone can view follows" ON "public"."user_follows" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create projects" ON "public"."projects" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Owners can manage own draft rounds" ON "public"."launch_rounds" USING ((("created_by" = "auth"."uid"()) AND ("status" = 'DRAFT'::"text")));



CREATE POLICY "Owners can view own rounds" ON "public"."launch_rounds" FOR SELECT USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Public can view active user badges" ON "public"."badge_instances" FOR SELECT USING (("status" = 'ACTIVE'::"text"));



CREATE POLICY "Public can view all follows" ON "public"."user_follows" FOR SELECT USING (true);



CREATE POLICY "Public can view approved projects" ON "public"."projects" FOR SELECT USING (("status" = ANY (ARRAY['APPROVED'::"text", 'LIVE'::"text", 'ENDED'::"text"])));



CREATE POLICY "Public can view approved rounds" ON "public"."launch_rounds" FOR SELECT USING (("status" = ANY (ARRAY['APPROVED'::"text", 'APPROVED_TO_DEPLOY'::"text", 'DEPLOYED'::"text", 'ACTIVE'::"text", 'ENDED'::"text", 'CANCELLED'::"text"])));



CREATE POLICY "Public can view created tokens" ON "public"."created_tokens" FOR SELECT USING (true);



CREATE POLICY "Public read access to contributions" ON "public"."contributions" FOR SELECT USING (true);



COMMENT ON POLICY "Public read access to contributions" ON "public"."contributions" IS 'Allow public read access to all contributions for transparency. Contributors can verify their transactions and total raised.';



CREATE POLICY "Public read sbt_rules" ON "public"."sbt_rules" FOR SELECT USING (true);



CREATE POLICY "Public read snapshots" ON "public"."trending_snapshots" FOR SELECT USING (true);



CREATE POLICY "Public read trending projects" ON "public"."trending_projects" FOR SELECT USING (true);



CREATE POLICY "Service role can insert audit logs" ON "public"."admin_audit_logs" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Service role can insert proofs" ON "public"."presale_merkle_proofs" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage actions" ON "public"."admin_actions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage all follows" ON "public"."user_follows" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage approvals" ON "public"."admin_action_approvals" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can update proofs" ON "public"."presale_merkle_proofs" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Super admin can view roles" ON "public"."admin_roles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_roles" "ar"
  WHERE (("ar"."user_id" = "auth"."uid"()) AND ("ar"."role" = 'super_admin'::"text")))));



CREATE POLICY "System can manage sessions" ON "public"."auth_sessions" USING (true) WITH CHECK (true);



CREATE POLICY "Users can create follows" ON "public"."user_follows" FOR INSERT WITH CHECK (("follower_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own follows" ON "public"."user_follows" FOR DELETE USING (("follower_id" = "auth"."uid"()));



CREATE POLICY "Users can follow others" ON "public"."user_follows" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can unfollow" ON "public"."user_follows" FOR DELETE USING (true);



CREATE POLICY "Users can view own allocations" ON "public"."round_allocations" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own badge instances" ON "public"."badge_instances" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own contributions" ON "public"."contributions" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own refunds" ON "public"."refunds" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own sessions" ON "public"."auth_sessions" FOR SELECT USING (("wallet_address" IN ( SELECT "wallets"."address"
   FROM "public"."wallets"
  WHERE ("wallets"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users delete own stakes" ON "public"."sbt_stakes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users insert own claims" ON "public"."sbt_claims" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users insert own stakes" ON "public"."sbt_stakes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users read own claims" ON "public"."sbt_claims" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users read own ledger" ON "public"."sbt_rewards_ledger" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users read own stakes" ON "public"."sbt_stakes" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."admin_action_approvals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ama_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ama_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."badge_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bluecheck_purchases" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bluecheck_purchases_admin_all" ON "public"."bluecheck_purchases" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "bluecheck_purchases_own_insert" ON "public"."bluecheck_purchases" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "bluecheck_purchases_own_read" ON "public"."bluecheck_purchases" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."bonding_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bonding_events_insert" ON "public"."bonding_events" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "bonding_events_select" ON "public"."bonding_events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."bonding_pools"
  WHERE (("bonding_pools"."id" = "bonding_events"."pool_id") AND (("bonding_pools"."status" = ANY (ARRAY['LIVE'::"text", 'GRADUATING'::"text", 'GRADUATED'::"text"])) OR ("bonding_pools"."creator_id" = "auth"."uid"()))))));



CREATE POLICY "bonding_events_service_role" ON "public"."bonding_events" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."bonding_pools" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bonding_pools_insert" ON "public"."bonding_pools" FOR INSERT WITH CHECK (("auth"."uid"() = "creator_id"));



CREATE POLICY "bonding_pools_select" ON "public"."bonding_pools" FOR SELECT USING ((("auth"."uid"() = "creator_id") OR ("status" = ANY (ARRAY['LIVE'::"text", 'GRADUATING'::"text", 'GRADUATED'::"text"]))));



CREATE POLICY "bonding_pools_service_role" ON "public"."bonding_pools" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "bonding_pools_update" ON "public"."bonding_pools" FOR UPDATE USING ((("auth"."uid"() = "creator_id") AND ("status" = 'DRAFT'::"text")));



ALTER TABLE "public"."bonding_swaps" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bonding_swaps_insert" ON "public"."bonding_swaps" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "bonding_swaps_select" ON "public"."bonding_swaps" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."bonding_pools"
  WHERE (("bonding_pools"."id" = "bonding_swaps"."pool_id") AND (("bonding_pools"."status" = ANY (ARRAY['LIVE'::"text", 'GRADUATING'::"text", 'GRADUATED'::"text"])) OR ("bonding_pools"."creator_id" = "auth"."uid"()))))));



CREATE POLICY "bonding_swaps_service_role" ON "public"."bonding_swaps" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."contract_audit_proofs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contributions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."created_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dex_migrations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dex_migrations_insert" ON "public"."dex_migrations" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "dex_migrations_select" ON "public"."dex_migrations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."bonding_pools"
  WHERE (("bonding_pools"."id" = "dex_migrations"."pool_id") AND (("bonding_pools"."status" = ANY (ARRAY['GRADUATING'::"text", 'GRADUATED'::"text"])) OR ("bonding_pools"."creator_id" = "auth"."uid"()))))));



CREATE POLICY "dex_migrations_service_role" ON "public"."dex_migrations" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "dex_migrations_update" ON "public"."dex_migrations" FOR UPDATE USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."fee_splits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "fee_splits_admin_all" ON "public"."fee_splits" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."liquidity_locks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "liquidity_locks_admin_all" ON "public"."liquidity_locks" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "liquidity_locks_public_read" ON "public"."liquidity_locks" FOR SELECT USING (true);



CREATE POLICY "posts_public_read" ON "public"."posts" FOR SELECT USING (("deleted_at" IS NULL));



ALTER TABLE "public"."presale_merkle_proofs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referral_ledger" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "referral_ledger_admin_all" ON "public"."referral_ledger" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "referral_ledger_own_read" ON "public"."referral_ledger" FOR SELECT USING (("referrer_id" = "auth"."uid"()));



ALTER TABLE "public"."referral_relationships" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "referral_relationships_admin_all" ON "public"."referral_relationships" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "referral_relationships_own_insert" ON "public"."referral_relationships" FOR INSERT WITH CHECK (("referee_id" = "auth"."uid"()));



CREATE POLICY "referral_relationships_own_read" ON "public"."referral_relationships" FOR SELECT USING ((("referrer_id" = "auth"."uid"()) OR ("referee_id" = "auth"."uid"())));



ALTER TABLE "public"."refunds" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."round_allocations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."round_post_finalize" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "round_post_finalize_admin_all" ON "public"."round_post_finalize" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."sbt_claims" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sbt_rewards_ledger" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sbt_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sbt_stakes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."template_audits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trending_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trending_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_follows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vesting_allocations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "vesting_allocations_admin_all" ON "public"."vesting_allocations" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "vesting_allocations_own_read" ON "public"."vesting_allocations" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."vesting_claims" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "vesting_claims_admin_all" ON "public"."vesting_claims" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "vesting_claims_own_insert" ON "public"."vesting_claims" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "vesting_claims_own_read" ON "public"."vesting_claims" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."vesting_schedules" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "vesting_schedules_admin_all" ON "public"."vesting_schedules" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "vesting_schedules_public_read" ON "public"."vesting_schedules" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."launch_rounds" "lr"
  WHERE (("lr"."id" = "vesting_schedules"."round_id") AND ("lr"."status" = ANY (ARRAY['LIVE'::"text", 'ENDED'::"text", 'FINALIZED'::"text"]))))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."ama_messages";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





























































































































































































GRANT ALL ON FUNCTION "public"."assign_safu_badge_if_eligible"() TO "anon";
GRANT ALL ON FUNCTION "public"."assign_safu_badge_if_eligible"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_safu_badge_if_eligible"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_award_dev_kyc_badge"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_award_dev_kyc_badge"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_award_dev_kyc_badge"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_award_first_project_badge"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_award_first_project_badge"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_award_first_project_badge"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_award_kyc_badge"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_award_kyc_badge"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_award_kyc_badge"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_award_scan_badge"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_award_scan_badge"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_award_scan_badge"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_generate_referral_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_generate_referral_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_generate_referral_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_update_deployment_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_update_deployment_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_update_deployment_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_and_mark_round_success"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_and_mark_round_success"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_and_mark_round_success"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_sessions"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_sessions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_sessions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_bonding_status_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_bonding_status_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_bonding_status_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_round_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_round_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_round_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_primary_wallet"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_primary_wallet"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_primary_wallet"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_token_creation_stats"("chain_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_token_creation_stats"("chain_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_token_creation_stats"("chain_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_active_badges"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_active_badges"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_active_badges"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_followers"("target_user_id" "uuid", "result_limit" integer, "result_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_followers"("target_user_id" "uuid", "result_limit" integer, "result_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_followers"("target_user_id" "uuid", "result_limit" integer, "result_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_following"("target_user_id" "uuid", "result_limit" integer, "result_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_following"("target_user_id" "uuid", "result_limit" integer, "result_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_following"("target_user_id" "uuid", "result_limit" integer, "result_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_active_referral_count"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_active_referral_count"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_active_referral_count"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_round_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_round_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_round_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."invalidate_other_wallet_sessions"("p_user_id" "uuid", "p_current_wallet_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."invalidate_other_wallet_sessions"("p_user_id" "uuid", "p_current_wallet_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."invalidate_other_wallet_sessions"("p_user_id" "uuid", "p_current_wallet_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_followable"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_followable"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_followable"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_audit_log_modification"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_audit_log_modification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_audit_log_modification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_comment_like_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_comment_like_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_comment_like_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_follow_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_follow_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_follow_counts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_post_comment_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_comment_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_comment_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_post_like_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_like_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_like_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_post_view_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_view_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_view_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_verified_at_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_verified_at_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_verified_at_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_created_tokens"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_created_tokens"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_created_tokens"("user_uuid" "uuid") TO "service_role";
























GRANT ALL ON TABLE "public"."admin_action_approvals" TO "anon";
GRANT ALL ON TABLE "public"."admin_action_approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_action_approvals" TO "service_role";



GRANT ALL ON TABLE "public"."admin_actions" TO "anon";
GRANT ALL ON TABLE "public"."admin_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_actions" TO "service_role";



GRANT ALL ON TABLE "public"."admin_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."admin_permissions" TO "anon";
GRANT ALL ON TABLE "public"."admin_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."admin_roles" TO "anon";
GRANT ALL ON TABLE "public"."admin_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_roles" TO "service_role";



GRANT ALL ON TABLE "public"."ama_join_tokens" TO "anon";
GRANT ALL ON TABLE "public"."ama_join_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."ama_join_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."ama_messages" TO "anon";
GRANT ALL ON TABLE "public"."ama_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."ama_messages" TO "service_role";



GRANT ALL ON TABLE "public"."ama_requests" TO "anon";
GRANT ALL ON TABLE "public"."ama_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."ama_requests" TO "service_role";



GRANT ALL ON TABLE "public"."ama_sessions" TO "anon";
GRANT ALL ON TABLE "public"."ama_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."ama_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."auth_sessions" TO "anon";
GRANT ALL ON TABLE "public"."auth_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."badge_definitions" TO "anon";
GRANT ALL ON TABLE "public"."badge_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."badge_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."badge_instances" TO "anon";
GRANT ALL ON TABLE "public"."badge_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."badge_instances" TO "service_role";



GRANT ALL ON TABLE "public"."bluecheck_purchases" TO "anon";
GRANT ALL ON TABLE "public"."bluecheck_purchases" TO "authenticated";
GRANT ALL ON TABLE "public"."bluecheck_purchases" TO "service_role";



GRANT ALL ON TABLE "public"."bonding_events" TO "anon";
GRANT ALL ON TABLE "public"."bonding_events" TO "authenticated";
GRANT ALL ON TABLE "public"."bonding_events" TO "service_role";



GRANT ALL ON TABLE "public"."bonding_pools" TO "anon";
GRANT ALL ON TABLE "public"."bonding_pools" TO "authenticated";
GRANT ALL ON TABLE "public"."bonding_pools" TO "service_role";



GRANT ALL ON TABLE "public"."bonding_swaps" TO "anon";
GRANT ALL ON TABLE "public"."bonding_swaps" TO "authenticated";
GRANT ALL ON TABLE "public"."bonding_swaps" TO "service_role";



GRANT ALL ON TABLE "public"."comment_likes" TO "anon";
GRANT ALL ON TABLE "public"."comment_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_likes" TO "service_role";



GRANT ALL ON TABLE "public"."contract_audit_proofs" TO "anon";
GRANT ALL ON TABLE "public"."contract_audit_proofs" TO "authenticated";
GRANT ALL ON TABLE "public"."contract_audit_proofs" TO "service_role";



GRANT ALL ON TABLE "public"."contributions" TO "anon";
GRANT ALL ON TABLE "public"."contributions" TO "authenticated";
GRANT ALL ON TABLE "public"."contributions" TO "service_role";



GRANT ALL ON TABLE "public"."created_tokens" TO "anon";
GRANT ALL ON TABLE "public"."created_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."created_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."launch_rounds" TO "anon";
GRANT ALL ON TABLE "public"."launch_rounds" TO "authenticated";
GRANT ALL ON TABLE "public"."launch_rounds" TO "service_role";



GRANT ALL ON TABLE "public"."deployment_pipeline" TO "anon";
GRANT ALL ON TABLE "public"."deployment_pipeline" TO "authenticated";
GRANT ALL ON TABLE "public"."deployment_pipeline" TO "service_role";



GRANT ALL ON TABLE "public"."dex_migrations" TO "anon";
GRANT ALL ON TABLE "public"."dex_migrations" TO "authenticated";
GRANT ALL ON TABLE "public"."dex_migrations" TO "service_role";



GRANT ALL ON TABLE "public"."fee_splits" TO "anon";
GRANT ALL ON TABLE "public"."fee_splits" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_splits" TO "service_role";



GRANT ALL ON TABLE "public"."kyc_submissions" TO "anon";
GRANT ALL ON TABLE "public"."kyc_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."kyc_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."liquidity_locks" TO "anon";
GRANT ALL ON TABLE "public"."liquidity_locks" TO "authenticated";
GRANT ALL ON TABLE "public"."liquidity_locks" TO "service_role";



GRANT ALL ON TABLE "public"."pending_verifications" TO "anon";
GRANT ALL ON TABLE "public"."pending_verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_verifications" TO "service_role";



GRANT ALL ON TABLE "public"."post_comments" TO "anon";
GRANT ALL ON TABLE "public"."post_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."post_comments" TO "service_role";



GRANT ALL ON TABLE "public"."post_likes" TO "anon";
GRANT ALL ON TABLE "public"."post_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."post_likes" TO "service_role";



GRANT ALL ON TABLE "public"."post_reactions" TO "anon";
GRANT ALL ON TABLE "public"."post_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."post_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."post_shares" TO "anon";
GRANT ALL ON TABLE "public"."post_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."post_shares" TO "service_role";



GRANT ALL ON TABLE "public"."post_views" TO "anon";
GRANT ALL ON TABLE "public"."post_views" TO "authenticated";
GRANT ALL ON TABLE "public"."post_views" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."presale_merkle_proofs" TO "anon";
GRANT ALL ON TABLE "public"."presale_merkle_proofs" TO "authenticated";
GRANT ALL ON TABLE "public"."presale_merkle_proofs" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."project_badges" TO "anon";
GRANT ALL ON TABLE "public"."project_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."project_badges" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."referral_ledger" TO "anon";
GRANT ALL ON TABLE "public"."referral_ledger" TO "authenticated";
GRANT ALL ON TABLE "public"."referral_ledger" TO "service_role";



GRANT ALL ON TABLE "public"."referral_relationships" TO "anon";
GRANT ALL ON TABLE "public"."referral_relationships" TO "authenticated";
GRANT ALL ON TABLE "public"."referral_relationships" TO "service_role";



GRANT ALL ON TABLE "public"."refunds" TO "anon";
GRANT ALL ON TABLE "public"."refunds" TO "authenticated";
GRANT ALL ON TABLE "public"."refunds" TO "service_role";



GRANT ALL ON TABLE "public"."round_allocations" TO "anon";
GRANT ALL ON TABLE "public"."round_allocations" TO "authenticated";
GRANT ALL ON TABLE "public"."round_allocations" TO "service_role";



GRANT ALL ON TABLE "public"."round_post_finalize" TO "anon";
GRANT ALL ON TABLE "public"."round_post_finalize" TO "authenticated";
GRANT ALL ON TABLE "public"."round_post_finalize" TO "service_role";



GRANT ALL ON TABLE "public"."sbt_claims" TO "anon";
GRANT ALL ON TABLE "public"."sbt_claims" TO "authenticated";
GRANT ALL ON TABLE "public"."sbt_claims" TO "service_role";



GRANT ALL ON TABLE "public"."sbt_rewards_ledger" TO "anon";
GRANT ALL ON TABLE "public"."sbt_rewards_ledger" TO "authenticated";
GRANT ALL ON TABLE "public"."sbt_rewards_ledger" TO "service_role";



GRANT ALL ON TABLE "public"."sbt_rules" TO "anon";
GRANT ALL ON TABLE "public"."sbt_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."sbt_rules" TO "service_role";



GRANT ALL ON TABLE "public"."sbt_stakes" TO "anon";
GRANT ALL ON TABLE "public"."sbt_stakes" TO "authenticated";
GRANT ALL ON TABLE "public"."sbt_stakes" TO "service_role";



GRANT ALL ON TABLE "public"."sc_scan_results" TO "anon";
GRANT ALL ON TABLE "public"."sc_scan_results" TO "authenticated";
GRANT ALL ON TABLE "public"."sc_scan_results" TO "service_role";



GRANT ALL ON TABLE "public"."template_audits" TO "anon";
GRANT ALL ON TABLE "public"."template_audits" TO "authenticated";
GRANT ALL ON TABLE "public"."template_audits" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."trending_projects" TO "anon";
GRANT ALL ON TABLE "public"."trending_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."trending_projects" TO "service_role";



GRANT ALL ON TABLE "public"."trending_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."trending_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."trending_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."user_follows" TO "anon";
GRANT ALL ON TABLE "public"."user_follows" TO "authenticated";
GRANT ALL ON TABLE "public"."user_follows" TO "service_role";



GRANT ALL ON TABLE "public"."vesting_allocations" TO "anon";
GRANT ALL ON TABLE "public"."vesting_allocations" TO "authenticated";
GRANT ALL ON TABLE "public"."vesting_allocations" TO "service_role";



GRANT ALL ON TABLE "public"."vesting_claims" TO "anon";
GRANT ALL ON TABLE "public"."vesting_claims" TO "authenticated";
GRANT ALL ON TABLE "public"."vesting_claims" TO "service_role";



GRANT ALL ON TABLE "public"."vesting_schedules" TO "anon";
GRANT ALL ON TABLE "public"."vesting_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."vesting_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."wallet_link_nonces" TO "anon";
GRANT ALL ON TABLE "public"."wallet_link_nonces" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_link_nonces" TO "service_role";



GRANT ALL ON TABLE "public"."wallets" TO "anon";
GRANT ALL ON TABLE "public"."wallets" TO "authenticated";
GRANT ALL ON TABLE "public"."wallets" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































