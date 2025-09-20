import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Search, ScanLine, BarChart3, Sparkles } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DocumentUpload from "./DocumentUpload";

const QuickActions = () => {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);

  const handleScan = () => {
    setScanModalOpen(true);
  };

  const handleReports = () => {
    setReportsModalOpen(true);
  };

  const handleAISearch = () => {
    // Open AI Search modal - this will be handled by the Header component
    const searchButton = document.querySelector('[data-ai-search-trigger]') as HTMLButtonElement;
    if (searchButton) {
      searchButton.click();
    }
  };

  const actions = [
    {
      name: "Upload",
      icon: Upload,
      bgColor: "bg-dms-green",
      description: "Upload new documents",
      component: <DocumentUpload key="upload" />
    },
    {
      name: "AI Search",
      icon: Search,
      bgColor: "bg-dms-blue", 
      description: "Intelligent document search",
      onClick: handleAISearch
    },
    {
      name: "Scan",
      icon: ScanLine,
      bgColor: "bg-dms-orange",
      description: "Scan physical documents",
      onClick: handleScan
    },
    {
      name: "Reports",
      icon: BarChart3,
      bgColor: "bg-dms-purple",
      description: "Generate reports",
      onClick: handleReports
    },
  ];

  return (
    <>
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
            action.component ? (
              <div key={index} className="flex">
                {action.component}
              </div>
            ) : (
              <Button
                key={index}
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-muted/50 border border-border/30 hover:border-border/60 transition-colors"
                onClick={action.onClick}
              >
                <div className={`w-12 h-12 rounded-full ${action.bgColor} flex items-center justify-center`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-foreground">{action.name}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            )
          ))}
        </div>
      </Card>

      {/* Scan Modal */}
      <Dialog open={scanModalOpen} onOpenChange={setScanModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Physical Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8">
              <ScanLine className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Barcode Scanner</h3>
              <p className="text-muted-foreground mb-4">Position the barcode within the frame to scan</p>
              <Button className="bg-dms-orange hover:bg-dms-orange/90">
                <ScanLine className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reports Modal */}
      <Dialog open={reportsModalOpen} onOpenChange={setReportsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Reports</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Document Usage Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Compliance Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                User Activity Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Storage Analytics
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActions;