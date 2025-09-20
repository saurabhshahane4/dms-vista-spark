import Header from "@/components/dms/Header";
import WelcomeSection from "@/components/dms/WelcomeSection";
import NavigationTabs from "@/components/dms/NavigationTabs";
import StatsCard from "@/components/dms/StatsCard";
import RecentDocuments from "@/components/dms/RecentDocuments";
import QuickActions from "@/components/dms/QuickActions";
import { FileText, Archive, Clock, Users } from "lucide-react";
const Index = () => {
  return <div className="min-h-screen bg-background">
      <Header />
      <WelcomeSection />
      <NavigationTabs />
      
      <main className="px-6 py-8 bg-slate-100">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Documents" value="12,847" change="+12%" isPositive={true} icon={<FileText className="w-8 h-8 text-white" />} iconBg="bg-dms-blue" />
          <StatsCard title="Physical Files" value="8,234" change="+5%" isPositive={true} icon={<Archive className="w-8 h-8 text-white" />} iconBg="bg-dms-purple" />
          <StatsCard title="Pending Approvals" value="23" change="-8%" isPositive={false} icon={<Clock className="w-8 h-8 text-white" />} iconBg="bg-dms-orange" />
          <StatsCard title="Active Users" value="156" change="+3%" isPositive={true} icon={<Users className="w-8 h-8 text-white" />} iconBg="bg-dms-green" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentDocuments />
          <QuickActions />
        </div>
      </main>
    </div>;
};
export default Index;