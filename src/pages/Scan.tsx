import { useState, useRef } from "react";
import { ArrowLeft, ScanLine, FileText, Image, PenTool, Mic, Video, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigation } from "@/contexts/NavigationContext";

const documentTypes = [
  {
    id: "pdf",
    name: "PDF Document",
    icon: FileText,
    color: "bg-red-500"
  },
  {
    id: "image",
    name: "Image/Scan", 
    icon: Image,
    color: "bg-green-500"
  },
  {
    id: "handwritten",
    name: "Handwritten Document",
    icon: PenTool,
    color: "bg-orange-500"
  },
  {
    id: "audio",
    name: "Audio Recording",
    icon: Mic,
    color: "bg-purple-500"
  },
  {
    id: "video",
    name: "Video Document",
    icon: Video,
    color: "bg-blue-500"
  }
];

const categories = [
  "Financial Records",
  "Legal Documents", 
  "HR Documents",
  "Project Files",
  "Contracts",
  "Reports",
  "Policies",
  "Training Materials"
];

const departments = [
  "Cabinets and Lockers",
  "Racks and Shelving",
  "Specialized System"
];

const Scan = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [zone, setZone] = useState("");
  const [description, setDescription] = useState("");
  const [scanning, setScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { setActiveTab } = useNavigation();

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  const handleBackToDashboard = () => {
    setActiveTab('Dashboard');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    if (!documentTitle) {
      setDocumentTitle(selectedFile.name.split('.')[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleScan = async () => {
    if (!documentTitle.trim() || !selectedType) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setScanning(true);
    setCurrentStep(2);
    
    try {
      // Simulate scanning process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setCurrentStep(3);
      
      setTimeout(() => {
        toast({
          title: 'Success',
          description: 'Document scanned and processed successfully!',
        });
        handleBackToDashboard();
      }, 2000);

    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: 'Scan Error',
        description: 'Failed to scan document. Please try again.',
        variant: 'destructive',
      });
      setCurrentStep(1);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Document <span className="text-dms-orange">Scan</span>
              </h1>
              <p className="text-sm text-muted-foreground">AI-Powered Scanning & Analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Welcome Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome {displayName}, ready to scan documents?
          </h2>
          <p className="text-muted-foreground">
            Our AI-powered system will scan, process, and analyze your documents automatically
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-dms-orange text-white' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <span className={currentStep >= 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              Setup
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-dms-orange text-white' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <span className={currentStep >= 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              Scanning
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-dms-orange text-white' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
            <span className={currentStep >= 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              Result
            </span>
          </div>
        </div>

        {/* Enhanced Document Scan Section */}
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Enhanced Document Scan</h3>
          </div>

          {/* Document Type Selection */}
          <div className="space-y-4 mb-6">
            <Label className="text-sm font-medium text-foreground">Select Document Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {documentTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center gap-2 ${
                    selectedType === type.id ? 'border-2 border-dms-orange bg-dms-orange/10' : ''
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className={`w-8 h-8 ${type.color} rounded flex items-center justify-center`}>
                    <type.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-center">{type.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Scanner Area */}
          <div className="space-y-4 mb-6">
            <Label className="text-sm font-medium text-foreground">Document Scanner</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-dms-orange bg-dms-orange/5' 
                  : 'border-border hover:border-dms-orange/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <ScanLine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">Position document or click to browse</p>
                <p className="text-sm text-muted-foreground">Supports PDF, Images, Audio, Video files</p>
                {file && (
                  <Badge variant="secondary" className="mt-2">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </Badge>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp3,.wav,.mp4"
              />
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Filling Type</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select filling type" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone">Zone</Label>
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((zoneNum) => (
                    <SelectItem key={zoneNum} value={zoneNum.toString()}>
                      {zoneNum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description"
              rows={4}
            />
          </div>

          {/* Scan Button */}
          <div className="mt-8">
            <Button 
              onClick={handleScan}
              disabled={scanning || !selectedType || !documentTitle}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {scanning ? (
                <>
                  <ScanLine className="w-4 h-4 mr-2 animate-pulse" />
                  {currentStep === 2 ? 'Scanning Document...' : 'Processing...'}
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4 mr-2" />
                  Start Scanning Document
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Barcode Scan Button */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Quick Barcode Lookup</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Quickly scan or search for documents using barcodes with our advanced search interface.
          </p>
          <Button 
            size="lg"
            className="w-full max-w-sm h-16 text-lg bg-primary hover:bg-primary/90"
            onClick={() => setActiveTab('DocumentLookup')}
          >
            <ScanLine className="w-6 h-6 mr-3" />
            {t('createBarcodeName')}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Scan;