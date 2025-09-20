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
          {/* Upload Document */}
          <div className="flex flex-col items-center">
            <DocumentUpload />
          </div>

          {/* AI Search */}
          <Button
            variant="ghost"
            className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-muted/50 border border-border/30 hover:border-border/60 transition-colors"
            onClick={handleAISearch}
          >
            <div className="w-12 h-12 rounded-full bg-dms-blue flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">AI Search</div>
              <div className="text-xs text-muted-foreground">Intelligent document search</div>
            </div>
          </Button>

          {/* Scan */}
          <Button
            variant="ghost"
            className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-muted/50 border border-border/30 hover:border-border/60 transition-colors"
            onClick={handleScan}
          >
            <div className="w-12 h-12 rounded-full bg-dms-orange flex items-center justify-center">
              <ScanLine className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">Scan</div>
              <div className="text-xs text-muted-foreground">Scan physical documents</div>
            </div>
          </Button>

          {/* Reports */}
          <Button
            variant="ghost"
            className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-muted/50 border border-border/30 hover:border-border/60 transition-colors"
            onClick={handleReports}
          >
            <div className="w-12 h-12 rounded-full bg-dms-purple flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">Reports</div>
              <div className="text-xs text-muted-foreground">Generate reports</div>
            </div>
          </Button>
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