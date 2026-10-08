// JANSAATHI AI - Multilingual UI Translation Dictionaries
// Standard clinical terminology across English, Hindi, and Odia with extensible structure.

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  disclaimer: string;
  safetyBanner: string;
  nav: {
    home: string;
    patientPortal: string;
    clinicalQueue: string;
    dashboard: string;
    reports: string;
    referrals: string;
    audit: string;
    admin: string;
    login: string;
    logout: string;
  };
  consent: {
    title: string;
    purpose: string;
    point1: string;
    point2: string;
    point3: string;
    point4: string;
    agreeButton: string;
    declineButton: string;
    mustAgree: string;
  };
  patientInput: {
    selectLanguage: string;
    voiceTab: string;
    textTab: string;
    reportTab: string;
    vitalsTab: string;
    speakPrompt: string;
    listening: string;
    processing: string;
    transcribed: string;
    typePrompt: string;
    typePlaceholder: string;
    uploadPrompt: string;
    vitalsPrompt: string;
    connectSensors: string;
    reviewButton: string;
    speechUnavailableNotice: string;
  };
  review: {
    title: string;
    subtitle: string;
    chiefComplaint: string;
    symptoms: string[];
    duration: string;
    severity: string;
    confirmSubmit: string;
    editInput: string;
  };
  queue: {
    title: string;
    anonymousId: string;
    reportedConcern: string;
    language: string;
    time: string;
    priority: string;
    status: string;
    action: string;
    noCases: string;
  };
}

export const TRANSLATIONS: Record<string, TranslationDictionary> = {
  en: {
    appName: 'JANSAATHI AI',
    tagline: 'Every language. One structured triage note. A qualified human always decides.',
    disclaimer: 'JANSAATHI AI is a triage-support and information-organisation system. It does not diagnose conditions, prescribe treatment or replace assessment by a qualified healthcare professional.',
    safetyBanner: 'Human-in-the-Loop Clinical Triage Architecture',
    nav: {
      home: 'Overview',
      patientPortal: 'Patient Intake',
      clinicalQueue: 'Triage Queue',
      dashboard: 'Dashboard',
      reports: 'Diagnostic Reports',
      referrals: 'Referral Notes',
      audit: 'Audit Trail',
      admin: 'Administration',
      login: 'Staff Login',
      logout: 'Sign Out',
    },
    consent: {
      title: 'Informed Consent for Triage Information Organisation',
      purpose: 'Before collecting your health symptoms, please review how your information will be processed.',
      point1: 'Purpose: Your statements will be organised into a structured summary for a qualified healthcare professional to review.',
      point2: 'No Automated Diagnosis: JANSAATHI AI does not diagnose illnesses, prescribe medication, or provide treatment.',
      point3: 'Human Clinical Decision: A qualified doctor or healthcare worker will examine you and make all clinical decisions.',
      point4: 'Data Privacy: We use anonymous case identifiers. No Aadhaar or unnecessary personal data is requested.',
      agreeButton: 'I Understand and Give Consent',
      declineButton: 'Decline / Exit',
      mustAgree: 'Mandatory consent is required to proceed with triage preparation.',
    },
    patientInput: {
      selectLanguage: 'Choose Preferred Language',
      voiceTab: 'Speak (Voice)',
      textTab: 'Type (Text)',
      reportTab: 'Upload Report',
      vitalsTab: 'Vital Signs',
      speakPrompt: 'Tap microphone and describe what you are experiencing in your language.',
      listening: 'Listening... Speak naturally.',
      processing: 'Processing speech input...',
      transcribed: 'Voice transcribed. You may review and edit below.',
      typePrompt: 'Describe your symptoms, how long you have had them, and any medicines taken.',
      typePlaceholder: 'E.g., I have had fever and severe headache for 3 days...',
      uploadPrompt: 'Attach blood test reports, prescriptions, or investigation slips (JPG, PNG, PDF).',
      vitalsPrompt: 'Connect telemetry device (pulse oximeter, thermometer) via USB or Bluetooth.',
      connectSensors: 'Scan & Connect Telemetry',
      reviewButton: 'Review Extracted Summary',
      speechUnavailableNotice: 'Voice recognition is unavailable for this language or browser. You can continue with text input.',
    },
    review: {
      title: 'Review What Was Understood',
      subtitle: 'Please verify the details below before sending to the clinical review queue.',
      chiefComplaint: 'Primary Presenting Concern',
      symptoms: [],
      duration: 'Reported Duration',
      severity: 'Reported Intensity',
      confirmSubmit: 'Confirm & Send for Doctor Review',
      editInput: 'Make Corrections',
    },
    queue: {
      title: 'Clinical Triage Review Queue',
      anonymousId: 'Case ID',
      reportedConcern: 'Presenting Concern',
      language: 'Language',
      time: 'Arrival Time',
      priority: 'Review Priority',
      status: 'Status',
      action: 'Action',
      noCases: 'No cases currently require review.',
    },
  },
  hi: {
    appName: 'जनसाथी AI',
    tagline: 'हर भाषा। एक व्यवस्थित ट्राइएज नोट। निर्णय हमेशा योग्य चिकित्सक का।',
    disclaimer: 'जनसाथी AI एक सूचना-संगठन एवं ट्राइएज-सहायक प्रणाली है। यह किसी रोग का निदान नहीं करता, दवा नहीं लिखता और न ही चिकित्सक का विकल्प है।',
    safetyBanner: 'मानव-समीक्षित क्लिनिकल ट्राइएज प्रणाली',
    nav: {
      home: 'मुख्य पृष्ठ',
      patientPortal: 'मरीज पंजीकरण',
      clinicalQueue: 'ट्राइएज कतार',
      dashboard: 'डैशबोर्ड',
      reports: 'जांच रिपोर्ट',
      referrals: 'रेफरल नोट',
      audit: 'ऑडिट लॉग',
      admin: 'प्रशासन',
      login: 'स्टाफ लॉगिन',
      logout: 'लॉगआउट',
    },
    consent: {
      title: 'ट्राइएज सूचना संगठन हेतु सूचित सहमति',
      purpose: 'अपने स्वास्थ्य लक्षणों की जानकारी देने से पूर्व कृपया समझें कि इसका उपयोग कैसे होगा।',
      point1: 'उद्देश्य: आपकी बताई गई जानकारी को व्यवस्थित कर एक डॉक्टर के अवलोकन हेतु तैयार किया जाता है।',
      point2: 'निदान नहीं: जनसाथी AI बीमारी की पहचान नहीं करता और न ही कोई दवा बताता है।',
      point3: 'चिकित्सक का निर्णय: एक योग्य डॉक्टर आपकी जांच कर अंतिम चिकित्सकीय निर्णय लेंगे।',
      point4: 'डेटा गोपनीयता: हम केवल अनाम केस संख्या उपयोग करते हैं। आधार कार्ड की आवश्यकता नहीं है।',
      agreeButton: 'मैं सहमत हूँ और सहमति देता/देती हूँ',
      declineButton: 'अस्वीकार करें',
      mustAgree: 'आगे बढ़ने के लिए सहमति अनिवार्य है।',
    },
    patientInput: {
      selectLanguage: 'भाषा चुनें',
      voiceTab: 'बोलकर बताएं',
      textTab: 'लिखकर बताएं',
      reportTab: 'रिपोर्ट अपलोड करें',
      vitalsTab: 'वाइटल रीडिंग',
      speakPrompt: 'माइक दबाएं और अपनी भाषा में बताएं कि आपको क्या समस्या है।',
      listening: 'सुन रहे हैं... कृपया स्पष्ट बोलें।',
      processing: 'आवाज़ का विश्लेषण हो रहा है...',
      transcribed: 'आवाज़ दर्ज हो गई। नीचे समीक्षा कर सुधार सकते हैं।',
      typePrompt: 'अपनी बीमारी के लक्षण, कितने दिनों से हैं और ली गई दवाओं का विवरण लिखें।',
      typePlaceholder: 'उदा. मुझे 3 दिनों से तेज़ बुखार और सिरदर्द है...',
      uploadPrompt: 'खून की जांच या डॉक्टर की पुरानी पर्ची अपलोड करें।',
      vitalsPrompt: 'पल्स ऑक्सीमीटर या थर्मामीटर कनेक्ट करें।',
      connectSensors: 'डिवाइस कनेक्ट करें',
      reviewButton: 'तैयार सारांश देखें',
      speechUnavailableNotice: 'इस भाषा के लिए वॉयस इनपुट वर्तमान में अनुपलब्ध है। कृपया लिखकर जानकारी दें।',
    },
    review: {
      title: 'दर्ज की गई जानकारी की समीक्षा',
      subtitle: 'डॉक्टर के पास भेजने से पहले कृपया सुनिश्चित करें कि जानकारी सही समझी गई है।',
      chiefComplaint: 'मुख्य समस्या',
      symptoms: [],
      duration: 'कितने दिनों से',
      severity: 'तीव्रता',
      confirmSubmit: 'पुष्टि करें और डॉक्टर को भेजें',
      editInput: 'संशोधन करें',
    },
    queue: {
      title: 'क्लिनिकल ट्राइएज कतार',
      anonymousId: 'केस आईडी',
      reportedConcern: 'मुख्य शिकायत',
      language: 'भाषा',
      time: 'पंजीकरण समय',
      priority: 'प्राथमिकता',
      status: 'स्थिति',
      action: 'समीक्षा करें',
      noCases: 'वर्तमान में समीक्षा हेतु कोई केस लंबित नहीं है।',
    },
  },
  or: {
    appName: 'ଜନସାଥୀ AI',
    tagline: 'ପ୍ରତ୍ୟେକ ଭାଷା। ଗୋଟିଏ ଟ୍ରାଏଜ୍ ନୋଟ୍। ନିଷ୍ପତ୍ତି ସର୍ବଦା ଯୋଗ୍ୟ ଡାକ୍ତରଙ୍କର।',
    disclaimer: 'ଜନସାଥୀ AI ଏକ ତଥ୍ୟ-ସଂଗଠନ ଏବଂ ଟ୍ରାଏଜ୍-ସହାୟକ ପ୍ରଣାଳୀ। ଏହା କୌଣସି ରୋଗର ଚିକିତ୍ସା କରେ ନାହିଁ କିମ୍ବା ଡାକ୍ତରଙ୍କ ବିକଳ୍ପ ନୁହେଁ।',
    safetyBanner: 'ମାନବ ନିରୀକ୍ଷିତ କ୍ଲିନିକାଲ୍ ଟ୍ରାଏଜ୍ ସିଷ୍ଟମ୍',
    nav: {
      home: 'ପ୍ରମୁଖ',
      patientPortal: 'ରୋଗୀ ପଞ୍ଜୀକରଣ',
      clinicalQueue: 'ଟ୍ରାଏଜ୍ ତାଲିକା',
      dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
      reports: 'ରିପୋର୍ଟ',
      referrals: 'ରେଫରାଲ୍',
      audit: 'ଅଡିଟ୍ ଟ୍ରେଲ୍',
      admin: 'ପ୍ରଶାସନ',
      login: 'ଲଗଇନ୍',
      logout: 'ଲଗଆଉଟ୍',
    },
    consent: {
      title: 'ଟ୍ରାଏଜ୍ ସୂଚନା ସଂଗ୍ରହ ନିମନ୍ତେ ସୂଚିତ ସମ୍ମତି',
      purpose: 'ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା ବିବରଣୀ ଦେବା ପୂର୍ବରୁ ଏହା କିପରି ବ୍ୟବହାର ହେବ ତାହା ବୁଝନ୍ତୁ।',
      point1: 'ଉଦ୍ଦେଶ୍ୟ: ଆପଣଙ୍କ ବିବରଣୀକୁ ଡାକ୍ତରଙ୍କ ସମୀକ୍ଷା ପାଇଁ ଏକ ସୁବ୍ୟବସ୍ଥିତ ନୋଟ୍ ପ୍ରସ୍ତୁତ କରାଯିବ।',
      point2: 'ନିଦାନ ନୁହେଁ: ଜନସାଥୀ AI କୌଣସି ରୋଗ ଚିହ୍ନଟ କରେ ନାହିଁ କିମ୍ବା ଔଷଧ ସୁପାରିଶ କରେ ନାହିଁ।',
      point3: 'ଡାକ୍ତରଙ୍କ ନିଷ୍ପତ୍ତି: ଯୋଗ୍ୟ ଡାକ୍ତର ପରୀକ୍ଷା କରି ଚିକିତ୍ସା ସମ୍ବନ୍ଧୀୟ ନିଷ୍ପତ୍ତି ନେବେ।',
      point4: 'ଗୋପନୀୟତା: ଆମେ କେବଳ ଗୋପନୀୟ କେସ୍ ଆଇଡି ବ୍ୟବହାର କରୁଛୁ। ଆଧାର କାର୍ଡ ଆବଶ୍ୟକ ନାହିଁ।',
      agreeButton: 'ମୁଁ ବୁଝିଲି ଏବଂ ସମ୍ମତି ଦେଉଛି',
      declineButton: 'ଅସ୍ୱୀକାର',
      mustAgree: 'ଟ୍ରାଏଜ୍ ସେବା ପାଇଁ ସମ୍ମତି ବାଧ୍ୟତାମୂଳକ।',
    },
    patientInput: {
      selectLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
      voiceTab: 'କହିବା (Voice)',
      textTab: 'ଲେଖିବା (Text)',
      reportTab: 'ରିପୋର୍ଟ ଅପଲୋଡ୍',
      vitalsTab: 'ଭାଇଟାଲ୍ସ',
      speakPrompt: 'ମାଇକ୍ରୋଫୋନ ଦବାନ୍ତୁ ଏବଂ ନିଜ ସମସ୍ୟା ବିଷୟରେ କୁହନ୍ତୁ।',
      listening: 'ଶୁଣୁଛି...',
      processing: 'ବିଶ୍ଳେଷଣ ଚାଲିଛି...',
      transcribed: 'ଲିପିବଦ୍ଧ ହେଲା।',
      typePrompt: 'ଆପଣଙ୍କ ସମସ୍ୟା, କେତେ ଦିନରୁ ହେଉଛି ତାହା ଲେଖନ୍ତୁ।',
      typePlaceholder: 'ଉଦାହରଣ: ମୋତେ ୩ ଦିନ ହେଲା ପ୍ରବଳ ଜ୍ୱର ହେଉଛି...',
      uploadPrompt: 'ଡାକ୍ତରୀ ରିପୋର୍ଟ କିମ୍ବା ପୁରୁଣା ପ୍ରେସକ୍ରିପସନ୍ ଅପଲୋଡ୍ କରନ୍ତୁ।',
      vitalsPrompt: 'ପଲସ ଅକ୍ସିମିଟର ବା ଥର୍ମାମିଟର ସଂଯୋଗ କରନ୍ତୁ।',
      connectSensors: 'ଡିଭାଇସ୍ ସଂଯୋଗ',
      reviewButton: 'ସାରାଂଶ ଯାଞ୍ଚ କରନ୍ତୁ',
      speechUnavailableNotice: 'ଏହି ଭାଷା ପାଇଁ ଭଏସ୍ ଇନପୁଟ୍ ଉପଲବ୍ଧ ନାହିଁ। ଦୟାକରି ଲେଖିକରି ଜଣାନ୍ତୁ।',
    },
    review: {
      title: 'ବିବରଣୀ ସମୀକ୍ଷା',
      subtitle: 'ଡାକ୍ତରଙ୍କ ନିକଟକୁ ପଠାଇବା ପୂର୍ବରୁ ସୂଚନା ଯାଞ୍ଚ କରନ୍ତୁ।',
      chiefComplaint: 'ମୁଖ୍ୟ ସମସ୍ୟା',
      symptoms: [],
      duration: 'କେତେ ଦିନ',
      severity: 'ତୀବ୍ରତା',
      confirmSubmit: 'ପୁଷ୍ଟିକରଣ ଏବଂ ଡାକ୍ତରଙ୍କୁ ପ୍ରେରଣ',
      editInput: 'ସଂଶୋଧନ',
    },
    queue: {
      title: 'କ୍ଲିନିକାଲ୍ ଟ୍ରାଏଜ୍ ତାଲିକା',
      anonymousId: 'କେସ୍ ଆଇଡି',
      reportedConcern: 'ସମସ୍ୟା',
      language: 'ଭାଷା',
      time: 'ସମୟ',
      priority: 'ପ୍ରାଥମିକତା',
      status: 'ସ୍ଥିତି',
      action: 'ସମୀକ୍ଷା',
      noCases: 'ସମୀକ୍ଷା ପାଇଁ କୌଣସି କେସ୍ ବାକି ନାହିଁ।',
    },
  },
};
