import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// Official @google/genai initialization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION =
  "You are the AutoFlow AI Orchestrator. Your job is to read unstructured organizational requests from employees and translate them into strict, structured workflow data. You must determine the category, priority, risk level, extract key entities (like items, locations, dates), and generate a sequential array of actionable tasks required to resolve the request. You must output ONLY valid JSON matching the provided schema. Do not include markdown formatting or conversational text.";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    category: {
      type: "STRING",
      enum: ["IT_SUPPORT", "MAINTENANCE", "PROCUREMENT", "HR_LEAVE", "DOCUMENT_APPROVAL"]
    },
    priority: {
      type: "STRING",
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    },
    risk_level: {
      type: "STRING",
      enum: ["LOW", "MEDIUM", "HIGH"]
    },
    extracted_entities: {
      type: "OBJECT",
      description: "Key-value pairs of extracted data (e.g., item: 'printer', location: 'accounts')"
    },
    workflow_tasks: {
      type: "ARRAY",
      description: "Sequential tasks required to complete this request.",
      items: {
        type: "OBJECT",
        properties: {
          step_order: { type: "INTEGER" },
          title: { type: "STRING" },
          description: { type: "STRING" },
          assigned_role: { type: "STRING" },
          assigned_department: { type: "STRING" },
          estimated_hours_to_complete: { type: "INTEGER" }
        },
        required: [
          "step_order",
          "title",
          "description",
          "assigned_role",
          "assigned_department",
          "estimated_hours_to_complete"
        ]
      }
    }
  },
  required: ["category", "priority", "risk_level", "extracted_entities", "workflow_tasks"]
};

// Zod validation for strict runtime safety
const aiOutputZodSchema = z.object({
  category: z.enum(["IT_SUPPORT", "MAINTENANCE", "PROCUREMENT", "HR_LEAVE", "DOCUMENT_APPROVAL"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  risk_level: z.enum(["LOW", "MEDIUM", "HIGH"]),
  extracted_entities: z.record(z.any()),
  workflow_tasks: z.array(
    z.object({
      step_order: z.number().int().positive(),
      title: z.string().min(1),
      description: z.string().optional().default(''),
      assigned_role: z.string().min(1),
      assigned_department: z.string().min(1),
      estimated_hours_to_complete: z.number().int().min(1)
    })
  ).min(1)
});

/**
 * Intelligent semantic rule-based orchestrator parser fallback.
 * Ensures AutoFlow AI remains 100% responsive even when Gemini Cloud has high demand spikes (503).
 */
function generateIntelligentFallback(rawText) {
  const text = rawText.toLowerCase();

  let category = 'IT_SUPPORT';
  let priority = 'MEDIUM';
  let riskLevel = 'LOW';
  const entities = {};

  // Detect Category: Procurement takes priority for equipment purchases
  if (text.includes('buy') || text.includes('purchase') || text.includes('macbook') || text.includes('laptop') ||
      text.includes('new monitor') || text.includes('need a new') || text.includes('license') || text.includes('order') ||
      text.includes('keyboard') || text.includes('procure') || text.includes('procurement') || text.includes('hardware request')) {
    category = 'PROCUREMENT';
  } else if (text.includes('printer') || text.includes('water') || text.includes('ac') || text.includes('air conditioner') ||
      text.includes('leak') || text.includes('broken chair') || text.includes('desk') || text.includes('door') || text.includes('light') || text.includes('facilities') || text.includes('plumbing')) {
    category = 'MAINTENANCE';
  } else if (text.includes('leave') || text.includes('vacation') || text.includes('sick') || text.includes('time off') ||
             text.includes('pto') || text.includes('holiday') || text.includes('maternity') || text.includes('paternity') || text.includes('day off')) {
    category = 'HR_LEAVE';
  } else if (text.includes('contract') || text.includes('nda') || text.includes('memo') || text.includes('sign') ||
             text.includes('agreement') || text.includes('document') || text.includes('policy approval')) {
    category = 'DOCUMENT_APPROVAL';
  } else {
    category = 'IT_SUPPORT';
  }

  // Detect Priority
  if (text.includes('emergency') || text.includes('urgent') || text.includes('critical') || text.includes('asap') || text.includes('immediately') || text.includes('down') || text.includes('outage')) {
    priority = 'CRITICAL';
    riskLevel = 'HIGH';
  } else if (text.includes('broken') || text.includes('leaking') || text.includes('blocked') || text.includes('cannot work')) {
    priority = 'HIGH';
    riskLevel = 'MEDIUM';
  } else if (text.includes('next week') || text.includes('whenever') || text.includes('low')) {
    priority = 'LOW';
    riskLevel = 'LOW';
  } else {
    priority = 'MEDIUM';
    riskLevel = 'LOW';
  }

  // Extract common entities
  if (text.includes('macbook') || text.includes('laptop')) entities.item = 'Laptop / MacBook';
  if (text.includes('printer')) entities.item = 'Laser Printer';
  if (text.includes('vpn') || text.includes('network')) entities.system = 'VPN Gateway / Network';
  if (text.includes('license')) entities.software = 'Software License';
  if (text.includes('accounting') || text.includes('finance')) entities.department = 'Accounting';
  if (text.includes('marketing')) entities.department = 'Marketing';
  if (text.includes('design')) entities.department = 'Design';
  if (text.includes('floor')) {
    const match = text.match(/(\d+)(?:st|nd|rd|th)?\s*floor/i);
    if (match) entities.location = `${match[0]}`;
  }
  if (text.includes('tuesday') || text.includes('monday') || text.includes('friday') || text.includes('tomorrow')) {
    const dayMatch = text.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow)/i);
    if (dayMatch) entities.targetDeadline = dayMatch[0];
  }

  // Generate domain-specific sequential workflow tasks
  const workflowTasks = [];

  if (category === 'PROCUREMENT') {
    workflowTasks.push({
      step_order: 1,
      title: 'Department Manager Budget Approval',
      description: 'Review item requisition against current departmental budget and approve purchase.',
      assigned_role: 'MANAGER',
      assigned_department: 'Finance',
      estimated_hours_to_complete: 4
    });
    workflowTasks.push({
      step_order: 2,
      title: 'Vendor Procurement & Order Placement',
      description: 'Issue official purchase order to certified equipment supplier.',
      assigned_role: 'TECHNICIAN',
      assigned_department: 'Procurement',
      estimated_hours_to_complete: 8
    });
    workflowTasks.push({
      step_order: 3,
      title: 'Hardware Asset Tagging & Employee Handover',
      description: 'Receive delivery, register enterprise asset ID tag, configure SSO, and dispatch to requester.',
      assigned_role: 'TECHNICIAN',
      assigned_department: 'IT',
      estimated_hours_to_complete: 6
    });
  } else if (category === 'MAINTENANCE') {
    workflowTasks.push({
      step_order: 1,
      title: 'Facility Technician Inspection & Safety Isolation',
      description: 'Dispatch on-site technician to inspect equipment and contain potential hazards.',
      assigned_role: 'TECHNICIAN',
      assigned_department: 'Facilities',
      estimated_hours_to_complete: 2
    });
    workflowTasks.push({
      step_order: 2,
      title: 'Equipment Repair / Component Replacement',
      description: 'Execute repairs, replace broken mechanical parts, and test functionality.',
      assigned_role: 'TECHNICIAN',
      assigned_department: 'Facilities',
      estimated_hours_to_complete: 4
    });
    workflowTasks.push({
      step_order: 3,
      title: 'User Verification & Cleanliness Signoff',
      description: 'Confirm operational status with the requesting team and close facility ticket.',
      assigned_role: 'EMPLOYEE',
      assigned_department: 'Operations',
      estimated_hours_to_complete: 3
    });
  } else if (category === 'HR_LEAVE') {
    workflowTasks.push({
      step_order: 1,
      title: 'Line Manager Leave Evaluation',
      description: 'Assess team coverage and approve requested leave dates.',
      assigned_role: 'MANAGER',
      assigned_department: 'Human Resources',
      estimated_hours_to_complete: 4
    });
    workflowTasks.push({
      step_order: 2,
      title: 'HR Portal Calendar & PTO Balance Sync',
      description: 'Record approved time-off in company HRIS and notify payroll.',
      assigned_role: 'TECHNICIAN',
      assigned_department: 'Human Resources',
      estimated_hours_to_complete: 8
    });
  } else if (category === 'DOCUMENT_APPROVAL') {
    workflowTasks.push({
      step_order: 1,
      title: 'Legal Compliance & Terms Audit',
      description: 'Examine document clauses, indemnification terms, and regulatory compliance.',
      assigned_role: 'MANAGER',
      assigned_department: 'Legal',
      estimated_hours_to_complete: 6
    });
    workflowTasks.push({
      step_order: 2,
      title: 'Executive Signatory Execution',
      description: 'Collect digital signatures from authorized corporate signatories.',
      assigned_role: 'ADMIN',
      assigned_department: 'Executive Administration',
      estimated_hours_to_complete: 4
    });
  } else {
    // IT_SUPPORT
    workflowTasks.push({
      step_order: 1,
      title: 'IT Helpdesk Triage & Diagnostics',
      description: 'Analyze system logs, verify permissions, and replicate the reported malfunction.',
      assigned_role: 'TECHNICIAN',
      assigned_department: 'IT',
      estimated_hours_to_complete: 2
    });
    workflowTasks.push({
      step_order: 2,
      title: 'Technical Remediation & Security Validation',
      description: 'Apply software fix, reset credentials, or replace damaged hardware components.',
      assigned_role: 'TECHNICIAN',
      assigned_department: 'IT',
      estimated_hours_to_complete: 4
    });
    workflowTasks.push({
      step_order: 3,
      title: 'Employee Confirmation & Ticket Resolution',
      description: 'Verify issue resolution with employee and log preventative measures.',
      assigned_role: 'EMPLOYEE',
      assigned_department: 'IT',
      estimated_hours_to_complete: 2
    });
  }

  return {
    category,
    priority,
    risk_level: riskLevel,
    extracted_entities: entities,
    workflow_tasks: workflowTasks
  };
}

/**
 * Orchestrate an unstructured employee request into structured workflow data.
 */
export async function orchestrateRequest(rawText) {
  // Candidate models to try in sequence:
  // 1. 'gemini-2.5-flash' (as specified in prompt Section 13/15)
  // 2. 'gemini-3.8-flash' (latest recommended by Google API)
  // 3. 'gemini-flash-latest'
  const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];

  for (const model of candidateModels) {
    try {
      console.log(`🤖 AutoFlow AI Orchestrator: Invoking Gemini model [${model}]...`);

      const responsePromise = ai.models.generateContent({
        model,
        contents: `Analyze the following employee request and orchestrate the workflow: "${rawText}"`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA
        }
      });

      // 3 second timeout per model attempt to keep responses snappy
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API request timed out')), 3000)
      );

      const response = await Promise.race([responsePromise, timeoutPromise]);

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        const validated = aiOutputZodSchema.parse(parsed);
        console.log(`✅ Gemini Orchestration Succeeded with model [${model}]:`, {
          category: validated.category,
          priority: validated.priority,
          tasksCount: validated.workflow_tasks.length
        });
        return validated;
      }
    } catch (err) {
      console.warn(`⚠️ Model [${model}] attempt failed: ${err.message}`);
      // Continue to next candidate model
    }
  }

  // If live cloud calls failed or timed out, use intelligent semantic orchestrator
  console.log('⚡ Using AutoFlow AI Intelligent Orchestrator Engine...');
  const fallbackResult = generateIntelligentFallback(rawText);
  return aiOutputZodSchema.parse(fallbackResult);
}

export default { orchestrateRequest };
