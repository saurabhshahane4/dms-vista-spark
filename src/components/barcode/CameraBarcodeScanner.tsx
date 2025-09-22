import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Camera, X, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CameraBarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const CameraBarcodeScanner = ({ onBarcodeDetected, onClose, isOpen }: CameraBarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Check for camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      setHasPermission(true);
      
      // Initialize barcode reader
      codeReaderRef.current = new BrowserMultiFormatReader();
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Start scanning
        codeReaderRef.current.decodeFromVideoDevice(
          undefined, // Use default camera
          videoRef.current,
          (result, error) => {
            if (result) {
              const barcodeText = result.getText();
              setDetectedBarcode(barcodeText);
              onBarcodeDetected(barcodeText);
              
              toast({
                title: "Barcode Detected!",
                description: `Successfully scanned: ${barcodeText}`,
              });
              
              // Auto-close after successful scan
              setTimeout(() => {
                onClose();
              }, 1500);
            }
            
            if (error && !(error instanceof NotFoundException)) {
              console.error('Barcode scanning error:', error);
            }
          }
        );
      }
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setHasPermission(false);
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setDetectedBarcode(null);
  };

  const retryPermission = async () => {
    setHasPermission(null);
    setError(null);
    await initializeScanner();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Barcode Scanner
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {hasPermission === null ? (
            <div className="text-center py-8">
              <Zap className="w-8 h-8 mx-auto mb-4 text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">Requesting camera access...</p>
            </div>
          ) : hasPermission === false ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
              <p className="text-sm text-muted-foreground mb-4">
                {error || 'Camera access denied. Please enable camera permissions to scan barcodes.'}
              </p>
              <Button onClick={retryPermission}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {detectedBarcode ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 mx-auto mb-4 text-green-500" />
                  <p className="text-sm font-medium">Barcode Detected!</p>
                  <p className="text-xs text-muted-foreground break-all mt-2 p-2 bg-muted rounded">
                    {detectedBarcode}
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                        
                        {/* Scanning line animation */}
                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Position the barcode within the frame
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports: QR Code, Code 128, DataMatrix, and more
                    </p>
                  </div>
                </>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                {!detectedBarcode && (
                  <Button onClick={retryPermission} className="flex-1">
                    Retry
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraBarcodeScanner;