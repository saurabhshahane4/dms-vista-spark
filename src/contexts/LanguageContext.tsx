import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ar' | 'es' | 'fr' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header & Navigation
    welcome: 'Welcome back',
    documentArchivingSystem: 'Document Archiving System',
    aiPoweredDms: 'AI-Powered Document Management & Physical Archive Tracking',
    signIn: 'Sign In',
    language: 'العربية',
    
    // Navigation Tabs
    dashboard: 'Dashboard',
    documents: 'Documents',
    physicalTracking: 'Physical Tracking',
    workflow: 'Workflow',
    analytics: 'Analytics',
    
    // Dashboard Stats
    totalDocuments: 'Total Documents',
    physicalFiles: 'Physical Files',
    pendingApprovals: 'Pending Approvals',
    activeUsers: 'Active Users',
    
    // Actions & Buttons
    newDocument: 'New Document',
    upload: 'Upload',
    search: 'Search',
    filter: 'Filter',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    approve: 'Approve',
    reject: 'Reject',
    submit: 'Submit',
    
    // Document Management
    archive: 'Archive',
    recentDocuments: 'Recent Documents',
    documentDetails: 'Document Details',
    uploadDocument: 'Upload Document',
    selectFiles: 'Select Files',
    dragDropFiles: 'Drag & drop files here, or click to select',
    
    // Workflow
    workflowManagement: 'Workflow Management',
    approvals: 'Approvals',
    myRequests: 'My Requests',
    pendingRequests: 'Pending Requests',
    completedRequests: 'Completed Requests',
    
    // Search & AI
    aiSearch: 'AI Search',
    searchDocuments: 'Search documents...',
    noResults: 'No results found',
    
    // Settings
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    
    // Status
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Authentication
    email: 'Email',
    password: 'Password',
    displayName: 'Display Name',
    location: 'Location',
    signUp: 'Sign Up',
    login: 'Login',
    signInToAccount: 'Sign in to your account',
    createNewAccount: 'Create a new account',
    dontHaveAccount: "Don't have an account? Sign up",
    alreadyHaveAccount: 'Already have an account? Sign in',
    
    // Common
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    open: 'Open',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    
    // Quick Actions
    quickActions: 'Quick Actions',
    intelligentUpload: 'Intelligent Upload',
    documentLookup: 'Document Lookup',
    scanBarcode: 'Scan Barcode',
    reports: 'Reports',
    scan: 'Scan',
    frequentlyUsedOperations: 'Frequently used operations',
    
    // Placeholders & Forms
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    enterDisplayName: 'Enter your display name',
    selectLocation: 'Select your location',
    searchPlaceholder: 'Search documents...',
    enterDocumentName: 'Enter document name',
    enterTags: 'Tags (comma-separated)',
    
    // File Operations
    selectFile: 'Select File',
    documentName: 'Document Name',
    tags: 'Tags',
    downloadDocument: 'Download Document',
    shareDocument: 'Share Document',
    
    // Modals & Dialogs
    scanPhysicalDocument: 'Scan Physical Document',
    barcodeScanner: 'Barcode Scanner',
    positionBarcodeInFrame: 'Position the barcode within the frame to scan',
    startScanning: 'Start Scanning',
    generateReports: 'Generate Reports',
    
    // Reports
    documentUsageReport: 'Document Usage Report',
    complianceReport: 'Compliance Report',
    userActivityReport: 'User Activity Report',
    storageAnalytics: 'Storage Analytics',
    
    // AI Search suggestions
    showFinancialReports: 'Show me financial reports from this quarter',
    findSafetyDocuments: 'Find safety and compliance documents',
    locateContract: 'Locate contract with ABC Corp',
    summarizeMeetingMinutes: 'Summarize recent meeting minutes',
    
    // Stats Changes
    from_last_month: 'from last month',
    
    // General Messages
    archiving: 'Archiving...',
    failedToLoad: 'Failed to load',
    tryAgain: 'Try again',
    noItemsFound: 'No items found',
    
    // Form Validation
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 6 characters',
    
    // Toast Messages
    operationSuccessful: 'Operation completed successfully',
    operationFailed: 'Operation failed. Please try again.',
    documentArchived: 'Active documents have been archived successfully',
    archiveError: 'Failed to archive documents. Please try again.'
  },
  ar: {
    // Header & Navigation  
    welcome: 'مرحبا بعودتك',
    documentArchivingSystem: 'نظام أرشفة المستندات',
    aiPoweredDms: 'إدارة المستندات بالذكاء الاصطناعي وتتبع الأرشيف الفعلي',
    signIn: 'تسجيل الدخول',
    language: 'English',
    
    // Navigation Tabs
    dashboard: 'لوحة التحكم',
    documents: 'المستندات',
    physicalTracking: 'التتبع الفعلي',
    workflow: 'سير العمل',
    analytics: 'التحليلات',
    
    // Dashboard Stats
    totalDocuments: 'إجمالي المستندات',
    physicalFiles: 'الملفات الفعلية',
    pendingApprovals: 'الموافقات المعلقة',
    activeUsers: 'المستخدمون النشطون',
    
    // Actions & Buttons
    newDocument: 'مستند جديد',
    upload: 'رفع',
    search: 'بحث',
    filter: 'تصفية',
    settings: 'الإعدادات',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    view: 'عرض',
    approve: 'موافقة',
    reject: 'رفض',
    submit: 'إرسال',
    
    // Document Management
    archive: 'أرشيف',
    recentDocuments: 'المستندات الأخيرة',
    documentDetails: 'تفاصيل المستند',
    uploadDocument: 'رفع مستند',
    selectFiles: 'اختر الملفات',
    dragDropFiles: 'اسحب وأفلت الملفات هنا، أو انقر للاختيار',
    
    // Workflow
    workflowManagement: 'إدارة سير العمل',
    approvals: 'الموافقات',
    myRequests: 'طلباتي',
    pendingRequests: 'الطلبات المعلقة',
    completedRequests: 'الطلبات المكتملة',
    
    // Search & AI
    aiSearch: 'بحث ذكي',
    searchDocuments: 'البحث في المستندات...',
    noResults: 'لم يتم العثور على نتائج',
    
    // Settings
    darkMode: 'الوضع المظلم',
    notifications: 'الإشعارات',
    
    // Status
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    
    // Authentication
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    displayName: 'اسم العرض',
    location: 'الموقع',
    signUp: 'إنشاء حساب',
    login: 'تسجيل الدخول',
    signInToAccount: 'تسجيل الدخول إلى حسابك',
    createNewAccount: 'إنشاء حساب جديد',
    dontHaveAccount: 'لا تملك حساباً؟ إنشاء حساب',
    alreadyHaveAccount: 'تملك حساباً بالفعل؟ تسجيل الدخول',
    
    // Common
    yes: 'نعم',
    no: 'لا',
    close: 'إغلاق',
    open: 'فتح',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    
    // Quick Actions
    quickActions: 'الإجراءات السريعة',
    intelligentUpload: 'رفع ذكي',
    documentLookup: 'البحث عن المستندات',
    scanBarcode: 'مسح الباركود',
    reports: 'التقارير',
    scan: 'مسح',
    frequentlyUsedOperations: 'العمليات الأكثر استخداماً',
    
    // Placeholders & Forms
    enterEmail: 'أدخل بريدك الإلكتروني',
    enterPassword: 'أدخل كلمة المرور',
    enterDisplayName: 'أدخل اسم العرض',
    selectLocation: 'اختر موقعك',
    searchPlaceholder: 'البحث في المستندات...',
    enterDocumentName: 'أدخل اسم المستند',
    enterTags: 'الوسوم (مفصولة بفواصل)',
    
    // File Operations
    selectFile: 'اختر ملف',
    documentName: 'اسم المستند',
    tags: 'الوسوم',
    downloadDocument: 'تحميل المستند',
    shareDocument: 'مشاركة المستند',
    
    // Modals & Dialogs
    scanPhysicalDocument: 'مسح مستند فعلي',
    barcodeScanner: 'ماسح الباركود',
    positionBarcodeInFrame: 'ضع الباركود داخل الإطار للمسح',
    startScanning: 'بدء المسح',
    generateReports: 'إنشاء التقارير',
    
    // Reports
    documentUsageReport: 'تقرير استخدام المستندات',
    complianceReport: 'تقرير الامتثال',
    userActivityReport: 'تقرير نشاط المستخدم',
    storageAnalytics: 'تحليلات التخزين',
    
    // AI Search suggestions
    showFinancialReports: 'أظهر لي التقارير المالية لهذا الربع',
    findSafetyDocuments: 'ابحث عن مستندات السلامة والامتثال',
    locateContract: 'ابحث عن العقد مع شركة ABC',
    summarizeMeetingMinutes: 'لخص محاضر الاجتماعات الأخيرة',
    
    // Stats Changes
    from_last_month: 'من الشهر الماضي',
    
    // General Messages
    archiving: 'جاري الأرشفة...',
    failedToLoad: 'فشل في التحميل',
    tryAgain: 'حاول مرة أخرى',
    noItemsFound: 'لم يتم العثور على عناصر',
    
    // Form Validation
    required: 'هذا الحقل مطلوب',
    invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
    passwordTooShort: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف',
    
    // Toast Messages
    operationSuccessful: 'تمت العملية بنجاح',
    operationFailed: 'فشلت العملية. يرجى المحاولة مرة أخرى.',
    documentArchived: 'تم أرشفة المستندات النشطة بنجاح',
    archiveError: 'فشل في أرشفة المستندات. يرجى المحاولة مرة أخرى.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  // Update document direction based on language
  React.useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};