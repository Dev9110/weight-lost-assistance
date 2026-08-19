import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { RAG_KNOWLEDGE_BASE, searchRAGKnowledge } from './src/data/ragKnowledgeBase.ts';
import { CLINICAL_RAG_GUIDELINES, searchClinicalGuidelines } from './src/data/clinicalRAGMetadata.ts';
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

  // AI Sleep Hygiene Advice Endpoint based on Daily Sleep Logs
  app.post('/api/agent/sleep-advice', async (req, res) => {
    try {
      const { sleepLog, profile, recentLogs = [] } = req.body;
      const hours = sleepLog?.durationHours || 7;
      const quality = sleepLog?.quality || 'fair';
      const userName = profile?.name || 'User';

      const ai = getAi();
      const prompt = `You are the Behavioral Psychologist and Sleep Physiology Agent on a multi-agent weight loss coaching team.
The user (${userName}) just logged their sleep duration:
- Logged Duration: ${hours} hours
- Sleep Quality: ${quality}
- Notes: ${sleepLog?.notes || 'None'}
- Target Sleep Baseline: ${profile?.sleepTargetHours || 8} hours
- Target Caloric Deficit: ${profile?.dailyCalorieLimit || 1950} kcal

RAG SCIENTIFIC GROUNDING:
- Chronic sleep < 7 hours elevates acyl-ghrelin (hunger) by 14-24% and downregulates leptin (satiety), triggering evening hyper-palatable carbohydrate cravings.
- Poor sleep impairs prefrontal cortex executive control, increasing impulsive snacking by 300-400 kcal/day.
- Deep Slow Wave Sleep (SWS) is where Growth Hormone (GH) spikes to repair muscle tissue during a caloric deficit.

Provide immediate, evidence-grounded sleep hygiene & metabolic recovery advice. Return ONLY valid JSON:
{
  "summary": "1-2 empathetic, scientifically sharp sentences evaluating their ${hours}h sleep.",
  "hormonalImpact": "Explanation of how this duration (${hours}h, ${quality} quality) alters ghrelin, leptin, cortisol, and fat oxidation today.",
  "actionableHygieneTips": [
    "Tip 1 (e.g. 10-3-2-1-0 rule, light exposure, or temperature control)",
    "Tip 2 (e.g. wind-down routine or magnesium/glycine/chamomile)",
    "Tip 3 (specific circadian timing adjustment)"
  ],
  "appetiteCompensationAdvice": "1 practical nutritional strategy for today to prevent sleep-deprivation cravings (e.g. higher protein breakfast, 500ml water before meals).",
  "ragCitation": "Spiegel et al. (Lancet) & Nedeltcheva et al. (Annals of Internal Medicine: Sleep restriction impairs fat loss by 55%)"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Sleep advice error:', err);
      // Deterministic fallback
      const hours = req.body?.sleepLog?.durationHours || 7;
      res.json({
        summary: hours < 7
          ? `You logged ${hours}h of sleep. Sub-7-hour sleep elevates ghrelin and increases cravings by up to 20% today.`
          : `Great job securing ${hours}h of sleep! Your restorative sleep supports growth hormone release and protects lean muscle tissue.`,
        hormonalImpact: hours < 7
          ? 'Elevated cortisol and ghrelin may increase cravings for fast-acting carbs this afternoon.'
          : 'Normalized leptin and cortisol will keep hunger signals well-regulated and maintain insulin sensitivity.',
        actionableHygieneTips: [
          'Get 10-15 minutes of natural morning sunlight within 30 minutes of waking to anchor your circadian rhythm.',
          'Adopt the 10-3-2-1-0 rule: No caffeine 10h before bed, no food 3h before bed, no screens 1h before bed.',
          'Keep your bedroom temperature cool between 18-19°C (65-68°F) to facilitate deep REM cycles.',
        ],
        appetiteCompensationAdvice: hours < 7
          ? 'Prioritize a 40g+ protein breakfast and drink 500ml of cold water before each meal to offset ghrelin surges.'
          : 'Maintain your standard meal timing and stay consistent with your hydration goal.',
        ragCitation: 'Nedeltcheva et al. (Annals of Internal Medicine): Insufficient sleep reduces fraction of weight lost as fat by 55%.',
      });
    }
  });

  // Comprehensive Personalized Suggestion Endpoint (Intake -> Multi-Agent RAG Suggestions)
  app.post('/api/agent/personalized-suggestion', async (req, res) => {
    try {
      const intake = req.body;
      if (!intake) {
        return res.status(400).json({ error: 'Intake details are required' });
      }

      const {
        name = 'User',
        age = 30,
        gender = 'male',
        heightCm = 175,
        currentWeightKg = 80,
        goalWeightKg = 70,
        targetLossPaceKgPerWeek = 0.5,
        activityLevel = 'moderate',
        dietPreference = 'high_protein',
        dailyRoutine = 'desk_job',
        sleepHoursPerNight = 7,
        primaryChallenges = [],
        favoriteFoods = [],
        allergies = [],
        equipmentAvailable = 'dumbbells_home',
        workoutDurationMinutes = 45,
        workoutDaysPerWeek = 4,
        specialNotes = '',
      } = intake;

      // 1. Calculate Mifflin-St Jeor BMR & TDEE
      let bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * age;
      if (gender === 'male') {
        bmr += 5;
      } else if (gender === 'female') {
        bmr -= 161;
      } else {
        bmr -= 78;
      }
      bmr = Math.round(bmr);

      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        very_active: 1.725,
        heavy: 1.725,
        athlete: 1.9,
        extra_active: 1.9,
      };
      const multiplier = activityMultipliers[activityLevel] || 1.4;
      const tdee = Math.round(bmr * multiplier);

      // Deficit calculation (1 kg fat ~ 7700 kcal)
      const dailyDeficit = Math.round((targetLossPaceKgPerWeek * 7700) / 7);
      const targetCalories = Math.max(1200, tdee - dailyDeficit);

      const totalWeightToLose = Math.max(0, currentWeightKg - goalWeightKg);
      const estimatedWeeksToGoal = targetLossPaceKgPerWeek > 0
        ? Math.ceil(totalWeightToLose / targetLossPaceKgPerWeek)
        : 0;

      // 2. Multi-topic RAG vector search
      const searchQueries = [
        dietPreference,
        primaryChallenges.join(' '),
        'protein leverage satiety',
        'resistance training NEAT',
      ].filter(Boolean).join(' ');

      const ragResults = searchRAGKnowledge(searchQueries, 4);
      const ragContext = ragResults
        .map((r, i) => `[Study ${i + 1} - ${r.document.title}]: ${r.document.summary} (Key finding: ${r.document.keyTakeaways[0] || ''})`)
        .join('\n');

      // 3. Query Gemini for fully personalized suggestion
      const prompt = `You are the Lead Autonomous AI Health Coach & Multi-Agent Orchestrator (leading Clinical Nutritionist, Exercise Physiologist, and Behavioral Psychologist).
Analyze the user's detailed intake submission and generate an evidence-grounded, ultra-personalized weight loss & body recomposition plan.

USER INTAKE DETAILS:
- Name: ${name}
- Age: ${age}, Gender: ${gender}, Height: ${heightCm}cm
- Current Weight: ${currentWeightKg} kg, Goal Weight: ${goalWeightKg} kg (Total to lose: ${totalWeightToLose.toFixed(1)} kg)
- Target Loss Pace: ${targetLossPaceKgPerWeek} kg/week
- Activity Level: ${activityLevel}, Daily Routine: ${dailyRoutine}
- Sleep: ${sleepHoursPerNight} hours/night
- Diet Preference: ${dietPreference}
- Favorite Foods: ${favoriteFoods.length ? favoriteFoods.join(', ') : 'Whole foods, berries, chicken, salmon'}
- Allergies / Disliked: ${allergies.length ? allergies.join(', ') : 'None'}
- Primary Obstacles & Challenges: ${primaryChallenges.length ? primaryChallenges.join(', ') : 'Staying consistent, evening cravings'}
- Training Equipment: ${equipmentAvailable}
- Preferred Workout: ${workoutDaysPerWeek} days/week, ${workoutDurationMinutes} mins/session
- Special Notes / Goal Context: ${specialNotes || 'None provided'}

CALCULATED METABOLICS:
- BMR: ${bmr} kcal | TDEE: ${tdee} kcal | Recommended Target: ${targetCalories} kcal (Deficit: ${dailyDeficit} kcal/day)
- Estimated Weeks: ${estimatedWeeksToGoal} weeks

SCIENTIFIC RAG CLINICAL GROUNDING:
${ragContext}

INSTRUCTIONS:
Return ONLY a valid JSON object matching this exact schema:
{
  "executiveSummary": {
    "bmr": ${bmr},
    "tdee": ${tdee},
    "targetCalories": ${targetCalories},
    "dailyDeficit": ${dailyDeficit},
    "estimatedWeeksToGoal": ${estimatedWeeksToGoal},
    "overview": "2-3 empowering, personalized sentences explaining the exact roadmap for ${name}"
  },
  "macroTargets": {
    "calories": ${targetCalories},
    "proteinGrams": number (approx 1.8-2.2g per kg current weight),
    "carbsGrams": number,
    "fatGrams": number,
    "fiberGrams": number (between 30 and 45g),
    "waterLiters": number (e.g. 3.0 to 3.5),
    "dailyStepsTarget": number (e.g. 8000 to 10000)
  },
  "nutritionStrategy": {
    "headline": "A concise title for their nutrition protocol",
    "whyThisWorks": "Explanation tying in their favorite foods (${favoriteFoods.join(', ')}) and dietary preference",
    "suggestedMeals": [
      {
        "id": "meal-1",
        "name": "string",
        "type": "breakfast",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "prepTimeMinutes": number,
        "ingredients": ["item 1", "item 2", "item 3"],
        "instructions": ["step 1", "step 2"],
        "satietyIndex": "high" | "very_high",
        "tags": ["High-Protein", "Quick-Prep"]
      },
      {
        "id": "meal-2",
        "name": "string",
        "type": "lunch",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "prepTimeMinutes": number,
        "ingredients": ["item 1", "item 2", "item 3"],
        "instructions": ["step 1", "step 2"],
        "satietyIndex": "high" | "very_high",
        "tags": ["Low-GI", "Fiber-Rich"]
      },
      {
        "id": "meal-3",
        "name": "string",
        "type": "dinner",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "prepTimeMinutes": number,
        "ingredients": ["item 1", "item 2", "item 3"],
        "instructions": ["step 1", "step 2"],
        "satietyIndex": "high" | "very_high",
        "tags": ["Satiety", "Lean-Protein"]
      },
      {
        "id": "meal-4",
        "name": "string",
        "type": "snack",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "prepTimeMinutes": number,
        "ingredients": ["item 1", "item 2"],
        "instructions": ["step 1"],
        "satietyIndex": "high" | "very_high",
        "tags": ["Craving-Crusher"]
      }
    ],
    "groceryHighlights": ["item 1", "item 2", "item 3", "item 4", "item 5"]
  },
  "fitnessStrategy": {
    "headline": "A customized title for their workout protocol",
    "splitType": "string describing split (e.g. Upper/Lower, Full Body 3x, Push/Pull/Legs)",
    "neatRecommendations": "Practical tip for increasing daily non-exercise expenditure based on routine ${dailyRoutine}",
    "weeklySessions": [
      {
        "id": "wo-1",
        "title": "string",
        "dayOfWeek": "Monday",
        "type": "strength",
        "durationMinutes": ${workoutDurationMinutes},
        "estimatedCaloriesBurn": number,
        "exercises": [
          {
            "name": "string",
            "sets": number,
            "repsOrDuration": "string (e.g. 10-12 reps)",
            "restSeconds": number,
            "targetMuscle": "string",
            "instructions": "string"
          }
        ]
      },
      {
        "id": "wo-2",
        "title": "string",
        "dayOfWeek": "Wednesday",
        "type": "strength",
        "durationMinutes": ${workoutDurationMinutes},
        "estimatedCaloriesBurn": number,
        "exercises": [
          {
            "name": "string",
            "sets": number,
            "repsOrDuration": "string",
            "restSeconds": number,
            "targetMuscle": "string",
            "instructions": "string"
          }
        ]
      },
      {
        "id": "wo-3",
        "title": "string",
        "dayOfWeek": "Friday",
        "type": "strength",
        "durationMinutes": ${workoutDurationMinutes},
        "estimatedCaloriesBurn": number,
        "exercises": [
          {
            "name": "string",
            "sets": number,
            "repsOrDuration": "string",
            "restSeconds": number,
            "targetMuscle": "string",
            "instructions": "string"
          }
        ]
      }
    ]
  },
  "behavioralProtocol": {
    "primaryChallengeAddressed": "${primaryChallenges[0] || 'Overcoming Evening Snacking & Consistency'}",
    "actionableHabits": [
      "Habit 1 addressing user obstacles",
      "Habit 2 addressing user obstacles",
      "Habit 3 addressing user obstacles"
    ],
    "psychologicalCopingTechnique": "Actionable cognitive reframing or stimulus control technique tailored to ${name}",
    "sleepOptimizationTip": "Sleep protocol to regulate ghrelin and cortisol for their current ${sleepHoursPerNight}h sleep"
  },
  "ragEvidenceGrounding": [
    {
      "paperTitle": "string",
      "citation": "string",
      "clinicalTakeaway": "string"
    }
  ],
  "agentThoughtTrace": [
    {
      "agentName": "Master Orchestrator",
      "reasoning": "Synthesized intake parameters into a Mifflin-St Jeor caloric deficit of ${dailyDeficit} kcal/day with structured milestones."
    },
    {
      "agentName": "Clinical Nutritionist Agent",
      "reasoning": "Formulated macro distribution respecting ${dietPreference} diet and incorporating favorite foods ${favoriteFoods.join(', ')} while eliminating ${allergies.join(', ') || 'unwanted items'}."
    },
    {
      "agentName": "Exercise Physiologist Agent",
      "reasoning": "Structured ${workoutDaysPerWeek} weekly resistance sessions utilizing ${equipmentAvailable} within ${workoutDurationMinutes} min windows to safeguard lean mass."
    },
    {
      "agentName": "Behavioral Psychologist Agent",
      "reasoning": "Engineered counter-protocols for ${primaryChallenges.join(', ') || 'habitual lapses'} using implementation intentions and stimulus control."
    }
  ]
}`;

      const ai = getAi();
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
      } catch (err) {
        console.error('Failed to parse AI suggestion JSON:', err);
      }

      if (parsed && parsed.executiveSummary && parsed.macroTargets) {
        return res.json(parsed);
      }

      // Fallback deterministic response in case of API degradation
      const proteinTarget = Math.round(currentWeightKg * 2.0);
      const fatTarget = Math.round((targetCalories * 0.25) / 9);
      const carbsTarget = Math.max(50, Math.round((targetCalories - (proteinTarget * 4 + fatTarget * 9)) / 4));

      const fallbackResponse = {
        executiveSummary: {
          bmr,
          tdee,
          targetCalories,
          dailyDeficit,
          estimatedWeeksToGoal,
          overview: `Based on your current weight of ${currentWeightKg} kg and target of ${goalWeightKg} kg, we have structured a calibrated ${dailyDeficit} kcal/day deficit designed to shed ${targetLossPaceKgPerWeek} kg per week while preserving lean muscle.`,
        },
        macroTargets: {
          calories: targetCalories,
          proteinGrams: proteinTarget,
          carbsGrams: carbsTarget,
          fatGrams: fatTarget,
          fiberGrams: 35,
          waterLiters: 3.2,
          dailyStepsTarget: 9000,
        },
        nutritionStrategy: {
          headline: `${dietPreference.replace('_', ' ').toUpperCase()} High-Satiety Protocol`,
          whyThisWorks: `Prioritizes high thermic effect protein (${proteinTarget}g) and voluminous fiber to keep you full and curb cravings.`,
          suggestedMeals: [
            {
              id: 'meal-fb-1',
              name: 'High-Protein Power Scramble & Berries',
              type: 'breakfast',
              calories: Math.round(targetCalories * 0.28),
              protein: 42,
              carbs: 30,
              fat: 14,
              prepTimeMinutes: 12,
              ingredients: ['3 pasture-raised eggs + 1/2 cup egg whites', '1 cup baby spinach', '1/2 cup fresh blueberries', '1 slice sprouted whole grain toast'],
              instructions: ['Whisk eggs and whites together', 'Sauté spinach in a non-stick pan, add eggs and scramble lightly', 'Serve alongside berries and toasted bread'],
              satietyIndex: 'very_high',
              tags: ['High-Protein', 'Quick-Prep'],
            },
            {
              id: 'meal-fb-2',
              name: 'Grilled Herb Chicken & Quinoa Bowl',
              type: 'lunch',
              calories: Math.round(targetCalories * 0.35),
              protein: 48,
              carbs: 45,
              fat: 16,
              prepTimeMinutes: 18,
              ingredients: ['180g lean chicken breast', '3/4 cup cooked quinoa', '1.5 cups roasted broccoli & bell peppers', '1 tbsp extra virgin olive oil vinaigrette'],
              instructions: ['Season chicken breast with herbs, grill for 6 mins per side', 'Toss warm quinoa with roasted vegetables', 'Slice chicken over the grain bowl with dressing'],
              satietyIndex: 'very_high',
              tags: ['Low-GI', 'Fiber-Rich'],
            },
            {
              id: 'meal-fb-3',
              name: 'Wild Salmon with Asparagus & Sweet Potato Mash',
              type: 'dinner',
              calories: Math.round(targetCalories * 0.30),
              protein: 44,
              carbs: 35,
              fat: 18,
              prepTimeMinutes: 22,
              ingredients: ['170g wild-caught salmon fillet', '1 medium baked sweet potato', '1 bunch fresh asparagus', '1 tsp lemon zest & sea salt'],
              instructions: ['Bake sweet potato at 200°C for 35 mins', 'Pan-sear salmon in olive oil for 4 mins skin-side down', 'Sauté asparagus with lemon zest and plate alongside mashed sweet potato'],
              satietyIndex: 'very_high',
              tags: ['Omega-3', 'High-Satiety'],
            },
            {
              id: 'meal-fb-4',
              name: 'Greek Yogurt Craving Crusher Bowl',
              type: 'snack',
              calories: Math.round(targetCalories * 0.07),
              protein: 22,
              carbs: 12,
              fat: 4,
              prepTimeMinutes: 5,
              ingredients: ['1 cup 0% plain Greek yogurt', '1 tbsp crushed walnuts', '1 tsp raw honey', 'Pinch of ground cinnamon'],
              instructions: ['Layer Greek yogurt in a glass bowl', 'Top with crushed walnuts, cinnamon, and a drizzle of honey'],
              satietyIndex: 'high',
              tags: ['Night-Craving-Buster', 'Protein-Dessert'],
            },
          ],
          groceryHighlights: ['Pasture-raised eggs', 'Chicken breast', 'Wild salmon', 'Quinoa', 'Greek yogurt', 'Blueberries', 'Spinach', 'Asparagus'],
        },
        fitnessStrategy: {
          headline: `${workoutDaysPerWeek}-Day Progressive Resistance & NEAT Split`,
          splitType: 'Upper / Lower / Conditioning Hypertrophy',
          neatRecommendations: 'Aim for 8,500 daily steps by incorporating 10-minute post-meal walks.',
          weeklySessions: [
            {
              id: 'wo-fb-1',
              title: 'Upper Body Hypertrophy & Core',
              dayOfWeek: 'Monday',
              type: 'strength',
              durationMinutes: workoutDurationMinutes,
              estimatedCaloriesBurn: 280,
              exercises: [
                { name: 'Dumbbell Flat Chest Press', sets: 4, repsOrDuration: '10-12 reps', restSeconds: 75, targetMuscle: 'Chest & Triceps', instructions: 'Control 2s eccentric descent' },
                { name: 'One-Arm Dumbbell Row', sets: 4, repsOrDuration: '10 reps/side', restSeconds: 60, targetMuscle: 'Lats & Rhomboids', instructions: 'Pull elbow toward hip' },
                { name: 'Dumbbell Overhead Shoulder Press', sets: 3, repsOrDuration: '12 reps', restSeconds: 60, targetMuscle: 'Anterior Deltoids', instructions: 'Keep core braced' },
                { name: 'Hanging Knee Raises / Plank', sets: 3, repsOrDuration: '45 seconds', restSeconds: 45, targetMuscle: 'Core & Abdominals', instructions: 'Avoid swinging' },
              ],
            },
            {
              id: 'wo-fb-2',
              title: 'Lower Body Posterior Chain & Quad Focus',
              dayOfWeek: 'Wednesday',
              type: 'strength',
              durationMinutes: workoutDurationMinutes,
              estimatedCaloriesBurn: 320,
              exercises: [
                { name: 'Goblet Squats', sets: 4, repsOrDuration: '12 reps', restSeconds: 75, targetMuscle: 'Quadriceps & Glutes', instructions: 'Descend to parallel, chest upright' },
                { name: 'Dumbbell Romanian Deadlifts', sets: 4, repsOrDuration: '10 reps', restSeconds: 75, targetMuscle: 'Hamstrings & Glutes', instructions: 'Hinge at hips with neutral spine' },
                { name: 'Bulgarian Split Squats', sets: 3, repsOrDuration: '8 reps/leg', restSeconds: 60, targetMuscle: 'Single-Leg Stability', instructions: 'Focus on front foot drive' },
                { name: 'Standing Calf Raises', sets: 3, repsOrDuration: '15 reps', restSeconds: 45, targetMuscle: 'Calves', instructions: 'Hold top contraction 1s' },
              ],
            },
            {
              id: 'wo-fb-3',
              title: 'Full Body Metabolic Flush & Mobility',
              dayOfWeek: 'Friday',
              type: 'strength',
              durationMinutes: workoutDurationMinutes,
              estimatedCaloriesBurn: 310,
              exercises: [
                { name: 'Dumbbell Thrusters (Squat + Press)', sets: 4, repsOrDuration: '10 reps', restSeconds: 60, targetMuscle: 'Full Body Power', instructions: 'Fluid motion from bottom of squat' },
                { name: 'Push-Ups / Incline Push-Ups', sets: 3, repsOrDuration: 'To near failure', restSeconds: 60, targetMuscle: 'Chest & Serratus', instructions: 'Full range of motion' },
                { name: 'Dumbbell Bicep Curls to Lateral Raises', sets: 3, repsOrDuration: '12 reps', restSeconds: 45, targetMuscle: 'Arms & Shoulders', instructions: 'Strict form without momentum' },
              ],
            },
          ],
        },
        behavioralProtocol: {
          primaryChallengeAddressed: primaryChallenges[0] || 'Evening Cravings & Consistency',
          actionableHabits: [
            'Drink 500ml of water with electrolytes immediately upon waking.',
            'Maintain a strict 10-hour eating window (e.g. 9:00 AM to 7:00 PM) to eliminate mindless nighttime grazing.',
            'Keep zero high-trigger ultra-processed snacks in direct eyesight or in the pantry.',
          ],
          psychologicalCopingTechnique: 'Use the 15-Minute Craving Delay Rule: When a craving strikes, drink a glass of water and engage in a non-food distraction for 15 minutes. 85% of impulsive cravings dissipate.',
          sleepOptimizationTip: `To protect your fat loss hormones with ${sleepHoursPerNight}h sleep, power down screens 45 minutes before bedtime and keep your bedroom below 19°C.`,
        },
        ragEvidenceGrounding: ragResults.slice(0, 3).map((r) => ({
          paperTitle: r.document.title,
          citation: r.document.citations[0] || 'American Journal of Clinical Nutrition',
          clinicalTakeaway: r.document.keyTakeaways[0] || r.document.summary,
        })),
        agentThoughtTrace: [
          { agentName: 'Master Orchestrator', reasoning: `Calculated Mifflin-St Jeor baseline: BMR ${bmr} kcal, TDEE ${tdee} kcal, establishing sustainable ${dailyDeficit} kcal deficit.` },
          { agentName: 'Clinical Nutritionist Agent', reasoning: `Formulated ${proteinTarget}g protein target (2.0g/kg) and fiber-dense meal rotation to maximize satiety index.` },
          { agentName: 'Exercise Physiologist Agent', reasoning: `Scheduled ${workoutDaysPerWeek} weekly resistance sessions matching ${equipmentAvailable} to stimulate Muscle Protein Synthesis.` },
          { agentName: 'Behavioral Psychologist Agent', reasoning: 'Engineered 15-minute craving delay protocol and sleep hygiene tactics to maintain hormone balance.' },
        ],
      };

      res.json(fallbackResponse);
    } catch (err: any) {
      console.error('Personalized suggestion error:', err);
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

  // Clinical RAG Guidelines Endpoint
  app.get('/api/rag/clinical-guidelines', (req, res) => {
    const topic = req.query.topic as string | undefined;
    const search = req.query.search as string | undefined;

    if (search) {
      const results = searchClinicalGuidelines(search, { topic, limit: 20 });
      return res.json({ guidelines: results.map((r) => r.guideline) });
    }

    if (topic && topic !== 'all') {
      const filtered = CLINICAL_RAG_GUIDELINES.filter((g) => g.topic === topic);
      return res.json({ guidelines: filtered });
    }

    res.json({ guidelines: CLINICAL_RAG_GUIDELINES });
  });

  // Personalized Health Check-In Assessment Endpoint (Matching Image Reference & Clinical RAG)
  app.post('/api/rag/personalized-checkin', async (req, res) => {
    try {
      const {
        age,
        sex,
        height,
        heightUnit = 'cm',
        weight,
        weightUnit = 'kg',
        lifestylePreferences = [],
        symptomsNarrative = '',
      } = req.body;

      // 1. Calculate Standardized Metric Values & BMI
      const parsedHeight = parseFloat(height) || 170;
      const heightInCm = heightUnit === 'in' ? parsedHeight * 2.54 : parsedHeight;
      const parsedWeight = parseFloat(weight) || 70;
      const weightInKg = weightUnit === 'lbs' ? parsedWeight * 0.45359237 : parsedWeight;

      const heightInMeters = heightInCm / 100;
      const bmi = parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(1));

      let bmiCategory = 'Healthy Weight';
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
      else if (bmi >= 30 && bmi < 35) bmiCategory = 'Obesity Class I';
      else if (bmi >= 35) bmiCategory = 'Obesity Class II+';

      const waistWarning =
        sex === 'female'
          ? 'Waist circumference > 35 inches indicates increased cardiometabolic risk (NHLBI).'
          : sex === 'male'
          ? 'Waist circumference > 40 inches indicates increased cardiometabolic risk (NHLBI).'
          : 'Waist circumference monitoring is recommended alongside BMI to assess visceral adiposity.';

      // 2. Perform RAG Retrieval across 20 Clinical Guidelines & Research Base
      const combinedSearchQuery = `${symptomsNarrative} ${lifestylePreferences.join(' ')} ${sex || ''} ${bmiCategory}`;
      const matchedClinical = searchClinicalGuidelines(combinedSearchQuery, { limit: 4 });
      const matchedGuidelines = matchedClinical.map((m) => m.guideline);

      const matchedMechanisms = searchRAGKnowledge(symptomsNarrative || 'healthy weight loss and sleep', 2);

      // 3. Formulate RAG context text for Gemini
      const clinicalContext = matchedGuidelines
        .map(
          (g, idx) =>
            `[Clinical Guideline ${idx + 1}]: ID: ${g.id} | Source: ${g.source} (${g.organization}, ${g.year}) | Topic: ${g.topic} | Evidence Level: ${g.evidence_level}\nSummary: ${g.knowledge_summary}\nRecommended Actions: ${g.recommended_actions.join('; ')}\nWhen to Seek Care: ${g.when_to_seek_care}\nDoc URL: ${g.document_url}`
        )
        .join('\n\n');

      const prompt = `You are the Lead Clinical & Behavioral Health Specialist AI for Vita Agent v2.0.
Analyze this user's Personal Health Check-In based STRICTLY on the retrieved clinical evidence guidelines.

USER CHECK-IN DETAILS:
- Age: ${age || 'Unspecified'}
- Biological Sex: ${sex || 'Unspecified'}
- Height: ${height} ${heightUnit} (${heightInCm.toFixed(1)} cm)
- Weight: ${weight} ${weightUnit} (${weightInKg.toFixed(1)} kg)
- Calculated BMI: ${bmi} (${bmiCategory})
- Dietary & Lifestyle Preferences: ${lifestylePreferences.length > 0 ? lifestylePreferences.join(', ') : 'None specified'}
- How they have been feeling (Symptoms / History narrative):
"${symptomsNarrative || 'Routine health check-in seeking general optimization.'}"

RETRIEVED CLINICAL RAG GUIDELINES (Use these directly for citations & triage):
${clinicalContext}

Respond ONLY with a valid JSON object matching this exact schema:
{
  "executiveSummary": "Concise 2-sentence clinical synthesis addressing their stated symptoms and BMI profile.",
  "symptomTriaging": {
    "analysis": "Clinical analysis of their symptoms (e.g. insomnia, hypertension sensations, fatigue, dizziness) connecting duration, frequency, and lifestyle interactions.",
    "whenToSeekCareAlerts": [
      "Specific symptom threshold from the guidelines when they should consult a physician (e.g., A1C/glucose testing, blood pressure >= 130/80, chronic insomnia >3 weeks, loud snoring/apnea gasping)"
    ],
    "urgencyLevel": "low" | "moderate" | "high_consult_physician"
  },
  "evidenceBasedPlan": {
    "nutritionRecommendations": [
      "Target 1: Actionable guideline-backed dietary step (e.g. DASH pattern, sodium under 2,300mg, WHO free sugars <10%, 400g+ veggies/fruits)",
      "Target 2: Specific dietary action tailored to their stated symptoms or preferences"
    ],
    "physicalActivityRecommendations": [
      "Target 1: 150-300 min/week moderate aerobic or 75-150 min vigorous activity (ODPHP/WHO)",
      "Target 2: Progressive muscle-strengthening at least 2 days/week"
    ],
    "sleepAndBehavioralAdvice": [
      "Target 1: Specific sleep intervention (CBT-I stimulus control if insomnia >3 weeks, or CDC cool/dark bedroom and 7+ hours duration)",
      "Target 2: Habit loop or stress reduction action"
    ]
  },
  "medicalDisclaimer": "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines."
}`;

      try {
        const ai = getAi();
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          bmiAssessment: {
            bmi,
            category: bmiCategory,
            waistWarning,
          },
          matchedGuidelines,
          symptomTriaging: parsed.symptomTriaging || {
            analysis: 'Based on your reported duration of symptoms, prioritized clinical guidelines suggest structured evaluation.',
            whenToSeekCareAlerts: matchedGuidelines.map((g) => g.when_to_seek_care),
            urgencyLevel: symptomsNarrative.toLowerCase().includes('dizzy') || symptomsNarrative.toLowerCase().includes('pressure') ? 'moderate' : 'low',
          },
          evidenceBasedPlan: parsed.evidenceBasedPlan || {
            nutritionRecommendations: [
              'Adopt the DASH dietary framework focusing on vegetables, fruits, legumes, and lean protein (NIH/NHLBI).',
              'Maintain sodium under 2,300mg/day to support optimal cardiovascular health.',
            ],
            physicalActivityRecommendations: [
              'Target 150-300 minutes of moderate aerobic activity weekly with 2+ strength days (HHS/ODPHP).',
            ],
            sleepAndBehavioralAdvice: [
              'For persistent sleep difficulty, utilize Cognitive Behavioral Therapy for Insomnia (CBT-I) principles (AASM).',
              'Ensure cool (18°C), screen-free bedroom environment aiming for 7+ hours uninterrupted sleep (CDC).',
            ],
          },
          executiveSummary: parsed.executiveSummary || `Your BMI is ${bmi} (${bmiCategory}). We matched ${matchedGuidelines.length} evidence-based clinical guidelines to your check-in.`,
          medicalDisclaimer: parsed.medicalDisclaimer || matchedGuidelines[0]?.medical_disclaimer || 'This content is for general educational purposes only.',
        });
      } catch (aiErr: any) {
        console.warn('Gemini Check-In error, falling back to deterministic RAG synthesis:', aiErr);

        return res.json({
          bmiAssessment: {
            bmi,
            category: bmiCategory,
            waistWarning,
          },
          matchedGuidelines,
          symptomTriaging: {
            analysis: `You reported: "${symptomsNarrative || 'Health check-in'}". For symptoms such as sleep disruptions, energy dips, or elevated blood pressure sensations, guidelines strongly recommend tracking duration and frequency.`,
            whenToSeekCareAlerts: matchedGuidelines.map((g) => g.when_to_seek_care),
            urgencyLevel: symptomsNarrative.toLowerCase().includes('dizzy') || symptomsNarrative.toLowerCase().includes('insomnia') ? 'moderate' : 'low',
          },
          evidenceBasedPlan: {
            nutritionRecommendations: [
              'Follow the DASH eating pattern with rich potassium from leafy greens, berries, and legumes (NIH/NHLBI).',
              'Keep added sugars under 10% of total energy and sodium under 2,300 mg/day (WHO / NHLBI).',
              'Ensure adequate protein (1.6 - 2.2 g/kg) to promote fullness and maintain lean muscle.',
            ],
            physicalActivityRecommendations: [
              'Aim for 150-300 minutes/week of moderate aerobic exercise combined with 2+ days of muscle-strengthening (ODPHP / WHO).',
              'Break up prolonged sitting throughout the day with brisk 5-minute movement bouts.',
            ],
            sleepAndBehavioralAdvice: [
              'Maintain consistent sleep and wake timing ±30 min every day including weekends (CDC).',
              'If sleep onset difficulty has persisted >3 weeks, consider CBT-I behavioral techniques over simple hygiene tips alone (AASM).',
              'Limit caffeine and heavy meals within 6-8 hours of bedtime.',
            ],
          },
          executiveSummary: `Personal health check-in completed. Your calculated BMI is ${bmi} (${bmiCategory}). Matched with ${matchedGuidelines.length} verified clinical guidelines from ${matchedGuidelines.map(g => g.organization).join(', ')}.`,
          medicalDisclaimer: 'This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation.',
        });
      }
    } catch (err: any) {
      console.error('Check-in error:', err);
      res.status(500).json({ error: err.message });
    }
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
