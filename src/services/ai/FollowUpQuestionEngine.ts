// JANSAATHI AI - Follow-up Question Engine
// Generates non-leading, strictly informational questions for the health worker to clarify gaps.
// NEVER produces questions that lead a patient toward a specific diagnosis.

import { MissingGap } from './MissingInformationEngine';

export class FollowUpQuestionEngine {
  public static generateQuestions(gaps: MissingGap[], chiefComplaint: string): string[] {
    const questions: string[] = [];

    for (const gap of gaps) {
      if (gap.status === 'PATIENT_DID_NOT_PROVIDE' || gap.status === 'NEEDS_VERIFICATION') {
        switch (gap.category) {
          case 'DURATION':
            questions.push('When did the symptoms begin, and have they been continuous or intermittent?');
            break;
          case 'SEVERITY':
            questions.push('On a scale of mild, moderate, or severe, how would the patient describe the current intensity?');
            break;
          case 'MEDICATIONS':
            questions.push('Has the patient taken any home remedies, paracetamol, antibiotics, or prescribed medicines for this?');
            break;
          case 'ALLERGIES':
            questions.push('Does the patient have any known allergies to penicillin, sulfa drugs, or other medications?');
            break;
          case 'VITALS':
            questions.push('Can peripheral oxygen saturation (SpO2), heart rate, and body temperature be measured at this time?');
            break;
          case 'MEDICAL_HISTORY':
            questions.push('Does the patient have known high blood pressure, diabetes, heart disease, or lung conditions?');
            break;
          default:
            break;
        }
      }
    }

    // Specific symptom-based objective clarifying questions
    const ccLower = chiefComplaint.toLowerCase();
    if (ccLower.includes('fever') || ccLower.includes('bukhar') || ccLower.includes('jwara')) {
      questions.push('Was there any associated shivering, chills, rash, or burning sensation during urination?');
    }
    if (ccLower.includes('cough') || ccLower.includes('khansi') || ccLower.includes('kasa')) {
      questions.push('Is the cough dry or producing phlegm? Has there been any blood noticed?');
    }
    if (ccLower.includes('stomach') || ccLower.includes('pet dard') || ccLower.includes('vomit')) {
      questions.push('When did the patient last consume food or water, and is there any vomiting or loose stools?');
    }

    return questions.slice(0, 5); // Concise limit
  }
}
