import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/contexts/NavigationContext';
import { 
  Settings as SettingsIcon, 
  Megaphone, 
  Package, 
  FileType, 
  Globe, 
  Users, 
  List, 
  Key, 
  Mail, 
  Database, 
  Timer, 
  ShieldCheck, 
  Link, 
  Download, 
  Palette, 
  User, 
  ExternalLink, 
  Workflow,
  ArrowLeft 
} from 'lucide-react';

const Settings = () => {
  const { setActiveTab } = useNavigation();
  
  const handleBackToDashboard = () => {
    setActiveTab('Dashboard');
  };

  const setupItems = [
    { title: 'Announcements', icon: Megaphone, action: null },
    { title: 'Assets', icon: Package, action: null },
    { title: 'Document types', icon: FileType, action: null },
    { title: 'Global ACLs', icon: Globe, action: null },
    { title: 'Groups', icon: Users, action: null },
    { title: 'Indexes', icon: List, action: null },
    { title: 'Key management', icon: Key, action: null },
    { title: 'Mailing profiles', icon: Mail, action: null },
    { title: 'Metadata types', icon: Database, action: 'MetadataTypes' },
    { title: 'Quotas', icon: Timer, action: null },
    { title: 'Roles', icon: ShieldCheck, action: null },
    { title: 'Settings', icon: SettingsIcon, action: null },
    { title: 'Smart links', icon: Link, action: null },
    { title: 'Sources', icon: Download, action: null },
    { title: 'Themes', icon: Palette, action: null },
    { title: 'Users', icon: User, action: null },
    { title: 'Web links', icon: ExternalLink, action: null },
    { title: 'Workflows', icon: Workflow, action: null },
  ];

  const handleCardClick = (action: string | null) => {
    if (action) {
      setActiveTab(action as any);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={handleBackToDashboard}
        className="mb-6 flex items-center gap-2 hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-muted rounded-lg">
          <SettingsIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Setup Items</h1>
          <p className="text-muted-foreground">Here you can configure all aspects of the system.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {setupItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card 
              key={index}
              className="p-8 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-slate-700/90 hover:bg-slate-700 border-slate-600"
              onClick={() => handleCardClick(item.action)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-lg bg-slate-600/50 group-hover:bg-slate-600/70 transition-colors">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-medium text-white group-hover:text-slate-100">
                  {item.title}
                </h3>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;