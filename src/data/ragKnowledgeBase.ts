import { RAGDocument } from '../types';

export const RAG_KNOWLEDGE_BASE: RAGDocument[] = [
  {
    id: 'rag-01',
    title: 'Thermodynamics of Energy Balance and Safe Caloric Deficit Rates',
    category: 'energy_balance',
    summary: 'A moderate caloric deficit of 300-600 kcal/day (approx. 0.5-0.75 kg/week) optimizes fat loss while sparing lean muscle mass and preventing metabolic adaptation.',
    content: `Energy balance dictates changes in body mass. When energy expenditure exceeds intake, a negative energy balance (caloric deficit) ensues. The Mifflin-St Jeor equation is clinically proven to estimate Basal Metabolic Rate (BMR) with the highest accuracy among non-invasive formulas:
    - Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
    - Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
    Total Daily Energy Expenditure (TDEE) is calculated by multiplying BMR by an Activity Multiplier (1.2 to 1.9).
    A deficit of ~500 kcal/day equates to ~3,500 kcal/week, translating to approximately 0.45-0.5 kg (1 lb) of fat loss per week. Aggressive deficits (>1000 kcal/day or >25% of TDEE) significantly increase circulating cortisol, elevate ghrelin (hunger hormone), reduce leptin (satiety hormone), and trigger thyroid downregulation (T3 suppression) alongside accelerated sarcopenia (muscle loss).`,
    citations: [
      'Mifflin, M. D., et al. (1990). "A new predictive equation for resting energy expenditure in healthy individuals." American Journal of Clinical Nutrition, 51(2), 241-247.',
      'Hall, K. D., et al. (2012). "Energy balance and its components: implications for body weight regulation." The American Journal of Clinical Nutrition, 95(4), 989-994.',
      'Helms, E. R., et al. (2014). "Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation." Journal of the International Society of Sports Nutrition, 11(1), 20.'
    ],
    keyTakeaways: [
      'Optimal deficit is 15-25% below TDEE (typically 350-600 kcal/day).',
      'Target weight loss pace: 0.5% to 1.0% of total body weight per week.',
      'Extreme crash dieting triggers adaptive thermogenesis and loss of metabolically active lean tissue.'
    ]
  },
  {
    id: 'rag-02',
    title: 'Protein Leverage Hypothesis and Muscle Protein Synthesis (MPS) in Hypocaloric States',
    category: 'macronutrients',
    summary: 'Optimal protein intake during weight loss is 1.6 to 2.4 g/kg body weight to maximize satiety, elevate the thermic effect of food (TEF), and preserve muscle tissue.',
    content: `Dietary protein exhibits the highest Thermic Effect of Food (TEF ~20-30%), compared to carbohydrates (5-10%) and fats (0-3%). In a hypocaloric state, the body tends to catabolize amino acids for gluconeogenesis if protein intake is insufficient.
    Clinical trials demonstrate that consuming 1.6 - 2.2 g of protein per kilogram of total body weight (or 2.0 - 2.6 g/kg of lean body mass) significantly enhances fat loss while preserving fat-free mass.
    The Satiety Index of foods (Holt et al.) demonstrates that high-protein, high-fiber whole foods stimulate peptide YY (PYY) and glucagon-like peptide-1 (GLP-1) secretion while suppressing ghrelin. Distributing protein evenly across 3-4 meals (minimum 25-40g protein per meal containing 2.5-3g of leucine) triggers maximal mammalian target of rapamycin (mTORC1) activation for Muscle Protein Synthesis.`,
    citations: [
      'Morton, R. W., et al. (2018). "A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength." British Journal of Sports Medicine, 52(6), 376-384.',
      'Simpson, S. J., & Raubenheimer, D. (2005). "Obesity: the protein leverage hypothesis." Obesity Reviews, 6(2), 133-142.',
      'Longland, T. M., et al. (2016). "Higher compared with lower dietary protein during an energy deficit combined with intense exercise promotes greater lean mass gain and fat mass loss." American Journal of Clinical Nutrition, 103(3), 738-746.'
    ],
    keyTakeaways: [
      'Target 1.6 - 2.2g of protein per kg of bodyweight during caloric deficit.',
      'Protein elevates metabolic burn via high thermic effect (20-30% of caloric value).',
      'Spreading protein into 30g+ doses with leucine maximizes muscle preservation.'
    ]
  },
  {
    id: 'rag-03',
    title: 'Resistance Training, NEAT Optimization, and Cardio Periodization for Fat Loss',
    category: 'exercise_physiology',
    summary: 'Progressive resistance training combined with daily step goals (8,000-12,000 steps NEAT) preserves resting metabolic rate and optimizes body recomposition better than excessive cardio.',
    content: `Exercise during weight loss serves two distinct purposes: preserving lean mass and increasing Total Daily Energy Expenditure.
    1. Progressive Resistance Training: 3-5 sessions per week targeting all major muscle groups provides the mechanical tension required to signal to the body that muscle mass is functional and must not be catabolized.
    2. Non-Exercise Activity Thermogenesis (NEAT): NEAT represents the calories burned during daily unstructured movement (walking, standing, chores). NEAT is often the first component suppressed by the brain during caloric restriction (spontaneous movement reduction). Targeting 8,000 to 12,000 steps daily prevents metabolic compensation and burns 300-500 kcal without spiking hunger.
    3. Zone 2 Low-Intensity Steady State (LISS) Cardio vs HIIT: Zone 2 cardio (60-70% max heart rate) utilizes fatty acid oxidation with minimal central nervous system fatigue and low cortisol response. High-Intensity Interval Training (HIIT) provides time-efficient cardiovascular conditioning but should be limited to 1-2 sessions/week to prevent recovery interference.`,
    citations: [
      'Levine, J. A. (2002). "Non-exercise activity thermogenesis (NEAT)." Best Practice & Research Clinical Endocrinology & Metabolism, 16(4), 679-702.',
      'Schoenfeld, B. J., et al. (2016). "Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis." Sports Medicine, 46(11), 1689-1697.',
      'Trexler, E. T., et al. (2014). "Metabolic adaptation to weight loss: implications for the athlete." Journal of the International Society of Sports Nutrition, 11(1), 7.'
    ],
    keyTakeaways: [
      'Resistance training 3-4x/week is mandatory to signal muscle retention.',
      'Prioritize daily steps (8k-10k) as the primary sustainable fat-burning tool.',
      'Keep Zone 2 cardio moderate to avoid extreme hunger surges.'
    ]
  },
  {
    id: 'rag-04',
    title: 'Circadian Biology, Sleep Deprivation, and Cortisol Dynamics on Adipose Loss',
    category: 'behavioral_psychology',
    summary: 'Less than 7 hours of sleep shifts weight loss composition from 80% fat loss to 80% lean mass loss while increasing hedonic food cravings by 45%.',
    content: `Sleep architecture directly governs endocrine regulators of energy balance. In controlled metabolic ward trials (Nedeltcheva et al.), participants on identical caloric deficits lost 55% less fat and 60% more lean muscle mass when sleep-restricted (5.5 hours vs 8.5 hours).
    Sleep deprivation impairs prefrontal cortex executive function, leading to hyper-activation of the amygdala in response to hyper-palatable, high-sugar, high-fat foods. Furthermore:
    - Ghrelin increases by 15-20% (signaling intense hunger).
    - Leptin drops by 15-20% (reducing fullness signals).
    - Insulin sensitivity in adipocytes drops by ~30%, mimicking pre-diabetic cellular states.
    - Chronically elevated evening cortisol stimulates visceral fat accumulation and promotes gluconeogenesis from skeletal muscle tissue.`,
    citations: [
      'Nedeltcheva, A. V., et al. (2010). "Insufficient sleep undermines dietary efforts to reduce adiposity." Annals of Internal Medicine, 153(7), 435-441.',
      'Spiegel, K., et al. (2004). "Brief communication: Sleep curtailment in healthy young men is associated with decreased leptin levels, elevated ghrelin levels, and increased hunger and appetite." Annals of Internal Medicine, 141(11), 846-850.',
      'Greer, S. M., et al. (2013). "The impact of sleep deprivation on food desire in the human brain." Nature Communications, 4(1), 2259.'
    ],
    keyTakeaways: [
      'Aim for 7.5 - 9 hours of quality sleep for genuine adipose loss.',
      'Sleep deprivation causes hormonal hunger spikes (ghrelin up, leptin down).',
      'Maintain consistent circadian rhythm (sleep and wake times ±30m daily).'
    ]
  },
  {
    id: 'rag-05',
    title: 'Satiety Index, Food Volume, Dietary Fiber, and Caloric Density',
    category: 'macronutrients',
    summary: 'Eating foods with high water content, dietary fiber (>30g/day), and low caloric density (<1.5 kcal/g) allows large food volume and full gastric stretch without excess calories.',
    content: `Gastric mechanoreceptors and vagal nerve stretch signals trigger satiety regardless of the calorie content of the bolus. Volumetrics principles demonstrate that consuming foods with low caloric density (vegetables, berries, potatoes, legumes, lean poultry, soups) satisfies appetite with a fraction of the caloric load.
    The Satiety Index (Holt et al., 1995) ranked boiled potatoes as the highest satiety food (score 323%), compared to white bread (baseline 100%), croissants (47%), and confectionery.
    Soluble dietary fiber (pectin, beta-glucan, psyllium) delays gastric emptying rate and ferments into short-chain fatty acids (SCFAs: acetate, propionate, butyrate) in the colon, stimulating endocrine L-cells to release GLP-1 and PYY. Aiming for 14g of fiber per 1,000 kcal consumed (minimum 28-35g/day for adults) significantly stabilizes postprandial glycemic excursions.`,
    citations: [
      'Holt, S. H., et al. (1995). "A satiety index of common foods." European Journal of Clinical Nutrition, 49(9), 675-690.',
      'Rolls, B. J. (2010). "Plenary Lecture 1: Dietary strategies for the prevention and treatment of obesity." Proceedings of the Nutrition Society, 69(1), 70-79.',
      'Slavin, J. L. (2005). "Dietary fiber and body weight." Nutrition, 21(3), 411-418.'
    ],
    keyTakeaways: [
      'Fill half the plate with fibrous, non-starchy vegetables at lunch and dinner.',
      'Target 30-40g of dietary fiber daily from whole food sources.',
      'Drink 500ml of water 15-30 minutes prior to main meals to enhance fullness.'
    ]
  },
  {
    id: 'rag-06',
    title: 'Behavioral Psychology: Habit Loops, Implementation Intentions, and Adherence',
    category: 'behavioral_psychology',
    summary: 'Long-term weight loss success relies on habit stacking, friction reduction, environmental design, and proactive coping plans (if-then statements).',
    content: `Diet adherence is the single strongest predictor of 12-month weight loss across all macronutrient paradigms (low-carb, low-fat, Mediterranean). The psychological barrier is not lack of knowledge, but cognitive fatigue and willpower depletion.
    Key behavioral frameworks proven in clinical weight management:
    1. Implementation Intentions (Gollwitzer): Structuring specific trigger-action plans: "IF [Situation X occurs, e.g., social dinner out], THEN [I will order sparkling water with lime and prioritize lean protein with double vegetables]." This automates decisions and decreases emotional relapse by up to 65%.
    2. Environmental Choice Architecture: Removing hyper-palatable snacks from the immediate visual field (pantry placement) and prepping grab-and-go protein snacks (boiled eggs, Greek yogurt, pre-cut celery).
    3. Habit Stacking: Anchoring new habits to existing fixed routines (e.g., "After I pour my morning coffee, I will drink 500ml of water and review my scheduled workout in Google Calendar").
    4. Flexible Restraint vs Rigid Restraint: Rigid "all-or-nothing" eating patterns correlate with higher binge frequency, whereas flexible 80/20 nutrient density approaches yield superior long-term psychological sustainability.`,
    citations: [
      'Gollwitzer, P. M., & Sheeran, P. (2006). "Implementation intentions and goal achievement: A meta-analysis of effects and processes." Advances in Experimental Social Psychology, 38, 69-119.',
      'Dansinger, M. L., et al. (2005). "Comparison of the Atkins, Ornish, Weight Watchers, and Zone diets for weight loss and heart disease risk reduction: a randomized trial." JAMA, 293(1), 43-53.',
      'Stewart, T. M., et al. (2002). "Rigid vs. flexible dieting: association with eating disorder symptoms in nonobese women." Appetite, 38(1), 39-44.'
    ],
    keyTakeaways: [
      'Build "If-Then" implementation plans for high-risk eating scenarios.',
      'Adopt the 80/20 rule: 80% whole nutrient-dense foods, 20% flexible preference.',
      'Schedule workouts on your calendar as non-negotiable appointments.'
    ]
  },
  {
    id: 'rag-07',
    title: 'Hydration Kinetics and Electrolyte Balance in Fat Oxidation',
    category: 'metabolism',
    summary: 'Consuming 35-45 mL of water per kg of body weight enhances lipolysis, reduces false hunger signaling, and maintains physical performance during caloric deficits.',
    content: `Lipolysis (the biochemical breakdown of triglycerides into glycerol and free fatty acids) is a hydrolytic reaction that requires water molecules. Mild dehydration (1-2% loss of body weight) reduces cellular enzymatic efficiency, impairs carbohydrate oxidation during exercise, and diminishes mitochondrial function.
    Thirst signals are frequently misinterpreted by the hypothalamus as hunger, prompting snacking. Pre-meal water preloading (500 mL 30 minutes prior to meals) was shown in randomized controlled trials to increase 12-week weight loss by 44% compared to non-preloaded groups.
    Electrolytes (Sodium, Potassium, Magnesium): During initial caloric restriction or lower-carbohydrate protocols, glycogen depletion releases bound water (~3-4g water per gram of glycogen) alongside rapid renal sodium excretion. Adequate electrolyte replenishment prevents fatigue, lethargy, and muscle cramps.`,
    citations: [
      'Dennis, E. A., et al. (2010). "Water consumption increases weight loss during a hypocaloric diet intervention in middle-aged and older adults." Obesity, 18(2), 300-307.',
      'Stookey, J. D., et al. (2008). "Drinking water is associated with weight loss in overweight dieting women independent of diet and activity." Obesity, 16(11), 2481-2488.',
      'Boschmann, M., et al. (2003). "Water-induced thermogenesis." The Journal of Clinical Endocrinology & Metabolism, 88(12), 6015-6019.'
    ],
    keyTakeaways: [
      'Target 3.0 - 3.7 Liters (men) or 2.5 - 3.0 Liters (women) of total fluids daily.',
      'Pre-load with 500 mL water 15-30 min before meals to boost satiety.',
      'Maintain electrolyte balance to sustain high exercise output.'
    ]
  },
  {
    id: 'rag-08',
    title: 'Evidence-Based Supplements: Creatine, Caffeine, and Micronutrients for Weight Management',
    category: 'supplements',
    summary: 'Creatine monohydrate, caffeine (3-6 mg/kg), and essential micronutrients (Vitamin D3, Omega-3s) provide genuine ergogenic and metabolic support during cutting phases.',
    content: `While caloric deficit is the primary driver of weight loss, specific evidence-backed supplements support training intensity and health:
    1. Creatine Monohydrate (3-5g daily): Maximizes phosphocreatine stores in skeletal muscle, allowing preservation of strength, power output, and intracellular hydration during a deficit. Note: transient 1-2kg intracellular water gain is common and non-adipose.
    2. Caffeine (100-200mg or 3mg/kg): Increases metabolic rate by 3-5% via sympathetic nervous system stimulation, elevates free fatty acid mobilization, and reduces Rate of Perceived Exertion (RPE) during training. Avoid within 8 hours of bedtime to protect sleep architecture.
    3. Whey / Plant Protein Isolate: High bioavailability convenience source to hit daily protein thresholds with minimal co-ingested fats or carbohydrates.
    4. Vitamin D3 & Omega-3 Fatty Acids: Supports immune function, decreases systemic inflammation, and optimizes endocrine synthesis during caloric restriction.`,
    citations: [
      'Kreider, R. B., et al. (2017). "International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine." JISSN, 14(1), 18.',
      'Grgic, J., et al. (2019). "Wake up and smell the coffee: caffeine supplementation and exercise performance—an umbrella review of 21 published meta-analyses." BJSM, 54(11), 681-688.',
      'Jäger, R., et al. (2017). "International Society of Sports Nutrition Position Stand: protein and exercise." JISSN, 14(1), 20.'
    ],
    keyTakeaways: [
      'Creatine monohydrate 5g/day is safe and preserves muscle strength.',
      'Use caffeine strategically before workouts; cut off 8h before sleep.',
      'Supplements augment a solid nutritional foundation, but do not replace caloric control.'
    ]
  }
];

/**
 * Local Semantic/Keyword Search for RAG Retrieval
 */
export function searchRAGKnowledge(query: string, limit: number = 3): { document: RAGDocument; score: number }[] {
  const queryTokens = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  if (queryTokens.length === 0) {
    return RAG_KNOWLEDGE_BASE.slice(0, limit).map(doc => ({ document: doc, score: 1.0 }));
  }

  const scored = RAG_KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    const titleText = doc.title.toLowerCase();
    const summaryText = doc.summary.toLowerCase();
    const contentText = doc.content.toLowerCase();
    const categoryText = doc.category.toLowerCase();
    const takeawaysText = doc.keyTakeaways.join(' ').toLowerCase();

    for (const token of queryTokens) {
      if (titleText.includes(token)) score += 5;
      if (categoryText.includes(token)) score += 4;
      if (summaryText.includes(token)) score += 3;
      if (takeawaysText.includes(token)) score += 2.5;
      if (contentText.includes(token)) score += 1;
    }

    return { document: doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
