import React, { createContext, useContext, useState } from 'react';

type NavigationTab = 'Dashboard' | 'Documents' | 'Physical Tracking' | 'Warehouse' | 'Workflow' | 'Analytics' | 'EnhancedUpload' | 'Scan' | 'Settings' | 'MetadataTypes';

interface NavigationContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('Dashboard');

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};