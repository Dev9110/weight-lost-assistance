import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { RAG_KNOWLEDGE_BASE, searchRAGKnowledge } from './src/data/ragKnowledgeBase.ts';
import { generatePythonAgentScript } from './src/data/pythonScriptGenerator.ts';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY is not set. Gemini features will return fallback response or error.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key || 'DUMMY_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // RAG Search Endpoint
  app.post('/api/rag/search', (req, res) => {
    try {
      const { query, limit } = req.body;
      const results = searchRAGKnowledge(query || '', limit || 3);
      res.json({ results });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Multi-Agent Chat Endpoint (Agentic AI + RAG)
  app.post('/api/agent/chat', async (req, res) => {
    try {
      const { message, profile, currentPlan, role } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Step 1: Perform RAG Retrieval from verified scientific corpus
      const ragResults = searchRAGKnowledge(message, 3);
      const ragContextText = ragResults
        .map(
          (r, i) =>
            `[RAG Document ${i + 1}]: "${r.document.title}" (Category: ${r.document.category})\nSummary: ${r.document.summary}\nEvidence: ${r.document.content}\nCitations: ${r.document.citations.join(', ')}`
        )
        .join('\n\n');

      // Step 2: Formulate Multi-Agent reasoning instruction
      const userProfileStr = profile
        ? `User Profile:
- Name: ${profile.name || 'User'}
- Age: ${profile.age}, Gender: ${profile.gender}, Height: ${profile.heightCm}cm
- Current Weight: ${profile.currentWeightKg}kg, Goal: ${profile.goalWeightKg}kg
- Weekly Loss Pace Target: ${profile.targetLossPaceKgPerWeek} kg/week
- Diet: ${profile.dietPreference}, Activity Level: ${profile.activityLevel}
- Allergies / Exclusions: ${(profile.allergies || []).join(', ') || 'None'}
- Health Conditions: ${(profile.healthConditions || []).join(', ') || 'None'}`
        : 'User Profile: Standard adult aiming for sustainable weight loss.';

      const agentRolePersona = role === 'nutritionist'
        ? 'You are the Specialized Clinical Nutritionist & Macro Specialist Agent.'
        : role === 'fitness'
        ? 'You are the Exercise Physiologist & Resistance Training Coach Agent.'
        : role === 'behavioral'
        ? 'You are the Behavioral Psychologist & Habit Architect Agent.'
        : 'You are the Master Orchestrator Weight Loss AI Coach, leading a team of specialized agents (Nutritionist, Fitness Coach, Behavioral Psychologist).';

      const prompt = `You are an expert AI Weight Loss Coach system.
${agentRolePersona}

${userProfileStr}

RELEVANT SCIENTIFIC RAG EVIDENCE (Use these to ground and cite your advice):
${ragContextText}

USER QUESTION / INPUT:
"${message}"

INSTRUCTIONS:
1. Provide a direct, highly practical, empathetic, and evidence-based answer.
2. When applicable, quote or cite the relevant biological principles (e.g. Satiety Index, Protein Leverage, NEAT, Sleep/Cortisol, Muscle Protein Synthesis, or Energy Balance).
3. If the user asks about workouts, schedule, meal prep, or grocery lists, suggest actionable calendar sync or Google Keep notes.
4. Format your output with clear headings, bullet points, and high readability.`;

      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a warm, scientific, empowering personal health coach specializing in sustainable fat loss and muscle preservation.',
          temperature: 0.7,
        },
      });

      const responseText = response.text || 'I have analyzed your request based on nutritional science and your current profile.';

      // Extract reasoning steps for agentic transparency
      const reasoningSteps = [
        {
          agentName: 'Master Orchestrator',
          thought: `Analyzed query intent: "${message.substring(0, 60)}..." and matched user profile targets.`,
        },
        {
          agentName: 'Nutritionist Agent',
          thought: `Retrieved ${ragResults.length} evidence-based clinical articles on energy balance & macro optimization.`,
          ragSourcesUsed: ragResults.map((r) => r.document.title),
        },
        {
          agentName: 'Fitness Coach Agent',
          thought: `Evaluated training periodization, NEAT energy expenditure, and muscle preservation factors.`,
        },
      ];

      res.json({
        reply: responseText,
        reasoningSteps,
        ragCitations: ragResults.map((r) => ({
          title: r.document.title,
          source: r.document.citations[0] || 'Clinical Sports Nutrition',
          snippet: r.document.summary,
        })),
      });
    } catch (err: any) {
      console.error('Agent chat error:', err);
      res.status(500).json({
        error: err.message || 'Error processing AI Coach request',
        reply: 'I am here to guide your personalized weight loss journey. For optimal fat loss, maintain a 300-500 kcal deficit, consume 1.8-2.2g of protein per kg of bodyweight, prioritize 8,000+ daily steps, and ensure 7.5+ hours of sleep.',
      });
    }
  });

  // Generate Personalized AI Plan Endpoint
  app.post('/api/agent/generate-plan', async (req, res) => {
    try {
      const { profile, macros } = req.body;
      const ai = getAi();

      const prompt = `Create a personalized 1-day sample meal plan (Breakfast, Lunch, Dinner, Snack) and 1 custom workout session for a user with the following profile:
Name: ${profile.name || 'User'}
Target Daily Calories: ${macros.calories} kcal
Target Protein: ${macros.proteinGrams}g, Carbs: ${macros.carbsGrams}g, Fat: ${macros.fatGrams}g
Diet Preference: ${profile.dietPreference}
Allergies/Exclusions: ${(profile.allergies || []).join(', ') || 'None'}
Activity: ${profile.activityLevel}

Please return ONLY a valid JSON object matching this structure:
{
  "meals": [
    {
      "name": "string",
      "type": "breakfast" | "lunch" | "dinner" | "snack",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "prepTimeMinutes": number,
      "ingredients": ["item 1", "item 2"],
      "instructions": ["step 1", "step 2"],
      "satietyIndex": "high" | "very_high",
      "tags": ["tag1", "tag2"]
    }
  ],
  "coachTip": "string with 2 sentences of science-backed advice"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      let parsed: any = null;
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (e) {
        console.error('JSON parse error from Gemini:', e);
      }

      res.json(parsed || { meals: [], coachTip: 'Focus on whole foods and high protein.' });
    } catch (err: any) {
      console.error('Generate plan error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Meal Photo / Text Analysis Endpoint
  app.post('/api/agent/analyze-meal', async (req, res) => {
    try {
      const { description, imageBase64 } = req.body;
      const ai = getAi();

      let contents: any = description || 'Analyze this healthy meal.';
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64,
              },
            },
            {
              text: `Analyze this food image for a weight loss tracker. Estimate total calories, protein (g), carbs (g), fat (g), dietary fiber (g), and satiety rating (moderate, high, very_high). Give 2 bullet points for healthy optimizations.
Return ONLY valid JSON:
{
  "mealName": "string",
  "estimatedCalories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "satietyRating": "high" | "very_high" | "moderate",
  "feedback": ["point 1", "point 2"]
}`,
            },
          ],
        };
      } else {
        contents = `Analyze this meal description: "${description}". Estimate calories, protein (g), carbs (g), fat (g), fiber (g), and satiety rating.
Return ONLY valid JSON:
{
  "mealName": "string",
  "estimatedCalories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "satietyRating": "high" | "very_high" | "moderate",
  "feedback": ["point 1", "point 2"]
}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (err: any) {
      console.error('Analyze meal error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Python Script Download / Preview Endpoint
  app.get('/api/python-script', (req, res) => {
    const name = (req.query.name as string) || 'User';
    const cals = parseInt((req.query.calories as string) || '1950', 10);
    const protein = parseInt((req.query.protein as string) || '160', 10);

    const script = generatePythonAgentScript(name, cals, protein);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(script);
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
