export type Lang =
  | "en"
  | "hi"
  | "ta"
  | "te"
  | "bn"
  | "mr"
  | "gu"
  | "kn";

export const LANGUAGES: { code: Lang; native: string; english: string }[] = [
  { code: "en", native: "English", english: "English" },
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "ta", native: "தமிழ்", english: "Tamil" },
  { code: "te", native: "తెలుగు", english: "Telugu" },
  { code: "bn", native: "বাংলা", english: "Bengali" },
  { code: "mr", native: "मराठी", english: "Marathi" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada" },
];

export interface Strings {
  chooseLanguage: string;
  chooseLanguageSub: string;
  welcome: string;
  welcomeSub: string;
  begin: string;
  detailsTitle: string;
  fullName: string;
  namePlaceholder: string;
  dob: string;
  tob: string;
  place: string;
  placePlaceholder: string;
  generate: string;
  calculating: string;
  back: string;
  pickPlace: string;
  // menu + matchmaking (optional: fall back to English)
  menuTitle?: string;
  menuSub?: string;
  svcKundli?: string;
  svcKundliDesc?: string;
  svcMatch?: string;
  svcMatchDesc?: string;
  svcPalm?: string;
  svcPalmDesc?: string;
  svcFace?: string;
  svcTarot?: string;
  comingSoon?: string;
  groom?: string;
  bride?: string;
  matchBtn?: string;
  matching?: string;
  palmTitle?: string;
  palmSub?: string;
  palmUpload?: string;
  palmAnalyzing?: string;
  palmRetake?: string;
}

const MENU_EN = {
  menuTitle: "What would you like to explore?",
  menuSub: "Choose a path. More are on the way.",
  svcKundli: "Kundli & Dasha",
  svcKundliDesc: "Your full Vedic birth chart, planets, dashas & reading",
  svcMatch: "Match Making",
  svcMatchDesc: "Ashtakoota Guna Milan — bride & groom compatibility",
  svcPalm: "Palm Reading",
  svcPalmDesc: "Upload a photo of your palm for a hast rekha reading",
  svcFace: "Face Reading",
  svcTarot: "Tarot Reading",
  comingSoon: "Coming soon",
  groom: "Groom's details",
  bride: "Bride's details",
  matchBtn: "Check compatibility",
  matching: "Matching the stars…",
  palmTitle: "Palm Reading · Hast Rekha",
  palmSub: "Take or upload a clear photo of your open right palm. Good, even light and all lines visible gives the best reading.",
  palmUpload: "Choose or capture palm photo",
  palmAnalyzing: "Reading the lines of your hand…",
  palmRetake: "Try another photo",
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    chooseLanguage: "Choose your language",
    chooseLanguageSub: "The cosmos speaks every tongue",
    welcome: "Welcome",
    welcomeSub: "Let the stars reveal the map you were born under.",
    begin: "Begin my journey",
    detailsTitle: "Tell us about your birth",
    fullName: "Full name",
    namePlaceholder: "Your name",
    dob: "Date of birth",
    tob: "Time of birth",
    place: "Place of birth",
    placePlaceholder: "Start typing a city…",
    generate: "Reveal my chart",
    calculating: "Aligning the planets…",
    back: "Back",
    pickPlace: "Please pick your birth place from the list.",
  },
  hi: {
    chooseLanguage: "अपनी भाषा चुनें",
    chooseLanguageSub: "ब्रह्मांड हर भाषा बोलता है",
    welcome: "स्वागत है",
    welcomeSub: "तारे आपके जन्म का नक्शा प्रकट करें।",
    begin: "मेरी यात्रा शुरू करें",
    detailsTitle: "अपने जन्म के बारे में बताएं",
    fullName: "पूरा नाम",
    namePlaceholder: "आपका नाम",
    dob: "जन्म तिथि",
    tob: "जन्म समय",
    place: "जन्म स्थान",
    placePlaceholder: "शहर टाइप करना शुरू करें…",
    generate: "मेरी कुंडली देखें",
    calculating: "ग्रहों को संरेखित किया जा रहा है…",
    back: "वापस",
    pickPlace: "कृपया सूची से अपना जन्म स्थान चुनें।",
  },
  ta: {
    chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    chooseLanguageSub: "பிரபஞ்சம் அனைத்து மொழிகளையும் பேசுகிறது",
    welcome: "வரவேற்கிறோம்",
    welcomeSub: "நட்சத்திரங்கள் உங்கள் பிறப்பு வரைபடத்தை வெளிப்படுத்தட்டும்.",
    begin: "என் பயணத்தைத் தொடங்கு",
    detailsTitle: "உங்கள் பிறப்பு பற்றி கூறுங்கள்",
    fullName: "முழு பெயர்",
    namePlaceholder: "உங்கள் பெயர்",
    dob: "பிறந்த தேதி",
    tob: "பிறந்த நேரம்",
    place: "பிறந்த இடம்",
    placePlaceholder: "நகரத்தைத் தட்டச்சு செய்யத் தொடங்குங்கள்…",
    generate: "என் ஜாதகத்தைக் காட்டு",
    calculating: "கிரகங்கள் சீரமைக்கப்படுகின்றன…",
    back: "பின்",
    pickPlace: "பட்டியலில் இருந்து உங்கள் பிறந்த இடத்தைத் தேர்வுசெய்க.",
  },
  te: {
    chooseLanguage: "మీ భాషను ఎంచుకోండి",
    chooseLanguageSub: "విశ్వం అన్ని భాషలను మాట్లాడుతుంది",
    welcome: "స్వాగతం",
    welcomeSub: "నక్షత్రాలు మీ జన్మ పటాన్ని వెల్లడించనివ్వండి.",
    begin: "నా ప్రయాణం ప్రారంభించు",
    detailsTitle: "మీ జన్మ గురించి చెప్పండి",
    fullName: "పూర్తి పేరు",
    namePlaceholder: "మీ పేరు",
    dob: "పుట్టిన తేదీ",
    tob: "పుట్టిన సమయం",
    place: "పుట్టిన స్థలం",
    placePlaceholder: "నగరాన్ని టైప్ చేయడం ప్రారంభించండి…",
    generate: "నా జాతకం చూపించు",
    calculating: "గ్రహాలను సమలేఖనం చేస్తోంది…",
    back: "వెనుకకు",
    pickPlace: "దయచేసి జాబితా నుండి మీ జన్మ స్థలాన్ని ఎంచుకోండి.",
  },
  bn: {
    chooseLanguage: "আপনার ভাষা নির্বাচন করুন",
    chooseLanguageSub: "মহাবিশ্ব সব ভাষায় কথা বলে",
    welcome: "স্বাগতম",
    welcomeSub: "তারারা আপনার জন্মের মানচিত্র প্রকাশ করুক।",
    begin: "আমার যাত্রা শুরু করি",
    detailsTitle: "আপনার জন্ম সম্পর্কে বলুন",
    fullName: "পুরো নাম",
    namePlaceholder: "আপনার নাম",
    dob: "জন্ম তারিখ",
    tob: "জন্ম সময়",
    place: "জন্মস্থান",
    placePlaceholder: "একটি শহর টাইপ করুন…",
    generate: "আমার কুণ্ডলী দেখান",
    calculating: "গ্রহগুলি সারিবদ্ধ হচ্ছে…",
    back: "পিছনে",
    pickPlace: "তালিকা থেকে আপনার জন্মস্থান নির্বাচন করুন।",
  },
  mr: {
    chooseLanguage: "तुमची भाषा निवडा",
    chooseLanguageSub: "विश्व सर्व भाषा बोलते",
    welcome: "स्वागत आहे",
    welcomeSub: "तारे तुमच्या जन्माचा नकाशा उघड करोत.",
    begin: "माझा प्रवास सुरू करा",
    detailsTitle: "तुमच्या जन्माबद्दल सांगा",
    fullName: "पूर्ण नाव",
    namePlaceholder: "तुमचे नाव",
    dob: "जन्म तारीख",
    tob: "जन्म वेळ",
    place: "जन्म ठिकाण",
    placePlaceholder: "शहर टाइप करायला सुरुवात करा…",
    generate: "माझी कुंडली पहा",
    calculating: "ग्रह संरेखित होत आहेत…",
    back: "मागे",
    pickPlace: "कृपया यादीतून तुमचे जन्म ठिकाण निवडा.",
  },
  gu: {
    chooseLanguage: "તમારી ભાષા પસંદ કરો",
    chooseLanguageSub: "બ્રહ્માંડ બધી ભાષાઓ બોલે છે",
    welcome: "સ્વાગત છે",
    welcomeSub: "તારાઓ તમારા જન્મનો નકશો પ્રગટ કરે.",
    begin: "મારી યાત્રા શરૂ કરો",
    detailsTitle: "તમારા જન્મ વિશે જણાવો",
    fullName: "પૂરું નામ",
    namePlaceholder: "તમારું નામ",
    dob: "જન્મ તારીખ",
    tob: "જન્મ સમય",
    place: "જન્મ સ્થળ",
    placePlaceholder: "શહેર ટાઇપ કરવાનું શરૂ કરો…",
    generate: "મારી કુંડળી જુઓ",
    calculating: "ગ્રહો ગોઠવાઈ રહ્યા છે…",
    back: "પાછળ",
    pickPlace: "કૃપા કરીને સૂચિમાંથી તમારું જન્મ સ્થળ પસંદ કરો.",
  },
  kn: {
    chooseLanguage: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆರಿಸಿ",
    chooseLanguageSub: "ಬ್ರಹ್ಮಾಂಡ ಎಲ್ಲಾ ಭಾಷೆಗಳನ್ನು ಮಾತನಾಡುತ್ತದೆ",
    welcome: "ಸ್ವಾಗತ",
    welcomeSub: "ನಕ್ಷತ್ರಗಳು ನಿಮ್ಮ ಜನ್ಮದ ನಕ್ಷೆಯನ್ನು ಬಹಿರಂಗಪಡಿಸಲಿ.",
    begin: "ನನ್ನ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ",
    detailsTitle: "ನಿಮ್ಮ ಜನ್ಮದ ಬಗ್ಗೆ ತಿಳಿಸಿ",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    namePlaceholder: "ನಿಮ್ಮ ಹೆಸರು",
    dob: "ಹುಟ್ಟಿದ ದಿನಾಂಕ",
    tob: "ಹುಟ್ಟಿದ ಸಮಯ",
    place: "ಹುಟ್ಟಿದ ಸ್ಥಳ",
    placePlaceholder: "ನಗರವನ್ನು ಟೈಪ್ ಮಾಡಲು ಪ್ರಾರಂಭಿಸಿ…",
    generate: "ನನ್ನ ಜಾತಕ ತೋರಿಸಿ",
    calculating: "ಗ್ರಹಗಳನ್ನು ಜೋಡಿಸಲಾಗುತ್ತಿದೆ…",
    back: "ಹಿಂದೆ",
    pickPlace: "ದಯವಿಟ್ಟು ಪಟ್ಟಿಯಿಂದ ನಿಮ್ಮ ಹುಟ್ಟಿದ ಸ್ಥಳವನ್ನು ಆರಿಸಿ.",
  },
};

for (const k of Object.keys(STRINGS) as Lang[]) {
  STRINGS[k] = { ...MENU_EN, ...STRINGS[k] } as Strings;
}

Object.assign(STRINGS.hi, {
  menuTitle: "आप क्या जानना चाहेंगे?",
  menuSub: "एक मार्ग चुनें। और भी आ रहे हैं।",
  svcKundli: "कुंडली और दशा",
  svcKundliDesc: "आपकी पूर्ण वैदिक जन्म कुंडली, ग्रह, दशा और विश्लेषण",
  svcMatch: "मिलान (गुण मिलान)",
  svcMatchDesc: "अष्टकूट गुण मिलान — वर-वधू अनुकूलता",
  svcPalm: "हस्तरेखा",
  svcFace: "मुख वाचन",
  svcTarot: "टैरो",
  comingSoon: "जल्द आ रहा है",
  groom: "वर का विवरण",
  bride: "वधू का विवरण",
  matchBtn: "अनुकूलता जांचें",
  matching: "तारों का मिलान…",
});
