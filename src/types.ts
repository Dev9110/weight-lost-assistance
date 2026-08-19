export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active' | 'heavy' | 'athlete';
export type DietPreference = 'balanced' | 'high_protein' | 'keto' | 'mediterranean' | 'vegetarian' | 'vegan' | 'low_carb' | 'intermittent_fasting';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
  activityLevel: ActivityLevel;
  dietPreference: DietPreference;
  allergies?: string[];
  targetLossPaceKgPerWeek: number; // e.g. 0.5 kg/week
  mealsPerDay?: number;
  waterGoalLiters: number;
  healthConditions?: string[];
  equipmentAvailable?: string[];
  preferredWorkoutDays?: string[];
  dailyCalorieLimit?: number;
}

export interface MacroTargets {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  tdee: number;
  bmr: number;
  deficit: number;
}

export interface MealItem {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes: number;
  ingredients: string[];
  instructions: string[];
  satietyIndex: 'high' | 'very_high' | 'moderate';
  tags: string[];
  logged?: boolean;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  repsOrDuration: string;
  restSeconds: number;
  targetMuscle: string;
  instructions: string;
  completed?: boolean;
}

export interface WorkoutSession {
  id: string;
  title: string;
  dayOfWeek: string;
  type: 'strength' | 'cardio' | 'hiit' | 'mobility' | 'recovery';
  durationMinutes: number;
  estimatedCaloriesBurn: number;
  exercises: WorkoutExercise[];
  scheduledTime?: string;
  completed?: boolean;
  syncedToCalendar?: boolean;
}

export interface WeightLogEntry {
  date: string;
  weightKg: number;
  caloriesConsumed?: number;
  waterConsumedLiters?: number;
  notes?: string;
  mood?: 'great' | 'good' | 'neutral' | 'struggling';
}

export interface RAGDocument {
  id: string;
  title: string;
  category: 'energy_balance' | 'macronutrients' | 'exercise_physiology' | 'behavioral_psychology' | 'metabolism' | 'meal_timing' | 'supplements';
  summary: string;
  content: string;
  citations: string[];
  keyTakeaways: string[];
  relevanceScore?: number;
}

export interface AgentReasoningStep {
  agentName: 'Master Orchestrator' | 'Nutritionist Agent' | 'Fitness Coach Agent' | 'Behavioral Psychologist Agent';
  thought: string;
  toolUsed?: string;
  toolResult?: string;
  ragSourcesUsed?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentRole?: 'orchestrator' | 'nutritionist' | 'fitness' | 'behavioral';
  role?: string;
  text: string;
  timestamp: string;
  reasoningSteps?: AgentReasoningStep[];
  ragCitations?: { title: string; source: string; snippet: string }[];
  suggestedActions?: { label: string; actionType: 'sync_calendar' | 'create_keep_note' | 'log_meal' | 'adjust_calories'; payload?: any }[];
}

export interface KeepNote {
  id: string;
  title: string;
  category: 'grocery' | 'meal_plan' | 'workout' | 'habit_tracker' | 'motivation';
  items: { text: string; checked: boolean }[];
  plainContent?: string;
  createdDate: string;
  updatedDate: string;
  tags: string[];
}

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  eventType: 'workout' | 'meal_prep' | 'fasting_window' | 'weigh_in';
}
