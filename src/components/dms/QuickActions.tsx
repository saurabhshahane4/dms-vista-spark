import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Search, ScanLine, BarChart3, Sparkles } from "lucide-react";

const actions = [
  {
    name: "Upload",
    icon: Upload,
    bgColor: "bg-dms-green",
    description: "Upload new documents",
  },
  {
    name: "AI Search",
    icon: Search,
    bgColor: "bg-dms-blue", 
    description: "Intelligent document search",
  },
  {
    name: "Scan",
    icon: ScanLine,
    bgColor: "bg-dms-orange",
    description: "Scan physical documents",
  },
  {
    name: "Reports",
    icon: BarChart3,
    bgColor: "bg-dms-purple",
    description: "Generate reports",
  },
];

const QuickActions = () => {
  return (
    <Card className="p-6 bg-card shadow-soft border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-dms-purple/10 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-dms-purple" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Frequently used operations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-muted/50 border border-border/30 hover:border-border/60 transition-colors"
          >
            <div className={`w-12 h-12 rounded-full ${action.bgColor} flex items-center justify-center`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">{action.name}</div>
              <div className="text-xs text-muted-foreground">{action.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;