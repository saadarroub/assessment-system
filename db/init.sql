--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-10-26 14:08:07

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
-- TOC entry 2 (class 3079 OID 16388)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 234 (class 1259 OID 16645)
-- Name: answer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.answer (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    session_id uuid NOT NULL,
    question_id uuid NOT NULL,
    value jsonb NOT NULL,
    score integer DEFAULT 0,
    answered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.answer OWNER TO CURRENT_USER;

--
-- TOC entry 233 (class 1259 OID 16617)
-- Name: assessment_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_session (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    company_id uuid NOT NULL,
    thema_id uuid NOT NULL,
    worker_id uuid NOT NULL,
    status text DEFAULT 'started'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    total_score integer DEFAULT 0,
    max_possible_score integer DEFAULT 0,
    CONSTRAINT assessment_session_status_check CHECK ((status = ANY (ARRAY['started'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])))
);


ALTER TABLE public.assessment_session OWNER TO CURRENT_USER;

--
-- TOC entry 235 (class 1259 OID 16667)
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    target_table text NOT NULL,
    target_id uuid NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    details jsonb,
    ip_address inet,
    user_agent text
);


ALTER TABLE public.audit_log OWNER TO CURRENT_USER;

--
-- TOC entry 226 (class 1259 OID 16500)
-- Name: catalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.catalog (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.catalog OWNER TO CURRENT_USER;

--
-- TOC entry 223 (class 1259 OID 16465)
-- Name: company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.company OWNER TO CURRENT_USER;

--
-- TOC entry 220 (class 1259 OID 16422)
-- Name: permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.permission OWNER TO CURRENT_USER;

--
-- TOC entry 230 (class 1259 OID 16558)
-- Name: question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    text text NOT NULL,
    type_id uuid NOT NULL,
    options jsonb,
    scoring_schema jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.question OWNER TO CURRENT_USER;

--
-- TOC entry 232 (class 1259 OID 16597)
-- Name: question_condition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_condition (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    source_question_id uuid NOT NULL,
    target_node_id uuid NOT NULL,
    operator text NOT NULL,
    expected_value text NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.question_condition OWNER TO CURRENT_USER;

--
-- TOC entry 231 (class 1259 OID 16573)
-- Name: question_node; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_node (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    thema_id uuid NOT NULL,
    question_id uuid NOT NULL,
    parent_node_id uuid,
    order_index integer DEFAULT 0,
    is_required boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.question_node OWNER TO CURRENT_USER;

--
-- TOC entry 229 (class 1259 OID 16547)
-- Name: question_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_type (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    input_type text NOT NULL,
    has_options boolean DEFAULT false,
    description text
);


ALTER TABLE public.question_type OWNER TO CURRENT_USER;

--
-- TOC entry 219 (class 1259 OID 16411)
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role OWNER TO CURRENT_USER;

--
-- TOC entry 222 (class 1259 OID 16449)
-- Name: role_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permission (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    granted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role_permission OWNER TO CURRENT_USER;

--
-- TOC entry 225 (class 1259 OID 16490)
-- Name: thema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thema (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.thema OWNER TO CURRENT_USER;

--
-- TOC entry 227 (class 1259 OID 16510)
-- Name: thema_catalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thema_catalog (
    thema_id uuid NOT NULL,
    catalog_id uuid NOT NULL,
    order_index integer DEFAULT 0
);


ALTER TABLE public.thema_catalog OWNER TO CURRENT_USER;

--
-- TOC entry 221 (class 1259 OID 16433)
-- Name: user_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_role (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_role OWNER TO CURRENT_USER;

--
-- TOC entry 218 (class 1259 OID 16399)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password text
);


ALTER TABLE public.users OWNER TO CURRENT_USER;

--
-- TOC entry 224 (class 1259 OID 16475)
-- Name: worker; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    work_space_ref text NOT NULL,
    company_id uuid NOT NULL,
    email text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.worker OWNER TO CURRENT_USER;

--
-- TOC entry 228 (class 1259 OID 16526)
-- Name: worker_catalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_catalog (
    worker_id uuid NOT NULL,
    catalog_id uuid NOT NULL,
    company_id uuid NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id uuid DEFAULT public.uuid_generate_v4(),
    access_code text,
    access_token text,
    status text DEFAULT 'assigned'::text NOT NULL,
    assigned_by_id uuid,
    expires_at timestamp without time zone,
    first_access_at timestamp without time zone,
    last_access_at timestamp without time zone,
    completed_at timestamp without time zone,
    notes text,
    CONSTRAINT chk_wc_status CHECK ((status = ANY (ARRAY['assigned'::text, 'started'::text, 'in_progress'::text, 'completed'::text, 'expired'::text, 'revoked'::text])))
);


ALTER TABLE public.worker_catalog OWNER TO CURRENT_USER;

--
-- TOC entry 5023 (class 0 OID 16645)
-- Dependencies: 234
-- Data for Name: answer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.answer (id, session_id, question_id, value, score, answered_at) FROM stdin;
\.


--
-- TOC entry 5022 (class 0 OID 16617)
-- Dependencies: 233
-- Data for Name: assessment_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_session (id, company_id, thema_id, worker_id, status, created_at, completed_at, total_score, max_possible_score) FROM stdin;
\.


--
-- TOC entry 5024 (class 0 OID 16667)
-- Dependencies: 235
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (id, user_id, action, target_table, target_id, "timestamp", details, ip_address, user_agent) FROM stdin;
\.


--
-- TOC entry 5015 (class 0 OID 16500)
-- Dependencies: 226
-- Data for Name: catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.catalog (id, title, description, created_at, updated_at) FROM stdin;
10000001-2222-3333-4444-555555555555	Full-Stack Developer Assessment	Umfassende Bewertung für Full-Stack Entwickler - Frontend, Backend, DevOps	2023-01-15 09:00:00	2025-07-27 01:00:01.399411
10000002-2222-3333-4444-555555555555	Senior Software Engineer Evaluation	Erweiterte technische Bewertung für Senior-Positionen	2023-01-15 09:15:00	2025-07-27 01:00:01.399411
10000003-2222-3333-4444-555555555555	DevOps Engineer Competency	Spezialisierte Bewertung für DevOps-Ingenieure	2023-01-15 09:30:00	2025-07-27 01:00:01.399411
10000004-2222-3333-4444-555555555555	Data Scientist Profile	Kompetenzprofil für Data Scientists und Analysten	2023-01-15 09:45:00	2025-07-27 01:00:01.399411
10000005-2222-3333-4444-555555555555	Cloud Architect Assessment	Cloud-Architektur und Infrastructure-Bewertung	2023-01-15 10:00:00	2025-07-27 01:00:01.399411
10000006-2222-3333-4444-555555555555	Cyber Security Specialist	IT-Sicherheits-Kompetenz und Risk Assessment	2023-01-15 10:15:00	2025-07-27 01:00:01.399411
10000007-2222-3333-4444-555555555555	Mobile App Developer Kit	Mobile Entwicklung - iOS, Android, Cross-Platform	2023-01-15 10:30:00	2025-07-27 01:00:01.399411
10000008-2222-3333-4444-555555555555	QA Engineer Evaluation	Quality Assurance und Test-Automatisierung	2023-01-15 10:45:00	2025-07-27 01:00:01.399411
10000009-2222-3333-4444-555555555555	Frontend Specialist Assessment	UI/UX und Frontend-Technologie Fokus	2023-01-15 11:00:00	2025-07-27 01:00:01.399411
1000000a-2222-3333-4444-555555555555	Backend Engineer Profile	Server-Side Development und API Design	2023-01-15 11:15:00	2025-07-27 01:00:01.399411
20000001-2222-3333-4444-555555555555	Team Lead Assessment	Bewertung für Team-Führungskräfte	2023-01-15 11:30:00	2025-07-27 01:00:01.399411
20000002-2222-3333-4444-555555555555	Project Manager Competency	Projektmanagement-Fähigkeiten und Methodiken	2023-01-15 11:45:00	2025-07-27 01:00:01.399411
20000003-2222-3333-4444-555555555555	Senior Management Evaluation	Strategische Führung und Unternehmensleitung	2023-01-15 12:00:00	2025-07-27 01:00:01.399411
20000004-2222-3333-4444-555555555555	Agile Coach Profile	Agile Transformation und Scrum Mastery	2023-01-15 12:15:00	2025-07-27 01:00:01.399411
20000005-2222-3333-4444-555555555555	Product Owner Assessment	Product Management und Stakeholder Relations	2023-01-15 12:30:00	2025-07-27 01:00:01.399411
20000006-2222-3333-4444-555555555555	Change Management Leader	Veränderungsmanagement und Transformation	2023-01-15 12:45:00	2025-07-27 01:00:01.399411
20000007-2222-3333-4444-555555555555	Digital Transformation Manager	Digitale Transformation und Innovation	2023-01-15 13:00:00	2025-07-27 01:00:01.399411
20000008-2222-3333-4444-555555555555	Operations Manager Profile	Betriebsführung und Prozessoptimierung	2023-01-15 13:15:00	2025-07-27 01:00:01.399411
20000009-2222-3333-4444-555555555555	Strategic Business Leader	Strategische Planung und Geschäftsentwicklung	2023-01-15 13:30:00	2025-07-27 01:00:01.399411
2000000a-2222-3333-4444-555555555555	Innovation Manager Assessment	Innovationsmanagement und Creative Leadership	2023-01-15 13:45:00	2025-07-27 01:00:01.399411
30000001-2222-3333-4444-555555555555	FinTech Professional	Finanzdienstleistung und Banking Technology	2023-01-15 14:00:00	2025-07-27 01:00:01.399411
30000002-2222-3333-4444-555555555555	Healthcare IT Specialist	Medizinische Informatik und Health Systems	2023-01-15 14:15:00	2025-07-27 01:00:01.399411
30000003-2222-3333-4444-555555555555	E-Commerce Manager	Online Handel und Digital Commerce	2023-01-15 14:30:00	2025-07-27 01:00:01.399411
30000004-2222-3333-4444-555555555555	Manufacturing Tech Expert	Industrie 4.0 und Smart Manufacturing	2023-01-15 14:45:00	2025-07-27 01:00:01.399411
30000005-2222-3333-4444-555555555555	EdTech Professional	Bildungstechnologie und E-Learning	2023-01-15 15:00:00	2025-07-27 01:00:01.399411
30000006-2222-3333-4444-555555555555	Gaming Industry Assessment	Spieleentwicklung und Entertainment Tech	2023-01-15 15:15:00	2025-07-27 01:00:01.399411
30000007-2222-3333-4444-555555555555	Automotive Tech Specialist	Automobilbranche und Connected Mobility	2023-01-15 15:30:00	2025-07-27 01:00:01.399411
30000008-2222-3333-4444-555555555555	Green Tech Professional	Nachhaltige Technologien und Clean Energy	2023-01-15 15:45:00	2025-07-27 01:00:01.399411
30000009-2222-3333-4444-555555555555	Public Sector IT	E-Government und öffentliche Verwaltung	2023-01-15 16:00:00	2025-07-27 01:00:01.399411
3000000a-2222-3333-4444-555555555555	Telecommunications Expert	Telekommunikation und Network Technologies	2023-01-15 16:15:00	2025-07-27 01:00:01.399411
40000001-2222-3333-4444-555555555555	Junior Developer Onboarding	Einstiegsbewertung für Junior-Entwickler	2023-01-15 16:30:00	2025-07-27 01:00:01.399411
40000002-2222-3333-4444-555555555555	Mid-Level Professional	Bewertung für erfahrene Fachkräfte	2023-01-15 16:45:00	2025-07-27 01:00:01.399411
40000003-2222-3333-4444-555555555555	Senior Expert Evaluation	Hochqualifizierte Spezialisten und Experten	2023-01-15 17:00:00	2025-07-27 01:00:01.399411
40000004-2222-3333-4444-555555555555	Executive Assessment	C-Level und Geschäftsführung Bewertung	2023-01-15 17:15:00	2025-07-27 01:00:01.399411
40000005-2222-3333-4444-555555555555	Graduate Trainee Program	Hochschulabsolventen und Trainee-Programme	2023-01-15 17:30:00	2025-07-27 01:00:01.399411
40000006-2222-3333-4444-555555555555	Career Transition Assessment	Karrierewechsel und Neuorientierung	2023-01-15 17:45:00	2025-07-27 01:00:01.399411
40000007-2222-3333-4444-555555555555	High Potential Identification	Talentidentifikation und Potenzialanalyse	2023-01-15 18:00:00	2025-07-27 01:00:01.399411
40000008-2222-3333-4444-555555555555	Succession Planning Profile	Nachfolgeplanung und Führungskräfte-Pipeline	2023-01-15 18:15:00	2025-07-27 01:00:01.399411
40000009-2222-3333-4444-555555555555	Expert Consultant Assessment	Externe Berater und Freelancer	2023-01-15 18:30:00	2025-07-27 01:00:01.399411
4000000a-2222-3333-4444-555555555555	Research & Development Profile	F&E-Mitarbeiter und Innovatoren	2023-01-15 18:45:00	2025-07-27 01:00:01.399411
50000001-2222-3333-4444-555555555555	Annual Performance Review	Jährliche Leistungsbeurteilung - Allgemein	2023-01-15 19:00:00	2025-07-27 01:00:01.399411
50000002-2222-3333-4444-555555555555	Quarterly Check-In	Quartalsmäßige Entwicklungsgespräche	2023-01-15 19:15:00	2025-07-27 01:00:01.399411
50000003-2222-3333-4444-555555555555	Skills Gap Analysis Complete	Umfassende Kompetenzlücken-Analyse	2023-01-15 19:30:00	2025-07-27 01:00:01.399411
50000004-2222-3333-4444-555555555555	Team Building & Collaboration	Teamwork und Zusammenarbeit Fokus	2023-01-15 19:45:00	2025-07-27 01:00:01.399411
50000005-2222-3333-4444-555555555555	Remote Work Excellence	Home Office und verteilte Teams	2023-01-15 20:00:00	2025-07-27 01:00:01.399411
50000006-2222-3333-4444-555555555555	Cultural Integration Assessment	Unternehmenskultur und Wertepassung	2023-01-15 20:15:00	2025-07-27 01:00:01.399411
50000007-2222-3333-4444-555555555555	Innovation & Creativity Profile	Innovationskraft und kreatives Denken	2023-01-15 20:30:00	2025-07-27 01:00:01.399411
50000008-2222-3333-4444-555555555555	Customer-Centric Excellence	Kundenorientierung und Service Quality	2023-01-15 20:45:00	2025-07-27 01:00:01.399411
50000009-2222-3333-4444-555555555555	Global Mindset Assessment	Internationale Kompetenz und Kulturverständnis	2023-01-15 21:00:00	2025-07-27 01:00:01.399411
5000000a-2222-3333-4444-555555555555	Sustainability & Ethics Profile	Nachhaltigkeit und ethische Kompetenz	2023-01-15 21:15:00	2025-07-27 01:00:01.399411
60000001-2222-3333-4444-555555555555	Merger & Acquisition Integration	M&A Integrations-Assessment	2023-01-15 21:30:00	2025-07-27 01:00:01.399411
60000002-2222-3333-4444-555555555555	Crisis Management Readiness	Krisenmanagement und Business Continuity	2023-01-15 21:45:00	2025-07-27 01:00:01.399411
60000003-2222-3333-4444-555555555555	Digital Nomad Compatibility	Ortsunabhängiges Arbeiten und Flexibilität	2023-01-15 22:00:00	2025-07-27 01:00:01.399411
60000004-2222-3333-4444-555555555555	Startup Ecosystem Assessment	Startup-Umfeld und Entrepreneurship	2023-01-15 22:15:00	2025-07-27 01:00:01.399411
60000005-2222-3333-4444-555555555555	Scale-Up Leadership Profile	Wachstumsunternehmen Management	2023-01-15 22:30:00	2025-07-27 01:00:01.399411
60000006-2222-3333-4444-555555555555	Corporate Innovation Lab	Unternehmens-Innovation und Intrapreneurship	2023-01-15 22:45:00	2025-07-27 01:00:01.399411
60000007-2222-3333-4444-555555555555	Multi-Cultural Team Leadership	Internationale Teams und Cultural Diversity	2023-01-15 23:00:00	2025-07-27 01:00:01.399411
60000008-2222-3333-4444-555555555555	AI Ethics & Responsible Tech	Ethische KI und verantwortliche Technologie	2023-01-15 23:15:00	2025-07-27 01:00:01.399411
60000009-2222-3333-4444-555555555555	Future Skills Readiness	Zukunftskompetenzen und Emerging Technologies	2023-01-15 23:30:00	2025-07-27 01:00:01.399411
6000000a-2222-3333-4444-555555555555	Hybrid Work Excellence	Hybride Arbeitsmodelle und New Work	2023-01-15 23:45:00	2025-07-27 01:00:01.399411
\.


--
-- TOC entry 5012 (class 0 OID 16465)
-- Dependencies: 223
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company (id, name, description, created_at, updated_at) FROM stdin;
c1000000-1111-2222-3333-444444444444	TechCorp Deutschland GmbH	Führendes Softwareentwicklungsunternehmen mit 500+ Mitarbeitern	2023-01-01 00:00:00	2025-07-27 01:00:01.399411
c2000000-1111-2222-3333-444444444444	ConsultCorp International	Globales Beratungsunternehmen mit Fokus auf digitale Transformation	2023-01-15 00:00:00	2025-07-27 01:00:01.399411
c3000000-1111-2222-3333-444444444444	Innovate Solutions España	Mittelständisches IT-Unternehmen in Madrid, 150 Mitarbeiter	2023-02-01 00:00:00	2025-07-27 01:00:01.399411
c4000000-1111-2222-3333-444444444444	Digital France SARL	Französisches Digitalisierungsunternehmen, 80 Mitarbeiter	2023-02-15 00:00:00	2025-07-27 01:00:01.399411
c5000000-1111-2222-3333-444444444444	StartupIO	Schnell wachsendes FinTech Startup, 25 Mitarbeiter	2023-03-01 00:00:00	2025-07-27 01:00:01.399411
c6000000-1111-2222-3333-444444444444	GreenTech Innovations	Nachhaltiges Technologie-Startup, 15 Mitarbeiter	2023-03-15 00:00:00	2025-07-27 01:00:01.399411
c7000000-1111-2222-3333-444444444444	Manufacturing Excellence AG	Traditionsreiches Maschinenbauunternehmen, 300 Mitarbeiter	2023-04-01 00:00:00	2025-07-27 01:00:01.399411
c8000000-1111-2222-3333-444444444444	Automotive Solutions Ltd	Automobilzulieferer mit internationaler Präsenz, 450 Mitarbeiter	2023-04-15 00:00:00	2025-07-27 01:00:01.399411
c9000000-1111-2222-3333-444444444444	Healthcare Professionals	Medizinisches Personaldienstleistungsunternehmen, 120 Mitarbeiter	2023-05-01 00:00:00	2025-07-27 01:00:01.399411
ca000000-1111-2222-3333-444444444444	Education Services International	Bildungsdienstleister und E-Learning Plattform, 90 Mitarbeiter	2023-05-15 00:00:00	2025-07-27 01:00:01.399411
cb000000-1111-2222-3333-444444444444	Non-Profit Foundation	Gemeinnützige Organisation für digitale Bildung, 35 Mitarbeiter	2023-06-01 00:00:00	2025-07-27 01:00:01.399411
cc000000-1111-2222-3333-444444444444	City Administration Hamburg	Städtische Verwaltung Hamburg, IT-Abteilung, 200 Mitarbeiter	2023-06-15 00:00:00	2025-07-27 01:00:01.399411
cd000000-1111-2222-3333-444444444444	Global Tech Solutions	Multinationales Technologieunternehmen mit Standorten weltweit	2023-07-01 00:00:00	2025-07-27 01:00:01.399411
ce000000-1111-2222-3333-444444444444	European Banking Group	Europäische Bankengruppe mit digitaler Transformation	2023-07-15 00:00:00	2025-07-27 01:00:01.399411
cf000000-1111-2222-3333-444444444444	Retail Chain International	Internationale Einzelhandelskette mit E-Commerce Fokus	2023-08-01 00:00:00	2025-07-27 01:00:01.399411
\.


--
-- TOC entry 5009 (class 0 OID 16422)
-- Dependencies: 220
-- Data for Name: permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permission (id, name, description, created_at) FROM stdin;
07133552-0ce0-4e33-95b0-dd4b1502793d	create_assessment	Create new assessments	2025-07-17 03:23:47.988778
51e649a7-93b8-4469-bba1-1ba5c689abbe	edit_assessment	Edit existing assessments	2025-07-17 03:23:47.988778
6aa8f33a-3fac-4085-a091-26bbeef5ad30	delete_assessment	Delete assessments	2025-07-17 03:23:47.988778
6fd4f962-489f-47fb-b675-07d5bc060ef5	view_assessment	View assessments	2025-07-17 03:23:47.988778
570cd61d-564e-4fa9-bae3-597d21651782	manage_users	Manage user accounts	2025-07-17 03:23:47.988778
bd09939e-c3b1-4158-8b04-2fa4106ee4d0	manage_companies	Manage company data	2025-07-17 03:23:47.988778
a6fdaa54-6518-4675-b6b0-379bb90334b8	view_reports	View assessment reports	2025-07-17 03:23:47.988778
33989264-26cc-4387-87d7-601c86972229	export_data	Export assessment data	2025-07-17 03:23:47.988778
\.


--
-- TOC entry 5019 (class 0 OID 16558)
-- Dependencies: 230
-- Data for Name: question; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question (id, text, type_id, options, scoring_schema, created_at, updated_at) FROM stdin;
a1000001-1111-2222-3333-444444444444	Welche der folgenden Datenstrukturen bietet die beste durchschnittliche Zeitkomplexität für Suchoperationen?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Array", "Linked List", "Hash Table", "Binary Tree"]	{"points": {"Array": 1, "Hash Table": 3, "Binary Tree": 2, "Linked List": 0}, "correct_answer": "Hash Table"}	2023-01-10 08:00:00	2025-07-27 01:00:01.399411
a1000002-1111-2222-3333-444444444444	Was ist der Hauptunterschied zwischen Stack und Queue Datenstrukturen?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Stack ist LIFO, Queue ist FIFO", "Stack ist FIFO, Queue ist LIFO", "Beide sind LIFO", "Beide sind FIFO"]	{"points": {"Beide sind FIFO": 0, "Beide sind LIFO": 0, "Stack ist FIFO, Queue ist LIFO": 0, "Stack ist LIFO, Queue ist FIFO": 3}, "correct_answer": "Stack ist LIFO, Queue ist FIFO"}	2023-01-10 08:15:00	2025-07-27 01:00:01.399411
a1000003-1111-2222-3333-444444444444	Erklären Sie in 2-3 Sätzen den Unterschied zwischen synchroner und asynchroner Programmierung.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"keywords": ["blocking", "asynchron", "parallel", "callback", "await"], "max_points": 3, "evaluation_criteria": ["mentions_blocking", "mentions_non_blocking", "mentions_concurrency"]}	2023-01-10 08:30:00	2025-07-27 01:00:01.399411
a1000004-1111-2222-3333-444444444444	Bewerten Sie Ihre Erfahrung mit objektorientierter Programmierung (1=Anfänger, 5=Experte)	f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	{"max": 5, "min": 1, "step": 1}	{"weight": 0.8, "scale_points": {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}}	2023-01-10 08:45:00	2025-07-27 01:00:01.399411
a1000005-1111-2222-3333-444444444444	Welche Programmiersprachen haben Sie in den letzten 2 Jahren produktiv verwendet?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["JavaScript", "Python", "Java", "C#", "Go", "Rust", "TypeScript", "PHP"]	{"max_points": 10, "points_per_selection": 1, "bonus_modern_languages": {"Go": 1, "Rust": 2, "TypeScript": 1}}	2023-01-10 09:00:00	2025-07-27 01:00:01.399411
a1000006-1111-2222-3333-444444444444	Wie viele Jahre Berufserfahrung haben Sie in der Softwareentwicklung?	b794ee11-f3f0-424b-85b8-1e92e290714b	["0-1 Jahre", "2-3 Jahre", "4-5 Jahre", "6-10 Jahre", "Über 10 Jahre"]	{"experience_points": {"0-1 Jahre": 1, "2-3 Jahre": 2, "4-5 Jahre": 3, "6-10 Jahre": 4, "Über 10 Jahre": 5}}	2023-01-10 09:15:00	2025-07-27 01:00:01.399411
a1000007-1111-2222-3333-444444444444	Beschreiben Sie Ihren Ansatz zur Fehlersuche in einer komplexen Anwendung mit Performance-Problemen.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "tools_bonus": ["profiler", "debugger", "monitoring", "logging"], "evaluation_criteria": ["systematic_approach", "mentions_tools", "mentions_monitoring", "mentions_logging"]}	2023-01-10 09:30:00	2025-07-27 01:00:01.399411
a1000008-1111-2222-3333-444444444444	Wie viele Code-Reviews führen Sie durchschnittlich pro Woche durch?	313b814e-18fc-4e15-978b-19e35444ab19	{"max": 50, "min": 0}	{"optimal_range": [6, 15], "scoring_bands": {"0": 0, "1-5": 2, "21+": 3, "6-10": 3, "11-20": 4}}	2023-01-10 09:45:00	2025-07-27 01:00:01.399411
b2000001-1111-2222-3333-444444444444	Welcher Führungsstil ist in agilen Entwicklungsumgebungen am effektivsten?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Autoritär", "Delegativ", "Demokratisch/Partizipativ", "Laissez-faire"]	{"points": {"Delegativ": 2, "Autoritär": 0, "Laissez-faire": 1, "Demokratisch/Partizipativ": 3}, "correct_answer": "Demokratisch/Partizipativ"}	2023-01-10 10:00:00	2025-07-27 01:00:01.399411
b2000002-1111-2222-3333-444444444444	Beschreiben Sie eine Situation, in der Sie einen Konflikt zwischen Teammitgliedern erfolgreich gelöst haben.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 5, "bonus_keywords": ["mediation", "win-win", "compromise", "communication"], "evaluation_criteria": ["specific_situation", "conflict_analysis", "resolution_steps", "outcome"]}	2023-01-10 10:15:00	2025-07-27 01:00:01.399411
b2000003-1111-2222-3333-444444444444	Wie schätzen Sie Ihre Fähigkeit ein, andere zu motivieren und zu inspirieren? (1=Schwach, 5=Sehr stark)	f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	{"max": 5, "min": 1, "step": 1}	{"scale_points": {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}, "moderation_factor": 0.9}	2023-01-10 10:30:00	2025-07-27 01:00:01.399411
b2000004-1111-2222-3333-444444444444	Welche Management- und Projekttools haben Sie bereits erfolgreich eingesetzt?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["Jira", "Trello", "Asana", "Monday.com", "Slack", "Microsoft Teams", "Confluence", "Notion"]	{"max_points": 8, "points_per_tool": 1, "tool_categories": {"communication": ["Slack", "Microsoft Teams"], "documentation": ["Confluence", "Notion"], "project_management": ["Jira", "Trello", "Asana", "Monday.com"]}}	2023-01-10 10:45:00	2025-07-27 01:00:01.399411
b2000005-1111-2222-3333-444444444444	Wie treffen Sie wichtige Entscheidungen in Ihrem Team? Beschreiben Sie Ihren Entscheidungsprozess.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "process_keywords": ["analyse", "konsultieren", "bewerten", "kommunizieren"], "evaluation_criteria": ["data_driven", "stakeholder_involvement", "risk_assessment", "communication"]}	2023-01-10 11:00:00	2025-07-27 01:00:01.399411
b2000006-1111-2222-3333-444444444444	Wie groß war das größte Team, das Sie direkt geführt haben?	b794ee11-f3f0-424b-85b8-1e92e290714b	["Noch kein Team geführt", "2-3 Personen", "4-6 Personen", "7-10 Personen", "11-15 Personen", "Über 15 Personen"]	{"team_size_points": {"2-3 Personen": 2, "4-6 Personen": 3, "7-10 Personen": 4, "11-15 Personen": 5, "Über 15 Personen": 5, "Noch kein Team geführt": 0}}	2023-01-10 11:15:00	2025-07-27 01:00:01.399411
b2000007-1111-2222-3333-444444444444	Wie häufig sollten One-on-One Gespräche mit direkten Mitarbeitern stattfinden?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Täglich", "Wöchentlich", "Alle zwei Wochen", "Monatlich", "Quartalsweise"]	{"points": {"Täglich": 1, "Monatlich": 2, "Wöchentlich": 3, "Quartalsweise": 1, "Alle zwei Wochen": 3}, "optimal_answer": "Wöchentlich"}	2023-01-10 11:30:00	2025-07-27 01:00:01.399411
b2000008-1111-2222-3333-444444444444	Wie viele Weiterbildungsstunden pro Jahr sollten Sie für jeden Mitarbeiter budgetieren?	313b814e-18fc-4e15-978b-19e35444ab19	{"max": 200, "min": 0}	{"scoring": {"0-10": 1, "121+": 3, "11-20": 2, "21-40": 4, "41-80": 5, "81-120": 4}, "optimal_range": [20, 60]}	2023-01-10 11:45:00	2025-07-27 01:00:01.399411
c3000001-1111-2222-3333-444444444444	Was ist der wichtigste Faktor für exzellenten Kundenservice?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Schnelle Antwortzeiten", "Empathie und Verständnis", "Technisches Fachwissen", "Kostengünstige Lösungen"]	{"points": {"Schnelle Antwortzeiten": 2, "Technisches Fachwissen": 2, "Empathie und Verständnis": 3, "Kostengünstige Lösungen": 1}, "best_answer": "Empathie und Verständnis"}	2023-01-10 12:00:00	2025-07-27 01:00:01.399411
c3000002-1111-2222-3333-444444444444	Beschreiben Sie, wie Sie mit einem sehr verärgerten Kunden umgehen würden, der eine sofortige Lösung verlangt.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "evaluation_criteria": ["active_listening", "empathy", "solution_focus", "escalation_awareness"], "deescalation_keywords": ["verstehen", "entschuldigung", "lösung", "hilfe"]}	2023-01-10 12:15:00	2025-07-27 01:00:01.399411
c3000003-1111-2222-3333-444444444444	Wie bewerten Sie Ihre Fähigkeit, komplexe technische Sachverhalte verständlich zu erklären? (1=Sehr schwer, 5=Sehr leicht)	f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	{"max": 5, "min": 1, "step": 1}	{"scale_points": {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}, "communication_weight": 1.2}	2023-01-10 12:30:00	2025-07-27 01:00:01.399411
c3000004-1111-2222-3333-444444444444	Über welche Kanäle haben Sie bereits erfolgreich Kundensupport geleistet?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["E-Mail", "Telefon", "Live Chat", "Video Call", "Social Media", "Ticketing System", "Knowledge Base", "Community Forum"]	{"max_points": 10, "channel_complexity": {"E-Mail": 1, "Telefon": 2, "Live Chat": 2, "Video Call": 3, "Social Media": 2, "Knowledge Base": 2, "Community Forum": 2, "Ticketing System": 1}, "points_per_channel": 1}	2023-01-10 12:45:00	2025-07-27 01:00:01.399411
c3000005-1111-2222-3333-444444444444	Wann haben Sie zuletzt an einer Schulung für Kundenservice oder Kommunikation teilgenommen?	626e5582-37cb-45b2-ac7e-e913cb3f334f	\N	{"recency_scoring": {"never": 0, "1_to_2_years": 1, "over_2_years": 0, "within_6_months": 3, "6_months_to_1_year": 2}}	2023-01-10 13:00:00	2025-07-27 01:00:01.399411
c3000006-1111-2222-3333-444444444444	Wie nutzen Sie negatives Kundenfeedback zur Verbesserung Ihrer Dienstleistung?	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "evaluation_criteria": ["constructive_approach", "learning_mindset", "process_improvement", "follow_up"], "improvement_keywords": ["lernen", "verbessern", "anpassen", "feedback"]}	2023-01-10 13:15:00	2025-07-27 01:00:01.399411
c3000007-1111-2222-3333-444444444444	Welche durchschnittliche Kundenzufriedenheitsbewertung haben Sie in den letzten 12 Monaten erreicht? (1-10 Skala)	313b814e-18fc-4e15-978b-19e35444ab19	{"max": 10, "min": 1}	{"satisfaction_bands": {"9-10": 5, "5-5.9": 1, "6-6.9": 2, "7-7.9": 3, "8-8.9": 4, "below_5": 0}}	2023-01-10 13:30:00	2025-07-27 01:00:01.399411
e3000001-1111-2222-3333-444444444444	Was ist der wichtigste Faktor für exzellenten Kundenservice?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Schnelle Antwortzeiten", "Empathie und Verständnis", "Technisches Fachwissen", "Kostengünstige Lösungen"]	{"points": {"Schnelle Antwortzeiten": 2, "Technisches Fachwissen": 2, "Empathie und Verständnis": 3, "Kostengünstige Lösungen": 1}, "best_answer": "Empathie und Verständnis"}	2023-01-10 12:00:00	2025-07-27 01:00:01.399411
e3000002-1111-2222-3333-444444444444	Beschreiben Sie, wie Sie mit einem sehr verärgerten Kunden umgehen würden, der eine sofortige Lösung verlangt.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "evaluation_criteria": ["active_listening", "empathy", "solution_focus", "escalation_awareness"], "deescalation_keywords": ["verstehen", "entschuldigung", "lösung", "hilfe"]}	2023-01-10 12:15:00	2025-07-27 01:00:01.399411
e3000003-1111-2222-3333-444444444444	Wie bewerten Sie Ihre Fähigkeit, komplexe technische Sachverhalte verständlich zu erklären? (1=Sehr schwer, 5=Sehr leicht)	f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	{"max": 5, "min": 1, "step": 1}	{"scale_points": {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}, "communication_weight": 1.2}	2023-01-10 12:30:00	2025-07-27 01:00:01.399411
e3000004-1111-2222-3333-444444444444	Über welche Kanäle haben Sie bereits erfolgreich Kundensupport geleistet?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["E-Mail", "Telefon", "Live Chat", "Video Call", "Social Media", "Ticketing System", "Knowledge Base", "Community Forum"]	{"max_points": 10, "channel_complexity": {"E-Mail": 1, "Telefon": 2, "Live Chat": 2, "Video Call": 3, "Social Media": 2, "Knowledge Base": 2, "Community Forum": 2, "Ticketing System": 1}, "points_per_channel": 1}	2023-01-10 12:45:00	2025-07-27 01:00:01.399411
e3000005-1111-2222-3333-444444444444	Wann haben Sie zuletzt an einer Schulung für Kundenservice oder Kommunikation teilgenommen?	626e5582-37cb-45b2-ac7e-e913cb3f334f	\N	{"recency_scoring": {"never": 0, "1_to_2_years": 1, "over_2_years": 0, "within_6_months": 3, "6_months_to_1_year": 2}}	2023-01-10 13:00:00	2025-07-27 01:00:01.399411
e3000006-1111-2222-3333-444444444444	Wie nutzen Sie negatives Kundenfeedback zur Verbesserung Ihrer Dienstleistung?	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "evaluation_criteria": ["constructive_approach", "learning_mindset", "process_improvement", "follow_up"], "improvement_keywords": ["lernen", "verbessern", "anpassen", "feedback"]}	2023-01-10 13:15:00	2025-07-27 01:00:01.399411
e3000007-1111-2222-3333-444444444444	Welche durchschnittliche Kundenzufriedenheitsbewertung haben Sie in den letzten 12 Monaten erreicht? (1-10 Skala)	313b814e-18fc-4e15-978b-19e35444ab19	{"max": 10, "min": 1}	{"satisfaction_bands": {"9-10": 5, "5-5.9": 1, "6-6.9": 2, "7-7.9": 3, "8-8.9": 4, "below_5": 0}}	2023-01-10 13:30:00	2025-07-27 01:00:01.399411
e3000008-1111-2222-3333-444444444444	Was ist der effektivste Weg, das Vertrauen eines Kunden nach einem Service-Fehler wiederherzustellen?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Rabatt anbieten", "Persönliche Entschuldigung und Lösung", "Escalation an Management", "Standard-Kompensation"]	{"points": {"Rabatt anbieten": 1, "Standard-Kompensation": 1, "Escalation an Management": 2, "Persönliche Entschuldigung und Lösung": 3}, "best_answer": "Persönliche Entschuldigung und Lösung"}	2023-01-10 13:45:00	2025-07-27 01:00:01.399411
e4000001-1111-2222-3333-444444444444	Mit welchen digitalen Marketing-Kanälen haben Sie praktische Erfahrung?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["Google Ads", "Facebook Ads", "LinkedIn Ads", "SEO", "Content Marketing", "Email Marketing", "Influencer Marketing", "Affiliate Marketing"]	{"max_points": 12, "channel_tiers": {"tier_1": ["Google Ads", "Facebook Ads", "SEO"], "tier_2": ["LinkedIn Ads", "Email Marketing", "Content Marketing"], "tier_3": ["Influencer Marketing", "Affiliate Marketing"]}, "points_per_channel": 1}	2023-01-10 14:00:00	2025-07-27 01:00:01.399411
e4000002-1111-2222-3333-444444444444	Beschreiben Sie Ihre Herangehensweise bei der Planung einer neuen Marketing-Kampagne.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 5, "strategy_keywords": ["zielgruppe", "kpi", "budget", "measurement", "testing"], "evaluation_criteria": ["target_audience", "goals_kpis", "channel_selection", "budget_allocation", "measurement"]}	2023-01-10 14:15:00	2025-07-27 01:00:01.399411
e4000003-1111-2222-3333-444444444444	Welches Tool ist am besten geeignet für detaillierte Website-Verhaltensanalysen?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Google Analytics", "Hotjar", "SEMrush", "Mailchimp"]	{"points": {"Hotjar": 3, "SEMrush": 1, "Mailchimp": 0, "Google Analytics": 2}, "best_answer": "Hotjar"}	2023-01-10 14:30:00	2025-07-27 01:00:01.399411
e4000004-1111-2222-3333-444444444444	Was ist eine typische Conversion Rate für E-Commerce Websites in Prozent?	313b814e-18fc-4e15-978b-19e35444ab19	{"max": 50, "min": 0}	{"industry_knowledge": {"scoring": {"1-3": 5, "10+": 1, "0-0.4": 1, "3.1-5": 4, "5.1-10": 2, "0.5-0.9": 3}, "optimal_range": [1, 4]}}	2023-01-10 14:45:00	2025-07-27 01:00:01.399411
e4000005-1111-2222-3333-444444444444	Wie erfahren sind Sie mit A/B Testing und statistischer Signifikanz? (1=Anfänger, 5=Experte)	f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	{"max": 5, "min": 1, "step": 1}	{"scale_points": {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}, "testing_weight": 1.3}	2023-01-10 15:00:00	2025-07-27 01:00:01.399411
e4000006-1111-2222-3333-444444444444	Erklären Sie, wie Sie den ROI einer Marketing-Kampagne berechnen und bewerten.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "roi_keywords": ["investition", "gewinn", "kosten", "attribution", "ltv"], "evaluation_criteria": ["roi_formula", "cost_factors", "attribution", "lifetime_value"]}	2023-01-10 15:15:00	2025-07-27 01:00:01.399411
e4000007-1111-2222-3333-444444444444	Welches ist das größte monatliche Marketing-Budget, das Sie eigenverantwortlich verwaltet haben?	b794ee11-f3f0-424b-85b8-1e92e290714b	["Unter 1.000€", "1.000€ - 5.000€", "5.000€ - 15.000€", "15.000€ - 50.000€", "Über 50.000€", "Noch kein Budget verwaltet"]	{"budget_experience": {"Unter 1.000€": 1, "Über 50.000€": 5, "1.000€ - 5.000€": 2, "5.000€ - 15.000€": 3, "15.000€ - 50.000€": 4, "Noch kein Budget verwaltet": 0}}	2023-01-10 15:30:00	2025-07-27 01:00:01.399411
e4000008-1111-2222-3333-444444444444	Was ist bei E-Mail Marketing unter der DSGVO am wichtigsten zu beachten?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Double Opt-In Verfahren", "Personalisierte Ansprache", "Häufiger Versand", "Günstige Preise bewerben"]	{"points": {"Häufiger Versand": 0, "Double Opt-In Verfahren": 3, "Günstige Preise bewerben": 0, "Personalisierte Ansprache": 1}, "correct_answer": "Double Opt-In Verfahren"}	2023-01-10 15:45:00	2025-07-27 01:00:01.399411
e5000001-1111-2222-3333-444444444444	Welche Programmiersprachen nutzen Sie regelmäßig für Datenanalyse?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["Python", "R", "SQL", "Scala", "Julia", "MATLAB", "SAS", "JavaScript"]	{"max_points": 10, "language_points": {"R": 3, "SAS": 1, "SQL": 2, "Julia": 2, "Scala": 2, "MATLAB": 1, "Python": 3, "JavaScript": 1}}	2023-01-10 16:00:00	2025-07-27 01:00:01.399411
e5000002-1111-2222-3333-444444444444	Erklären Sie den Unterschied zwischen Korrelation und Kausalität mit einem praktischen Beispiel.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "concept_keywords": ["korrelation", "kausalität", "zusammenhang", "ursache"], "evaluation_criteria": ["correlation_definition", "causation_definition", "practical_example", "distinguishing_factors"]}	2023-01-10 16:15:00	2025-07-27 01:00:01.399411
e5000003-1111-2222-3333-444444444444	Welcher Algorithmus ist am besten für die Vorhersage kontinuierlicher Werte geeignet?	cb6290b1-5592-4835-bb1e-e45906ece53a	["K-Means Clustering", "Linear Regression", "Decision Trees", "K-Nearest Neighbors"]	{"points": {"Decision Trees": 2, "Linear Regression": 3, "K-Means Clustering": 0, "K-Nearest Neighbors": 2}, "best_answer": "Linear Regression"}	2023-01-10 16:30:00	2025-07-27 01:00:01.399411
e5000004-1111-2222-3333-444444444444	Wie bewerten Sie Ihre Kenntnisse in pandas (Python) oder dplyr (R)? (1=Grundlagen, 5=Experte)	f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	{"max": 5, "min": 1, "step": 1}	{"scale_points": {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}, "library_importance": 1.4}	2023-01-10 16:45:00	2025-07-27 01:00:01.399411
e5000005-1111-2222-3333-444444444444	Was ist ein akzeptabler R² Wert für ein Regressionsmodell in den meisten Business-Anwendungen (in Prozent)?	313b814e-18fc-4e15-978b-19e35444ab19	{"max": 100, "min": 0}	{"r_squared_scoring": {"0-49": 1, "50-59": 3, "60-69": 4, "70-85": 5, "85-95": 4, "95-100": 2}}	2023-01-10 17:00:00	2025-07-27 01:00:01.399411
e5000006-1111-2222-3333-444444444444	Beschreiben Sie Ihren Ansatz zum Umgang mit fehlenden Werten (Missing Values) in einem Datensatz.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "methods_keywords": ["mean", "median", "interpolation", "deletion", "imputation"], "evaluation_criteria": ["analysis_step", "imputation_methods", "deletion_strategy", "validation"]}	2023-01-10 17:15:00	2025-07-27 01:00:01.399411
e5000007-1111-2222-3333-444444444444	Mit welchen Tools erstellen Sie Datenvisualisierungen?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["Matplotlib", "Seaborn", "Plotly", "Tableau", "Power BI", "ggplot2", "D3.js", "Excel"]	{"max_points": 10, "points_per_tool": 1, "tool_categories": {"basic": ["Excel"], "business": ["Tableau", "Power BI"], "programming": ["Matplotlib", "Seaborn", "Plotly", "ggplot2", "D3.js"]}}	2023-01-10 17:30:00	2025-07-27 01:00:01.399411
e5000008-1111-2222-3333-444444444444	Mit welcher Datensatzgröße haben Sie schon gearbeitet?	b794ee11-f3f0-424b-85b8-1e92e290714b	["Unter 10.000 Zeilen", "10.000 - 100.000 Zeilen", "100.000 - 1 Million Zeilen", "1 - 10 Millionen Zeilen", "Über 10 Millionen Zeilen"]	{"size_experience": {"Unter 10.000 Zeilen": 1, "1 - 10 Millionen Zeilen": 4, "10.000 - 100.000 Zeilen": 2, "Über 10 Millionen Zeilen": 5, "100.000 - 1 Million Zeilen": 3}}	2023-01-10 17:45:00	2025-07-27 01:00:01.399411
f1000001-1111-2222-3333-444444444444	Welche Kubernetes-Ressource ist am besten geeignet, um sicherzustellen, dass ein Pod auf jedem Node im Cluster läuft?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Deployment", "DaemonSet", "StatefulSet", "ReplicaSet"]	{"points": {"DaemonSet": 5, "Deployment": 1, "ReplicaSet": 0, "StatefulSet": 2}, "difficulty": "advanced", "correct_answer": "DaemonSet"}	2023-01-11 08:00:00	2025-07-27 01:00:01.399411
f1000002-1111-2222-3333-444444444444	Beschreiben Sie die Vorteile von Infrastructure as Code (IaC) und nennen Sie mindestens 3 konkrete Tools.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"min_tools": 3, "max_points": 6, "tool_examples": ["Terraform", "Ansible", "CloudFormation", "Pulumi"], "evaluation_criteria": ["reproducibility", "version_control", "automation", "consistency"]}	2023-01-11 08:15:00	2025-07-27 01:00:01.399411
f1000003-1111-2222-3333-444444444444	Mit welchen Cloud-Plattformen haben Sie produktive Erfahrung bei der Implementierung von CI/CD-Pipelines?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["AWS (CodePipeline)", "Azure DevOps", "Google Cloud Build", "GitLab CI/CD", "Jenkins", "GitHub Actions", "CircleCI", "Bamboo"]	{"max_points": 12, "traditional": {"Bamboo": 1}, "cloud_native": {"Azure DevOps": 3, "AWS (CodePipeline)": 3, "Google Cloud Build": 3}, "platform_agnostic": {"Jenkins": 2, "CircleCI": 2, "GitLab CI/CD": 2, "GitHub Actions": 2}}	2023-01-11 08:30:00	2025-07-27 01:00:01.399411
f1000004-1111-2222-3333-444444444444	Bewerten Sie Ihre Erfahrung mit Application Performance Monitoring (APM) und Observability (1=Grundlagen, 5=Experte)	f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	{"max": 5, "min": 1, "step": 1}	{"scale_points": {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}, "modern_importance": true, "observability_weight": 1.5}	2023-01-11 08:45:00	2025-07-27 01:00:01.399411
f1000005-1111-2222-3333-444444444444	Welche Sicherheitsmaßnahmen integrieren Sie standardmäßig in Ihre CI/CD-Pipelines?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["Container Scanning", "Static Code Analysis", "Dependency Scanning", "Secret Detection", "Infrastructure Security Tests", "Penetration Testing", "Compliance Checks", "Runtime Security"]	{"max_points": 10, "points_per_measure": 1, "security_categories": {"runtime": ["Runtime Security"], "detective": ["Container Scanning", "Penetration Testing"], "compliance": ["Compliance Checks", "Infrastructure Security Tests"], "preventive": ["Static Code Analysis", "Dependency Scanning", "Secret Detection"]}}	2023-01-11 09:00:00	2025-07-27 01:00:01.399411
f1000006-1111-2222-3333-444444444444	Wie lange ist Ihr angestrebtes Recovery Time Objective (RTO) für kritische Produktionssysteme?	b794ee11-f3f0-424b-85b8-1e92e290714b	["< 15 Minuten", "15-60 Minuten", "1-4 Stunden", "4-24 Stunden", "1-3 Tage", "Noch nicht definiert"]	{"rto_scoring": {"1-3 Tage": 1, "1-4 Stunden": 3, "4-24 Stunden": 2, "< 15 Minuten": 5, "15-60 Minuten": 4, "Noch nicht definiert": 0}, "business_criticality": "high"}	2023-01-11 09:15:00	2025-07-27 01:00:01.399411
f1000007-1111-2222-3333-444444444444	Welche monatlichen Cloud-Kosten haben Sie in Ihrem letzten Projekt optimiert (in EUR)?	313b814e-18fc-4e15-978b-19e35444ab19	{"max": 1000000, "min": 0}	{"cost_bands": {"0": 0, "1-1000": 2, "100000+": 5, "1001-5000": 3, "5001-20000": 4, "20001-100000": 5}, "optimization_experience": true}	2023-01-11 09:30:00	2025-07-27 01:00:01.399411
f1000008-1111-2222-3333-444444444444	Erklären Sie Ihren Ansatz zur Automatisierung von Deployment-Prozessen und welche Herausforderungen Sie dabei bewältigt haben.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 5, "automation_keywords": ["continuous", "automated", "testing", "rollback", "monitoring"], "evaluation_criteria": ["automation_strategy", "toolchain_selection", "rollback_mechanisms", "testing_integration", "challenges_overcome"]}	2023-01-11 09:45:00	2025-07-27 01:00:01.399411
f2000001-1111-2222-3333-444444444444	Was ist der Hauptzweck des Sprint Review Meetings?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Team Performance bewerten", "Product Increment demonstrieren und Feedback sammeln", "Sprint Planning für nächsten Sprint", "Impediments besprechen"]	{"points": {"Impediments besprechen": 1, "Team Performance bewerten": 1, "Sprint Planning für nächsten Sprint": 0, "Product Increment demonstrieren und Feedback sammeln": 3}, "correct_answer": "Product Increment demonstrieren und Feedback sammeln"}	2023-01-11 10:00:00	2025-07-27 01:00:01.399411
f2000002-1111-2222-3333-444444444444	Beschreiben Sie eine konkrete Situation, in der Sie als Scrum Master einen Konflikt zwischen Product Owner und Entwicklungsteam moderiert haben.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 5, "evaluation_criteria": ["conflict_identification", "stakeholder_management", "mediation_approach", "outcome_achievement", "prevention_measures"], "scrum_master_skills": ["facilitation", "coaching", "servant_leadership"]}	2023-01-11 10:15:00	2025-07-27 01:00:01.399411
f2000003-1111-2222-3333-444444444444	Welche Metriken verwenden Sie zur Messung der Team-Performance in agilen Projekten?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["Velocity", "Burndown Chart", "Cycle Time", "Lead Time", "Team Happiness Index", "Code Coverage", "Defect Rate", "Sprint Goal Achievement"]	{"max_points": 10, "metric_categories": {"flow": ["Cycle Time", "Lead Time"], "team": ["Team Happiness Index"], "quality": ["Code Coverage", "Defect Rate"], "delivery": ["Sprint Goal Achievement"], "velocity": ["Velocity", "Burndown Chart"]}, "points_per_metric": 1}	2023-01-11 10:30:00	2025-07-27 01:00:01.399411
f2000004-1111-2222-3333-444444444444	Wie viele verschiedene Stakeholder-Gruppen haben Sie gleichzeitig in einem Projekt koordiniert?	b794ee11-f3f0-424b-85b8-1e92e290714b	["1-2 Stakeholder-Gruppen", "3-4 Stakeholder-Gruppen", "5-7 Stakeholder-Gruppen", "8-10 Stakeholder-Gruppen", "Über 10 Stakeholder-Gruppen"]	{"stakeholder_complexity": {"1-2 Stakeholder-Gruppen": 1, "3-4 Stakeholder-Gruppen": 2, "5-7 Stakeholder-Gruppen": 3, "8-10 Stakeholder-Gruppen": 4, "Über 10 Stakeholder-Gruppen": 5}}	2023-01-11 10:45:00	2025-07-27 01:00:01.399411
f2000005-1111-2222-3333-444444444444	Bewerten Sie Ihre Fähigkeit, Widerstand gegen agile Transformation zu überwinden (1=Schwierig, 5=Sehr erfolgreich)	f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	{"max": 5, "min": 1, "step": 1}	{"scale_points": {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}, "change_management_weight": 1.3, "transformation_importance": true}	2023-01-11 11:00:00	2025-07-27 01:00:01.399411
f2000006-1111-2222-3333-444444444444	Wie identifizieren und managen Sie Risiken in agilen Projekten?	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "risk_keywords": ["identifikation", "bewertung", "mitigation", "monitoring"], "evaluation_criteria": ["risk_identification_methods", "mitigation_strategies", "stakeholder_communication", "continuous_monitoring"]}	2023-01-11 11:15:00	2025-07-27 01:00:01.399411
f2000007-1111-2222-3333-444444444444	Welche ist die größte Projektteam-Größe, die Sie erfolgreich geleitet haben?	313b814e-18fc-4e15-978b-19e35444ab19	{"max": 200, "min": 1}	{"team_size_scoring": {"1-5": 2, "100+": 3, "6-10": 3, "11-20": 4, "21-50": 5, "51-100": 4}, "optimal_agile_range": [7, 12]}	2023-01-11 11:30:00	2025-07-27 01:00:01.399411
f2000008-1111-2222-3333-444444444444	Wann haben Sie zuletzt Verantwortung für ein Projektbudget übernommen?	626e5582-37cb-45b2-ac7e-e913cb3f334f	\N	{"recency_scoring": {"never": 0, "1_to_2_years": 3, "2_to_3_years": 2, "over_3_years": 1, "within_6_months": 5, "6_months_to_1_year": 4}}	2023-01-11 11:45:00	2025-07-27 01:00:01.399411
f3000001-1111-2222-3333-444444444444	Welche Rolle spielen Design Tokens in einem modernen Design System?	cb6290b1-5592-4835-bb1e-e45906ece53a	["Farbpalette definieren", "Konsistente Design-Entscheidungen über Plattformen hinweg", "CSS-Variablen erstellen", "Typografie festlegen"]	{"points": {"Typografie festlegen": 1, "Farbpalette definieren": 1, "CSS-Variablen erstellen": 2, "Konsistente Design-Entscheidungen über Plattformen hinweg": 3}, "best_answer": "Konsistente Design-Entscheidungen über Plattformen hinweg"}	2023-01-11 12:00:00	2025-07-27 01:00:01.399411
f3000002-1111-2222-3333-444444444444	Beschreiben Sie Ihren Prozess für die Durchführung von User Journey Mapping und welche Erkenntnisse Sie dabei gewonnen haben.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 5, "ux_methodologies": ["personas", "interviews", "observation", "analytics"], "evaluation_criteria": ["research_methods", "stakeholder_involvement", "touchpoint_identification", "pain_point_analysis", "actionable_insights"]}	2023-01-11 12:15:00	2025-07-27 01:00:01.399411
f3000003-1111-2222-3333-444444444444	Mit welchen Frontend-Frameworks und Libraries haben Sie in den letzten 2 Jahren produktiv gearbeitet?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["React", "Vue.js", "Angular", "Svelte", "TypeScript", "Tailwind CSS", "Styled Components", "Next.js", "Nuxt.js", "Gatsby"]	{"max_points": 12, "framework_tiers": {"tier_1": ["React", "Vue.js", "Angular"], "specialized": ["Svelte", "Styled Components", "Nuxt.js", "Gatsby"], "modern_tools": ["TypeScript", "Tailwind CSS", "Next.js"]}, "points_per_technology": 1}	2023-01-11 12:30:00	2025-07-27 01:00:01.399411
f3000004-1111-2222-3333-444444444444	Bewerten Sie Ihr Wissen über Barrierefreiheit (WCAG) in der Webentwicklung (1=Grundlagen, 5=Experte)	f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	{"max": 5, "min": 1, "step": 1}	{"scale_points": {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}, "accessibility_weight": 1.4, "compliance_importance": true}	2023-01-11 12:45:00	2025-07-27 01:00:01.399411
f3000005-1111-2222-3333-444444444444	Welche Design- und Prototyping-Tools verwenden Sie regelmäßig?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["Figma", "Sketch", "Adobe XD", "InVision", "Principle", "Framer", "Zeplin", "Abstract", "Miro", "Whimsical"]	{"max_points": 10, "points_per_tool": 1, "tool_categories": {"design": ["Figma", "Sketch", "Adobe XD"], "ideation": ["Miro", "Whimsical"], "prototyping": ["InVision", "Principle", "Framer"], "collaboration": ["Zeplin", "Abstract"]}}	2023-01-11 13:00:00	2025-07-27 01:00:01.399411
f3000006-1111-2222-3333-444444444444	Welche Ladezeit (in Sekunden) streben Sie für die First Contentful Paint (FCP) an?	313b814e-18fc-4e15-978b-19e35444ab19	{"max": 10.0, "min": 0.1}	{"performance_scoring": {"0.1-1.0": 5, "1.1-1.8": 4, "1.9-3.0": 3, "3.1-5.0": 2, "5.1-10.0": 1, "above_10": 0}, "web_vitals_awareness": true}	2023-01-11 13:15:00	2025-07-27 01:00:01.399411
f3000007-1111-2222-3333-444444444444	Erklären Sie Ihren Ansatz für Mobile-First Design und welche Breakpoints Sie typischerweise verwenden.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "evaluation_criteria": ["mobile_first_understanding", "breakpoint_strategy", "content_prioritization", "performance_considerations"], "responsive_keywords": ["mobile-first", "breakpoints", "flexible", "scalable"]}	2023-01-11 13:30:00	2025-07-27 01:00:01.399411
f3000008-1111-2222-3333-444444444444	Wann haben Sie zuletzt einen A/B Test für UI/UX Verbesserungen durchgeführt?	626e5582-37cb-45b2-ac7e-e913cb3f334f	\N	{"recency_scoring": {"never": 0, "1_to_2_years": 2, "over_2_years": 1, "3_to_6_months": 4, "within_3_months": 5, "6_months_to_1_year": 3}}	2023-01-11 13:45:00	2025-07-27 01:00:01.399411
f4000001-1111-2222-3333-444444444444	Welche SQL-Funktion verwenden Sie, um einen laufenden Durchschnitt über die letzten 3 Monate zu berechnen?	cb6290b1-5592-4835-bb1e-e45906ece53a	["ROLLING AVERAGE", "WINDOW FUNCTION mit ROWS", "GROUP BY mit HAVING", "RECURSIVE CTE"]	{"points": {"RECURSIVE CTE": 2, "ROLLING AVERAGE": 0, "GROUP BY mit HAVING": 1, "WINDOW FUNCTION mit ROWS": 4}, "difficulty": "advanced", "correct_answer": "WINDOW FUNCTION mit ROWS"}	2023-01-11 14:00:00	2025-07-27 01:00:01.399411
f4000002-1111-2222-3333-444444444444	Beschreiben Sie Ihren Ansatz zur Handhabung von slowly changing dimensions (SCD) in einem Data Warehouse.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "dwh_concepts": ["type1", "type2", "type3", "surrogate_keys"], "evaluation_criteria": ["scd_types_knowledge", "implementation_approach", "performance_considerations", "business_impact"]}	2023-01-11 14:15:00	2025-07-27 01:00:01.399411
f4000003-1111-2222-3333-444444444444	Mit welchen Big Data Technologien haben Sie bereits gearbeitet?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["Apache Spark", "Hadoop", "Kafka", "Elasticsearch", "MongoDB", "Cassandra", "Snowflake", "Databricks", "Apache Airflow", "dbt"]	{"max_points": 12, "points_per_tech": 1, "technology_tiers": {"search": ["Elasticsearch"], "storage": ["Hadoop", "MongoDB", "Cassandra", "Snowflake"], "streaming": ["Kafka", "Spark"], "processing": ["Spark", "Databricks"], "orchestration": ["Apache Airflow", "dbt"]}}	2023-01-11 14:30:00	2025-07-27 01:00:01.399411
f4000004-1111-2222-3333-444444444444	Bewerten Sie Ihre Kenntnisse in fortgeschrittener Statistik (Hypothesentests, Regressionsanalyse) (1=Grundlagen, 5=Experte)	f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	{"max": 5, "min": 1, "step": 1}	{"scale_points": {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}, "analytical_depth": true, "statistics_weight": 1.5}	2023-01-11 14:45:00	2025-07-27 01:00:01.399411
f4000005-1111-2222-3333-444444444444	Welche Aspekte der Datenqualität überwachen Sie standardmäßig in Ihren Analytics-Projekten?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["Completeness", "Accuracy", "Consistency", "Timeliness", "Validity", "Uniqueness", "Integrity", "Lineage Tracking"]	{"max_points": 10, "points_per_aspect": 1, "quality_dimensions": {"core": ["Completeness", "Accuracy", "Consistency"], "temporal": ["Timeliness"], "governance": ["Lineage Tracking"], "structural": ["Validity", "Uniqueness", "Integrity"]}}	2023-01-11 15:00:00	2025-07-27 01:00:01.399411
f4000006-1111-2222-3333-444444444444	Wie viele Machine Learning Modelle haben Sie bereits in Produktionsumgebungen deployed?	313b814e-18fc-4e15-978b-19e35444ab19	{"max": 100, "min": 0}	{"ml_experience": {"0": 0, "1-2": 2, "21+": 5, "3-5": 3, "6-10": 4, "11-20": 5}, "production_readiness": true}	2023-01-11 15:15:00	2025-07-27 01:00:01.399411
f4000007-1111-2222-3333-444444444444	Wie erklären Sie komplexe analytische Erkenntnisse an nicht-technische Stakeholder?	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 4, "evaluation_criteria": ["visualization_approach", "storytelling", "business_context", "actionable_insights"], "communication_keywords": ["visualisierung", "story", "kontext", "empfehlung"]}	2023-01-11 15:30:00	2025-07-27 01:00:01.399411
f4000008-1111-2222-3333-444444444444	Wann haben Sie zuletzt ein Real-time Dashboard oder Streaming Analytics implementiert?	626e5582-37cb-45b2-ac7e-e913cb3f334f	\N	{"recency_scoring": {"never": 0, "1_to_2_years": 3, "2_to_3_years": 2, "over_3_years": 1, "within_6_months": 5, "6_months_to_1_year": 4}}	2023-01-11 15:45:00	2025-07-27 01:00:01.399411
f5000001-1111-2222-3333-444444444444	Welche der folgenden Angriffsvektoren stellt aktuell die größte Bedrohung für Unternehmen dar?	cb6290b1-5592-4835-bb1e-e45906ece53a	["SQL Injection", "Ransomware", "Cross-Site Scripting (XSS)", "Buffer Overflow"]	{"points": {"Ransomware": 3, "SQL Injection": 2, "Buffer Overflow": 1, "Cross-Site Scripting (XSS)": 2}, "current_threats": "Ransomware", "threat_awareness": "2023"}	2023-01-11 16:00:00	2025-07-27 01:00:01.399411
f5000002-1111-2222-3333-444444444444	Beschreiben Sie die ersten 5 Schritte Ihres Incident Response Plans bei einem vermuteten Data Breach.	e1062c1c-62dd-4c80-b614-defb1abe977f	\N	{"max_points": 5, "ir_keywords": ["isolieren", "bewerten", "melden", "untersuchen", "wiederherstellen"], "evaluation_criteria": ["containment", "assessment", "notification", "investigation", "recovery"]}	2023-01-11 16:15:00	2025-07-27 01:00:01.399411
f5000003-1111-2222-3333-444444444444	Mit welchen Security Frameworks und Standards haben Sie praktische Erfahrung?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["ISO 27001", "NIST Cybersecurity Framework", "OWASP Top 10", "CIS Controls", "SOC 2", "GDPR", "BSI IT-Grundschutz", "COBIT"]	{"max_points": 10, "framework_categories": {"controls": ["CIS Controls"], "national": ["BSI IT-Grundschutz"], "compliance": ["SOC 2", "GDPR"], "governance": ["COBIT"], "application": ["OWASP Top 10"], "international": ["ISO 27001", "NIST Cybersecurity Framework"]}, "points_per_framework": 1}	2023-01-11 16:30:00	2025-07-27 01:00:01.399411
f5000004-1111-2222-3333-444444444444	Bewerten Sie Ihre praktische Erfahrung mit Penetration Testing und Vulnerability Assessment (1=Theoretisch, 5=Experte)	f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	{"max": 5, "min": 1, "step": 1}	{"scale_points": {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}, "practical_skills": true, "hands_on_security": 1.6}	2023-01-11 16:45:00	2025-07-27 01:00:01.399411
f5000005-1111-2222-3333-444444444444	Welche Sicherheitsmaßnahmen implementieren Sie für eine Zero-Trust Architektur?	3dc5dde0-c175-4050-a7be-dc9fed666b59	["Multi-Factor Authentication", "Network Segmentation", "Least Privilege Access", "Continuous Monitoring", "Device Compliance", "Identity Verification", "Encryption at Rest", "Encryption in Transit"]	{"max_points": 10, "points_per_measure": 1, "zero_trust_pillars": {"data": ["Encryption at Rest", "Encryption in Transit"], "device": ["Device Compliance"], "network": ["Network Segmentation"], "identity": ["Multi-Factor Authentication", "Identity Verification"], "analytics": ["Continuous Monitoring"], "application": ["Least Privilege Access"]}}	2023-01-11 17:00:00	2025-07-27 01:00:01.399411
f5000006-1111-2222-3333-444444444444	Welchen Prozentsatz des IT-Budgets sollten Unternehmen für Cybersecurity aufwenden?	313b814e-18fc-4e15-978b-19e35444ab19	{"max": 50, "min": 0}	{"industry_benchmark": {"scoring": {"0": 0, "1-4": 2, "21+": 2, "5-7": 3, "8-12": 5, "13-15": 4, "16-20": 3}, "optimal_range": [8, 15]}}	2023-01-11 17:15:00	2025-07-27 01:00:01.399411
\.


--
-- TOC entry 5021 (class 0 OID 16597)
-- Dependencies: 232
-- Data for Name: question_condition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_condition (id, source_question_id, target_node_id, operator, expected_value, order_index, created_at) FROM stdin;
\.


--
-- TOC entry 5020 (class 0 OID 16573)
-- Dependencies: 231
-- Data for Name: question_node; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_node (id, thema_id, question_id, parent_node_id, order_index, is_required, created_at) FROM stdin;
a1f00001-1111-2222-3333-444444444444	a0000001-1111-2222-3333-444444444444	a1000004-1111-2222-3333-444444444444	\N	1	t	2023-01-15 10:00:00
a1f00002-1111-2222-3333-444444444444	a0000001-1111-2222-3333-444444444444	a1000006-1111-2222-3333-444444444444	\N	2	t	2023-01-15 10:01:00
a1f00003-1111-2222-3333-444444444444	a0000001-1111-2222-3333-444444444444	a1000005-1111-2222-3333-444444444444	\N	3	t	2023-01-15 10:02:00
a1f00004-1111-2222-3333-444444444444	a0000001-1111-2222-3333-444444444444	a1000001-1111-2222-3333-444444444444	\N	4	t	2023-01-15 10:03:00
a1f00005-1111-2222-3333-444444444444	a0000001-1111-2222-3333-444444444444	a1000002-1111-2222-3333-444444444444	a1f00004-1111-2222-3333-444444444444	1	t	2023-01-15 10:04:00
a1f00006-1111-2222-3333-444444444444	a0000001-1111-2222-3333-444444444444	a1000003-1111-2222-3333-444444444444	\N	5	t	2023-01-15 10:05:00
a1f00007-1111-2222-3333-444444444444	a0000001-1111-2222-3333-444444444444	a1000007-1111-2222-3333-444444444444	a1f00006-1111-2222-3333-444444444444	1	f	2023-01-15 10:06:00
a1f00008-1111-2222-3333-444444444444	a0000001-1111-2222-3333-444444444444	a1000008-1111-2222-3333-444444444444	\N	6	f	2023-01-15 10:07:00
a2f00001-1111-2222-3333-444444444444	b0000003-1111-2222-3333-444444444444	b2000001-1111-2222-3333-444444444444	\N	1	t	2023-01-15 11:00:00
a2f00002-1111-2222-3333-444444444444	b0000003-1111-2222-3333-444444444444	b2000006-1111-2222-3333-444444444444	\N	2	t	2023-01-15 11:01:00
a2f00003-1111-2222-3333-444444444444	b0000003-1111-2222-3333-444444444444	b2000002-1111-2222-3333-444444444444	a2f00002-1111-2222-3333-444444444444	1	t	2023-01-15 11:02:00
a2f00004-1111-2222-3333-444444444444	b0000003-1111-2222-3333-444444444444	b2000005-1111-2222-3333-444444444444	a2f00002-1111-2222-3333-444444444444	2	t	2023-01-15 11:03:00
a2f00005-1111-2222-3333-444444444444	b0000003-1111-2222-3333-444444444444	b2000003-1111-2222-3333-444444444444	\N	3	t	2023-01-15 11:04:00
a2f00006-1111-2222-3333-444444444444	b0000003-1111-2222-3333-444444444444	b2000004-1111-2222-3333-444444444444	\N	4	f	2023-01-15 11:05:00
a2f00007-1111-2222-3333-444444444444	b0000003-1111-2222-3333-444444444444	b2000007-1111-2222-3333-444444444444	a2f00005-1111-2222-3333-444444444444	1	f	2023-01-15 11:06:00
a2f00008-1111-2222-3333-444444444444	b0000003-1111-2222-3333-444444444444	b2000008-1111-2222-3333-444444444444	a2f00007-1111-2222-3333-444444444444	1	f	2023-01-15 11:07:00
a3f00001-1111-2222-3333-444444444444	b0000008-1111-2222-3333-444444444444	c3000001-1111-2222-3333-444444444444	\N	1	t	2023-01-15 12:00:00
a3f00002-1111-2222-3333-444444444444	b0000008-1111-2222-3333-444444444444	e3000008-1111-2222-3333-444444444444	\N	2	t	2023-01-15 12:01:00
a3f00003-1111-2222-3333-444444444444	b0000008-1111-2222-3333-444444444444	c3000004-1111-2222-3333-444444444444	\N	3	t	2023-01-15 12:02:00
a3f00004-1111-2222-3333-444444444444	b0000008-1111-2222-3333-444444444444	c3000003-1111-2222-3333-444444444444	a3f00003-1111-2222-3333-444444444444	1	t	2023-01-15 12:03:00
a3f00005-1111-2222-3333-444444444444	b0000008-1111-2222-3333-444444444444	c3000002-1111-2222-3333-444444444444	a3f00004-1111-2222-3333-444444444444	1	t	2023-01-15 12:04:00
a3f00006-1111-2222-3333-444444444444	b0000008-1111-2222-3333-444444444444	c3000006-1111-2222-3333-444444444444	\N	4	t	2023-01-15 12:05:00
a3f00007-1111-2222-3333-444444444444	b0000008-1111-2222-3333-444444444444	c3000005-1111-2222-3333-444444444444	\N	5	f	2023-01-15 12:06:00
a3f00008-1111-2222-3333-444444444444	b0000008-1111-2222-3333-444444444444	c3000007-1111-2222-3333-444444444444	a3f00006-1111-2222-3333-444444444444	1	f	2023-01-15 12:07:00
a4f00001-1111-2222-3333-444444444444	a0000005-1111-2222-3333-444444444444	f1000001-1111-2222-3333-444444444444	\N	1	t	2023-01-15 13:00:00
a4f00002-1111-2222-3333-444444444444	a0000005-1111-2222-3333-444444444444	f1000003-1111-2222-3333-444444444444	\N	2	t	2023-01-15 13:01:00
a4f00003-1111-2222-3333-444444444444	a0000005-1111-2222-3333-444444444444	f1000002-1111-2222-3333-444444444444	a4f00002-1111-2222-3333-444444444444	1	t	2023-01-15 13:02:00
a4f00004-1111-2222-3333-444444444444	a0000005-1111-2222-3333-444444444444	f1000008-1111-2222-3333-444444444444	a4f00003-1111-2222-3333-444444444444	1	t	2023-01-15 13:03:00
a4f00005-1111-2222-3333-444444444444	a0000005-1111-2222-3333-444444444444	f1000004-1111-2222-3333-444444444444	\N	3	t	2023-01-15 13:04:00
a4f00006-1111-2222-3333-444444444444	a0000005-1111-2222-3333-444444444444	f1000005-1111-2222-3333-444444444444	a4f00004-1111-2222-3333-444444444444	1	f	2023-01-15 13:05:00
a4f00007-1111-2222-3333-444444444444	a0000005-1111-2222-3333-444444444444	f1000007-1111-2222-3333-444444444444	a4f00005-1111-2222-3333-444444444444	1	f	2023-01-15 13:06:00
a4f00008-1111-2222-3333-444444444444	a0000005-1111-2222-3333-444444444444	f1000006-1111-2222-3333-444444444444	a4f00007-1111-2222-3333-444444444444	1	f	2023-01-15 13:07:00
a5f00001-1111-2222-3333-444444444444	a0000008-1111-2222-3333-444444444444	e5000001-1111-2222-3333-444444444444	\N	1	t	2023-01-15 14:00:00
a5f00002-1111-2222-3333-444444444444	a0000008-1111-2222-3333-444444444444	e5000008-1111-2222-3333-444444444444	\N	2	t	2023-01-15 14:01:00
a5f00003-1111-2222-3333-444444444444	a0000008-1111-2222-3333-444444444444	e5000002-1111-2222-3333-444444444444	a5f00001-1111-2222-3333-444444444444	1	t	2023-01-15 14:02:00
a5f00004-1111-2222-3333-444444444444	a0000008-1111-2222-3333-444444444444	e5000004-1111-2222-3333-444444444444	a5f00003-1111-2222-3333-444444444444	1	t	2023-01-15 14:03:00
a5f00005-1111-2222-3333-444444444444	a0000008-1111-2222-3333-444444444444	e5000003-1111-2222-3333-444444444444	a5f00004-1111-2222-3333-444444444444	1	t	2023-01-15 14:04:00
a5f00006-1111-2222-3333-444444444444	a0000008-1111-2222-3333-444444444444	e5000005-1111-2222-3333-444444444444	a5f00005-1111-2222-3333-444444444444	1	t	2023-01-15 14:05:00
a5f00007-1111-2222-3333-444444444444	a0000008-1111-2222-3333-444444444444	e5000006-1111-2222-3333-444444444444	\N	3	t	2023-01-15 14:06:00
a5f00008-1111-2222-3333-444444444444	a0000008-1111-2222-3333-444444444444	e5000007-1111-2222-3333-444444444444	a5f00007-1111-2222-3333-444444444444	1	f	2023-01-15 14:07:00
a6f00001-1111-2222-3333-444444444444	a0000007-1111-2222-3333-444444444444	f5000001-1111-2222-3333-444444444444	\N	1	t	2023-01-15 15:00:00
a6f00002-1111-2222-3333-444444444444	a0000007-1111-2222-3333-444444444444	f5000003-1111-2222-3333-444444444444	\N	2	t	2023-01-15 15:01:00
a6f00003-1111-2222-3333-444444444444	a0000007-1111-2222-3333-444444444444	f5000002-1111-2222-3333-444444444444	a6f00002-1111-2222-3333-444444444444	1	t	2023-01-15 15:02:00
a6f00004-1111-2222-3333-444444444444	a0000007-1111-2222-3333-444444444444	f5000004-1111-2222-3333-444444444444	a6f00003-1111-2222-3333-444444444444	1	t	2023-01-15 15:03:00
a6f00005-1111-2222-3333-444444444444	a0000007-1111-2222-3333-444444444444	f5000005-1111-2222-3333-444444444444	a6f00004-1111-2222-3333-444444444444	1	f	2023-01-15 15:04:00
a6f00006-1111-2222-3333-444444444444	a0000007-1111-2222-3333-444444444444	f5000006-1111-2222-3333-444444444444	a6f00005-1111-2222-3333-444444444444	1	f	2023-01-15 15:05:00
a7f00001-1111-2222-3333-444444444444	b0000005-1111-2222-3333-444444444444	f2000001-1111-2222-3333-444444444444	\N	1	t	2023-01-15 16:00:00
a7f00002-1111-2222-3333-444444444444	b0000005-1111-2222-3333-444444444444	f2000003-1111-2222-3333-444444444444	\N	2	t	2023-01-15 16:01:00
a7f00003-1111-2222-3333-444444444444	b0000005-1111-2222-3333-444444444444	f2000002-1111-2222-3333-444444444444	a7f00001-1111-2222-3333-444444444444	1	t	2023-01-15 16:02:00
a7f00004-1111-2222-3333-444444444444	b0000005-1111-2222-3333-444444444444	f2000007-1111-2222-3333-444444444444	a7f00003-1111-2222-3333-444444444444	1	t	2023-01-15 16:03:00
a7f00005-1111-2222-3333-444444444444	b0000005-1111-2222-3333-444444444444	f2000004-1111-2222-3333-444444444444	a7f00004-1111-2222-3333-444444444444	1	t	2023-01-15 16:04:00
a7f00006-1111-2222-3333-444444444444	b0000005-1111-2222-3333-444444444444	f2000005-1111-2222-3333-444444444444	a7f00005-1111-2222-3333-444444444444	1	f	2023-01-15 16:05:00
a7f00007-1111-2222-3333-444444444444	b0000005-1111-2222-3333-444444444444	f2000006-1111-2222-3333-444444444444	a7f00006-1111-2222-3333-444444444444	1	f	2023-01-15 16:06:00
a7f00008-1111-2222-3333-444444444444	b0000005-1111-2222-3333-444444444444	f2000008-1111-2222-3333-444444444444	a7f00007-1111-2222-3333-444444444444	1	f	2023-01-15 16:07:00
\.


--
-- TOC entry 5018 (class 0 OID 16547)
-- Dependencies: 229
-- Data for Name: question_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_type (id, name, input_type, has_options, description) FROM stdin;
e1062c1c-62dd-4c80-b614-defb1abe977f	Text Input	text	f	Simple text input field
cb6290b1-5592-4835-bb1e-e45906ece53a	Multiple Choice	radio	t	Single selection from multiple options
3dc5dde0-c175-4050-a7be-dc9fed666b59	Multiple Select	checkbox	t	Multiple selections from options
b794ee11-f3f0-424b-85b8-1e92e290714b	Dropdown	select	t	Dropdown selection
313b814e-18fc-4e15-978b-19e35444ab19	Number Input	number	f	Numeric input field
626e5582-37cb-45b2-ac7e-e913cb3f334f	Date Input	date	f	Date selection
f03f4f2f-5ca9-43f5-bdb7-22bed08198ac	Rating Scale	range	f	Rating scale (1-5, 1-10, etc.)
b7820105-61fd-407b-af3c-506de5faa76d	Ordering	order	t	Arrange options in the correct order
\.


--
-- TOC entry 5008 (class 0 OID 16411)
-- Dependencies: 219
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (id, name, description, created_at) FROM stdin;
56f3d4e4-68b6-41fd-b141-10270d6383f3	admin	System administrator with full access	2025-07-17 03:23:47.988778
88e1c1e3-7286-45e8-b7b2-d01602594ca8	company_manager	Company manager with company-level access	2025-07-17 03:23:47.988778
c4fb42fa-2e7d-430c-a1d4-c45c0b276b12	assessor	Assessment creator and manager	2025-07-17 03:23:47.988778
678b9b15-4eea-457d-8d0d-48ddbe47058e	viewer	Read-only access to assessments	2025-07-17 03:23:47.988778
\.


--
-- TOC entry 5011 (class 0 OID 16449)
-- Dependencies: 222
-- Data for Name: role_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permission (role_id, permission_id, granted_at) FROM stdin;
56f3d4e4-68b6-41fd-b141-10270d6383f3	07133552-0ce0-4e33-95b0-dd4b1502793d	2025-07-17 03:23:47.988778
56f3d4e4-68b6-41fd-b141-10270d6383f3	51e649a7-93b8-4469-bba1-1ba5c689abbe	2025-07-17 03:23:47.988778
56f3d4e4-68b6-41fd-b141-10270d6383f3	6aa8f33a-3fac-4085-a091-26bbeef5ad30	2025-07-17 03:23:47.988778
56f3d4e4-68b6-41fd-b141-10270d6383f3	6fd4f962-489f-47fb-b675-07d5bc060ef5	2025-07-17 03:23:47.988778
56f3d4e4-68b6-41fd-b141-10270d6383f3	570cd61d-564e-4fa9-bae3-597d21651782	2025-07-17 03:23:47.988778
56f3d4e4-68b6-41fd-b141-10270d6383f3	bd09939e-c3b1-4158-8b04-2fa4106ee4d0	2025-07-17 03:23:47.988778
56f3d4e4-68b6-41fd-b141-10270d6383f3	a6fdaa54-6518-4675-b6b0-379bb90334b8	2025-07-17 03:23:47.988778
56f3d4e4-68b6-41fd-b141-10270d6383f3	33989264-26cc-4387-87d7-601c86972229	2025-07-17 03:23:47.988778
88e1c1e3-7286-45e8-b7b2-d01602594ca8	07133552-0ce0-4e33-95b0-dd4b1502793d	2025-07-17 03:23:47.988778
88e1c1e3-7286-45e8-b7b2-d01602594ca8	51e649a7-93b8-4469-bba1-1ba5c689abbe	2025-07-17 03:23:47.988778
88e1c1e3-7286-45e8-b7b2-d01602594ca8	6fd4f962-489f-47fb-b675-07d5bc060ef5	2025-07-17 03:23:47.988778
88e1c1e3-7286-45e8-b7b2-d01602594ca8	a6fdaa54-6518-4675-b6b0-379bb90334b8	2025-07-17 03:23:47.988778
88e1c1e3-7286-45e8-b7b2-d01602594ca8	33989264-26cc-4387-87d7-601c86972229	2025-07-17 03:23:47.988778
c4fb42fa-2e7d-430c-a1d4-c45c0b276b12	07133552-0ce0-4e33-95b0-dd4b1502793d	2025-07-17 03:23:47.988778
c4fb42fa-2e7d-430c-a1d4-c45c0b276b12	51e649a7-93b8-4469-bba1-1ba5c689abbe	2025-07-17 03:23:47.988778
c4fb42fa-2e7d-430c-a1d4-c45c0b276b12	6fd4f962-489f-47fb-b675-07d5bc060ef5	2025-07-17 03:23:47.988778
678b9b15-4eea-457d-8d0d-48ddbe47058e	6fd4f962-489f-47fb-b675-07d5bc060ef5	2025-07-17 03:23:47.988778
678b9b15-4eea-457d-8d0d-48ddbe47058e	a6fdaa54-6518-4675-b6b0-379bb90334b8	2025-07-17 03:23:47.988778
\.


--
-- TOC entry 5014 (class 0 OID 16490)
-- Dependencies: 225
-- Data for Name: thema; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thema (id, name, description, created_at, updated_at) FROM stdin;
a0000001-1111-2222-3333-444444444444	Software-Entwicklung Grundlagen	Grundlegende Programmierkonzepte, Algorithmen und Datenstrukturen	2023-01-10 08:00:00	2025-07-27 01:00:01.399411
a0000002-1111-2222-3333-444444444444	Frontend-Entwicklung	HTML, CSS, JavaScript, React, Vue.js, Angular Entwicklung	2023-01-10 08:15:00	2025-07-27 01:00:01.399411
a0000003-1111-2222-3333-444444444444	Backend-Entwicklung	Server-Side Programming, APIs, Microservices, Datenbank-Integration	2023-01-10 08:30:00	2025-07-27 01:00:01.399411
a0000004-1111-2222-3333-444444444444	Datenbank-Management	SQL, NoSQL, Datenbank-Design, Performance-Optimierung	2023-01-10 08:45:00	2025-07-27 01:00:01.399411
a0000005-1111-2222-3333-444444444444	DevOps und CI/CD	Continuous Integration, Deployment, Docker, Kubernetes, Cloud Services	2023-01-10 09:00:00	2025-07-27 01:00:01.399411
a0000006-1111-2222-3333-444444444444	Cloud Computing	AWS, Azure, GCP, Serverless, Cloud Architecture	2023-01-10 09:15:00	2025-07-27 01:00:01.399411
a0000007-1111-2222-3333-444444444444	Cyber Security	IT-Sicherheit, Penetration Testing, Vulnerability Assessment	2023-01-10 09:30:00	2025-07-27 01:00:01.399411
a0000008-1111-2222-3333-444444444444	Data Science & Analytics	Python/R für Datenanalyse, Machine Learning, Statistik	2023-01-10 09:45:00	2025-07-27 01:00:01.399411
a0000009-1111-2222-3333-444444444444	Mobile App Development	iOS, Android, React Native, Flutter Entwicklung	2023-01-10 10:00:00	2025-07-27 01:00:01.399411
a000000a-1111-2222-3333-444444444444	Quality Assurance	Test-Strategien, Automation, Bug Tracking, Test Case Design	2023-01-10 10:15:00	2025-07-27 01:00:01.399411
b0000001-1111-2222-3333-444444444444	Kommunikationsfähigkeiten	Verbale und schriftliche Kommunikation, Präsentationstechniken	2023-01-10 10:30:00	2025-07-27 01:00:01.399411
b0000002-1111-2222-3333-444444444444	Teamwork & Kollaboration	Zusammenarbeit, Konfliktlösung, Team-Dynamik	2023-01-10 10:45:00	2025-07-27 01:00:01.399411
b0000003-1111-2222-3333-444444444444	Leadership & Management	Führungsqualitäten, Mitarbeiterführung, Entscheidungsfindung	2023-01-10 11:00:00	2025-07-27 01:00:01.399411
b0000004-1111-2222-3333-444444444444	Problemlösung & Analytisches Denken	Strukturiertes Problemlösen, Kritisches Denken, Innovation	2023-01-10 11:15:00	2025-07-27 01:00:01.399411
b0000005-1111-2222-3333-444444444444	Projektmanagement	Agile Methoden, Scrum, Kanban, Projekt-Planung	2023-01-10 11:30:00	2025-07-27 01:00:01.399411
b0000006-1111-2222-3333-444444444444	Zeitmanagement & Organisation	Priorisierung, Effizienz, Arbeitsorganisation	2023-01-10 11:45:00	2025-07-27 01:00:01.399411
b0000007-1111-2222-3333-444444444444	Anpassungsfähigkeit & Flexibilität	Change Management, Lernbereitschaft, Resilienz	2023-01-10 12:00:00	2025-07-27 01:00:01.399411
b0000008-1111-2222-3333-444444444444	Kundenorientierung	Customer Experience, Service Excellence, Empathie	2023-01-10 12:15:00	2025-07-27 01:00:01.399411
b0000009-1111-2222-3333-444444444444	Kreativität & Innovation	Creative Thinking, Design Thinking, Innovationsmanagement	2023-01-10 12:30:00	2025-07-27 01:00:01.399411
b000000a-1111-2222-3333-444444444444	Interkulturelle Kompetenz	Kulturelles Bewusstsein, Internationale Zusammenarbeit	2023-01-10 12:45:00	2025-07-27 01:00:01.399411
c0000001-1111-2222-3333-444444444444	Business Analysis	Requirements Engineering, Process Mapping, Stakeholder Management	2023-01-10 13:00:00	2025-07-27 01:00:01.399411
c0000002-1111-2222-3333-444444444444	Digital Transformation	Digitalisierungsstrategien, Change Management, Tech Adoption	2023-01-10 13:15:00	2025-07-27 01:00:01.399411
c0000003-1111-2222-3333-444444444444	Strategic Planning	Unternehmensstrategie, Market Analysis, Competitive Intelligence	2023-01-10 13:30:00	2025-07-27 01:00:01.399411
c0000004-1111-2222-3333-444444444444	Financial Acumen	Finanzverständnis, Budgetierung, ROI-Analyse	2023-01-10 13:45:00	2025-07-27 01:00:01.399411
c0000005-1111-2222-3333-444444444444	Marketing & Sales	Digital Marketing, Sales Strategien, Customer Acquisition	2023-01-10 14:00:00	2025-07-27 01:00:01.399411
c0000006-1111-2222-3333-444444444444	Product Management	Product Strategy, Roadmap Planning, Feature Priorisierung	2023-01-10 14:15:00	2025-07-27 01:00:01.399411
c0000007-1111-2222-3333-444444444444	Operations Management	Prozessoptimierung, Supply Chain, Lean Management	2023-01-10 14:30:00	2025-07-27 01:00:01.399411
c0000008-1111-2222-3333-444444444444	Risk Management	Risk Assessment, Compliance, Business Continuity	2023-01-10 14:45:00	2025-07-27 01:00:01.399411
c0000009-1111-2222-3333-444444444444	Sustainability & ESG	Nachhaltigkeit, Environmental Impact, Corporate Responsibility	2023-01-10 15:00:00	2025-07-27 01:00:01.399411
c000000a-1111-2222-3333-444444444444	Legal & Compliance	Rechtliche Grundlagen, GDPR, Compliance Management	2023-01-10 15:15:00	2025-07-27 01:00:01.399411
d0000001-1111-2222-3333-444444444444	Healthcare IT	Medizinische Informatik, HIPAA Compliance, Gesundheitsdaten	2023-01-10 15:30:00	2025-07-27 01:00:01.399411
d0000002-1111-2222-3333-444444444444	Financial Services Technology	FinTech, Banking Systems, Payment Processing	2023-01-10 15:45:00	2025-07-27 01:00:01.399411
d0000003-1111-2222-3333-444444444444	E-Commerce & Retail	Online Shop Systeme, Inventory Management, Customer Journey	2023-01-10 16:00:00	2025-07-27 01:00:01.399411
d0000004-1111-2222-3333-444444444444	Manufacturing & Industry 4.0	IoT, Smart Factory, Automation, Predictive Maintenance	2023-01-10 16:15:00	2025-07-27 01:00:01.399411
d0000005-1111-2222-3333-444444444444	Education Technology	E-Learning Platforms, LMS, Educational Content Management	2023-01-10 16:30:00	2025-07-27 01:00:01.399411
d0000006-1111-2222-3333-444444444444	Gaming & Entertainment	Game Development, Media Production, Content Creation	2023-01-10 16:45:00	2025-07-27 01:00:01.399411
d0000007-1111-2222-3333-444444444444	Telecommunications	Network Management, 5G, Telecommunication Protocols	2023-01-10 17:00:00	2025-07-27 01:00:01.399411
d0000008-1111-2222-3333-444444444444	Automotive Technology	Connected Cars, Autonomous Driving, Automotive Software	2023-01-10 17:15:00	2025-07-27 01:00:01.399411
d0000009-1111-2222-3333-444444444444	Energy & Utilities	Smart Grid, Renewable Energy Systems, Energy Management	2023-01-10 17:30:00	2025-07-27 01:00:01.399411
d000000a-1111-2222-3333-444444444444	Government & Public Sector	E-Government, Public Services, Civic Technology	2023-01-10 17:45:00	2025-07-27 01:00:01.399411
e0000001-1111-2222-3333-444444444444	Artificial Intelligence	AI/ML Algorithms, Neural Networks, Deep Learning	2023-01-10 18:00:00	2025-07-27 01:00:01.399411
e0000002-1111-2222-3333-444444444444	Blockchain & Cryptocurrency	Blockchain Technology, Smart Contracts, DeFi	2023-01-10 18:15:00	2025-07-27 01:00:01.399411
e0000003-1111-2222-3333-444444444444	Internet of Things (IoT)	IoT Architecture, Sensor Networks, Edge Computing	2023-01-10 18:30:00	2025-07-27 01:00:01.399411
e0000004-1111-2222-3333-444444444444	Augmented/Virtual Reality	AR/VR Development, 3D Modeling, Immersive Technologies	2023-01-10 18:45:00	2025-07-27 01:00:01.399411
e0000005-1111-2222-3333-444444444444	Quantum Computing	Quantum Algorithms, Quantum Cryptography, Quantum Systems	2023-01-10 19:00:00	2025-07-27 01:00:01.399411
e0000006-1111-2222-3333-444444444444	Robotics & Automation	Robotic Process Automation, Industrial Robotics	2023-01-10 19:15:00	2025-07-27 01:00:01.399411
e0000007-1111-2222-3333-444444444444	Big Data & Analytics	Data Engineering, Data Warehousing, Business Intelligence	2023-01-10 19:30:00	2025-07-27 01:00:01.399411
e0000008-1111-2222-3333-444444444444	Edge Computing	Edge Architecture, Distributed Computing, Latency Optimization	2023-01-10 19:45:00	2025-07-27 01:00:01.399411
e0000009-1111-2222-3333-444444444444	Green Technology	Clean Tech, Environmental Monitoring, Sustainable IT	2023-01-10 20:00:00	2025-07-27 01:00:01.399411
e000000a-1111-2222-3333-444444444444	Digital Ethics & Privacy	Ethical AI, Data Privacy, Digital Rights	2023-01-10 20:15:00	2025-07-27 01:00:01.399411
f0000001-1111-2222-3333-444444444444	Onboarding Assessment	Neue Mitarbeiter Integration, Grundkompetenzen	2023-01-10 20:30:00	2025-07-27 01:00:01.399411
f0000002-1111-2222-3333-444444444444	Performance Review	Jahresbeurteilung, Leistungsbewertung, Entwicklungsziele	2023-01-10 20:45:00	2025-07-27 01:00:01.399411
f0000003-1111-2222-3333-444444444444	Promotion Assessment	Beförderungseignung, Leadership Potential	2023-01-10 21:00:00	2025-07-27 01:00:01.399411
f0000004-1111-2222-3333-444444444444	Skills Gap Analysis	Kompetenzlücken, Weiterbildungsbedarf	2023-01-10 21:15:00	2025-07-27 01:00:01.399411
f0000005-1111-2222-3333-444444444444	Team Dynamics	Team-Zusammenarbeit, Rollenverteilung, Kommunikation	2023-01-10 21:30:00	2025-07-27 01:00:01.399411
f0000006-1111-2222-3333-444444444444	Cultural Fit	Unternehmenskultur, Wertekompatibilität	2023-01-10 21:45:00	2025-07-27 01:00:01.399411
f0000007-1111-2222-3333-444444444444	Remote Work Readiness	Home Office Kompetenzen, Selbstorganisation	2023-01-10 22:00:00	2025-07-27 01:00:01.399411
f0000008-1111-2222-3333-444444444444	Change Readiness	Veränderungsbereitschaft, Anpassungsfähigkeit	2023-01-10 22:15:00	2025-07-27 01:00:01.399411
f0000009-1111-2222-3333-444444444444	Innovation Mindset	Innovationsdenken, Experimentierfreude	2023-01-10 22:30:00	2025-07-27 01:00:01.399411
f000000a-1111-2222-3333-444444444444	360-Grad Feedback	Rundum-Bewertung, Multi-Source Feedback	2023-01-10 22:45:00	2025-07-27 01:00:01.399411
\.


--
-- TOC entry 5016 (class 0 OID 16510)
-- Dependencies: 227
-- Data for Name: thema_catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thema_catalog (thema_id, catalog_id, order_index) FROM stdin;
a0000001-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	1
a0000002-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	2
a0000003-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	3
a0000004-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	4
a0000005-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	5
a000000a-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	6
b0000001-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	7
b0000002-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	8
a0000008-1111-2222-3333-444444444444	10000004-2222-3333-4444-555555555555	1
a0000001-1111-2222-3333-444444444444	10000004-2222-3333-4444-555555555555	2
e0000007-1111-2222-3333-444444444444	10000004-2222-3333-4444-555555555555	3
e0000001-1111-2222-3333-444444444444	10000004-2222-3333-4444-555555555555	4
b0000004-1111-2222-3333-444444444444	10000004-2222-3333-4444-555555555555	5
c0000001-1111-2222-3333-444444444444	10000004-2222-3333-4444-555555555555	6
b0000001-1111-2222-3333-444444444444	10000004-2222-3333-4444-555555555555	7
b0000003-1111-2222-3333-444444444444	20000001-2222-3333-4444-555555555555	1
b0000005-1111-2222-3333-444444444444	20000001-2222-3333-4444-555555555555	2
b0000002-1111-2222-3333-444444444444	20000001-2222-3333-4444-555555555555	3
b0000001-1111-2222-3333-444444444444	20000001-2222-3333-4444-555555555555	4
b0000004-1111-2222-3333-444444444444	20000001-2222-3333-4444-555555555555	5
b0000006-1111-2222-3333-444444444444	20000001-2222-3333-4444-555555555555	6
b0000007-1111-2222-3333-444444444444	20000001-2222-3333-4444-555555555555	7
f0000005-1111-2222-3333-444444444444	20000001-2222-3333-4444-555555555555	8
f0000008-1111-2222-3333-444444444444	20000001-2222-3333-4444-555555555555	9
d0000002-1111-2222-3333-444444444444	30000001-2222-3333-4444-555555555555	1
a0000007-1111-2222-3333-444444444444	30000001-2222-3333-4444-555555555555	2
e0000002-1111-2222-3333-444444444444	30000001-2222-3333-4444-555555555555	3
c0000004-1111-2222-3333-444444444444	30000001-2222-3333-4444-555555555555	4
c000000a-1111-2222-3333-444444444444	30000001-2222-3333-4444-555555555555	5
c0000008-1111-2222-3333-444444444444	30000001-2222-3333-4444-555555555555	6
a0000006-1111-2222-3333-444444444444	30000001-2222-3333-4444-555555555555	7
b0000008-1111-2222-3333-444444444444	30000001-2222-3333-4444-555555555555	8
a0000001-1111-2222-3333-444444444444	40000001-2222-3333-4444-555555555555	1
a0000002-1111-2222-3333-444444444444	40000001-2222-3333-4444-555555555555	2
a0000004-1111-2222-3333-444444444444	40000001-2222-3333-4444-555555555555	3
b0000001-1111-2222-3333-444444444444	40000001-2222-3333-4444-555555555555	4
b0000002-1111-2222-3333-444444444444	40000001-2222-3333-4444-555555555555	5
b0000007-1111-2222-3333-444444444444	40000001-2222-3333-4444-555555555555	6
f0000001-1111-2222-3333-444444444444	40000001-2222-3333-4444-555555555555	7
f0000006-1111-2222-3333-444444444444	40000001-2222-3333-4444-555555555555	8
f0000007-1111-2222-3333-444444444444	50000005-2222-3333-4444-555555555555	1
b0000006-1111-2222-3333-444444444444	50000005-2222-3333-4444-555555555555	2
b0000001-1111-2222-3333-444444444444	50000005-2222-3333-4444-555555555555	3
b0000002-1111-2222-3333-444444444444	50000005-2222-3333-4444-555555555555	4
b0000007-1111-2222-3333-444444444444	50000005-2222-3333-4444-555555555555	5
b000000a-1111-2222-3333-444444444444	50000005-2222-3333-4444-555555555555	6
e000000a-1111-2222-3333-444444444444	50000005-2222-3333-4444-555555555555	7
\.


--
-- TOC entry 5010 (class 0 OID 16433)
-- Dependencies: 221
-- Data for Name: user_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_role (user_id, role_id, assigned_at) FROM stdin;
10000000-0000-0000-0000-000000000001	56f3d4e4-68b6-41fd-b141-10270d6383f3	2023-01-15 08:00:00
10000000-0000-0000-0000-000000000002	56f3d4e4-68b6-41fd-b141-10270d6383f3	2023-02-01 09:30:00
20000000-0000-0000-0000-000000000001	88e1c1e3-7286-45e8-b7b2-d01602594ca8	2023-03-10 10:15:00
20000000-0000-0000-0000-000000000002	88e1c1e3-7286-45e8-b7b2-d01602594ca8	2023-03-15 11:20:00
20000000-0000-0000-0000-000000000003	88e1c1e3-7286-45e8-b7b2-d01602594ca8	2023-04-01 14:30:00
20000000-0000-0000-0000-000000000004	88e1c1e3-7286-45e8-b7b2-d01602594ca8	2023-04-05 16:45:00
20000000-0000-0000-0000-000000000005	88e1c1e3-7286-45e8-b7b2-d01602594ca8	2023-05-20 08:30:00
30000000-0000-0000-0000-000000000001	c4fb42fa-2e7d-430c-a1d4-c45c0b276b12	2023-06-01 09:00:00
30000000-0000-0000-0000-000000000002	c4fb42fa-2e7d-430c-a1d4-c45c0b276b12	2023-06-15 10:30:00
30000000-0000-0000-0000-000000000003	c4fb42fa-2e7d-430c-a1d4-c45c0b276b12	2023-07-01 13:45:00
30000000-0000-0000-0000-000000000004	c4fb42fa-2e7d-430c-a1d4-c45c0b276b12	2023-07-15 15:20:00
30000000-0000-0000-0000-000000000005	c4fb42fa-2e7d-430c-a1d4-c45c0b276b12	2023-08-01 11:00:00
30000000-0000-0000-0000-000000000006	c4fb42fa-2e7d-430c-a1d4-c45c0b276b12	2023-08-15 14:30:00
40000000-0000-0000-0000-000000000001	678b9b15-4eea-457d-8d0d-48ddbe47058e	2023-09-01 08:15:00
40000000-0000-0000-0000-000000000002	678b9b15-4eea-457d-8d0d-48ddbe47058e	2023-09-10 12:30:00
40000000-0000-0000-0000-000000000003	678b9b15-4eea-457d-8d0d-48ddbe47058e	2023-09-20 16:00:00
40000000-0000-0000-0000-000000000004	678b9b15-4eea-457d-8d0d-48ddbe47058e	2023-10-01 09:45:00
40000000-0000-0000-0000-000000000005	678b9b15-4eea-457d-8d0d-48ddbe47058e	2023-10-15 11:30:00
20000000-0000-0000-0000-000000000001	c4fb42fa-2e7d-430c-a1d4-c45c0b276b12	2023-06-01 12:00:00
30000000-0000-0000-0000-000000000001	678b9b15-4eea-457d-8d0d-48ddbe47058e	2023-09-01 14:00:00
\.


--
-- TOC entry 5007 (class 0 OID 16399)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, created_at, updated_at, password) FROM stdin;
10000000-0000-0000-0000-000000000001	Dr. Sarah Schmidt	sarah.schmidt@system.admin	2023-01-15 08:00:00	2025-07-27 01:00:01.399411	test123
10000000-0000-0000-0000-000000000002	Michael Weber	michael.weber@system.admin	2023-02-01 09:30:00	2025-07-27 01:00:01.399411	test123
20000000-0000-0000-0000-000000000001	Elena Richter	elena.richter@techcorp.de	2023-03-10 10:15:00	2025-07-27 01:00:01.399411	test123
20000000-0000-0000-0000-000000000002	Andreas Müller	andreas.mueller@consultcorp.de	2023-03-15 11:20:00	2025-07-27 01:00:01.399411	test123
20000000-0000-0000-0000-000000000003	Maria Gonzalez	maria.gonzalez@innovate.es	2023-04-01 14:30:00	2025-07-27 01:00:01.399411	test123
20000000-0000-0000-0000-000000000004	Jean-Pierre Dubois	jp.dubois@digital.fr	2023-04-05 16:45:00	2025-07-27 01:00:01.399411	test123
20000000-0000-0000-0000-000000000005	Lisa Chen	lisa.chen@startup.io	2023-05-20 08:30:00	2025-07-27 01:00:01.399411	test123
30000000-0000-0000-0000-000000000001	Thomas Bauer	thomas.bauer@hr.techcorp.de	2023-06-01 09:00:00	2025-07-27 01:00:01.399411	test123
30000000-0000-0000-0000-000000000002	Anna Kowalski	anna.kowalski@hr.consultcorp.de	2023-06-15 10:30:00	2025-07-27 01:00:01.399411	test123
30000000-0000-0000-0000-000000000003	Roberto Silva	roberto.silva@hr.innovate.es	2023-07-01 13:45:00	2025-07-27 01:00:01.399411	test123
30000000-0000-0000-0000-000000000004	Sophie Martin	sophie.martin@hr.digital.fr	2023-07-15 15:20:00	2025-07-27 01:00:01.399411	test123
30000000-0000-0000-0000-000000000005	Dr. James Wilson	james.wilson@assessment.consulting	2023-08-01 11:00:00	2025-07-27 01:00:01.399411	test123
30000000-0000-0000-0000-000000000006	Prof. Ingrid Hansen	ingrid.hansen@psych.university.dk	2023-08-15 14:30:00	2025-07-27 01:00:01.399411	test123
40000000-0000-0000-0000-000000000001	Peter Schmidt	peter.schmidt@techcorp.de	2023-09-01 08:15:00	2025-07-27 01:00:01.399411	test123
40000000-0000-0000-0000-000000000002	Claudia Bernhard	claudia.bernhard@consultcorp.de	2023-09-10 12:30:00	2025-07-27 01:00:01.399411	test123
40000000-0000-0000-0000-000000000003	Marco Rossi	marco.rossi@innovate.es	2023-09-20 16:00:00	2025-07-27 01:00:01.399411	test123
40000000-0000-0000-0000-000000000004	Christine Leroy	christine.leroy@digital.fr	2023-10-01 09:45:00	2025-07-27 01:00:01.399411	test123
40000000-0000-0000-0000-000000000005	Kevin Zhang	kevin.zhang@startup.io	2023-10-15 11:30:00	2025-07-27 01:00:01.399411	test123
50000000-0000-0000-0000-000000000001	Former Employee	former@oldcompany.com	2022-01-01 00:00:00	2025-07-27 01:00:01.399411	test123
50000000-0000-0000-0000-000000000002	Test User Delete	delete@test.com	2024-01-01 00:00:00	2025-07-27 01:00:01.399411	test123
\.


--
-- TOC entry 5013 (class 0 OID 16475)
-- Dependencies: 224
-- Data for Name: worker; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.worker (id, name, work_space_ref, company_id, email, created_at, updated_at) FROM stdin;
11100000-1111-2222-3333-444444444444	Max Mustermann	Software Development	c1000000-1111-2222-3333-444444444444	max.mustermann@techcorp.de	2023-01-10 00:00:00	2025-07-27 01:00:01.399411
11200000-1111-2222-3333-444444444444	Julia Weber	Software Development	c1000000-1111-2222-3333-444444444444	julia.weber@techcorp.de	2023-01-15 00:00:00	2025-07-27 01:00:01.399411
11300000-1111-2222-3333-444444444444	Ahmed Hassan	Software Development	c1000000-1111-2222-3333-444444444444	ahmed.hassan@techcorp.de	2023-01-20 00:00:00	2025-07-27 01:00:01.399411
11400000-1111-2222-3333-444444444444	Olga Petrov	Software Development	c1000000-1111-2222-3333-444444444444	olga.petrov@techcorp.de	2023-01-25 00:00:00	2025-07-27 01:00:01.399411
11500000-1111-2222-3333-444444444444	Carlos Martinez	Software Development	c1000000-1111-2222-3333-444444444444	carlos.martinez@techcorp.de	2023-01-30 00:00:00	2025-07-27 01:00:01.399411
12100000-1111-2222-3333-444444444444	Sandra Schmidt	DevOps	c1000000-1111-2222-3333-444444444444	sandra.schmidt@techcorp.de	2023-02-01 00:00:00	2025-07-27 01:00:01.399411
12200000-1111-2222-3333-444444444444	Dmitri Volkov	Cloud Infrastructure	c1000000-1111-2222-3333-444444444444	dmitri.volkov@techcorp.de	2023-02-10 00:00:00	2025-07-27 01:00:01.399411
12300000-1111-2222-3333-444444444444	Jennifer Lee	DevOps	c1000000-1111-2222-3333-444444444444	jennifer.lee@techcorp.de	2023-02-15 00:00:00	2025-07-27 01:00:01.399411
13100000-1111-2222-3333-444444444444	Lisa Chen	Quality Assurance	c1000000-1111-2222-3333-444444444444	lisa.chen@techcorp.de	2023-02-15 00:00:00	2025-07-27 01:00:01.399411
13200000-1111-2222-3333-444444444444	Roberto Silva	Test Automation	c1000000-1111-2222-3333-444444444444	roberto.silva@techcorp.de	2023-02-20 00:00:00	2025-07-27 01:00:01.399411
13300000-1111-2222-3333-444444444444	Maria Kowalski	Quality Assurance	c1000000-1111-2222-3333-444444444444	maria.kowalski@techcorp.de	2023-02-25 00:00:00	2025-07-27 01:00:01.399411
14100000-1111-2222-3333-444444444444	Dr. Petra Hoffmann	Project Management	c1000000-1111-2222-3333-444444444444	petra.hoffmann@techcorp.de	2023-03-01 00:00:00	2025-07-27 01:00:01.399411
14200000-1111-2222-3333-444444444444	Marco Rossi	Product Management	c1000000-1111-2222-3333-444444444444	marco.rossi@techcorp.de	2023-03-05 00:00:00	2025-07-27 01:00:01.399411
14300000-1111-2222-3333-444444444444	Sarah Johnson	Business Analysis	c1000000-1111-2222-3333-444444444444	sarah.johnson@techcorp.de	2023-03-10 00:00:00	2025-07-27 01:00:01.399411
14400000-1111-2222-3333-444444444444	Thomas Mueller	Scrum Master	c1000000-1111-2222-3333-444444444444	thomas.mueller@techcorp.de	2023-03-15 00:00:00	2025-07-27 01:00:01.399411
15100000-1111-2222-3333-444444444444	Tim Mueller	Junior Development	c1000000-1111-2222-3333-444444444444	tim.mueller@techcorp.de	2023-09-01 00:00:00	2025-07-27 01:00:01.399411
15200000-1111-2222-3333-444444444444	Anna Kowalski	Trainee	c1000000-1111-2222-3333-444444444444	anna.kowalski@techcorp.de	2023-09-15 00:00:00	2025-07-27 01:00:01.399411
15300000-1111-2222-3333-444444444444	Kevin Zhang	Junior QA	c1000000-1111-2222-3333-444444444444	kevin.zhang@techcorp.de	2023-10-01 00:00:00	2025-07-27 01:00:01.399411
15400000-1111-2222-3333-444444444444	Emma Wilson	Junior Developer	c1000000-1111-2222-3333-444444444444	emma.wilson@techcorp.de	2023-10-15 00:00:00	2025-07-27 01:00:01.399411
21100000-1111-2222-3333-444444444444	Dr. Michael Bauer	Senior Consulting	c2000000-1111-2222-3333-444444444444	michael.bauer@consultcorp.de	2023-01-20 00:00:00	2025-07-27 01:00:01.399411
21200000-1111-2222-3333-444444444444	Elena Rodriguez	Digital Strategy	c2000000-1111-2222-3333-444444444444	elena.rodriguez@consultcorp.de	2023-02-01 00:00:00	2025-07-27 01:00:01.399411
21300000-1111-2222-3333-444444444444	Jean-Pierre Dubois	Change Management	c2000000-1111-2222-3333-444444444444	jp.dubois@consultcorp.de	2023-02-15 00:00:00	2025-07-27 01:00:01.399411
21400000-1111-2222-3333-444444444444	Sophie Martin	Junior Consultant	c2000000-1111-2222-3333-444444444444	sophie.martin@consultcorp.de	2023-08-01 00:00:00	2025-07-27 01:00:01.399411
21500000-1111-2222-3333-444444444444	David Wilson	Business Analyst	c2000000-1111-2222-3333-444444444444	david.wilson@consultcorp.de	2023-08-15 00:00:00	2025-07-27 01:00:01.399411
21600000-1111-2222-3333-444444444444	Isabella Garcia	Process Consultant	c2000000-1111-2222-3333-444444444444	isabella.garcia@consultcorp.de	2023-09-01 00:00:00	2025-07-27 01:00:01.399411
31100000-1111-2222-3333-444444444444	Carlos Mendez	Frontend Development	c3000000-1111-2222-3333-444444444444	carlos@innovate.es	2023-02-05 00:00:00	2025-07-27 01:00:01.399411
31200000-1111-2222-3333-444444444444	Isabella Torres	UX/UI Design	c3000000-1111-2222-3333-444444444444	isabella@innovate.es	2023-02-20 00:00:00	2025-07-27 01:00:01.399411
31300000-1111-2222-3333-444444444444	Miguel Santos	Backend Development	c3000000-1111-2222-3333-444444444444	miguel@innovate.es	2023-03-01 00:00:00	2025-07-27 01:00:01.399411
31400000-1111-2222-3333-444444444444	Carmen Lopez	Project Management	c3000000-1111-2222-3333-444444444444	carmen@innovate.es	2023-03-15 00:00:00	2025-07-27 01:00:01.399411
31500000-1111-2222-3333-444444444444	Pablo Ruiz	Full Stack Developer	c3000000-1111-2222-3333-444444444444	pablo@innovate.es	2023-04-01 00:00:00	2025-07-27 01:00:01.399411
41100000-1111-2222-3333-444444444444	François Leroy	Web Development	c4000000-1111-2222-3333-444444444444	francois@digital.fr	2023-02-25 00:00:00	2025-07-27 01:00:01.399411
41200000-1111-2222-3333-444444444444	Céline Dubois	Digital Marketing	c4000000-1111-2222-3333-444444444444	celine@digital.fr	2023-03-02 00:00:00	2025-07-27 01:00:01.399411
41300000-1111-2222-3333-444444444444	Antoine Moreau	System Administrator	c4000000-1111-2222-3333-444444444444	antoine@digital.fr	2023-03-10 00:00:00	2025-07-27 01:00:01.399411
41400000-1111-2222-3333-444444444444	Amélie Bernard	Customer Success	c4000000-1111-2222-3333-444444444444	amelie@digital.fr	2023-03-20 00:00:00	2025-07-27 01:00:01.399411
51100000-1111-2222-3333-444444444444	Alex Schneider	Full Stack Development	c5000000-1111-2222-3333-444444444444	alex@startupio.com	2023-03-05 00:00:00	2025-07-27 01:00:01.399411
51200000-1111-2222-3333-444444444444	Maya Patel	UX/UI Design	c5000000-1111-2222-3333-444444444444	maya@startupio.com	2023-03-10 00:00:00	2025-07-27 01:00:01.399411
51300000-1111-2222-3333-444444444444	Chris Thompson	DevOps Engineer	c5000000-1111-2222-3333-444444444444	chris@startupio.com	2023-03-15 00:00:00	2025-07-27 01:00:01.399411
51400000-1111-2222-3333-444444444444	Jessica Kim	Growth Marketing	c5000000-1111-2222-3333-444444444444	jessica@startupio.com	2023-04-01 00:00:00	2025-07-27 01:00:01.399411
51500000-1111-2222-3333-444444444444	Ryan O Connor	Sales Development	c5000000-1111-2222-3333-444444444444	ryan@startupio.com	2023-04-15 00:00:00	2025-07-27 01:00:01.399411
61100000-1111-2222-3333-444444444444	Dr. Elena Hoffman	Research & Development	c6000000-1111-2222-3333-444444444444	elena@greentech.io	2023-03-20 00:00:00	2025-07-27 01:00:01.399411
61200000-1111-2222-3333-444444444444	Marcus Green	Sustainability Consultant	c6000000-1111-2222-3333-444444444444	marcus@greentech.io	2023-04-01 00:00:00	2025-07-27 01:00:01.399411
61300000-1111-2222-3333-444444444444	Lisa Andersen	Product Manager	c6000000-1111-2222-3333-444444444444	lisa@greentech.io	2023-04-10 00:00:00	2025-07-27 01:00:01.399411
71100000-1111-2222-3333-444444444444	Hans Zimmermann	Production Management	c7000000-1111-2222-3333-444444444444	h.zimmermann@manufacturing.de	2023-04-05 00:00:00	2025-07-27 01:00:01.399411
71200000-1111-2222-3333-444444444444	Ingrid Hansen	Quality Control	c7000000-1111-2222-3333-444444444444	i.hansen@manufacturing.de	2023-04-10 00:00:00	2025-07-27 01:00:01.399411
71300000-1111-2222-3333-444444444444	Franz Huber	Maintenance Engineering	c7000000-1111-2222-3333-444444444444	f.huber@manufacturing.de	2023-04-15 00:00:00	2025-07-27 01:00:01.399411
71400000-1111-2222-3333-444444444444	Maria Gonzalez	Process Engineering	c7000000-1111-2222-3333-444444444444	m.gonzalez@manufacturing.de	2023-05-01 00:00:00	2025-07-27 01:00:01.399411
71500000-1111-2222-3333-444444444444	Tomasz Kowalski	IT Support	c7000000-1111-2222-3333-444444444444	t.kowalski@manufacturing.de	2023-05-15 00:00:00	2025-07-27 01:00:01.399411
71600000-1111-2222-3333-444444444444	Petra Wagner	Logistics Coordinator	c7000000-1111-2222-3333-444444444444	p.wagner@manufacturing.de	2023-05-20 00:00:00	2025-07-27 01:00:01.399411
81100000-1111-2222-3333-444444444444	James Mitchell	Automotive Engineer	c8000000-1111-2222-3333-444444444444	james@automotive.com	2023-04-20 00:00:00	2025-07-27 01:00:01.399411
81200000-1111-2222-3333-444444444444	Linda Thompson	Supply Chain Manager	c8000000-1111-2222-3333-444444444444	linda@automotive.com	2023-05-01 00:00:00	2025-07-27 01:00:01.399411
81300000-1111-2222-3333-444444444444	Roberto Ferrari	Design Engineer	c8000000-1111-2222-3333-444444444444	roberto@automotive.com	2023-05-10 00:00:00	2025-07-27 01:00:01.399411
81400000-1111-2222-3333-444444444444	Yuki Tanaka	Quality Engineer	c8000000-1111-2222-3333-444444444444	yuki@automotive.com	2023-05-20 00:00:00	2025-07-27 01:00:01.399411
91100000-1111-2222-3333-444444444444	Dr. Amanda Clarke	Medical Consultant	c9000000-1111-2222-3333-444444444444	amanda@healthcare.com	2023-05-05 00:00:00	2025-07-27 01:00:01.399411
91200000-1111-2222-3333-444444444444	Nurse Patricia Davis	Healthcare Coordinator	c9000000-1111-2222-3333-444444444444	patricia@healthcare.com	2023-05-15 00:00:00	2025-07-27 01:00:01.399411
91300000-1111-2222-3333-444444444444	Michael Roberts	HR Specialist	c9000000-1111-2222-3333-444444444444	michael@healthcare.com	2023-05-25 00:00:00	2025-07-27 01:00:01.399411
a1100000-1111-2222-3333-444444444444	Prof. Diana Edwards	Curriculum Developer	ca000000-1111-2222-3333-444444444444	diana@education.org	2023-05-20 00:00:00	2025-07-27 01:00:01.399411
a1200000-1111-2222-3333-444444444444	Mark Phillips	E-Learning Specialist	ca000000-1111-2222-3333-444444444444	mark@education.org	2023-06-01 00:00:00	2025-07-27 01:00:01.399411
a1300000-1111-2222-3333-444444444444	Susan Taylor	Training Coordinator	ca000000-1111-2222-3333-444444444444	susan@education.org	2023-06-10 00:00:00	2025-07-27 01:00:01.399411
b1100000-1111-2222-3333-444444444444	Rachel Green	Program Manager	cb000000-1111-2222-3333-444444444444	rachel@nonprofit.org	2023-06-05 00:00:00	2025-07-27 01:00:01.399411
b1200000-1111-2222-3333-444444444444	Daniel Brown	Community Outreach	cb000000-1111-2222-3333-444444444444	daniel@nonprofit.org	2023-06-15 00:00:00	2025-07-27 01:00:01.399411
c1100000-1111-2222-3333-444444444444	Stefan Richter	IT Administrator	cc000000-1111-2222-3333-444444444444	stefan@hamburg.de	2023-06-20 00:00:00	2025-07-27 01:00:01.399411
c1200000-1111-2222-3333-444444444444	Claudia Weber	Digital Services	cc000000-1111-2222-3333-444444444444	claudia@hamburg.de	2023-07-01 00:00:00	2025-07-27 01:00:01.399411
c1300000-1111-2222-3333-444444444444	Peter Schneider	System Analyst	cc000000-1111-2222-3333-444444444444	peter@hamburg.de	2023-07-10 00:00:00	2025-07-27 01:00:01.399411
\.


--
-- TOC entry 5017 (class 0 OID 16526)
-- Dependencies: 228
-- Data for Name: worker_catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.worker_catalog (worker_id, catalog_id, company_id, assigned_at, id, access_code, access_token, status, assigned_by_id, expires_at, first_access_at, last_access_at, completed_at, notes) FROM stdin;
11100000-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	c1000000-1111-2222-3333-444444444444	2023-03-01 09:00:00	37a38aef-eba5-427e-9c62-1e47ce43dfeb	ERC78X	5795362735e84ee3909b046024a12a2fcbd34f6c9ac34a298a358faaf016d774	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Willkommen! Bitte Code eingeben. Dieser Katalog enthält Basis-Sicherheit.
11200000-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	c1000000-1111-2222-3333-444444444444	2023-03-01 09:15:00	d6a31e8e-0bf8-433b-9985-b0166e02ec95	KQ52MN	a1db2bc0cff54f65af812eb3c36a1b9bc232fb3d05ca43699cad52c618a19b2f	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Datenschutz & Compliance: kurze Einführung. Start nach Codeeingabe.
11300000-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	c1000000-1111-2222-3333-444444444444	2023-03-01 09:30:00	80427373-9dda-4be0-823e-9a4741159cb4	Z7P4BD	1c52689c642b4acead99987ed870096efd39f452a9e84b76960d3f7e6d5b0831	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Arbeitssicherheit: ca. 15–20 Minuten, Themenbaum Schritt für Schritt.
11400000-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	c1000000-1111-2222-3333-444444444444	2023-03-01 09:45:00	5fd8a894-07b0-4413-a68c-8289e5c287c0	HM83VL	b79e2e12ee1b4bc182a23d7ccd4cf054591a099291a844bea88d58fbdb3371eb	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	IT-Policy Übersicht. Code aus der E-Mail erforderlich.
11500000-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	c1000000-1111-2222-3333-444444444444	2023-03-01 10:00:00	ee513e87-6428-4da3-b956-91e22a39116b	TW92GF	2759aaa9614c4177bdcc71eecca1dfaf1542cde2994542fba53f5411b721cfea	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Onboarding-Checkliste. Bitte alle Themen nacheinander bearbeiten.
15100000-1111-2222-3333-444444444444	40000001-2222-3333-4444-555555555555	c1000000-1111-2222-3333-444444444444	2023-09-01 14:00:00	091c6201-576a-4bbd-8c86-fcba507861c2	3337AC	3ca1a86787a441e88016109a1dc6a11c2f7102c91ac9455a9818a47d1a07f0c2	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
15200000-1111-2222-3333-444444444444	40000001-2222-3333-4444-555555555555	c1000000-1111-2222-3333-444444444444	2023-09-15 14:15:00	a17b62e1-d2eb-4cdd-a988-84e33625f510	BF8ED6	605d0bc932c94fe99b11fd321e89b4fa3ca1656fbd7d4a7a9e58167b3d6683ee	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
15400000-1111-2222-3333-444444444444	40000001-2222-3333-4444-555555555555	c1000000-1111-2222-3333-444444444444	2023-10-15 14:30:00	604f2fc2-9182-4627-8e15-6c09ecbc5a14	59A2A4	67817f07438a41c6916a235785d0dd110eacd5c8e4bb476a810228b79a9f335e	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
51100000-1111-2222-3333-444444444444	10000001-2222-3333-4444-555555555555	c5000000-1111-2222-3333-444444444444	2023-06-01 08:00:00	04a50cc5-2a3b-47ad-a465-0b72e96fd9a6	801C6F	4d6f58779bed40d7a7a621ac385c398ac18d771f68f54998bfd972f5e33dacd5	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
51100000-1111-2222-3333-444444444444	30000001-2222-3333-4444-555555555555	c5000000-1111-2222-3333-444444444444	2023-06-01 08:15:00	9e71962d-30bc-44c0-ac18-2926ba958121	B59285	7c301ff0c4864daaa4a7109396163372aee4a48ac5f54d0d981f2ea822a2b6d2	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
51200000-1111-2222-3333-444444444444	10000009-2222-3333-4444-555555555555	c5000000-1111-2222-3333-444444444444	2023-06-01 08:30:00	355ce5aa-c907-45af-8b14-9f5a863206fc	3017DD	9f747563fb014a3aa9e4c5cf8ce10e085334e5fb15e848aeb323c67844171607	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
51200000-1111-2222-3333-444444444444	50000007-2222-3333-4444-555555555555	c5000000-1111-2222-3333-444444444444	2023-06-01 08:45:00	8e66e388-c12f-4011-9afc-ba2073742120	B413C5	c036be40eefb4eef8f04060da8eacd8aaed4dccd11a942a4812ef0abf0563de0	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
51300000-1111-2222-3333-444444444444	10000003-2222-3333-4444-555555555555	c5000000-1111-2222-3333-444444444444	2023-06-01 09:00:00	bc65fdff-c0dc-4b7a-bf2e-839358a0dabe	D22203	b7592cdee0cc4ce588c6c89ee84cc9344fc9a323834441c58713169a41e4bec5	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
51400000-1111-2222-3333-444444444444	50000005-2222-3333-4444-555555555555	c5000000-1111-2222-3333-444444444444	2023-06-01 09:15:00	49a36b27-9470-4099-9046-5c2f3839ca20	489737	8f65b51717c64c1ba9bcb620b330c1064c15c7386a1d4ffc8870106f6d0ba329	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
51500000-1111-2222-3333-444444444444	50000008-2222-3333-4444-555555555555	c5000000-1111-2222-3333-444444444444	2023-06-01 09:30:00	9561a09f-595f-458e-8056-ebdc0bda03f9	D52B7F	924bfcbcf171408a8202b0dddf4de2748fd3c87497a9436ebcbe13dfd788afe9	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
21100000-1111-2222-3333-444444444444	20000001-2222-3333-4444-555555555555	c2000000-1111-2222-3333-444444444444	2023-04-01 10:00:00	4a4833a6-163a-4429-b599-c8940862e7f3	5774A1	2fefc261926e4da2b12cea8d250255a3a25c4ec1df8846d695457f09100c470f	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
21400000-1111-2222-3333-444444444444	40000002-2222-3333-4444-555555555555	c2000000-1111-2222-3333-444444444444	2023-08-01 11:30:00	f876b21f-22f2-42d8-ab50-00e64a46582f	18E45F	8d18bd3dd9434cacb8b0f3f28cc5bcc6eec783b2dc2f4163b27d32775c9afb83	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
21500000-1111-2222-3333-444444444444	50000006-2222-3333-4444-555555555555	c2000000-1111-2222-3333-444444444444	2023-08-15 11:45:00	53afa731-dc4b-4530-96d1-c6076d469cb0	0D6175	0f1b3da22cea41b58a8a5cfaf74efa4a8a162c48adfe4ae8a08d7778aeaaf218	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
71100000-1111-2222-3333-444444444444	30000004-2222-3333-4444-555555555555	c7000000-1111-2222-3333-444444444444	2023-05-01 08:00:00	721f2170-7899-424e-92d1-17d7beef73c9	FFD4B3	3eb7aff34282427a9980a1f213aff013be1bea508e8d49a69aa6a555f494bd84	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
71100000-1111-2222-3333-444444444444	60000002-2222-3333-4444-555555555555	c7000000-1111-2222-3333-444444444444	2023-05-01 08:15:00	afe90eea-e92f-4643-99a7-0f977373fd9f	00DCEA	ab6870df174c47219324312e0bf82cb904e95dfaac014d7181782f31cf567c2e	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
71200000-1111-2222-3333-444444444444	30000004-2222-3333-4444-555555555555	c7000000-1111-2222-3333-444444444444	2023-05-01 08:30:00	28a9648f-c0a2-4e84-8fd2-e983058c09a9	4EE296	ce0a9ddaae784bf78f1881d1718cb8dedf669c08a7d54e26abd996a30de0213e	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
71200000-1111-2222-3333-444444444444	60000009-2222-3333-4444-555555555555	c7000000-1111-2222-3333-444444444444	2023-05-01 08:45:00	eb7cbb25-c681-4973-8ad3-bcda1196c853	B835FF	155bba0b24b54d70b477fb35fc5c12f5b7d62d53f1904b8892d49abfb659f37b	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
71500000-1111-2222-3333-444444444444	10000005-2222-3333-4444-555555555555	c7000000-1111-2222-3333-444444444444	2023-05-15 09:00:00	14e661a4-3e8c-46fe-b787-e25f08b64adb	8AF89D	dac2c2283d3047fab41fe760047a1a9513a37fd87f9e45358d58f5f1282323ec	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
71500000-1111-2222-3333-444444444444	50000005-2222-3333-4444-555555555555	c7000000-1111-2222-3333-444444444444	2023-05-15 09:15:00	9d13a729-bbcf-499d-a273-b2cd1f469bdf	6A6995	126ccacf4d0446e39a854216d41e1c0885d1e1872ff448d880707d916ceb71bc	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
71400000-1111-2222-3333-444444444444	50000007-2222-3333-4444-555555555555	c7000000-1111-2222-3333-444444444444	2023-05-01 09:30:00	80657ca4-a69d-4bed-a8f6-2cbb6e842e13	81F39C	d75e1151519a467dac4e8602e3f70947746fbc4121b847a8a2ca6a5c791ec723	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
71600000-1111-2222-3333-444444444444	20000008-2222-3333-4444-555555555555	c7000000-1111-2222-3333-444444444444	2023-05-20 09:45:00	0830b780-dc96-4080-8ba7-a38c821b918f	D3EAD2	6843dc49dded4007abfe96352a8adaf18181cddc4b8e47f6b8709121ac79c760	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
91100000-1111-2222-3333-444444444444	30000002-2222-3333-4444-555555555555	c9000000-1111-2222-3333-444444444444	2023-07-01 10:00:00	02568968-209d-4e3d-bd46-e626fcb24d71	36E50B	35be4aafbc67483bacc7d05ab99f4bbf68eb221312fe40cf8c88432603055978	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
91100000-1111-2222-3333-444444444444	50000008-2222-3333-4444-555555555555	c9000000-1111-2222-3333-444444444444	2023-07-01 10:15:00	04667ee5-ccb8-46e0-9a1e-9b5919d153c0	BAFF8C	a1667a3d51c043fea868d6cfe3b812692f6e937d13624ee9bcbc2273e38e1446	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
91100000-1111-2222-3333-444444444444	50000006-2222-3333-4444-555555555555	c9000000-1111-2222-3333-444444444444	2023-07-01 10:30:00	850508d9-9d0b-44e2-9cf6-2e6badfd5fbf	A23A20	0058673a54f34c878ce75324977c6826c8be4e2e90894cef990cf29a887c4eec	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
91200000-1111-2222-3333-444444444444	30000002-2222-3333-4444-555555555555	c9000000-1111-2222-3333-444444444444	2023-07-01 10:45:00	1f761bea-c711-4d2f-9d8b-451c321a351f	C55B40	5ce5c6918bec4a1f9ef412f75641af44af8eaac2b53b405d8f78645cb2cde8de	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
91200000-1111-2222-3333-444444444444	20000001-2222-3333-4444-555555555555	c9000000-1111-2222-3333-444444444444	2023-07-01 11:00:00	3b628232-16de-4f79-a8fa-e9de50d9317d	0D141F	a561831a57c94b13befdc9f2320ae9d4f7a8813ad955443ba9a5a24ea3e03213	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
91200000-1111-2222-3333-444444444444	60000002-2222-3333-4444-555555555555	c9000000-1111-2222-3333-444444444444	2023-07-01 11:15:00	7120d1e7-f8d9-4a05-9903-747e647bd35f	D6753D	7ec2289b849c49a5989aeda92cc6e175bf65acc1174a4fc6b1e755b2c83aaec9	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
91300000-1111-2222-3333-444444444444	50000001-2222-3333-4444-555555555555	c9000000-1111-2222-3333-444444444444	2023-07-01 11:30:00	4f03855f-f8ef-473c-85d9-596be2e8db77	1EDEAB	65e9696fca544e31a72ed7895fa802bdbf48a87414bb4302a9b82872e417aa75	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
91300000-1111-2222-3333-444444444444	50000003-2222-3333-4444-555555555555	c9000000-1111-2222-3333-444444444444	2023-07-01 11:45:00	f5ee10b4-fb37-4859-8499-2f8fd32113c8	B8C07C	bda8b9cd334e4d50b6f55d2cc1c87df45e295f641cb7430c9752ea4b57bcc706	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
c1100000-1111-2222-3333-444444444444	30000009-2222-3333-4444-555555555555	cc000000-1111-2222-3333-444444444444	2023-08-01 08:00:00	a9cbaa3c-6676-4157-9ba5-a0876974b176	92F8BB	5702a80f1a2043dbbacb5401c9c433602906a0791ad24b168986b411d358210b	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
c1100000-1111-2222-3333-444444444444	10000006-2222-3333-4444-555555555555	cc000000-1111-2222-3333-444444444444	2023-08-01 08:15:00	b7487fa6-6b4f-4c3a-98e0-60cc0c578324	4862D6	1b74b1d0e6e34a66baa8dd8f6f6d4230649a275c48444e7a9f9acb5ff54f0121	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
c1100000-1111-2222-3333-444444444444	50000006-2222-3333-4444-555555555555	cc000000-1111-2222-3333-444444444444	2023-08-01 08:30:00	e8478a42-fc4c-4547-88bd-ebb7466594bd	F4F289	55dae3f993a0406db90ff03188d6eccdc4d86480590848f9b3b4c1c6c0a3ac96	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
c1200000-1111-2222-3333-444444444444	30000009-2222-3333-4444-555555555555	cc000000-1111-2222-3333-444444444444	2023-08-01 08:45:00	3fe71103-a921-448f-898b-6c326d1f06d8	AC6295	666ed50bd439484085efb1ff2c0a451ba2060d0d392e41a4b58e5c42a59e6c0b	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
c1200000-1111-2222-3333-444444444444	50000008-2222-3333-4444-555555555555	cc000000-1111-2222-3333-444444444444	2023-08-01 09:00:00	849813f1-b139-4b84-8ef1-6097b169704d	5F6EE8	a67c11abebf34c5e84604356bf5ee220320be07fe45c4952872ed172dbe6dcd4	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
c1200000-1111-2222-3333-444444444444	20000007-2222-3333-4444-555555555555	cc000000-1111-2222-3333-444444444444	2023-08-01 09:15:00	51aec600-af3f-4291-b771-53e05cb35bd6	CE79F2	fb8c63b258034544bf31a2178e73727b62a595f61e484a6fa1bdddff71904074	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
c1300000-1111-2222-3333-444444444444	30000009-2222-3333-4444-555555555555	cc000000-1111-2222-3333-444444444444	2023-08-01 09:30:00	19501cfa-f979-41f4-922c-b932a01fe075	F8019A	352e7c5866ec4070919a03f03e4af3f9d7cfce3e90614344ae3ff3a2a48990bf	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
c1300000-1111-2222-3333-444444444444	10000004-2222-3333-4444-555555555555	cc000000-1111-2222-3333-444444444444	2023-08-01 09:45:00	0bd04bc8-640d-4e3c-9195-d5fdd830fee0	A83A13	5a36a1c930124228934cfddc3ba73cdc5db856621792433885797f0db8287634	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
c1300000-1111-2222-3333-444444444444	60000009-2222-3333-4444-555555555555	cc000000-1111-2222-3333-444444444444	2023-08-01 10:00:00	00c82eef-7e78-40ba-b334-9a0bf5291814	9063B1	85767eb11b1f4173971ca1ec0e47b5aecd8474b30ecd4bba8b8f5c33ae620ed3	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
21100000-1111-2222-3333-444444444444	20000003-2222-3333-4444-555555555555	c2000000-1111-2222-3333-444444444444	2023-04-01 10:15:00	f39d9439-cbb5-4f93-b3ba-2df3ab3c8746	9457EF	3c007928893c4283af801d2af039340aaecfd3465f9342a9b09115b1390e2cb1	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
21200000-1111-2222-3333-444444444444	20000007-2222-3333-4444-555555555555	c2000000-1111-2222-3333-444444444444	2023-04-01 10:30:00	445ac42d-8014-42de-9306-22790ddc74fd	001193	11c28a89ff2344ddbb923d916ae028afcffbc4c720bc4547bb4c6d324c068631	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
21200000-1111-2222-3333-444444444444	50000009-2222-3333-4444-555555555555	c2000000-1111-2222-3333-444444444444	2023-04-01 10:45:00	48d48f4f-16e9-4198-99ac-f9117ff55e10	2C1676	f2894e80c8e54b4c928983c04d2985d1f8d63307c8cf4c73bd5a66216d3ffa4d	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
21300000-1111-2222-3333-444444444444	20000006-2222-3333-4444-555555555555	c2000000-1111-2222-3333-444444444444	2023-04-01 11:00:00	2c5ffa26-ce01-444f-94fc-7ff2cc3efc91	09A448	81f87932cdea41d0bdd73fe9bcea891b7a6a8f8aaa334b6db54fd0329d9a2ae8	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
21300000-1111-2222-3333-444444444444	60000007-2222-3333-4444-555555555555	c2000000-1111-2222-3333-444444444444	2023-04-01 11:15:00	74797d8a-8ec0-46bf-b6b9-dee80ec9254a	00A76B	46df5831b21b4a8d8d18e0fee25aca43704ecf4dd40946378111bb992e008cf2	assigned	\N	2027-12-31 23:59:59	\N	\N	\N	Bitte geben Sie den zugesandten Code ein, um den Katalog zu öffnen.
\.


--
-- TOC entry 4827 (class 2606 OID 16654)
-- Name: answer answer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 16656)
-- Name: answer answer_session_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_session_id_question_id_key UNIQUE (session_id, question_id);


--
-- TOC entry 4822 (class 2606 OID 16629)
-- Name: assessment_session assessment_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_session
    ADD CONSTRAINT assessment_session_pkey PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 16675)
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4794 (class 2606 OID 16509)
-- Name: catalog catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catalog
    ADD CONSTRAINT catalog_pkey PRIMARY KEY (id);


--
-- TOC entry 4786 (class 2606 OID 16474)
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- TOC entry 4778 (class 2606 OID 16432)
-- Name: permission permission_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_name_key UNIQUE (name);


--
-- TOC entry 4780 (class 2606 OID 16430)
-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 16606)
-- Name: question_condition question_condition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_condition
    ADD CONSTRAINT question_condition_pkey PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 16581)
-- Name: question_node question_node_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_node
    ADD CONSTRAINT question_node_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 16567)
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (id);


--
-- TOC entry 4810 (class 2606 OID 16557)
-- Name: question_type question_type_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_type
    ADD CONSTRAINT question_type_name_key UNIQUE (name);


--
-- TOC entry 4812 (class 2606 OID 16555)
-- Name: question_type question_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_type
    ADD CONSTRAINT question_type_pkey PRIMARY KEY (id);


--
-- TOC entry 4774 (class 2606 OID 16421)
-- Name: role role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_name_key UNIQUE (name);


--
-- TOC entry 4784 (class 2606 OID 16454)
-- Name: role_permission role_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_pkey PRIMARY KEY (role_id, permission_id);


--
-- TOC entry 4776 (class 2606 OID 16419)
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- TOC entry 4796 (class 2606 OID 16515)
-- Name: thema_catalog thema_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thema_catalog
    ADD CONSTRAINT thema_catalog_pkey PRIMARY KEY (thema_id, catalog_id);


--
-- TOC entry 4792 (class 2606 OID 16499)
-- Name: thema thema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thema
    ADD CONSTRAINT thema_pkey PRIMARY KEY (id);


--
-- TOC entry 4802 (class 2606 OID 16744)
-- Name: worker_catalog uq_wc_access_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_catalog
    ADD CONSTRAINT uq_wc_access_code UNIQUE (access_code);


--
-- TOC entry 4804 (class 2606 OID 16746)
-- Name: worker_catalog uq_wc_access_token; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_catalog
    ADD CONSTRAINT uq_wc_access_token UNIQUE (access_token);


--
-- TOC entry 4806 (class 2606 OID 16742)
-- Name: worker_catalog uq_wc_worker_catalog; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_catalog
    ADD CONSTRAINT uq_wc_worker_catalog UNIQUE (worker_id, catalog_id);


--
-- TOC entry 4782 (class 2606 OID 16438)
-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (user_id, role_id);


--
-- TOC entry 4770 (class 2606 OID 16410)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4772 (class 2606 OID 16408)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4808 (class 2606 OID 16531)
-- Name: worker_catalog worker_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_catalog
    ADD CONSTRAINT worker_catalog_pkey PRIMARY KEY (worker_id, catalog_id, company_id);


--
-- TOC entry 4790 (class 2606 OID 16484)
-- Name: worker worker_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker
    ADD CONSTRAINT worker_pkey PRIMARY KEY (id);


--
-- TOC entry 4830 (class 1259 OID 16688)
-- Name: idx_answer_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_answer_question ON public.answer USING btree (question_id);


--
-- TOC entry 4831 (class 1259 OID 16687)
-- Name: idx_answer_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_answer_session ON public.answer USING btree (session_id);


--
-- TOC entry 4823 (class 1259 OID 16684)
-- Name: idx_assessment_session_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessment_session_company ON public.assessment_session USING btree (company_id);


--
-- TOC entry 4824 (class 1259 OID 16686)
-- Name: idx_assessment_session_thema; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessment_session_thema ON public.assessment_session USING btree (thema_id);


--
-- TOC entry 4825 (class 1259 OID 16685)
-- Name: idx_assessment_session_worker; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessment_session_worker ON public.assessment_session USING btree (worker_id);


--
-- TOC entry 4834 (class 1259 OID 16693)
-- Name: idx_audit_log_target; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_target ON public.audit_log USING btree (target_table, target_id);


--
-- TOC entry 4835 (class 1259 OID 16692)
-- Name: idx_audit_log_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_timestamp ON public.audit_log USING btree ("timestamp");


--
-- TOC entry 4836 (class 1259 OID 16691)
-- Name: idx_audit_log_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_user ON public.audit_log USING btree (user_id);


--
-- TOC entry 4815 (class 1259 OID 16690)
-- Name: idx_question_node_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_question_node_parent ON public.question_node USING btree (parent_node_id);


--
-- TOC entry 4816 (class 1259 OID 16689)
-- Name: idx_question_node_thema; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_question_node_thema ON public.question_node USING btree (thema_id);


--
-- TOC entry 4768 (class 1259 OID 16681)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4797 (class 1259 OID 16764)
-- Name: idx_wc_catalog; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wc_catalog ON public.worker_catalog USING btree (catalog_id);


--
-- TOC entry 4798 (class 1259 OID 16766)
-- Name: idx_wc_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wc_expires_at ON public.worker_catalog USING btree (expires_at);


--
-- TOC entry 4799 (class 1259 OID 16765)
-- Name: idx_wc_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wc_status ON public.worker_catalog USING btree (status);


--
-- TOC entry 4800 (class 1259 OID 16763)
-- Name: idx_wc_worker; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wc_worker ON public.worker_catalog USING btree (worker_id);


--
-- TOC entry 4787 (class 1259 OID 16682)
-- Name: idx_worker_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_worker_company ON public.worker USING btree (company_id);


--
-- TOC entry 4788 (class 1259 OID 16683)
-- Name: idx_worker_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_worker_email ON public.worker USING btree (email);


--
-- TOC entry 4859 (class 2606 OID 16662)
-- Name: answer answer_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id) ON DELETE CASCADE;


--
-- TOC entry 4860 (class 2606 OID 16657)
-- Name: answer answer_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.assessment_session(id) ON DELETE CASCADE;


--
-- TOC entry 4856 (class 2606 OID 16630)
-- Name: assessment_session assessment_session_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_session
    ADD CONSTRAINT assessment_session_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON DELETE CASCADE;


--
-- TOC entry 4857 (class 2606 OID 16635)
-- Name: assessment_session assessment_session_thema_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_session
    ADD CONSTRAINT assessment_session_thema_id_fkey FOREIGN KEY (thema_id) REFERENCES public.thema(id) ON DELETE CASCADE;


--
-- TOC entry 4858 (class 2606 OID 16640)
-- Name: assessment_session assessment_session_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_session
    ADD CONSTRAINT assessment_session_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker(id) ON DELETE CASCADE;


--
-- TOC entry 4861 (class 2606 OID 16676)
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4844 (class 2606 OID 16757)
-- Name: worker_catalog fk_wc_assigned_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_catalog
    ADD CONSTRAINT fk_wc_assigned_by FOREIGN KEY (assigned_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4845 (class 2606 OID 16752)
-- Name: worker_catalog fk_wc_catalog; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_catalog
    ADD CONSTRAINT fk_wc_catalog FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- TOC entry 4846 (class 2606 OID 16747)
-- Name: worker_catalog fk_wc_worker; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_catalog
    ADD CONSTRAINT fk_wc_worker FOREIGN KEY (worker_id) REFERENCES public.worker(id) ON DELETE CASCADE;


--
-- TOC entry 4854 (class 2606 OID 16607)
-- Name: question_condition question_condition_source_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_condition
    ADD CONSTRAINT question_condition_source_question_id_fkey FOREIGN KEY (source_question_id) REFERENCES public.question(id) ON DELETE CASCADE;


--
-- TOC entry 4855 (class 2606 OID 16612)
-- Name: question_condition question_condition_target_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_condition
    ADD CONSTRAINT question_condition_target_node_id_fkey FOREIGN KEY (target_node_id) REFERENCES public.question_node(id) ON DELETE CASCADE;


--
-- TOC entry 4851 (class 2606 OID 16592)
-- Name: question_node question_node_parent_node_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_node
    ADD CONSTRAINT question_node_parent_node_id_fkey FOREIGN KEY (parent_node_id) REFERENCES public.question_node(id);


--
-- TOC entry 4852 (class 2606 OID 16587)
-- Name: question_node question_node_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_node
    ADD CONSTRAINT question_node_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id) ON DELETE CASCADE;


--
-- TOC entry 4853 (class 2606 OID 16582)
-- Name: question_node question_node_thema_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_node
    ADD CONSTRAINT question_node_thema_id_fkey FOREIGN KEY (thema_id) REFERENCES public.thema(id) ON DELETE CASCADE;


--
-- TOC entry 4850 (class 2606 OID 16568)
-- Name: question question_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.question_type(id);


--
-- TOC entry 4839 (class 2606 OID 16460)
-- Name: role_permission role_permission_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permission(id) ON DELETE CASCADE;


--
-- TOC entry 4840 (class 2606 OID 16455)
-- Name: role_permission role_permission_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE CASCADE;


--
-- TOC entry 4842 (class 2606 OID 16521)
-- Name: thema_catalog thema_catalog_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thema_catalog
    ADD CONSTRAINT thema_catalog_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- TOC entry 4843 (class 2606 OID 16516)
-- Name: thema_catalog thema_catalog_thema_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thema_catalog
    ADD CONSTRAINT thema_catalog_thema_id_fkey FOREIGN KEY (thema_id) REFERENCES public.thema(id) ON DELETE CASCADE;


--
-- TOC entry 4837 (class 2606 OID 16444)
-- Name: user_role user_role_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE CASCADE;


--
-- TOC entry 4838 (class 2606 OID 16439)
-- Name: user_role user_role_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4847 (class 2606 OID 16537)
-- Name: worker_catalog worker_catalog_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_catalog
    ADD CONSTRAINT worker_catalog_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- TOC entry 4848 (class 2606 OID 16542)
-- Name: worker_catalog worker_catalog_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_catalog
    ADD CONSTRAINT worker_catalog_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON DELETE CASCADE;


--
-- TOC entry 4849 (class 2606 OID 16532)
-- Name: worker_catalog worker_catalog_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_catalog
    ADD CONSTRAINT worker_catalog_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker(id) ON DELETE CASCADE;


--
-- TOC entry 4841 (class 2606 OID 16485)
-- Name: worker worker_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker
    ADD CONSTRAINT worker_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON DELETE CASCADE;


-- Completed on 2025-10-26 14:08:07

--
-- PostgreSQL database dump complete
--

