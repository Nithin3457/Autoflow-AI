-- AutoFlow AI - Database Schema & Initial Seeder
-- Compatible with PostgreSQL 13+ and Supabase Cloud PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. DROP EXISTING TABLES (IF ANY) IN PROPER DEPENDENCY ORDER
-- ============================================================================
DROP TABLE IF EXISTS workflow_logs CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 2. CREATE CORE TABLES
-- ============================================================================

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'EMPLOYEE', 'MANAGER', 'TECHNICIAN', 'ADMIN'
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Requests Table
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
    raw_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'IT_SUPPORT', 'MAINTENANCE', 'PROCUREMENT', 'HR_LEAVE', 'DOCUMENT_APPROVAL'
    priority VARCHAR(20) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    risk_level VARCHAR(20) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH'
    extracted_entities JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'RESOLVED', 'REJECTED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    assigned_role VARCHAR(50) NOT NULL,
    assigned_department VARCHAR(100) NOT NULL,
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable if pooled
    step_order INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED'
    sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Logs Table
CREATE TABLE workflow_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- System actions have NULL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_requests_requester ON requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_category ON requests(category);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_tasks_request ON tasks(request_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_dept ON tasks(assigned_department);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_role ON tasks(assigned_role);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_request ON workflow_logs(request_id);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

-- Allow full access to service_role (used by backend API)
CREATE POLICY "Service Role Full Access Users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Requests" ON requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Workflow Logs" ON workflow_logs FOR ALL USING (true) WITH CHECK (true);

-- Allow read access for authenticated / anon users (for client-side or public preview)
CREATE POLICY "Public Read Users" ON users FOR SELECT USING (true);
CREATE POLICY "Public Read Requests" ON requests FOR SELECT USING (true);
CREATE POLICY "Public Read Tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Public Read Workflow Logs" ON workflow_logs FOR SELECT USING (true);

-- ============================================================================
-- 4. SEED DATA - USERS ACROSS MULTIPLE ROLES & DEPARTMENTS
-- ============================================================================
INSERT INTO users (id, full_name, email, role, department) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Sarah Jenkins', 'sarah.jenkins@autoflow.ai', 'EMPLOYEE', 'Marketing'),
    ('00000000-0000-0000-0000-000000000002', 'Priya Patel', 'priya.patel@autoflow.ai', 'EMPLOYEE', 'Design'),
    ('00000000-0000-0000-0000-000000000003', 'Alex Rivera', 'alex.rivera@autoflow.ai', 'TECHNICIAN', 'IT'),
    ('00000000-0000-0000-0000-000000000004', 'Marcus Vance', 'marcus.vance@autoflow.ai', 'TECHNICIAN', 'Facilities'),
    ('00000000-0000-0000-0000-000000000005', 'Elena Rostova', 'elena.rostova@autoflow.ai', 'MANAGER', 'Finance'),
    ('00000000-0000-0000-0000-000000000006', 'David Sterling', 'david.sterling@autoflow.ai', 'ADMIN', 'Executive Administration')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. SEED DATA - SAMPLE REAL-WORLD REQUESTS & WORKFLOW TASKS
-- ============================================================================

-- Request 1: Facilities Maintenance
INSERT INTO requests (id, requester_id, raw_text, category, priority, risk_level, extracted_entities, status, created_at)
VALUES (
    '11111111-1111-1111-1111-111111111101',
    '00000000-0000-0000-0000-000000000001',
    'The primary laser printer on the 3rd floor marketing department is jammed, leaking black toner all over the floor, and showing error code E-402.',
    'MAINTENANCE',
    'HIGH',
    'MEDIUM',
    '{"item": "laser printer", "location": "3rd floor marketing", "errorCode": "E-402", "issue": "toner leak & mechanical jam"}',
    'IN_PROGRESS',
    NOW() - INTERVAL '3 hours'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, request_id, assigned_role, assigned_department, assigned_user_id, step_order, title, description, status, sla_deadline, created_at)
VALUES
    ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'TECHNICIAN', 'Facilities', '00000000-0000-0000-0000-000000000004', 1, 'Contain toner spill and power down printer', 'Isolate the 3rd floor printer, clean the toner powder safely, and cut power.', 'COMPLETED', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '3 hours'),
    ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'TECHNICIAN', 'Facilities', '00000000-0000-0000-0000-000000000004', 2, 'Replace fuser unit and jammed roller mechanism', 'Inspect roller gears and install replacement drum and fuser kit.', 'IN_PROGRESS', NOW() + INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
    ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', 'EMPLOYEE', 'Marketing', '00000000-0000-0000-0000-000000000001', 3, 'Perform test print run and confirm resolution', 'Print test alignment sheet and confirm clean printing output with Sarah.', 'PENDING', NOW() + INTERVAL '4 hours', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workflow_logs (id, request_id, action, actor_id, created_at)
VALUES
    ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 'AI Orchestrator classified request as MAINTENANCE with HIGH priority and generated 3 sequential tasks.', NULL, NOW() - INTERVAL '3 hours'),
    ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111101', 'Task #1 completed by Marcus Vance (Facilities)', '00000000-0000-0000-0000-000000000004', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Request 2: IT Support (Critical VPN issue with SLA breach for testing SLA warning & alerts)
INSERT INTO requests (id, requester_id, raw_text, category, priority, risk_level, extracted_entities, status, created_at)
VALUES (
    '11111111-1111-1111-1111-111111111102',
    '00000000-0000-0000-0000-000000000002',
    'Our core production VPN gateway is intermittently rejecting client certificates for the design team, preventing remote access to creative cloud storage.',
    'IT_SUPPORT',
    'CRITICAL',
    'HIGH',
    '{"service": "Production VPN Gateway", "affectedTeam": "Design", "symptom": "Client TLS certificate handshake failure"}',
    'IN_PROGRESS',
    NOW() - INTERVAL '6 hours'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, request_id, assigned_role, assigned_department, assigned_user_id, step_order, title, description, status, sla_deadline, created_at)
VALUES
    ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111102', 'TECHNICIAN', 'IT', '00000000-0000-0000-0000-000000000003', 1, 'Diagnose TLS termination logs on VPN bastion', 'Investigate expiration or revocation chain mismatch in CA bundle.', 'IN_PROGRESS', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '6 hours'), -- Breached SLA for visual testing!
    ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111102', 'TECHNICIAN', 'IT', '00000000-0000-0000-0000-000000000003', 2, 'Deploy renewed intermediate CA certificate', 'Sync new cert bundle across active cluster nodes and verify handshake.', 'PENDING', NOW() + INTERVAL '2 hours', NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workflow_logs (id, request_id, action, actor_id, created_at)
VALUES
    ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111102', 'AI Orchestrator escalated request to CRITICAL priority due to team-wide connectivity loss.', NULL, NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- Request 3: Procurement (Resolved item to test resolution stats)
INSERT INTO requests (id, requester_id, raw_text, category, priority, risk_level, extracted_entities, status, created_at, resolved_at)
VALUES (
    '11111111-1111-1111-1111-111111111103',
    '00000000-0000-0000-0000-000000000001',
    'Need approval to purchase 5 ergonomic wrist-rest keyboards for the content team before Q4 sprint.',
    'PROCUREMENT',
    'MEDIUM',
    'LOW',
    '{"item": "Ergonomic wrist-rest keyboards", "quantity": 5, "beneficiary": "Content team"}',
    'RESOLVED',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, request_id, assigned_role, assigned_department, assigned_user_id, step_order, title, description, status, sla_deadline, completed_at, created_at)
VALUES
    ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111103', 'MANAGER', 'Finance', '00000000-0000-0000-0000-000000000005', 1, 'Department budget approval', 'Review purchase requisition against Q3 office expense threshold.', 'COMPLETED', NOW() - INTERVAL '1 day 12 hours', NOW() - INTERVAL '1 day 18 hours', NOW() - INTERVAL '2 days'),
    ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111103', 'TECHNICIAN', 'Procurement', NULL, 2, 'Dispatch vendor PO and schedule delivery', 'Issue purchase order with preferred hardware distributor.', 'COMPLETED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day 18 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workflow_logs (id, request_id, action, actor_id, created_at)
VALUES
    ('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111103', 'AI Orchestrator categorized as low-risk PROCUREMENT and assigned 2 steps.', NULL, NOW() - INTERVAL '2 days'),
    ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111103', 'Final task completed. Request marked as RESOLVED.', '00000000-0000-0000-0000-000000000005', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;
