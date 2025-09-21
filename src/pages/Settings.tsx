import React from 'react';
import { Card } from '@/components/ui/card';
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
  Workflow 
} from 'lucide-react';

const Settings = () => {
  const setupItems = [
    { title: 'Announcements', icon: Megaphone },
    { title: 'Assets', icon: Package },
    { title: 'Document types', icon: FileType },
    { title: 'Global ACLs', icon: Globe },
    { title: 'Groups', icon: Users },
    { title: 'Indexes', icon: List },
    { title: 'Key management', icon: Key },
    { title: 'Mailing profiles', icon: Mail },
    { title: 'Metadata types', icon: Database },
    { title: 'Quotas', icon: Timer },
    { title: 'Roles', icon: ShieldCheck },
    { title: 'Settings', icon: SettingsIcon },
    { title: 'Smart links', icon: Link },
    { title: 'Sources', icon: Download },
    { title: 'Themes', icon: Palette },
    { title: 'Users', icon: User },
    { title: 'Web links', icon: ExternalLink },
    { title: 'Workflows', icon: Workflow },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
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