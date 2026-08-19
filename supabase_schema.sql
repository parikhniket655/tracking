-- Wazir Juniors Task Tracker - Supabase SQL Database Schema
-- Paste this script into the Supabase SQL Editor and click 'Run'

-- Drop existing tables if they exist
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create Users Table
CREATE TABLE users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('junior', 'admin')),
  vertical text NOT NULL,
  avatar text NOT NULL
);

-- 2. Create Tasks Table
CREATE TABLE tasks (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  vertical text NOT NULL,
  priority text NOT NULL,
  deadline text NOT NULL, -- Stored as ISO string to simplify timezone parsing
  "assignedBy" text NOT NULL,
  "juniorId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  notes text,
  "createdAt" text NOT NULL,
  history jsonb DEFAULT '[]'::jsonb
);

-- 3. Create Requests Table (Deadline extension requests)
CREATE TABLE requests (
  id text PRIMARY KEY,
  "taskId" text NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  "juniorId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "currentDeadline" text NOT NULL,
  "requestedDeadline" text NOT NULL,
  reason text NOT NULL,
  "requestedOn" text NOT NULL,
  status text NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  "rejectionReason" text DEFAULT ''
);

-- 4. Create Notifications Table
CREATE TABLE notifications (
  id text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  timestamp text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  type text NOT NULL
);

-- 5. Create Email Logs Table
CREATE TABLE email_logs (
  id text PRIMARY KEY,
  "to" text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  "sentAt" text NOT NULL,
  "taskId" text NOT NULL REFERENCES tasks(id) ON DELETE CASCADE
);

-- 6. Create Attendance Table
CREATE TABLE attendance (
  id text PRIMARY KEY,
  "juniorId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date text NOT NULL, -- Stored in YYYY-MM-DD format
  status text NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
  "checkInTime" text, -- ISO string when checked in
  UNIQUE("juniorId", date) -- A junior can only have one attendance log per day!
);

-- Disable Row Level Security (RLS) for simple testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;

-- Seed Database with the 10 Juniors & Admin
INSERT INTO users (id, name, email, role, vertical, avatar) VALUES
  ('junior_animesh', 'Animesh', 'animesh@wazir.in', 'junior', 'PR', 'AN'),
  ('junior_avi', 'Avi', 'avi@wazir.in', 'junior', 'Events', 'AV'),
  ('junior_nandini', 'Nandini', 'nandini@wazir.in', 'junior', 'Editorials', 'NA'),
  ('junior_ishika', 'Ishika', 'ishika@wazir.in', 'junior', 'APEX', 'IS'),
  ('junior_akruti', 'Akruti', 'akruti@wazir.in', 'junior', 'ER', 'AK'),
  ('junior_vishakha', 'Vishakha', 'vishakha@wazir.in', 'junior', 'CaseBook', 'VI'),
  ('junior_harshvardhan', 'Harshvardhan', 'harshvardhan@wazir.in', 'junior', 'PR', 'HV'),
  ('junior_devanshi', 'Devanshi', 'devanshi@wazir.in', 'junior', 'Events', 'DE'),
  ('junior_simarpreet', 'Simarpreet', 'simarpreet@wazir.in', 'junior', 'Editorials', 'SI'),
  ('junior_somansha', 'Somansha', 'somansha@wazir.in', 'junior', 'APEX', 'SO'),
  ('admin_senior', 'Wazir Senior', 'senior@wazir.in', 'admin', 'Other', 'WS')
ON CONFLICT (id) DO NOTHING;

-- Seed Database with Initial Tasks
INSERT INTO tasks (id, name, description, vertical, priority, deadline, "assignedBy", "juniorId", status, attachments, notes, "createdAt", history) VALUES
  (
    'task_1', 
    'Finalize COTY Sponsorship Deck', 
    'Prepare the complete sponsor deck for the upcoming Circle of the Year event, including pricing tiers and past deliverables.', 
    'Events', 
    'High', 
    '2026-08-18T18:00:00', 
    'Wazir Senior', 
    'junior_avi', 
    'In Progress', 
    '[{"name": "Draft_COTY_Pitch.pdf", "url": "#"}, {"name": "Sponsorship_Guidelines.docx", "url": "#"}]'::jsonb, 
    'Requires coordination with PR team for social metrics data.', 
    '2026-08-10T10:00:00',
    '[{"date": "2026-08-10T10:00:00", "type": "create", "details": "Task created and assigned to Avi with deadline 18 August 2026.", "user": "Wazir Senior"}, {"date": "2026-08-12T14:30:00", "type": "status_change", "details": "Status updated from Not Started to In Progress.", "user": "Avi"}]'::jsonb
  ),
  (
    'task_2', 
    'Draft Press Release for Wazir Launch', 
    'Write a comprehensive press release detailing Wazir expansion into new business verticals. Needs to highlight the key leadership team and client benefits.', 
    'PR', 
    'Medium', 
    '2026-08-17T14:00:00', 
    'Wazir Senior', 
    'junior_animesh', 
    'Under Review', 
    '[]'::jsonb, 
    'Must be approved by senior lead before distributing to media partners.', 
    '2026-08-11T09:30:00',
    '[{"date": "2026-08-11T09:30:00", "type": "create", "details": "Task created and assigned to Animesh.", "user": "Wazir Senior"}, {"date": "2026-08-13T17:00:00", "type": "status_change", "details": "Status updated from In Progress to Under Review.", "user": "Animesh"}]'::jsonb
  ),
  (
    'task_3', 
    'Compile CaseBook Finance Section', 
    'Gather case studies and financial metrics for the Wazir CaseBook Q2 release. Make sure all figures are double-checked.', 
    'CaseBook', 
    'Low', 
    '2026-08-19T23:59:00', 
    'Wazir Senior', 
    'junior_vishakha', 
    'Not Started', 
    '[]'::jsonb, 
    'Review past templates for financial reporting structure.', 
    '2026-08-13T16:00:00',
    '[{"date": "2026-08-13T16:00:00", "type": "create", "details": "Task created and assigned to Vishakha.", "user": "Wazir Senior"}]'::jsonb
  ),
  (
    'task_4', 
    'Audit Editorial Submissions Q3', 
    'Perform an index and spell audit of all drafts received for the Q3 Editorial journal.', 
    'Editorials', 
    'Medium', 
    '2026-08-16T12:00:00', 
    'Wazir Senior', 
    'junior_nandini', 
    'In Progress', 
    '[]'::jsonb, 
    '3 drafts are still pending review.', 
    '2026-08-08T11:00:00',
    '[{"date": "2026-08-08T11:00:00", "type": "create", "details": "Task created and assigned to Nandini.", "user": "Wazir Senior"}, {"date": "2026-08-09T10:00:00", "type": "status_change", "details": "Status updated to In Progress.", "user": "Nandini"}]'::jsonb
  ),
  (
    'task_5', 
    'APEX Design Assets for Website', 
    'Create and export high-resolution SVG/PNG assets for Wazir APEX refresh. Check layouts on mobile dimensions.', 
    'APEX', 
    'High', 
    '2026-08-14T17:00:00', 
    'Wazir Senior', 
    'junior_ishika', 
    'Completed', 
    '[{"name": "APEX_Icons_Export.zip", "url": "#"}]'::jsonb, 
    'Feedback incorporated.', 
    '2026-08-05T09:00:00',
    '[{"date": "2026-08-05T09:00:00", "type": "create", "details": "Task created.", "user": "Wazir Senior"}, {"date": "2026-08-14T15:30:00", "type": "status_change", "details": "Status updated to Completed.", "user": "Ishika"}]'::jsonb
  ),
  (
    'task_6', 
    'Schedule ER Speaker Panel', 
    'Invite key external relations experts and setup the Zoom webinar link for the panel session.', 
    'ER', 
    'Medium', 
    '2026-08-20T16:00:00', 
    'Wazir Senior', 
    'junior_avi', 
    'In Progress', 
    '[]'::jsonb, 
    'Requires at least 3 panel confirmations.', 
    '2026-08-12T15:00:00',
    '[{"date": "2026-08-12T15:00:00", "type": "create", "details": "Task created.", "user": "Wazir Senior"}, {"date": "2026-08-14T01:00:00", "type": "deadline_change_request", "details": "Requested deadline extension to 2026-08-24T16:00:00. Reason: Speaker requested rescheduling.", "user": "Avi"}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Database with Initial Request
INSERT INTO requests (id, "taskId", "juniorId", "currentDeadline", "requestedDeadline", reason, "requestedOn", status) VALUES
  ('req_1', 'task_6', 'junior_avi', '2026-08-20T16:00:00', '2026-08-24T16:00:00', 'Key speaker had an urgent travel conflict and requested that we move the panel to the following week. This is necessary to maintain the panel lineup.', '2026-08-14T01:00:00', 'Pending')
ON CONFLICT (id) DO NOTHING;

-- Seed Database with Initial Notifications
INSERT INTO notifications (id, "userId", title, message, timestamp, read, type) VALUES
  ('notif_1', 'admin_senior', 'Deadline Change Requested', 'Avi requested a deadline change for Schedule ER Speaker Panel to 24 August 2026.', '2026-08-14T01:00:00', false, 'request_submitted'),
  ('notif_2', 'junior_avi', 'Task Assigned', 'Wazir Senior assigned you a new task: Finalize COTY Sponsorship Deck.', '2026-08-10T10:00:00', true, 'task_assigned'),
  ('notif_3', 'junior_nandini', 'Task Overdue Notice', 'Task Audit Editorial Submissions Q3 is overdue! Deadline was 16 August, 12:00 PM.', '2026-08-16T12:05:00', false, 'task_overdue')
ON CONFLICT (id) DO NOTHING;

-- Seed Database with Initial Email Logs
INSERT INTO email_logs (id, "to", subject, body, "sentAt", "taskId") VALUES
  ('email_1', 'nandini@wazir.in', 'Reminder: Task Due Tomorrow - Audit Editorial Submissions Q3', '
      <div class="email-rendered-card">
        <div class="email-header-banner">Wazir Juniors</div>
        <div class="email-content-box">
          <div class="email-content-title">Reminder: Task Due Tomorrow</div>
          <p>Hi Nandini,</p>
          <br>
          <p>Your task <strong>"Audit Editorial Submissions Q3"</strong> is due tomorrow.</p>
          <br>
          <div class="email-detail-row"><span class="email-detail-label">Deadline:</span> 16 August 2026, 12:00 PM</div>
          <div class="email-detail-row"><span class="email-detail-label">Vertical:</span> Editorials</div>
          <div class="email-detail-row"><span class="email-detail-label">Priority:</span> Medium</div>
          <br>
          <p>Please update your status or request a deadline extension if you need more time.</p>
          <a href="#/tasks" class="email-btn">Open Task</a>
        </div>
      </div>
    ', '2026-08-15T12:00:00', 'task_4')
ON CONFLICT (id) DO NOTHING;

-- Seed Database with Sample Attendance Logs
INSERT INTO attendance (id, "juniorId", date, status, "checkInTime") VALUES
  ('att_1', 'junior_animesh', '2026-08-17', 'Present', '2026-08-17T09:15:00'),
  ('att_2', 'junior_avi', '2026-08-17', 'Present', '2026-08-17T09:05:00'),
  ('att_3', 'junior_nandini', '2026-08-17', 'Late', '2026-08-17T09:45:00'),
  ('att_4', 'junior_ishika', '2026-08-17', 'Present', '2026-08-17T09:10:00'),
  ('att_5', 'junior_akruti', '2026-08-17', 'Absent', NULL),
  ('att_6', 'junior_vishakha', '2026-08-17', 'Present', '2026-08-17T09:02:00'),
  ('att_7', 'junior_harshvardhan', '2026-08-17', 'Present', '2026-08-17T09:20:00'),
  ('att_8', 'junior_devanshi', '2026-08-17', 'Absent', NULL),
  ('att_9', 'junior_simarpreet', '2026-08-17', 'Present', '2026-08-17T09:08:00'),
  ('att_10', 'junior_somansha', '2026-08-17', 'Late', '2026-08-17T09:35:00'),
  
  -- Today's attendance (some are present, some haven't checked in yet)
  ('att_11', 'junior_animesh', '2026-08-18', 'Present', '2026-08-18T09:12:00'),
  ('att_12', 'junior_nandini', '2026-08-18', 'Present', '2026-08-18T08:55:00'),
  ('att_13', 'junior_ishika', '2026-08-18', 'Late', '2026-08-18T09:40:00'),
  ('att_14', 'junior_vishakha', '2026-08-18', 'Present', '2026-08-18T09:05:00')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security & Grant Public Read/Write Access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access users" ON users;
DROP POLICY IF EXISTS "Public access tasks" ON tasks;
DROP POLICY IF EXISTS "Public access requests" ON requests;
DROP POLICY IF EXISTS "Public access notifications" ON notifications;
DROP POLICY IF EXISTS "Public access email_logs" ON email_logs;
DROP POLICY IF EXISTS "Public access attendance" ON attendance;

CREATE POLICY "Public access users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access requests" ON requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access email_logs" ON email_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime Publication for instant cross-device updates
ALTER PUBLICATION supabase_realtime ADD TABLE users, tasks, requests, notifications, email_logs, attendance;
