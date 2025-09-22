import { useState, useRef } from 'react';
import { Camera, Upload, Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import CameraBarcodeScanner from '@/components/barcode/CameraBarcodeScanner';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

interface BarcodeSearchBarProps {
  onBarcodeSearch: (barcode: string) => void;
  placeholder?: string;
}

const BarcodeSearchBar = ({ onBarcodeSearch, placeholder = "Scan or enter barcode..." }: BarcodeSearchBarProps) => {
  const [barcodeValue, setBarcodeValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { searchByBarcode } = useAdvancedSearch();

  const handleManualInput = (value: string) => {
    setBarcodeValue(value);
    if (value.length > 3) {
      onBarcodeSearch(value);
    }
  };

  const handleCameraScan = () => {
    setShowDropdown(false);
    setShowCameraScanner(true);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    setBarcodeValue(barcode);
    onBarcodeSearch(barcode);
    setShowCameraScanner(false);
    
    // Also perform search with the detected barcode
    await searchByBarcode(barcode);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Mock image scanning - in real implementation, process image with barcode detection
      const reader = new FileReader();
      reader.onload = () => {
        setTimeout(() => {
          const mockBarcode = `IMG-${Date.now()}`;
          setBarcodeValue(mockBarcode);
          onBarcodeSearch(mockBarcode);
          setShowDropdown(false);
          toast({
            title: "Image Processed",
            description: `Barcode detected from image: ${mockBarcode}`,
          });
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={barcodeValue}
            onChange={(e) => handleManualInput(e.target.value)}
            className="pl-10 min-w-64"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Scan
        </Button>
      </div>

      {/* Scanning Options Dropdown */}
      {showDropdown && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-3">
              <p className="font-medium text-sm">Barcode Scanning Options</p>
              
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleCameraScan}
                  disabled={isScanning}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {isScanning ? 'Scanning...' : 'Use Camera to Scan'}
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image to Scan
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowDropdown(false);
                    // Focus on input for manual entry
                  }}
                >
                  <Barcode className="w-4 h-4 mr-2" />
                  Manual Entry
                </Button>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground">
                  <strong>Supported formats:</strong> CODE128, QR Code, DataMatrix
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Scan types:</strong> Rack barcodes, Document IDs, Customer codes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Camera Scanner Modal */}
      <CameraBarcodeScanner
        isOpen={showCameraScanner}
        onBarcodeDetected={handleBarcodeDetected}
        onClose={() => setShowCameraScanner(false)}
      />
    </div>
  );
};

export default BarcodeSearchBar;