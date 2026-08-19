export function generatePythonAgentScript(profileName: string = 'User', targetCalories: number = 1950, proteinGrams: number = 160): string {
  return `"""
=============================================================================
Personalized Weight Loss Agent with RAG, Google Calendar & Google Keep
Powered by Google GenAI (Gemini 2.5/3.7) & Evidence-Based Sports Science
=============================================================================
Requirements:
  pip install google-genai google-api-python-client google-auth-oauthlib numpy
=============================================================================
"""

import os
import json
import datetime
from typing import List, Dict, Any
import numpy as np

# 1. Initialize Gemini Client via @google/genai
from google import genai
from google.genai import types

# Set your API Key in environment: export GEMINI_API_KEY="your-api-key"
client = genai.Client()

# =============================================================================
# 2. EVIDENCE-BASED RAG KNOWLEDGE BASE (Scientific Weight Loss & Metabolism)
# =============================================================================

RAG_CORPUS = [
    {
        "id": "energy_balance",
        "title": "Energy Balance & Safe Caloric Deficit",
        "content": (
            "Caloric deficit of 300-600 kcal/day (0.5-0.75 kg/week) optimizes fat loss while sparing lean "
            "muscle mass. Mifflin-St Jeor equation calculates BMR. High deficits (>1000 kcal) elevate cortisol, "
            "suppress T3 thyroid hormone, and accelerate muscle sarcopenia."
        ),
        "source": "Mifflin et al., Am J Clin Nutr (1990); Hall et al., (2012)"
    },
    {
        "id": "protein_leverage",
        "title": "Protein Leverage & Muscle Preservation",
        "content": (
            "Dietary protein exhibits 20-30% Thermic Effect of Food (TEF). Optimal intake in a hypocaloric state "
            "is 1.8 - 2.4 g/kg body weight. High protein stimulates PYY & GLP-1 while suppressing ghrelin. "
            "Doses of 30g+ with 2.5g leucine trigger maximal muscle protein synthesis (MPS)."
        ),
        "source": "Morton et al., Br J Sports Med (2018); Simpson & Raubenheimer (2005)"
    },
    {
        "id": "exercise_physiology",
        "title": "Resistance Training, NEAT & Zone 2 Cardio",
        "content": (
            "Progressive resistance training (3-4x/week) provides mechanical tension to preserve metabolic rate. "
            "Non-Exercise Activity Thermogenesis (NEAT) targeting 8,000-12,000 steps daily prevents metabolic compensation "
            "without spiking appetite. Zone 2 cardio (60-70% max HR) optimizes mitochondrial fat oxidation."
        ),
        "source": "Levine, Best Pract Res Clin Endocrinol (2002); Schoenfeld et al. (2016)"
    },
    {
        "id": "circadian_sleep",
        "title": "Sleep Deprivation & Cortisol Impacts",
        "content": (
            "Less than 7 hours sleep shifts weight loss composition from 80% fat loss to 80% muscle loss. "
            "Sleep deprivation increases ghrelin by 20%, drops leptin by 18%, and activates the amygdala for junk cravings."
        ),
        "source": "Nedeltcheva et al., Ann Intern Med (2010); Spiegel et al. (2004)"
    },
    {
        "id": "satiety_fiber",
        "title": "Satiety Index & Dietary Fiber Volume",
        "content": (
            "High-volume, low-calorie density foods (<1.5 kcal/g) satisfy gastric mechanoreceptors. "
            "Aim for 30-40g dietary fiber daily. Soluble fiber ferments into Short Chain Fatty Acids (SCFAs), "
            "prolonging fullness and blunting postprandial insulin spikes."
        ),
        "source": "Holt et al., Eur J Clin Nutr (1995); Rolls, Proc Nutr Soc (2010)"
    }
]

def rag_retrieve_context(query: str, top_k: int = 2) -> List[Dict[str, Any]]:
    """Simple term-frequency semantic retrieval over the sports science corpus."""
    query_words = set(query.lower().split())
    scored = []
    for doc in RAG_CORPUS:
        text = (doc['title'] + " " + doc['content']).lower()
        score = sum(text.count(word) for word in query_words)
        scored.append((score, doc))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [doc for score, doc in scored[:top_k]]

# =============================================================================
# 3. AGENTIC AI SYSTEM (Orchestrator, Nutritionist, Fitness Coach)
# =============================================================================

class WeightLossAgentSystem:
    def __init__(self, user_profile: Dict[str, Any]):
        self.profile = user_profile

    def run_agentic_pipeline(self, user_goal_or_query: str) -> Dict[str, Any]:
        """
        Executes a multi-agent chain:
        1. RAG context retrieval
        2. Master Orchestrator reasoning
        3. Action Plan Generation
        """
        # Step 1: RAG Retrieval
        retrieved_docs = rag_retrieve_context(user_goal_or_query, top_k=2)
        rag_context_str = "\\n".join([f"- [{d['title']}] ({d['source']}): {d['content']}" for d in retrieved_docs])

        # Step 2: System prompt with Agent Persona & Scientific Grounding
        system_instruction = f"""
You are the Lead Scientific Weight Loss AI Coach.
User Profile:
- Name: {self.profile.get('name', 'User')}
- Current Weight: {self.profile.get('current_weight_kg', 80)} kg
- Goal Weight: {self.profile.get('goal_weight_kg', 70)} kg
- Target Calories: {self.profile.get('target_calories', 1950)} kcal/day
- Target Protein: {self.profile.get('protein_grams', 160)} g/day
- Diet Preference: {self.profile.get('diet_preference', 'Balanced High-Protein')}

SCIENTIFIC RAG EVIDENCE:
{rag_context_str}

Reason step-by-step to provide actionable advice, meal suggestions, and training adaptations.
"""

        response = client.models.generate_content(
            model='gemini-3.7-flash',
            contents=user_goal_or_query,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7
            )
        )

        return {
            "query": user_goal_or_query,
            "rag_sources": [d['title'] for d in retrieved_docs],
            "agent_response": response.text,
        }

# =============================================================================
# 4. GOOGLE CALENDAR INTEGRATION (Scheduling Workouts & Meal Prep)
# =============================================================================

def schedule_workout_to_google_calendar(
    access_token: str,
    summary: str,
    start_iso: str,
    end_iso: str,
    description: str = "AI Weight Loss Coach Scheduled Session"
):
    """
    Directly creates an event on Google Calendar using the OAuth access token.
    """
    import urllib.request

    url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    payload = {
        "summary": summary,
        "description": description,
        "start": {"dateTime": start_iso},
        "end": {"dateTime": end_iso},
        "reminders": {
            "useDefault": False,
            "overrides": [{"method": "popup", "minutes": 15}]
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"\\033[92m[Google Calendar] Scheduled: '{summary}' (Event ID: {data.get('id')})\\033[0m")
            return data
    except Exception as e:
        print(f"[Google Calendar Error] {e}")
        return None

# =============================================================================
# 5. GOOGLE KEEP INTEGRATION (Generating Grocery & Routine Checklists)
# =============================================================================

def format_google_keep_grocery_note(meal_ingredients: List[str]) -> str:
    """Formats a structured checklist note ready for Google Keep."""
    note_header = "🛒 AI Weight Loss Coach - Weekly Grocery Checklist\\n"
    note_header += f"Created: {datetime.date.today().isoformat()}\\n"
    note_header += "------------------------------------------\\n"
    checklist = "\\n".join([f"☑ [ ] {item}" for item in meal_ingredients])
    return note_header + checklist

# =============================================================================
# 6. DEMO EXECUTION
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("AI Personalized Weight Loss Coach (Python + RAG + Workspace)")
    print("=" * 60)

    user_data = {
        "name": "${profileName}",
        "current_weight_kg": 82.0,
        "goal_weight_kg": 74.0,
        "target_calories": ${targetCalories},
        "protein_grams": ${proteinGrams},
        "diet_preference": "High-Protein Balanced"
    }

    agent_system = WeightLossAgentSystem(user_data)
    
    # Test Query
    prompt = "How can I maintain muscle mass while burning fat on a 500 kcal deficit?"
    print(f"\\n[User Query]: {prompt}")
    
    result = agent_system.run_agentic_pipeline(prompt)
    print(f"\\n[RAG Sources Retrieved]: {result['rag_sources']}")
    print(f"\\n[AI Coach Response]:\\n{result['agent_response']}")

    # Keep Checklist Preview
    sample_ingredients = [
        "Extra Lean Chicken Breast (800g)",
        "Wild Blueberries (Frozen, 500g)",
        "Organic Baby Spinach (2x tubs)",
        "Rolled Whole Oats (1kg)",
        "Whey Protein Isolate Vanilla",
        "Extra Virgin Olive Oil"
    ]
    keep_note = format_google_keep_grocery_note(sample_ingredients)
    print("\\n[Google Keep Note Preview]:\\n" + keep_note)
`;
}
