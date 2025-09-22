import Header from "@/components/dms/Header";
import WelcomeSection from "@/components/dms/WelcomeSection";
import NavigationTabs from "@/components/dms/NavigationTabs";
import StatsCard from "@/components/dms/StatsCard";
import RecentDocuments from "@/components/dms/RecentDocuments";
import QuickActions from "@/components/dms/QuickActions";
import Documents from "@/pages/Documents";
import PhysicalTracking from "@/pages/PhysicalTracking";
import Workflow from "@/pages/Workflow";
import Analytics from "@/pages/Analytics";
import EnhancedUpload from "@/pages/EnhancedUpload";
import Scan from "@/pages/Scan";
import Settings from "@/pages/Settings";
import MetadataTypes from "@/pages/MetadataTypes";
import WarehouseModule from "@/components/warehouse/WarehouseModule";
import { FileText, Archive, Clock, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";
import { useNavigation } from "@/contexts/NavigationContext";
import AuthPage from "@/components/auth/AuthPage";
const Index = () => {
  const { user, loading } = useAuth();
  const { stats } = useDocuments();
  const { activeTab } = useNavigation();
  
  // Check if we should show the enhanced upload page
  if (activeTab === 'EnhancedUpload') {
    return <EnhancedUpload />;
  }

  // Check if we should show the scan page
  if (activeTab === 'Scan') {
    return <Scan />;
  }

  if (activeTab === 'Settings') {
    return <Settings />;
  }

  if (activeTab === 'MetadataTypes') {
    return <MetadataTypes />;
  }

  // Show loading state while contexts are initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if user is not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Calculate percentage changes (mock data for demo)
  const getChange = (current: number) => {
    const baseChange = Math.floor(Math.random() * 20) - 10; // -10 to +10
    return baseChange > 0 ? `+${baseChange}%` : `${baseChange}%`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WelcomeSection />
      <NavigationTabs />
      
      {/* Tab Content */}
      <main className="px-6 py-8 bg-background">
        {activeTab === 'Dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard 
                title="Total Documents" 
                value={stats.totalDocuments.toLocaleString()} 
                change={getChange(stats.totalDocuments)} 
                isPositive={Math.random() > 0.5} 
                icon={<FileText className="w-8 h-8 text-white" />} 
                iconBg="bg-dms-blue" 
              />
              <StatsCard 
                title="Physical Files" 
                value={stats.physicalFiles.toLocaleString()} 
                change={getChange(stats.physicalFiles)} 
                isPositive={Math.random() > 0.5} 
                icon={<Archive className="w-8 h-8 text-white" />} 
                iconBg="bg-dms-purple" 
              />
              <StatsCard 
                title="Pending Approvals" 
                value={stats.pendingApprovals.toString()} 
                change={getChange(stats.pendingApprovals)} 
                isPositive={Math.random() > 0.5} 
                icon={<Clock className="w-8 h-8 text-white" />} 
                iconBg="bg-dms-orange" 
              />
              <StatsCard 
                title="Active Users" 
                value={stats.activeUsers.toString()} 
                change={getChange(stats.activeUsers)} 
                isPositive={Math.random() > 0.5} 
                icon={<Users className="w-8 h-8 text-white" />} 
                iconBg="bg-dms-green" 
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentDocuments />
              <QuickActions />
            </div>
          </>
        )}

        {activeTab === 'Documents' && <Documents />}

        {activeTab === 'Physical Tracking' && <PhysicalTracking />}

        {activeTab === 'Warehouse' && <WarehouseModule />}

        {activeTab === 'Workflow' && <Workflow />}

        {activeTab === 'Analytics' && <Analytics />}
      </main>
    </div>
  );
};
export default Index;