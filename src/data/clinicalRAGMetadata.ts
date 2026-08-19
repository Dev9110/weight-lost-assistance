import { ClinicalRAGGuideline } from '../types';

export const CLINICAL_RAG_GUIDELINES: ClinicalRAGGuideline[] = [
  {
    id: "weight-001",
    source: "NHLBI Aim for a Healthy Weight",
    organization: "NIH",
    topic: "weight_management",
    keywords: [
      "weight loss",
      "BMI",
      "body mass index",
      "calorie deficit",
      "obesity",
      "overweight"
    ],
    population: [
      "adults"
    ],
    evidence_level: "government_guideline",
    year: 2025,
    page: 18,
    document_url: "https://www.nhlbi.nih.gov/health/educational/lose_wt/",
    knowledge_summary: "Aim for a Healthy Weight is NHLBI's core patient guide to assessing and managing body weight. It defines a healthy BMI range of 18.5-24.9 for adults, explains BMI and waist circumference measurement, and frames weight loss around a calorie deficit achieved through reduced energy intake and increased physical activity. It recommends an initial goal of losing 5-10% of body weight over about 6 months, since even modest weight loss meaningfully lowers risk of heart disease, type 2 diabetes, and hypertension.",
    recommended_actions: [
      "Calculate your BMI and waist circumference to establish a baseline",
      "Set an initial weight-loss goal of 5-10% of body weight over about 6 months",
      "Combine reduced calorie intake with regular physical activity rather than dieting alone",
      "Track food intake and activity to support gradual, sustainable change"
    ],
    related_topics: [
      "physical_activity",
      "nutrition",
      "cardiovascular_health"
    ],
    when_to_seek_care: "Consult a healthcare provider before starting a weight-loss program if you have an existing condition such as diabetes or heart disease, or take medications that affect appetite or metabolism.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "weight-002",
    source: "Are You at a Healthy Weight? Fact Sheet",
    organization: "NIH / NHLBI",
    topic: "weight_management",
    keywords: [
      "BMI",
      "waist circumference",
      "weight risk assessment",
      "overweight",
      "obesity"
    ],
    population: [
      "adults"
    ],
    evidence_level: "government_guideline",
    year: 2022,
    page: 3,
    document_url: "https://www.nhlbi.nih.gov/resources/are-you-healthy-weight",
    knowledge_summary: "This NHLBI fact sheet helps adults self-assess weight-related health risk using BMI (healthy 18.5-24.9; overweight 25-29.9; obese 30+) and waist circumference, where over 35 inches in women or 40 inches in men signals higher heart disease and type 2 diabetes risk even at a 'normal' BMI. Losing 5-10% of body weight over ~6 months meaningfully improves blood pressure, blood glucose, and blood lipids.",
    recommended_actions: [
      "Measure your waist circumference in addition to tracking BMI",
      "Treat a waist over 35in (women) / 40in (men) as an added risk signal even if BMI looks normal",
      "Pair dietary changes with regular physical activity rather than relying on either alone"
    ],
    related_topics: [
      "weight_management",
      "cardiovascular_health",
      "diabetes_management"
    ],
    when_to_seek_care: "See a provider for a full cardiometabolic risk assessment if waist circumference is elevated, regardless of BMI.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "physact-001",
    source: "Physical Activity Guidelines for Americans, 2nd Edition",
    organization: "HHS / ODPHP",
    topic: "physical_activity",
    keywords: [
      "exercise",
      "aerobic activity",
      "muscle strengthening",
      "moderate intensity",
      "vigorous intensity",
      "move more sit less"
    ],
    population: [
      "adults"
    ],
    evidence_level: "government_guideline",
    year: 2018,
    page: 55,
    document_url: "https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines",
    knowledge_summary: "The federal Physical Activity Guidelines recommend 150-300 minutes/week of moderate-intensity aerobic activity, or 75-150 minutes/week of vigorous activity (or an equivalent mix), plus muscle-strengthening activity for all major muscle groups at least 2 days/week. Any amount of movement is better than none, and short bouts throughout the day count toward the weekly total.",
    recommended_actions: [
      "Aim for 150-300 min/week moderate aerobic activity, or 75-150 min/week vigorous activity",
      "Add muscle-strengthening activity at least 2 days/week",
      "Break up long periods of sitting with light movement throughout the day",
      "If currently inactive, start with any amount of movement rather than aiming for the full target immediately"
    ],
    related_topics: [
      "weight_management",
      "cardiovascular_health",
      "diabetes_management"
    ],
    when_to_seek_care: "Check with a doctor before starting vigorous exercise if you have heart disease, use insulin, or have a condition affected by exertion.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "physact-002",
    source: "Physical Activity Guidelines for Americans, 2nd Edition (Youth Chapter)",
    organization: "HHS / ODPHP",
    topic: "physical_activity",
    keywords: [
      "children exercise",
      "youth physical activity",
      "active play",
      "muscle bone strengthening"
    ],
    population: [
      "children_adolescents"
    ],
    evidence_level: "government_guideline",
    year: 2018,
    page: 41,
    document_url: "https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines",
    knowledge_summary: "Children ages 6-17 should get at least 60 minutes/day of moderate-to-vigorous aerobic activity, including muscle- and bone-strengthening activity at least 3 days/week. Preschoolers (3-5 years) should be active throughout the day, with at least 3 hours/day of active play encouraged.",
    recommended_actions: [
      "Encourage at least 60 minutes/day of active play or sport for school-age children",
      "Include bone- and muscle-strengthening activity at least 3 days/week",
      "For preschoolers, aim for roughly 3 hours/day of light-to-vigorous active play"
    ],
    related_topics: [
      "physical_activity",
      "weight_management"
    ],
    when_to_seek_care: "Consult a pediatrician if a child has a medical condition that may limit activity type or intensity.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "diabetes-001",
    source: "Guiding Principles for the Care of People With or at Risk for Diabetes",
    organization: "NIH / NIDDK",
    topic: "diabetes_management",
    keywords: [
      "diabetes care",
      "glycemic control",
      "blood sugar management",
      "type 2 diabetes",
      "type 1 diabetes",
      "A1C"
    ],
    population: [
      "adults",
      "people_with_diabetes"
    ],
    evidence_level: "government_guideline",
    year: 2018,
    page: 12,
    document_url: "https://www.niddk.nih.gov/health-information/professionals/diabetes-discoveries-practice/guiding-principles-care-people-diabetes",
    knowledge_summary: "NIDDK does not issue its own clinical guideline; this document synthesizes common agreement across major diabetes guidelines to help primary care providers. Core themes: individualized glycemic (A1C) targets, patient-centered shared decision-making, regular complication screening (eyes, kidneys, nerves, cardiovascular risk), and lifestyle change as first-line therapy alongside any medication.",
    recommended_actions: [
      "Work with your care team to set an individualized A1C / blood glucose target",
      "Get regular screening for eye, kidney, and nerve complications, plus cardiovascular risk",
      "Prioritize diet and activity changes as first-line management alongside any prescribed medication",
      "Participate actively in shared decision-making about your treatment plan"
    ],
    related_topics: [
      "nutrition",
      "physical_activity",
      "sleep_health",
      "diabetes_sleep_comorbidity",
      "cardiovascular_health"
    ],
    when_to_seek_care: "Seek prompt care for signs of very high blood sugar (excessive thirst, frequent urination, blurred vision) or very low blood sugar (shakiness, confusion, sweating), and get an annual comprehensive diabetes checkup.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "diabetes-002",
    source: "ADA Standards of Care in Diabetes, 2025 (Lifestyle Management)",
    organization: "American Diabetes Association",
    topic: "diabetes_management",
    keywords: [
      "diabetes diet",
      "exercise for diabetes",
      "continuous glucose monitoring",
      "CGM",
      "resistance training",
      "carbohydrate intake",
      "weight management diabetes"
    ],
    population: [
      "adults",
      "people_with_diabetes"
    ],
    evidence_level: "clinical_practice_guideline",
    year: 2025,
    page: null,
    document_url: "https://professional.diabetes.org/standards-of-care",
    knowledge_summary: "The ADA's annually updated Standards of Care provides actionable day-to-day diabetes self-management guidance. Nutrition: favor nutrient-dense foods (vegetables, fruits, legumes, whole grains) and water over sugary drinks; non-nutritive sweeteners acceptable in moderation. Activity: combine aerobic exercise with weight-bearing and resistance training, and reduce sedentary time; resistance training is emphasized for those on weight-management medication or after metabolic surgery. Continuous glucose monitoring (CGM) is now recommended for adults with type 2 diabetes on non-insulin glucose-lowering agents. Intensive lifestyle programs targeting 5-7% weight loss are recommended for cardiometabolic benefit. Sleep is placed on equal footing with diet and exercise as a management pillar, and recreational cannabis use is advised against.",
    recommended_actions: [
      "Build meals around vegetables, fruits, legumes, and whole grains; choose water over sugary drinks",
      "Combine aerobic exercise with resistance/strength training at least 2 days/week",
      "Ask your doctor whether continuous glucose monitoring (CGM) fits your treatment plan",
      "If weight loss is a goal, target 5-7% reduction via combined diet, activity, and behavioral support",
      "Treat consistent, sufficient sleep as a core part of diabetes management, not an afterthought",
      "Avoid recreational cannabis use due to diabetes-specific risks"
    ],
    related_topics: [
      "nutrition",
      "physical_activity",
      "weight_management",
      "sleep_health",
      "diabetes_sleep_comorbidity"
    ],
    when_to_seek_care: "Individualize these recommendations with your diabetes care team, especially before starting CGM, new exercise regimens, or medication changes; seek urgent care for severe hypo/hyperglycemia symptoms.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "nutrition-001",
    source: "Healthy Diet Fact Sheet",
    organization: "WHO",
    topic: "nutrition",
    keywords: [
      "healthy eating",
      "fruits vegetables",
      "balanced diet",
      "sodium",
      "added sugar",
      "saturated fat"
    ],
    population: [
      "general_population"
    ],
    evidence_level: "international_guideline",
    year: 2020,
    page: 1,
    document_url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
    knowledge_summary: "WHO's healthy diet guidance rests on adequacy, diversity, balance, and moderation: at least 400g fruit/vegetables per day; carbohydrates 40-70% of energy (preferably whole grains, legumes); total fat under 30% of energy with saturated fat under 10% and trans fat eliminated or under 1%; free sugars under 10% of energy (under 5% for added benefit); sodium under 2g/day with adequate potassium; exclusive breastfeeding to 6 months for infants.",
    recommended_actions: [
      "Eat at least 400g (about 5 servings) of fruits and vegetables daily",
      "Favor whole grains, legumes, and vegetables for carbohydrate intake",
      "Limit saturated and trans fat; use polyunsaturated/monounsaturated fats instead",
      "Keep added/free sugar under 10% of daily calories, and sodium under 2g/day"
    ],
    related_topics: [
      "weight_management",
      "cardiovascular_health",
      "diabetes_management"
    ],
    when_to_seek_care: "Consult a registered dietitian for a personalized eating plan if managing a chronic condition like diabetes or hypertension.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "nutrition-002",
    source: "Guideline: Sugars Intake for Adults and Children",
    organization: "WHO",
    topic: "nutrition",
    keywords: [
      "added sugar",
      "free sugars",
      "sugar intake",
      "dental caries",
      "sugar-sweetened beverages"
    ],
    population: [
      "general_population"
    ],
    evidence_level: "international_guideline",
    year: 2015,
    page: 4,
    document_url: "https://www.who.int/publications/i/item/9789241549028",
    knowledge_summary: "WHO strongly recommends free sugars make up less than 10% of total daily energy intake for adults and children, with a conditional recommendation to reduce further to under 5% for additional benefits, particularly reduced dental caries and excess weight gain risk.",
    recommended_actions: [
      "Limit free/added sugars to under 10% of daily calories; aim for under 5% for extra benefit",
      "Replace sugar-sweetened beverages with water or unsweetened options",
      "Check nutrition labels for added sugar content, not just 'total sugars'"
    ],
    related_topics: [
      "nutrition",
      "weight_management",
      "diabetes_management"
    ],
    when_to_seek_care: "Not applicable — general dietary guidance; discuss individualized sugar/carbohydrate targets with a provider if managing diabetes.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "hypertension-001",
    source: "Your Guide to Lowering Your Blood Pressure with DASH",
    organization: "NIH / NHLBI",
    topic: "hypertension",
    keywords: [
      "blood pressure",
      "DASH diet",
      "sodium reduction",
      "hypertension diet",
      "high blood pressure"
    ],
    population: [
      "adults",
      "people_with_hypertension"
    ],
    evidence_level: "government_guideline",
    year: 2006,
    page: 20,
    document_url: "https://www.nhlbi.nih.gov/education/dash-eating-plan",
    knowledge_summary: "The DASH eating plan is a clinically-tested NHLBI diet shown to lower blood pressure. It emphasizes fruits, vegetables, whole grains, low-fat dairy, and moderate fish/poultry/nuts, while limiting red meat, sweets, sugary drinks, and sodium (a lower-sodium version caps intake at 1,500mg/day vs. the standard 2,300mg/day).",
    recommended_actions: [
      "Follow the DASH pattern: emphasize fruits, vegetables, whole grains, and low-fat dairy",
      "Limit sodium to 2,300mg/day, or 1,500mg/day for greater blood pressure reduction",
      "Reduce red meat, sweets, and sugar-sweetened beverages"
    ],
    related_topics: [
      "nutrition",
      "cardiovascular_health",
      "weight_management"
    ],
    when_to_seek_care: "Monitor blood pressure regularly and consult a provider if readings are consistently at or above 130/80 mmHg.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "mentalhealth-001",
    source: "Depression",
    organization: "NIH / NIMH",
    topic: "mental_health",
    keywords: [
      "depression",
      "mental health",
      "mood disorder",
      "cognitive behavioral therapy",
      "antidepressant",
      "suicidal thoughts",
      "fatigue",
      "low mood"
    ],
    population: [
      "adults"
    ],
    evidence_level: "government_guideline",
    year: 2024,
    page: 5,
    document_url: "https://www.nimh.nih.gov/health/topics/depression",
    knowledge_summary: "NIMH describes major depressive disorder symptoms (persistent sadness, loss of interest, sleep/appetite changes, fatigue, poor concentration, feelings of worthlessness) lasting 2+ weeks and impairing daily functioning. Evidence-based treatments include psychotherapy (e.g., CBT), antidepressant medication, and brain stimulation therapies for treatment-resistant cases. Depression is highly treatable, and early help-seeking improves outcomes.",
    recommended_actions: [
      "Track mood, sleep, and energy symptoms if low mood persists 2+ weeks",
      "Reach out to a mental health professional to discuss therapy and/or medication options",
      "Maintain routine sleep, activity, and social connection as supportive measures alongside treatment"
    ],
    related_topics: [
      "sleep_health",
      "diabetes_management"
    ],
    when_to_seek_care: "Seek immediate help (call or text 988 in the US) for any thoughts of self-harm or suicide.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "sleep-001",
    source: "Sleep and Sleep Disorders: Tips for Better Sleep",
    organization: "CDC",
    topic: "sleep_health",
    keywords: [
      "sleep hygiene",
      "sleep tips",
      "bedtime routine",
      "sleep duration",
      "sleep quality",
      "general sleep advice"
    ],
    population: [
      "general_population"
    ],
    evidence_level: "government_guideline",
    year: 2022,
    page: 2,
    document_url: "https://www.cdc.gov/sleep/about/index.html",
    knowledge_summary: "CDC sleep hygiene guidance: keep a consistent sleep/wake schedule (including weekends); keep the bedroom cool (60-68F), dark, and quiet; remove electronic devices from the bedroom; avoid large meals, caffeine, nicotine, and alcohol close to bedtime. Recommended adult sleep duration is 7+ hours per night. Note: sleep hygiene tips like these support general sleep quality but are NOT considered sufficient as a standalone treatment for a diagnosed chronic insomnia disorder (see AASM guideline).",
    recommended_actions: [
      "Keep a consistent sleep and wake time, including weekends",
      "Keep the bedroom cool, dark, and quiet, and remove electronic devices",
      "Avoid caffeine, nicotine, and alcohol for several hours before bed",
      "Get 7 or more hours of sleep per night as an adult"
    ],
    related_topics: [
      "insomnia_management",
      "mental_health",
      "diabetes_sleep_comorbidity"
    ],
    when_to_seek_care: "If poor sleep persists beyond a few weeks despite good sleep habits, or involves loud snoring/gasping (possible sleep apnea), consult a healthcare provider or sleep specialist rather than relying on hygiene tips alone.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "insomnia-001",
    source: "Behavioral and Psychological Treatments for Chronic Insomnia Disorder in Adults",
    organization: "American Academy of Sleep Medicine",
    topic: "insomnia_management",
    keywords: [
      "insomnia",
      "CBT-I",
      "cognitive behavioral therapy for insomnia",
      "trouble sleeping",
      "difficulty falling asleep",
      "chronic insomnia",
      "sleep restriction therapy",
      "stimulus control therapy"
    ],
    population: [
      "adults"
    ],
    evidence_level: "clinical_practice_guideline",
    year: 2021,
    page: 255,
    document_url: "https://aasm.org/clinical-resources/practice-standards/practice-guidelines/",
    knowledge_summary: "This AASM clinical practice guideline (Journal of Clinical Sleep Medicine, 2021) strongly recommends multicomponent Cognitive Behavioral Therapy for Insomnia (CBT-I) as first-line treatment for chronic insomnia disorder in adults, ranking it above medication. CBT-I combines stimulus control, sleep restriction therapy, cognitive restructuring, and relaxation training. Single-component therapies (stimulus control, sleep restriction, relaxation) are conditionally recommended as alternatives when multicomponent CBT-I isn't accessible. Notably, the guideline conditionally recommends AGAINST using sleep hygiene education alone as a treatment, since evidence shows it is not effective as a standalone therapy for diagnosed chronic insomnia.",
    recommended_actions: [
      "For diagnosed chronic insomnia (3+ nights/week for 3+ months), seek CBT-I as first-line treatment rather than sleep hygiene tips alone",
      "Ask a healthcare provider about referral to a CBT-I trained therapist or a reputable telehealth/app-based CBT-I program",
      "Understand that general sleep hygiene advice supports good sleep overall but does not substitute for CBT-I in a clinical insomnia disorder",
      "Discuss sleep medication with a provider only as a secondary option if CBT-I is unavailable or insufficient"
    ],
    related_topics: [
      "sleep_health",
      "mental_health",
      "diabetes_sleep_comorbidity"
    ],
    when_to_seek_care: "If sleep difficulty occurs 3+ nights/week for 3+ months and impairs daytime functioning, this meets criteria for chronic insomnia disorder — see a healthcare provider or sleep medicine specialist.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "diabetes-sleep-001",
    source: "Sleep and Diabetes: How They Are Connected (evidence synthesis)",
    organization: "Synthesized from NIH/NIDDK, CDC, and sleep-research sources",
    topic: "diabetes_sleep_comorbidity",
    keywords: [
      "diabetes and sleep",
      "insomnia diabetes",
      "blood sugar sleep",
      "sleep apnea diabetes",
      "nocturia",
      "insulin resistance sleep deprivation"
    ],
    population: [
      "adults",
      "people_with_diabetes"
    ],
    evidence_level: "evidence_synthesis",
    year: 2024,
    page: null,
    document_url: "https://www.niddk.nih.gov/health-information/diabetes",
    knowledge_summary: "Sleep and diabetes have a bidirectional relationship. Insufficient sleep (regularly under 7 hours) or fragmented sleep reduces insulin sensitivity by an estimated 20-30% and impairs glucose tolerance. Conversely, diabetes disrupts sleep: high blood sugar causes nocturia (frequent nighttime urination), peripheral neuropathy can cause nighttime leg pain/cramps, and blood sugar swings (highs or lows) can cause nighttime awakenings. Obstructive sleep apnea (OSA) affects an estimated 50-66% of people with type 2 diabetes; its intermittent oxygen drops and sleep fragmentation further worsen insulin resistance, reinforcing the cycle. Insomnia specifically has been associated with higher fasting blood glucose and increased future diabetes risk. NOTE: this entry synthesizes findings across multiple NIH-affiliated and research sources rather than quoting a single official publication — verify against a primary NIDDK/CDC clinical page before treating it as an authoritative standalone citation.",
    recommended_actions: [
      "If you have diabetes and trouble sleeping, raise both with your doctor together — they are often connected, not separate issues",
      "Ask about screening for obstructive sleep apnea (OSA) if you snore, wake up gasping, or feel excessively tired despite adequate time in bed",
      "Track whether nighttime blood sugar swings are what's waking you, and discuss adjusting monitoring or medication timing with your care team",
      "Prioritize consistent, sufficient sleep (7+ hours) as a direct lever for better insulin sensitivity and glucose control",
      "If nocturia is disrupting sleep, discuss blood sugar control and evening fluid timing with your provider"
    ],
    related_topics: [
      "diabetes_management",
      "sleep_health",
      "insomnia_management"
    ],
    when_to_seek_care: "See a doctor if you have diabetes and experience loud snoring, gasping during sleep, excessive daytime sleepiness, or if sleep problems and blood sugar control seem to be worsening together.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "cancer-001",
    source: "Breast Cancer: Screening (Final Recommendation Statement)",
    organization: "USPSTF",
    topic: "cancer_screening",
    keywords: [
      "breast cancer screening",
      "mammography",
      "cancer prevention"
    ],
    population: [
      "women_40_74"
    ],
    evidence_level: "clinical_practice_guideline",
    year: 2024,
    page: 1,
    document_url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening",
    knowledge_summary: "USPSTF gives a Grade B recommendation for biennial screening mammography in women aged 40-74, lowering the starting age from the prior individualized 40-49 guidance due to rising incidence in younger women and to help address racial disparities in mortality. For women 75+, and for supplemental screening in women with dense breasts, evidence is currently insufficient to weigh benefits versus harms.",
    recommended_actions: [
      "Women aged 40-74 should get a screening mammogram every 2 years",
      "Discuss individualized screening timing/frequency with a provider if you have dense breasts or additional risk factors",
      "Discuss with a provider whether continued screening past age 75 makes sense for you"
    ],
    related_topics: [
      "cancer_screening"
    ],
    when_to_seek_care: "Schedule a mammogram appointment through a primary care provider or OB/GYN; seek prompt evaluation for any new breast lump or change.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "alcohol-001",
    source: "Rethinking Drinking: Alcohol and Your Health",
    organization: "NIH / NIAAA",
    topic: "alcohol_use",
    keywords: [
      "alcohol use",
      "standard drink",
      "drinking guidelines",
      "risky drinking"
    ],
    population: [
      "adults"
    ],
    evidence_level: "government_guideline",
    year: 2022,
    page: 8,
    document_url: "https://www.rethinkingdrinking.niaaa.nih.gov/",
    knowledge_summary: "NIAAA defines a standard drink as 14 grams (0.6 fl oz) of pure alcohol and provides tools to assess and reduce risky drinking. The 2025-2030 Dietary Guidelines for Americans moved away from sex-specific numeric drink limits (1/day women, 2/day men) toward general advice to 'drink less for better health,' reflecting evidence that no level of alcohol consumption is fully risk-free.",
    recommended_actions: [
      "Know what counts as one standard drink (14g pure alcohol) to track intake accurately",
      "Aim to drink less overall rather than relying on an old numeric daily limit",
      "Use a self-assessment tool (e.g., Rethinking Drinking website) if unsure whether your drinking pattern is risky"
    ],
    related_topics: [
      "cardiovascular_health",
      "mental_health"
    ],
    when_to_seek_care: "Talk to a provider if you find it hard to cut back, or if alcohol is affecting sleep, mood, blood sugar control, or relationships.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "immunization-001",
    source: "Recommended Adult Immunization Schedule",
    organization: "CDC / ACIP",
    topic: "immunization",
    keywords: [
      "vaccines",
      "immunization schedule",
      "influenza vaccine",
      "COVID-19 vaccine",
      "pneumococcal",
      "RSV vaccine"
    ],
    population: [
      "adults"
    ],
    evidence_level: "government_guideline",
    year: 2025,
    page: 4,
    document_url: "https://www.cdc.gov/vaccines/hcp/imz-schedules/adult-age.html",
    knowledge_summary: "The CDC/ACIP adult immunization schedule is updated annually. Recent updates include trivalent influenza vaccines (high-dose/adjuvanted preferred for immunocompromised adults); at least 1 dose of the current COVID-19 vaccine for adults 19+ (2+ doses for 65+ or immunocompromised); pneumococcal vaccination age lowered from 65 to 50; updated meningococcal B schedules; and RSV vaccination recommended for adults 75+ (risk-based for 60-74).",
    recommended_actions: [
      "Check the current CDC adult immunization schedule annually for updates relevant to your age and health conditions",
      "Adults 50+ should discuss pneumococcal vaccination with their provider",
      "Adults with diabetes or other chronic conditions should confirm they're up to date on influenza, COVID-19, and pneumococcal vaccines, as these increase infection risk"
    ],
    related_topics: [
      "immunization",
      "diabetes_management"
    ],
    when_to_seek_care: "Consult a primary care provider or pharmacist to confirm which vaccines you're due for based on age and health history.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "cvhealth-001",
    source: "Life's Essential 8: Cardiovascular Health Scoring",
    organization: "American Heart Association",
    topic: "cardiovascular_health",
    keywords: [
      "cardiovascular health",
      "heart health score",
      "blood pressure",
      "cholesterol",
      "blood glucose",
      "BMI",
      "nicotine",
      "sleep health"
    ],
    population: [
      "general_population"
    ],
    evidence_level: "professional_association_guideline",
    year: 2022,
    page: 10,
    document_url: "https://www.heart.org/en/healthy-living/healthy-lifestyle/lifes-essential-8",
    knowledge_summary: "AHA's Life's Essential 8 framework defines cardiovascular health via 4 behaviors (diet, physical activity, avoiding nicotine, sleep health) and 4 factors (BMI, blood lipids, blood glucose, blood pressure), each scored 0-100 with an unweighted average composite score. It explicitly incorporates social determinants of health and psychological wellbeing as contextual factors.",
    recommended_actions: [
      "Track all 8 metrics (diet, activity, nicotine avoidance, sleep, BMI, lipids, glucose, blood pressure) as a holistic cardiovascular health check, not just one at a time",
      "Recognize that sleep health is now formally part of cardiovascular risk, not a separate wellness topic",
      "Use the composite score concept to identify your weakest area and focus improvement efforts there"
    ],
    related_topics: [
      "diabetes_management",
      "sleep_health",
      "nutrition",
      "physical_activity"
    ],
    when_to_seek_care: "Ask your provider for your cardiovascular risk metrics (blood pressure, lipids, glucose) at your next checkup to calculate where you stand.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "nutrition-003",
    source: "Dietary Guidelines for Americans, 2025-2030",
    organization: "HHS / USDA",
    topic: "nutrition",
    keywords: [
      "dietary guidelines",
      "alcohol guidance",
      "nutrient-dense foods"
    ],
    population: [
      "general_population"
    ],
    evidence_level: "government_guideline",
    year: 2026,
    page: 25,
    document_url: "https://www.dietaryguidelines.gov/",
    knowledge_summary: "The 2025-2030 Dietary Guidelines continue promoting nutrient-dense eating patterns (vegetables, fruits, whole grains, lean protein, low-fat dairy) while limiting added sugar, saturated fat, and sodium. A key change: alcohol guidance dropped sex-specific numeric drink limits in favor of general 'drink less alcohol for better health' advice.",
    recommended_actions: [
      "Build meals around vegetables, fruits, whole grains, lean protein, and low-fat dairy",
      "Limit added sugar, saturated fat, and sodium per current federal targets",
      "Note the updated, more conservative alcohol guidance if you currently drink"
    ],
    related_topics: [
      "nutrition",
      "alcohol_use",
      "weight_management"
    ],
    when_to_seek_care: "Discuss a personalized eating pattern with a dietitian if managing a chronic condition.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "physact-003",
    source: "WHO Guidelines on Physical Activity and Sedentary Behaviour",
    organization: "WHO",
    topic: "physical_activity",
    keywords: [
      "physical activity guidelines",
      "sedentary behavior",
      "older adults balance training"
    ],
    population: [
      "general_population",
      "older_adults"
    ],
    evidence_level: "international_guideline",
    year: 2020,
    page: 15,
    document_url: "https://www.who.int/publications/i/item/9789240015128",
    knowledge_summary: "WHO recommends 150-300 min/week moderate or 75-150 min/week vigorous aerobic activity for adults, plus muscle-strengthening 2+ days/week. Older adults should add multicomponent activity emphasizing balance and strength on 3+ days/week to reduce fall risk. Limiting sedentary time and replacing it with any-intensity activity provides benefits.",
    recommended_actions: [
      "Meet the same aerobic activity targets as the US guidelines (150-300 min/week moderate, or 75-150 min/week vigorous)",
      "Older adults: add balance and strength-focused activity 3+ days/week to reduce fall risk",
      "Replace sedentary time with any-intensity movement whenever possible"
    ],
    related_topics: [
      "physical_activity",
      "weight_management",
      "cardiovascular_health"
    ],
    when_to_seek_care: "Consult a provider before starting a new exercise program if you have mobility limitations or chronic conditions.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  },
  {
    id: "weight-003",
    source: "Aim for a Healthy Weight: Keep an Eye on Portion Size",
    organization: "NIH / NHLBI",
    topic: "weight_management",
    keywords: [
      "portion control",
      "serving size",
      "calorie control"
    ],
    population: [
      "adults"
    ],
    evidence_level: "government_guideline",
    year: 2014,
    page: 1,
    document_url: "https://www.nhlbi.nih.gov/health/educational/lose_wt/eat/portion.htm",
    knowledge_summary: "This NHLBI pocket resource helps estimate portion sizes using everyday object comparisons (e.g., 3oz meat = a deck of cards; 1 cup vegetables = a baseball), supporting calorie control while shopping, cooking, or dining out.",
    recommended_actions: [
      "Use hand/object comparisons to estimate portion sizes when a scale isn't available",
      "Be extra mindful of portions when dining out, where servings are often larger than a standard serving size"
    ],
    related_topics: [
      "weight_management",
      "nutrition"
    ],
    when_to_seek_care: "Not applicable — general practical tool.",
    medical_disclaimer: "This content is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Do not rely on it as the sole basis for a clinical decision. Always consult a qualified healthcare provider about your specific health situation, especially before changing diet, exercise, sleep, or medication routines.",
    last_verified_date: "2026-08-19"
  }
];

/**
 * Searches and scores clinical guidelines based on input query, symptoms, and preferences.
 */
export function searchClinicalGuidelines(
  query: string,
  options?: {
    topic?: string;
    population?: string;
    limit?: number;
  }
): { guideline: ClinicalRAGGuideline; score: number }[] {
  const limit = options?.limit ?? 5;
  const targetTopic = options?.topic;
  const targetPopulation = options?.population;

  const rawTokens = (query || '').toLowerCase().split(/[\s,./?!;:()]+/).filter(t => t.length > 2);

  const scored = CLINICAL_RAG_GUIDELINES.map((guide) => {
    let score = 0;

    if (targetTopic && targetTopic !== 'all' && guide.topic === targetTopic) {
      score += 10;
    }

    if (targetPopulation && guide.population.includes(targetPopulation)) {
      score += 3;
    }

    const keywordsText = guide.keywords.join(' ').toLowerCase();
    const sourceText = guide.source.toLowerCase();
    const orgText = guide.organization.toLowerCase();
    const topicText = guide.topic.toLowerCase();
    const summaryText = guide.knowledge_summary.toLowerCase();
    const actionsText = guide.recommended_actions.join(' ').toLowerCase();
    const seekCareText = guide.when_to_seek_care.toLowerCase();

    for (const token of rawTokens) {
      if (keywordsText.includes(token)) score += 6;
      if (topicText.includes(token)) score += 5;
      if (sourceText.includes(token)) score += 4;
      if (orgText.includes(token)) score += 3;
      if (actionsText.includes(token)) score += 2.5;
      if (summaryText.includes(token)) score += 2;
      if (seekCareText.includes(token)) score += 2;
    }

    // Special clinical synonym matching
    if (query.toLowerCase().includes('insomnia') || query.toLowerCase().includes('trouble sleeping') || query.toLowerCase().includes('can\'t sleep')) {
      if (guide.id === 'insomnia-001' || guide.id === 'sleep-001' || guide.id === 'diabetes-sleep-001') {
        score += 8;
      }
    }
    if (query.toLowerCase().includes('blood pressure') || query.toLowerCase().includes('hypertension') || query.toLowerCase().includes('dizzy')) {
      if (guide.id === 'hypertension-001' || guide.id === 'cvhealth-001') {
        score += 8;
      }
    }
    if (query.toLowerCase().includes('diabetes') || query.toLowerCase().includes('sugar') || query.toLowerCase().includes('glucose') || query.toLowerCase().includes('a1c')) {
      if (guide.id === 'diabetes-001' || guide.id === 'diabetes-002' || guide.id === 'diabetes-sleep-001') {
        score += 8;
      }
    }
    if (query.toLowerCase().includes('tired') || query.toLowerCase().includes('fatigue') || query.toLowerCase().includes('exhausted')) {
      if (guide.id === 'sleep-001' || guide.id === 'diabetes-sleep-001' || guide.id === 'mentalhealth-001') {
        score += 6;
      }
    }
    if (query.toLowerCase().includes('weight') || query.toLowerCase().includes('bmi') || query.toLowerCase().includes('fat loss') || query.toLowerCase().includes('calorie')) {
      if (guide.id === 'weight-001' || guide.id === 'weight-002' || guide.id === 'weight-003') {
        score += 7;
      }
    }

    return { guideline: guide, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
