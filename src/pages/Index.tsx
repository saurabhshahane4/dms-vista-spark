import Header from "@/components/dms/Header";
import WelcomeSection from "@/components/dms/WelcomeSection";
import NavigationTabs from "@/components/dms/NavigationTabs";
import StatsCard from "@/components/dms/StatsCard";
import RecentDocuments from "@/components/dms/RecentDocuments";
import QuickActions from "@/components/dms/QuickActions";
import { FileText, Archive, Clock, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";
import AuthPage from "@/components/auth/AuthPage";
const Index = () => {
  const { user, loading } = useAuth();
  const { stats } = useDocuments();

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
      
      <main className="px-6 py-8 bg-background">
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
      </main>
    </div>
  );
};
export default Index;