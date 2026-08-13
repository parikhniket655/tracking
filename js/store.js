// Wazir Juniors - LocalStorage Store Manager

const WazirStore = (() => {
  // Sync helper
  const save = (key, data) => {
    localStorage.setItem(`wazir_${key}`, JSON.stringify(data));
  };

  const load = (key, fallback) => {
    const val = localStorage.getItem(`wazir_${key}`);
    return val ? JSON.parse(val) : fallback;
  };

  // Initialize state
  let users = load('users', DEFAULT_USERS);
  let tasks = load('tasks', DEFAULT_TASKS);
  let requests = load('requests', DEFAULT_REQUESTS);
  let notifications = load('notifications', DEFAULT_NOTIFICATIONS);
  let emailLogs = load('email_logs', DEFAULT_EMAIL_LOGS);
  let currentUser = localStorage.getItem('wazir_current_user') || 'junior_animesh';

  // Check if we have the old seed data in LocalStorage (contains junior_rahil)
  // If so, force a migration/reset to the new 10 juniors list
  if (users.some(u => u.id === 'junior_rahil')) {
    localStorage.removeItem('wazir_users');
    localStorage.removeItem('wazir_tasks');
    localStorage.removeItem('wazir_requests');
    localStorage.removeItem('wazir_notifications');
    localStorage.removeItem('wazir_email_logs');
    localStorage.removeItem('wazir_current_user');
    
    users = DEFAULT_USERS;
    tasks = DEFAULT_TASKS;
    requests = DEFAULT_REQUESTS;
    notifications = DEFAULT_NOTIFICATIONS;
    emailLogs = DEFAULT_EMAIL_LOGS;
    currentUser = 'junior_animesh';
  }

  // Seed on first run
  if (!localStorage.getItem('wazir_users')) {
    save('users', users);
    save('tasks', tasks);
    save('requests', requests);
    save('notifications', notifications);
    save('email_logs', emailLogs);
    localStorage.setItem('wazir_current_user', currentUser);
  }

  return {
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
    addTask(taskData) {
      const activeUser = this.getCurrentUser();
      const newTask = {
        id: `task_${Date.now()}`,
        name: taskData.name,
        description: taskData.description || "",
        vertical: taskData.vertical,
        priority: taskData.priority || "Medium",
        deadline: taskData.deadline, // ISO format
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
      
      tasks.unshift(newTask);
      save('tasks', tasks);

      // Trigger notification for the junior if someone else assigned it (or simulate assignment)
      if (newTask.juniorId !== activeUser.id) {
        this.addNotification(
          newTask.juniorId,
          "New Task Assigned",
          `${activeUser.name} assigned you: "${newTask.name}".`,
          "task_assigned"
        );
      }
      
      return newTask;
    },
    
    updateTaskStatus(taskId, status, userId) {
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

      save('tasks', tasks);
      return task;
    },

    // Deadline Requests
    getRequests() {
      return requests;
    },
    getRequest(id) {
      return requests.find(r => r.id === id);
    },
    addRequest(reqData) {
      const activeUser = this.getCurrentUser();
      const task = this.getTask(reqData.taskId);
      if (!task) return;

      // Check if there is already a pending request for this task
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

      requests.unshift(newReq);
      save('requests', requests);

      // Add to task history
      task.history.push({
        date: new Date().toISOString(),
        type: "deadline_change_request",
        details: `Requested extension to ${this.formatFriendlyDate(reqData.requestedDeadline)}. Reason: ${reqData.reason}`,
        user: activeUser.name
      });
      save('tasks', tasks);

      // Notify Admins
      users.filter(u => u.role === 'admin').forEach(admin => {
        this.addNotification(
          admin.id,
          "Deadline Extension Requested",
          `${activeUser.name} requested an extension for "${task.name}".`,
          "request_submitted"
        );
      });

      return newReq;
    },

    reviewRequest(reqId, status, rejectionReason = "", reviewerId) {
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
        this.addNotification(
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
        this.addNotification(
          req.juniorId,
          "Deadline Request Rejected",
          `Your request to extend "${task.name}" was rejected. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`,
          "request_rejected"
        );
      }

      save('requests', requests);
      save('tasks', tasks);
    },

    // Notifications
    getNotifications(userId) {
      return notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    getUnreadNotificationCount(userId) {
      return notifications.filter(n => n.userId === userId && !n.read).length;
    },
    addNotification(userId, title, message, type) {
      const newNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        type // 'task_assigned', 'deadline_approaching', 'task_overdue', 'request_approved', 'request_rejected', 'request_submitted'
      };
      
      notifications.unshift(newNotif);
      save('notifications', notifications);
      return newNotif;
    },
    markNotificationRead(notifId) {
      const notif = notifications.find(n => n.id === notifId);
      if (notif) {
        notif.read = true;
        save('notifications', notifications);
      }
    },
    markAllNotificationsRead(userId) {
      notifications.forEach(n => {
        if (n.userId === userId) n.read = true;
      });
      save('notifications', notifications);
    },

    // Email logs
    getEmailLogs() {
      return emailLogs;
    },
    addEmailLog(emailData) {
      const newEmail = {
        id: `email_${Date.now()}`,
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        sentAt: new Date().toISOString(),
        taskId: emailData.taskId
      };

      emailLogs.unshift(newEmail);
      save('email_logs', emailLogs);
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
      hours = hours ? hours : 12; // key 0 to 12
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hours}:${minutes} ${ampm}`;
    },

    resetStore() {
      localStorage.removeItem('wazir_users');
      localStorage.removeItem('wazir_tasks');
      localStorage.removeItem('wazir_requests');
      localStorage.removeItem('wazir_notifications');
      localStorage.removeItem('wazir_email_logs');
      localStorage.removeItem('wazir_current_user');
      window.location.reload();
    }
  };
})();
