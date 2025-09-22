import { FileText, Calendar, User, HardDrive, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DocumentProperty {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface DocumentPropertyCardProps {
  title: string;
  properties: DocumentProperty[];
  className?: string;
}

const DocumentPropertyCard = ({ title, properties, className = '' }: DocumentPropertyCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {properties.map((property, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {property.icon}
                <span className="text-sm text-muted-foreground">{property.label}:</span>
              </div>
              <div className="text-sm font-medium">{property.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPropertyCard;