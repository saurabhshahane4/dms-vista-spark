import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocuments } from "@/hooks/useDocuments";
import DocumentUpload from "./DocumentUpload";
const WelcomeSection = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { stats, refetch } = useDocuments();

  if (!user) return null;

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="px-6 py-8 border-b border-border bg-background">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌟</span>
            <h2 className="text-2xl font-semibold text-foreground">
              {t('welcome')}, {displayName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-dms-blue/10 text-dms-blue border-dms-blue/20">
              {profile?.department || 'HR'}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              {profile?.role || 'user'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 mr-8">
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{stats.totalDocuments.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{t('totalDocuments')}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{stats.physicalFiles.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{t('physicalFiles')}</div>
            </div>
          </div>

          <DocumentUpload onUploadComplete={refetch} />
          <Button variant="outline" className="border-dms-purple text-dms-purple hover:bg-dms-purple/10">
            <Archive className="w-4 h-4 mr-2" />
            {t('archive')}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default WelcomeSection;