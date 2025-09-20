import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Search, ScanLine, BarChart3, Sparkles } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigation } from "@/contexts/NavigationContext";

const QuickActions = () => {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const { setActiveTab } = useNavigation();

  const handleScan = () => {
    setScanModalOpen(true);
  };

  const handleReports = () => {
    setReportsModalOpen(true);
  };

  const handleUpload = () => {
    setActiveTab('EnhancedUpload');
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
          <div className="w-10 h-10 bg-dms-purple rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Frequently used operations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 px-4">
          {/* Upload */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={handleUpload}
              className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 p-0"
            >
              <Upload className="w-5 h-5 text-white" />
            </Button>
            <span className="text-sm font-medium text-foreground">Upload</span>
          </div>

          {/* AI Search */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={handleAISearch}
              className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 p-0"
            >
              <Search className="w-5 h-5 text-white" />
            </Button>
            <span className="text-sm font-medium text-foreground">AI Search</span>
          </div>

          {/* Scan */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={handleScan}
              className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 p-0"
            >
              <ScanLine className="w-5 h-5 text-white" />
            </Button>
            <span className="text-sm font-medium text-foreground">Scan</span>
          </div>

          {/* Reports */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={handleReports}
              className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600 p-0"
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </Button>
            <span className="text-sm font-medium text-foreground">Reports</span>
          </div>
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
              <Button className="bg-orange-500 hover:bg-orange-600">
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