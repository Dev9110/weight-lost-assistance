import { UserProfile, MacroTargets, MealItem, WorkoutSession } from '../types';

/**
 * Calculates BMR, TDEE, Caloric Deficit, and Macro Targets
 */
export function calculateMacros(profile: UserProfile): MacroTargets {
  // Mifflin-St Jeor Formula
  let bmr = 10 * profile.currentWeightKg + 6.25 * profile.heightCm - 5 * profile.age;
  if (profile.gender === 'male') {
    bmr += 5;
  } else if (profile.gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78; // average between male and female
  }

  // Activity Multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const multiplier = activityMultipliers[profile.activityLevel] || 1.375;
  const tdee = Math.round(bmr * multiplier);

  // 1 kg of body fat is roughly 7,700 kcal.
  // Weekly deficit = pace * 7700. Daily deficit = (pace * 7700) / 7 = pace * 1100.
  const targetDailyDeficit = Math.round(profile.targetLossPaceKgPerWeek * 1100);

  // Minimum safety thresholds: 1200 kcal for women, 1500 kcal for men
  const minCalories = profile.gender === 'female' ? 1250 : 1500;
  const rawTarget = tdee - targetDailyDeficit;
  const calories = Math.max(minCalories, Math.min(rawTarget, tdee - 250));
  const effectiveDeficit = tdee - calories;

  // Protein calculation: 1.8 to 2.2 g/kg for hypocaloric muscle preservation
  let proteinFactor = 2.0;
  if (profile.dietPreference === 'high_protein') proteinFactor = 2.2;
  if (profile.dietPreference === 'keto') proteinFactor = 1.9;
  if (profile.dietPreference === 'vegan' || profile.dietPreference === 'vegetarian') proteinFactor = 1.8;

  const proteinGrams = Math.round(profile.currentWeightKg * proteinFactor);
  const proteinCals = proteinGrams * 4;

  // Fat calculation
  let fatPercentage = 0.25; // 25% of calories
  if (profile.dietPreference === 'keto') fatPercentage = 0.65;
  if (profile.dietPreference === 'low_carb') fatPercentage = 0.35;
  if (profile.dietPreference === 'mediterranean') fatPercentage = 0.30;

  let fatGrams = Math.round((calories * fatPercentage) / 9);
  if (fatGrams < 40) fatGrams = 40; // minimum essential fatty acid intake

  const fatCals = fatGrams * 9;

  // Carbs = Remaining calories
  const remainingCals = Math.max(0, calories - proteinCals - fatCals);
  const carbsGrams = Math.round(remainingCals / 4);

  // Dietary Fiber: 14g per 1000 kcal
  const fiberGrams = Math.round((calories / 1000) * 14);

  return {
    calories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    fiberGrams,
    tdee,
    bmr: Math.round(bmr),
    deficit: effectiveDeficit,
  };
}

/**
 * Calculates projected target date to reach goal weight
 */
export function calculateTargetDate(currentWeightKg: number, goalWeightKg: number, paceKgPerWeek: number): {
  weeksRemaining: number;
  projectedDateString: string;
  totalLossKg: number;
} {
  const totalLossKg = Math.max(0, currentWeightKg - goalWeightKg);
  const pace = Math.max(0.1, paceKgPerWeek);
  const weeksRemaining = Math.ceil(totalLossKg / pace);

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeksRemaining * 7);

  return {
    weeksRemaining,
    projectedDateString: targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    totalLossKg: Math.round(totalLossKg * 10) / 10,
  };
}

/**
 * Default sample meal plan generated based on macros and diet preference
 */
export function generateDefaultMealPlan(profile: UserProfile, macros: MacroTargets): MealItem[] {
  const isVeg = profile.dietPreference === 'vegetarian' || profile.dietPreference === 'vegan';
  const isKeto = profile.dietPreference === 'keto';

  const breakfastTargetCals = Math.round(macros.calories * 0.25);
  const lunchTargetCals = Math.round(macros.calories * 0.35);
  const dinnerTargetCals = Math.round(macros.calories * 0.30);
  const snackTargetCals = Math.round(macros.calories * 0.10);

  if (isKeto) {
    return [
      {
        id: 'meal-1',
        name: 'Avocado & Spinach Pasture Egg Scramble with Feta',
        type: 'breakfast',
        calories: breakfastTargetCals,
        protein: Math.round(macros.proteinGrams * 0.25),
        carbs: 6,
        fat: Math.round(breakfastTargetCals * 0.7 / 9),
        prepTimeMinutes: 12,
        ingredients: ['3 Large Organic Eggs', '1/2 Ripe Hass Avocado', '1 cup Fresh Baby Spinach', '20g Crumbled Feta', '1 tbsp Extra Virgin Olive Oil'],
        instructions: ['Heat olive oil in non-stick pan over medium heat.', 'Sauté spinach until wilted (2 min).', 'Whisk eggs with a pinch of sea salt, pour over spinach, and gently fold.', 'Top with sliced avocado and crumbled feta.'],
        satietyIndex: 'very_high',
        tags: ['Keto', 'High Satiety', 'Quick', 'Gluten-Free']
      },
      {
        id: 'meal-2',
        name: 'Wild Salmon & Mixed Greens Bowl with Olive Oil Herb Dressing',
        type: 'lunch',
        calories: lunchTargetCals,
        protein: Math.round(macros.proteinGrams * 0.35),
        carbs: 8,
        fat: Math.round(lunchTargetCals * 0.65 / 9),
        prepTimeMinutes: 20,
        ingredients: ['180g Wild Caught Salmon Fillet', '3 cups Mixed Baby Greens & Arugula', '1/2 English Cucumber', '10 Kalamata Olives', '1.5 tbsp Extra Virgin Olive Oil', '1 tbsp Fresh Lemon Juice'],
        instructions: ['Season salmon with garlic powder, paprika, salt, and black pepper.', 'Pan sear salmon skin-down for 5 mins, flip and cook 3 mins.', 'Toss mixed greens, diced cucumber, and olives in lemon olive oil dressing.', 'Place hot salmon on top of salad.'],
        satietyIndex: 'very_high',
        tags: ['Keto', 'Omega-3 Rich', 'Anti-Inflammatory']
      },
      {
        id: 'meal-3',
        name: 'Grass-Fed Beef or Tofu Zucchini Noodle Bolognese',
        type: 'dinner',
        calories: dinnerTargetCals,
        protein: Math.round(macros.proteinGrams * 0.30),
        carbs: 9,
        fat: Math.round(dinnerTargetCals * 0.65 / 9),
        prepTimeMinutes: 25,
        ingredients: ['170g Lean Ground Beef (or Extra Firm Organic Tofu)', '2 Medium Spiralized Zucchinis', '1/2 cup Low-Carb Marinara Sauce', '1 tbsp Parmesan Cheese', '1 clove Minced Garlic'],
        instructions: ['Brown ground beef with minced garlic in skillet until cooked through; drain excess oil.', 'Stir in low-carb marinara sauce and simmer for 6 minutes.', 'Sauté zucchini noodles in separate pan for 2 minutes (al dente).', 'Plate noodles, spoon bolognese over top, and dust with fresh parmesan.'],
        satietyIndex: 'very_high',
        tags: ['Keto', 'Comfort Food', 'High Protein']
      },
      {
        id: 'meal-4',
        name: 'Raw Walnuts & Himalayan Salt Celery Sticks',
        type: 'snack',
        calories: snackTargetCals,
        protein: Math.round(macros.proteinGrams * 0.10),
        carbs: 4,
        fat: Math.round(snackTargetCals * 0.8 / 9),
        prepTimeMinutes: 3,
        ingredients: ['25g Raw Walnuts', '2 stalks Fresh Crisp Celery', 'Pinch of Pink Himalayan Salt'],
        instructions: ['Rinse celery and slice into batons.', 'Serve with raw walnut halves for immediate crunchy satiety.'],
        satietyIndex: 'high',
        tags: ['Keto', 'Brain Food', 'Zero Prep']
      }
    ];
  }

  if (isVeg) {
    return [
      {
        id: 'meal-1',
        name: 'Greek Yogurt & Wild Berry Power Bowl with Chia Seeds',
        type: 'breakfast',
        calories: breakfastTargetCals,
        protein: Math.round(macros.proteinGrams * 0.30),
        carbs: Math.round(breakfastTargetCals * 0.45 / 4),
        fat: Math.round(breakfastTargetCals * 0.20 / 9),
        prepTimeMinutes: 5,
        ingredients: ['200g Plain 0% Greek Yogurt (or Soy Yogurt)', '1/2 cup Wild Blueberries', '1 tbsp Chia Seeds', '15g Crushed Almonds', '1/2 tsp Ceylon Cinnamon'],
        instructions: ['Scoop Greek yogurt into bowl.', 'Top with antioxidant-rich wild blueberries and chia seeds.', 'Garnish with sliced almonds and dust with cinnamon.'],
        satietyIndex: 'very_high',
        tags: ['High Protein', 'Probiotic', 'No Cook']
      },
      {
        id: 'meal-2',
        name: 'Crispy Spiced Chickpea & Quinoa Mediterranean Bowl',
        type: 'lunch',
        calories: lunchTargetCals,
        protein: Math.round(macros.proteinGrams * 0.30),
        carbs: Math.round(lunchTargetCals * 0.50 / 4),
        fat: Math.round(lunchTargetCals * 0.25 / 9),
        prepTimeMinutes: 20,
        ingredients: ['1 cup Cooked Fluffy Quinoa', '1 cup Roasted Chickpeas with Paprika', '1/2 cup Cherry Tomatoes', '1/2 English Cucumber', '2 tbsp Tahini Garlic Dressing'],
        instructions: ['Roast seasoned chickpeas in air fryer or oven at 200°C for 15 min.', 'Assemble cooked quinoa, sliced tomatoes, diced cucumbers, and hot chickpeas.', 'Drizzle with tahini garlic lemon dressing.'],
        satietyIndex: 'very_high',
        tags: ['Vegetarian', 'High Fiber', 'Clean Whole Food']
      },
      {
        id: 'meal-3',
        name: 'Pan-Seared Tempeh Stir-Fry with Broccoli & Jasmine Rice',
        type: 'dinner',
        calories: dinnerTargetCals,
        protein: Math.round(macros.proteinGrams * 0.30),
        carbs: Math.round(dinnerTargetCals * 0.45 / 4),
        fat: Math.round(dinnerTargetCals * 0.25 / 9),
        prepTimeMinutes: 20,
        ingredients: ['160g Organic Tempeh (cubed)', '2 cups Steamed Broccoli Florets', '1/2 cup Cooked Jasmine Rice', '1 tbsp Low-Sodium Tamari / Soy Sauce', '1 tsp Sesame Oil', '1 clove Garlic'],
        instructions: ['Cube tempeh and pan-sear in sesame oil until golden on all sides.', 'Add minced garlic, ginger, tamari, and steamed broccoli florets.', 'Toss for 3 minutes and serve over warm jasmine rice.'],
        satietyIndex: 'very_high',
        tags: ['Plant-Based', 'High Satiety', 'High Protein']
      },
      {
        id: 'meal-4',
        name: 'Apple Slices with Natural Peanut Butter',
        type: 'snack',
        calories: snackTargetCals,
        protein: Math.round(macros.proteinGrams * 0.10),
        carbs: Math.round(snackTargetCals * 0.50 / 4),
        fat: Math.round(snackTargetCals * 0.40 / 9),
        prepTimeMinutes: 3,
        ingredients: ['1 Crisp Green Honeycrisp Apple', '1 tbsp 100% Natural Peanut Butter'],
        instructions: ['Slice apple into wedges.', 'Dip in natural peanut butter for an ideal combination of pectin fiber and healthy fats.'],
        satietyIndex: 'high',
        tags: ['Whole Food', 'Pectin Fiber', 'Sweet Tooth Fix']
      }
    ];
  }

  // Standard Balanced / High Protein
  return [
    {
      id: 'meal-1',
      name: 'High-Protein Rolled Oats with Whey, Blueberries & Chia',
      type: 'breakfast',
      calories: breakfastTargetCals,
      protein: Math.round(macros.proteinGrams * 0.30),
      carbs: Math.round(breakfastTargetCals * 0.45 / 4),
      fat: Math.round(breakfastTargetCals * 0.20 / 9),
      prepTimeMinutes: 8,
      ingredients: ['50g Rolled Whole Oats', '1 scoop (30g) Vanilla Whey/Plant Isolate', '1/2 cup Fresh Blueberries', '1 tbsp Chia Seeds', '1 cup Unsweetened Almond Milk'],
      instructions: ['Simmer oats in almond milk for 4-5 minutes until creamy.', 'Remove from heat and let cool 1 min before vigorously stirring in protein powder.', 'Top with blueberries and chia seeds for extended morning satiety.'],
      satietyIndex: 'very_high',
      tags: ['High Protein', 'Beta-Glucan Fiber', 'Quick Prep']
    },
    {
      id: 'meal-2',
      name: 'Grilled Herb Chicken Breast & Sweet Potato Power Bowl',
      type: 'lunch',
      calories: lunchTargetCals,
      protein: Math.round(macros.proteinGrams * 0.35),
      carbs: Math.round(lunchTargetCals * 0.45 / 4),
      fat: Math.round(lunchTargetCals * 0.20 / 9),
      prepTimeMinutes: 20,
      ingredients: ['180g Boneless Skinless Chicken Breast', '150g Roasted Sweet Potato Cubes', '2 cups Steamed Broccoli & Green Beans', '1 tsp Olive Oil', 'Garlic, Rosemary, Smoked Paprika'],
      instructions: ['Season chicken with rosemary, smoked paprika, garlic, salt, and pepper.', 'Grill or pan-sear for 6-7 min per side until internal temp reaches 74°C (165°F).', 'Serve with roasted sweet potato cubes and steamed greens.'],
      satietyIndex: 'very_high',
      tags: ['Lean Muscle Retention', 'Clean Fuel', 'High Leucine']
    },
    {
      id: 'meal-3',
      name: 'Pan-Roasted Atlantic Cod with Lemon Garlic Asparagus & Brown Rice',
      type: 'dinner',
      calories: dinnerTargetCals,
      protein: Math.round(macros.proteinGrams * 0.25),
      carbs: Math.round(dinnerTargetCals * 0.45 / 4),
      fat: Math.round(dinnerTargetCals * 0.25 / 9),
      prepTimeMinutes: 22,
      ingredients: ['200g Fresh White Cod Fillet', '1 bunch Fresh Tender Asparagus', '1/2 cup Cooked Brown Rice', '1 tbsp Olive Oil', 'Fresh Lemon Juice & Chopped Parsley'],
      instructions: ['Preheat skillet with olive oil over medium-high heat.', 'Season cod with sea salt, pepper, and garlic herb seasoning.', 'Sear cod for 4 min per side until flaky; sauté asparagus in same pan with lemon juice.', 'Serve over warm brown rice.'],
      satietyIndex: 'very_high',
      tags: ['High Volume', 'Low Calorie Density', 'Digestive Ease']
    },
    {
      id: 'meal-4',
      name: 'Greek Yogurt Parfait with Cinnamon & Crushed Almonds',
      type: 'snack',
      calories: snackTargetCals,
      protein: Math.round(macros.proteinGrams * 0.10),
      carbs: Math.round(snackTargetCals * 0.40 / 4),
      fat: Math.round(snackTargetCals * 0.35 / 9),
      prepTimeMinutes: 3,
      ingredients: ['150g Non-fat Greek Yogurt', '12 Raw Almonds', '1/2 tsp Ceylon Cinnamon'],
      instructions: ['Layer Greek yogurt with crushed almonds and dust with cinnamon for blood sugar stabilization.'],
      satietyIndex: 'high',
      tags: ['Craving Crusher', 'Probiotic', 'Evening Satiety']
    }
  ];
}

/**
 * Default sample weekly workout schedule
 */
export const getDefaultMeals = (macros: MacroTargets, profile?: UserProfile): MealItem[] => {
  const dummyProfile: UserProfile = profile || {
    name: 'User',
    age: 28,
    gender: 'male',
    currentWeightKg: 80,
    goalWeightKg: 70,
    heightCm: 175,
    activityLevel: 'moderate',
    dietPreference: 'high_protein',
    targetLossPaceKgPerWeek: 0.5,
    allergies: [],
    waterGoalLiters: 3.0,
    dailyCalorieLimit: 1950,
  };
  return generateDefaultMealPlan(dummyProfile, macros);
};

export const getDefaultWorkouts = (profile?: UserProfile): WorkoutSession[] => {
  return generateDefaultWorkoutPlan(profile);
};

export function generateDefaultWorkoutPlan(profile?: UserProfile): WorkoutSession[] {
  return [
    {
      id: 'workout-mon',
      title: 'Upper Body Hypertrophy & Core Control',
      dayOfWeek: 'Monday',
      type: 'strength',
      durationMinutes: 45,
      estimatedCaloriesBurn: 280,
      scheduledTime: '07:30',
      exercises: [
        { name: 'Dumbbell or Barbell Bench Press', sets: 4, repsOrDuration: '8-10 reps', restSeconds: 90, targetMuscle: 'Chest & Triceps', instructions: 'Control eccentric descent for 3 seconds, press explosively.' },
        { name: 'Single-Arm Dumbbell Row', sets: 4, repsOrDuration: '10-12 reps', restSeconds: 60, targetMuscle: 'Lats & Rhomboids', instructions: 'Drive elbow toward hip, full stretch at the bottom.' },
        { name: 'Overhead Dumbbell Shoulder Press', sets: 3, repsOrDuration: '10 reps', restSeconds: 60, targetMuscle: 'Deltoids', instructions: 'Maintain neutral spine, press full range without arching lower back.' },
        { name: 'Hanging Knee Raises or Plank', sets: 3, repsOrDuration: '45 seconds', restSeconds: 45, targetMuscle: 'Core & Rectus Abdominis', instructions: 'Engage transverse abdominis, avoid swinging.' }
      ]
    },
    {
      id: 'workout-tue',
      title: 'Lower Body Strength & Posterior Chain',
      dayOfWeek: 'Tuesday',
      type: 'strength',
      durationMinutes: 50,
      estimatedCaloriesBurn: 340,
      scheduledTime: '07:30',
      exercises: [
        { name: 'Goblet Squat or Barbell Back Squat', sets: 4, repsOrDuration: '8-10 reps', restSeconds: 90, targetMuscle: 'Quadriceps & Glutes', instructions: 'Descend to parallel, knees tracking over toes.' },
        { name: 'Romanian Deadlift (RDL)', sets: 4, repsOrDuration: '10-12 reps', restSeconds: 90, targetMuscle: 'Hamstrings & Glutes', instructions: 'Hinge at the hips with soft knees, feel deep hamstring stretch.' },
        { name: 'Walking Dumbbell Lunges', sets: 3, repsOrDuration: '12 steps/leg', restSeconds: 60, targetMuscle: 'Quads & Balance', instructions: 'Keep torso upright, 90-degree bend in front knee.' },
        { name: 'Standing Calf Raises', sets: 3, repsOrDuration: '15 reps', restSeconds: 45, targetMuscle: 'Calves & Ankles', instructions: 'Pause 2 seconds at the peak contraction.' }
      ]
    },
    {
      id: 'workout-wed',
      title: 'Zone 2 Active Recovery & Step Goal (45 Min)',
      dayOfWeek: 'Wednesday',
      type: 'cardio',
      durationMinutes: 45,
      estimatedCaloriesBurn: 240,
      scheduledTime: '18:00',
      exercises: [
        { name: 'Incline Treadmill Walk or Outdoor Brisk Walk', sets: 1, repsOrDuration: '40 mins', restSeconds: 0, targetMuscle: 'Cardiovascular System (Zone 2)', instructions: 'Maintain heart rate at 60-70% max HR (conversational pace).' },
        { name: 'Thoracic Mobility & Hip Opener Flow', sets: 1, repsOrDuration: '10 mins', restSeconds: 0, targetMuscle: 'Full Body Mobility', instructions: 'World’s greatest stretch, cat-cow, and pigeon poses.' }
      ]
    },
    {
      id: 'workout-thu',
      title: 'Full Body Metabolic Resistance Circuit',
      dayOfWeek: 'Thursday',
      type: 'strength',
      durationMinutes: 45,
      estimatedCaloriesBurn: 320,
      scheduledTime: '07:30',
      exercises: [
        { name: 'Dumbbell Push Press', sets: 3, repsOrDuration: '10 reps', restSeconds: 60, targetMuscle: 'Full Body Power', instructions: 'Dip with legs and drive dumbbells overhead.' },
        { name: 'Lat Pulldowns or Pull-Up Progressions', sets: 3, repsOrDuration: '10 reps', restSeconds: 60, targetMuscle: 'Back & Biceps', instructions: 'Drive elbows down to ribcage.' },
        { name: 'Bulgarian Split Squats', sets: 3, repsOrDuration: '8 reps/leg', restSeconds: 60, targetMuscle: 'Glutes & Quads', instructions: 'Elevate rear foot on bench, descend with control.' },
        { name: 'Farmer’s Walk with Heavy Dumbbells', sets: 3, repsOrDuration: '40 meters', restSeconds: 60, targetMuscle: 'Grip & Core Stability', instructions: 'Stand tall with retracted shoulders, walk deliberately.' }
      ]
    },
    {
      id: 'workout-fri',
      title: 'HIIT & Core Conditioning',
      dayOfWeek: 'Friday',
      type: 'hiit',
      durationMinutes: 30,
      estimatedCaloriesBurn: 260,
      scheduledTime: '07:30',
      exercises: [
        { name: 'Kettlebell Swings (20s on / 40s off)', sets: 5, repsOrDuration: '20 seconds work', restSeconds: 40, targetMuscle: 'Posterior Chain & Heart Rate', instructions: 'Explosive hip snap, do not squat the weight.' },
        { name: 'Rowing Machine or Stationary Bike Sprints', sets: 5, repsOrDuration: '30 seconds sprint', restSeconds: 60, targetMuscle: 'Cardio Anaerobic Capacity', instructions: 'Give 85-90% maximum effort during work interval.' },
        { name: 'Deadbugs & Hollow Body Holds', sets: 3, repsOrDuration: '45 seconds', restSeconds: 45, targetMuscle: 'Deep Core', instructions: 'Lower back pinned to floor throughout entire hold.' }
      ]
    },
    {
      id: 'workout-sat',
      title: 'Outdoor Nature Walk & NEAT Booster',
      dayOfWeek: 'Saturday',
      type: 'mobility',
      durationMinutes: 60,
      estimatedCaloriesBurn: 300,
      scheduledTime: '10:00',
      exercises: [
        { name: 'Outdoor Trail Walk / Hike (10,000 Steps Target)', sets: 1, repsOrDuration: '60 mins', restSeconds: 0, targetMuscle: 'Fat Oxidation & Mental Health', instructions: 'Enjoy sunlight, unplug, and hit your weekend step target.' }
      ]
    },
    {
      id: 'workout-sun',
      title: 'Rest, Sleep Regeneration & Meal Prep',
      dayOfWeek: 'Sunday',
      type: 'recovery',
      durationMinutes: 30,
      estimatedCaloriesBurn: 100,
      scheduledTime: '16:00',
      exercises: [
        { name: 'Full Body Foam Rolling & Yoga Flow', sets: 1, repsOrDuration: '20 mins', restSeconds: 0, targetMuscle: 'Myofascial Release', instructions: 'Roll glutes, hamstrings, quads, and upper back.' },
        { name: 'Meal Prep Session for Week Ahead', sets: 1, repsOrDuration: '45 mins', restSeconds: 0, targetMuscle: 'Habit Architecture', instructions: 'Cook proteins, portion grains, and chop vegetables into Keep-tracked containers.' }
      ]
    }
  ];
}
