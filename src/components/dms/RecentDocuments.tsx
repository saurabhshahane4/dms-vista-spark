import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/contexts/AuthContext";

const RecentDocuments = () => {
  const { documents, loading } = useDocuments();
  const { user } = useAuth();

  if (!user) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-status-approved/10 text-status-approved border-status-approved/20";
      case "pending":
        return "bg-status-pending/10 text-status-pending border-status-pending/20";
      case "processing":
        return "bg-status-processing/10 text-status-processing border-status-processing/20";
      case "archived":
        return "bg-muted/50 text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const recentDocs = documents.slice(0, 5);

  return (
    <Card className="p-6 bg-card shadow-soft border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-dms-blue/10 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-dms-blue" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Documents</h3>
          <p className="text-sm text-muted-foreground">Latest uploaded and processed documents</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : recentDocs.length > 0 ? (
        <div className="space-y-4">
          {recentDocs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{doc.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Created {formatDate(doc.created_at)}
                    {doc.file_size && ` • ${(doc.file_size / 1024 / 1024).toFixed(1)} MB`}
                  </p>
                </div>
              </div>
              <Badge className={getStatusVariant(doc.status)}>
                {doc.status}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">No documents yet</p>
          <p className="text-sm text-muted-foreground">Upload your first document to get started</p>
        </div>
      )}
    </Card>
  );
};

export default RecentDocuments;