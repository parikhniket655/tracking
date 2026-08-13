// Wazir Juniors - Mock Data Seed File
// Centered around: 2026-08-14

const DEFAULT_USERS = [
  {
    id: "junior_animesh",
    name: "Animesh",
    email: "animesh@wazir.in",
    role: "junior",
    vertical: "PR",
    avatar: "AN"
  },
  {
    id: "junior_avi",
    name: "Avi",
    email: "avi@wazir.in",
    role: "junior",
    vertical: "Events",
    avatar: "AV"
  },
  {
    id: "junior_nandini",
    name: "Nandini",
    email: "nandini@wazir.in",
    role: "junior",
    vertical: "Editorials",
    avatar: "NA"
  },
  {
    id: "junior_ishika",
    name: "Ishika",
    email: "ishika@wazir.in",
    role: "junior",
    vertical: "APEX",
    avatar: "IS"
  },
  {
    id: "junior_akruti",
    name: "Akruti",
    email: "akruti@wazir.in",
    role: "junior",
    vertical: "ER",
    avatar: "AK"
  },
  {
    id: "junior_vishaka",
    name: "Vishaka",
    email: "vishaka@wazir.in",
    role: "junior",
    vertical: "CaseBook",
    avatar: "VI"
  },
  {
    id: "junior_harshvardhan",
    name: "Harshvardhan",
    email: "harshvardhan@wazir.in",
    role: "junior",
    vertical: "PR",
    avatar: "HV"
  },
  {
    id: "junior_devanshi",
    name: "Devanshi",
    email: "devanshi@wazir.in",
    role: "junior",
    vertical: "Events",
    avatar: "DE"
  },
  {
    id: "junior_simarpreet",
    name: "Simarpreet",
    email: "simarpreet@wazir.in",
    role: "junior",
    vertical: "Editorials",
    avatar: "SI"
  },
  {
    id: "junior_somansha",
    name: "Somansha",
    email: "somansha@wazir.in",
    role: "junior",
    vertical: "APEX",
    avatar: "SO"
  },
  {
    id: "admin_senior",
    name: "Wazir Senior",
    email: "senior@wazir.in",
    role: "admin",
    vertical: "Other",
    avatar: "WS"
  }
];

const DEFAULT_TASKS = [
  {
    id: "task_1",
    name: "Finalize COTY Sponsorship Deck",
    description: "Prepare the complete sponsor deck for the upcoming Circle of the Year event, including pricing tiers and past delivery deliverables.",
    vertical: "Events",
    priority: "High",
    deadline: "2026-08-15T18:00:00",
    assignedBy: "Wazir Senior",
    juniorId: "junior_avi",
    status: "In Progress",
    attachments: [
      { name: "Draft_COTY_Pitch.pdf", url: "#" },
      { name: "Sponsorship_Guidelines.docx", url: "#" }
    ],
    notes: "Requires coordination with PR team for social metrics data.",
    createdAt: "2026-08-10T10:00:00",
    history: [
      {
        date: "2026-08-10T10:00:00",
        type: "create",
        details: "Task created and assigned to Avi with deadline 15 August 2026.",
        user: "Wazir Senior"
      },
      {
        date: "2026-08-12T14:30:00",
        type: "status_change",
        details: "Status updated from 'Not Started' to 'In Progress'.",
        user: "Avi"
      }
    ]
  },
  {
    id: "task_2",
    name: "Draft Press Release for Wazir Launch",
    description: "Write a comprehensive press release detailing Wazir's expansion into new business verticals. Needs to highlight the key leadership team and client benefits.",
    vertical: "PR",
    priority: "Medium",
    deadline: "2026-08-14T14:00:00",
    assignedBy: "Wazir Senior",
    juniorId: "junior_animesh",
    status: "Under Review",
    attachments: [],
    notes: "Must be approved by senior lead before distributing to media partners.",
    createdAt: "2026-08-11T09:30:00",
    history: [
      {
        date: "2026-08-11T09:30:00",
        type: "create",
        details: "Task created and assigned to Animesh.",
        user: "Wazir Senior"
      },
      {
        date: "2026-08-13T17:00:00",
        type: "status_change",
        details: "Status updated from 'In Progress' to 'Under Review'.",
        user: "Animesh"
      }
    ]
  },
  {
    id: "task_3",
    name: "Compile CaseBook Finance Section",
    description: "Gather case studies and financial metrics for the Wazir CaseBook Q2 release. Make sure all figures are double-checked.",
    vertical: "CaseBook",
    priority: "Low",
    deadline: "2026-08-19T23:59:00",
    assignedBy: "Wazir Senior",
    juniorId: "junior_vishaka",
    status: "Not Started",
    attachments: [],
    notes: "Review past templates for financial reporting structure.",
    createdAt: "2026-08-13T16:00:00",
    history: [
      {
        date: "2026-08-13T16:00:00",
        type: "create",
        details: "Task created and assigned to Vishaka.",
        user: "Wazir Senior"
      }
    ]
  },
  {
    id: "task_4",
    name: "Audit Editorial Submissions Q3",
    description: "Perform an index and spell audit of all drafts received for the Q3 Editorial journal.",
    vertical: "Editorials",
    priority: "Medium",
    deadline: "2026-08-13T12:00:00", // Overdue!
    assignedBy: "Wazir Senior",
    juniorId: "junior_nandini",
    status: "In Progress",
    attachments: [],
    notes: "3 drafts are still pending review.",
    createdAt: "2026-08-08T11:00:00",
    history: [
      {
        date: "2026-08-08T11:00:00",
        type: "create",
        details: "Task created and assigned to Nandini.",
        user: "Wazir Senior"
      },
      {
        date: "2026-08-09T10:00:00",
        type: "status_change",
        details: "Status updated to In Progress.",
        user: "Nandini"
      }
    ]
  },
  {
    id: "task_5",
    name: "APEX Design Assets for Website",
    description: "Create and export high-resolution SVG/PNG assets for Wazir APEX's landing page refresh. Check layouts on mobile dimensions.",
    vertical: "APEX",
    priority: "High",
    deadline: "2026-08-11T17:00:00", // Was due in the past, but completed.
    assignedBy: "Wazir Senior",
    juniorId: "junior_ishika",
    status: "Completed",
    attachments: [
      { name: "APEX_Icons_Export.zip", url: "#" }
    ],
    notes: "Feedback from design review incorporated.",
    createdAt: "2026-08-05T09:00:00",
    history: [
      {
        date: "2026-08-05T09:00:00",
        type: "create",
        details: "Task created.",
        user: "Wazir Senior"
      },
      {
        date: "2026-08-11T15:30:00",
        type: "status_change",
        details: "Status updated to Completed.",
        user: "Ishika"
      }
    ]
  },
  {
    id: "task_6",
    name: "Schedule ER Speaker Panel",
    description: "Invite key external relations experts and setup the Zoom webinar link for the panel session.",
    vertical: "ER",
    priority: "Medium",
    deadline: "2026-08-18T16:00:00", // Awaiting approval
    assignedBy: "Wazir Senior",
    juniorId: "junior_avi",
    status: "In Progress",
    attachments: [],
    notes: "Requires at least 3 panel confirmations.",
    createdAt: "2026-08-12T15:00:00",
    history: [
      {
        date: "2026-08-12T15:00:00",
        type: "create",
        details: "Task created.",
        user: "Wazir Senior"
      },
      {
        date: "2026-08-14T01:00:00",
        type: "deadline_change_request",
        details: "Requested deadline extension to 2026-08-24T16:00:00. Reason: Speaker requested rescheduling due to travel conflict.",
        user: "Avi"
      }
    ]
  }
];

const DEFAULT_REQUESTS = [
  {
    id: "req_1",
    taskId: "task_6",
    juniorId: "junior_avi",
    currentDeadline: "2026-08-18T16:00:00",
    requestedDeadline: "2026-08-24T16:00:00",
    reason: "Key speaker had an urgent travel conflict and requested that we move the panel to the following week. This is necessary to maintain the panel lineup.",
    requestedOn: "2026-08-14T01:00:00",
    status: "Pending",
    rejectionReason: ""
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif_1",
    userId: "admin_senior",
    title: "Deadline Change Requested",
    message: "Avi requested a deadline change for 'Schedule ER Speaker Panel' to 24 August 2026.",
    timestamp: "2026-08-14T01:00:00",
    read: false,
    type: "request_submitted"
  },
  {
    id: "notif_2",
    userId: "junior_avi",
    title: "Task Assigned",
    message: "Wazir Senior assigned you a new task: 'Finalize COTY Sponsorship Deck'.",
    timestamp: "2026-08-10T10:00:00",
    read: true,
    type: "task_assigned"
  },
  {
    id: "notif_3",
    userId: "junior_nandini",
    title: "Task Overdue Notice",
    message: "Task 'Audit Editorial Submissions Q3' is overdue! Deadline was 13 August, 12:00 PM.",
    timestamp: "2026-08-13T12:05:00",
    read: false,
    type: "task_overdue"
  }
];

const DEFAULT_EMAIL_LOGS = [
  {
    id: "email_1",
    to: "nandini@wazir.in",
    subject: "Reminder: Task Due Tomorrow - Audit Editorial Submissions Q3",
    body: `
      <div class="email-rendered-card">
        <div class="email-header-banner">Wazir Juniors</div>
        <div class="email-content-box">
          <div class="email-content-title">Reminder: Task Due Tomorrow</div>
          <p>Hi Nandini,</p>
          <br>
          <p>Your task <strong>"Audit Editorial Submissions Q3"</strong> is due tomorrow.</p>
          <br>
          <div class="email-detail-row"><span class="email-detail-label">Deadline:</span> 13 August 2026, 12:00 PM</div>
          <div class="email-detail-row"><span class="email-detail-label">Vertical:</span> Editorials</div>
          <div class="email-detail-row"><span class="email-detail-label">Priority:</span> Medium</div>
          <br>
          <p>Please update your status or request a deadline extension if you need more time.</p>
          <a href="#/tasks" class="email-btn">Open Task</a>
        </div>
      </div>
    `,
    sentAt: "2026-08-12T12:00:00",
    taskId: "task_4"
  }
];
