// Wazir Juniors - Supabase Cloud Database Store Manager

const WazirStore = (() => {
  // Supabase Configuration Credentials
  const supabaseUrl = 'https://qctpyulbwjiyvzyhsvfg.supabase.co';
  const supabaseKey = 'sb_publishable_Skq8e-reB7Ym6L-dI5Z53Q_1MT0ekyA';
  
  let supabase = null;
  let usingSupabase = false;

  // Local Cached State Arrays
  let users = [];
  let tasks = [];
  let requests = [];
  let notifications = [];
  let emailLogs = [];
  let currentUser = 'junior_animesh';

  // Initialize Supabase Client & Pull Data
  const initSupabase = async () => {
    try {
      if (typeof window.supabase === 'undefined') {
        throw new Error("Supabase library not loaded from CDN.");
      }

      // Create Supabase Client
      supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      
      // Load current user from session cache
      currentUser = localStorage.getItem('wazir_current_user') || 'junior_animesh';

      // Test query to check if users table exists and fetch
      const { data: usersData, error: usersErr } = await supabase.from('users').select('*');
      if (usersErr) throw usersErr;
      
      users = usersData;
      usingSupabase = true;

      // Fetch remainder tables
      const [tasksRes, reqsRes, notifsRes, emailRes] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('requests').select('*'),
        supabase.from('notifications').select('*'),
        supabase.from('email_logs').select('*')
      ]);

      if (tasksRes.data) tasks = tasksRes.data;
      if (reqsRes.data) requests = reqsRes.data;
      if (notifsRes.data) notifications = notifsRes.data;
      if (emailRes.data) emailLogs = emailRes.data;

      console.log("Connected to Supabase. Loaded", tasks.length, "tasks.");

      // Setup Realtime subscriptions
      setupRealtimeSubscriptions();

    } catch (err) {
      console.warn("Supabase connection failed or tables not initialized. Error:", err.message);
      console.warn("Falling back to local browser storage mock mode.");
      
      usingSupabase = false;
      
      // Fallback: load seed database from mockData.js or localStorage
      const loadLocal = (key, fallback) => {
        const val = localStorage.getItem(`wazir_${key}`);
        return val ? JSON.parse(val) : fallback;
      };
      
      users = loadLocal('users', DEFAULT_USERS);
      tasks = loadLocal('tasks', DEFAULT_TASKS);
      requests = loadLocal('requests', DEFAULT_REQUESTS);
      notifications = loadLocal('notifications', DEFAULT_NOTIFICATIONS);
      emailLogs = loadLocal('email_logs', DEFAULT_EMAIL_LOGS);
      currentUser = localStorage.getItem('wazir_current_user') || 'junior_animesh';

      // Auto-migrate from old placeholder names if needed
      if (users.some(u => u.id === 'junior_rahil')) {
        users = DEFAULT_USERS;
        tasks = DEFAULT_TASKS;
        requests = DEFAULT_REQUESTS;
        notifications = DEFAULT_NOTIFICATIONS;
        emailLogs = DEFAULT_EMAIL_LOGS;
        currentUser = 'junior_animesh';
        
        localStorage.setItem('wazir_users', JSON.stringify(users));
        localStorage.setItem('wazir_tasks', JSON.stringify(tasks));
        localStorage.setItem('wazir_requests', JSON.stringify(requests));
        localStorage.setItem('wazir_notifications', JSON.stringify(notifications));
        localStorage.setItem('wazir_email_logs', JSON.stringify(emailLogs));
        localStorage.setItem('wazir_current_user', currentUser);
      }
    }
  };

  // Setup Postgres Change Listeners (Real-time syncing)
  const setupRealtimeSubscriptions = () => {
    if (!supabase) return;

    supabase.channel('public:db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
        const { data } = await supabase.from('tasks').select('*');
        if (data) {
          tasks = data;
          triggerUIRefresh();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, async () => {
        const { data } = await supabase.from('requests').select('*');
        if (data) {
          requests = data;
          triggerUIRefresh();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, async () => {
        const { data } = await supabase.from('notifications').select('*');
        if (data) {
          notifications = data;
          triggerUIRefresh();
        }
      })
      .subscribe();
  };

  // Triggers visual refresh of active view in app.js on database change
  const triggerUIRefresh = () => {
    if (window.WazirApp && typeof window.WazirApp.refreshCurrentView === 'function') {
      window.WazirApp.refreshCurrentView();
    }
  };

  // Sync helper for Local fallback
  const syncLocal = (key, data) => {
    if (!usingSupabase) {
      localStorage.setItem(`wazir_${key}`, JSON.stringify(data));
    }
  };

  return {
    initSupabase,
    isUsingSupabase() {
      return usingSupabase;
    },

    // Current User Session
    getCurrentUser() {
      return users.find(u => u.id === currentUser) || users[0];
    },
    setCurrentUser(id) {
      currentUser = id;
      localStorage.setItem('wazir_current_user', id);
    },
    getUsers() {
      return users;
    },
    getUser(id) {
      return users.find(u => u.id === id);
    },

    // Tasks Management
    getTasks() {
      return tasks;
    },
    getTask(id) {
      return tasks.find(t => t.id === id);
    },
    async addTask(taskData) {
      const activeUser = this.getCurrentUser();
      const newTask = {
        id: `task_${Date.now()}`,
        name: taskData.name,
        description: taskData.description || "",
        vertical: taskData.vertical,
        priority: taskData.priority || "Medium",
        deadline: taskData.deadline, 
        assignedBy: activeUser.role === 'admin' ? activeUser.name : (taskData.assignedBy || "Wazir Senior"),
        juniorId: taskData.juniorId || activeUser.id,
        status: taskData.status || "Not Started",
        attachments: taskData.attachments || [],
        notes: taskData.notes || "",
        createdAt: new Date().toISOString(),
        history: [
          {
            date: new Date().toISOString(),
            type: "create",
            details: `Task created and assigned to ${this.getUser(taskData.juniorId || activeUser.id).name} with deadline ${this.formatFriendlyDate(taskData.deadline)}.`,
            user: activeUser.name
          }
        ]
      };
      
      // Update Cache
      tasks.unshift(newTask);
      syncLocal('tasks', tasks);

      // Cloud Write
      if (usingSupabase) {
        await supabase.from('tasks').insert([newTask]);
      }

      // Trigger notification for the junior if someone else assigned it
      if (newTask.juniorId !== activeUser.id) {
        await this.addNotification(
          newTask.juniorId,
          "New Task Assigned",
          `${activeUser.name} assigned you: "${newTask.name}".`,
          "task_assigned"
        );
      }
      
      return newTask;
    },
    
    async updateTaskStatus(taskId, status, userId) {
      const task = this.getTask(taskId);
      const user = this.getUser(userId);
      if (!task) return;

      const oldStatus = task.status;
      task.status = status;
      task.history.push({
        date: new Date().toISOString(),
        type: "status_change",
        details: `Status updated from '${oldStatus}' to '${status}'.`,
        user: user ? user.name : "System"
      });

      // Sync
      syncLocal('tasks', tasks);
      if (usingSupabase) {
        await supabase.from('tasks').update({ status, history: task.history }).eq('id', taskId);
      }

      return task;
    },

    // Deadline Requests
    getRequests() {
      return requests;
    },
    getRequest(id) {
      return requests.find(r => r.id === id);
    },
    async addRequest(reqData) {
      const activeUser = this.getCurrentUser();
      const task = this.getTask(reqData.taskId);
      if (!task) return;

      const hasPending = requests.some(r => r.taskId === reqData.taskId && r.status === 'Pending');
      if (hasPending) throw new Error("A deadline extension request is already pending review for this task.");

      const newReq = {
        id: `req_${Date.now()}`,
        taskId: reqData.taskId,
        juniorId: activeUser.id,
        currentDeadline: task.deadline,
        requestedDeadline: reqData.requestedDeadline,
        reason: reqData.reason,
        requestedOn: new Date().toISOString(),
        status: "Pending",
        rejectionReason: ""
      };

      // Cache Update
      requests.unshift(newReq);
      syncLocal('requests', requests);

      task.history.push({
        date: new Date().toISOString(),
        type: "deadline_change_request",
        details: `Requested extension to ${this.formatFriendlyDate(reqData.requestedDeadline)}. Reason: ${reqData.reason}`,
        user: activeUser.name
      });
      syncLocal('tasks', tasks);

      // Cloud Writes
      if (usingSupabase) {
        await Promise.all([
          supabase.from('requests').insert([newReq]),
          supabase.from('tasks').update({ history: task.history }).eq('id', task.id)
        ]);
      }

      // Notify Admins
      const admins = users.filter(u => u.role === 'admin');
      for (const admin of admins) {
        await this.addNotification(
          admin.id,
          "Deadline Extension Requested",
          `${activeUser.name} requested an extension for "${task.name}".`,
          "request_submitted"
        );
      }

      return newReq;
    },

    async reviewRequest(reqId, status, rejectionReason = "", reviewerId) {
      const req = this.getRequest(reqId);
      const reviewer = this.getUser(reviewerId);
      if (!req || req.status !== 'Pending') return;

      const task = this.getTask(req.taskId);
      if (!task) return;

      req.status = status;
      req.rejectionReason = rejectionReason;
      
      const actionTime = new Date().toISOString();

      if (status === 'Approved') {
        const oldDeadline = task.deadline;
        task.deadline = req.requestedDeadline;
        
        task.history.push({
          date: actionTime,
          type: "deadline_change",
          details: `Deadline extension APPROVED from ${this.formatFriendlyDate(oldDeadline)} to ${this.formatFriendlyDate(req.requestedDeadline)}.`,
          user: reviewer ? reviewer.name : "Admin"
        });

        // Notify Junior
        await this.addNotification(
          req.juniorId,
          "Deadline Request Approved",
          `Your request to extend "${task.name}" to ${this.formatFriendlyDate(req.requestedDeadline)} was approved.`,
          "request_approved"
        );
      } else {
        task.history.push({
          date: actionTime,
          type: "deadline_change",
          details: `Deadline extension REJECTED. Reason: ${rejectionReason || "None provided"}`,
          user: reviewer ? reviewer.name : "Admin"
        });

        // Notify Junior
        await this.addNotification(
          req.juniorId,
          "Deadline Request Rejected",
          `Your request to extend "${task.name}" was rejected. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`,
          "request_rejected"
        );
      }

      // Sync
      syncLocal('requests', requests);
      syncLocal('tasks', tasks);

      if (usingSupabase) {
        if (status === 'Approved') {
          await Promise.all([
            supabase.from('requests').update({ status, rejectionReason }).eq('id', reqId),
            supabase.from('tasks').update({ deadline: task.deadline, history: task.history }).eq('id', task.id)
          ]);
        } else {
          await Promise.all([
            supabase.from('requests').update({ status, rejectionReason }).eq('id', reqId),
            supabase.from('tasks').update({ history: task.history }).eq('id', task.id)
          ]);
        }
      }
    },

    // Notifications
    getNotifications(userId) {
      return notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    getUnreadNotificationCount(userId) {
      return notifications.filter(n => n.userId === userId && !n.read).length;
    },
    async addNotification(userId, title, message, type) {
      const newNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        type
      };
      
      // Cache Update
      notifications.unshift(newNotif);
      syncLocal('notifications', notifications);

      if (usingSupabase) {
        await supabase.from('notifications').insert([newNotif]);
      }
      return newNotif;
    },
    async markNotificationRead(notifId) {
      const notif = notifications.find(n => n.id === notifId);
      if (notif) {
        notif.read = true;
        syncLocal('notifications', notifications);

        if (usingSupabase) {
          await supabase.from('notifications').update({ read: true }).eq('id', notifId);
        }
      }
    },
    async markAllNotificationsRead(userId) {
      notifications.forEach(n => {
        if (n.userId === userId) n.read = true;
      });
      syncLocal('notifications', notifications);

      if (usingSupabase) {
        await supabase.from('notifications').update({ read: true }).eq('userId', userId);
      }
    },

    // Email logs
    getEmailLogs() {
      return emailLogs;
    },
    async addEmailLog(emailData) {
      const newEmail = {
        id: `email_${Date.now()}`,
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        sentAt: new Date().toISOString(),
        taskId: emailData.taskId
      };

      // Cache Update
      emailLogs.unshift(newEmail);
      syncLocal('email_logs', emailLogs);

      if (usingSupabase) {
        await supabase.from('email_logs').insert([newEmail]);
      }
      return newEmail;
    },

    // Utilities
    formatFriendlyDate(dateString) {
      if (!dateString) return "";
      const d = new Date(dateString);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hours}:${minutes} ${ampm}`;
    },

    async resetStore() {
      if (usingSupabase) {
        try {
          // Truncate tables
          await Promise.all([
            supabase.from('email_logs').delete().neq('id', ''),
            supabase.from('notifications').delete().neq('id', ''),
            supabase.from('requests').delete().neq('id', ''),
            supabase.from('tasks').delete().neq('id', '')
          ]);

          // Re-insert initial seeding
          await Promise.all([
            supabase.from('tasks').insert(DEFAULT_TASKS),
            supabase.from('requests').insert(DEFAULT_REQUESTS),
            supabase.from('notifications').insert(DEFAULT_NOTIFICATIONS),
            supabase.from('email_logs').insert(DEFAULT_EMAIL_LOGS)
          ]);
        } catch (err) {
          console.error("Error resetting Supabase database:", err.message);
        }
      } else {
        localStorage.removeItem('wazir_users');
        localStorage.removeItem('wazir_tasks');
        localStorage.removeItem('wazir_requests');
        localStorage.removeItem('wazir_notifications');
        localStorage.removeItem('wazir_email_logs');
        localStorage.removeItem('wazir_current_user');
      }
      window.location.reload();
    }
  };
})();
