// Wazir Juniors - Simulated Email Reminder Service

const WazirEmailService = (() => {
  const CHECK_INTERVAL = 30000; // Check every 30 seconds
  let timerId = null;

  const runSweep = () => {
    const tasks = WazirStore.getTasks();
    const emails = WazirStore.getEmailLogs();
    const users = WazirStore.getUsers();
    const now = new Date();

    tasks.forEach(task => {
      // Only remind for non-completed tasks
      if (task.status === 'Completed') return;

      const deadline = new Date(task.deadline);
      const timeDiffMs = deadline - now;
      const hoursDiff = timeDiffMs / (1000 * 60 * 60);

      // Check if due in less than 24 hours AND has not yet passed by more than 1 hour (to avoid back-firing alerts)
      if (hoursDiff > -1 && hoursDiff <= 24) {
        const friendlyDeadline = WazirStore.formatFriendlyDate(task.deadline);
        
        // Check if an email was already sent for this specific deadline
        // If a deadline changes, the friendlyDeadline string changes, triggering a new email.
        const alreadySent = emails.some(e => e.taskId === task.id && e.subject.includes(friendlyDeadline));

        if (!alreadySent) {
          const junior = users.find(u => u.id === task.juniorId);
          if (!junior) return;

          // Build HTML body
          const emailBody = `
            <div class="email-rendered-card">
              <div class="email-header-banner" style="background-color: ${task.assignedBy === 'Admin' ? 'var(--color-admin)' : 'var(--color-primary)'}; color: white; padding: 20px; text-align: center; font-weight: 700; font-family: sans-serif;">
                Wazir Juniors — Task Reminder
              </div>
              <div class="email-content-box" style="padding: 24px; font-family: sans-serif; color: #1e293b; line-height: 1.6;">
                <div class="email-content-title" style="font-size: 1.2rem; font-weight: 800; margin-bottom: 12px; color: #0f172a;">
                  Reminder: Task Due Tomorrow
                </div>
                <p>Hi <strong>${junior.name}</strong>,</p>
                <p>Your task <strong>"${task.name}"</strong> is due tomorrow.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;">
                <div style="margin-bottom: 8px;"><span style="font-weight: 600; color: #475569;">Deadline:</span> ${friendlyDeadline}</div>
                <div style="margin-bottom: 8px;"><span style="font-weight: 600; color: #475569;">Vertical:</span> ${task.vertical}</div>
                <div style="margin-bottom: 8px;"><span style="font-weight: 600; color: #475569;">Priority:</span> <span style="font-weight: 700; color: ${task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'orange' : 'green'};">${task.priority}</span></div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;">
                <p style="font-size: 0.9rem; color: #64748b;"><em>Note: ${task.notes || 'No additional notes provided.'}</em></p>
                <a href="#/tasks" class="email-btn" style="display: block; text-align: center; background-color: #2563eb; color: white !important; text-decoration: none; padding: 12px; border-radius: 6px; font-weight: 700; margin-top: 20px;">Open Task</a>
              </div>
            </div>
          `;

          // Log in store
          WazirStore.addEmailLog({
            to: junior.email,
            subject: `Reminder: Task Due Tomorrow - ${task.name}`,
            body: emailBody,
            taskId: task.id
          });

          // Show Toast notification in web UI
          if (window.WazirApp && typeof window.WazirApp.showToast === 'function') {
            window.WazirApp.showToast(`Email reminder sent to ${junior.name} for task "${task.name}"`, "info");
          }

          // Trigger a silent system notification inside the store too
          WazirStore.addNotification(
            junior.id,
            "Deadline Approaching Reminder",
            `Task "${task.name}" is due tomorrow at ${friendlyDeadline}.`,
            "deadline_approaching"
          );
        }
      }
    });
  };

  return {
    start() {
      // Run immediately
      runSweep();
      // Setup interval
      if (timerId) clearInterval(timerId);
      timerId = setInterval(runSweep, CHECK_INTERVAL);
    },
    stop() {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    },
    triggerManualSweep() {
      runSweep();
    }
  };
})();
