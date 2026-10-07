import db from '../db/index.js';
import { createRequestWithWorkflow } from '../services/workflowService.js';

export async function createRequest(req, res, next) {
  try {
    const { rawText, requesterId } = req.body;
    // Use requesterId from body or current user id
    const finalRequesterId = requesterId || req.user.id;

    const request = await createRequestWithWorkflow({
      rawText,
      requesterId: finalRequesterId
    });

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

export async function getRequests(req, res, next) {
  try {
    const { status, category, priority } = req.query;
    const { role, id: userId, department } = req.user;

    let requests = [...db.store.requests];

    // Data Isolation Rules (Section 11)
    if (role === 'EMPLOYEE') {
      // EMPLOYEE can only see their own requests
      requests = requests.filter(r => r.requester_id === userId);
    } else if (role === 'TECHNICIAN') {
      // TECHNICIANS see requests that have tasks for their department OR their own requests
      const deptTasks = db.store.tasks.filter(
        t => t.assigned_department.toLowerCase() === department.toLowerCase() ||
             t.assigned_role === 'TECHNICIAN'
      );
      const reqIdsWithMyDept = new Set(deptTasks.map(t => t.request_id));
      requests = requests.filter(r => r.requester_id === userId || reqIdsWithMyDept.has(r.id));
    } else if (role === 'MANAGER') {
      // MANAGERS see requests in their department or all requests
      // Filter if needed or show all for oversight
    }
    // ADMIN has full access across all requests

    // Filter by query parameters
    if (status) {
      requests = requests.filter(r => r.status.toUpperCase() === status.toUpperCase());
    }
    if (category) {
      requests = requests.filter(r => r.category.toUpperCase() === category.toUpperCase());
    }
    if (priority) {
      requests = requests.filter(r => r.priority.toUpperCase() === priority.toUpperCase());
    }

    // Attach requester info and task summary
    const enhancedRequests = requests.map(reqItem => {
      const requester = db.store.users.find(u => u.id === reqItem.requester_id);
      const relatedTasks = db.store.tasks.filter(t => t.request_id === reqItem.id);
      const completedTasks = relatedTasks.filter(t => t.status === 'COMPLETED').length;
      return {
        ...reqItem,
        requester: requester ? { full_name: requester.full_name, email: requester.email, department: requester.department } : null,
        taskStats: {
          total: relatedTasks.length,
          completed: completedTasks,
          progressPercentage: relatedTasks.length > 0 ? Math.round((completedTasks / relatedTasks.length) * 100) : 0
        }
      };
    });

    res.json(enhancedRequests);
  } catch (err) {
    next(err);
  }
}

export async function getRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const request = db.store.requests.find(r => r.id === id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Isolation check
    if (role === 'EMPLOYEE' && request.requester_id !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only view your own requests.' });
    }

    const requester = db.store.users.find(u => u.id === request.requester_id);
    const tasks = db.store.tasks
      .filter(t => t.request_id === id)
      .sort((a, b) => a.step_order - b.step_order)
      .map(t => {
        const assignedUser = t.assigned_user_id ? db.store.users.find(u => u.id === t.assigned_user_id) : null;
        return {
          ...t,
          assigned_user: assignedUser ? { full_name: assignedUser.full_name, email: assignedUser.email } : null
        };
      });

    const logs = db.store.workflow_logs
      .filter(l => l.request_id === id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(l => {
        const actor = l.actor_id ? db.store.users.find(u => u.id === l.actor_id) : null;
        return {
          ...l,
          actor: actor ? { full_name: actor.full_name, role: actor.role } : null
        };
      });

    res.json({
      ...request,
      requester: requester ? { full_name: requester.full_name, email: requester.email, department: requester.department } : null,
      tasks,
      workflow_logs: logs
    });
  } catch (err) {
    next(err);
  }
}

export default {
  createRequest,
  getRequests,
  getRequestById
};
