import { createContext, useContext, useState, ReactNode } from 'react';

type WarehouseTab = 'tree' | 'manager' | 'assignment' | 'analytics';

interface WarehouseContextType {
  activeWarehouseTab: WarehouseTab;
  setActiveWarehouseTab: (tab: WarehouseTab) => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const useWarehouseNavigation = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouseNavigation must be used within a WarehouseProvider');
  }
  return context;
};

interface WarehouseProviderProps {
  children: ReactNode;
}

export const WarehouseProvider = ({ children }: WarehouseProviderProps) => {
  const [activeWarehouseTab, setActiveWarehouseTab] = useState<WarehouseTab>('tree');

  return (
    <WarehouseContext.Provider value={{ activeWarehouseTab, setActiveWarehouseTab }}>
      {children}
    </WarehouseContext.Provider>
  );
};