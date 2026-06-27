import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi";

interface Translations {
  navbar: {
    browseBooks: string;
    sellBook: string;
    whyUs: string;
    reviews: string;
    signIn: string;
  };
  hero: {
    headline: string;
    subtext: string;
    browseBooksBtn: string;
    sellBookBtn: string;
  };
  browse: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    genre: string;
    condition: string;
    priceRange: string;
    viewDetails: string;
    viewMoreBooks: string;
    excellent: string;
    good: string;
    fair: string;
    ncert: string;
    reference: string;
    competitive: string;
    government: string;
    fiction: string;
    nonfiction: string;
    mystery: string;
    romance: string;
    underPrice: string;
    midPrice: string;
    abovePrice: string;
  };
  sell: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    bookTitle: string;
    author: string;
    condition: string;
    price: string;
    description: string;
    uploadPhotos: string;
    uploadText: string;
    listBookBtn: string;
    titlePlaceholder: string;
    authorPlaceholder: string;
    descriptionPlaceholder: string;
    select: string;
  };
  whyChoose: {
    title: string;
    subtitle: string;
    saveMoney: string;
    saveMoneyDesc: string;
    declutter: string;
    declutterDesc: string;
    community: string;
    communityDesc: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  footer: {
    description: string;
    quickLinks: string;
    support: string;
    stayUpdated: string;
    newsletterText: string;
    emailPlaceholder: string;
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
    browseBooks: string;
    sellBook: string;
    howItWorks: string;
    aboutUs: string;
    faq: string;
    shipping: string;
    returns: string;
    contact: string;
  };
  auth: {
    loginTitle: string;
    signupTitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    rememberMe: string;
    forgotPassword: string;
    signIn: string;
    signUp: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    agreeToTerms: string;
    termsOfService: string;
    privacyPolicy: string;
    buyer: string;
    seller: string;
    admin: string;
    fullName: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    navbar: {
      browseBooks: "Browse Books",
      sellBook: "Sell a Book",
      whyUs: "Why Us",
      reviews: "Reviews",
      signIn: "Sign In",
    },
    hero: {
      headline: "Buy. Sell. Repeat. Discover Stories That Deserve a Second Life.",
      subtext: "A marketplace for students and book lovers to buy and sell second-hand books easily.",
      browseBooksBtn: "Browse Books",
      sellBookBtn: "Sell Your Book",
    },
    browse: {
      title: "Browse Books",
      subtitle: "Discover your next favorite story from our curated collection of second-hand books",
      searchPlaceholder: "Search by title or author...",
      genre: "Genre",
      condition: "Condition",
      priceRange: "Price Range",
      viewDetails: "View Details",
      viewMoreBooks: "View More Books",
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      ncert: "NCERT Books",
      reference: "Reference Books",
      competitive: "Competitive Exams",
      government: "Government Exams",
      fiction: "Fiction",
      nonfiction: "Non-Fiction",
      mystery: "Mystery",
      romance: "Romance",
      underPrice: "Under ₹200",
      midPrice: "₹200 - ₹400",
      abovePrice: "Above ₹400",
    },
    sell: {
      title: "Sell Your Book",
      subtitle: "Turn your unused books into cash. List your book in minutes and reach thousands of readers",
      step1Title: "Add Book Details",
      step1Desc: "Provide title, author, condition, and a fair price for your book",
      step2Title: "Upload Photos",
      step2Desc: "Take clear photos of your book's cover and condition",
      step3Title: "Start Selling",
      step3Desc: "Once approved, your book will be visible to thousands of buyers",
      bookTitle: "Book Title",
      author: "Author",
      condition: "Condition",
      price: "Price (₹)",
      description: "Description",
      uploadPhotos: "Upload Photos",
      uploadText: "Click to upload or drag and drop",
      listBookBtn: "List Your Book",
      titlePlaceholder: "Enter book title",
      authorPlaceholder: "Enter author name",
      descriptionPlaceholder: "Tell buyers about your book...",
      select: "Select",
    },
    whyChoose: {
      title: "Why Choose Deoghar Kitab",
      subtitle: "More than just a marketplace — a movement towards sustainable and accessible reading",
      saveMoney: "Save Money",
      saveMoneyDesc: "Buy quality books at a fraction of the original price and make your reading more affordable",
      declutter: "Declutter & Earn",
      declutterDesc: "Turn your unused books into cash while helping others discover great stories",
      community: "Community Driven",
      communityDesc: "Join a passionate community of book lovers committed to sustainable reading",
    },
    testimonials: {
      title: "What Our Readers Say",
      subtitle: "Join thousands of happy book lovers who've found their perfect reads",
    },
    footer: {
      description: "Your trusted marketplace for buying and selling second-hand books. Join our community of book lovers today.",
      quickLinks: "Quick Links",
      support: "Support",
      stayUpdated: "Stay Updated",
      newsletterText: "Subscribe to get special offers and updates on new arrivals",
      emailPlaceholder: "Your email",
      copyright: "© 2025 Deoghar Kitab. All rights reserved.",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      browseBooks: "Browse Books",
      sellBook: "Sell a Book",
      howItWorks: "How It Works",
      aboutUs: "About Us",
      faq: "FAQ",
      shipping: "Shipping Info",
      returns: "Returns",
      contact: "Contact Us",
    },
    auth: {
      loginTitle: "Welcome Back",
      signupTitle: "Create Account",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      signIn: "Sign In",
      signUp: "Sign Up",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      agreeToTerms: "I agree to the",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      buyer: "Buyer",
      seller: "Seller",
      admin: "Admin",
      fullName: "Full Name",
    },
  },
  hi: {
    navbar: {
      browseBooks: "पुस्तकें देखें",
      sellBook: "पुस्तक बेचें",
      whyUs: "हम क्यों",
      reviews: "समीक्षाएँ",
      signIn: "साइन इन करें",
    },
    hero: {
      headline: "खरीदें। बेचें। दोहराएँ। कहानियों को खोजें जो दूसरा जीवन पाने के लायक हैं।",
      subtext: "छात्रों और पुस्तक प्रेमियों के लिए एक बाजार जहां वे आसानी से पुरानी पुस्तकें खरीद और बेच सकते हैं।",
      browseBooksBtn: "पुस्तकें देखें",
      sellBookBtn: "अपनी पुस्तक बेचें",
    },
    browse: {
      title: "पुस्तकें देखें",
      subtitle: "हमारे संग्रहित द्वितीय हस्त पुस्तकों के संग्रह से अपनी अगली पसंदीदा कहानी खोजें",
      searchPlaceholder: "शीर्षक या लेखक द्वारा खोजें...",
      genre: "शैली",
      condition: "स्थिति",
      priceRange: "मूल्य सीमा",
      viewDetails: "विवरण देखें",
      viewMoreBooks: "और पुस्तकें देखें",
      excellent: "उत्कृष्ट",
      good: "अच्छी",
      fair: "ठीक",
      ncert: "एनसीईआरटी पुस्तकें",
      reference: "संदर्भ पुस्तकें",
      competitive: "प्रतियोगी परीक्षा",
      government: "सरकारी परीक्षा",
      fiction: "कथा",
      nonfiction: "गैर-कथा",
      mystery: "रहस्य",
      romance: "रोमांस",
      underPrice: "₹200 से कम",
      midPrice: "₹200 - ₹400",
      abovePrice: "₹400 से अधिक",
    },
    sell: {
      title: "अपनी पुस्तक बेचें",
      subtitle: "अपनी अप्रयुक्त पुस्तकों को नकदी में बदलें। अपनी पुस्तक को मिनटों में सूचीबद्ध करें और हजारों पाठकों तक पहुँचें",
      step1Title: "पुस्तक विवरण जोड़ें",
      step1Desc: "अपनी पुस्तक के लिए शीर्षक, लेखक, स्थिति और एक उचित मूल्य प्रदान करें",
      step2Title: "तस्वीरें अपलोड करें",
      step2Desc: "अपनी पुस्तक के कवर और स्थिति की स्पष्ट तस्वीरें लें",
      step3Title: "बेचना शुरू करें",
      step3Desc: "एक बार स्वीकृत होने के बाद, आपकी पुस्तक हजारों खरीदारों के लिए दृश्यमान हो जाएगी",
      bookTitle: "पुस्तक का शीर्षक",
      author: "लेखक",
      condition: "स्थिति",
      price: "मूल्य (₹)",
      description: "विवरण",
      uploadPhotos: "तस्वीरें अपलोड करें",
      uploadText: "अपलोड करने के लिए क्लिक करें या खींचें और छोड़ें",
      listBookBtn: "अपनी पुस्तक सूचीबद्ध करें",
      titlePlaceholder: "पुस्तक का शीर्षक दर्ज करें",
      authorPlaceholder: "लेखक का नाम दर्ज करें",
      descriptionPlaceholder: "खरीदारों को अपनी पुस्तक के बारे में बताएं...",
      select: "चुनें",
    },
    whyChoose: {
      title: "देवघर किताब क्यों चुनें",
      subtitle: "सिर्फ एक बाजार से ज्यादा - स्थायी और सुलभ पठन की ओर एक आंदोलन",
      saveMoney: "पैसे बचाएं",
      saveMoneyDesc: "मूल कीमत के एक अंश में गुणवत्ता वाली पुस्तकें खरीदें और अपने पठन को अधिक सुलभ बनाएं",
      declutter: "सफाई करें और कमाएं",
      declutterDesc: "अपनी अप्रयुक्त पुस्तकों को नकदी में बदलें जबकि दूसरों को महान कहानियों की खोज में मदद करें",
      community: "समुदाय संचालित",
      communityDesc: "पुस्तक प्रेमियों के एक उत्साही समुदाय में शामिल हों जो स्थायी पठन के प्रति प्रतिबद्ध हैं",
    },
    testimonials: {
      title: "हमारे पाठक क्या कहते हैं",
      subtitle: "हजारों खुश पुस्तक प्रेमियों में शामिल हों जिन्हें उनकी पसंदीदा पुस्तकें मिली हैं",
    },
    footer: {
      description: "द्वितीय हस्त पुस्तकों को खरीदने और बेचने के लिए आपका विश्वसनीय बाजार। आज ही पुस्तक प्रेमियों के हमारे समुदाय में शामिल हों।",
      quickLinks: "त्वरित लिंक",
      support: "समर्थन",
      stayUpdated: "अपडेट रहें",
      newsletterText: "विशेष प्रस्तावों और नई आवक पर अपडेट प्राप्त करने के लिए सदस्यता लें",
      emailPlaceholder: "आपका ईमेल",
      copyright: "© 2025 देवघर किताब। सर्वाधिकार सुरक्षित।",
      privacyPolicy: "गोपनीयता नीति",
      termsOfService: "सेवा की शर्तें",
      browseBooks: "पुस्तकें देखें",
      sellBook: "पुस्तक बेचें",
      howItWorks: "यह कैसे काम करता है",
      aboutUs: "हमारे बारे में",
      faq: "अक्सर पूछे जाने वाले प्रश्न",
      shipping: "शिपिंग",
      returns: "वापसी",
      contact: "संपर्क करें",
    },
    auth: {
      loginTitle: "स्वागत है",
      signupTitle: "खाता बनाएं",
      email: "ईमेल",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      rememberMe: "मुझे याद रखें",
      forgotPassword: "पासवर्ड भूल गए?",
      signIn: "साइन इन करें",
      signUp: "साइन अप करें",
      alreadyHaveAccount: "क्या आपके पास पहले से एक खाता है?",
      dontHaveAccount: "क्या आपके पास खाता नहीं है?",
      agreeToTerms: "मैं सेवा की शर्तों और गोपनीयता नीति से सहमत हूं",
      termsOfService: "सेवा की शर्तें",
      privacyPolicy: "गोपनीयता नीति",
      buyer: "खरीदार",
      seller: "विक्रेता",
      admin: "व्यवस्थापक",
      fullName: "पूरा नाम",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "hi" || saved === "en") ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
