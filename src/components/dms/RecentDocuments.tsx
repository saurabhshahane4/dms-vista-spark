import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

const documents = [
  {
    name: "Contract Agreement",
    id: "DOC-2024-001",
    date: "2024-01-15",
    status: "approved",
  },
  {
    name: "Financial Report Q4",
    id: "DOC-2024-002", 
    date: "2024-01-14",
    status: "pending",
  },
  {
    name: "Employee Handbook",
    id: "DOC-2024-003",
    date: "2024-01-13", 
    status: "processing",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-status-approved/10 text-status-approved border-status-approved/20";
    case "pending":
      return "bg-status-pending/10 text-status-pending border-status-pending/20";
    case "processing":
      return "bg-status-processing/10 text-status-processing border-status-processing/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const RecentDocuments = () => {
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

      <div className="space-y-4">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{doc.name}</h4>
                <p className="text-sm text-muted-foreground">{doc.id} • {doc.date}</p>
              </div>
            </div>
            <Badge className={getStatusVariant(doc.status)}>
              {doc.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentDocuments;