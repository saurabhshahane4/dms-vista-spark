import { useWarehouseNavigation } from '@/contexts/WarehouseContext';
import LocationTreeView from '@/pages/LocationTreeView';
import LocationManager from '@/pages/LocationManager';
import RackAssignment from '@/pages/RackAssignment';
import LocationAnalytics from '@/pages/LocationAnalytics';

const WarehouseModule = () => {
  const { activeWarehouseTab, setActiveWarehouseTab } = useWarehouseNavigation();

  const tabs = [
    { id: 'tree' as const, label: 'Location Tree', component: LocationTreeView },
    { id: 'manager' as const, label: 'Location Manager', component: LocationManager },
    { id: 'assignment' as const, label: 'Rack Assignment', component: RackAssignment },
    { id: 'analytics' as const, label: 'Analytics', component: LocationAnalytics },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeWarehouseTab)?.component || LocationTreeView;

  return (
    <div className="space-y-6">
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveWarehouseTab(tab.id)}
              className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeWarehouseTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <ActiveComponent />
    </div>
  );
};

export default WarehouseModule;