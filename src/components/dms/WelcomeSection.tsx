import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Archive } from "lucide-react";
const WelcomeSection = () => {
  return <div className="px-6 py-8 border-b border-border bg-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌟</span>
            <h2 className="text-2xl font-semibold text-foreground">Welcome back, Saurabh Shahane</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-dms-blue/10 text-dms-blue border-dms-blue/20">
              HR
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              user
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 mr-8">
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">12,847</div>
              <div className="text-sm text-muted-foreground">Total Documents</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">8,234</div>
              <div className="text-sm text-muted-foreground">Physical Files</div>
            </div>
          </div>

          <Button className="bg-dms-blue hover:bg-dms-blue/90 text-white">
            <FileText className="w-4 h-4 mr-2" />
            New Document
          </Button>
          <Button variant="outline" className="border-dms-purple text-dms-purple hover:bg-dms-purple/10">
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>
    </div>;
};
export default WelcomeSection;