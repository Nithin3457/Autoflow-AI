import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('Testing Supabase and Gemini connections...');
console.log('Supabase URL:', SUPABASE_URL);
console.log('Gemini API Key exists:', !!GEMINI_API_KEY, 'length:', GEMINI_API_KEY ? GEMINI_API_KEY.length : 0);

import ws from 'ws';

// Test Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});
try {
  const { data, error } = await supabase.from('users').select('*').limit(5);
  console.log('Supabase users query result:', { data, error });
} catch (err) {
  console.error('Supabase query error:', err.message);
}

// Test Gemini
try {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  console.log('Attempting Gemini call with gemini-2.5-flash...');
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Say Hello in one word'
  });
  console.log('Gemini response:', res.text);
} catch (err) {
  console.error('Gemini test error:', err.message, err.status, err.errorDetails);
}
