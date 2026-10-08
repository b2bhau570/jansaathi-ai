-- JANSAATHI AI - Migration 006: Seed Deterministic Urgency Rules
-- Description: Standard deterministic review rules with trigger patterns and clinical rationales.
-- Note: These rules flag for priority human review; they NEVER diagnose or prescribe.

INSERT INTO public.urgency_rules (
  rule_code,
  name,
  description,
  priority,
  trigger_conditions,
  rationale,
  version,
  active
) VALUES
(
  'RULE_CHEST_PAIN',
  'Reported Acute Chest Discomfort or Pressure',
  'Patient reports acute, crushing, radiating chest pain, severe chest heaviness, or chest tightness with breathlessness.',
  'URGENT_REVIEW',
  '{"keywords": ["chest pain", "chest pressure", "radiating pain to arm", "crushing pain", "chhati me dard", "buke batha", "chhati re jantrana"], "exclude_minor": false}'::jsonb,
  'Acute chest symptoms require immediate clinical evaluation to assess for acute coronary syndrome, pulmonary embolism, or aortic emergencies.',
  'v1.0.0',
  true
),
(
  'RULE_RESPIRATORY_DISTRESS',
  'Reported Severe Breathing Difficulty',
  'Patient reports acute shortness of breath, gasping, inability to complete full sentences, or blue discoloration (cyanosis).',
  'URGENT_REVIEW',
  '{"keywords": ["cannot breathe", "shortness of breath", "severe breathlessness", "gasping", "saans lene me takleef", "sas phula", "dam attakna"], "vital_threshold": {"spo2_below": 92}}'::jsonb,
  'Respiratory distress indicates potential airway, pulmonary, or cardiac compromise requiring rapid professional airway and oxygenation review.',
  'v1.0.0',
  true
),
(
  'RULE_NEURO_DEFICIT',
  'Acute Neurological Deficit (FAST Signals)',
  'Patient or family reports sudden unilateral weakness, facial asymmetry, slurred speech, or acute loss of consciousness.',
  'URGENT_REVIEW',
  '{"keywords": ["face drooping", "arm weakness", "slurred speech", "sudden paralysis", "bolne me dikkat", "ek taraf kamjori", "behoshi"], "time_sensitive": true}'::jsonb,
  'Acute focal neurological signs carry high time-sensitivity for stroke assessment or intracranial pathology.',
  'v1.0.0',
  true
),
(
  'RULE_UNCONTROLLED_BLEEDING',
  'Active Severe Hemorrhage or Blood Loss',
  'Reported vomiting blood (hematemesis), coughing blood (hemoptysis), or continuous uncontrolled external bleeding.',
  'URGENT_REVIEW',
  '{"keywords": ["vomiting blood", "coughing blood", "blood in stool", "heavy bleeding", "khoon ki ulti", "rakta padiba", "khoon behna"]}'::jsonb,
  'Active severe bleeding carries risk of hypovolemic shock requiring urgent stabilization and source identification.',
  'v1.0.0',
  true
),
(
  'RULE_HIGH_FEVER_LETHARGY',
  'High Fever with Altered Sensorium or Stiff Neck',
  'Reported high fever (>102F / 38.9C) combined with neck stiffness, severe headache, confusion, or inability to wake up.',
  'URGENT_REVIEW',
  '{"keywords": ["fever with confusion", "fever with stiff neck", "high fever cannot wake", "tez bukhar behoshi", "tez jwara"]}'::jsonb,
  'High fever with meningism or altered sensorium demands rapid assessment for central nervous system infection or sepsis.',
  'v1.0.0',
  true
),
(
  'RULE_VITAL_HYPOXIA',
  'Measured Pulse Oximetry Hypoxia',
  'Hardware reading indicates SpO2 below 92% on room air or pulse rate exceeding 130 bpm or below 45 bpm.',
  'URGENT_REVIEW',
  '{"sensor_conditions": [{"metric": "SPO2", "operator": "<", "value": 92}, {"metric": "PULSE_RATE", "operator": ">", "value": 130}, {"metric": "PULSE_RATE", "operator": "<", "value": 45}]}'::jsonb,
  'Objective hypoxemia or extreme hemodynamic rate anomalies indicate physiological distress requiring bedside clinical examination.',
  'v1.0.0',
  true
),
(
  'RULE_ANAPHYLAXIS_SIGNAL',
  'Suspected Acute Allergic Reaction',
  'Reported sudden swelling of lips, tongue, or throat following medication, food, or insect sting with difficulty swallowing or wheezing.',
  'URGENT_REVIEW',
  '{"keywords": ["swollen lips", "swollen tongue", "throat closing", "allergic reaction with wheeze", "galey me sujan"]}'::jsonb,
  'Risk of airway obstruction and anaphylactic shock requiring immediate human clinical review.',
  'v1.0.0',
  true
),
(
  'RULE_PERSISTENT_HIGH_FEVER',
  'Persistent Prolonged Fever (>5 days)',
  'Patient reports fever lasting more than 5 consecutive days without improvement.',
  'PRIORITY_REVIEW',
  '{"keywords": ["fever for week", "fever 5 days", "fever 6 days", "fever 7 days", "ek hafte se bukhar", "dina dhariki jwara"], "duration_days_min": 5}'::jsonb,
  'Prolonged fever requires structured clinical investigation for endemic or localized infectious etiologies.',
  'v1.0.0',
  true
),
(
  'RULE_DIABETIC_FOOT_ULCER',
  'Reported Non-healing Extremity Wound in Diabetes',
  'Patient with history of diabetes reports an open non-healing wound, ulceration, or dark discoloration on foot or toes.',
  'PRIORITY_REVIEW',
  '{"keywords": ["diabetic foot", "wound on toe not healing", "pair me ghav", "sugar wound"], "comorbidity": "diabetes"}'::jsonb,
  'Early specialist assessment prevents progression to deep soft-tissue infection or osteomyelitis.',
  'v1.0.0',
  true
)
ON CONFLICT (rule_code) DO NOTHING;
