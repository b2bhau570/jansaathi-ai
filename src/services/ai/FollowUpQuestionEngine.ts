// JANSAATHI AI - Follow-up Question Engine
// Generates non-leading, strictly informational clinical questions to clarify missing gaps.
// Multilingual support across English, Hindi, and Odia.

import { MissingGap } from './MissingInformationEngine';

export interface ClinicalFollowUpQuestion {
  id: string;
  category: string;
  question: string;
  placeholder: string;
  quickOptions?: string[];
}

export class FollowUpQuestionEngine {
  public static generateQuestions(
    gaps: MissingGap[],
    chiefComplaint: string,
    lang: string = 'en',
    aiGeneratedQuestions?: string[]
  ): ClinicalFollowUpQuestion[] {
    const list: ClinicalFollowUpQuestion[] = [];
    const language = lang.toLowerCase();

    // 1. Process deterministic gaps
    for (const gap of gaps) {
      if (gap.status === 'PATIENT_DID_NOT_PROVIDE' || gap.status === 'NEEDS_VERIFICATION') {
        switch (gap.category) {
          case 'DURATION':
            list.push({
              id: 'q-duration',
              category: 'DURATION',
              question:
                language === 'hi'
                  ? 'यह लक्षण कब से शुरू हुए हैं, और क्या यह लगातार बने हुए हैं?'
                  : language === 'or'
                  ? 'ଏହି ଲକ୍ଷଣ କେବେଠାରୁ ଆରମ୍ଭ ହେଲା, ଏବଂ ଏହା ନିରନ୍ତର ରହୁଛି କି?'
                  : 'When did the symptoms begin, and have they been continuous or coming and going?',
              placeholder:
                language === 'hi' ? 'उदा. 2 दिन से लगातार...' : language === 'or' ? 'ଯେପରିକି ୨ ଦିନ ହେବ...' : 'e.g. Started 2 days ago...',
              quickOptions:
                language === 'hi'
                  ? ['आज से शुरू हुआ', '2-3 दिन से', 'एक हफ्ते से अधिक']
                  : language === 'or'
                  ? ['ଆଜିଠାରୁ ଆରମ୍ଭ', '୨-୩ ଦିନ ହେବ', 'ଏକ ସପ୍ତାହରୁ ଅଧିକ']
                  : ['Started today', '2-3 days ago', 'More than a week ago'],
            });
            break;

          case 'SEVERITY':
            list.push({
              id: 'q-severity',
              category: 'SEVERITY',
              question:
                language === 'hi'
                  ? 'आप अपनी तकलीफ की तीव्रता को कैसे बताएंगे: हल्की, मध्यम या बहुत तेज?'
                  : language === 'or'
                  ? 'ଆପଣଙ୍କ କଷ୍ଟର ତୀବ୍ରତା କିପରି ଅନୁଭବ ହେଉଛି: ସାମାନ୍ୟ, ମଧ୍ୟମ କିମ୍ବା ବହୁତ ବେଶି?'
                  : 'How would you describe the current intensity: mild, moderate, or severe?',
              placeholder:
                language === 'hi' ? 'हल्की, मध्यम, या बहुत तेज...' : language === 'or' ? 'ସାମାନ୍ୟ, ମଧ୍ୟମ କିମ୍ବା ବେଶି...' : 'Mild, moderate, or severe...',
              quickOptions:
                language === 'hi'
                  ? ['हल्की (सहनशील)', 'मध्यम', 'बहुत तेज / गंभीर']
                  : language === 'or'
                  ? ['ସାମାନ୍ୟ', 'ମଧ୍ୟମ', 'ବହୁତ କଷ୍ଟ / ଗୁରୁତର']
                  : ['Mild (Manageable)', 'Moderate', 'Severe / Intolerable'],
            });
            break;

          case 'MEDICATIONS':
            list.push({
              id: 'q-medications',
              category: 'MEDICATIONS',
              question:
                language === 'hi'
                  ? 'क्या आपने इसके लिए कोई दवा, पैरासिटामोल या घरेलू नुस्खा लिया है?'
                  : language === 'or'
                  ? 'ଆପଣ ଏଥିପାଇଁ କୌଣସି ଔଷଧ, ପାରାସିଟାମୋଲ କିମ୍ବା ଘରୋଇ ଉପଚାର ନେଇଛନ୍ତି କି?'
                  : 'Have you taken any medicines, paracetamol, or home remedies for this?',
              placeholder:
                language === 'hi' ? 'दवा का नाम या विवरण...' : language === 'or' ? 'ଔଷଧର ନାମ...' : 'Medicine names or dosages taken...',
              quickOptions:
                language === 'hi'
                  ? ['पैरासिटामोल ली है', 'घरेलू काढ़ा/चाय ली', 'कोई दवा नहीं ली']
                  : language === 'or'
                  ? ['ପାରାସିଟାମୋଲ ନେଇଛି', 'ଘରୋଇ ଉପଚାର', 'କୌଣସି ଔଷଧ ନାହିଁ']
                  : ['Took Paracetamol', 'Home remedies only', 'No medicines taken'],
            });
            break;

          case 'ALLERGIES':
            list.push({
              id: 'q-allergies',
              category: 'ALLERGIES',
              question:
                language === 'hi'
                  ? 'क्या आपको किसी दवा, इंजेक्शन या खाद्य पदार्थ से कोई एलर्जी है?'
                  : language === 'or'
                  ? 'ଆପଣଙ୍କର କୌଣସି ଔଷଧ କିମ୍ବା ଖାଦ୍ୟ ପ୍ରତି ଏଲର୍ଜି ଅଛି କି?'
                  : 'Do you have any known allergies to medicines, injections, or food?',
              placeholder:
                language === 'hi' ? 'एलर्जी का विवरण...' : language === 'or' ? 'ଏଲର୍ଜି ବିବରଣୀ...' : 'Describe any allergies...',
              quickOptions:
                language === 'hi'
                  ? ['कोई एलर्जी नहीं है', 'दवा से एलर्जी है', 'धूल/खाने से एलर्जी']
                  : language === 'or'
                  ? ['କୌଣସି ଏଲର୍ଜି ନାହିଁ', 'ଔଷଧରୁ ଏଲର୍ଜି ଅଛି', 'ଅନ୍ୟ ଏଲର୍ଜି']
                  : ['No known allergies', 'Allergic to specific drugs', 'Food/Dust allergy'],
            });
            break;

          case 'MEDICAL_HISTORY':
            list.push({
              id: 'q-history',
              category: 'MEDICAL_HISTORY',
              question:
                language === 'hi'
                  ? 'क्या आपको ब्लड प्रेशर, शुगर/डायबिटीज, या दिल-फेफड़ों की पुरानी बीमारी है?'
                  : language === 'or'
                  ? 'ଆପଣଙ୍କର ବିପି, ମଧୁମେହ (ସୁଗାର) କିମ୍ବା ଅନ୍ୟ କୌଣସି ପୁରୁଣା ରୋଗ ଅଛି କି?'
                  : 'Do you have known high blood pressure, diabetes, heart disease, or chronic conditions?',
              placeholder:
                language === 'hi' ? 'पुरानी बीमारियों का विवरण...' : language === 'or' ? 'ରୋଗ ବିବରଣୀ...' : 'Existing conditions...',
              quickOptions:
                language === 'hi'
                  ? ['कोई पुरानी बीमारी नहीं', 'हाई ब्लड प्रेशर (BP)', 'शुगर / डायबिटीज']
                  : language === 'or'
                  ? ['କୌଣସି ପୁରୁଣା ରୋଗ ନାହିଁ', 'ବିପି (BP)', 'ମଧୁମେହ (ସୁଗାର)']
                  : ['None / Healthy', 'Hypertension (BP)', 'Diabetes / Sugar'],
            });
            break;

          default:
            break;
        }
      }
    }

    // 2. Add AI contextual questions if present and not redundant
    if (aiGeneratedQuestions && aiGeneratedQuestions.length > 0) {
      aiGeneratedQuestions.slice(0, 2).forEach((aiQ, idx) => {
        if (!list.some((existing) => existing.question.toLowerCase().includes(aiQ.toLowerCase().slice(0, 15)))) {
          list.push({
            id: `q-ai-${idx}`,
            category: 'SPECIFIC_SYMPTOM',
            question: aiQ,
            placeholder: language === 'hi' ? 'उत्तर यहाँ लिखें या बोलें...' : 'Your answer...',
          });
        }
      });
    }

    // 3. Symptom-specific fallback if list has space
    const ccLower = chiefComplaint.toLowerCase();
    if (list.length < 3) {
      if (ccLower.includes('fever') || ccLower.includes('bukhar') || ccLower.includes('jwara')) {
        list.push({
          id: 'q-fever-symptoms',
          category: 'ASSOCIATED_SYMPTOMS',
          question:
            language === 'hi'
              ? 'क्या बुखार के साथ कंपकंपी, ठंड लगना, या पेशाब में जलन महसूस हुई?'
              : language === 'or'
              ? 'ଜ୍ୱର ସହିତ କମ୍ପ, ଶୀତ କିମ୍ବା ପରିସ୍ରାରେ ଜଳାପୋଡ଼ା ଅଛି କି?'
              : 'Was there any shivering, chills, body rash, or burning sensation during urination?',
          placeholder: 'Yes / No or details...',
          quickOptions: language === 'hi' ? ['हाँ, ठंड लग रही है', 'नहीं, केवल बुखार'] : ['Yes, with chills', 'No chills'],
        });
      } else if (ccLower.includes('cough') || ccLower.includes('khansi') || ccLower.includes('kasa')) {
        list.push({
          id: 'q-cough-type',
          category: 'ASSOCIATED_SYMPTOMS',
          question:
            language === 'hi'
              ? 'क्या खांसी सूखी है या बलगम/कफ आ रहा है? सांस फूलने की समस्या है?'
              : language === 'or'
              ? 'କାଶ ଶୁଖିଲା କି କଫ ବାହାରୁଛି? ଶ୍ୱାସକ୍ରିୟାରେ କଷ୍ଟ ଅଛି କି?'
              : 'Is the cough dry or producing phlegm? Has there been any shortness of breath?',
          placeholder: 'Dry / Phlegm details...',
          quickOptions: language === 'hi' ? ['सूखी खांसी है', 'कफ/बलगम आ रहा है'] : ['Dry cough', 'With phlegm'],
        });
      }
    }

    // Return the top 3-4 most helpful questions
    return list.slice(0, 4);
  }
}
