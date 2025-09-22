import { useNavigation } from "@/contexts/NavigationContext";
import { useLanguage } from "@/contexts/LanguageContext";

const NavigationTabs = () => {
  const { activeTab, setActiveTab } = useNavigation();
  const { t } = useLanguage();
  const tabs = [
    { key: "Dashboard", label: t('dashboard') },
    { key: "Documents", label: t('documents') }, 
    { key: "Physical Tracking", label: t('physicalTracking') },
    { key: "Workflow", label: t('workflow') },
    { key: "Analytics", label: t('analytics') }
  ] as const;
  
  return (
    <nav className="border-b border-border px-6 bg-muted/30">
      <div className="flex gap-8">
        {tabs.map(tab => (
          <button 
            key={tab.key} 
            onClick={() => setActiveTab(tab.key)} 
            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key 
                ? "border-dms-blue text-dms-blue" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};
export default NavigationTabs;