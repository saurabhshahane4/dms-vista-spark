import { useState, useRef } from "react";
import { ArrowLeft, Upload, FileText, Image, PenTool, Mic, Video, UploadCloud } from "lucide-react";
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
  "Human Resources",
  "Finance",
  "Legal", 
  "Marketing",
  "Operations",
  "IT",
  "Sales",
  "Administration"
];

const EnhancedUpload = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
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

  const handleUpload = async () => {
    if (!file || !user || !documentTitle.trim() || !selectedType) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields and select a file.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setCurrentStep(2);
    
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document record
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: documentTitle,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          tags: tagsArray,
          status: 'active'
        });

      if (dbError) throw dbError;

      setCurrentStep(3);
      
      setTimeout(() => {
        toast({
          title: 'Success',
          description: 'Document uploaded and processed successfully!',
        });
        handleBackToDashboard();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
      setCurrentStep(1);
    } finally {
      setUploading(false);
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
                Enhanced Document <span className="text-dms-purple">Upload</span>
              </h1>
              <p className="text-sm text-muted-foreground">AI-Powered Processing & Analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Welcome Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome {displayName}, ready to upload documents?
          </h2>
          <p className="text-muted-foreground">
            Our AI-powered system will process, analyze, and organize your documents automatically
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-dms-blue text-white' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <span className={currentStep >= 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              Upload
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-dms-blue text-white' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <span className={currentStep >= 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              Processing
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-dms-blue text-white' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
            <span className={currentStep >= 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              Result
            </span>
          </div>
        </div>

        {/* Enhanced Document Upload Section */}
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Enhanced Document Upload</h3>
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
                    selectedType === type.id ? 'border-2 border-dms-blue bg-dms-blue/10' : ''
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

          {/* File Upload Area */}
          <div className="space-y-4 mb-6">
            <Label className="text-sm font-medium text-foreground">Select File</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-dms-blue bg-dms-blue/5' 
                  : 'border-border hover:border-dms-blue/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">Drop files here or click to browse</p>
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
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
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
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags (comma separated)"
              />
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

          {/* Upload Button */}
          <div className="mt-8">
            <Button 
              onClick={handleUpload}
              disabled={uploading || !file || !selectedType || !documentTitle}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white"
            >
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  {currentStep === 2 ? 'Processing Document...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Process Document
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedUpload;