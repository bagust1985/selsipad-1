SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict igDum6ve8YjnbZ63c4Tc459RE3rthdfpjilOTV1eOrKnqlPG2DXS7xKyO6ggPho

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "user_id", "username", "bio", "avatar_url", "bluecheck_status", "privacy_hide_address", "created_at", "updated_at", "active_referral_count", "kyc_status", "kyc_submitted_at", "is_admin", "follower_count", "following_count", "nickname", "referral_code") VALUES
	('f56eb51e-d9a5-4095-b5d4-b6fed5d0d610', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23', 'budi', NULL, 'https://tkmlclijfinaqtphojkb.supabase.co/storage/v1/object/public/avatars/a0f64677-e16a-4880-bfaa-d4e4d8211d23/1770080542569.png', 'NONE', true, '2026-02-03 00:28:56.59615+00', '2026-02-03 04:02:36.387025+00', 0, 'verified', '2026-02-03 03:57:16.678+00', false, 0, 0, 'budi', 'DPVG4UQH'),
	('7250c680-de91-45fa-8957-b0bd08b24247', 'e27b5f47-fdd8-40f9-82b9-a3fe1fc3154e', 'user_0x25b21c', NULL, NULL, 'NONE', true, '2026-02-03 19:40:20.988991+00', '2026-02-03 19:40:20.988991+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'MZ3KYTJ5'),
	('1dd82613-9503-4eed-ad39-187a75496ab2', 'b7d2baf5-a847-4855-8fb8-88b7cdaf2e27', 'user_0xfd761f', NULL, NULL, 'NONE', true, '2026-02-03 19:48:59.939287+00', '2026-02-03 19:48:59.939287+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'QALYWQ73'),
	('1881ca69-b95f-43c5-a856-7c66bc058c3d', '36b48400-3e06-45e4-b76f-3029c0ffd26f', 'user_0xf2b44e', NULL, NULL, 'NONE', true, '2026-02-03 19:59:02.757188+00', '2026-02-03 19:59:02.757188+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'XFA8YNC4'),
	('50f10c17-0ff1-4a7d-93b2-ee060685a675', '9639ffd8-3766-4fef-ba83-c98f21f47799', 'user_0x9a0d7d', NULL, NULL, 'NONE', true, '2026-02-03 23:20:45.241508+00', '2026-02-03 23:20:45.241508+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'WAE6MMQ5'),
	('f043cbd3-8860-4a7f-84d9-7da9fc537581', '0767dad1-ec0c-43ec-b933-5535c76b265e', 'user_0x1295f6', NULL, NULL, 'NONE', true, '2026-02-03 23:31:21.039019+00', '2026-02-03 23:31:21.039019+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'MR2RWSRD'),
	('447ac463-3d2a-49aa-986e-1c14917bb612', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 'bagust1986', NULL, 'https://tkmlclijfinaqtphojkb.supabase.co/storage/v1/object/public/avatars/2c9fb12c-a387-46b9-83a9-a6ce13fcef6d/1769034911587.png', 'ACTIVE', true, '2026-01-15 16:03:38.030772+00', '2026-02-04 03:43:02.707839+00', 0, 'not_started', NULL, false, 5, 0, 'bagust1986', 'GAYP246U'),
	('24f68d78-43ac-4d6f-a912-582c14a40255', 'd1965e29-d5d8-401c-8008-a4f772d9556e', 'user_0x5058c7', NULL, NULL, 'NONE', true, '2026-02-03 23:09:37.959135+00', '2026-02-04 03:43:02.707839+00', 0, 'not_started', NULL, false, 0, 1, NULL, 'KNCZ8DSY'),
	('f344e9b9-34e1-4d43-82cb-293874563f3a', 'e40815c0-69a4-4c65-a80b-c5f5f57711ab', 'user_0x92b56c', NULL, NULL, 'NONE', true, '2026-01-31 03:44:02.954224+00', '2026-01-31 03:44:20.169547+00', 0, 'not_started', NULL, false, 0, 1, NULL, '58LQ6HQ5'),
	('88daff9c-082e-4663-8fc5-5f41dc6e4d46', '2334ce92-96f8-4f6b-99a4-d00bc98a8c5a', 'user_0x5a9594', NULL, NULL, 'NONE', true, '2026-01-16 06:05:12.205656+00', '2026-01-31 00:51:39.218938+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'RM2UA6CU'),
	('f52bf143-7a5c-4af0-9655-aa27959fa7bf', '16444ec3-6454-4c37-ba3e-f3fed604f530', 'user_0xdc2deb', NULL, NULL, 'NONE', true, '2026-01-17 03:06:54.81617+00', '2026-01-31 00:51:39.218938+00', 0, 'not_started', NULL, false, 0, 0, NULL, '5SCJRGPE'),
	('85d2170f-90c5-457f-aedd-d5d51802d510', '8cd3dbdf-25dd-4283-a6ec-55f84fa87204', 'user_0xc24e3e', NULL, NULL, 'NONE', true, '2026-01-17 03:35:20.039075+00', '2026-01-31 00:51:39.218938+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'BLX2JRK4'),
	('30704091-8d58-4a22-b88e-e500f53b4891', 'ad9b8a47-6082-46cc-8cc8-b80da8de7985', 'user_0x802945', NULL, NULL, 'NONE', true, '2026-01-19 09:57:19.448187+00', '2026-01-31 00:51:39.218938+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'D3UE6ZDT'),
	('404b42a4-c463-44fd-9138-4ecfa8bd5382', 'b9991b35-9356-4fc6-a047-10450ed6a873', 'user_0x592907', NULL, NULL, 'NONE', true, '2026-01-19 09:58:18.258774+00', '2026-01-31 00:51:39.218938+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'UJNSVZBN'),
	('c94f5ecc-66c3-4b84-a88d-e4da5f3e6255', '0487f51f-f7ee-4fe8-9eb0-f58312676387', 'user_0xd7e7f3', NULL, NULL, 'NONE', true, '2026-01-26 20:53:56.716771+00', '2026-01-31 00:51:39.218938+00', 0, 'not_started', NULL, false, 0, 1, NULL, '2BG8STW2'),
	('5f9aa8a1-eb24-44c5-9a8d-9e38f49025f3', '8c1dd323-de22-48e2-9cab-9b71781c6f77', 'gendon', NULL, 'https://tkmlclijfinaqtphojkb.supabase.co/storage/v1/object/public/avatars/8c1dd323-de22-48e2-9cab-9b71781c6f77/1769547342725.png', 'NONE', true, '2026-01-21 09:25:55.361349+00', '2026-01-31 00:51:39.218938+00', 0, 'not_started', NULL, false, 0, 1, 'gendon', 'LQR9JLSP'),
	('4620514e-cdf8-4263-b826-cfbf203b3d4e', '662d0695-3725-45c4-9802-7c1d16adb42a', 'user_0x178cf5', NULL, NULL, 'NONE', true, '2026-01-26 03:04:30.609231+00', '2026-01-31 00:51:39.218938+00', 0, 'not_started', NULL, true, 0, 0, NULL, 'G7EM3DNT'),
	('f986cecc-2b4c-47c9-98b6-dbdb66ef6fd6', '5a5b6f7b-95ec-4d6e-a9e3-943aaa0c43ef', 'user_0xe677cb', NULL, NULL, 'NONE', true, '2026-01-28 21:20:47.407756+00', '2026-01-31 00:51:39.218938+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'BX33SV7A'),
	('d01cb04f-a4ac-4dea-b7b5-2cb0b26b4c4e', '4adc158a-badd-429a-86ea-c0b0d62f0d62', 'user_0xf39fd6', NULL, NULL, 'NONE', true, '2026-01-28 21:50:40.087643+00', '2026-01-31 00:51:39.218938+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'T6YF4C8J'),
	('80d7b183-2b9f-42f2-925f-890a04ad5acf', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', 'user_0x69a8d8', NULL, NULL, 'NONE', true, '2026-01-29 04:03:14.024343+00', '2026-01-31 00:51:39.218938+00', 0, 'not_started', NULL, false, 0, 1, NULL, 'UG3MFF5A'),
	('2bb2cc25-7802-4227-b2fc-e92eeacab248', '7cd0a25a-cd2c-4b7e-be3e-29a5947b1af1', 'user_0x4e5a3e', NULL, NULL, 'NONE', true, '2026-01-31 05:46:44.243483+00', '2026-01-31 05:46:44.243483+00', 0, 'not_started', NULL, false, 0, 0, NULL, 'JBTY3QPU'),
	('1c587835-4588-4a8b-8c7d-84fd8950bce2', 'd18dfb9d-233c-4320-b3b8-90b01b327cde', 'user_0xac89bf', NULL, NULL, 'NONE', true, '2026-01-31 22:18:46.616126+00', '2026-02-01 21:04:10.581307+00', 0, 'not_started', NULL, true, 0, 0, NULL, '9K9PTR6R'),
	('7471a4e9-8f82-4445-883e-b38f82b8f416', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'user_0x92222c', NULL, NULL, 'NONE', true, '2026-02-01 20:22:58.693264+00', '2026-02-02 01:20:48.184187+00', 0, 'not_started', NULL, true, 0, 0, NULL, 'ZDLXF2CV');


--
-- Data for Name: admin_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: admin_action_approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: admin_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."admin_audit_logs" ("id", "actor_admin_id", "action", "entity_type", "entity_id", "after_data", "created_at", "before_data", "ip_address", "user_agent") VALUES
	('a18119f2-743e-4105-acc5-e26db89578e9', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-01-26 04:02:23.592+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('c6294226-d842-45d6-a17f-a8dca3d77ab8', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-01-26 04:02:43.881+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('9def7884-a732-42d8-9229-873c47355c6a', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-01-26 04:10:46.478+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('fc8754cc-93fc-4964-9ef4-f70b920b3f33', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-01-26 10:28:16.334+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('5aaf821d-01f9-4996-a4f8-d3c3f968483d', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-01-26 10:28:34.813+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('b849058e-18e2-45ea-8fe7-4fc4849af0dc', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-01-26 11:22:19.157+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('bf84117b-4bee-4e95-96b9-518e1ed367d7', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-01-26 12:18:34.475+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('e02498b9-cb4f-4df4-9e25-27796be4393a', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-01-26 14:03:28.714+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('9b33bca0-5daa-48ea-80ee-92281b98e4cf', '2334ce92-96f8-4f6b-99a4-d00bc98a8c5a', 'ADMIN_LOGIN_FAILED', 'auth', '2334ce92-96f8-4f6b-99a4-d00bc98a8c5a', '{"reason": "no_admin_roles", "wallet": "0x5A9594E15177CFE1D7ABACE8F5845bE7aE0aE5ec"}', '2026-02-01 20:10:04.512+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('d201d932-0f5f-4b3f-8e03-bedd77879d6a', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'ADMIN_LOGIN_FAILED', 'auth', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '{"reason": "no_admin_roles", "wallet": "0x92222c5248FB6c78c3111AA1076C1eF41F44e394"}', '2026-02-01 20:24:36.057+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('993bb505-4969-4e33-b57e-950d5c306235', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'ADMIN_LOGIN_FAILED', 'auth', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '{"reason": "no_admin_roles", "wallet": "0x92222c5248FB6c78c3111AA1076C1eF41F44e394"}', '2026-02-01 20:24:46.364+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('542a770e-848a-4971-bebf-d38d3cfb1378', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'ADMIN_LOGIN_FAILED', 'auth', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '{"reason": "no_admin_roles", "wallet": "0x92222c5248FB6c78c3111AA1076C1eF41F44e394"}', '2026-02-01 20:24:47.919+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('839d4935-98b0-4290-8fc7-ef689f59bd50', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'ADMIN_LOGIN_FAILED', 'auth', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '{"reason": "no_admin_roles", "wallet": "0x92222c5248FB6c78c3111AA1076C1eF41F44e394"}', '2026-02-01 20:26:30.267+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('104207b9-0099-4bad-a693-21645819b7fd', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'ADMIN_LOGIN_FAILED', 'auth', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '{"reason": "no_admin_roles", "wallet": "0x92222c5248FB6c78c3111AA1076C1eF41F44e394"}', '2026-02-01 20:26:32.76+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('6597981e-5c51-43d5-94e0-b9a74bb20792', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'ADMIN_LOGIN_FAILED', 'auth', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '{"reason": "no_admin_roles", "wallet": "0x92222c5248FB6c78c3111AA1076C1eF41F44e394"}', '2026-02-01 20:26:33.822+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('6cddec4a-89c4-43a8-be84-05ce207b73db', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'ADMIN_LOGIN_FAILED', 'auth', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '{"reason": "no_admin_roles", "wallet": "0x92222c5248FB6c78c3111AA1076C1eF41F44e394"}', '2026-02-01 20:26:34.762+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('c506ad98-e2c6-4ff3-8070-1160c91114df', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'ADMIN_LOGIN_FAILED', 'auth', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '{"reason": "no_admin_roles", "wallet": "0x92222c5248FB6c78c3111AA1076C1eF41F44e394"}', '2026-02-01 20:27:00.61+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('384a9077-9bbd-4a53-90bd-293d3a193b87', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'ADMIN_LOGIN_FAILED', 'auth', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '{"reason": "no_admin_roles", "wallet": "0x92222c5248FB6c78c3111AA1076C1eF41F44e394"}', '2026-02-01 20:27:03.878+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('41a40af9-4a96-47ee-acd5-9c6a28765ec6', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-02-01 20:29:44.636+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('de83b177-90bc-4688-b60b-bc6b8c30004c', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-02-02 00:40:27.489+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('62ab5df0-c674-437d-b676-bf27deca2ae1', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-02-02 02:19:52.138+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('1eaf9e01-9e4a-46c5-afbf-8e7b26120c98', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'ADMIN_LOGIN_FAILED', 'auth', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '{"reason": "no_admin_roles", "wallet": "0x92222c5248FB6c78c3111AA1076C1eF41F44e394"}', '2026-02-02 21:36:37.796+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('b6c77835-5a59-4b6e-9293-a9a08f069e4c', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'ADMIN_LOGIN_FAILED', 'auth', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '{"reason": "no_admin_roles", "wallet": "0x92222c5248FB6c78c3111AA1076C1eF41F44e394"}', '2026-02-02 21:36:58.638+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('55d343bc-3a46-47c3-a146-ba4751e184f3', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-02-02 21:41:23.416+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('9774eab3-65d7-4115-85ce-bf06d5d2fe15', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-02-02 22:32:44.172+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('1c063e41-7c9e-4fca-ac84-14ec156915b0', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-02-03 00:45:35.41+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'),
	('41bd9bd3-5162-460e-a49f-9c5201914fe1', '662d0695-3725-45c4-9802-7c1d16adb42a', 'ADMIN_LOGIN_SUCCESS', 'auth', '662d0695-3725-45c4-9802-7c1d16adb42a', '{"chain": "EVM_1", "roles": ["super_admin"], "wallet": "0x178cf582e811B30205CBF4Bb7bE45A9dF31AaC4A", "mfa_enabled": false}', '2026-02-03 00:45:43.09+00', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36');


--
-- Data for Name: admin_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."admin_permissions" ("role", "permission", "description", "created_at") VALUES
	('super_admin', '*', 'All permissions', '2026-01-26 02:36:46.949181+00'),
	('admin', 'kyc:view', 'View KYC submissions', '2026-01-26 02:36:46.949181+00'),
	('admin', 'kyc:review', 'Approve/reject KYC', '2026-01-26 02:36:46.949181+00'),
	('admin', 'project:view', 'View all projects', '2026-01-26 02:36:46.949181+00'),
	('admin', 'project:approve', 'Approve projects for listing', '2026-01-26 02:36:46.949181+00'),
	('admin', 'project:reject', 'Reject projects', '2026-01-26 02:36:46.949181+00'),
	('admin', 'badge:view', 'View all badges', '2026-01-26 02:36:46.949181+00'),
	('admin', 'badge:grant', 'Grant badges manually', '2026-01-26 02:36:46.949181+00'),
	('admin', 'badge:revoke', 'Revoke badges', '2026-01-26 02:36:46.949181+00'),
	('admin', 'user:view', 'View user details', '2026-01-26 02:36:46.949181+00'),
	('admin', 'user:ban', 'Ban/unban users', '2026-01-26 02:36:46.949181+00'),
	('admin', 'post:moderate', 'Moderate social feed posts', '2026-01-26 02:36:46.949181+00'),
	('admin', 'audit:view', 'View audit logs', '2026-01-26 02:36:46.949181+00'),
	('kyc_reviewer', 'kyc:view', 'View KYC submissions', '2026-01-26 02:36:46.949181+00'),
	('kyc_reviewer', 'kyc:review', 'Approve/reject KYC', '2026-01-26 02:36:46.949181+00'),
	('kyc_reviewer', 'scan:view', 'View smart contract scans', '2026-01-26 02:36:46.949181+00'),
	('kyc_reviewer', 'audit:view', 'View audit logs', '2026-01-26 02:36:46.949181+00'),
	('moderator', 'post:view', 'View all posts', '2026-01-26 02:36:46.949181+00'),
	('moderator', 'post:moderate', 'Moderate social feed posts', '2026-01-26 02:36:46.949181+00'),
	('moderator', 'post:delete', 'Delete posts', '2026-01-26 02:36:46.949181+00'),
	('moderator', 'user:view', 'View user details', '2026-01-26 02:36:46.949181+00'),
	('moderator', 'user:ban', 'Ban/unban users', '2026-01-26 02:36:46.949181+00'),
	('moderator', 'audit:view', 'View audit logs', '2026-01-26 02:36:46.949181+00'),
	('finance', 'round:view', 'View all rounds', '2026-01-26 02:36:46.949181+00'),
	('finance', 'round:finalize', 'Finalize rounds', '2026-01-26 02:36:46.949181+00'),
	('finance', 'payout:view', 'View payout requests', '2026-01-26 02:36:46.949181+00'),
	('finance', 'payout:approve', 'Approve payouts', '2026-01-26 02:36:46.949181+00'),
	('finance', 'treasury:view', 'View treasury balances', '2026-01-26 02:36:46.949181+00'),
	('finance', 'ledger:view', 'View complete ledger', '2026-01-26 02:36:46.949181+00'),
	('finance', 'fee:view', 'View fee rules', '2026-01-26 02:36:46.949181+00'),
	('finance', 'audit:view', 'View audit logs', '2026-01-26 02:36:46.949181+00'),
	('reviewer', 'kyc:view', 'View KYC submissions', '2026-01-26 02:36:46.949181+00'),
	('reviewer', 'kyc:review', 'Approve/reject KYC', '2026-01-26 02:36:46.949181+00'),
	('reviewer', 'scan:view', 'View smart contract scans', '2026-01-26 02:36:46.949181+00'),
	('reviewer', 'scan:review', 'Approve/reject/override SC scans', '2026-01-26 02:36:46.949181+00'),
	('reviewer', 'project:view', 'View all projects', '2026-01-26 02:36:46.949181+00'),
	('reviewer', 'project:approve', 'Approve projects for listing', '2026-01-26 02:36:46.949181+00'),
	('reviewer', 'project:reject', 'Reject projects', '2026-01-26 02:36:46.949181+00'),
	('reviewer', 'audit:view', 'View audit logs', '2026-01-26 02:36:46.949181+00'),
	('ops', 'project:view', 'View all projects', '2026-01-26 02:36:46.949181+00'),
	('ops', 'project:pause', 'Pause active projects', '2026-01-26 02:36:46.949181+00'),
	('ops', 'project:cancel', 'Cancel projects', '2026-01-26 02:36:46.949181+00'),
	('ops', 'round:view', 'View all rounds', '2026-01-26 02:36:46.949181+00'),
	('ops', 'round:pause', 'Pause active rounds', '2026-01-26 02:36:46.949181+00'),
	('ops', 'user:view', 'View user details', '2026-01-26 02:36:46.949181+00'),
	('ops', 'audit:view', 'View audit logs', '2026-01-26 02:36:46.949181+00'),
	('support', 'user:view', 'View user profiles', '2026-01-26 02:36:46.949181+00'),
	('support', 'user:ban', 'Ban/unban users', '2026-01-26 02:36:46.949181+00'),
	('support', 'bluecheck:view', 'View Blue Check requests', '2026-01-26 02:36:46.949181+00'),
	('support', 'bluecheck:revoke', 'Revoke Blue Check', '2026-01-26 02:36:46.949181+00'),
	('support', 'post:moderate', 'Moderate social feed posts', '2026-01-26 02:36:46.949181+00'),
	('support', 'audit:view', 'View audit logs', '2026-01-26 02:36:46.949181+00');


--
-- Data for Name: admin_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."admin_roles" ("id", "user_id", "role", "granted_by", "granted_at", "created_at") VALUES
	('a705578c-86fd-4d52-a5ee-1cd636f08129', '662d0695-3725-45c4-9802-7c1d16adb42a', 'super_admin', '662d0695-3725-45c4-9802-7c1d16adb42a', '2026-01-26 03:57:33.710848+00', '2026-01-26 03:57:33.710848+00');


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."projects" ("id", "owner_user_id", "name", "symbol", "description", "logo_url", "banner_url", "website", "twitter", "telegram", "status", "chains_supported", "created_at", "updated_at", "kyc_status", "sc_scan_status", "rejection_reason", "submitted_at", "approved_at", "metadata", "contract_mode", "contract_network", "contract_address", "factory_address", "template_version", "implementation_hash", "sc_scan_last_run_id", "chain", "chain_id", "creator_id", "creator_wallet", "token_address", "type", "discord", "deployment_tx_hash", "verification_status", "token_verification_status", "token_verified_at", "token_verification_attempts", "last_token_verification_error") VALUES
	('328c1036-8377-490d-af21-6644f45d5cfe', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23', 'SPOTIFY', 'SPOT', 'token test untuk uji coba status FINALIZE', 'https://tkmlclijfinaqtphojkb.supabase.co/storage/v1/object/public/fairlaunch-assets/a0f64677-e16a-4880-bfaa-d4e4d8211d23/logo_1770184684241.png', NULL, 'https://www.spot.com', 'https://x.com/spot', 'https://t.me/spot', 'APPROVED', '{}', '2026-02-04 06:01:14.844584+00', '2026-02-04 06:07:17.769454+00', 'NONE', 'IDLE', NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 97, NULL, '0xAe6655E1c047a5860Edd643897D313edAA2b9f41', '0xC0039278B7d27d99F92F8F7Fa132b2c0E5ae3895', 'FAIRLAUNCH', 'https://discord.gg/spot', NULL, 'UNVERIFIED', NULL, NULL, NULL, NULL),
	('f1ef72e4-0955-4c8a-9d5b-be19b5a99db6', 'd18dfb9d-233c-4320-b3b8-90b01b327cde', 'ETH', 'ETH', 'cek verification', 'https://tkmlclijfinaqtphojkb.supabase.co/storage/v1/object/public/fairlaunch-assets/d18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770056575210.png', NULL, 'https://www.eth.com', 'https://x.com/eth', 'https://t.me/eth', 'APPROVED', '{}', '2026-02-02 18:24:52.242911+00', '2026-02-02 18:25:57.054204+00', 'NONE', 'IDLE', NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 97, NULL, '0xaC89Bf746dAf1c782Ed87e81a89fe8885CF979F5', '0x70bfEAF0351F1a31AC88dee1D20f32DB26cb8f61', 'FAIRLAUNCH', 'https://discord.gg/eth', NULL, 'UNVERIFIED', NULL, NULL, NULL, NULL),
	('88bdbe1a-be98-46e4-aa67-4ab34e7a9138', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23', 'LAMPUNG TOKEN', 'LAMP', 'lampung adalah sumatra', 'https://tkmlclijfinaqtphojkb.supabase.co/storage/v1/object/public/fairlaunch-assets/a0f64677-e16a-4880-bfaa-d4e4d8211d23/logo_1770078604181.png', NULL, 'https://www.lamp.com', 'https://x.com/lamp', 'https://t.me/lamp', 'APPROVED', '{}', '2026-02-03 00:32:53.938111+00', '2026-02-03 00:34:16.008165+00', 'NONE', 'IDLE', NULL, NULL, NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 97, NULL, '0xAe6655E1c047a5860Edd643897D313edAA2b9f41', '0xD1075a79C7D89c22dF6A6b79D3bA40C8976BD5AE', 'FAIRLAUNCH', 'https://discord.gg/lamp', NULL, 'UNVERIFIED', NULL, NULL, NULL, NULL);


--
-- Data for Name: ama_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ama_join_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ama_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ama_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."wallets" ("id", "user_id", "chain", "address", "is_primary", "verified_at", "created_at", "updated_at", "wallet_role") VALUES
	('d65044f7-ec8e-40dc-94a9-04ee71f3b39b', '2334ce92-96f8-4f6b-99a4-d00bc98a8c5a', 'EVM_1', '0x5a9594e15177cfe1d7abace8f5845be7ae0ae5ec', true, NULL, '2026-01-16 06:05:12.351002+00', '2026-01-21 21:14:13.151715+00', 'PRIMARY'),
	('4e989c40-6906-49d4-8d64-be4f6ca62266', '16444ec3-6454-4c37-ba3e-f3fed604f530', 'EVM_1', '0xdc2deb87f2afbdffcd141bf7d1ba730119af7454', true, NULL, '2026-01-17 03:06:54.968039+00', '2026-01-21 21:14:13.151715+00', 'PRIMARY'),
	('18383e76-5dc4-41e1-8067-a98b9ace1622', '8cd3dbdf-25dd-4283-a6ec-55f84fa87204', 'EVM_1', '0xc24e3e9805a5c1609e4fad60a0cb11a5812a02cc', true, NULL, '2026-01-17 03:35:20.200224+00', '2026-01-21 21:14:13.151715+00', 'PRIMARY'),
	('0b856508-24b2-4973-b885-544d3b4463c3', 'ad9b8a47-6082-46cc-8cc8-b80da8de7985', 'EVM_1', '0x8029452bd9a9bfad44bfcd30b1887abf3853f6c9', true, NULL, '2026-01-19 09:57:19.57795+00', '2026-01-21 21:14:13.151715+00', 'PRIMARY'),
	('0ce2e360-c187-403c-9ae0-fbaa86f8d475', 'b9991b35-9356-4fc6-a047-10450ed6a873', 'EVM_1', '0x592907cfcbbd4eb2e61ee54e283950ceb3fe48ee', true, NULL, '2026-01-19 09:58:18.409227+00', '2026-01-21 21:14:13.151715+00', 'PRIMARY'),
	('8843750a-9030-404b-bbfc-14c429dbde98', '8c1dd323-de22-48e2-9cab-9b71781c6f77', 'EVM_1', '0xdb6bc03b21888dfad41fda888ccac2c803fe283f', true, NULL, '2026-01-21 09:25:55.503462+00', '2026-01-21 21:14:13.151715+00', 'PRIMARY'),
	('82a35c31-eb72-4516-921e-80376ccf19de', 'ea044662-4135-48a6-a84d-c6d507bb052e', 'SOLANA', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', true, NULL, '2026-01-15 16:03:53.959282+00', '2026-01-21 21:14:13.151715+00', 'SECONDARY'),
	('362484f5-e33f-4e87-9cee-fa419a05d9d6', '12b5434b-c4b5-4364-9f43-0d1074c35e92', 'SOLANA', '6NNgEwzwaUxR28VYopWGp3URCt9baRpQUy2MWCScX8Pq', true, NULL, '2026-01-17 03:37:01.775269+00', '2026-01-21 21:14:13.151715+00', 'SECONDARY'),
	('6b989e14-36c8-410d-a822-b8b94253cbd6', '272b017a-7e6a-4f3b-9f26-22cb6578a3fc', 'SOLANA', 'CB7p3dedWymfuqc3iA5jEzmBGM8KZvfLLZD9pXFsQPMK', true, NULL, '2026-01-19 09:47:31.83301+00', '2026-01-21 21:14:13.151715+00', 'SECONDARY'),
	('16bcd94a-ff72-4d7f-8ca7-55ec0d9e76a7', 'ba2226fb-d798-4d83-9ddb-fc67fdf6bb00', 'SOLANA', 'E6G74xqDPqxtDvneP1oGsq8XgXXek7bN3CC26mWDAwXu', true, NULL, '2026-01-19 12:33:57.81805+00', '2026-01-21 21:14:13.151715+00', 'SECONDARY'),
	('c872e568-ad9d-4c9d-8b68-502f7f26ee55', '7d9ba0b1-e0e3-419b-9290-724c7f9f6e00', 'SOLANA', '9TuV7aoeDM8hzJcHDBsDSBPPtkqVcbFqeutTS7Z3mDLy', true, NULL, '2026-01-21 10:19:19.972598+00', '2026-01-21 21:14:13.151715+00', 'SECONDARY'),
	('88b29fba-02ce-4dbe-86ad-09da79d9dd3e', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 'SOLANA', '9tuv7aoedm8hzjchdbsdsbpptkqvcbfqeutts7z3mdly', false, '2026-01-21 22:07:06.777+00', '2026-01-21 22:07:06.858743+00', '2026-01-21 22:13:19.549463+00', 'SECONDARY'),
	('f11e1821-4725-4b8d-869d-d76e0a0023e7', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 'EVM_1', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', true, NULL, '2026-01-15 16:03:38.188848+00', '2026-01-21 22:13:19.751883+00', 'PRIMARY'),
	('79731367-a567-4427-b65c-1696cd1d2515', '662d0695-3725-45c4-9802-7c1d16adb42a', 'EVM_1', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', true, NULL, '2026-01-26 03:04:30.741506+00', '2026-01-26 03:04:30.741506+00', 'PRIMARY'),
	('7bcd640c-e337-4c44-af86-079b9a808c6f', '0487f51f-f7ee-4fe8-9eb0-f58312676387', 'EVM_1', '0xd7e7f32d89ddb422c277dfe25f215cc1d733e915', true, NULL, '2026-01-26 20:53:56.835223+00', '2026-01-26 20:53:56.835223+00', 'PRIMARY'),
	('e11e2c2a-527f-4cf2-aeb9-0c06392c0197', '5a5b6f7b-95ec-4d6e-a9e3-943aaa0c43ef', 'EVM_1', '0xe677cb29436f0be225b174d5434fb8a04231069e', true, NULL, '2026-01-28 21:20:47.576464+00', '2026-01-28 21:20:47.576464+00', 'PRIMARY'),
	('69b98a7e-fa19-4685-a52f-b114e51870da', '4adc158a-badd-429a-86ea-c0b0d62f0d62', 'EVM_1', '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', true, NULL, '2026-01-28 21:50:40.262448+00', '2026-01-28 21:50:40.262448+00', 'PRIMARY'),
	('07e7e9a4-71e8-48f2-bac6-bc6aa90d295e', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', 'EVM_1', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', true, NULL, '2026-01-29 04:03:14.185048+00', '2026-01-29 04:03:14.185048+00', 'PRIMARY'),
	('c87a676c-15e6-4f54-846e-6317165d2fba', 'e40815c0-69a4-4c65-a80b-c5f5f57711ab', 'EVM_1', '0x92b56c988fce8c785b233870706b1d1b57857577', true, NULL, '2026-01-31 03:44:03.243337+00', '2026-01-31 03:44:03.243337+00', 'PRIMARY'),
	('07cb4a72-c872-4538-876a-183090ec0899', '7cd0a25a-cd2c-4b7e-be3e-29a5947b1af1', 'EVM_1', '0x4e5a3ef17a67c7a7260cf2a01c9bd251be9653ff', true, NULL, '2026-01-31 05:46:44.438374+00', '2026-01-31 05:46:44.438374+00', 'PRIMARY'),
	('b64f5c2f-c4fe-4bf3-9464-8a575de1cce9', 'd18dfb9d-233c-4320-b3b8-90b01b327cde', 'EVM_1', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', true, NULL, '2026-01-31 22:18:46.782948+00', '2026-01-31 22:18:46.782948+00', 'PRIMARY'),
	('23e89ea3-a1c1-45ff-8cb0-d61575335ae7', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', 'EVM_1', '0x92222c5248fb6c78c3111aa1076c1ef41f44e394', true, NULL, '2026-02-01 20:22:58.901718+00', '2026-02-01 20:22:58.901718+00', 'PRIMARY'),
	('90c8d770-f5e3-4ac8-abf5-90bcd1be70c9', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23', 'EVM_1', '0xae6655e1c047a5860edd643897d313edaa2b9f41', true, NULL, '2026-02-03 00:28:56.808851+00', '2026-02-03 00:28:56.808851+00', 'PRIMARY'),
	('4118e704-5df5-4791-823e-9e50deff4058', 'e27b5f47-fdd8-40f9-82b9-a3fe1fc3154e', 'EVM_1', '0x25b21c43112f196cd33b467279d737ef5733b175', true, NULL, '2026-02-03 19:40:21.177819+00', '2026-02-03 19:40:21.177819+00', 'PRIMARY'),
	('95012cce-f7b1-4e12-a097-82fce370587d', 'b7d2baf5-a847-4855-8fb8-88b7cdaf2e27', 'EVM_1', '0xfd761f29d6c3dfc36fe21f5dc3ff5e14f08ebcb4', true, NULL, '2026-02-03 19:49:00.108704+00', '2026-02-03 19:49:00.108704+00', 'PRIMARY'),
	('b9f2e3d9-f22b-4427-a725-39fa4b658917', '36b48400-3e06-45e4-b76f-3029c0ffd26f', 'EVM_1', '0xf2b44e1d609f662efd8c8765a2d8fd56bbe1ab95', true, NULL, '2026-02-03 19:59:02.925374+00', '2026-02-03 19:59:02.925374+00', 'PRIMARY'),
	('e128fbcb-6f19-45b9-b34b-c457092e1789', 'd1965e29-d5d8-401c-8008-a4f772d9556e', 'EVM_1', '0x5058c7ee137626c1e7e0fdfcbba998a2f84ba400', true, NULL, '2026-02-03 23:09:38.186571+00', '2026-02-03 23:09:38.186571+00', 'PRIMARY'),
	('c921013a-35a5-403d-8073-bd197a44c865', '9639ffd8-3766-4fef-ba83-c98f21f47799', 'EVM_1', '0x9a0d7dc7a0348c1b0b2d04c25ab6398bd5819551', true, NULL, '2026-02-03 23:20:45.479008+00', '2026-02-03 23:20:45.479008+00', 'PRIMARY'),
	('5836b4a4-dd4e-4d8f-96ad-99312828100b', '0767dad1-ec0c-43ec-b933-5535c76b265e', 'EVM_1', '0x1295f65b7c6aef8f708cc700b129788e26a039e2', true, NULL, '2026-02-03 23:31:21.192384+00', '2026-02-03 23:31:21.192384+00', 'PRIMARY');


--
-- Data for Name: auth_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."auth_sessions" ("id", "wallet_address", "chain", "session_token", "nonce", "expires_at", "created_at", "last_used_at", "user_agent", "ip_address", "wallet_id") VALUES
	('bd8a2ba0-a53b-4949-aca6-be82838fe451', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '50d55a1993f1175d0877c5dd855573e42f8e71bd2496f6de829ce3e8ccadba33', NULL, '2026-02-20 21:33:04.204', '2026-01-21 21:33:04.673713', '2026-01-21 21:33:04.673713', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('584ff87e-8375-4f9e-97f8-9b4a2d0bd5d5', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '2ad65502cbb8edfba6aee4a97839bb0b8a6558dadd7c0915b357677242eb67a4', NULL, '2026-02-20 21:33:05.63', '2026-01-21 21:33:06.065367', '2026-01-21 21:33:06.065367', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('c4fd3e61-2c94-4a5a-b4f4-b77ca7f8be50', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '3e0f344ea353c50772dd3bb4095f13403d927d5340dc6ce71662e3d8f1769f09', NULL, '2026-02-20 21:33:13.631', '2026-01-21 21:33:14.159659', '2026-01-21 21:33:14.159659', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('16f2d086-8c9d-4a98-8168-1d2f9df527c7', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'a2abb4935d26d327dd458412ead2901b478cb41c25ece14749bbbf614cb4519e', NULL, '2026-02-20 21:33:14.949', '2026-01-21 21:33:15.306267', '2026-01-21 21:33:15.306267', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('3a9bae57-4f33-4a23-be84-76284c030c1b', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '0fc1e323f7bb1fb01d6452296d196e3cd0f5bdc07b66669a249c0d28def4861a', NULL, '2026-02-20 21:38:21.992', '2026-01-21 21:38:22.367729', '2026-01-21 21:38:22.943', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('df163ae3-4f12-4903-9b61-523b90449f15', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '5755b79c58000236b56df5f7e0cbe6701f71e941be68619d89489d162be137ba', NULL, '2026-02-20 21:38:29.873', '2026-01-21 21:38:31.201054', '2026-01-21 21:38:31.201054', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('efbac3e2-de92-4647-9693-3129faacf9b4', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'ed52929221949ea789d9a1894a803d998cb30be7e66fbf400922d0fcf880965d', NULL, '2026-02-20 21:41:11.797', '2026-01-21 21:41:12.185291', '2026-01-21 21:41:12.599', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('cccf9b5b-65ac-4c7c-a71f-f5298fbbe7ca', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '3416ac9286d2d00852e20c3019201d5fe4a23d2fdef98f44053b0b208f6aa802', NULL, '2026-02-26 00:55:33.574', '2026-01-27 00:55:33.902752', '2026-01-27 00:55:33.902752', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('1b867a2c-6d4a-47b2-bdb7-35bc26e5e0b9', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '231075558df62fd4a9f1a02d3249940a0d117d1f97ccff04052fe89dd318d5a7', NULL, '2026-02-26 01:43:28.094', '2026-01-27 01:43:28.467318', '2026-01-27 01:43:28.467318', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('03b1c336-d521-4e34-9c0e-5db347c69314', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '09f33b9090410ea084dff2e00dc2fbb3772b88849191fd5c2bd2c18fc83dcc37', NULL, '2026-02-20 21:41:12.376', '2026-01-21 21:41:12.78734', '2026-01-21 21:41:16.371', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('b58671b2-96b2-4c87-bc81-f13f008c2b09', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', '6d6229aa1af9e4512f574a47e0bf26857f3bdfbf73ed90279456a715d0c155d8', NULL, '2026-02-25 03:05:48.044', '2026-01-26 03:05:48.353676', '2026-01-26 03:05:48.353676', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('572e9bee-63b5-4d7c-be15-47b8ebbe31c5', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', 'bc3ac2fc7fe394b2259f075cd81c02e8ad262c4e84d6c5b7d1a337efb1a6d8b7', NULL, '2026-02-25 19:43:50.804', '2026-01-26 19:43:51.316065', '2026-01-26 19:43:51.316065', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('c51d6ee0-c007-4acb-85d1-ecb60661de8c', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', '72ea87cf85c7153888dd44bcd2c142c2ea4ae17c02231c4e5e33940429048dfe', NULL, '2026-02-25 19:58:58.905', '2026-01-26 19:58:59.421338', '2026-01-26 19:58:59.421338', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('8fb79a1e-d87f-4c34-a090-d05affcd75b1', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', '2fa67741de9669a5962df30885965cf5fb119b1ee3cf384760ae6dba0007819b', NULL, '2026-02-25 20:10:25.666', '2026-01-26 20:10:26.030242', '2026-01-26 20:10:26.030242', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('52497401-4de4-4a6a-b635-d0e76e6f6cfc', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', 'bd63dcbf0b24e626c0831246f647413466dc48da1e8f619b56ef71623a0ba447', NULL, '2026-02-25 20:17:56.163', '2026-01-26 20:17:56.501575', '2026-01-26 20:17:56.501575', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('acc7f9b1-e4d7-4605-b937-c536d8819090', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '55081afd1146ff2c5d6b4e1200b546789adf0c5be8cec361ca1a46faa8e0df9a', NULL, '2026-02-25 20:20:59.96', '2026-01-26 20:21:00.274403', '2026-01-26 20:21:00.274403', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('0c169d9a-c8ee-4a1d-8556-84ebd832f4c7', '0xd7e7f32d89ddb422c277dfe25f215cc1d733e915', 'EVM_1', 'd7ca7aca10d26c2fa7cc16f77f07e1d829ee286c43fd3c7200c3170ceda16fbe', NULL, '2026-02-25 21:00:56.447', '2026-01-26 21:00:56.74421', '2026-01-26 21:00:56.74421', NULL, NULL, '7bcd640c-e337-4c44-af86-079b9a808c6f'),
	('991c1aa0-54b1-429a-99b0-4d662c5f646a', '0xd7e7f32d89ddb422c277dfe25f215cc1d733e915', 'EVM_1', '21dd9dd0eecf11da029e11ca9f0c1d0090bd93fccf4054037a0f51c394a01fdc', NULL, '2026-02-25 21:06:51.163', '2026-01-26 21:06:51.510848', '2026-01-26 21:06:51.510848', NULL, NULL, '7bcd640c-e337-4c44-af86-079b9a808c6f'),
	('87970876-99e9-4443-aaa6-be1b4b1d0b98', '0xd7e7f32d89ddb422c277dfe25f215cc1d733e915', 'EVM_1', '5be43c050f6c1fabecdfe9d2eb087591dad072ff57a5ce2fb52ab069c239335f', NULL, '2026-02-25 21:07:03.306', '2026-01-26 21:07:03.633258', '2026-01-26 21:07:03.633258', NULL, NULL, '7bcd640c-e337-4c44-af86-079b9a808c6f'),
	('d22608c9-58b3-4540-a88f-9b1b066948e0', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'b6148a35bef144792a632b398e35d99bee1b29904fc4c07837903c1be8bc3d64', NULL, '2026-02-25 22:46:30.372', '2026-01-26 22:46:30.919198', '2026-01-26 22:46:30.919198', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('e8e0c6d2-5985-4b5d-bbaa-b3c00a98eea7', '0xdb6bc03b21888dfad41fda888ccac2c803fe283f', 'EVM_1', 'e6ad12f18a84b912eade8bed4fa555c9439a41cfc1a09787e884b2d344a7a1f6', NULL, '2026-02-20 09:25:55.571', '2026-01-21 09:25:55.905069', '2026-01-21 10:18:46.963', NULL, NULL, '8843750a-9030-404b-bbfc-14c429dbde98'),
	('9c4bb5b2-4915-4eb6-957e-c2ead77ea62a', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '0ef01c109b6fd0e51087f420254d69f1b9a73f99672e44bff6bd73f16cf99499', NULL, '2026-02-20 21:32:54.594', '2026-01-21 21:32:55.043056', '2026-01-21 21:32:55.043056', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('f6f687ad-22b1-4dc3-9c8a-62cc0049020d', '0xd7e7f32d89ddb422c277dfe25f215cc1d733e915', 'EVM_1', '5008ae901d7810795ee0cfc7dcd8f505f01a9e55c33a4b0f874f5b25fca0a3e2', NULL, '2026-02-26 00:53:46.314', '2026-01-27 00:53:46.775272', '2026-01-27 00:53:46.775272', NULL, NULL, '7bcd640c-e337-4c44-af86-079b9a808c6f'),
	('6d536c81-a219-4aff-9468-19ab8edf8262', '0xdb6bc03b21888dfad41fda888ccac2c803fe283f', 'EVM_1', '15d67008c6182184b351b41993d0c5913c2fe9a7a665eb4590fbdf96a7c1df2b', NULL, '2026-02-26 01:54:44.418', '2026-01-27 01:54:44.921709', '2026-01-27 01:54:44.921709', NULL, NULL, '8843750a-9030-404b-bbfc-14c429dbde98'),
	('c54f8b5e-5584-4dd1-b247-9ad8430d980b', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '5e7672b9bc33ad6359298de2847b2539befb93dbff73b21ad5f7a865ad0ef23c', NULL, '2026-02-26 21:29:10.219', '2026-01-27 21:29:10.565883', '2026-01-27 21:29:10.565883', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('bfca9908-906c-48dd-995a-6978a3bf015a', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '67c9731ebad1d7a54fe5ff3272d95dfecc0ca79fba72f12e6a22759f2340d542', NULL, '2026-02-26 21:29:45.725', '2026-01-27 21:29:46.046467', '2026-01-27 21:29:46.046467', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('8ee404b1-9072-445d-a998-70dc4dd33482', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '740cabed3fa9dde8c475aae9f7ab4b1eab58423f64a095221a851d907f00e710', NULL, '2026-02-26 21:46:36.58', '2026-01-27 21:46:37.030931', '2026-01-27 21:46:37.030931', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('afead1d6-73ed-49fa-88c5-767d78fb7ea3', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '8a0bc5c0eec5af5bc581e097410ae799e82ad77af7f218d70c556a847499a6c7', NULL, '2026-02-27 21:04:55.206', '2026-01-28 21:04:55.832162', '2026-01-28 21:04:55.832162', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('1496b922-3ec9-4149-a95c-68a134f704d2', '0xe677cb29436f0be225b174d5434fb8a04231069e', 'EVM_1', '3ba0c23b66c8c99dac198cd000ae0b65c278bc24ee4c1268f8ff36a1c4d8c836', NULL, '2026-02-27 21:20:47.653', '2026-01-28 21:20:47.97784', '2026-01-28 21:20:47.97784', NULL, NULL, 'e11e2c2a-527f-4cf2-aeb9-0c06392c0197'),
	('27e48ce4-42e4-4719-aae7-283233c6520f', '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 'EVM_1', '5f3fb4082ed95461d776ad4643426ee0a951d2f00c87a89ec66825a9ffef40ad', NULL, '2026-02-27 21:50:40.386', '2026-01-28 21:50:40.760998', '2026-01-28 21:50:40.760998', NULL, NULL, '69b98a7e-fa19-4685-a52f-b114e51870da'),
	('2657808c-255c-4cfa-b3ee-babc5403571e', '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 'EVM_1', 'f50d1d24ef6c360dbac2296f9391d034565555dfc4eae111ffe537844baa6f39', NULL, '2026-02-28 01:43:11.545', '2026-01-29 01:43:12.009283', '2026-01-29 01:43:12.009283', NULL, NULL, '69b98a7e-fa19-4685-a52f-b114e51870da'),
	('4075cffe-0f92-4572-a913-5fd271057bfa', '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 'EVM_1', 'fc84676fe54d11570f7c3caf6eac43ab3b8768621009decd98d9a99e40ee09c1', NULL, '2026-02-28 02:04:30.018', '2026-01-29 02:04:30.619702', '2026-01-29 02:04:30.619702', NULL, NULL, '69b98a7e-fa19-4685-a52f-b114e51870da'),
	('fd63ef12-cb82-44b4-b0a8-57cf59051f93', '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 'EVM_1', '147bc47657cd34edacbecb4ee002b721dc96b25db92a501a9f96e8d1f9f4598a', NULL, '2026-02-28 03:52:54.693', '2026-01-29 03:52:55.447281', '2026-01-29 03:52:55.447281', NULL, NULL, '69b98a7e-fa19-4685-a52f-b114e51870da'),
	('610107f0-6d1d-4321-a6ae-b1b2f48c6b29', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', '37bde6921ac646a4d8bbde149339ed12ed520cdad781d7d32e8d8f2cc2353666', NULL, '2026-02-28 04:03:14.289', '2026-01-29 04:03:14.635273', '2026-01-29 04:03:14.635273', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('d0777ec0-4077-4c83-95da-7e671a40b167', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', '304249f8e24280f67ba383ec21cad977cfb9cc919bb65298f7cbb2ea2c682a15', NULL, '2026-02-28 04:29:17.085', '2026-01-29 04:29:17.681684', '2026-01-29 04:29:17.681684', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('16297afe-6c94-4d4a-a048-a3c3ecb5ac9c', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', 'e1df91de842a7b58ab5a11736d20d39afc98089ff4cf68a71cf659a1810da8d3', NULL, '2026-02-28 11:05:45.298', '2026-01-29 11:05:45.902405', '2026-01-29 11:05:45.902405', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('95573387-574a-4b43-97dc-07b03ef459bc', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', '03dcb6ffff37ab6e330a065d8d52c52637217ae06643e8e3ed59fb1562370522', NULL, '2026-02-28 11:28:26.944', '2026-01-29 11:28:27.594486', '2026-01-29 11:28:27.594486', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('4a194164-6105-4795-bd44-76c45aac8fe4', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'e582f6b0871841cd7be5288578b8e34dec26b5f7bcd3902b4cb9e271b7a89d2b', NULL, '2026-02-14 16:03:38.278', '2026-01-15 16:03:38.35333', '2026-01-15 16:03:38.35333', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('785232f7-bf6d-44be-ba4d-51b0eeb4da9e', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'd6bcfb07a8b07f2329672c397197eb2d08eaabbc2cf39eac765e57bcfd204873', NULL, '2026-02-20 21:38:28.903', '2026-01-21 21:38:31.21927', '2026-01-21 21:38:31.652', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('8a0fac2c-0b4f-4213-8f78-5966f7811d6e', '9TuV7aoeDM8hzJcHDBsDSBPPtkqVcbFqeutTS7Z3mDLy', 'SOLANA', '0d8ac071a695a2e7c4f94d8bb6f3a6d2a75cb2b9f78d10148cc62e79954d8149', NULL, '2026-02-20 10:19:20.032', '2026-01-21 10:19:20.384582', '2026-01-21 10:19:21.063', NULL, NULL, 'c872e568-ad9d-4c9d-8b68-502f7f26ee55'),
	('c2903f32-a7e5-48db-b6a5-42fe06e62711', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '229fe44d90e34244471dc19359c85dd648a5585cfa3c4616724f5039bc6755bd', NULL, '2026-02-14 16:03:54.113', '2026-01-15 16:03:54.189006', '2026-01-15 16:03:54.189006', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('652f9db5-ba8f-422f-9cc0-f0e6a2da450f', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'e7a6fde82b907c9795a2b271ab6fa76ae13d729da5186a8906cfb243d1aaadf6', NULL, '2026-02-20 21:36:28.291', '2026-01-21 21:36:28.724585', '2026-01-21 21:37:54.718', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('9ad59ebf-2aa4-4b2e-bcee-ba27f3a07f41', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', 'e7b4cec96187a8fd445ea05811f2c2bd72e1a909653ff1404c5f1e032766aa70', NULL, '2026-02-14 16:04:00.034', '2026-01-15 16:04:00.09997', '2026-01-15 16:04:00.09997', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('d77ace63-488f-4f99-82a7-04d999b1ce2f', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '34855224f8e13568bfc1ba172af11196d161bb9a721af6ad52d9f16e92f2d962', NULL, '2026-02-14 16:04:00.724', '2026-01-15 16:04:00.790266', '2026-01-15 16:04:00.790266', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('10740a45-a19e-4d44-b765-9d7d761f09a7', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '564fafefad8d0c6e3dcf92355500d3ec5ca3c9a58b44a8461e9177da93efbb36', NULL, '2026-02-14 16:04:02.129', '2026-01-15 16:04:02.194275', '2026-01-15 16:04:02.194275', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('907331bc-5307-4be7-bdda-a82e47157d59', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '5f46054d4aeb8c7e39735b9eef55f4dbb35cfd32d663262f4ff4db87142be9bb', NULL, '2026-02-14 16:04:03.982', '2026-01-15 16:04:04.050508', '2026-01-15 16:04:04.050508', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('95edbf4f-94de-4a64-8aad-e0840f4e0f0b', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '363732e48247bc96a72f001877302a23371b6e8f9c21a888382ffb94a3fb5243', NULL, '2026-02-14 16:04:12.895', '2026-01-15 16:04:12.976815', '2026-01-15 16:04:12.976815', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('045c8cc6-3cfc-49b9-8ed4-5a8b2a375904', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '787f505ac22767e33cf15e1de82d6b0cc89b83e39b130b22432e7ca063671a66', NULL, '2026-02-14 16:04:14.849', '2026-01-15 16:04:14.927364', '2026-01-15 16:04:14.927364', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('bdee9ece-7b3c-4a93-aeb7-63dcf777e019', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '80502b824ae0ffb290f7e8d13f82de95e4aa36295feb403e645ac3c0aaff06f9', NULL, '2026-02-14 16:04:16.523', '2026-01-15 16:04:16.608625', '2026-01-15 16:04:16.608625', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('014a162e-a967-4b97-9f8b-39645d7806df', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'a05c6ca358b9b9e8656a815be3d5afe32a1b82f401470189e3c3b2e82a6c5b3d', NULL, '2026-02-14 16:04:18.323', '2026-01-15 16:04:18.39053', '2026-01-15 16:04:18.39053', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('fd713132-f2dd-4c45-99f3-5fcd117d1316', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '57dd177a2c4c8295c0ebf98432138218e9efb87118a3577c757057e0d3871360', NULL, '2026-02-14 16:04:45.285', '2026-01-15 16:04:45.343339', '2026-01-15 16:04:45.343339', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('8a73bbba-c3a1-4323-b434-7ce5527fe7f4', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '1ebcc7c735f84c678f239050e6b88ced8f4fce673d0b1e34ddff482b9ec0203f', NULL, '2026-02-14 16:04:46.368', '2026-01-15 16:04:46.432187', '2026-01-15 16:04:46.432187', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('0aed7520-378f-4ecd-8e70-fc80dd82eca4', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', 'b90f1215230da0c7bb40000ba660f92583da989f977d5f9860fbedc1d04c5fc0', NULL, '2026-02-14 16:04:48.077', '2026-01-15 16:04:48.139924', '2026-01-15 16:04:48.139924', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('74a160b1-5857-479b-bf35-5c5addabd5c0', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '30952dc4c51e500e2d59806d57bd95242ce67b92cdd372ff0fe91792f471f239', NULL, '2026-02-14 16:04:50.663', '2026-01-15 16:04:50.727109', '2026-01-15 16:04:50.727109', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('0eb60b1a-e3b3-45a9-aac7-cc190100e46d', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '45325ae3d1f55b1922b9496730b97deae8bc98907703efb2c3ae32666f445a76', NULL, '2026-02-20 21:41:18.217', '2026-01-21 21:41:18.58598', '2026-01-21 21:41:18.925', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('67d11392-2573-43fb-bf6f-15b4099d6e9d', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '4ac9249bd77553dc5bbdca95296c14442864f8d062637e322e9c16d935260040', NULL, '2026-02-14 16:05:09.186', '2026-01-15 16:05:09.259122', '2026-01-15 16:05:09.259122', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('18e18ee0-2e74-4867-a591-51c3df0f0554', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '634b2a207a1ae19417b55a886c5012d70d71f64ccc4228a063afe9286d2b1b9f', NULL, '2026-02-14 16:05:11.282', '2026-01-15 16:05:11.352002', '2026-01-15 16:05:11.352002', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('97d95f5f-487b-4cb0-90f7-a8fdae8b1400', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '7ef9908e914214adb9b30bf6d62ebdceb6bb337443ab5286343cef619f32a405', NULL, '2026-02-14 16:05:11.997', '2026-01-15 16:05:12.061513', '2026-01-15 16:05:12.061513', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('9cc42640-a89f-46b4-b650-13d243dfdb8e', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'ab99538196d95124631236f4bd011bea7f4d343ae81278b970803c776acbc5da', NULL, '2026-02-14 16:05:13.463', '2026-01-15 16:05:13.558485', '2026-01-15 16:05:13.558485', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('1ffa5526-6407-476d-82ff-60371223ce52', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '52f2272a24452c1232740ec88f283bbc44f56b55483dde7973521b175d8e5b4c', NULL, '2026-02-20 21:41:18.954', '2026-01-21 21:41:19.27005', '2026-01-21 21:41:21.452', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('546df740-a999-4444-8dcb-08aaafc92b12', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', 'b25022d19049e40695bed91df90903f435bf1630ac0791e3ac6fdcf0795e0411', NULL, '2026-02-14 16:05:40.969', '2026-01-15 16:05:41.049423', '2026-01-15 16:05:41.049423', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('329beef8-4630-4b83-afdb-3726586152ac', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '8b1ef2ebcd0810620c88cfce031c6ac5091b5420fb0090120d0f93d099af1b24', NULL, '2026-02-14 16:05:43.146', '2026-01-15 16:05:43.209146', '2026-01-15 16:05:43.209146', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('8e8d462b-5187-4e0f-b7bf-d6aaaef85e61', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '480283c9c350c8ad76f3b88f2c4ada5835899c0c21f2e9bef28ebe64804f91a6', NULL, '2026-02-14 16:05:43.658', '2026-01-15 16:05:43.716517', '2026-01-15 16:05:43.716517', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('486f9650-f611-44e7-ab76-d8b6828b696c', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '56b623e6deee3460cf448e68e7ee28e9f3a66cb68f16348e8c833e672e315cf6', NULL, '2026-02-14 16:05:44.532', '2026-01-15 16:05:44.589645', '2026-01-15 16:05:44.589645', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('3238c763-8e40-4393-a957-73afa896ffa7', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', 'eb6dfbd76170a9d2c6071060fc3d2fdf67a784a9835afa363c7888d424f1ed33', NULL, '2026-02-14 16:05:50.636', '2026-01-15 16:05:50.6996', '2026-01-15 16:05:50.6996', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('651ca7cd-0628-4f38-b528-764e15e7ffa2', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', 'd4af23d647d7bb9cea8b2ae7c74b3d515c119089611cb3e60baae6d0c337ea26', NULL, '2026-02-25 19:40:50.439', '2026-01-26 19:40:50.720933', '2026-01-26 19:40:50.720933', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('f6455cc7-5259-4a9f-af8d-22a68e476043', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '1b0c6737eee417366e5a2f256395c50265482e221ba59aab51346f70a937a1be', NULL, '2026-02-14 16:05:52.465', '2026-01-15 16:05:52.525605', '2026-01-15 16:05:52.525605', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('8f2f0dd8-e127-4c7a-adb2-f388a23130c0', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', '204042ac4eb10137ff31db6151893d56291646008fffa3468dce2aea77f79c6a', NULL, '2026-02-25 19:45:20.456', '2026-01-26 19:45:20.745815', '2026-01-26 19:45:20.745815', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('97269d2a-7ed1-42cd-bcba-452217642e6c', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', '2ea38f681651292e2645ef755009bc62dbafa8c9fc19657da2838ef0d4d6c097', NULL, '2026-02-25 19:52:50.694', '2026-01-26 19:52:50.972476', '2026-01-26 19:52:50.972476', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('77f1c562-1b22-4b78-8dd8-cfdd91c19851', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '84949dc57b012489533d52fa1901f766ec5627ac30164fe2c671e4692892ca26', NULL, '2026-02-14 16:05:53.053', '2026-01-15 16:05:53.10978', '2026-01-15 16:05:53.10978', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('322e2bc7-46f2-4ad0-9fbe-af1906de127d', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '2fe2384ef1cf12337c689e28c7a6ce3fe5bbd0b0e62d46e4c479f9089154ba33', NULL, '2026-02-14 16:05:54.317', '2026-01-15 16:05:54.374255', '2026-01-15 16:05:54.374255', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('d5998501-bdb5-4ee7-bb05-e9b984bbbc4d', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'f82653188a5c580595d3b0c15ed7242f456594c31f01558be07d6a190e828ce6', NULL, '2026-02-14 16:06:14.905', '2026-01-15 16:06:14.985772', '2026-01-15 16:06:14.985772', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('d0fb88c4-4c7c-4987-90ff-3645694d873c', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '5f29ee52a26c49525e9a41cbf990b2c8e528eafdd819a33f1cae02ab42d96a36', NULL, '2026-02-14 16:06:16.26', '2026-01-15 16:06:16.324991', '2026-01-15 16:06:16.324991', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('382c4aa5-458a-47ca-8f8e-037bc418c226', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '9c9de4431fd853073260618e2a518bdfa5b9a03fb7083598deeacdf06e4ca2be', NULL, '2026-02-14 16:07:37.115', '2026-01-15 16:07:37.176394', '2026-01-15 16:07:37.619', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('944b5efa-19d0-476d-96b3-b0a6bdd871bf', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', 'ba8ebd8c07acd62e3ddd6f82b4bd1c845958afafb86807b4ec374a490dc444c2', NULL, '2026-02-14 16:14:02.596', '2026-01-15 16:14:02.69451', '2026-01-15 16:14:04.97', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('2aa116c5-2b38-48f3-a561-7531ea289b13', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', 'ada58097fd18436c3b8038b7a617c63af9659b5a46db2f69823c1e7022f851d5', NULL, '2026-02-14 16:07:41.684', '2026-01-15 16:07:41.750042', '2026-01-15 16:07:42.189', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('27194e22-596f-4ff6-ae54-76c3e45a6ad7', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '60a21d468428cadfc143877bbc367d8e6d86bb4f332c2cb6c3c8ceb703c67b51', NULL, '2026-02-14 16:07:43.626', '2026-01-15 16:07:43.726272', '2026-01-15 16:07:44.266', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('447bbcea-029c-4f60-a027-d33829d9e9e5', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '723fb90d940a2928b76f3b06f6fe89dc63ebf6ed2e10b0e1e8c04b8b499169ed', NULL, '2026-02-14 16:07:48.722', '2026-01-15 16:07:48.780108', '2026-01-15 16:07:49.227', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('920e2fcc-728c-4dbc-8685-08e1c2c31ba2', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '17ca290e853d77515058eeb66415e1e2f8adeef3b589de5bef56e0864fb92a15', NULL, '2026-02-14 16:07:50.839', '2026-01-15 16:07:50.900231', '2026-01-15 16:07:51.377', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('57d20b73-fe8e-4dfc-a6a9-c29b25170470', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '50f9a007dfffe140430a4c3345ce1072f7d1278317f74c39a1ade5f595106572', NULL, '2026-02-14 16:07:56.763', '2026-01-15 16:07:56.823844', '2026-01-15 16:07:57.243', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('455e609c-7dff-49cf-b066-bb6b96f5fb38', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '730654c0c895b6f904049cd4ea4986e34cbde8f2f6c2a685b2c4928bb7dc3c12', NULL, '2026-02-14 16:07:58.86', '2026-01-15 16:07:58.922245', '2026-01-15 16:09:22.382', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('0cf144c1-0d31-4e06-8d9c-4372dccbfc46', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '48979cd9a47f9333496cd2ad57eb4ab8a3adcdb39c19d48db80b2c4a8282d526', NULL, '2026-02-14 16:09:30.169', '2026-01-15 16:09:30.234039', '2026-01-15 16:09:31.278', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('f6b69894-66b0-4592-8a31-c8d2817b6ba7', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', '1504c8a2ee112a89bcebf75344f63edd032eaf8efae36a89c28223e6fb3d5cd9', NULL, '2026-02-14 16:09:31.641', '2026-01-15 16:09:31.694144', '2026-01-15 16:11:55.652', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('fda57e74-45b1-4c8a-998a-5ae707f3fa3f', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', 'a56badc835a95d2c1c1438e7649149a860be2985b2801171eba9598c609b9c86', NULL, '2026-02-14 16:12:14.535', '2026-01-15 16:12:14.621397', '2026-01-15 16:12:15.509', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('5ee7b932-3053-493d-9356-fcdf49f4d34b', 'GHSR2CagHRvB6n4PGchVEjmNeFUo8H8FdpiEZfeC1o2p', 'SOLANA', 'ef449dff1430c114ee4a6f18eac9c3ca088cff2b5a1680124e98538a1a41955f', NULL, '2026-02-14 16:12:14.738', '2026-01-15 16:12:14.805579', '2026-01-15 16:12:16.115', NULL, NULL, '82a35c31-eb72-4516-921e-80376ccf19de'),
	('24a35d60-941a-40da-9cce-d9c58514bed7', 'CB7p3dedWymfuqc3iA5jEzmBGM8KZvfLLZD9pXFsQPMK', 'SOLANA', '88dcd055a844cbb936e600cce6dcc4b2a1a93f36ffefb8f5bde51b9841773304', NULL, '2026-02-18 09:49:17.53', '2026-01-19 09:49:18.297033', '2026-01-19 09:49:18.494', NULL, NULL, '6b989e14-36c8-410d-a822-b8b94253cbd6'),
	('7428e5f5-1d09-401a-a521-983251cd377d', '6NNgEwzwaUxR28VYopWGp3URCt9baRpQUy2MWCScX8Pq', 'SOLANA', '51a7e8a1e87f2a3ef267e0cc9145fe4307c84862831d2f7bd0b7d8620a378e8f', NULL, '2026-02-16 03:37:02.041', '2026-01-17 03:37:02.180018', '2026-01-18 17:24:50.872', NULL, NULL, '362484f5-e33f-4e87-9cee-fa419a05d9d6'),
	('da9c6dae-ab1f-41ab-92ae-1d5cdf8f231c', 'CB7p3dedWymfuqc3iA5jEzmBGM8KZvfLLZD9pXFsQPMK', 'SOLANA', 'fef4ee1bb1eff8b3f0e61d89af8d8159e9a166c702c27f73d7e404156fe9d480', NULL, '2026-02-18 09:48:14.305', '2026-01-19 09:48:15.101507', '2026-01-19 09:48:16.641', NULL, NULL, '6b989e14-36c8-410d-a822-b8b94253cbd6'),
	('9b3ec27d-6c95-4e5d-bec9-2c16ec06f59f', '0xdc2deb87f2afbdffcd141bf7d1ba730119af7454', 'EVM_1', 'a5f51d7daecef7385e605f09c4476173492adabd209d02a0ff3e8b21af791a77', NULL, '2026-02-16 03:06:55.03', '2026-01-17 03:06:55.093326', '2026-01-17 03:34:08.17', NULL, NULL, '4e989c40-6906-49d4-8d64-be4f6ca62266'),
	('c99edb69-5df6-4ecb-bcb9-aba170118eb7', 'CB7p3dedWymfuqc3iA5jEzmBGM8KZvfLLZD9pXFsQPMK', 'SOLANA', '82162713c5b7a63502573822a8d6548001b8f0f85a723c657136286195e4881b', NULL, '2026-02-18 09:49:08.976', '2026-01-19 09:49:09.109146', '2026-01-19 09:49:10.678', NULL, NULL, '6b989e14-36c8-410d-a822-b8b94253cbd6'),
	('1dcddce3-5124-4ff6-aea2-deb06d6330ec', '0xc24e3e9805a5c1609e4fad60a0cb11a5812a02cc', 'EVM_1', '173790dec7deaf8ee40c16ff0c314920bafb53a13a6d26bc8b13ef62897007a6', NULL, '2026-02-16 03:35:20.266', '2026-01-17 03:35:20.334252', '2026-01-17 03:35:41.707', NULL, NULL, '18383e76-5dc4-41e1-8067-a98b9ace1622'),
	('488c1d67-33ad-4155-9a1f-ef4a17c37f6b', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', '734ca479dc07d4bc1426f8acff081388be3147195f9cf7a3a7908d63f34ff6e2', NULL, '2026-02-25 03:05:39.055', '2026-01-26 03:05:39.373913', '2026-01-26 03:05:39.373913', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('ea8d6bf3-4c7b-4db3-8105-18be41a0aa4d', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', 'c75d4ddc8bb11478fb164d3378d77b6d56599bfde235f3fbae2960a25ae5df52', NULL, '2026-02-25 03:06:02.349', '2026-01-26 03:06:02.648159', '2026-01-26 03:06:02.648159', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('c2a05852-83fc-43c8-be67-fc2a7054f493', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', '04e258cc690168e8c4bcc7a26015da668f8820ce8f1717ff8bd260a1237a7f0a', NULL, '2026-02-25 03:07:22.415', '2026-01-26 03:07:22.715098', '2026-01-26 03:07:22.715098', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('4cdc3624-f688-47df-8b36-86a4e844c89f', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', 'b5e0b8606f103758d7efd49d1ea3bcb42a962a2b8f0e8d62bcdfa7f572f3cb8f', NULL, '2026-02-25 19:37:39.1', '2026-01-26 19:37:39.462757', '2026-01-26 19:37:39.462757', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('8cc74964-0eeb-4bca-a351-678d75116bf2', '0x5a9594e15177cfe1d7abace8f5845be7ae0ae5ec', 'EVM_1', '1d710f4276410af96515a9b54a62da6319ee4a65a4c22afe5660be0b792c00bb', NULL, '2026-02-15 06:05:12.424', '2026-01-16 06:05:12.489354', '2026-01-21 19:50:06.149', NULL, NULL, 'd65044f7-ec8e-40dc-94a9-04ee71f3b39b'),
	('bb692235-4c9e-4bb7-ac3b-c6d6bf5d8847', '9TuV7aoeDM8hzJcHDBsDSBPPtkqVcbFqeutTS7Z3mDLy', 'SOLANA', 'e065caa6fd3c3ac47df2241b34222da7676d7468362501e331b9d94194b932a0', NULL, '2026-02-20 10:19:20.282', '2026-01-21 10:19:20.668025', '2026-01-21 20:22:20.37', NULL, NULL, 'c872e568-ad9d-4c9d-8b68-502f7f26ee55'),
	('8fe8d224-af80-4475-82dd-6e587a4a57c6', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', '28b18ffc2b71ce7e75af12dd3edf8022acd523a113b3146d559b9909181a09f7', NULL, '2026-02-25 19:57:59.967', '2026-01-26 19:58:00.31307', '2026-01-26 19:58:00.31307', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('29ca393a-fe55-462b-9d63-57d56be83259', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '0a53747843ac6f27478eb2e8bcaf00e9bbb27ef8953ac1e53c778a61763c3cce', NULL, '2026-02-20 21:36:28.268', '2026-01-21 21:36:28.728226', '2026-01-21 21:36:28.728226', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('00da6ae7-4760-4b85-bf7b-ab0b28c50c07', 'E6G74xqDPqxtDvneP1oGsq8XgXXek7bN3CC26mWDAwXu', 'SOLANA', 'd44095e88f11eee196e3d03fb3865d4cd78d081b641c803e87a271833f161ae2', NULL, '2026-02-18 13:26:53.981', '2026-01-19 13:26:55.673591', '2026-01-21 09:23:38.271', NULL, NULL, '16bcd94a-ff72-4d7f-8ca7-55ec0d9e76a7'),
	('b4e60d57-8c26-40f7-bea1-19be53cc1a6e', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '840ba5438c0d29140ab0765db2613967de719fd2228a185e1a4e838a614d13af', NULL, '2026-02-20 21:39:50.745', '2026-01-21 21:39:51.160007', '2026-01-21 21:39:51.689', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('30850ca2-8bbf-49d3-a3c3-02a16e3e02c9', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', '5873e5946df1d150a28d423527287c19e441ae4db42cf9ddea3cdeeda40c3164', NULL, '2026-02-25 20:10:18.876', '2026-01-26 20:10:19.397046', '2026-01-26 20:10:19.397046', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('1d825c7b-a6a8-4a0b-a81f-7bd6fc9c1ad8', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'de98bc18d40b9ad171ba679d04e55e16a7f95c3a25e911fa50c339aba2b478a0', NULL, '2026-02-20 21:39:51.595', '2026-01-21 21:39:52.153553', '2026-01-21 21:39:52.656', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('0c008abf-5bdc-4fe7-9882-5ccdaf7871ac', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '58898f72a23f1ec1b9ec9194311bff6114afe9193552620ab6ac045a12256063', NULL, '2026-02-21 01:12:04.14', '2026-01-22 01:12:04.566761', '2026-01-22 01:12:04.566761', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('774871f7-34de-4266-877f-cb974cac741f', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', 'a98eccd97d13ddc038cfd032ee42a984cf0b8c90ff77b46f15e049b396f524e9', NULL, '2026-02-25 20:11:19.227', '2026-01-26 20:11:19.590543', '2026-01-26 20:11:19.590543', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('1dcbdf6b-c51d-46c3-abbe-e3fe546d12ce', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', '0f672708985ad6ae3e6dc4dc8e775235b2db85fbd43fef3c7004d3b95eac9423', NULL, '2026-02-25 20:14:37.392', '2026-01-26 20:14:37.724403', '2026-01-26 20:14:37.724403', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('f17ab59f-067b-4d93-9bc1-7270d11470ba', '0x178cf582e811b30205cbf4bb7be45a9df31aac4a', 'EVM_1', 'fb05c0baf3f09af1eac5e58cf2983039b8e8bebb7c3a5606867ac8423e3b4860', NULL, '2026-02-25 20:20:36.867', '2026-01-26 20:20:37.182768', '2026-01-26 20:20:37.182768', NULL, NULL, '79731367-a567-4427-b65c-1696cd1d2515'),
	('4e1085cd-f905-4914-8eeb-35375a6b34ea', '0xd7e7f32d89ddb422c277dfe25f215cc1d733e915', 'EVM_1', '35dd22d70c971d185bdd2596e1784e29cd2c69bb790d8a5f126735c7cfee1d1f', NULL, '2026-02-25 20:53:56.898', '2026-01-26 20:53:57.194484', '2026-01-26 20:53:57.194484', NULL, NULL, '7bcd640c-e337-4c44-af86-079b9a808c6f'),
	('7fb391a8-a2c8-46c6-a44b-76fde2493896', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '5f4b632fa5aa8818981ce0f72c04f56ca228aec71f02689f8005d14ef49e4eb9', NULL, '2026-02-25 21:01:19.287', '2026-01-26 21:01:19.598189', '2026-01-26 21:01:19.598189', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('b44879a8-22e4-4558-a8a5-4e07459c7142', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '52fe555b0cf6ad49104ef1009d694d3c262cff14524a41455d2d1e4147edf6e4', NULL, '2026-02-25 21:33:08.583', '2026-01-26 21:33:09.920899', '2026-01-26 21:33:09.920899', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('9f0a937b-926b-4e89-aff8-9aff5e7185bf', '0xd7e7f32d89ddb422c277dfe25f215cc1d733e915', 'EVM_1', 'ce23db2c42239fc9cd0141c389a4ce06062b872b3d321f1b99f67be50ba87e38', NULL, '2026-02-26 00:37:04.187', '2026-01-27 00:37:04.5907', '2026-01-27 00:37:04.5907', NULL, NULL, '7bcd640c-e337-4c44-af86-079b9a808c6f'),
	('568aac3a-9b57-4b94-94c5-7d9f1dc73fa2', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '5b224171447fd06f150ab72b1f813b5a8ccee01c2b2cb181352c1cbb01e74a90', NULL, '2026-02-26 00:55:29.55', '2026-01-27 00:55:29.846355', '2026-01-27 00:55:29.846355', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('016c954d-43df-4890-abef-2e5ca80b4712', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'ba1bcb46cc97b2e19ddad0efb09fad5db2de184d1ad38987794b4155ab3463f9', NULL, '2026-02-26 00:57:51.054', '2026-01-27 00:57:51.403732', '2026-01-27 00:57:51.403732', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('25f7a1bf-6e5b-4bf6-8a48-31b2011770e4', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '29c9ace825a733b23742d83b9b6426e5345de6e05166a9daed054438648aa73d', NULL, '2026-02-26 01:54:26.396', '2026-01-27 01:54:26.960439', '2026-01-27 01:54:26.960439', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('a2f7e559-ece4-467a-9ce1-39a66b4535c1', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', '9b2a79b5537a1ac0e82afb784e21ba398cf239ceed089ab77782b26a869706d3', NULL, '2026-02-28 11:35:35.999', '2026-01-29 11:35:36.557893', '2026-01-29 11:35:36.557893', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('33ef52a1-cc59-4ed4-bedd-d8dfd3e57d2d', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', 'a83c47c255b4dfc604864a15b2443e72e1a9aacc9b04e00d064ed28b2c996c15', NULL, '2026-03-01 00:43:23.607', '2026-01-30 00:43:24.110581', '2026-01-30 00:43:24.110581', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('43a30769-9744-4a51-b62a-e7f18f99c03a', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', '923fac5367d5650883d34bfb3f6a1c7caa9136a8339640da93cacb19b448d521', NULL, '2026-03-01 03:59:13.906', '2026-01-30 03:59:14.377518', '2026-01-30 03:59:14.377518', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('848160a6-6aa5-4eba-958d-513b2f4108ef', '0xdb6bc03b21888dfad41fda888ccac2c803fe283f', 'EVM_1', '9065f013380d5b115f99069cd282ff075ae04c020169ddcf7a1c4254d71cd6bb', NULL, '2026-03-01 04:04:13.051', '2026-01-30 04:04:13.474911', '2026-01-30 04:04:13.474911', NULL, NULL, '8843750a-9030-404b-bbfc-14c429dbde98'),
	('17bd264e-c100-4209-8441-e2d436135a70', '0xdb6bc03b21888dfad41fda888ccac2c803fe283f', 'EVM_1', 'bfc7090171d3b2a5aa07856c4350665e43296756eb59c2c7ea33457446ae8e35', NULL, '2026-03-01 04:05:55.909', '2026-01-30 04:05:56.301368', '2026-01-30 04:05:56.301368', NULL, NULL, '8843750a-9030-404b-bbfc-14c429dbde98'),
	('829d49fb-cc5b-45c5-8ff7-d678c74ea241', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', 'dd020ef4bb2530f11089202444a572d0a1fc35464f5b2f64333c5de06ee0739a', NULL, '2026-03-01 05:43:32.034', '2026-01-30 05:43:32.57295', '2026-01-30 05:43:32.57295', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('09c4f649-927e-402e-bda8-464de80c622e', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '16ab782b8d76211919cfee04b89dfe40dc3a6ee9bf583f003865b3bff1cd77f3', NULL, '2026-03-01 06:34:23.705', '2026-01-30 06:34:25.396094', '2026-01-30 06:34:25.396094', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('2c780569-303d-40b4-8b1b-98993c445f98', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '3521b1bad4b785b6a4f46a9aa4c9a83e0b626e00f8b5fb63a8c372d71ae228e7', NULL, '2026-03-01 06:36:34.337', '2026-01-30 06:36:34.714915', '2026-01-30 06:36:34.714915', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('1909ee18-ee41-424c-8f4d-8c146e6ccccf', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '67a5870ef8a1027e07ae20980b5507523c2d1b52568452763fa5510434839061', NULL, '2026-03-01 06:36:44.541', '2026-01-30 06:36:44.935121', '2026-01-30 06:36:44.935121', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('5bbed42f-5729-48ce-99d4-d4bcf7cd3de4', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', 'ea2dfa79a5fb7e30fe9274d145277155bade4de884fb5e92f4340f9281718904', NULL, '2026-03-01 07:19:25.481', '2026-01-30 07:19:25.930599', '2026-01-30 07:19:25.930599', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('19dae3c1-dfab-4064-a7b5-31eeac527eff', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', '40e760665a28a1a5d31caf8b6090f13f041554ce6b4998ec1afb40a59bd300a6', NULL, '2026-03-01 12:37:43.781', '2026-01-30 12:37:44.409397', '2026-01-30 12:37:44.409397', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('9562c9b0-30cd-48e4-9ce0-95a62f8a3a18', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', 'e59f10a9592deb70d1b6ae2ff93893999e37d603288690239dc66a34280cfb66', NULL, '2026-03-01 12:38:23.266', '2026-01-30 12:38:23.885938', '2026-01-30 12:38:23.885938', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('908d237d-7a4c-4198-9996-9bddf747c770', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', '9c05b9ae1890a1b9892076a3affe87907fdef4adbc9c85bc0c6d16f6ef1c64cc', NULL, '2026-03-01 15:25:46.801', '2026-01-30 15:25:47.512025', '2026-01-30 15:25:47.512025', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('9f736cda-d2e2-4941-943d-3adcba99c765', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', '9dd130ecbaa4a82583e194cd957ae158335ec7e0fb17f8e4ead02cd0f92b71a9', NULL, '2026-03-01 22:03:39.465', '2026-01-30 22:03:40.066546', '2026-01-30 22:03:40.066546', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('afd562e1-c5fe-43e1-a8ec-c6ea89c658b0', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', 'e409e7bfcf6414a362287c8ed0e1f126516bb25ad55bcf16c2bf8e0f6e2a4ce7', NULL, '2026-03-02 00:58:58.562', '2026-01-31 00:58:58.935002', '2026-01-31 00:58:58.935002', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('a1aaf544-e3bf-4721-bd21-b07e4c1784e0', '0x69a8d8d09b8fe7c9a382283a0b7ac5f3418199b0', 'EVM_1', '397e2361570a541d94164663c893d141b0872c53c567b0fc3003488ad82abbb9', NULL, '2026-03-02 01:06:45.089', '2026-01-31 01:06:45.568213', '2026-01-31 01:06:45.568213', NULL, NULL, '07e7e9a4-71e8-48f2-bac6-bc6aa90d295e'),
	('91a60028-a3c0-4112-bb03-b290aa7d61bb', '0x92b56c988fce8c785b233870706b1d1b57857577', 'EVM_1', '94f1e521b6e1e8fcebf532f7bcd077ef94622efb628d2241b93ae772c5e76029', NULL, '2026-03-02 03:44:03.358', '2026-01-31 03:44:03.69054', '2026-01-31 03:44:03.69054', NULL, NULL, 'c87a676c-15e6-4f54-846e-6317165d2fba'),
	('9d341b05-4288-49c2-b000-53a98b63a50f', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', 'cb7f3c4590cb5a97d94948172f37d8c12dcbea50e08fcc89decfead823d04978', NULL, '2026-03-02 05:06:58.81', '2026-01-31 05:06:59.24262', '2026-01-31 05:06:59.24262', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('78b96a61-95b9-4c44-937a-30d0ebf5148b', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '47abfe13d9542f0c063128309d147e7c3ecf68e10739f84e247b9dcf2fbdde93', NULL, '2026-03-02 05:07:28.293', '2026-01-31 05:07:28.671348', '2026-01-31 05:07:28.671348', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('03e7899c-93d8-45a3-9494-8aa4c5eeaa0e', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '1b4ec252728271f3e99dc7e42e5857399f16c54bc9900c9f58baf9e2b52b7ca7', NULL, '2026-03-02 05:12:47.641', '2026-01-31 05:12:48.226879', '2026-01-31 05:12:48.226879', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('d66cf72f-2411-4d7e-b1f9-420d263c7c8b', '0x59788e689b3c1d36f9968c6cc78cc4ce1b2ecd4e', 'EVM_1', '35f2adffa6aeb38a6e286927153e1ceaae31e9be8cf1632a6070343972f4beea', NULL, '2026-03-02 05:21:38.242', '2026-01-31 05:21:38.885459', '2026-01-31 05:21:38.885459', NULL, NULL, 'f11e1821-4725-4b8d-869d-d76e0a0023e7'),
	('02a81d7b-8287-4938-a429-e3d7895cba2a', '0x4e5a3ef17a67c7a7260cf2a01c9bd251be9653ff', 'EVM_1', '42a30e7ecfe4cf0795b8d8ecc3149c1d59b89f919a46a87c37488a5976393bbd', NULL, '2026-03-02 05:46:44.517', '2026-01-31 05:46:44.837007', '2026-01-31 05:46:44.837007', NULL, NULL, '07cb4a72-c872-4538-876a-183090ec0899'),
	('73956419-8321-4141-bb4d-91b0f6f92b57', '0xe677cb29436f0be225b174d5434fb8a04231069e', 'EVM_1', '5f577754b982eb2133d1c88ec85c3327c6ce2e3dadcb0ee250e744e2de47b660', NULL, '2026-03-02 13:02:07.145', '2026-01-31 13:02:07.89159', '2026-01-31 13:02:07.89159', NULL, NULL, 'e11e2c2a-527f-4cf2-aeb9-0c06392c0197'),
	('e52ac25c-ffd9-4af8-91c4-f94c53062f45', '0xe677cb29436f0be225b174d5434fb8a04231069e', 'EVM_1', 'c2495d286616f2a9476706c3334c4239b50b076c27b8be2760872b6fb0bb92c2', NULL, '2026-03-02 20:58:26.329', '2026-01-31 20:58:26.933365', '2026-01-31 20:58:26.933365', NULL, NULL, 'e11e2c2a-527f-4cf2-aeb9-0c06392c0197'),
	('c39947ce-c754-481e-a323-541005288227', '0xe677cb29436f0be225b174d5434fb8a04231069e', 'EVM_1', 'f9af9d8378994fec909fdc5db2a80617647267c55864998ecb3490dfb40e1836', NULL, '2026-03-02 21:00:24.447', '2026-01-31 21:00:25.000275', '2026-01-31 21:00:25.000275', NULL, NULL, 'e11e2c2a-527f-4cf2-aeb9-0c06392c0197'),
	('88086bfd-b302-49b9-ac0d-2aba12fd0c87', '0xe677cb29436f0be225b174d5434fb8a04231069e', 'EVM_1', '1d7dad7051a4b9954681bc5a7525c6cfa83f59de7037b81dd671c15acdc016b0', NULL, '2026-03-02 21:18:45.48', '2026-01-31 21:18:46.122622', '2026-01-31 21:18:46.122622', NULL, NULL, 'e11e2c2a-527f-4cf2-aeb9-0c06392c0197'),
	('d7f8500d-69ac-436e-92d6-063b4f22c21f', '0xe677cb29436f0be225b174d5434fb8a04231069e', 'EVM_1', 'de31b29a5c2f32d5e03565e90edc4f0a72762cf4bedc90e7ee76a55cabf1d3a0', NULL, '2026-03-02 21:23:33.961', '2026-01-31 21:23:34.695141', '2026-01-31 21:23:34.695141', NULL, NULL, 'e11e2c2a-527f-4cf2-aeb9-0c06392c0197'),
	('cb13982a-f0b7-4119-bedb-d7cf95ebd370', '0xe677cb29436f0be225b174d5434fb8a04231069e', 'EVM_1', 'da5e37381c033063a8826ab4df657c9b4291e6e5eb9f14fee257fd885ca4d3d6', NULL, '2026-03-02 21:57:09.182', '2026-01-31 21:57:09.701051', '2026-01-31 21:57:09.701051', NULL, NULL, 'e11e2c2a-527f-4cf2-aeb9-0c06392c0197'),
	('4258561b-8663-4706-82d6-8d27652effe5', '0xe677cb29436f0be225b174d5434fb8a04231069e', 'EVM_1', '284d5a65352c8fea57a34a85b8e8b57f4d097b4a66e10726dc0d31b67e32e879', NULL, '2026-03-02 22:09:53.12', '2026-01-31 22:09:53.803574', '2026-01-31 22:09:53.803574', NULL, NULL, 'e11e2c2a-527f-4cf2-aeb9-0c06392c0197'),
	('5a90032f-2b8c-4a22-a7e2-17696041253a', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'e5332a95e3891aad1e95e65e1affe7948e5ac0dc0e0fac75e1dd983f8983f861', NULL, '2026-03-02 22:18:46.852', '2026-01-31 22:18:47.166172', '2026-01-31 22:18:47.166172', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('73592e7d-a6cd-498d-b555-c454870f5ccc', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'ab26c3d51738115a8483607f97d8fa15f1d80e727ed5d1a77db5274a9594a823', NULL, '2026-03-02 22:44:01.034', '2026-01-31 22:44:01.430819', '2026-01-31 22:44:01.430819', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('b71c04d4-db3c-41a6-90ab-a00c88d078ef', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '92afa9262af9e5d47ca32569f27725426b89f7a217b8d7546d6e52fb4606ceee', NULL, '2026-03-02 23:04:54.459', '2026-01-31 23:04:54.848505', '2026-01-31 23:04:54.848505', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('fe8c0f7a-f14a-456f-baeb-8ff33fb3e8b9', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '7fc49e6c1e285c322249458f16b3a182d5d3b243ca9e33b312102b716cc9e816', NULL, '2026-03-02 23:11:32.446', '2026-01-31 23:11:32.853866', '2026-01-31 23:11:32.853866', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('5c2eabdd-db0b-4719-8d73-35f05e5e24be', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '80fb9a3339c89e5e4a18377046538eacfbe886ca8216ea8f0141bdc153493d74', NULL, '2026-03-02 23:29:31.307', '2026-01-31 23:29:31.808559', '2026-01-31 23:29:31.808559', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('22f8214d-bbfc-468f-9102-0703ec993efb', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '90ccadb6f4bd5d5b41bd3c10d1b333b57af0c34e3f871c0bcbfe9eb673c55be9', NULL, '2026-03-02 23:48:57.954', '2026-01-31 23:48:58.346912', '2026-01-31 23:48:58.346912', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('5a85df7d-8b20-4aac-bca5-bf71e862f453', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '346a0635fe4e68c934e11fa28dded3be549b7afd38f9d088b5ad14397060c65f', NULL, '2026-03-02 23:59:59.242', '2026-01-31 23:59:59.83771', '2026-01-31 23:59:59.83771', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('163c4a9c-85e6-451b-b1cb-62493d773a72', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'e5f13cbe62434d1e9e521ef9161bd7f844e648dc0a3a5085814b0f65d15e754e', NULL, '2026-03-03 00:19:57.487', '2026-02-01 00:19:58.052352', '2026-02-01 00:19:58.052352', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('7afd33a3-9f83-4704-ba8d-1d76c542cc8c', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'ae7569137a2da8710d7a69cb1a92a4c58ebe39658b621045faf0b1fa7c082aa6', NULL, '2026-03-03 02:15:53.124', '2026-02-01 02:15:53.591353', '2026-02-01 02:15:53.591353', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('e77f496a-a553-4ed2-92b5-f1c7b27b08ca', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '1e8c388190a338cb0a41548f963fdf3c1bdfc97ff3d277a1861cf4e61e503c11', NULL, '2026-03-03 05:09:44.421', '2026-02-01 05:09:44.812005', '2026-02-01 05:09:44.812005', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('afa0b62d-ce47-4091-8275-bcd9b78ab3d8', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '336c657d2fb662bb8330233acdfadc7545c0b392ca4679a7efac0f0e04f3684f', NULL, '2026-03-03 05:22:56.273', '2026-02-01 05:22:57.34977', '2026-02-01 05:22:57.34977', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('b0ca3b5d-ef6b-4638-bd3f-c2dbf4fa020f', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'cae3e3999f463e1693431dfabfac54e25c6331bca47025f41d152001e606141a', NULL, '2026-03-03 14:15:22.241', '2026-02-01 14:15:23.030752', '2026-02-01 14:15:23.030752', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('5cc7f2b1-8d6a-4f8c-86a4-cb25080fcfd0', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'b3ead091f9ad88b99074058b7e4543f3e89ccb85a238899ef7ba089c2670071c', NULL, '2026-03-03 15:02:18.868', '2026-02-01 15:02:19.677538', '2026-02-01 15:02:19.677538', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('d3871732-4259-4a94-a6b8-eff62110c9ca', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '8dfaca4c12b4caad720ddf25540454305cb9f2ef456bea0a5ee5c60fb35eae86', NULL, '2026-03-03 17:54:51.46', '2026-02-01 17:54:52.099518', '2026-02-01 17:54:52.099518', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('27105612-88b5-49d9-9f69-b0cf7bf446dc', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '764d3a20ad5f07f8df2b605ce3f37131301dcd9dac5717115e2cfd5bc9f99d05', NULL, '2026-03-03 18:52:42.298', '2026-02-01 18:52:42.762356', '2026-02-01 18:52:42.762356', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('8b23c0e2-f9be-4335-9227-a8b2cf2acc22', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '750409f4851666746e0a3f172d9b30971edaac8dd0e8467ef434dc36d421b58e', NULL, '2026-03-03 19:04:13.162', '2026-02-01 19:04:13.744363', '2026-02-01 19:04:13.744363', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('0fd6e37c-4315-4ae3-bdfa-1964da195812', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'ca42eda6452b3378490a51c2dbfa6b8dcd088c3d15dce07f762c95ddb53d89b2', NULL, '2026-03-03 19:05:30.876', '2026-02-01 19:05:31.842636', '2026-02-01 19:05:31.842636', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('b292bf3c-9353-41e1-a7ea-3793ea7666bd', '0x92222c5248fb6c78c3111aa1076c1ef41f44e394', 'EVM_1', 'ce371f267067128e7636c7fbb7449fcf8a7a1c1b746be43e37a242e914faa9b9', NULL, '2026-03-03 20:22:58.983', '2026-02-01 20:22:59.367814', '2026-02-01 20:22:59.367814', NULL, NULL, '23e89ea3-a1c1-45ff-8cb0-d61575335ae7'),
	('d9454d85-dda9-4412-8d0d-c2a9c72a9a50', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'cb0bf27603da600ec9c90c1aaef5a2d33c2800ca1c5aaaadb4dda321b056de25', NULL, '2026-03-03 20:43:08.675', '2026-02-01 20:43:09.114873', '2026-02-01 20:43:09.114873', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('32c6ecb8-9c9c-4e16-9200-b1a476fd8b23', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '791f0e1e4fdb7a93948cc6ff2b34003e0f43cfd98a78aeef2cda79ed8d2edf6e', NULL, '2026-03-03 22:11:43.158', '2026-02-01 22:11:43.677315', '2026-02-01 22:11:43.677315', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('398ffffd-a294-4d62-8bb9-159683a7c15b', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '11f1d58a0534a3e4671fca840d2490ff9722406539430d22cebe5a026b522690', NULL, '2026-03-03 23:25:18.36', '2026-02-01 23:25:19.487468', '2026-02-01 23:25:19.487468', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('a532b72c-3f1a-4616-9120-bddede2ed959', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '762a3fcbaa075903989b51e9091897fe0aa7a8fc83e9aaa289acd6c227857b61', NULL, '2026-03-03 23:25:38.88', '2026-02-01 23:25:39.255697', '2026-02-01 23:25:39.255697', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('da8c32ed-6a47-4d66-bf6f-2d860d9c92d5', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'c5a880550d87fbb76b4c2c1d6d07e363a882711208e50a940ee6e177c5c3e448', NULL, '2026-03-03 23:30:08.416', '2026-02-01 23:30:08.752779', '2026-02-01 23:30:08.752779', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('521e3294-8584-4488-965d-aa86ee100479', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'bffce3d1b424814952dcd4d42835cb1db90a8208ea6a5162a4ab9336f72447b5', NULL, '2026-03-04 02:46:50.237', '2026-02-02 02:46:51.691599', '2026-02-02 02:46:51.691599', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('e95ad215-8189-425e-9592-70d180015a83', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '0f9e1e6ec5c90f2750242da2e463c4172bb85a77f3b3ebe52f7753f13c311309', NULL, '2026-03-04 02:47:04.514', '2026-02-02 02:47:04.965773', '2026-02-02 02:47:04.965773', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('2e34cc48-8bd0-4ffd-b572-7209ef7be9c2', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '2838191faa38af88a3adf033037b12bc4d5bb90ae87ccf077202af24111b7e99', NULL, '2026-03-04 04:52:29.869', '2026-02-02 04:52:31.566511', '2026-02-02 04:52:31.566511', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('c68c9dd7-36df-4ad0-974a-aeb1e7a12273', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'c675d7cd94ac3953b9118c107e7320d85c2e00dbc0718db7d76e63e1635fbfef', NULL, '2026-03-04 05:07:55.706', '2026-02-02 05:07:56.158651', '2026-02-02 05:07:56.158651', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('7d70f43d-e15f-4bda-8eb7-a01e76c8ae90', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '5f1581d1dc9fe0f757881e2928c6919677588c2ec7e0e5114a8a63ee0eaace6c', NULL, '2026-03-04 06:47:30.614', '2026-02-02 06:47:31.09836', '2026-02-02 06:47:31.09836', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('12e32ac5-69e1-43bf-a59c-458da4f6ff7d', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '2368a9b74fbd895b1b9bb174619f189726be20b446855f124306bf424c61548d', NULL, '2026-03-04 06:47:39.473', '2026-02-02 06:47:40.115051', '2026-02-02 06:47:40.115051', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('ce25645c-1bfe-4aa6-a964-a0d7a776512e', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'dc824a20d15616c5548521b26dfe2f289efc664492ae8f53ba065f8fba934594', NULL, '2026-03-04 06:49:02.882', '2026-02-02 06:49:03.255229', '2026-02-02 06:49:03.255229', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('d6ff4682-ba74-4fa1-ab05-c96aff7e6fdc', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'aa3cf2746ca6ed261203d8f29e451b590e27240aa74e9b1e78e500e0c8f8f570', NULL, '2026-03-04 16:45:08.935', '2026-02-02 16:45:09.83549', '2026-02-02 16:45:09.83549', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('e127ca52-d58a-463e-b122-7ced4d669ca8', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'c72f1645fd787bf694e244d8381a1378d9ba3ff9d4144c2412bb695970d22338', NULL, '2026-03-04 17:10:11.418', '2026-02-02 17:10:11.811324', '2026-02-02 17:10:11.811324', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('db6b907f-ae13-428a-a514-0faf46473ac0', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '3f9bb69621bbb5be46ca602ecfa57d3fb8732c4f963e5088ed1f68e6d900bc1b', NULL, '2026-03-04 17:33:23.621', '2026-02-02 17:33:24.058771', '2026-02-02 17:33:24.058771', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('70062252-529a-4ab4-aa69-8c09c4f7a66c', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'e67d2090977362866362986915bc45a461d483d3ca2c3dc4a5c8357056ba9629', NULL, '2026-03-04 18:06:48.568', '2026-02-02 18:06:48.946809', '2026-02-02 18:06:48.946809', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('e97861e6-46e9-4072-a04f-132ed021ec2d', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '5c8a61527054238e203730ac46db452b7eab4d1197497fb700582f64591a5a4c', NULL, '2026-03-04 18:08:00.201', '2026-02-02 18:08:00.561383', '2026-02-02 18:08:00.561383', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('cbdf7938-2110-42ed-958e-627b1cb005fa', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'fe5be7c3577c617e5c62e68551aa601119da6b07e7210a5311fe963db86ac982', NULL, '2026-03-04 18:22:32.385', '2026-02-02 18:22:32.966058', '2026-02-02 18:22:32.966058', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('318a1e0d-713e-4faf-82e0-af44732207f0', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '80ae450c28138f9990898f21523611eff921116a9bbb99b9ad694c21b33637b7', NULL, '2026-03-04 19:17:56.98', '2026-02-02 19:17:57.383197', '2026-02-02 19:17:57.383197', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('89f7d6c9-02d1-4aae-8b6e-427599ddfc58', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'fee2de8775fd289ddc8a48674622992fdf57dba417f578db17376f5349282a9d', NULL, '2026-03-04 19:18:07.272', '2026-02-02 19:18:07.634166', '2026-02-02 19:18:07.634166', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('c8045a9c-ff91-4222-b79a-3936601c69ae', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'adcbc29391e5bf9bb7f138b6cfbe19f1f6cef3b921586599b76aa26ec110a97d', NULL, '2026-03-04 19:55:09.475', '2026-02-02 19:55:10.106411', '2026-02-02 19:55:10.106411', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('c7c7640c-188e-40a9-9806-e4294da6fdb7', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'e2189ba66fea5858e5d385b1a01f6094cbf881e2d28a9934fb554a866b84297b', NULL, '2026-03-04 19:55:30.186', '2026-02-02 19:55:30.588192', '2026-02-02 19:55:30.588192', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('11e97844-5639-4db3-99b4-9d0c6cfe004f', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '1db1a26c66d3a7cff28569a6ed8f6f54e0657bdb6da599d6618e4338f7d6e559', NULL, '2026-03-04 20:02:18.749', '2026-02-02 20:02:19.382308', '2026-02-02 20:02:19.382308', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('cdb7b825-8311-4a5b-9e48-c5a418cb8277', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '836c3612172e8856ad802243a2a22e561a60a9c9e0883402f2c03de2c438166d', NULL, '2026-03-04 20:06:20.272', '2026-02-02 20:06:20.627652', '2026-02-02 20:06:20.627652', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('4fd119c7-92c2-4719-8274-c42c028e949c', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '6eee4c346a91f169ed4fbeb11e9c5e29e4f79e52e38ce51c144f445a71d9ae35', NULL, '2026-03-04 20:12:56.931', '2026-02-02 20:12:57.352326', '2026-02-02 20:12:57.352326', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('6f08eb71-5fd0-4a61-ac42-db453fc0c6a4', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'af555bf8a899923bb2cf0d1498637a51bbe233af217dea0d0049d3bb0f8a03c8', NULL, '2026-03-04 20:33:07.17', '2026-02-02 20:33:07.881054', '2026-02-02 20:33:07.881054', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('e1df9335-a57e-486a-b923-68259991e525', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '3b6e1dc8ce68f0bf79f6d959b17984b12455e1f59c05f0e674a4bbf54096a155', NULL, '2026-03-04 21:20:54.513', '2026-02-02 21:20:55.073171', '2026-02-02 21:20:55.073171', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('fc483b73-76d9-4aae-856e-58c00f0b5bde', '0x92222c5248fb6c78c3111aa1076c1ef41f44e394', 'EVM_1', '28ef43d58db8fe102fcbf43ff518dfc0bf699c9da8d263692dbe58e5e78a7aca', NULL, '2026-03-04 21:36:09.62', '2026-02-02 21:36:10.073695', '2026-02-02 21:36:10.073695', NULL, NULL, '23e89ea3-a1c1-45ff-8cb0-d61575335ae7'),
	('d7fbc45e-d672-453b-88bd-b77dbdbbc0eb', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '862163b2fc3e348d76136c33318c286931f89ff79cb0da229184c3d7f95b20ad', NULL, '2026-03-04 22:46:47.953', '2026-02-02 22:46:48.391128', '2026-02-02 22:46:48.391128', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('105fd9a1-9b75-42de-a830-7b10f79829fe', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'eafad7328f89fd13ccae70dbd99f44e42b7d300da940668e8bc4b5e2f0160936', NULL, '2026-03-04 22:48:16.289', '2026-02-02 22:48:16.874096', '2026-02-02 22:48:16.874096', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('ecda8011-a2d7-4469-ba4c-186de14db23e', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', 'bfbd8af7e5433fbc32cbf449a152524c3767a9e68aa0f05edcd54b29319c4540', NULL, '2026-03-04 22:49:57.026', '2026-02-02 22:49:57.402517', '2026-02-02 22:49:57.402517', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('532e8241-7804-4319-bb42-f25426eb287c', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '8dfd51bcce2b2d3ed4711e5df94a2bef2050576302b6ead5e9ab05a6fbec4eee', NULL, '2026-03-04 22:50:48.344', '2026-02-02 22:50:48.878648', '2026-02-02 22:50:48.878648', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('214d612b-835d-44d9-94e4-90d0373d81bf', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '48852d8ba9de91de0a4549b11996b33774d02a9f32d51bc379ae65e7c27277b8', NULL, '2026-03-04 22:51:53.076', '2026-02-02 22:51:53.496228', '2026-02-02 22:51:53.496228', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('babb0227-59e9-47d9-aa69-79f5d924487d', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '6a133aa08b7250a75186b9051e0d02d0a5fb28a62431ff97eca5bcfaf60ade12', NULL, '2026-03-04 23:46:40.684', '2026-02-02 23:46:41.094539', '2026-02-02 23:46:41.094539', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('c29e3d38-b5f7-4e08-8def-c8dd5144aa60', '0xac89bf746daf1c782ed87e81a89fe8885cf979f5', 'EVM_1', '989dcd27db63eaf14a03690cb444d3790720103ac38b04cf2176cf2982c7e252', NULL, '2026-03-04 23:59:09.751', '2026-02-02 23:59:10.255024', '2026-02-02 23:59:10.255024', NULL, NULL, 'b64f5c2f-c4fe-4bf3-9464-8a575de1cce9'),
	('03ab5e5a-e5f9-4324-8185-032a9200e325', '0xae6655e1c047a5860edd643897d313edaa2b9f41', 'EVM_1', 'dbf6c761326f350da56d49949b2b4f9072e478645264b8701411afe639ca7623', NULL, '2026-03-05 00:28:56.882', '2026-02-03 00:28:57.181203', '2026-02-03 00:28:57.181203', NULL, NULL, '90c8d770-f5e3-4ac8-abf5-90bcd1be70c9'),
	('9460ffdc-8ac4-4544-8bea-61de522e5a04', '0xae6655e1c047a5860edd643897d313edaa2b9f41', 'EVM_1', '2afd4376bc2c018551d229e145bfb2a094aca03b683407f9fcf1f6104ebf07e2', NULL, '2026-03-05 01:43:29.385', '2026-02-03 01:43:29.978104', '2026-02-03 01:43:29.978104', NULL, NULL, '90c8d770-f5e3-4ac8-abf5-90bcd1be70c9'),
	('b32508a7-6990-4162-8549-e3fae96d65f9', '0xae6655e1c047a5860edd643897d313edaa2b9f41', 'EVM_1', '0452dae799b18135ae099b170d42f77dc9019c9f543286aa8eedb3714ffd175b', NULL, '2026-03-05 01:47:43.01', '2026-02-03 01:47:43.626125', '2026-02-03 01:47:43.626125', NULL, NULL, '90c8d770-f5e3-4ac8-abf5-90bcd1be70c9'),
	('cbfbeed5-c979-445d-ac20-14df071034fa', '0xae6655e1c047a5860edd643897d313edaa2b9f41', 'EVM_1', 'bfe161a464eec153e0c07a991a15bb104a43d0726f0f4fded2668a0340c1d2f8', NULL, '2026-03-05 01:50:24.755', '2026-02-03 01:50:25.141446', '2026-02-03 01:50:25.141446', NULL, NULL, '90c8d770-f5e3-4ac8-abf5-90bcd1be70c9'),
	('68aa8062-8ef1-434f-996b-6159b9516064', '0xae6655e1c047a5860edd643897d313edaa2b9f41', 'EVM_1', 'dfe636e4280e5cfef15faf0d928e594f170523b5794166ab9c2f195f295d6d6d', NULL, '2026-03-05 03:55:21.141', '2026-02-03 03:55:21.759151', '2026-02-03 03:55:21.759151', NULL, NULL, '90c8d770-f5e3-4ac8-abf5-90bcd1be70c9'),
	('e786016d-46d4-488f-bef2-71ee59e862db', '0xae6655e1c047a5860edd643897d313edaa2b9f41', 'EVM_1', '07cc6247f276c56669cd7bc476cc83fe64803c94e11a92f14960c2297a261493', NULL, '2026-03-05 19:10:24.516', '2026-02-03 19:10:25.06146', '2026-02-03 19:10:25.06146', NULL, NULL, '90c8d770-f5e3-4ac8-abf5-90bcd1be70c9'),
	('28e8e86a-af43-4298-92e7-f5153aa9f29e', '0xae6655e1c047a5860edd643897d313edaa2b9f41', 'EVM_1', '96c662cab46da0db3eb3fc2204a1558eca670c62016b8b927c68abd51d34fd88', NULL, '2026-03-05 19:40:08.487', '2026-02-03 19:40:08.878394', '2026-02-03 19:40:08.878394', NULL, NULL, '90c8d770-f5e3-4ac8-abf5-90bcd1be70c9'),
	('2f9cc241-f685-4dc4-bc44-0b1831cabc39', '0x25b21c43112f196cd33b467279d737ef5733b175', 'EVM_1', '8f2bad96feea35c8f4379d8c06f7aea641807d5410a95297d9a54424e0852706', NULL, '2026-03-05 19:40:21.246', '2026-02-03 19:40:21.564135', '2026-02-03 19:40:21.564135', NULL, NULL, '4118e704-5df5-4791-823e-9e50deff4058'),
	('c3a90a7b-4d74-41ca-b4b9-7d8331a4de22', '0xfd761f29d6c3dfc36fe21f5dc3ff5e14f08ebcb4', 'EVM_1', '7b2a6bcd5f4e55f1363701576efce5c95ec2af9214e991ebb90305eb4f94cd89', NULL, '2026-03-05 19:49:00.17', '2026-02-03 19:49:00.488722', '2026-02-03 19:49:00.488722', NULL, NULL, '95012cce-f7b1-4e12-a097-82fce370587d'),
	('87fb4d3d-3aac-4005-9432-9ad477ed614b', '0xfd761f29d6c3dfc36fe21f5dc3ff5e14f08ebcb4', 'EVM_1', 'b96e43ce34228e42b2452e293d3d723d3694ba6b82b28e80bdf4eaa5f87361b0', NULL, '2026-03-05 19:55:33.467', '2026-02-03 19:55:33.87605', '2026-02-03 19:55:33.87605', NULL, NULL, '95012cce-f7b1-4e12-a097-82fce370587d'),
	('1c7ad5b6-4ac9-4b3c-8ae5-14ec7c6a0785', '0xf2b44e1d609f662efd8c8765a2d8fd56bbe1ab95', 'EVM_1', 'b1fc72517984ffe61ac17a23246a22c6f7482f18ed2794184a2126de23290528', NULL, '2026-03-05 19:59:02.986', '2026-02-03 19:59:03.297465', '2026-02-03 19:59:03.297465', NULL, NULL, 'b9f2e3d9-f22b-4427-a725-39fa4b658917'),
	('2150a437-0f00-47d8-9f62-6ea050d00542', '0xf2b44e1d609f662efd8c8765a2d8fd56bbe1ab95', 'EVM_1', 'bff4ae2fce6d268e200c7a0291c6dda5613cf9a4d5d0e15677b104110e046e46', NULL, '2026-03-05 20:46:35.648', '2026-02-03 20:46:35.980832', '2026-02-03 20:46:35.980832', NULL, NULL, 'b9f2e3d9-f22b-4427-a725-39fa4b658917'),
	('2fea2e95-db7c-4c59-a5d8-ad289f7adc71', '0xf2b44e1d609f662efd8c8765a2d8fd56bbe1ab95', 'EVM_1', 'fe618ed8310d1d6e2f4b7c39209054152a0afdd75b64ead7ad2d21d9766d30f9', NULL, '2026-03-05 21:18:03.474', '2026-02-03 21:18:03.870988', '2026-02-03 21:18:03.870988', NULL, NULL, 'b9f2e3d9-f22b-4427-a725-39fa4b658917'),
	('18be7dbe-275b-45b0-8b69-ee2b63ed789f', '0xf2b44e1d609f662efd8c8765a2d8fd56bbe1ab95', 'EVM_1', '06acc42174db7b572fa6f825d7e4971414f883aa26905dea66a8581eec771154', NULL, '2026-03-05 21:27:13.225', '2026-02-03 21:27:13.593261', '2026-02-03 21:27:13.593261', NULL, NULL, 'b9f2e3d9-f22b-4427-a725-39fa4b658917'),
	('a2b9cd0a-b247-4a09-a367-2113ab48e70c', '0xf2b44e1d609f662efd8c8765a2d8fd56bbe1ab95', 'EVM_1', 'bb79bea73571e63e643e0115791fda2576f90ac28edcf24730f8766c28439277', NULL, '2026-03-05 21:34:28.185', '2026-02-03 21:34:28.543142', '2026-02-03 21:34:28.543142', NULL, NULL, 'b9f2e3d9-f22b-4427-a725-39fa4b658917'),
	('90a9960e-fce4-4f6f-a56d-f107619587dd', '0xf2b44e1d609f662efd8c8765a2d8fd56bbe1ab95', 'EVM_1', 'd72074d48eb6ae30aaf515951b86eeacd58bb4ca26d6e9265f7f7ac41b2faf4a', NULL, '2026-03-05 21:35:59.158', '2026-02-03 21:35:59.653975', '2026-02-03 21:35:59.653975', NULL, NULL, 'b9f2e3d9-f22b-4427-a725-39fa4b658917'),
	('876d7d20-1f6d-48fc-9e13-f6ba20fd4be6', '0x5058c7ee137626c1e7e0fdfcbba998a2f84ba400', 'EVM_1', 'b096d7f3f23f5341bd42e8b399f464a6bff4a9c798a7a28a90fae15eb9a03939', NULL, '2026-03-05 23:09:38.259', '2026-02-03 23:09:38.571972', '2026-02-03 23:09:38.571972', NULL, NULL, 'e128fbcb-6f19-45b9-b34b-c457092e1789'),
	('57af9c02-8c9a-4475-8457-6c619185a8a9', '0x9a0d7dc7a0348c1b0b2d04c25ab6398bd5819551', 'EVM_1', '33ba2388411cbc33aa0452de63273811c331690ca56575466fc0303805e511d4', NULL, '2026-03-05 23:20:45.572', '2026-02-03 23:20:45.952114', '2026-02-03 23:20:45.952114', NULL, NULL, 'c921013a-35a5-403d-8073-bd197a44c865'),
	('5384dc2c-02a6-41f0-ba5c-122c395ecf61', '0x1295f65b7c6aef8f708cc700b129788e26a039e2', 'EVM_1', '0c42abd02054e68296512ebf8d36c77b39ed611a8bb0c1976ac587e56e451835', NULL, '2026-03-05 23:31:21.257', '2026-02-03 23:31:21.552521', '2026-02-03 23:31:21.552521', NULL, NULL, '5836b4a4-dd4e-4d8f-96ad-99312828100b'),
	('d6e9760d-15d6-4077-a74e-912830a20d71', '0x9a0d7dc7a0348c1b0b2d04c25ab6398bd5819551', 'EVM_1', '3d2b13990c63c58cfeb0a70b1f8e8b1a211ff76f2235ebab0bf25439ef2074a2', NULL, '2026-03-06 02:14:52.171', '2026-02-04 02:14:52.575887', '2026-02-04 02:14:52.575887', NULL, NULL, 'c921013a-35a5-403d-8073-bd197a44c865'),
	('c241da26-750f-4f7a-b427-67a45e895784', '0x5058c7ee137626c1e7e0fdfcbba998a2f84ba400', 'EVM_1', '10e3e8cf5eb95673dd7e56340a9c0d0d640e79797b2ca3a5be81a81a5d717970', NULL, '2026-03-06 02:15:32.404', '2026-02-04 02:15:32.809017', '2026-02-04 02:15:32.809017', NULL, NULL, 'e128fbcb-6f19-45b9-b34b-c457092e1789'),
	('74fd55d9-4d8d-40db-931e-fce58aecd9af', '0x5058c7ee137626c1e7e0fdfcbba998a2f84ba400', 'EVM_1', 'e2935e186d3bfa28a260d706c51687936117d6a4e8d0c3f79be243863d4bb3e5', NULL, '2026-03-06 02:38:13.962', '2026-02-04 02:38:14.312812', '2026-02-04 02:38:14.312812', NULL, NULL, 'e128fbcb-6f19-45b9-b34b-c457092e1789'),
	('aaf754df-8e3d-441e-84dd-a3b9df5ebd2b', '0x5058c7ee137626c1e7e0fdfcbba998a2f84ba400', 'EVM_1', '78be4b6bf63da690168fd086de4134bfdb348bcae721830384a083b56bb4f548', NULL, '2026-03-06 03:34:30.117', '2026-02-04 03:34:30.51269', '2026-02-04 03:34:30.51269', NULL, NULL, 'e128fbcb-6f19-45b9-b34b-c457092e1789'),
	('4ea1a4a4-0de4-460c-8f1c-1a9ce2f7f342', '0x5058c7ee137626c1e7e0fdfcbba998a2f84ba400', 'EVM_1', '3549769f258065ac3e36c893b91f9608368a90ad4591ff9aeea90a2363a9d979', NULL, '2026-03-06 03:37:31.495', '2026-02-04 03:37:32.058685', '2026-02-04 03:37:32.058685', NULL, NULL, 'e128fbcb-6f19-45b9-b34b-c457092e1789'),
	('47287bd6-ce86-4def-97ff-02655514d8b1', '0xae6655e1c047a5860edd643897d313edaa2b9f41', 'EVM_1', '3be6d13dd73dea585fa2fd0df17146b632a3756855c661ba8c0e0b472aa8e34e', NULL, '2026-03-06 05:37:35.136', '2026-02-04 05:37:35.695546', '2026-02-04 05:37:35.695546', NULL, NULL, '90c8d770-f5e3-4ac8-abf5-90bcd1be70c9'),
	('98a5eb34-4703-43c7-823a-46aae9ae532f', '0xae6655e1c047a5860edd643897d313edaa2b9f41', 'EVM_1', '8b63b401a0755e2921b20f1c424d1fa6ee804919dbea3cf82926740e69ae5759', NULL, '2026-03-06 05:41:43.648', '2026-02-04 05:41:44.140752', '2026-02-04 05:41:44.140752', NULL, NULL, '90c8d770-f5e3-4ac8-abf5-90bcd1be70c9');


--
-- Data for Name: badge_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."badge_definitions" ("id", "badge_key", "name", "description", "icon_url", "badge_type", "auto_award_criteria", "is_active", "created_at", "scope") VALUES
	('6d675bf7-fa6e-42a6-95de-5a1c595dedee', 'SC_AUDIT_PASSED', 'Security Audited', 'Smart contract passed professional security audit (CertiK, Hacken, or equivalent)', '/badges/audit-passed.svg', 'SECURITY', '{"trigger": "scan_passed"}', true, '2026-01-13 15:08:33.650891+00', 'PROJECT'),
	('b8653ce5-9c78-43fc-9ca7-a01ba4204c61', 'FIRST_PROJECT', 'Pioneer', 'Created first project on SELSIPAD platform', '/badges/first-project.svg', 'MILESTONE', '{"trigger": "first_project"}', true, '2026-01-13 15:08:33.650891+00', 'PROJECT'),
	('7e4ff66d-1f36-4da8-8709-ec84218c9224', 'TRENDING_PROJECT', 'Trending', 'Featured in trending projects', '/badges/trending.svg', 'SPECIAL', '{"manual": true}', true, '2026-01-13 15:08:33.650891+00', 'PROJECT'),
	('dc81ffd1-9eb8-44d8-a237-abcade7021e2', 'VERIFIED_TEAM', 'Verified Team', 'Team members verified and doxxed', '/badges/verified-team.svg', 'KYC', '{"manual": true}', true, '2026-01-13 15:08:33.650891+00', 'PROJECT'),
	('fc154c96-38b1-49d2-8fe2-7e63a1c43da7', 'SC_AUDIT_PASS', 'Smart Contract Audited', 'Smart contract passed professional security audit', '/badges/sc-audit.svg', 'SECURITY', '{"trigger": "audit_passed"}', true, '2026-01-17 10:24:19.650001+00', 'PROJECT'),
	('2e02728e-bc43-46f6-9e62-f7768875d5f9', 'EARLY_ADOPTER', 'OG Member', 'Early platform member - joined before public launch', '/badges/early-adopter.svg', 'SPECIAL', '{"manual": true}', true, '2026-01-13 15:08:33.650891+00', 'USER'),
	('31a185da-f5c6-469c-a511-365374543986', 'REFERRAL_PRO', 'Referral Pro', 'Has 20+ active referrals who made contributions', '/badges/referral-pro.svg', 'MILESTONE', '{"logic": "counted_by_worker", "threshold": "20_active_referrals"}', true, '2026-01-17 10:24:19.650001+00', 'USER'),
	('1a846e60-b09b-4f2b-9519-c5ef8a4973f0', 'WHALE', 'Whale', 'Total contributions across all rounds >= $20,000 USD', '/badges/whale.svg', 'MILESTONE', '{"logic": "normalized_to_usd", "threshold": "20000_usd"}', true, '2026-01-17 10:24:19.650001+00', 'USER'),
	('3e02bcc3-62b3-4c7b-937a-4701c13ff155', 'INFLUENCER', 'Influencer', 'Recognized community influencer and advocate', '/badges/influencer.svg', 'SPECIAL', '{"manual": true}', true, '2026-01-17 10:24:19.650001+00', 'USER'),
	('6ebf3ce6-bff4-4f0f-9045-87a1b7e0df16', 'TEAM_ADMIN', 'Team Admin', 'SELSIPAD Platform Administrator', '/badges/team-admin.svg', 'SPECIAL', '{"manual": true, "internal_only": true}', true, '2026-01-17 10:24:19.650001+00', 'USER'),
	('6f540d42-0eb7-4130-aab7-c74971d84bfb', 'TEAM_MOD', 'Team Moderator', 'SELSIPAD Community Moderator', '/badges/team-mod.svg', 'SPECIAL', '{"manual": true, "internal_only": true}', true, '2026-01-17 10:24:19.650001+00', 'USER'),
	('0ccda699-d526-4ff4-985d-ddd11c70a775', 'TEAM_IT_PROGRAMMER', 'Team Developer', 'SELSIPAD Platform Developer', '/badges/team-dev.svg', 'SPECIAL', '{"manual": true, "internal_only": true}', true, '2026-01-17 10:24:19.650001+00', 'USER'),
	('3c86da70-cc22-4c2f-b987-b4873d142880', 'TEAM_CEO', 'Team CEO', 'SELSIPAD Chief Executive Officer', '/badges/team-ceo.svg', 'SPECIAL', '{"manual": true, "internal_only": true}', true, '2026-01-17 10:24:19.650001+00', 'USER'),
	('a0e15929-ec0a-45ed-9b99-d99c40dffeeb', 'TEAM_MARKETING', 'Team Marketing', 'SELSIPAD Marketing Team', '/badges/team-marketing.svg', 'SPECIAL', '{"manual": true, "internal_only": true}', true, '2026-01-17 10:24:19.650001+00', 'USER'),
	('b4852ba2-0e27-40a2-aad1-62c034a0ef88', 'ACTIVE_CONTRIBUTOR', 'Active Contributor', 'Participated in 5+ successful rounds', '/badges/active-contributor.svg', 'MILESTONE', '{"threshold": "5_successful_rounds"}', true, '2026-01-17 10:24:19.650001+00', 'USER'),
	('ce7eef96-122d-4780-8639-16bfea73a833', 'DIAMOND_HANDS', 'Diamond Hands', 'Never sold early - held tokens through vesting', '/badges/diamond-hands.svg', 'SPECIAL', '{"manual": true}', true, '2026-01-17 10:24:19.650001+00', 'USER'),
	('406605ae-65fb-4361-9e8c-d743b92bfbcf', 'EARLY_BIRD', 'Early Bird', 'Contributed in first 24 hours of round', '/badges/early-bird.svg', 'MILESTONE', '{"auto": true}', true, '2026-01-17 10:24:19.650001+00', 'USER'),
	('4ea30d96-1933-45ae-85aa-986ad5a07e5f', 'PROJECT_AUDITED', 'Project Audited', 'Smart contract has passed security audit or is deployed from audited template', '/badges/project-audited.svg', 'SECURITY', '{}', true, '2026-01-17 14:29:30.329739+00', 'PROJECT'),
	('421a4a31-868f-43f0-8fb9-b69b071d7edc', 'SECURITY_AUDITED', 'Security Audited', 'Professional security audit completed by recognized firm', '/badges/security-audited.svg', 'SECURITY', '{}', true, '2026-01-17 14:29:30.329739+00', 'PROJECT'),
	('0f7c8e93-6ba3-470a-bfb3-3d671a1aa1ed', 'DEVELOPER_KYC_VERIFIED', 'Developer KYC Verified', 'Verified developer eligible to create launchpad projects', '/badges/dev-kyc.svg', 'KYC', '{}', true, '2026-01-17 20:26:21.217491+00', 'USER'),
	('3f9a9927-9f7c-4662-a0dd-c5d627fd08ab', 'SAFU_TOKEN', 'SAFU', 'Token created via Selsipad TokenFactory with standard security features', '/badges/safu.svg', 'SECURITY', '{"requirement": "Token created through platform TokenFactory", "trust_level": "PLATFORM_VERIFIED"}', true, '2026-01-23 11:49:42.728727+00', 'PROJECT');


--
-- Data for Name: badge_instances; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."badge_instances" ("id", "user_id", "badge_id", "status", "awarded_at", "awarded_by", "revoked_at", "revoked_by", "expires_at", "award_reason", "revoke_reason", "metadata", "created_at", "updated_at") VALUES
	('9df79f47-6d15-484d-9588-b0c7a002ead5', '12b5434b-c4b5-4364-9f43-0d1074c35e92', '3e02bcc3-62b3-4c7b-937a-4701c13ff155', 'ACTIVE', '2026-01-17 11:33:54.349788+00', '12b5434b-c4b5-4364-9f43-0d1074c35e92', NULL, NULL, NULL, 'Over the last months, we’ve been building massively.

Early developers are already deploying Agents inside Teneo Protocol.
Today, the Agent Console opens to everyone.
This is where Agents come to life.

Step inside, try Agents, and see them respond in real time.
A live Testnet environment.', NULL, '{}', '2026-01-17 11:33:54.349788+00', '2026-01-17 11:33:54.349788+00'),
	('dbc48924-dbce-4adc-b0c1-15753ae4808b', '12b5434b-c4b5-4364-9f43-0d1074c35e92', '0f7c8e93-6ba3-470a-bfb3-3d671a1aa1ed', 'ACTIVE', '2026-01-18 05:15:26.266616+00', '12b5434b-c4b5-4364-9f43-0d1074c35e92', NULL, NULL, NULL, 'kakakakakakka', NULL, '{}', '2026-01-18 05:15:26.266616+00', '2026-01-18 05:15:26.266616+00'),
	('a18c2e13-2ef6-4f32-934c-7a64ef156539', 'ea044662-4135-48a6-a84d-c6d507bb052e', '0f7c8e93-6ba3-470a-bfb3-3d671a1aa1ed', 'ACTIVE', '2026-01-15 19:55:31.162+00', NULL, NULL, NULL, NULL, 'Synced from profiles.kyc_status', NULL, '{}', '2026-01-18 05:34:45.865347+00', '2026-01-18 05:34:45.865347+00'),
	('58b817b2-ebf9-44ec-af29-5ce5573f6b78', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23', '0f7c8e93-6ba3-470a-bfb3-3d671a1aa1ed', 'ACTIVE', '2026-02-03 04:02:36.387025+00', NULL, NULL, NULL, NULL, 'Auto-awarded from profile KYC verification', NULL, '{}', '2026-02-03 04:02:36.387025+00', '2026-02-03 04:02:36.387025+00');


--
-- Data for Name: bluecheck_purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: created_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: launch_rounds; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."launch_rounds" ("id", "project_id", "type", "chain", "token_address", "raise_asset", "start_at", "end_at", "status", "result", "kyc_status_at_submit", "scan_status_at_submit", "params", "total_raised", "total_participants", "rejection_reason", "approved_by", "approved_at", "finalized_by", "finalized_at", "created_by", "created_at", "updated_at", "vesting_status", "lock_status", "success_gated_at", "reviewed_by", "reviewed_at", "sale_type", "fee_splitter_address", "chain_id", "round_address", "vesting_vault_address", "schedule_salt", "merkle_root", "tge_timestamp", "created_token_id", "listing_premium_bps", "final_price", "listing_price", "tokens_deposited_at", "security_badges", "token_source", "pool_address", "contract_address", "deployment_status", "verification_status", "deployment_tx_hash", "deployment_block_number", "deployer_address", "deployed_at", "verification_guid", "verified_at", "verification_attempts", "verification_error", "tokens_funded_at", "funding_tx_hash", "escrow_tx_hash", "escrow_amount", "creation_fee_paid", "creation_fee_tx_hash", "admin_deployer_id", "paused_at", "pause_reason", "last_verification_error", "vesting_verification_status", "vesting_verified_at") VALUES
	('a8cd1c43-afb5-4eda-9bb5-05cb9e36d1a9', '88bdbe1a-be98-46e4-aa67-4ab34e7a9138', 'FAIRLAUNCH', '97', '0xD1075a79C7D89c22dF6A6b79D3bA40C8976BD5AE', 'NATIVE', '2026-02-03 12:00:00+00', '2026-02-03 20:35:17.716787+00', 'ENDED', 'NONE', NULL, NULL, '{"hardcap": null, "softcap": "3", "dex_platform": "PancakeSwap", "lp_lock_months": 12, "tokens_for_sale": "450000", "vesting_address": "0xae6655e1c047a5860edd643897d313edaa2b9f41", "liquidity_tokens": "360000", "max_contribution": "2.5", "min_contribution": "1", "vesting_schedule": [{"month": 0, "percentage": 8.34}, {"month": 1, "percentage": 8.34}, {"month": 2, "percentage": 8.34}, {"month": 3, "percentage": 8.34}, {"month": 4, "percentage": 8.33}, {"month": 5, "percentage": 8.33}, {"month": 6, "percentage": 8.33}, {"month": 7, "percentage": 8.33}, {"month": 8, "percentage": 8.33}, {"month": 9, "percentage": 8.33}, {"month": 10, "percentage": 8.33}, {"month": 11, "percentage": 8.33}], "liquidity_percent": 80, "team_vesting_tokens": "170000", "listing_price_premium_bps": 0}', 3.5, 3, NULL, NULL, NULL, NULL, NULL, 'a0f64677-e16a-4880-bfaa-d4e4d8211d23', '2026-02-03 00:32:54.342661+00', '2026-02-03 20:52:26.85653+00', 'NONE', 'NONE', NULL, '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '2026-02-03 00:34:16.092+00', 'fairlaunch', NULL, 97, NULL, '0xF20039bd683205125994404Ca6b0a4582BCcB3BA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, '0x612f1d8D7184EdcD7a017E5990B477498BCfbB0f', 'PENDING_FUNDING', 'VERIFICATION_PENDING', '0x2f9c98cb2b364e64b162359d1f9bdb327f2267979ce169806cc02f44fdb295ed', NULL, NULL, '2026-02-03 00:35:15.173+00', NULL, NULL, 0, NULL, NULL, NULL, '0xe550a05f55dd39ca10b380ed0a3a19f20b4cca3c7fca0e41875d80dcf447a5f9', 980000, 200000000000000000, '0x5c0181e436f3bd74d4ce4468dbb4c03e6aa2a9541cd696bc7c8c4735cd36b997', NULL, NULL, NULL, NULL, 'VERIFICATION_PENDING', NULL),
	('60966f2f-b356-4188-9e73-2e26fcbad1cf', 'f1ef72e4-0955-4c8a-9d5b-be19b5a99db6', 'FAIRLAUNCH', '97', '0x70bfEAF0351F1a31AC88dee1D20f32DB26cb8f61', 'NATIVE', '2026-02-03 04:26:00+00', '2026-02-04 01:23:00+00', 'FAILED', 'NONE', NULL, NULL, '{"hardcap": null, "softcap": "5", "dex_platform": "PancakeSwap", "lp_lock_months": 12, "tokens_for_sale": "400000", "vesting_address": "0xac89bf746daf1c782ed87e81a89fe8885cf979f5", "liquidity_tokens": "320000", "max_contribution": "2", "min_contribution": "0.5", "vesting_schedule": [{"month": 0, "percentage": 8.34}, {"month": 1, "percentage": 8.34}, {"month": 2, "percentage": 8.34}, {"month": 3, "percentage": 8.34}, {"month": 4, "percentage": 8.33}, {"month": 5, "percentage": 8.33}, {"month": 6, "percentage": 8.33}, {"month": 7, "percentage": 8.33}, {"month": 8, "percentage": 8.33}, {"month": 9, "percentage": 8.33}, {"month": 10, "percentage": 8.33}, {"month": 11, "percentage": 8.33}], "liquidity_percent": 80, "team_vesting_tokens": "250000", "listing_price_premium_bps": 0}', 4.5, 3, NULL, NULL, NULL, NULL, NULL, 'd18dfb9d-233c-4320-b3b8-90b01b327cde', '2026-02-02 18:24:52.448207+00', '2026-02-04 02:08:51.649103+00', 'NONE', 'NONE', NULL, '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '2026-02-02 18:25:57.114+00', 'fairlaunch', NULL, 97, NULL, '0x7569FB18779640AE070bCF40350f34aa83B986C7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, '0x768dfDfF4Af142Ad4DEf29f2CAba2c89eF411102', 'PENDING_FUNDING', 'VERIFICATION_PENDING', '0xdac786f38f0e6e04745b117fd8249aa4e8e4bef8f30691f1c1e3e63a45730e84', NULL, NULL, '2026-02-02 18:26:47.862+00', NULL, NULL, 0, NULL, NULL, NULL, '0x8050550e5d728c62c52678d3e97d8c71324475942dd7fa43c358ed7e45f89df3', 970000, 200000000000000000, '0x6abab542e7d4eca92e4f6444d806399e324a57f9f05dd9161f94deae4e7898fd', NULL, NULL, NULL, NULL, 'VERIFICATION_PENDING', NULL),
	('b402d42e-21f4-4bc0-a9de-5009e368479d', '328c1036-8377-490d-af21-6644f45d5cfe', 'FAIRLAUNCH', '97', '0xC0039278B7d27d99F92F8F7Fa132b2c0E5ae3895', 'NATIVE', '2026-02-04 17:00:00+00', '2026-02-05 01:00:00+00', 'DEPLOYED', 'NONE', NULL, NULL, '{"hardcap": null, "softcap": "5", "dex_platform": "PancakeSwap", "lp_lock_months": 12, "tokens_for_sale": "4500000", "vesting_address": "0xae6655e1c047a5860edd643897d313edaa2b9f41", "liquidity_tokens": "3150000", "max_contribution": "2", "min_contribution": "0.5", "vesting_schedule": [{"month": 0, "percentage": 8.34}, {"month": 1, "percentage": 8.34}, {"month": 2, "percentage": 8.34}, {"month": 3, "percentage": 8.34}, {"month": 4, "percentage": 8.33}, {"month": 5, "percentage": 8.33}, {"month": 6, "percentage": 8.33}, {"month": 7, "percentage": 8.33}, {"month": 8, "percentage": 8.33}, {"month": 9, "percentage": 8.33}, {"month": 10, "percentage": 8.33}, {"month": 11, "percentage": 8.33}], "liquidity_percent": 70, "team_vesting_tokens": "2200000", "listing_price_premium_bps": 0}', 0, 0, NULL, NULL, NULL, NULL, NULL, 'a0f64677-e16a-4880-bfaa-d4e4d8211d23', '2026-02-04 06:01:15.14601+00', '2026-02-04 06:08:09.197251+00', 'NONE', 'NONE', NULL, '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '2026-02-04 06:07:17.855+00', 'fairlaunch', NULL, 97, NULL, '0xc7fD64c7B84124d3cC63026F30314E9d2CE09bD2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', NULL, NULL, '0xdc085a8142AACf0D5217A2ae252cf4d6A4263615', 'PENDING_FUNDING', 'VERIFICATION_PENDING', '0xf208405bd4f01bf61da72b6d1880e2a75d8bb64304de1ccc9a61611ff519aab2', NULL, NULL, '2026-02-04 06:08:09.137+00', NULL, NULL, 0, NULL, NULL, NULL, '0x3a191c019a6756aed82b3688733132c55c398d0dbe3aeff26012315f6712297d', 9850000, 200000000000000000, '0xd31dcdde8932356c10db3697f552727b3bd24876a33869c8770a3494a061cc89', NULL, NULL, NULL, NULL, 'VERIFICATION_PENDING', NULL);


--
-- Data for Name: liquidity_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: bonding_pools; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: bonding_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: bonding_swaps; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."posts" ("id", "author_id", "project_id", "content", "type", "parent_post_id", "quoted_post_id", "reposted_post_id", "created_at", "updated_at", "deleted_at", "deleted_by", "view_count", "like_count", "comment_count", "repost_count", "share_count", "edit_count", "last_edited_at", "image_urls", "hashtags") VALUES
	('2081cd1d-7024-4b39-a18f-f3e3e62c8c5c', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'cek cek bluecheck ', 'POST', NULL, NULL, NULL, '2026-01-22 00:44:14.04806+00', '2026-01-22 01:16:54.705851+00', '2026-01-22 01:16:54.612+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 7, 1, 0, 0, 0, 0, NULL, '{}', NULL),
	('6804c52f-1f5b-46f0-8dfd-d477a2d7d90f', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'cek1', 'POST', NULL, NULL, NULL, '2026-01-22 01:12:19.28829+00', '2026-01-22 01:16:57.80285+00', '2026-01-22 01:16:57.733+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 3, 0, 0, 0, 0, 0, NULL, '{}', NULL),
	('cdec46c6-87bd-4650-8566-d89a4407eb1c', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'test2', 'POST', NULL, NULL, NULL, '2026-01-22 01:13:28.309664+00', '2026-01-22 01:17:00.688246+00', '2026-01-22 01:17:00.623+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 1, 0, 0, 0, 0, 0, NULL, '{}', NULL),
	('3b4cc029-776d-4e0f-948e-4ffa7b023a7e', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '💯💯🥳', 'POST', NULL, NULL, NULL, '2026-01-26 20:48:11.470077+00', '2026-02-04 03:43:05.23626+00', NULL, NULL, 24, 2, 0, 0, 0, 0, NULL, '{https://tkmlclijfinaqtphojkb.supabase.co/storage/v1/object/public/public-files/posts/1769460455835-r6nffk.png}', NULL),
	('923d2db0-4d4a-40af-8121-16aa7084240e', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'fairlaunch 
#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:14.223847+00', '2026-02-04 03:42:58.734327+00', NULL, NULL, 32, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('971663c7-00f3-4bb1-b2ce-d63949285041', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'rx7', 'POST', NULL, NULL, NULL, '2026-01-26 23:53:40.514863+00', '2026-01-27 00:58:10.586671+00', '2026-01-27 00:58:10.527+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 2, 0, 0, 0, 0, 0, NULL, '{https://tkmlclijfinaqtphojkb.supabase.co/storage/v1/object/public/public-files/posts/1769471610701-v1xuqq.jpg}', NULL),
	('a1b65b38-5609-49e9-b618-28a2f3337a54', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'test post with image', 'POST', NULL, NULL, NULL, '2026-01-26 21:03:14.529096+00', '2026-01-27 00:58:15.012297+00', '2026-01-27 00:58:14.917+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 2, 1, 1, 0, 0, 0, NULL, '{https://tkmlclijfinaqtphojkb.supabase.co/storage/v1/object/public/public-files/posts/1769461374263-pbxy0h.png}', NULL),
	('990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'greate
#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:54:55.135832+00', '2026-02-04 03:43:00.508066+00', NULL, NULL, 28, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('15e799db-9ac4-492e-9196-243cfae9b306', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'nice
#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:54:32.174485+00', '2026-02-04 03:43:02.7164+00', NULL, NULL, 28, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('a4cc27cd-89bb-41f7-900a-dd79fa8296c1', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:32.521855+00', '2026-01-30 07:03:34.621443+00', '2026-01-30 07:03:34.563+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('cb0222e5-e841-4198-bd55-cdc69f654d6a', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:29.855685+00', '2026-01-30 07:03:37.964693+00', '2026-01-30 07:03:37.903+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('2656bb53-24b2-4786-89fa-bb8c71534a30', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:56:01.69442+00', '2026-01-30 07:03:00.12885+00', '2026-01-30 07:03:00.028+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('35288352-f74d-47a3-a848-6ac46d9c2a61', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'bullish', 'POST', NULL, NULL, NULL, '2026-01-26 20:53:19.308091+00', '2026-01-30 06:51:52.341394+00', '2026-01-30 06:51:52.014+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 4, 4, 1, 0, 0, 0, NULL, '{https://tkmlclijfinaqtphojkb.supabase.co/storage/v1/object/public/public-files/posts/1769460777443-vodxr.jpg}', NULL),
	('ec5942df-2b3a-458d-8055-f10952db9499', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '😅', 'POST', NULL, NULL, NULL, '2026-01-26 20:48:56.775031+00', '2026-01-30 06:51:58.233661+00', '2026-01-30 06:51:58.125+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 4, 2, 0, 0, 0, 0, NULL, '{https://tkmlclijfinaqtphojkb.supabase.co/storage/v1/object/public/public-files/posts/1769460521960-fl92fq.jpg}', NULL),
	('bc4c7831-cf73-44fe-b9f2-43c2cb2b8cb6', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'test3', 'POST', NULL, NULL, NULL, '2026-01-22 01:16:00.043724+00', '2026-01-30 06:52:04.102531+00', '2026-01-30 06:52:03.981+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 5, 0, 1, 0, 0, 0, NULL, '{}', NULL),
	('c445645c-9b0c-443e-87d2-cac42dbd120f', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:59.346523+00', '2026-01-30 07:03:02.797861+00', '2026-01-30 07:03:02.72+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('32de4977-e104-440e-a009-98eb5a516b52', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:56.994943+00', '2026-01-30 07:03:05.234761+00', '2026-01-30 07:03:05.148+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('de2c2128-de15-4941-beb5-8f3f51bf9c86', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:47.16862+00', '2026-01-30 07:03:15.494335+00', '2026-01-30 07:03:15.425+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('7c12142b-8b55-4cb4-b149-2255235ec605', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:44.798501+00', '2026-01-30 07:03:18.39275+00', '2026-01-30 07:03:18.329+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('1a20ed67-f00c-43c5-9fbf-f0ce5b7e4383', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:42.448536+00', '2026-01-30 07:03:21.227614+00', '2026-01-30 07:03:21.148+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('d0510eeb-5027-4484-a60b-1165365e26cf', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:40.02917+00', '2026-01-30 07:03:23.9493+00', '2026-01-30 07:03:23.878+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('14cfe322-b04a-4404-8ce2-6ffd8172979b', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:37.603243+00', '2026-01-30 07:03:28.903644+00', '2026-01-30 07:03:28.798+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('f5b94af6-9e2a-4735-8d64-d8b5947f60f4', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:53.787309+00', '2026-01-30 07:03:07.676397+00', '2026-01-30 07:03:07.591+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('f7fea673-1305-4344-8db3-222b758c1ffd', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:51.459174+00', '2026-01-30 07:03:10.172298+00', '2026-01-30 07:03:10.099+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('47d526cb-9c91-4036-854e-666faac32e24', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:49.34638+00', '2026-01-30 07:03:12.74542+00', '2026-01-30 07:03:12.66+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('5fa53cd8-542d-40ae-a041-85c82795bca3', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:55:35.131307+00', '2026-01-30 07:03:31.957009+00', '2026-01-30 07:03:31.888+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('f1151116-1dcf-4746-8fe3-93b96b1b5b64', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'bull
#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:54:13.929831+00', '2026-02-04 03:43:03.84161+00', NULL, NULL, 23, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('40905c46-4ddb-4b92-9175-72eacafa5e8c', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'bullish 
#JMT2 🔥', 'POST', NULL, NULL, NULL, '2026-01-30 06:53:48.259756+00', '2026-02-04 03:43:04.710412+00', NULL, NULL, 22, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('ed24c310-b7bb-43a3-b2f7-480e0cfcedc2', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, 'love #JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:56:25.742498+00', '2026-01-30 07:02:51.760355+00', '2026-01-30 07:02:51.544+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 1, '2026-01-30 07:01:57.275+00', '{}', '{#jmt2}'),
	('cef28783-cfd4-4b69-a2ef-c16febee3ab4', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:56:23.324149+00', '2026-01-30 07:02:54.820974+00', '2026-01-30 07:02:54.676+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}'),
	('80db9a41-9a75-43b5-97f3-9c1bb5a7b25b', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, '#JMT2', 'POST', NULL, NULL, NULL, '2026-01-30 06:56:20.810695+00', '2026-01-30 07:02:57.424052+00', '2026-01-30 07:02:57.344+00', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', 6, 0, 0, 0, 0, 0, NULL, '{}', '{#jmt2}');


--
-- Data for Name: post_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."post_comments" ("id", "post_id", "author_id", "content", "parent_comment_id", "created_at", "updated_at", "deleted_at", "like_count") VALUES
	('8a14c15d-ca32-4dd6-abc3-acb0d8ca780e', 'bc4c7831-cf73-44fe-b9f2-43c2cb2b8cb6', '662d0695-3725-45c4-9802-7c1d16adb42a', 'why sir?', NULL, '2026-01-26 03:07:06.234185+00', '2026-01-26 03:07:06.234185+00', NULL, 0),
	('ad1ec223-d18e-4eca-aa32-711465ae3e1e', '35288352-f74d-47a3-a848-6ac46d9c2a61', '0487f51f-f7ee-4fe8-9eb0-f58312676387', 'nicee', NULL, '2026-01-26 20:59:42.771838+00', '2026-01-26 20:59:42.771838+00', NULL, 0),
	('d8616b09-771b-4f28-96e9-2d2ad3c2b6b0', 'a1b65b38-5609-49e9-b618-28a2f3337a54', '0487f51f-f7ee-4fe8-9eb0-f58312676387', 'niceee', NULL, '2026-01-26 21:08:09.957135+00', '2026-01-26 21:08:09.957135+00', NULL, 0);


--
-- Data for Name: comment_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: contract_audit_proofs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: contributions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."contributions" ("id", "round_id", "user_id", "wallet_address", "amount", "chain", "tx_hash", "tx_id", "status", "created_at", "confirmed_at", "claimed_at", "claim_tx_hash") VALUES
	('71617b61-0fa4-4259-8c8d-946e3e641a99', 'a8cd1c43-afb5-4eda-9bb5-05cb9e36d1a9', NULL, '0x25b21c43112f196cd33b467279d737ef5733b175', 1.0, '97', '0xbbed33748d019973623d85801001ba72714c0b47d4983530c8f636d25962a5a8', NULL, 'CONFIRMED', '2026-02-03 19:40:40+00', '2026-02-03 19:40:40+00', NULL, NULL),
	('82240ead-b35c-42f9-88fc-75a7daf0609f', 'a8cd1c43-afb5-4eda-9bb5-05cb9e36d1a9', NULL, '0xfd761f29d6c3dfc36fe21f5dc3ff5e14f08ebcb4', 1.5, '97', '0xf14fb6d4e138ed84ebae4e9d4f790b9a1b94bfad00160bc908c302a28c09a848', NULL, 'CONFIRMED', '2026-02-03 19:56:09+00', '2026-02-03 19:56:09+00', NULL, NULL),
	('0ba270bd-8b2f-4fa7-82bc-7d57632cb618', 'a8cd1c43-afb5-4eda-9bb5-05cb9e36d1a9', NULL, '0xf2b44e1d609f662efd8c8765a2d8fd56bbe1ab95', 1.0, '97', '0x5effec10e29e57b7f4e064e2ca4fcb03a1296a68dd78d82a40df131e922a47dd', NULL, 'CONFIRMED', '2026-02-03 20:13:15.269555+00', '2026-02-03 20:13:15.269555+00', NULL, NULL),
	('8ab8cb9c-837c-4e51-92bd-96a6d2c1faef', '60966f2f-b356-4188-9e73-2e26fcbad1cf', NULL, '0x5058c7ee137626c1e7e0fdfcbba998a2f84ba400', 2.0, '97', '0xe56a51bc1c57c311eb5ef3015816b09fb61c68e96f77826028e52e0c312fc662', NULL, 'CONFIRMED', '2026-02-03 23:13:30.816458+00', NULL, NULL, NULL),
	('d3709591-8f4d-4675-b7d9-c56d176bdc3e', '60966f2f-b356-4188-9e73-2e26fcbad1cf', NULL, '0x9a0d7dc7a0348c1b0b2d04c25ab6398bd5819551', 2.0, '97', '0xf5278e3fbdb15382737ba70db66215854bdd311e6695b3875b60270e5653b327', NULL, 'CONFIRMED', '2026-02-03 23:23:47.909848+00', NULL, NULL, NULL),
	('64cb6e43-8438-4f69-b84a-aca22ba4bc12', '60966f2f-b356-4188-9e73-2e26fcbad1cf', NULL, '0x1295f65b7c6aef8f708cc700b129788e26a039e2', 0.5, '97', '0xc2137e86d24d7e42933be456eafdf2eeb04c79ea2f9b381aa226f2c0c6da9dae', NULL, 'CONFIRMED', '2026-02-03 23:33:13.610995+00', NULL, NULL, NULL);


--
-- Data for Name: dex_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: fee_splits; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: kyc_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."kyc_submissions" ("id", "user_id", "project_id", "submission_type", "status", "documents_url", "reviewed_by", "reviewed_at", "rejection_reason", "metadata", "created_at", "updated_at") VALUES
	('ad2a6835-9b27-48d8-a7e8-e62455983a3e', 'ea044662-4135-48a6-a84d-c6d507bb052e', NULL, 'INDIVIDUAL', 'PENDING', '["ea044662-4135-48a6-a84d-c6d507bb052e/1768506428345/id-front-1768506427453.jpg","ea044662-4135-48a6-a84d-c6d507bb052e/1768506428345/id-back-1768506427454.jpg","ea044662-4135-48a6-a84d-c6d507bb052e/1768506428345/selfie-1768506427455.jpg"]', NULL, NULL, NULL, '{}', '2026-01-15 19:47:10.514336+00', '2026-01-15 19:47:10.514336+00'),
	('4dbf86c2-7f54-411a-8e39-b56219f44d1b', 'ea044662-4135-48a6-a84d-c6d507bb052e', NULL, 'INDIVIDUAL', 'PENDING', '["ea044662-4135-48a6-a84d-c6d507bb052e/1768506528999/id-front-1768506527357.jpg","ea044662-4135-48a6-a84d-c6d507bb052e/1768506528999/id-back-1768506527358.jpg","ea044662-4135-48a6-a84d-c6d507bb052e/1768506528999/selfie-1768506527359.jpg"]', NULL, NULL, NULL, '{}', '2026-01-15 19:48:51.073049+00', '2026-01-15 19:48:51.073049+00'),
	('1499293b-e8ec-4580-a939-87cc636b3f79', 'ea044662-4135-48a6-a84d-c6d507bb052e', NULL, 'INDIVIDUAL', 'PENDING', '["ea044662-4135-48a6-a84d-c6d507bb052e/1768506928976/id-front-1768506928068.jpg","ea044662-4135-48a6-a84d-c6d507bb052e/1768506928976/id-back-1768506928069.jpg","ea044662-4135-48a6-a84d-c6d507bb052e/1768506928976/selfie-1768506928070.jpg"]', NULL, NULL, NULL, '{}', '2026-01-15 19:55:31.097812+00', '2026-01-15 19:55:31.097812+00'),
	('16fddf30-4cea-412f-b511-9d207d157128', 'ba2226fb-d798-4d83-9ddb-fc67fdf6bb00', NULL, 'INDIVIDUAL', 'PENDING', '["ba2226fb-d798-4d83-9ddb-fc67fdf6bb00/1768982890541/id-front-1768982888127.jpg","ba2226fb-d798-4d83-9ddb-fc67fdf6bb00/1768982890541/id-back-1768982888129.jpg","ba2226fb-d798-4d83-9ddb-fc67fdf6bb00/1768982890541/selfie-1768982888130.jpg"]', NULL, NULL, NULL, '{}', '2026-01-21 08:08:13.000354+00', '2026-01-21 08:08:13.000354+00'),
	('2d03d96a-01c9-47a6-b5b4-bc22f9b07944', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23', NULL, 'INDIVIDUAL', 'APPROVED', '["a0f64677-e16a-4880-bfaa-d4e4d8211d23/1770091034934/id-front-1770091033905.jpg","a0f64677-e16a-4880-bfaa-d4e4d8211d23/1770091034934/id-back-1770091033907.jpg","a0f64677-e16a-4880-bfaa-d4e4d8211d23/1770091034934/selfie-1770091033909.jpg"]', '71511ed3-d098-4e1d-90f2-a0e48cfb5832', '2026-02-03 03:58:39.309+00', NULL, '{}', '2026-02-03 03:57:16.605703+00', '2026-02-03 03:58:39.368639+00');


--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."post_likes" ("id", "post_id", "user_id", "created_at") VALUES
	('6d11e18f-b6f2-4cb5-af4a-7b33c019c1f5', '2081cd1d-7024-4b39-a18f-f3e3e62c8c5c', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', '2026-01-22 00:44:19.088976+00'),
	('f0844474-3282-47e2-b499-a7a4bdedf446', '35288352-f74d-47a3-a848-6ac46d9c2a61', '0487f51f-f7ee-4fe8-9eb0-f58312676387', '2026-01-26 20:59:26.593147+00'),
	('14459985-d10d-4d56-ae54-82f8ea9e49e7', 'a1b65b38-5609-49e9-b618-28a2f3337a54', '0487f51f-f7ee-4fe8-9eb0-f58312676387', '2026-01-26 21:07:14.481175+00'),
	('75f7891b-d3b4-4a62-81d2-6a076e57c840', 'ec5942df-2b3a-458d-8055-f10952db9499', '0487f51f-f7ee-4fe8-9eb0-f58312676387', '2026-01-26 21:07:16.665055+00'),
	('97f8733e-62bf-4574-b60a-4669b325296c', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', '0487f51f-f7ee-4fe8-9eb0-f58312676387', '2026-01-26 21:07:18.175707+00'),
	('b031d075-d4c7-4ac9-99bb-1cc6f4908807', '35288352-f74d-47a3-a848-6ac46d9c2a61', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', '2026-01-27 00:27:19.140398+00'),
	('c2ce3500-43bd-4ea1-8dfb-79f8cd73d68e', '35288352-f74d-47a3-a848-6ac46d9c2a61', '8c1dd323-de22-48e2-9cab-9b71781c6f77', '2026-01-27 03:36:02.193652+00'),
	('3aab0e8f-9022-429d-95bb-b22f8d08862e', '35288352-f74d-47a3-a848-6ac46d9c2a61', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', '2026-01-29 14:27:28.703184+00'),
	('cc9e32bd-602e-447b-bd85-ae8e8eb32089', 'ec5942df-2b3a-458d-8055-f10952db9499', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', '2026-01-29 14:27:30.320196+00'),
	('04072019-39b8-4765-920c-a3aeaed82498', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', '2026-01-29 14:27:31.979884+00');


--
-- Data for Name: post_reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: post_shares; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: post_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."post_views" ("id", "post_id", "user_id", "session_id", "ip_address", "viewed_at") VALUES
	('9ee4237c-cda5-440f-bdc3-1c49330c1738', '923d2db0-4d4a-40af-8121-16aa7084240e', 'e40815c0-69a4-4c65-a80b-c5f5f57711ab', NULL, NULL, '2026-01-31 03:44:17.801285+00'),
	('25006bbc-4ac7-4287-bc0c-a6711f5a19ed', 'c445645c-9b0c-443e-87d2-cac42dbd120f', NULL, NULL, NULL, '2026-01-30 06:59:36.273927+00'),
	('1dbcf3b3-299e-44c3-810b-275e1923ef84', '7c12142b-8b55-4cb4-b149-2255235ec605', NULL, NULL, NULL, '2026-01-30 06:59:37.836711+00'),
	('0ba17e44-e184-458f-9cd1-28a6e3602c58', 'cb0222e5-e841-4198-bd55-cdc69f654d6a', NULL, NULL, NULL, '2026-01-30 06:59:39.682285+00'),
	('5544f8fa-688c-4627-ba27-6a091b7f6396', '80db9a41-9a75-43b5-97f3-9c1bb5a7b25b', NULL, NULL, NULL, '2026-01-30 06:59:41.878103+00'),
	('f216796f-cf39-4a14-96c5-7e69016c414d', '47d526cb-9c91-4036-854e-666faac32e24', NULL, NULL, NULL, '2026-01-30 06:59:43.692488+00'),
	('2fc36a21-887b-4d64-a311-1754e1eeeadb', '35288352-f74d-47a3-a848-6ac46d9c2a61', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-26 20:53:19.7236+00'),
	('7b38cef0-4290-4b16-ad40-37b269958bf1', '5fa53cd8-542d-40ae-a041-85c82795bca3', NULL, NULL, NULL, '2026-01-30 06:59:45.514119+00'),
	('d9a32d3d-f7ce-44af-aa05-b719e467d513', '2081cd1d-7024-4b39-a18f-f3e3e62c8c5c', NULL, NULL, NULL, '2026-01-22 01:09:58.781399+00'),
	('b59c87bc-69d2-4460-81ab-c14a67d80df4', '2081cd1d-7024-4b39-a18f-f3e3e62c8c5c', NULL, NULL, NULL, '2026-01-22 01:09:58.978105+00'),
	('318ba64b-1779-4eb6-930b-5783766dd1d9', '2081cd1d-7024-4b39-a18f-f3e3e62c8c5c', NULL, NULL, NULL, '2026-01-22 01:11:01.832893+00'),
	('ada741c1-d263-45e6-8d91-7478eb54af73', '2081cd1d-7024-4b39-a18f-f3e3e62c8c5c', NULL, NULL, NULL, '2026-01-22 01:11:02.051863+00'),
	('7ced007b-ff90-45e4-9b9d-65ac20f0531a', '35288352-f74d-47a3-a848-6ac46d9c2a61', '0487f51f-f7ee-4fe8-9eb0-f58312676387', NULL, NULL, '2026-01-26 20:54:02.582128+00'),
	('07bd38f2-e5c6-47da-a4bd-f404ee953329', 'ec5942df-2b3a-458d-8055-f10952db9499', '0487f51f-f7ee-4fe8-9eb0-f58312676387', NULL, NULL, '2026-01-26 20:54:06.429088+00'),
	('077a10b0-9b9e-4415-b98e-3e8cef19f349', '6804c52f-1f5b-46f0-8dfd-d477a2d7d90f', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-22 01:12:19.846942+00'),
	('8a265b16-623d-4172-a65f-830b6b29885d', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', '0487f51f-f7ee-4fe8-9eb0-f58312676387', NULL, NULL, '2026-01-26 20:54:06.974982+00'),
	('912872fe-e0a6-438d-a465-d78e9a2eb82a', '6804c52f-1f5b-46f0-8dfd-d477a2d7d90f', NULL, NULL, NULL, '2026-01-22 01:13:07.037645+00'),
	('fab16e1b-22bb-4679-a701-9b55177f4809', '2081cd1d-7024-4b39-a18f-f3e3e62c8c5c', NULL, NULL, NULL, '2026-01-22 01:13:07.543663+00'),
	('31b7553c-7d8f-4127-81c4-33c34d479bea', '6804c52f-1f5b-46f0-8dfd-d477a2d7d90f', NULL, NULL, NULL, '2026-01-22 01:13:07.882063+00'),
	('a108a9b8-cbe0-4b87-9972-f4f1a276ade1', '2081cd1d-7024-4b39-a18f-f3e3e62c8c5c', NULL, NULL, NULL, '2026-01-22 01:13:08.061664+00'),
	('81f9dd31-8528-4461-b33d-4582e8956f02', 'cdec46c6-87bd-4650-8566-d89a4407eb1c', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-22 01:13:28.636064+00'),
	('411bed59-f7cb-4aab-96e8-3cf0f6d916bc', 'bc4c7831-cf73-44fe-b9f2-43c2cb2b8cb6', '0487f51f-f7ee-4fe8-9eb0-f58312676387', NULL, NULL, '2026-01-26 20:54:09.664841+00'),
	('be51f3cf-3060-4b68-a525-cab1175fc52b', '2656bb53-24b2-4786-89fa-bb8c71534a30', NULL, NULL, NULL, '2026-01-30 06:59:55.941295+00'),
	('23317ce7-8b1d-41cd-9288-3b62e4a99be9', 'f5b94af6-9e2a-4735-8d64-d8b5947f60f4', NULL, NULL, NULL, '2026-01-30 06:59:56.913351+00'),
	('cca06e85-2ccd-4a04-bb1c-e36d801d44ef', 'de2c2128-de15-4941-beb5-8f3f51bf9c86', NULL, NULL, NULL, '2026-01-30 06:59:58.182685+00'),
	('b7c793e9-feba-4b0a-be79-944eca3e5418', '14cfe322-b04a-4404-8ce2-6ffd8172979b', NULL, NULL, NULL, '2026-01-30 07:00:13.509547+00'),
	('4ea9eb65-1bea-4e56-b610-ffd956f20a2f', 'ed24c310-b7bb-43a3-b2f7-480e0cfcedc2', NULL, NULL, NULL, '2026-01-30 07:00:41.201826+00'),
	('690e5b16-01e3-48f2-91af-b361ab58cc2a', 'cef28783-cfd4-4b69-a2ef-c16febee3ab4', NULL, NULL, NULL, '2026-01-30 07:00:41.559088+00'),
	('0950280e-fc53-4212-b9db-ed953d64d032', 'bc4c7831-cf73-44fe-b9f2-43c2cb2b8cb6', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-22 01:16:00.488761+00'),
	('b1bb910d-0038-41df-b770-e03098431c06', '32de4977-e104-440e-a009-98eb5a516b52', NULL, NULL, NULL, '2026-01-30 07:00:42.78894+00'),
	('b1f5ec04-cc2a-4c28-9a24-75b4a9e94be0', 'f5b94af6-9e2a-4735-8d64-d8b5947f60f4', NULL, NULL, NULL, '2026-01-30 07:00:43.085496+00'),
	('40f40c59-f5f2-4a95-aa56-1f4129e8501d', '1a20ed67-f00c-43c5-9fbf-f0ce5b7e4383', NULL, NULL, NULL, '2026-01-30 07:00:44.53362+00'),
	('89c14313-543e-4136-8acc-244d4a398755', 'a1b65b38-5609-49e9-b618-28a2f3337a54', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-26 21:03:14.927468+00'),
	('4163cff0-2a12-4ec5-afc2-d6e646dceb65', 'd0510eeb-5027-4484-a60b-1165365e26cf', NULL, NULL, NULL, '2026-01-30 07:00:44.852891+00'),
	('2d30e694-cbeb-48ba-ad44-60daba5569ca', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-01-30 07:00:46.448135+00'),
	('44d69574-3596-42ba-a390-07f99c46db20', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-01-30 07:00:46.773539+00'),
	('d789e7d3-620a-4bf0-b3eb-dd5e8e8e3d96', 'bc4c7831-cf73-44fe-b9f2-43c2cb2b8cb6', '662d0695-3725-45c4-9802-7c1d16adb42a', NULL, NULL, '2026-01-26 03:06:29.011731+00'),
	('9f29bd32-26a9-4172-af39-ba1fea406009', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', 'e40815c0-69a4-4c65-a80b-c5f5f57711ab', NULL, NULL, '2026-01-31 03:44:20.092546+00'),
	('e4685b87-8773-4893-b957-83ead45901af', '971663c7-00f3-4bb1-b2ce-d63949285041', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-26 23:53:40.889405+00'),
	('14847574-5955-4e2a-80dc-dddd37495366', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-01-31 09:11:48.126628+00'),
	('2c737b2c-03a9-44b8-bc76-edac1586bada', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-01-31 09:11:49.155777+00'),
	('e8cd8a94-2494-4f2b-b61f-37c6dcfd8ddb', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-01-31 09:11:50.594404+00'),
	('29bbbb84-6c35-4cf8-9a52-b7c449260857', '35288352-f74d-47a3-a848-6ac46d9c2a61', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', NULL, NULL, '2026-01-29 14:27:20.244638+00'),
	('f7a6f015-d2c8-494c-bb86-a62390539b3b', 'ec5942df-2b3a-458d-8055-f10952db9499', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', NULL, NULL, '2026-01-29 14:27:21.521271+00'),
	('64fe528a-4ad6-4e68-acc1-6820271035f3', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', NULL, NULL, '2026-01-29 14:27:22.322121+00'),
	('81a1fca5-ca32-40a6-ab7c-164bb2d1becf', 'bc4c7831-cf73-44fe-b9f2-43c2cb2b8cb6', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', NULL, NULL, '2026-01-29 14:27:23.566082+00'),
	('6491c394-1a09-42cb-8483-6162ade8c838', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-01-31 20:09:00.073379+00'),
	('07587bc6-dbca-421d-b2d5-64c00703ddfd', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-01-31 20:09:02.530166+00'),
	('f1642d32-0504-4587-9ece-64253cb0608e', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-01 08:51:52.999234+00'),
	('c996f977-9894-49f3-946c-46c22aba0483', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', NULL, NULL, '2026-01-30 11:22:30.694949+00'),
	('77a6c020-f0d2-4fbf-95a7-c9ea0d46fd9b', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-01 08:51:54.050625+00'),
	('f8efb7b8-b595-4242-8ec3-2f26d1bf97a0', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-01 20:51:06.275269+00'),
	('1ade3ae1-f620-4728-aa52-94a73c7443a9', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-26 20:48:12.097143+00'),
	('aaf1b040-08b9-43ce-9920-9d7cc46f8959', '40905c46-4ddb-4b92-9175-72eacafa5e8c', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:53:52.352564+00'),
	('4a1dab38-eb2f-4c78-86bd-dc5d47b91264', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-01 20:51:07.011112+00'),
	('3ba3a54c-a5a5-4738-a781-e1339619cf3c', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:54:14.79614+00'),
	('f5ee8da7-70da-428c-be03-39413f7bfe4a', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-01 20:51:08.809154+00'),
	('ff268d62-4043-4102-9528-592ee37890f2', '15e799db-9ac4-492e-9196-243cfae9b306', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:54:32.550466+00'),
	('73574c6a-6702-4a2f-af58-1280b616d951', 'ec5942df-2b3a-458d-8055-f10952db9499', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-26 20:48:57.174873+00'),
	('a888f8b5-4af0-4340-a448-012120f22485', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-01 20:51:10.584655+00'),
	('c24db6bc-a09b-4b32-b46e-98efe81aeca3', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:54:55.612679+00'),
	('b24acf2d-38b9-4b5f-8610-92f54ed1f109', '35288352-f74d-47a3-a848-6ac46d9c2a61', '8c1dd323-de22-48e2-9cab-9b71781c6f77', NULL, NULL, '2026-01-27 03:35:59.356775+00'),
	('e235fcb6-3a3b-4a39-8a15-c021c4c8b0fc', 'ec5942df-2b3a-458d-8055-f10952db9499', '8c1dd323-de22-48e2-9cab-9b71781c6f77', NULL, NULL, '2026-01-27 03:35:59.696858+00'),
	('8393a5c5-cfd9-43a2-b105-48ea0bd0adfc', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', '8c1dd323-de22-48e2-9cab-9b71781c6f77', NULL, NULL, '2026-01-27 03:36:00.008822+00'),
	('8f8638f5-3350-43b7-a449-9949b17352fb', 'bc4c7831-cf73-44fe-b9f2-43c2cb2b8cb6', '8c1dd323-de22-48e2-9cab-9b71781c6f77', NULL, NULL, '2026-01-27 03:36:00.433529+00'),
	('fd5aadbc-ca73-4b4e-a873-01f529bd9da3', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-01 20:51:11.053179+00'),
	('417b473e-0c3c-41c9-a524-bff495fdf18b', '923d2db0-4d4a-40af-8121-16aa7084240e', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:14.730659+00'),
	('099c3305-23a7-4f35-9447-a5e30d5ab5c2', 'a1b65b38-5609-49e9-b618-28a2f3337a54', '0487f51f-f7ee-4fe8-9eb0-f58312676387', NULL, NULL, '2026-01-26 21:06:53.815476+00'),
	('675a25eb-0b69-4e1b-8e2b-49b021e148c1', '971663c7-00f3-4bb1-b2ce-d63949285041', '0487f51f-f7ee-4fe8-9eb0-f58312676387', NULL, NULL, '2026-01-27 00:37:26.664832+00'),
	('46dc4648-0c6c-43b8-b1c0-bfec54bf64f6', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-01 20:54:44.528524+00'),
	('863b5c1b-643e-4936-8eff-81184f4c7223', 'cb0222e5-e841-4198-bd55-cdc69f654d6a', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:30.883838+00'),
	('35113ec4-157d-4955-8f37-70c5c81a83a0', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-01 20:54:46.260588+00'),
	('7757274d-49a4-4175-ab5d-6b566bc449a7', 'a4cc27cd-89bb-41f7-900a-dd79fa8296c1', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:33.336088+00'),
	('1945e21b-bd65-4a39-a279-bf4a14dabdab', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-01 20:54:58.11211+00'),
	('c0789a0b-cf80-4367-8bf3-f00884ce0eef', '5fa53cd8-542d-40ae-a041-85c82795bca3', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:35.853837+00'),
	('49122e56-3e77-4e56-a266-0f12301f80d3', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-01 21:18:33.341065+00'),
	('348a0512-6e09-46ea-b9c1-56960ed9e925', '14cfe322-b04a-4404-8ce2-6ffd8172979b', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:38.213833+00'),
	('a4fa05b5-6c0c-4434-824c-2e23a6a8fb49', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-01 21:46:07.024462+00'),
	('b512549b-3c42-40b2-ad4d-685c5b3d98a0', 'd0510eeb-5027-4484-a60b-1165365e26cf', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:40.70952+00'),
	('153bcba8-41dd-40f2-bdfb-4fe80f6c1321', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-01 21:46:08.741569+00'),
	('e68361df-682f-46e7-a83c-5e3ad2ad1884', '1a20ed67-f00c-43c5-9fbf-f0ce5b7e4383', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:43.123406+00'),
	('5efa9b7e-dd1a-4e8d-8e14-e629c6596a60', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-03 14:24:54.443543+00'),
	('3b481668-3f26-4042-8192-3f59432167f2', '7c12142b-8b55-4cb4-b149-2255235ec605', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:45.430541+00'),
	('0bf61886-eeec-4839-b7d7-3b7805ae35b6', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-03 14:24:57.047769+00'),
	('15b08d1a-5d57-4daa-9cef-8db64bcd6264', 'de2c2128-de15-4941-beb5-8f3f51bf9c86', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:47.859683+00'),
	('a1caaf0a-f8de-4998-bb14-16d9c65685c0', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-03 14:24:58.166145+00'),
	('be195c6c-4942-4bf5-9100-68b7e4649083', '47d526cb-9c91-4036-854e-666faac32e24', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:50.051456+00'),
	('c87a4b0d-c623-4425-bb68-cee5c44263bc', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-03 14:24:59.997615+00'),
	('d34d22e7-4066-4218-9607-b047831573d9', 'f7fea673-1305-4344-8db3-222b758c1ffd', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:52.262894+00'),
	('939a52f6-292e-4e16-b6b9-3edbfbb74cb1', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-03 14:38:18.573677+00'),
	('12daae63-f7d5-4f3e-9a4a-87996ff1e286', 'f5b94af6-9e2a-4735-8d64-d8b5947f60f4', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:54.424673+00'),
	('b9ae1612-e828-45fc-81a9-70d00cdcc1db', '2081cd1d-7024-4b39-a18f-f3e3e62c8c5c', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-22 00:44:14.426008+00'),
	('b4132c0d-90e6-4575-8273-54fc771f4b90', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-03 14:38:21.597441+00'),
	('b560cd0f-5830-41d9-84af-b1b49a06a8d6', '32de4977-e104-440e-a009-98eb5a516b52', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:57.775595+00'),
	('0102264a-3d93-49ba-a15b-f729da5f4824', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-03 18:07:46.341776+00'),
	('9f146d7c-bac6-476c-b09f-0bd2b08dabfa', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-03 18:10:35.476496+00'),
	('629ecd1d-ad5b-43f5-b3de-59cc10c3d678', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-03 18:10:36.951356+00'),
	('a43c2371-b282-4689-96ee-2fc046dc8a5c', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-03 18:10:38.503281+00'),
	('63de4d04-8044-45a4-872f-c75ab5011143', 'c445645c-9b0c-443e-87d2-cac42dbd120f', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:55:59.981322+00'),
	('8684d7b2-ab80-424d-b8a4-5f714fd796c7', '2656bb53-24b2-4786-89fa-bb8c71534a30', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:56:02.440019+00'),
	('f9dd451d-502f-4ffc-a220-eb233e545307', 'ed24c310-b7bb-43a3-b2f7-480e0cfcedc2', NULL, NULL, NULL, '2026-01-30 06:59:35.106128+00'),
	('714c6117-5aa4-44bf-ab01-fd27346340e7', '2656bb53-24b2-4786-89fa-bb8c71534a30', NULL, NULL, NULL, '2026-01-30 06:59:36.029111+00'),
	('eb80c402-6fbb-438d-b071-6942d290efc6', '32de4977-e104-440e-a009-98eb5a516b52', NULL, NULL, NULL, '2026-01-30 06:59:36.519783+00'),
	('5c5c39ff-08ec-4373-bfaa-7a70ed579d87', 'de2c2128-de15-4941-beb5-8f3f51bf9c86', NULL, NULL, NULL, '2026-01-30 06:59:37.592221+00'),
	('1acedd47-cbbc-48f7-b1dc-edbbc1935e6a', '1a20ed67-f00c-43c5-9fbf-f0ce5b7e4383', NULL, NULL, NULL, '2026-01-30 06:59:38.094949+00'),
	('2d1c606b-7d9a-46d5-a548-5b6426b97936', 'a4cc27cd-89bb-41f7-900a-dd79fa8296c1', NULL, NULL, NULL, '2026-01-30 06:59:39.372599+00'),
	('427e52bb-b7b9-440d-841d-3905d91fa1b9', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-01-30 06:59:40.196464+00'),
	('e742131f-c50a-4066-9667-68cc95bf8d7b', 'cef28783-cfd4-4b69-a2ef-c16febee3ab4', NULL, NULL, NULL, '2026-01-30 06:59:41.220183+00'),
	('2318d000-227f-4def-b86d-83ebb2de999b', '2656bb53-24b2-4786-89fa-bb8c71534a30', NULL, NULL, NULL, '2026-01-30 06:59:42.148283+00'),
	('428bd262-7ff0-44be-a358-8711868eadd2', 'f7fea673-1305-4344-8db3-222b758c1ffd', NULL, NULL, NULL, '2026-01-30 06:59:43.367622+00'),
	('90b97b0c-30d6-4440-b45e-99e3f70c63f4', 'de2c2128-de15-4941-beb5-8f3f51bf9c86', NULL, NULL, NULL, '2026-01-30 06:59:43.976902+00'),
	('02b022a5-e25b-482a-ab57-d010df6f55ea', '14cfe322-b04a-4404-8ce2-6ffd8172979b', NULL, NULL, NULL, '2026-01-30 06:59:45.150345+00'),
	('6cde6549-84dd-4778-8ea3-3f415814f2b6', 'a4cc27cd-89bb-41f7-900a-dd79fa8296c1', NULL, NULL, NULL, '2026-01-30 06:59:46.053324+00'),
	('1dac087e-5dbc-4859-8b82-ee31b96dc0ae', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-01-30 06:59:50.915475+00'),
	('43b93777-e152-4e8b-9a74-e56b10bf6667', 'ed24c310-b7bb-43a3-b2f7-480e0cfcedc2', NULL, NULL, NULL, '2026-01-30 06:59:53.759317+00'),
	('c42fd676-58cf-40dd-bd28-f4c4b232c3e7', '1a20ed67-f00c-43c5-9fbf-f0ce5b7e4383', NULL, NULL, NULL, '2026-01-30 06:59:58.979407+00'),
	('9af96d85-3066-47a6-9540-a8e6cf0bc4cb', '14cfe322-b04a-4404-8ce2-6ffd8172979b', NULL, NULL, NULL, '2026-01-30 06:59:59.631244+00'),
	('e542abfe-604a-49a8-a58c-0861c5c5f180', '5fa53cd8-542d-40ae-a041-85c82795bca3', NULL, NULL, NULL, '2026-01-30 07:00:00.121315+00'),
	('0a5f18a1-d480-43d5-9298-c5c6972215a7', 'cb0222e5-e841-4198-bd55-cdc69f654d6a', NULL, NULL, NULL, '2026-01-30 07:00:04.17287+00'),
	('732b7f1a-b6d6-40dd-be6b-33cb1548b0ee', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-01-30 07:00:05.8663+00'),
	('b6910a46-eb39-478d-a074-37927faec21c', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-01-30 07:00:07.131842+00'),
	('1fdd9c74-3bac-41f7-b3f6-2f2a99702b8e', 'ed24c310-b7bb-43a3-b2f7-480e0cfcedc2', NULL, NULL, NULL, '2026-01-30 07:00:07.658835+00'),
	('4cf58e41-f37a-4089-8efc-d5d252cecd98', '80db9a41-9a75-43b5-97f3-9c1bb5a7b25b', NULL, NULL, NULL, '2026-01-30 07:00:08.460194+00'),
	('c1f7f7da-500b-4d77-9c78-e1b7676289c1', '2656bb53-24b2-4786-89fa-bb8c71534a30', NULL, NULL, NULL, '2026-01-30 07:00:08.934644+00'),
	('4eecf606-b9a1-429b-b0ec-c9fef9acf36e', '32de4977-e104-440e-a009-98eb5a516b52', NULL, NULL, NULL, '2026-01-30 07:00:09.941855+00'),
	('198d7b62-0367-4a79-9e13-ed3fc5c2786d', 'f5b94af6-9e2a-4735-8d64-d8b5947f60f4', NULL, NULL, NULL, '2026-01-30 07:00:10.405671+00'),
	('fbb834f7-515e-47ae-a17b-5717cb295683', '47d526cb-9c91-4036-854e-666faac32e24', NULL, NULL, NULL, '2026-01-30 07:00:11.420622+00'),
	('db569035-3bdd-4be3-bc63-1486a74029d7', 'de2c2128-de15-4941-beb5-8f3f51bf9c86', NULL, NULL, NULL, '2026-01-30 07:00:11.737585+00'),
	('13644e92-3e65-470a-9d87-ec24bf2df37f', '5fa53cd8-542d-40ae-a041-85c82795bca3', NULL, NULL, NULL, '2026-01-30 07:00:13.816682+00'),
	('ea52b5dc-92c6-4c58-9f2e-ee43e7123527', 'cb0222e5-e841-4198-bd55-cdc69f654d6a', NULL, NULL, NULL, '2026-01-30 07:00:14.413495+00'),
	('cd2715f2-eedb-4fbd-8b5c-9f91ca257c7c', '80db9a41-9a75-43b5-97f3-9c1bb5a7b25b', NULL, NULL, NULL, '2026-01-30 07:00:41.854095+00'),
	('d01cee76-a603-4f26-bf7e-3d7c98f9998b', '47d526cb-9c91-4036-854e-666faac32e24', NULL, NULL, NULL, '2026-01-30 07:00:43.72128+00'),
	('c43217bb-ebd3-4dd8-9220-f275406672bc', '5fa53cd8-542d-40ae-a041-85c82795bca3', NULL, NULL, NULL, '2026-01-30 07:00:45.540012+00'),
	('5b749f71-5d79-4ae5-87bf-52da970b057d', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', 'e40815c0-69a4-4c65-a80b-c5f5f57711ab', NULL, NULL, '2026-01-31 03:44:19.028985+00'),
	('b70d32ba-19ef-424c-a24c-6a9cdef05f80', '15e799db-9ac4-492e-9196-243cfae9b306', 'e40815c0-69a4-4c65-a80b-c5f5f57711ab', NULL, NULL, '2026-01-31 03:44:19.55741+00'),
	('11b1854e-6ffc-4540-82e6-affbbdc17f02', '40905c46-4ddb-4b92-9175-72eacafa5e8c', 'e40815c0-69a4-4c65-a80b-c5f5f57711ab', NULL, NULL, '2026-01-31 03:44:20.646004+00'),
	('c29abe1a-700e-4e0f-a647-f930503882fb', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-01-31 09:11:48.360539+00'),
	('51981629-d75d-4a30-a3a1-a009c5de49e3', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-01-31 09:11:49.483493+00'),
	('c461dcfb-9971-4038-8953-df7a739809e9', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-01-31 20:08:58.338813+00'),
	('0d502cd2-51ee-4b83-b28b-1c107cc1f68d', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-01-31 20:08:58.93636+00'),
	('617ab1ca-27c9-4a59-9751-dbe5285f2ba2', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-01-31 20:08:59.62578+00'),
	('8630e87c-ffb9-4783-9410-2fefd13df6c1', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-01-31 20:09:00.351633+00'),
	('0bb324dc-46eb-403a-a6f1-851de5447059', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-01-31 20:09:01.094222+00'),
	('438e25b8-38c1-42ef-aa71-7183f0c1fb81', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-01 08:51:53.413626+00'),
	('78f2a6ec-3aba-4c4c-a809-35fd8a21b85f', '15e799db-9ac4-492e-9196-243cfae9b306', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', NULL, NULL, '2026-01-30 11:22:32.069212+00'),
	('bbd59648-0c15-4e42-a39a-266266fdee78', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-01 08:51:54.256419+00'),
	('b9421c8e-281d-4fc2-9702-fae57d8752a8', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-01 20:51:07.355525+00'),
	('9a98732f-0612-480c-8254-35c58fd52e6c', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-01-30 11:46:13.146991+00'),
	('f6cf3c5f-8525-458e-bc86-31bc4466e801', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-01 20:51:09.293291+00'),
	('e5894cf2-4960-444b-bf1b-5c22e107003c', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-01 20:51:11.527738+00'),
	('e6c57b9e-1c7e-4ae1-a672-519a3880cb6a', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-01 20:54:43.314917+00'),
	('536fb06b-68ef-4884-8d33-82c48ce14f37', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-01 20:54:44.898024+00'),
	('83907839-6d06-4f85-a427-1cbe7cba39b7', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-01 20:54:45.227469+00'),
	('54248ee0-53dc-4991-862f-5e6d47591205', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-01 20:54:56.767369+00'),
	('0f289508-d268-42b2-8ef1-7aa45fd8d7bb', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-01 21:46:05.580982+00'),
	('f45789af-9617-4bd6-8f2e-362a1ce1d99a', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-01 21:46:07.494736+00'),
	('d0dbe2ea-b147-45e7-9942-3f9a1b7bdd92', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-01 21:46:09.094852+00'),
	('478f5faa-dd2d-41b9-8e03-52a71b3b6c25', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-01 21:46:09.462097+00'),
	('e677ced0-a8bb-4c3d-81dd-11e0ed2800f0', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-03 14:24:55.562897+00'),
	('17b23106-e3b5-422c-8522-7dcc829d92b0', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-03 14:24:57.496249+00'),
	('4c27d351-a3b3-48a5-b262-8c1af3e271d2', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-03 14:24:58.578606+00'),
	('233d3b7e-5e5a-4bbb-b779-f242906158fc', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-03 14:25:00.567261+00'),
	('3b034dc7-37c9-4931-b7ee-f8082bc01c74', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-03 14:38:19.331061+00'),
	('9d5ce183-88ca-48ff-8bb8-a605387c3feb', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-03 14:38:22.023526+00'),
	('f814a06e-8d35-4ed6-90b9-10aa620d4700', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-03 18:10:34.162404+00'),
	('052880b1-1d67-46a1-a27c-312e28690c6f', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-03 18:10:35.850725+00'),
	('a76240ed-d142-4d0c-901e-fbee3e49f511', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-03 18:10:37.406743+00'),
	('2517fe4d-abba-42f1-831d-b8b73f1e0172', '923d2db0-4d4a-40af-8121-16aa7084240e', 'd1965e29-d5d8-401c-8008-a4f772d9556e', NULL, NULL, '2026-02-04 03:42:58.734327+00'),
	('a057fc4e-b5e2-4079-ad99-419d825be48e', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', 'd1965e29-d5d8-401c-8008-a4f772d9556e', NULL, NULL, '2026-02-04 03:43:00.508066+00'),
	('498314a3-687e-4393-97bb-902cb8d5b8b7', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', 'd1965e29-d5d8-401c-8008-a4f772d9556e', NULL, NULL, '2026-02-04 03:43:03.84161+00'),
	('9ecdd11f-c461-4302-8786-6e62ff978871', 'cef28783-cfd4-4b69-a2ef-c16febee3ab4', NULL, NULL, NULL, '2026-01-30 06:59:35.468783+00'),
	('ce42a3ef-af82-4c2c-b82b-5941a2a9e05f', 'f5b94af6-9e2a-4735-8d64-d8b5947f60f4', NULL, NULL, NULL, '2026-01-30 06:59:36.747602+00'),
	('b390774d-d0de-4665-90b1-ef5a8b981117', 'f7fea673-1305-4344-8db3-222b758c1ffd', NULL, NULL, NULL, '2026-01-30 06:59:37.013597+00'),
	('4a3467f1-8e22-47c9-9259-3674ec9d8553', 'd0510eeb-5027-4484-a60b-1165365e26cf', NULL, NULL, NULL, '2026-01-30 06:59:38.33399+00'),
	('5b6b7c9b-c285-4a3e-92ac-3bd016fd4967', '14cfe322-b04a-4404-8ce2-6ffd8172979b', NULL, NULL, NULL, '2026-01-30 06:59:38.663549+00'),
	('d6c09140-22e7-4ab3-b5b4-cb463cfd7c7c', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-01-30 06:59:40.448705+00'),
	('95194298-5dd2-4f74-8e06-122da6588dbf', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-01-30 06:59:40.707646+00'),
	('7c86df7d-abf4-47b4-91e8-6bb7108b6ad8', 'c445645c-9b0c-443e-87d2-cac42dbd120f', NULL, NULL, NULL, '2026-01-30 06:59:42.445691+00'),
	('b8ef43fe-b993-48cf-a815-aa421c0b49ce', '32de4977-e104-440e-a009-98eb5a516b52', NULL, NULL, NULL, '2026-01-30 06:59:42.700151+00'),
	('2985181d-98d5-4c5b-bdb6-3a556ca563b1', '7c12142b-8b55-4cb4-b149-2255235ec605', NULL, NULL, NULL, '2026-01-30 06:59:44.213008+00'),
	('7880143c-e149-4016-82a5-1ef0d9767814', '1a20ed67-f00c-43c5-9fbf-f0ce5b7e4383', NULL, NULL, NULL, '2026-01-30 06:59:44.504624+00'),
	('4444f9b6-1417-4814-a6c2-a427398aa593', 'cb0222e5-e841-4198-bd55-cdc69f654d6a', NULL, NULL, NULL, '2026-01-30 06:59:49.805577+00'),
	('ed98af12-9a3c-4163-9a23-5ad3d27e7f42', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-01-30 06:59:50.278498+00'),
	('e39c14be-6e8f-418f-a284-9c6d72145f9f', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-01-30 06:59:51.170614+00'),
	('e4ef49d0-e951-4325-8d9f-a50fe93bc644', 'c445645c-9b0c-443e-87d2-cac42dbd120f', NULL, NULL, NULL, '2026-01-30 06:59:56.2021+00'),
	('719ef3ce-ef87-465c-9a59-ffc539cd8919', 'f7fea673-1305-4344-8db3-222b758c1ffd', NULL, NULL, NULL, '2026-01-30 06:59:57.301994+00'),
	('ce561659-faeb-4dbb-bd08-2da49ff02469', '7c12142b-8b55-4cb4-b149-2255235ec605', NULL, NULL, NULL, '2026-01-30 06:59:58.673195+00'),
	('e3a2d678-4cb0-46f1-838b-73bb1af735d5', 'd0510eeb-5027-4484-a60b-1165365e26cf', NULL, NULL, NULL, '2026-01-30 06:59:59.34266+00'),
	('b815538c-a529-4ba8-a62d-a260ce8049de', 'a4cc27cd-89bb-41f7-900a-dd79fa8296c1', NULL, NULL, NULL, '2026-01-30 07:00:00.960199+00'),
	('1dbb5306-0229-4187-b397-81ed2f38d03d', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-01-30 07:00:06.569228+00'),
	('be170206-a254-4ee7-a9b6-2170d37f0b67', 'cef28783-cfd4-4b69-a2ef-c16febee3ab4', NULL, NULL, NULL, '2026-01-30 07:00:07.990199+00'),
	('7ea6a9e8-7661-412b-8f10-b2076d585dc4', 'c445645c-9b0c-443e-87d2-cac42dbd120f', NULL, NULL, NULL, '2026-01-30 07:00:09.464022+00'),
	('31d44f57-03f0-403e-9a6c-b93e92f4f357', 'f7fea673-1305-4344-8db3-222b758c1ffd', NULL, NULL, NULL, '2026-01-30 07:00:10.909502+00'),
	('4efe49d1-6e97-466a-9386-692763fbee6c', '7c12142b-8b55-4cb4-b149-2255235ec605', NULL, NULL, NULL, '2026-01-30 07:00:12.17924+00'),
	('0f45555f-fd9b-4d06-8033-05b16aa1d778', 'd0510eeb-5027-4484-a60b-1165365e26cf', NULL, NULL, NULL, '2026-01-30 07:00:13.207954+00'),
	('2104553b-f856-4f66-9935-76497bf98d4d', 'a4cc27cd-89bb-41f7-900a-dd79fa8296c1', NULL, NULL, NULL, '2026-01-30 07:00:14.121319+00'),
	('8287aa8b-80a0-4651-9139-2209e405fe16', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-01-30 07:00:14.97604+00'),
	('e79134e9-f690-4d57-adcc-eef48126e8db', '2656bb53-24b2-4786-89fa-bb8c71534a30', NULL, NULL, NULL, '2026-01-30 07:00:42.116108+00'),
	('34a14585-41a2-43e3-97d3-dd10e2439c04', 'de2c2128-de15-4941-beb5-8f3f51bf9c86', NULL, NULL, NULL, '2026-01-30 07:00:43.97815+00'),
	('1467311b-20cd-42f3-b5c5-3bfee9e9b2f6', 'a4cc27cd-89bb-41f7-900a-dd79fa8296c1', NULL, NULL, NULL, '2026-01-30 07:00:45.857239+00'),
	('bd5921f2-7e16-4e8b-b4e2-3bc174f24b29', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', 'e40815c0-69a4-4c65-a80b-c5f5f57711ab', NULL, NULL, '2026-01-31 03:44:21.170682+00'),
	('755833ae-fb55-4f94-8e9e-4247f2ba425a', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-01-31 09:11:48.683092+00'),
	('4210d53a-722b-4fdc-a3f5-e28c1623197a', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-01-31 09:11:49.789679+00'),
	('1d8e068e-1403-4c70-863f-fb5e3fc6409c', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-01-31 20:08:58.655604+00'),
	('45070b52-1e22-49c9-8447-ee50632465fb', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-01-31 20:08:59.379776+00'),
	('016e7dd7-4b5e-45fc-a14e-b8e09caf33cf', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-01-31 20:09:00.760362+00'),
	('1c31a98a-43fa-4f98-9286-617ebdd43f18', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-01 08:51:52.343859+00'),
	('8a099a87-4ebe-41aa-aaa5-cb8be6d982d5', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-01 08:51:53.202594+00'),
	('96ce8fb2-9927-4e46-9ba2-3587ef612d3b', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', NULL, NULL, '2026-01-30 11:22:33.291932+00'),
	('2da5577d-5613-44f0-a689-592372c5b4e0', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-01 08:51:53.634207+00'),
	('b28a84e3-3b2f-42b2-84f2-3c99945514f4', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-01-30 11:46:33.529412+00'),
	('f0306e97-3d9c-425c-b70f-f9574ceb2a9e', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-01 08:51:54.474051+00'),
	('f3e580c5-d51c-40b6-82d2-5109696cc2c0', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-01 20:51:07.845748+00'),
	('0c57eda0-a173-4588-abd7-befdfd41dd6c', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-01 20:51:09.622734+00'),
	('f4eae517-e8ab-44a0-ae9f-3f34a777dd5a', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-01 20:54:43.809071+00'),
	('5e4fcc48-5e97-46ff-baae-20b5dd5ec636', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-01 20:54:45.554573+00'),
	('2e3defb5-6075-45e4-90e3-cd9acfce3b8a', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-01 21:18:12.328767+00'),
	('6438ec47-6a0e-427b-9140-e0febfb08e1f', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-01 21:18:32.986477+00'),
	('dae6fb24-8d13-49be-bb92-f5171424a0de', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-01 21:46:06.141852+00'),
	('cf62f011-66a9-4874-8e07-c961fb1ad653', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-01 21:46:07.963164+00'),
	('ecaf11e6-4763-4bbd-a7b7-6e48c818081e', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-01 21:46:09.805945+00'),
	('e12781a0-c2c0-4aff-8b94-7954af7bb7d1', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-01 21:46:10.264721+00'),
	('1c9488bb-f766-415c-8566-7d493b7021c6', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-03 14:24:56.107052+00'),
	('0fe842e6-d946-4607-8b0f-cc83969114ee', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-03 14:24:58.979307+00'),
	('a6a0e220-7f7f-4fe4-bd62-885fdc34f655', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-03 14:38:17.034627+00'),
	('1e533f52-70ea-48f4-bae2-a198d0862a4f', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-03 14:38:17.674624+00'),
	('116e4250-9199-45ae-94d9-98cef77a7030', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-03 14:38:19.759659+00'),
	('77599cc3-18dc-49e3-81da-47261f4ea13b', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-03 14:38:20.162063+00'),
	('531fa5c9-2dc0-48cb-8ac5-ecf40b1a684f', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-03 14:38:22.45415+00'),
	('888d02ab-3dbb-41da-b3e5-ccbd738b3cc2', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-03 18:10:34.696053+00'),
	('9854cc52-0aae-4156-8924-95d4999ca2ad', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-03 18:10:36.22193+00'),
	('f13ee5a7-2e1d-44d1-b7df-ceebbfe83660', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-03 18:10:37.763851+00'),
	('d1d88051-7b16-47a8-85b6-27169c757e74', '15e799db-9ac4-492e-9196-243cfae9b306', 'd1965e29-d5d8-401c-8008-a4f772d9556e', NULL, NULL, '2026-02-04 03:43:02.7164+00'),
	('1491c74d-e5c0-4619-9964-2295b424668b', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', 'd1965e29-d5d8-401c-8008-a4f772d9556e', NULL, NULL, '2026-02-04 03:43:05.23626+00'),
	('99a1c036-8e22-452c-9f79-3d182071101d', '80db9a41-9a75-43b5-97f3-9c1bb5a7b25b', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:56:21.231197+00'),
	('2de3b2b0-f75d-4f9b-aa23-95fabb9be5d7', 'cef28783-cfd4-4b69-a2ef-c16febee3ab4', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:56:24.14704+00'),
	('a24950a5-dc7a-4853-9ee5-b3bb0e73aace', 'ed24c310-b7bb-43a3-b2f7-480e0cfcedc2', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', NULL, NULL, '2026-01-30 06:56:26.42306+00'),
	('5821ff1f-852e-4315-9357-c590eb5412e9', '80db9a41-9a75-43b5-97f3-9c1bb5a7b25b', NULL, NULL, NULL, '2026-01-30 06:59:35.782477+00'),
	('34ec2573-a4a9-4b98-a25c-56da13649659', '47d526cb-9c91-4036-854e-666faac32e24', NULL, NULL, NULL, '2026-01-30 06:59:37.320479+00'),
	('17418a0f-00c8-4878-965f-822fa542a513', '5fa53cd8-542d-40ae-a041-85c82795bca3', NULL, NULL, NULL, '2026-01-30 06:59:38.962971+00'),
	('6c5db7a0-5c13-4201-8671-ed7949a6cd2b', 'ed24c310-b7bb-43a3-b2f7-480e0cfcedc2', NULL, NULL, NULL, '2026-01-30 06:59:40.974152+00'),
	('7dbef345-04ed-466a-9cf1-61b25fef3f8d', 'f5b94af6-9e2a-4735-8d64-d8b5947f60f4', NULL, NULL, NULL, '2026-01-30 06:59:43.063567+00'),
	('a048c331-a6a9-441b-9ab0-928d9ec499cf', 'd0510eeb-5027-4484-a60b-1165365e26cf', NULL, NULL, NULL, '2026-01-30 06:59:44.794371+00'),
	('67656de1-1f41-4725-80dd-ed4f4e4c85f2', 'cef28783-cfd4-4b69-a2ef-c16febee3ab4', NULL, NULL, NULL, '2026-01-30 06:59:55.221681+00'),
	('167abb47-6cdd-438e-aad7-c989ef8393b7', '80db9a41-9a75-43b5-97f3-9c1bb5a7b25b', NULL, NULL, NULL, '2026-01-30 06:59:55.575839+00'),
	('5f8909f6-3ea6-4d01-afbf-6b2b678abf0a', '32de4977-e104-440e-a009-98eb5a516b52', NULL, NULL, NULL, '2026-01-30 06:59:56.592679+00'),
	('2fafac20-ac12-4965-a479-5860d3be74b3', '47d526cb-9c91-4036-854e-666faac32e24', NULL, NULL, NULL, '2026-01-30 06:59:57.744207+00'),
	('0c30b8e8-451f-46a5-b786-76bcbe00beb0', '1a20ed67-f00c-43c5-9fbf-f0ce5b7e4383', NULL, NULL, NULL, '2026-01-30 07:00:12.870712+00'),
	('2a7d462e-da5d-4640-a010-cf277978f661', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-01-30 07:00:14.696459+00'),
	('e4e953f4-91e1-426e-b77c-522c308ded7b', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-01-30 07:00:15.231934+00'),
	('a90cda8c-8690-495d-a21a-8d1b62f88593', 'c445645c-9b0c-443e-87d2-cac42dbd120f', NULL, NULL, NULL, '2026-01-30 07:00:42.473162+00'),
	('166842f8-a40a-4cde-b8df-ea9c61b9fbda', 'f7fea673-1305-4344-8db3-222b758c1ffd', NULL, NULL, NULL, '2026-01-30 07:00:43.392683+00'),
	('6a7b122a-8ae0-4c0c-8a8f-b3ec15b36f3d', '7c12142b-8b55-4cb4-b149-2255235ec605', NULL, NULL, NULL, '2026-01-30 07:00:44.235175+00'),
	('fa9c6ee3-c28f-4188-b73d-c26470230a5d', '14cfe322-b04a-4404-8ce2-6ffd8172979b', NULL, NULL, NULL, '2026-01-30 07:00:45.255793+00'),
	('2d82721c-483c-47bf-a422-9fa6752f2b78', 'cb0222e5-e841-4198-bd55-cdc69f654d6a', NULL, NULL, NULL, '2026-01-30 07:00:46.173396+00'),
	('7d0d2655-5801-442d-9c7c-9877236bb590', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-01-30 07:00:47.133643+00'),
	('d0761481-c0c4-4415-a56e-08e45f715ff5', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-01-31 09:11:47.397613+00'),
	('07b37741-11a6-45d2-b20a-95549e52ece9', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-01-31 09:11:47.802506+00'),
	('0ecaecd5-a182-4917-8cc2-bf6c68ab889b', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-01-31 09:11:48.933927+00'),
	('ec6d5193-7aa9-4e21-9739-c041bb825f2c', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-01-31 09:11:50.114559+00'),
	('ecabd99c-52cb-4af4-9b81-f675abe7eb30', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-01-31 09:11:50.349852+00'),
	('5018b9e4-8216-4281-959e-f1cb7614a59b', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-01-31 20:08:59.846843+00'),
	('dc3a7a4a-20e8-4dc9-b7fd-ce4f898398b5', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-01-31 20:09:01.641337+00'),
	('f95eea9b-57d0-40df-8dc5-c90ffd20c2ee', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-01 08:51:52.77498+00'),
	('3b19b818-5b19-4d7a-bc7f-35a8b34ff718', '923d2db0-4d4a-40af-8121-16aa7084240e', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', NULL, NULL, '2026-01-30 07:10:38.003271+00'),
	('22775dcc-fba7-40d7-9650-9e1f06d6bbbf', '40905c46-4ddb-4b92-9175-72eacafa5e8c', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', NULL, NULL, '2026-01-30 11:22:34.33715+00'),
	('f8a2ecb3-8c59-4a31-b30a-861fe80ab79c', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-01 08:51:53.855242+00'),
	('d11d42b4-b9b3-46b0-80f1-206d470fa5ba', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-01 08:51:54.691626+00'),
	('a3ee0258-6cca-4cdf-93d7-264d57f6b0ff', '3b4cc029-776d-4e0f-948e-4ffa7b023a7e', NULL, NULL, NULL, '2026-02-01 08:51:54.914252+00'),
	('e2fe4cb1-408c-48ab-b523-e0b400d9a1a1', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-01 20:51:08.320975+00'),
	('06911771-c93b-4ce4-9ac5-b8dc96234268', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-01 20:51:10.09988+00'),
	('f8ad9d32-ea9e-45cc-bc30-4377f7da18aa', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-01 20:54:44.161764+00'),
	('f44d33cd-78f4-4975-b327-bfbaaba4a27d', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-01 20:54:45.897633+00'),
	('eecc3e55-8566-4769-854b-8da3cc6932a6', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-01 20:54:57.723159+00'),
	('9879cd45-f511-4588-8b62-376603425e6c', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-01 21:18:32.504382+00'),
	('dc4409a3-a896-49d5-a214-ac54bec1ac31', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-01 21:46:06.637959+00'),
	('692c7e61-bc0b-47eb-8c79-b6fbfda5aa95', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-01 21:46:08.306068+00'),
	('538d6a27-eddc-4ad3-85e1-9359a4dff4c6', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-02 08:00:29.4284+00'),
	('e7ecc577-eb4d-48a3-a556-805c056f11b0', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-03 14:24:56.522986+00'),
	('df69d6a9-cecd-444c-934d-ab4534a3ffa1', 'f1151116-1dcf-4746-8fe3-93b96b1b5b64', NULL, NULL, NULL, '2026-02-03 14:24:59.484276+00'),
	('14152e00-6b3e-4467-8b5c-094c4a702e9e', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-03 14:38:18.149737+00'),
	('d71acbe5-7cf4-4c5a-8095-a8806c92f3ed', '990227e9-6de3-4261-b7fa-9ed2a7e1c6ab', NULL, NULL, NULL, '2026-02-03 14:38:20.66377+00'),
	('798d8bea-1761-4f62-87ed-d85b829607ed', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-03 14:38:21.092993+00'),
	('6a413eca-b386-4b61-b46e-d67f9817ef91', '15e799db-9ac4-492e-9196-243cfae9b306', NULL, NULL, NULL, '2026-02-03 18:10:35.083264+00'),
	('bf20b506-e982-4e6c-80ac-5f2e8ad7e5db', '923d2db0-4d4a-40af-8121-16aa7084240e', NULL, NULL, NULL, '2026-02-03 18:10:36.590089+00'),
	('bcbe4291-326f-49ef-bf86-411e6ae07fa4', '40905c46-4ddb-4b92-9175-72eacafa5e8c', NULL, NULL, NULL, '2026-02-03 18:10:38.109261+00'),
	('2ec1e465-bff3-4a49-9566-13228c47c066', '40905c46-4ddb-4b92-9175-72eacafa5e8c', 'd1965e29-d5d8-401c-8008-a4f772d9556e', NULL, NULL, '2026-02-04 03:43:04.710412+00');


--
-- Data for Name: presale_merkle_proofs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: project_badges; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."project_badges" ("id", "project_id", "badge_id", "awarded_at", "awarded_by", "reason") VALUES
	('22c83710-9f01-4986-9195-43d08dfe81d7', '88bdbe1a-be98-46e4-aa67-4ab34e7a9138', 'b8653ce5-9c78-43fc-9ca7-a01ba4204c61', '2026-02-03 00:32:53.938111+00', NULL, 'First project created');


--
-- Data for Name: referral_ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: referral_relationships; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: round_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: round_post_finalize; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sbt_claims; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sbt_rewards_ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sbt_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sbt_stakes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sc_scan_results; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: template_audits; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: trending_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: trending_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_follows" ("id", "follower_id", "following_id", "created_at") VALUES
	('3364313d-a7ad-4a14-9791-713bb0fd24d2', '0487f51f-f7ee-4fe8-9eb0-f58312676387', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', '2026-01-26 21:11:35.872481+00'),
	('cf0ed83c-5243-4453-82c9-4799e770a347', '8c1dd323-de22-48e2-9cab-9b71781c6f77', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', '2026-01-27 21:24:58.309739+00'),
	('31f9b06d-aa3c-4ef4-bddb-daa7e7996664', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', '2026-01-29 14:27:22.609496+00'),
	('22b0ba6e-d325-4d60-b8d1-7324ff1f701d', 'e40815c0-69a4-4c65-a80b-c5f5f57711ab', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', '2026-01-31 03:44:20.169547+00'),
	('0be34163-d013-459a-b0b8-07f6f682955d', 'd1965e29-d5d8-401c-8008-a4f772d9556e', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', '2026-02-04 03:43:02.707839+00');


--
-- Data for Name: vesting_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: vesting_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: vesting_claims; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: wallet_link_nonces; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('kyc-documents', 'kyc-documents', NULL, '2026-01-15 19:15:57.100811+00', '2026-01-15 19:15:57.100811+00', true, false, 5242880, NULL, NULL, 'STANDARD'),
	('presale-assets', 'presale-assets', NULL, '2026-01-16 11:52:30.700834+00', '2026-01-16 11:52:30.700834+00', true, false, 2097152, '{image/png,image/jpeg,image/jpg,image/gif,image/webp}', NULL, 'STANDARD'),
	('public-files', 'public-files', NULL, '2026-01-18 15:42:59.072502+00', '2026-01-18 15:42:59.072502+00', true, false, 5242880, '{image/jpeg,image/png,image/gif,image/webp}', NULL, 'STANDARD'),
	('avatars', 'avatars', NULL, '2026-01-19 13:09:18.045284+00', '2026-01-19 13:09:18.045284+00', true, false, 2097152, '{image/jpeg,image/png,image/gif,image/webp}', NULL, 'STANDARD'),
	('fairlaunch-assets', 'fairlaunch-assets', NULL, '2026-01-29 12:02:47.642946+00', '2026-01-29 12:02:47.642946+00', true, false, 5242880, '{image/png,image/jpeg,image/jpg,image/webp}', NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('9178be44-9b6f-4fe1-9ba5-47c7dd4e5deb', 'kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506428345/id-front-1768506427453.jpg', NULL, '2026-01-15 19:47:09.021946+00', '2026-01-15 19:47:09.021946+00', '2026-01-15 19:47:09.021946+00', '{"eTag": "\"38afe9be17a44ed50a93564d5fd649c9\"", "size": 79845, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-15T19:47:09.000Z", "contentLength": 79845, "httpStatusCode": 200}', '9a4eb2ae-7a59-4c4d-a093-2127a40d4f77', NULL, '{}', 3),
	('e073afc8-0acb-4077-8c4d-0a1000e3e183', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770015085367.png', NULL, '2026-02-02 06:51:25.940483+00', '2026-02-02 06:51:25.940483+00', '2026-02-02 06:51:25.940483+00', '{"eTag": "\"5c18676ecd36ab66b908d630da549554\"", "size": 141719, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T06:51:26.000Z", "contentLength": 141719, "httpStatusCode": 200}', 'e108dcb9-9aad-4286-af7b-65a178aa4193', NULL, '{}', 2),
	('9314f350-8ce0-417e-ab0f-2c0046dcc118', 'kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506428345/id-back-1768506427454.jpg', NULL, '2026-01-15 19:47:09.79573+00', '2026-01-15 19:47:09.79573+00', '2026-01-15 19:47:09.79573+00', '{"eTag": "\"12711041dee203ba0820f4a87a6b2e67\"", "size": 216132, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-15T19:47:10.000Z", "contentLength": 216132, "httpStatusCode": 200}', '9837ac84-8b62-4ed1-b344-bf271c9d4e36', NULL, '{}', 3),
	('b127f41b-370f-44e0-a930-e94761afcee5', 'kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506428345/selfie-1768506427455.jpg', NULL, '2026-01-15 19:47:10.063978+00', '2026-01-15 19:47:10.063978+00', '2026-01-15 19:47:10.063978+00', '{"eTag": "\"5f99bb3001d78f29173d3c0cfe9ba0eb\"", "size": 47377, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-15T19:47:11.000Z", "contentLength": 47377, "httpStatusCode": 200}', '5be09477-c010-4039-87c6-5c942d3d74ae', NULL, '{}', 3),
	('10851baf-60d8-4d74-8e7b-e27502b35cf1', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770072892728.png', NULL, '2026-02-02 22:54:53.524292+00', '2026-02-02 22:54:53.524292+00', '2026-02-02 22:54:53.524292+00', '{"eTag": "\"5337ff29ea2b642c9978da0db0f36df4\"", "size": 1340743, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T22:54:54.000Z", "contentLength": 1340743, "httpStatusCode": 200}', 'd17d3290-8dfb-41a2-ad2a-59b98f5d0d4f', NULL, '{}', 2),
	('069d040a-8da7-4753-ac16-77a5e980dd83', 'kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506528999/id-front-1768506527357.jpg', NULL, '2026-01-15 19:48:49.814173+00', '2026-01-15 19:48:49.814173+00', '2026-01-15 19:48:49.814173+00', '{"eTag": "\"493c916f9d5a4d7eb2297a13a9ec627f\"", "size": 223887, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-15T19:48:50.000Z", "contentLength": 223887, "httpStatusCode": 200}', '741a4788-a640-4447-8c0a-d289851b0f36', NULL, '{}', 3),
	('50866028-272e-4f6a-9007-42a2d341cd4e', 'kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506528999/id-back-1768506527358.jpg', NULL, '2026-01-15 19:48:50.317619+00', '2026-01-15 19:48:50.317619+00', '2026-01-15 19:48:50.317619+00', '{"eTag": "\"5f99bb3001d78f29173d3c0cfe9ba0eb\"", "size": 47377, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-15T19:48:51.000Z", "contentLength": 47377, "httpStatusCode": 200}', 'b06b5401-b49c-48cc-987c-1ab61fb1e968', NULL, '{}', 3),
	('43ee541e-befd-4202-869a-6d925a2351d1', 'fairlaunch-assets', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23/logo_1770184684241.png', NULL, '2026-02-04 05:58:04.944536+00', '2026-02-04 05:58:04.944536+00', '2026-02-04 05:58:04.944536+00', '{"eTag": "\"8f5fb8fd749cbae7817084282991e12b\"", "size": 397938, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-04T05:58:05.000Z", "contentLength": 397938, "httpStatusCode": 200}', 'ed624570-ee1f-4fb0-9e53-5cb51c14f061', NULL, '{}', 2),
	('318c688d-5647-4e16-b570-8ab2add238ea', 'kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506528999/selfie-1768506527359.jpg', NULL, '2026-01-15 19:48:50.614361+00', '2026-01-15 19:48:50.614361+00', '2026-01-15 19:48:50.614361+00', '{"eTag": "\"5a7bef688c25258ca210865ae157cebb\"", "size": 37202, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-15T19:48:51.000Z", "contentLength": 37202, "httpStatusCode": 200}', 'cd253b99-ea8a-49e1-91cb-5413b958b78d', NULL, '{}', 3),
	('30eaff4c-cf5c-4e2a-888d-fa42deee576c', 'kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506928976/id-front-1768506928068.jpg', NULL, '2026-01-15 19:55:29.50918+00', '2026-01-15 19:55:29.50918+00', '2026-01-15 19:55:29.50918+00', '{"eTag": "\"5f99bb3001d78f29173d3c0cfe9ba0eb\"", "size": 47377, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-15T19:55:30.000Z", "contentLength": 47377, "httpStatusCode": 200}', 'ba207171-a375-43fe-804b-9a97cf982dcb', NULL, '{}', 3),
	('f1383b02-e6b1-4c4e-8c84-d0f1a55bfd73', 'kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506928976/id-back-1768506928069.jpg', NULL, '2026-01-15 19:55:30.331525+00', '2026-01-15 19:55:30.331525+00', '2026-01-15 19:55:30.331525+00', '{"eTag": "\"12711041dee203ba0820f4a87a6b2e67\"", "size": 216132, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-15T19:55:31.000Z", "contentLength": 216132, "httpStatusCode": 200}', '72e5b6f8-7b78-4b11-bfa6-57603f2348b8', NULL, '{}', 3),
	('cfde5602-453e-4df0-b14e-bc2e4c6ae5a1', 'kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506928976/selfie-1768506928070.jpg', NULL, '2026-01-15 19:55:30.58996+00', '2026-01-15 19:55:30.58996+00', '2026-01-15 19:55:30.58996+00', '{"eTag": "\"5f99bb3001d78f29173d3c0cfe9ba0eb\"", "size": 47377, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-15T19:55:31.000Z", "contentLength": 47377, "httpStatusCode": 200}', 'c6769aea-fce2-4e7a-9a13-69a78eaa31c6', NULL, '{}', 3),
	('60fbe39b-fbd8-40f3-9981-7d5b99938cda', 'presale-assets', 'presale-logos/1768564554549-mzmn3c.png', NULL, '2026-01-16 11:55:56.441644+00', '2026-01-16 11:55:56.441644+00', '2026-01-16 11:55:56.441644+00', '{"eTag": "\"af3406c09a8ec2e0c65a3f53083fe91a\"", "size": 757349, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T11:55:57.000Z", "contentLength": 757349, "httpStatusCode": 200}', 'd0490c2f-ac9c-4563-88ed-a1ea2adec8ad', NULL, '{}', 2),
	('d0ac7e45-5961-444f-81e7-f5ed593ed48d', 'presale-assets', 'presale-banners/1768564559554-sdkk4e.jpg', NULL, '2026-01-16 11:56:00.60308+00', '2026-01-16 11:56:00.60308+00', '2026-01-16 11:56:00.60308+00', '{"eTag": "\"c51a36fec7b6a0d793f48c0b1e2e0e4b\"", "size": 83715, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-16T11:56:01.000Z", "contentLength": 83715, "httpStatusCode": 200}', '64342960-b0d3-4f92-b7fb-44ae29a87dbb', NULL, '{}', 2),
	('1da32c53-9851-40c2-a1b2-49d44cb06e00', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770053721206.png', NULL, '2026-02-02 17:35:22.006984+00', '2026-02-02 17:35:22.006984+00', '2026-02-02 17:35:22.006984+00', '{"eTag": "\"5c561da066afd2fc82dfb3a03e6b0de1\"", "size": 513656, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T17:35:22.000Z", "contentLength": 513656, "httpStatusCode": 200}', '9f98f90d-167c-4129-9c82-f9edadbba563', NULL, '{}', 2),
	('d0d6eba2-22dc-4b25-b13e-81e85b267fbb', 'presale-assets', 'presale-logos/1768715605250-19l06m.png', NULL, '2026-01-18 05:53:27.037132+00', '2026-01-18 05:53:27.037132+00', '2026-01-18 05:53:27.037132+00', '{"eTag": "\"493c916f9d5a4d7eb2297a13a9ec627f\"", "size": 223887, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-18T05:53:27.000Z", "contentLength": 223887, "httpStatusCode": 200}', '7f8251e3-eee1-4809-b3fe-f71e4874fbbe', NULL, '{}', 2),
	('8cd6f45a-9281-429b-af42-36b8053958c8', 'presale-assets', 'presale-banners/1768715608814-euxfs3.png', NULL, '2026-01-18 05:53:30.007674+00', '2026-01-18 05:53:30.007674+00', '2026-01-18 05:53:30.007674+00', '{"eTag": "\"38afe9be17a44ed50a93564d5fd649c9\"", "size": 79845, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-18T05:53:30.000Z", "contentLength": 79845, "httpStatusCode": 200}', '015c764d-97fa-4c57-8542-559e5dedd228', NULL, '{}', 2),
	('55f0532d-58ec-492e-8183-2917a9655669', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770076827589.png', NULL, '2026-02-03 00:00:28.103088+00', '2026-02-03 00:00:28.103088+00', '2026-02-03 00:00:28.103088+00', '{"eTag": "\"209b81f85d8934e73a63b2d3255d0b77\"", "size": 525030, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-03T00:00:29.000Z", "contentLength": 525030, "httpStatusCode": 200}', '9074ad9d-3a51-4c68-af37-8c33bfd92260', NULL, '{}', 2),
	('e9de2c35-b6fa-4b9d-8c66-fccabc67d092', 'kyc-documents', 'ba2226fb-d798-4d83-9ddb-fc67fdf6bb00/1768982890541/id-front-1768982888127.jpg', NULL, '2026-01-21 08:08:11.171374+00', '2026-01-21 08:08:11.171374+00', '2026-01-21 08:08:11.171374+00', '{"eTag": "\"6f544febcdfd240108264ba1e1910351\"", "size": 183158, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T08:08:12.000Z", "contentLength": 183158, "httpStatusCode": 200}', 'f1f1db1e-e420-4ae4-9347-7155ce48dc65', NULL, '{}', 3),
	('0c58cdab-b961-4746-b3ea-57f60ee60457', 'kyc-documents', 'ba2226fb-d798-4d83-9ddb-fc67fdf6bb00/1768982890541/id-back-1768982888129.jpg', NULL, '2026-01-21 08:08:11.894039+00', '2026-01-21 08:08:11.894039+00', '2026-01-21 08:08:11.894039+00', '{"eTag": "\"493c916f9d5a4d7eb2297a13a9ec627f\"", "size": 223887, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T08:08:12.000Z", "contentLength": 223887, "httpStatusCode": 200}', 'cb92640f-755a-4cdc-9731-570909529d53', NULL, '{}', 3),
	('39189814-760a-4348-9dda-9b5209004835', 'kyc-documents', 'ba2226fb-d798-4d83-9ddb-fc67fdf6bb00/1768982890541/selfie-1768982888130.jpg', NULL, '2026-01-21 08:08:12.304506+00', '2026-01-21 08:08:12.304506+00', '2026-01-21 08:08:12.304506+00', '{"eTag": "\"12711041dee203ba0820f4a87a6b2e67\"", "size": 216132, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T08:08:13.000Z", "contentLength": 216132, "httpStatusCode": 200}', '7395c829-2dcb-4d82-8630-6944c5505112', NULL, '{}', 3),
	('0a984f83-72ef-404a-9a9b-59518c3066d4', 'avatars', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d/1769034911587.png', NULL, '2026-01-21 22:35:12.586113+00', '2026-01-21 22:35:12.586113+00', '2026-01-21 22:35:12.586113+00', '{"eTag": "\"493c916f9d5a4d7eb2297a13a9ec627f\"", "size": 223887, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-21T22:35:13.000Z", "contentLength": 223887, "httpStatusCode": 200}', '5802f754-d436-4d15-ae75-1af9367c659f', NULL, '{}', 2),
	('e12c5a6d-6a8e-4ae5-b012-76c835917746', 'public-files', 'posts/1769460429012-rxe7m.jpg', NULL, '2026-01-26 20:47:14.31963+00', '2026-01-26 20:47:14.31963+00', '2026-01-26 20:47:14.31963+00', '{"eTag": "\"bd7b75343c04a902395ca56d573fc945\"", "size": 69484, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-26T20:47:15.000Z", "contentLength": 69484, "httpStatusCode": 200}', '2861f700-15fc-46cb-a81a-380cc484053e', NULL, '{}', 2),
	('6399ac4c-104c-4d70-8f7e-4ea3ed03c950', 'public-files', 'posts/1769460455835-r6nffk.png', NULL, '2026-01-26 20:47:39.379318+00', '2026-01-26 20:47:39.379318+00', '2026-01-26 20:47:39.379318+00', '{"eTag": "\"af3406c09a8ec2e0c65a3f53083fe91a\"", "size": 757349, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-26T20:47:40.000Z", "contentLength": 757349, "httpStatusCode": 200}', '15103c0f-b530-48bc-a705-143c1873dec8', NULL, '{}', 2),
	('97e1fdac-e80b-4be3-93be-e4500052409a', 'public-files', 'posts/1769460521960-fl92fq.jpg', NULL, '2026-01-26 20:48:44.841235+00', '2026-01-26 20:48:44.841235+00', '2026-01-26 20:48:44.841235+00', '{"eTag": "\"c51a36fec7b6a0d793f48c0b1e2e0e4b\"", "size": 83715, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-26T20:48:45.000Z", "contentLength": 83715, "httpStatusCode": 200}', '3b0cc451-80fe-4f16-bf61-228e87973bea', NULL, '{}', 2),
	('4e8daa10-1c37-4e1e-9391-f9e91b8ddac1', 'public-files', 'posts/1769460599968-h3qlof.png', NULL, '2026-01-26 20:50:05.328577+00', '2026-01-26 20:50:05.328577+00', '2026-01-26 20:50:05.328577+00', '{"eTag": "\"e305ca2354a5e9e4733e26361fcd92b1\"", "size": 2722976, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-26T20:50:06.000Z", "contentLength": 2722976, "httpStatusCode": 200}', '4d0d17ae-3adc-43e3-a2d0-6bb892d596b8', NULL, '{}', 2),
	('018adcac-1493-472d-aaed-4769dad9b666', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770055780740.png', NULL, '2026-02-02 18:09:41.354645+00', '2026-02-02 18:09:41.354645+00', '2026-02-02 18:09:41.354645+00', '{"eTag": "\"cc34eeeed267e6e057327b47d4124070\"", "size": 784662, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T18:09:42.000Z", "contentLength": 784662, "httpStatusCode": 200}', 'ee3ffa3b-7676-473e-b323-872249e19306', NULL, '{}', 2),
	('86028893-050e-4170-8b76-9384876572fd', 'public-files', 'posts/1769460622254-u992jk.jpg', NULL, '2026-01-26 20:50:24.918575+00', '2026-01-26 20:50:24.918575+00', '2026-01-26 20:50:24.918575+00', '{"eTag": "\"a082906fe7dc97e13ae8489ae15e0d64\"", "size": 143472, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-26T20:50:25.000Z", "contentLength": 143472, "httpStatusCode": 200}', '1193c8ee-3365-4aea-a4d7-7e048d31469c', NULL, '{}', 2),
	('851dd866-c226-40e7-9a25-51bfa533d09a', 'public-files', 'posts/1769460777443-vodxr.jpg', NULL, '2026-01-26 20:53:00.330035+00', '2026-01-26 20:53:00.330035+00', '2026-01-26 20:53:00.330035+00', '{"eTag": "\"c51a36fec7b6a0d793f48c0b1e2e0e4b\"", "size": 83715, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-26T20:53:01.000Z", "contentLength": 83715, "httpStatusCode": 200}', 'e4b7207c-c901-4d4c-a197-467938151af4', NULL, '{}', 2),
	('f59a7545-fa2a-4f45-93b9-6cb39ce21142', 'fairlaunch-assets', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23/logo_1770078604181.png', NULL, '2026-02-03 00:30:04.668456+00', '2026-02-03 00:30:04.668456+00', '2026-02-03 00:30:04.668456+00', '{"eTag": "\"34774b041a37856240c2f4b9530a3efa\"", "size": 60377, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-03T00:30:05.000Z", "contentLength": 60377, "httpStatusCode": 200}', 'e730b06e-0e53-48a2-86f7-98297027979d', NULL, '{}', 2),
	('e6a6cf4c-0bcf-4a72-b54c-fa4dce02bd3d', 'public-files', 'posts/1769461374263-pbxy0h.png', NULL, '2026-01-26 21:02:58.956983+00', '2026-01-26 21:02:58.956983+00', '2026-01-26 21:02:58.956983+00', '{"eTag": "\"22b9a3f435524640e8e86268c825e1f6\"", "size": 2027782, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-26T21:02:59.000Z", "contentLength": 2027782, "httpStatusCode": 200}', 'cd5fb131-91a7-4caa-b7e6-a03e73b59b31', NULL, '{}', 2),
	('21db7818-ccff-4e19-9826-fb814ae82c44', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770056575210.png', NULL, '2026-02-02 18:22:55.91675+00', '2026-02-02 18:22:55.91675+00', '2026-02-02 18:22:55.91675+00', '{"eTag": "\"2ddcf7dfe857e149e52bfabca1f8e374\"", "size": 592107, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T18:22:56.000Z", "contentLength": 592107, "httpStatusCode": 200}', '433e14a0-2924-4959-8fd3-06fea70c9815', NULL, '{}', 2),
	('4d3225bd-3904-4786-80f4-7758b638d9dd', 'public-files', 'posts/1769471610701-v1xuqq.jpg', NULL, '2026-01-26 23:53:33.78671+00', '2026-01-26 23:53:33.78671+00', '2026-01-26 23:53:33.78671+00', '{"eTag": "\"96f39bbf22aa42f7fd7c9bfab494b5b6\"", "size": 84598, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-01-26T23:53:34.000Z", "contentLength": 84598, "httpStatusCode": 200}', '71355bbb-ffa7-4bac-8200-add28ea9f284', NULL, '{}', 2),
	('cb1b492d-1f8c-42e5-977d-edceb1b1be8a', 'avatars', '8c1dd323-de22-48e2-9cab-9b71781c6f77/1769547342725.png', NULL, '2026-01-27 20:55:43.352944+00', '2026-01-27 20:55:43.352944+00', '2026-01-27 20:55:43.352944+00', '{"eTag": "\"493c916f9d5a4d7eb2297a13a9ec627f\"", "size": 223887, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-27T20:55:44.000Z", "contentLength": 223887, "httpStatusCode": 200}', '9e37264d-5e32-4dd9-a8d0-870038ef36f8', NULL, '{}', 2),
	('e5d9d7f2-46c4-4eb7-9acb-9f91c4790530', 'avatars', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23/1770080542569.png', NULL, '2026-02-03 01:02:23.428178+00', '2026-02-03 01:02:23.428178+00', '2026-02-03 01:02:23.428178+00', '{"eTag": "\"5c561da066afd2fc82dfb3a03e6b0de1\"", "size": 513656, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-03T01:02:24.000Z", "contentLength": 513656, "httpStatusCode": 200}', '253b6623-0f85-4a95-bf20-044af7f03bd7', NULL, '{}', 2),
	('1bfaa9fd-42fd-4958-b8f5-14d32ff1903a', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769688546988.png', NULL, '2026-01-29 12:09:07.306192+00', '2026-01-29 12:09:07.306192+00', '2026-01-29 12:09:07.306192+00', '{"eTag": "\"af3406c09a8ec2e0c65a3f53083fe91a\"", "size": 757349, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-29T12:09:08.000Z", "contentLength": 757349, "httpStatusCode": 200}', 'f8d2ec74-02ba-420f-88f1-3a01d28b394d', NULL, '{}', 2),
	('e7599599-7e56-4be1-b625-4fd4bbd8f6e1', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769734149970.png', NULL, '2026-01-30 00:49:10.517161+00', '2026-01-30 00:49:10.517161+00', '2026-01-30 00:49:10.517161+00', '{"eTag": "\"5c18676ecd36ab66b908d630da549554\"", "size": 141719, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T00:49:11.000Z", "contentLength": 141719, "httpStatusCode": 200}', 'd322f796-32c9-4cb4-9f27-d307e6f28d79', NULL, '{}', 2),
	('ffc3e7c0-aedb-407b-b568-a6810acbf28b', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769734408254.png', NULL, '2026-01-30 00:53:28.970317+00', '2026-01-30 00:53:28.970317+00', '2026-01-30 00:53:28.970317+00', '{"eTag": "\"2ddcf7dfe857e149e52bfabca1f8e374\"", "size": 592107, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T00:53:29.000Z", "contentLength": 592107, "httpStatusCode": 200}', 'e13dc569-b1c1-4fb2-91c7-c213c642c8a6', NULL, '{}', 2),
	('fa7ce4fb-7388-4967-a37a-beef4a31aad5', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769735760577.png', NULL, '2026-01-30 01:16:01.072099+00', '2026-01-30 01:16:01.072099+00', '2026-01-30 01:16:01.072099+00', '{"eTag": "\"43c91c41ca37043669c4fe75a07a3061\"", "size": 57984, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T01:16:02.000Z", "contentLength": 57984, "httpStatusCode": 200}', 'fb31ca6e-ef6a-448f-9509-21c935336031', NULL, '{}', 2),
	('f753e2e7-cec2-4329-95c6-5bf510a852f0', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769737203067.png', NULL, '2026-01-30 01:40:03.930644+00', '2026-01-30 01:40:03.930644+00', '2026-01-30 01:40:03.930644+00', '{"eTag": "\"cc34eeeed267e6e057327b47d4124070\"", "size": 784662, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T01:40:04.000Z", "contentLength": 784662, "httpStatusCode": 200}', '3ff1c378-67f8-44d0-8ef3-fb26d28d01b9', NULL, '{}', 2),
	('7165e3de-1ffe-4665-bc2b-779e05fc112f', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769768598853.webp', NULL, '2026-01-30 10:23:19.2089+00', '2026-01-30 10:23:19.2089+00', '2026-01-30 10:23:19.2089+00', '{"eTag": "\"876ca137aa61087e831553c9a71f8e3a\"", "size": 16474, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T10:23:20.000Z", "contentLength": 16474, "httpStatusCode": 200}', '8ff7e20b-0170-4e88-82b4-ab4d69929f20', NULL, '{}', 2),
	('b684f8cf-12cc-444b-b708-0a98eb9c7df0', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769776811249.webp', NULL, '2026-01-30 12:40:11.796625+00', '2026-01-30 12:40:11.796625+00', '2026-01-30 12:40:11.796625+00', '{"eTag": "\"876ca137aa61087e831553c9a71f8e3a\"", "size": 16474, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T12:40:12.000Z", "contentLength": 16474, "httpStatusCode": 200}', 'c0857861-a5a5-4275-b532-3e4f9d86e226', NULL, '{}', 2),
	('7d200969-a80a-4594-b63a-c069e548813d', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769782870096.png', NULL, '2026-01-30 14:21:11.082787+00', '2026-01-30 14:21:11.082787+00', '2026-01-30 14:21:11.082787+00', '{"eTag": "\"5337ff29ea2b642c9978da0db0f36df4\"", "size": 1340743, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T14:21:12.000Z", "contentLength": 1340743, "httpStatusCode": 200}', '75dec171-a08f-4a29-a173-88b6e5d8f405', NULL, '{}', 2),
	('ec121bb2-52ad-421b-b749-4929b3f40574', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769785065128.png', NULL, '2026-01-30 14:57:45.980435+00', '2026-01-30 14:57:45.980435+00', '2026-01-30 14:57:45.980435+00', '{"eTag": "\"ee94969aeb69e0e4594fae4deddafe90\"", "size": 704731, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T14:57:46.000Z", "contentLength": 704731, "httpStatusCode": 200}', '7bb263c9-b7c5-4c51-ab4b-ae45c6382e68', NULL, '{}', 2),
	('79556b8a-20a8-4727-a001-47b25dd4dd1f', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770065903006.png', NULL, '2026-02-02 20:58:23.620725+00', '2026-02-02 20:58:23.620725+00', '2026-02-02 20:58:23.620725+00', '{"eTag": "\"283d1e2e303ea77b8d2681e06519bf91\"", "size": 55982, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T20:58:24.000Z", "contentLength": 55982, "httpStatusCode": 200}', '4bbeca02-1491-4e96-aa23-7770fdbfb55b', NULL, '{}', 2),
	('7b6277df-392a-4f9e-af58-7218548250bb', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769786857440.png', NULL, '2026-01-30 15:27:37.946484+00', '2026-01-30 15:27:37.946484+00', '2026-01-30 15:27:37.946484+00', '{"eTag": "\"34774b041a37856240c2f4b9530a3efa\"", "size": 60377, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T15:27:38.000Z", "contentLength": 60377, "httpStatusCode": 200}', '8deeeb12-7c36-4210-b3f7-4355504703ac', NULL, '{}', 2),
	('4a8a80cf-4ba0-4a07-a63a-86d0f9221ba3', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769790907370.webp', NULL, '2026-01-30 16:35:07.870328+00', '2026-01-30 16:35:07.870328+00', '2026-01-30 16:35:07.870328+00', '{"eTag": "\"6bccda05c24ee1f8d9ccf7a1dd0a8546\"", "size": 103720, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T16:35:08.000Z", "contentLength": 103720, "httpStatusCode": 200}', 'ac384f5b-7322-4815-9408-4e6f8dcfd95b', NULL, '{}', 2),
	('72b5c5bd-a7b1-4cd5-a5d8-858a1a14ec28', 'kyc-documents', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23/1770091034934/id-front-1770091033905.jpg', NULL, '2026-02-03 03:57:15.312171+00', '2026-02-03 03:57:15.312171+00', '2026-02-03 03:57:15.312171+00', '{"eTag": "\"834872a1675c41b45b68658e96e4b7e3\"", "size": 179917, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-03T03:57:16.000Z", "contentLength": 179917, "httpStatusCode": 200}', 'f627dff5-f86c-4300-85b7-1a98ef60a048', NULL, '{}', 3),
	('fc68b4f5-8d38-4fda-b528-6aa55995ce64', 'fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f/logo_1769811873206.png', NULL, '2026-01-30 22:24:33.690874+00', '2026-01-30 22:24:33.690874+00', '2026-01-30 22:24:33.690874+00', '{"eTag": "\"948bc724c482e138ba6149927943a70c\"", "size": 14710, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-30T22:24:34.000Z", "contentLength": 14710, "httpStatusCode": 200}', '368e3a1a-5586-4a22-a67f-2fae9a3050c2', NULL, '{}', 2),
	('fc3dc9a7-7b02-47ad-9286-ac5e2601e23e', 'fairlaunch-assets', '5a5b6f7b-95ec-4d6e-a9e3-943aaa0c43ef/logo_1769896257645.png', NULL, '2026-01-31 21:50:58.210391+00', '2026-01-31 21:50:58.210391+00', '2026-01-31 21:50:58.210391+00', '{"eTag": "\"493c916f9d5a4d7eb2297a13a9ec627f\"", "size": 223887, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-31T21:50:59.000Z", "contentLength": 223887, "httpStatusCode": 200}', '5202f61e-ec2d-4fd0-ab9a-65f1547c93f9', NULL, '{}', 2),
	('513d942c-728b-4a75-8081-8558810e342f', 'kyc-documents', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23/1770091034934/id-back-1770091033907.jpg', NULL, '2026-02-03 03:57:15.668835+00', '2026-02-03 03:57:15.668835+00', '2026-02-03 03:57:15.668835+00', '{"eTag": "\"cfafdc0c2392eb5b29a87abf263587de\"", "size": 83312, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-03T03:57:16.000Z", "contentLength": 83312, "httpStatusCode": 200}', 'ce143e27-0625-4627-a6aa-7dbe973599e1', NULL, '{}', 3),
	('33f4775b-46e2-4f49-b543-7726cb410caa', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1769898032187.png', NULL, '2026-01-31 22:20:32.60334+00', '2026-01-31 22:20:32.60334+00', '2026-01-31 22:20:32.60334+00', '{"eTag": "\"8162c39c3dcd57bdc957ef9f2eca9722\"", "size": 3492, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-31T22:20:33.000Z", "contentLength": 3492, "httpStatusCode": 200}', '6395f2b7-665c-486a-ae34-274fbbdd9903', NULL, '{}', 2),
	('7c9ac7ed-8c72-4ec1-bfb4-3aa3075fe030', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1769903368110.png', NULL, '2026-01-31 23:49:28.885144+00', '2026-01-31 23:49:28.885144+00', '2026-01-31 23:49:28.885144+00', '{"eTag": "\"cc34eeeed267e6e057327b47d4124070\"", "size": 784662, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-01-31T23:49:29.000Z", "contentLength": 784662, "httpStatusCode": 200}', 'a5e7edd8-87d5-4404-8ec1-24ed8e4156f4', NULL, '{}', 2),
	('3addf27d-e562-4e1b-a5db-ba403e898918', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1769955423517.png', NULL, '2026-02-01 14:17:04.219635+00', '2026-02-01 14:17:04.219635+00', '2026-02-01 14:17:04.219635+00', '{"eTag": "\"5c561da066afd2fc82dfb3a03e6b0de1\"", "size": 513656, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T14:17:05.000Z", "contentLength": 513656, "httpStatusCode": 200}', 'a40f0f98-61a8-4905-b2fe-4d0976834a72', NULL, '{}', 2),
	('7d9f38af-ccd0-4f2a-b49f-2ea76fbaca8a', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1769958157778.png', NULL, '2026-02-01 15:02:38.300871+00', '2026-02-01 15:02:38.300871+00', '2026-02-01 15:02:38.300871+00', '{"eTag": "\"5c561da066afd2fc82dfb3a03e6b0de1\"", "size": 513656, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T15:02:39.000Z", "contentLength": 513656, "httpStatusCode": 200}', '8c413e01-44cd-4e59-a854-e4e04bcb079a', NULL, '{}', 2),
	('a032ac0a-45cf-484d-a6f6-9de8853f4f9f', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1769970648329.png', NULL, '2026-02-01 18:30:49.110941+00', '2026-02-01 18:30:49.110941+00', '2026-02-01 18:30:49.110941+00', '{"eTag": "\"cc34eeeed267e6e057327b47d4124070\"", "size": 784662, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T18:30:50.000Z", "contentLength": 784662, "httpStatusCode": 200}', '67dcb25b-f965-41ec-a0ab-b779c91f3fd2', NULL, '{}', 2),
	('552d9650-88e7-4284-9a0f-026a612e9739', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1769974297936.webp', NULL, '2026-02-01 19:31:38.230179+00', '2026-02-01 19:31:38.230179+00', '2026-02-01 19:31:38.230179+00', '{"eTag": "\"876ca137aa61087e831553c9a71f8e3a\"", "size": 16474, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T19:31:39.000Z", "contentLength": 16474, "httpStatusCode": 200}', 'a3a62f2e-3347-48b6-baf7-985d15b0055d', NULL, '{}', 2),
	('d2c5b1c7-f67f-48d8-b835-602cb35fcfbd', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770067371821.png', NULL, '2026-02-02 21:22:52.321919+00', '2026-02-02 21:22:52.321919+00', '2026-02-02 21:22:52.321919+00', '{"eTag": "\"34774b041a37856240c2f4b9530a3efa\"", "size": 60377, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T21:22:53.000Z", "contentLength": 60377, "httpStatusCode": 200}', 'c216627d-63eb-4b63-aa3b-3c71ad7a7e0f', NULL, '{}', 2),
	('c29bad95-24d8-4f67-b809-48952e2a8ed6', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1769988012656.png', NULL, '2026-02-01 23:20:13.458517+00', '2026-02-01 23:20:13.458517+00', '2026-02-01 23:20:13.458517+00', '{"eTag": "\"af3406c09a8ec2e0c65a3f53083fe91a\"", "size": 757349, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-01T23:20:14.000Z", "contentLength": 757349, "httpStatusCode": 200}', 'b6a0c43a-7ec3-4ec6-af88-feea80ceeb3b', NULL, '{}', 2),
	('6a26d53d-5b99-4748-8f56-2875bef80f94', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770006183819.png', NULL, '2026-02-02 04:23:04.684085+00', '2026-02-02 04:23:04.684085+00', '2026-02-02 04:23:04.684085+00', '{"eTag": "\"209b81f85d8934e73a63b2d3255d0b77\"", "size": 525030, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T04:23:05.000Z", "contentLength": 525030, "httpStatusCode": 200}', '45f86bd0-a7c6-4e45-b2e6-f875072e331b', NULL, '{}', 2),
	('5ba38235-13f6-47a3-8fb4-749f7f86a663', 'kyc-documents', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23/1770091034934/selfie-1770091033909.jpg', NULL, '2026-02-03 03:57:16.02168+00', '2026-02-03 03:57:16.02168+00', '2026-02-03 03:57:16.02168+00', '{"eTag": "\"8a6e5031c1a4057f3a54e911ce9b10d7\"", "size": 202921, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-03T03:57:16.000Z", "contentLength": 202921, "httpStatusCode": 200}', 'acdd0942-c3f2-496b-86a3-dde545aea1c1', NULL, '{}', 3),
	('ef40293f-e441-4012-b0b5-2309aa9de2b4', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770007231842.png', NULL, '2026-02-02 04:40:32.230985+00', '2026-02-02 04:40:32.230985+00', '2026-02-02 04:40:32.230985+00', '{"eTag": "\"34774b041a37856240c2f4b9530a3efa\"", "size": 60377, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T04:40:33.000Z", "contentLength": 60377, "httpStatusCode": 200}', 'ae6823b5-315b-4f27-914a-2ff03fa4b62e', NULL, '{}', 2),
	('3c026a15-878c-4d9c-9c75-79ed8b6b6a1c', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770007792418.png', NULL, '2026-02-02 04:49:53.402579+00', '2026-02-02 04:49:53.402579+00', '2026-02-02 04:49:53.402579+00', '{"eTag": "\"40f693afbc0c4c1bcf2ba7d97ffc9258\"", "size": 1126340, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T04:49:54.000Z", "contentLength": 1126340, "httpStatusCode": 200}', 'badc91da-a838-4a7f-8ffd-ed4abd427427', NULL, '{}', 2),
	('22e9bf87-6213-427b-bce1-57a8015e0af4', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770008062574.png', NULL, '2026-02-02 04:54:22.883818+00', '2026-02-02 04:54:22.883818+00', '2026-02-02 04:54:22.883818+00', '{"eTag": "\"8162c39c3dcd57bdc957ef9f2eca9722\"", "size": 3492, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T04:54:23.000Z", "contentLength": 3492, "httpStatusCode": 200}', '4703612f-ed4d-4ce9-bc1d-79dca3a5fe68', NULL, '{}', 2),
	('bf34930e-d7be-4bd9-8a58-ba33a81368d1', 'fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde/logo_1770013647006.png', NULL, '2026-02-02 06:27:27.805312+00', '2026-02-02 06:27:27.805312+00', '2026-02-02 06:27:27.805312+00', '{"eTag": "\"95eaabb52338fc7d885e2752e0ef0265\"", "size": 732142, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-02T06:27:28.000Z", "contentLength": 732142, "httpStatusCode": 200}', '47414606-b1bd-47b8-9682-4375fd407297', NULL, '{}', 2);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('kyc-documents', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23', '2026-02-03 03:57:15.312171+00', '2026-02-03 03:57:15.312171+00'),
	('kyc-documents', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23/1770091034934', '2026-02-03 03:57:15.312171+00', '2026-02-03 03:57:15.312171+00'),
	('kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e', '2026-01-15 19:47:09.021946+00', '2026-01-15 19:47:09.021946+00'),
	('kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506428345', '2026-01-15 19:47:09.021946+00', '2026-01-15 19:47:09.021946+00'),
	('kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506528999', '2026-01-15 19:48:49.814173+00', '2026-01-15 19:48:49.814173+00'),
	('kyc-documents', 'ea044662-4135-48a6-a84d-c6d507bb052e/1768506928976', '2026-01-15 19:55:29.50918+00', '2026-01-15 19:55:29.50918+00'),
	('presale-assets', 'presale-logos', '2026-01-16 11:55:56.441644+00', '2026-01-16 11:55:56.441644+00'),
	('presale-assets', 'presale-banners', '2026-01-16 11:56:00.60308+00', '2026-01-16 11:56:00.60308+00'),
	('kyc-documents', 'ba2226fb-d798-4d83-9ddb-fc67fdf6bb00', '2026-01-21 08:08:11.171374+00', '2026-01-21 08:08:11.171374+00'),
	('kyc-documents', 'ba2226fb-d798-4d83-9ddb-fc67fdf6bb00/1768982890541', '2026-01-21 08:08:11.171374+00', '2026-01-21 08:08:11.171374+00'),
	('avatars', '2c9fb12c-a387-46b9-83a9-a6ce13fcef6d', '2026-01-21 22:35:12.586113+00', '2026-01-21 22:35:12.586113+00'),
	('public-files', 'posts', '2026-01-26 20:47:14.31963+00', '2026-01-26 20:47:14.31963+00'),
	('avatars', '8c1dd323-de22-48e2-9cab-9b71781c6f77', '2026-01-27 20:55:43.352944+00', '2026-01-27 20:55:43.352944+00'),
	('fairlaunch-assets', 'be60a77e-3d66-4f35-a18a-5eda99ec6e2f', '2026-01-29 12:09:07.306192+00', '2026-01-29 12:09:07.306192+00'),
	('fairlaunch-assets', '5a5b6f7b-95ec-4d6e-a9e3-943aaa0c43ef', '2026-01-31 21:50:58.210391+00', '2026-01-31 21:50:58.210391+00'),
	('fairlaunch-assets', 'd18dfb9d-233c-4320-b3b8-90b01b327cde', '2026-01-31 22:20:32.60334+00', '2026-01-31 22:20:32.60334+00'),
	('fairlaunch-assets', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23', '2026-02-03 00:30:04.668456+00', '2026-02-03 00:30:04.668456+00'),
	('avatars', 'a0f64677-e16a-4880-bfaa-d4e4d8211d23', '2026-02-03 01:02:23.428178+00', '2026-02-03 01:02:23.428178+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict igDum6ve8YjnbZ63c4Tc459RE3rthdfpjilOTV1eOrKnqlPG2DXS7xKyO6ggPho

RESET ALL;
