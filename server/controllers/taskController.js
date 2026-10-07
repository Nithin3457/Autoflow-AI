import db from '../db/index.js';
import { updateTaskStatus as updateWorkflowTaskStatus } from '../services/workflowService.js';

export async function getTasks(req, res, next) {
  try {
    const { status, priority, department } = req.query;
    const { role, id: userId, department: userDept } = req.user;

    let tasks = [...db.store.tasks];

    // Data Isolation Rules (Section 11)
    if (role === 'EMPLOYEE') {
      const myRequests = new Set(
        db.store.requests.filter(r => r.requester_id === userId).map(r => r.id)
      );
      tasks = tasks.filter(t => t.assigned_user_id === userId || myRequests.has(t.request_id));
    } else if (role === 'TECHNICIAN' || role === 'MANAGER') {
      tasks = tasks.filter(t => {
        const matchesDept = t.assigned_department.toLowerCase() === userDept.toLowerCase();
        const matchesRole = t.assigned_role.toUpperCase() === role.toUpperCase();
        const matchesUser = t.assigned_user_id === userId;
        return matchesDept || matchesRole || matchesUser;
      });
    }
    // ADMIN sees all tasks

    // Filter by query parameters
    if (status) {
      tasks = tasks.filter(t => t.status.toUpperCase() === status.toUpperCase());
    }
    if (department) {
      tasks = tasks.filter(t => t.assigned_department.toLowerCase() === department.toLowerCase());
    }

    // Attach request metadata and assignees
    const enrichedTasks = tasks.map(task => {
      const parentRequest = db.store.requests.find(r => r.id === task.request_id);
      const requester = parentRequest
        ? db.store.users.find(u => u.id === parentRequest.requester_id)
        : null;
      const assignedUser = task.assigned_user_id
        ? db.store.users.find(u => u.id === task.assigned_user_id)
        : null;

      // Calculate SLA status: 'SAFE' (> 2h), 'WARNING' (0-2h), 'BREACHED' (< 0h)
      const now = new Date().getTime();
      const deadline = new Date(task.sla_deadline).getTime();
      const diffHours = (deadline - now) / 3600000;

      let slaStatus = 'SAFE';
      if (task.status === 'COMPLETED') {
        const completedTime = new Date(task.completed_at || task.created_at).getTime();
        slaStatus = completedTime <= deadline ? 'MET' : 'BREACHED';
      } else {
        if (diffHours < 0) {
          slaStatus = 'BREACHED';
        } else if (diffHours < 2) {
          slaStatus = 'WARNING';
        } else {
          slaStatus = 'SAFE';
        }
      }

      return {
        ...task,
        slaStatus,
        hoursRemaining: Number(diffHours.toFixed(1)),
        request: parentRequest ? {
          id: parentRequest.id,
          raw_text: parentRequest.raw_text,
          category: parentRequest.category,
          priority: parentRequest.priority,
          risk_level: parentRequest.risk_level,
          status: parentRequest.status,
          requester: requester ? { full_name: requester.full_name, email: requester.email } : null
        } : null,
        assigned_user: assignedUser ? { full_name: assignedUser.full_name, email: assignedUser.email } : null
      };
    });

    // Optional priority filter based on parent request priority
    let finalTasks = enrichedTasks;
    if (priority) {
      finalTasks = enrichedTasks.filter(
        t => t.request && t.request.priority.toUpperCase() === priority.toUpperCase()
      );
    }

    // Sort: Breached first, then nearest deadline
    finalTasks.sort((a, b) => new Date(a.sla_deadline) - new Date(b.sla_deadline));

    res.json(finalTasks);
  } catch (err) {
    next(err);
  }
}

export async function updateTaskStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await updateWorkflowTaskStatus(id, status, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export default {
  getTasks,
  updateTaskStatus
};
