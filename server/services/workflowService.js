import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { orchestrateRequest } from './geminiService.js';

export async function createRequestWithWorkflow({ rawText, requesterId }) {
  // 1. Call Gemini Orchestrator to parse natural language request
  const aiWorkflow = await orchestrateRequest(rawText);

  const requestId = uuidv4();
  const now = new Date().toISOString();

  // Low-risk items can have auto-accelerated paths; high-risk items get management visibility
  const status = 'IN_PROGRESS';

  const newRequest = {
    id: requestId,
    requester_id: requesterId,
    raw_text: rawText,
    category: aiWorkflow.category,
    priority: aiWorkflow.priority,
    risk_level: aiWorkflow.risk_level,
    extracted_entities: aiWorkflow.extracted_entities,
    status,
    created_at: now,
    resolved_at: null
  };

  // Add to in-memory store
  db.store.requests.unshift(newRequest);

  // 2. Generate and store sequential tasks
  const createdTasks = [];
  for (const t of aiWorkflow.workflow_tasks) {
    const taskId = uuidv4();
    // SLA Deadline calculation: now + estimated_hours_to_complete
    const hours = t.estimated_hours_to_complete || 4;
    const slaDeadline = new Date(Date.now() + hours * 3600000).toISOString();

    // Match a suitable user by role and department if available
    const assignedUser = db.store.users.find(
      u => u.role === t.assigned_role && u.department.toLowerCase().includes(t.assigned_department.toLowerCase())
    ) || db.store.users.find(u => u.role === t.assigned_role) || null;

    // First step is IN_PROGRESS; subsequent steps wait as PENDING
    const taskStatus = t.step_order === 1 ? 'IN_PROGRESS' : 'PENDING';

    const newTask = {
      id: taskId,
      request_id: requestId,
      assigned_role: t.assigned_role,
      assigned_department: t.assigned_department,
      assigned_user_id: assignedUser ? assignedUser.id : null,
      step_order: t.step_order,
      title: t.title,
      description: t.description || '',
      status: taskStatus,
      sla_deadline: slaDeadline,
      completed_at: null,
      created_at: now
    };

    db.store.tasks.push(newTask);
    createdTasks.push(newTask);
  }

  // 3. Insert Initial Workflow Audit Log
  const logId = uuidv4();
  const initialLog = {
    id: logId,
    request_id: requestId,
    action: `AI Orchestrator classified request as ${aiWorkflow.category} with ${aiWorkflow.priority} priority (${aiWorkflow.risk_level} risk) and generated ${createdTasks.length} sequential workflow tasks.`,
    actor_id: null, // System action
    created_at: now
  };
  db.store.workflow_logs.push(initialLog);

  return {
    ...newRequest,
    tasks: createdTasks,
    workflow_logs: [initialLog]
  };
}

export async function updateTaskStatus(taskId, newStatus, actorUser) {
  const taskIndex = db.store.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  const task = db.store.tasks[taskIndex];
  const oldStatus = task.status;
  const now = new Date().toISOString();

  // Update task
  task.status = newStatus;
  if (newStatus === 'COMPLETED') {
    task.completed_at = now;
  } else if (oldStatus === 'COMPLETED' && newStatus !== 'COMPLETED') {
    task.completed_at = null;
  }

  // Find parent request
  const request = db.store.requests.find(r => r.id === task.request_id);

  // Workflow progression logic
  if (newStatus === 'COMPLETED') {
    // 1. Activate next pending step
    const allRequestTasks = db.store.tasks
      .filter(t => t.request_id === task.request_id)
      .sort((a, b) => a.step_order - b.step_order);

    const nextPendingTask = allRequestTasks.find(
      t => t.step_order > task.step_order && t.status === 'PENDING'
    );

    if (nextPendingTask) {
      nextPendingTask.status = 'IN_PROGRESS';
      db.store.workflow_logs.push({
        id: uuidv4(),
        request_id: task.request_id,
        action: `Step #${task.step_order} completed. Next step #${nextPendingTask.step_order} ("${nextPendingTask.title}") automatically activated.`,
        actor_id: actorUser?.id || null,
        created_at: now
      });
    }

    // 2. If all tasks are completed, resolve parent request
    const allCompleted = allRequestTasks.every(t => t.status === 'COMPLETED');
    if (allCompleted && request) {
      request.status = 'RESOLVED';
      request.resolved_at = now;

      db.store.workflow_logs.push({
        id: uuidv4(),
        request_id: task.request_id,
        action: `All workflow tasks successfully completed. Request marked as RESOLVED.`,
        actor_id: actorUser?.id || null,
        created_at: now
      });
    }
  }

  // Log the direct status transition
  db.store.workflow_logs.push({
    id: uuidv4(),
    request_id: task.request_id,
    action: `Task "${task.title}" updated from ${oldStatus} to ${newStatus} by ${actorUser?.full_name || 'System'}.`,
    actor_id: actorUser?.id || null,
    created_at: now
  });

  return {
    task,
    request
  };
}

export default {
  createRequestWithWorkflow,
  updateTaskStatus
};
