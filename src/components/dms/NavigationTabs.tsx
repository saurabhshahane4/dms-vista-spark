import { useNavigation } from "@/contexts/NavigationContext";

const NavigationTabs = () => {
  const { activeTab, setActiveTab } = useNavigation();
  const tabs = ["Dashboard", "Documents", "Physical Tracking", "Warehouse", "Workflow", "Analytics"] as const;
  
  return (
    <nav className="border-b border-border px-6 bg-muted/30">
      <div className="flex gap-8">
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab 
                ? "border-dms-blue text-dms-blue" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
};
export default NavigationTabs;