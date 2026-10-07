import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const systemInstruction = "You are the AutoFlow AI Orchestrator. Your job is to read unstructured organizational requests from employees and translate them into strict, structured workflow data. You must determine the category, priority, risk level, extract key entities (like items, locations, dates), and generate a sequential array of actionable tasks required to resolve the request. You must output ONLY valid JSON matching the provided schema. Do not include markdown formatting or conversational text.";

const rawText = "I need a new Macbook Pro M3 for my design work because my old one is broken, I need it by next Tuesday";

// Test schema definition
const responseSchema = {
  type: "OBJECT",
  properties: {
    category: { type: "STRING", enum: ["IT_SUPPORT", "MAINTENANCE", "PROCUREMENT", "HR_LEAVE", "DOCUMENT_APPROVAL"] },
    priority: { type: "STRING", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
    risk_level: { type: "STRING", enum: ["LOW", "MEDIUM", "HIGH"] },
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
        required: ["step_order", "title", "description", "assigned_role", "assigned_department", "estimated_hours_to_complete"]
      }
    }
  },
  required: ["category", "priority", "risk_level", "extracted_entities", "workflow_tasks"]
};

console.log('Sending test request to Gemini...');
try {
  // Try gemini-2.5-flash as specified in section 15
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Analyze the following employee request and orchestrate the workflow: "${rawText}"`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema
    }
  });
  console.log('Gemini Response Text:', response.text);
} catch (err) {
  console.log('Error with gemini-2.5-flash:', err.message);
  console.log('Testing fallback to gemini-3.8-flash...');
  try {
    const fallbackResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analyze the following employee request and orchestrate the workflow: "${rawText}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });
    console.log('Fallback response:', fallbackResponse.text);
  } catch (fallbackErr) {
    console.log('Fallback Error:', fallbackErr.message);
  }
}
