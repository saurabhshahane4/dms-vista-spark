import { useState } from 'react';
import { 
  Calendar, 
  Filter, 
  Download, 
  User, 
  Eye, 
  Edit, 
  Move, 
  Share, 
  Trash2, 
  Upload, 
  Check, 
  X,
  Clock,
  Archive,
  Printer,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { DatePickerWithRange } from '@/components/ui/date-picker';

interface EventTimelineProps {
  events: any[];
}

export const EventTimeline = ({ events }: EventTimelineProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [dateRange, setDateRange] = useState<any>(null);

  // Mock comprehensive event data
  const mockEvents = [
    {
      id: '1',
      type: 'created',
      user_name: 'John Doe',
      user_email: 'john.doe@company.com',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      details: { 
        source: 'Web Upload',
        ip_address: '192.168.1.100',
        file_size: '2.5 MB',
        original_name: 'contract_draft.pdf'
      },
      category: 'lifecycle'
    },
    {
      id: '2',
      type: 'viewed',
      user_name: 'Jane Smith',
      user_email: 'jane.smith@company.com',
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      details: { 
        duration: '5 minutes',
        ip_address: '192.168.1.105',
        browser: 'Chrome 119'
      },
      category: 'access'
    },
    {
      id: '3',
      type: 'modified',
      user_name: 'Bob Johnson',
      user_email: 'bob.johnson@company.com',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      details: { 
        changes: 'Updated metadata tags',
        fields_changed: ['tags', 'category'],
        old_category: 'Draft',
        new_category: 'Legal'
      },
      category: 'lifecycle'
    },
    {
      id: '4',
      type: 'shared',
      user_name: 'Alice Williams',
      user_email: 'alice.williams@company.com',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      details: { 
        shared_with: 'legal-team@company.com',
        permission_level: 'read',
        expires_at: '2024-02-15'
      },
      category: 'access'
    },
    {
      id: '5',
      type: 'downloaded',
      user_name: 'Charlie Brown',
      user_email: 'charlie.brown@company.com',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      details: { 
        format: 'PDF',
        ip_address: '192.168.1.110',
        download_reason: 'External review'
      },
      category: 'access'
    },
    {
      id: '6',
      type: 'moved',
      user_name: 'David Wilson',
      user_email: 'david.wilson@company.com',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      details: { 
        from_location: 'Warehouse A, Zone 1, Shelf 2, Rack R001',
        to_location: 'Warehouse A, Zone 2, Shelf 1, Rack R005',
        reason: 'Reorganization',
        barcode: 'WHA-Z2-S1-R005'
      },
      category: 'location'
    },
    {
      id: '7',
      type: 'approved',
      user_name: 'Eva Garcia',
      user_email: 'eva.garcia@company.com',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      details: { 
        approval_stage: 'Legal Review',
        comments: 'All terms are acceptable',
        workflow_id: 'WF-2024-001'
      },
      category: 'workflow'
    },
    {
      id: '8',
      type: 'printed',
      user_name: 'Frank Miller',
      user_email: 'frank.miller@company.com',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      details: { 
        printer: 'Office Printer 3',
        copies: 2,
        paper_size: 'A4',
        color: 'Black & White'
      },
      category: 'access'
    }
  ];

  const getEventIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      created: <Upload className="w-4 h-4" />,
      modified: <Edit className="w-4 h-4" />,
      viewed: <Eye className="w-4 h-4" />,
      downloaded: <Download className="w-4 h-4" />,
      shared: <Share className="w-4 h-4" />,
      moved: <Move className="w-4 h-4" />,
      approved: <Check className="w-4 h-4" />,
      rejected: <X className="w-4 h-4" />,
      archived: <Archive className="w-4 h-4" />,
      printed: <Printer className="w-4 h-4" />,
      checkedOut: <Lock className="w-4 h-4" />,
      checkedIn: <Unlock className="w-4 h-4" />,
      deleted: <Trash2 className="w-4 h-4" />
    };
    return iconMap[type] || <Clock className="w-4 h-4" />;
  };

  const getEventColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      created: 'text-green-600 bg-green-50 dark:bg-green-900/50',
      modified: 'text-blue-600 bg-blue-50 dark:bg-blue-900/50',
      viewed: 'text-gray-600 bg-gray-50 dark:bg-gray-800/50',
      downloaded: 'text-purple-600 bg-purple-50 dark:bg-purple-900/50',
      shared: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/50',
      moved: 'text-blue-600 bg-blue-50 dark:bg-blue-900/50',
      approved: 'text-green-600 bg-green-50 dark:bg-green-900/50',
      rejected: 'text-red-600 bg-red-50 dark:bg-red-900/50',
      archived: 'text-gray-600 bg-gray-50 dark:bg-gray-800/50',
      printed: 'text-orange-600 bg-orange-50 dark:bg-orange-900/50',
      checkedOut: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/50',
      checkedIn: 'text-green-600 bg-green-50 dark:bg-green-900/50',
      deleted: 'text-red-600 bg-red-50 dark:bg-red-900/50'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-50 dark:bg-gray-800/50';
  };

  const formatEventTitle = (type: string) => {
    const titleMap: { [key: string]: string } = {
      created: 'Document Created',
      modified: 'Document Modified',
      viewed: 'Document Viewed',
      downloaded: 'Document Downloaded',
      shared: 'Document Shared',
      moved: 'Location Changed',
      approved: 'Document Approved',
      rejected: 'Document Rejected',
      archived: 'Document Archived',
      printed: 'Document Printed',
      checkedOut: 'Document Checked Out',
      checkedIn: 'Document Checked In',
      deleted: 'Document Deleted'
    };
    return titleMap[type] || 'Unknown Event';
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportEventLog = () => {
    const csvContent = [
      ['Timestamp', 'Event Type', 'User', 'Details'].join(','),
      ...mockEvents.map(event => [
        event.timestamp.toISOString(),
        event.type,
        event.user_name,
        JSON.stringify(event.details)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document_event_log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(event.details).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedEventType === 'all' || event.category === selectedEventType;
    
    return matchesSearch && matchesType;
  });

  return (
    <Card className="h-full flex flex-col">
      {/* Filters */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Event Timeline</h3>
          <Button variant="outline" size="sm" onClick={exportEventLog}>
            <Download className="w-4 h-4 mr-2" />
            Export Log
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search events, users, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="lifecycle">Lifecycle</SelectItem>
              <SelectItem value="access">Access</SelectItem>
              <SelectItem value="workflow">Workflow</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
          
          {/* <DatePickerWithRange onSelect={setDateRange} /> */}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1">
        <ScrollArea className="h-full p-6">
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline line */}
                {index < filteredEvents.length - 1 && (
                  <div className="absolute left-6 top-12 w-px h-8 bg-border" />
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Event Icon */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {formatEventTitle(event.type)}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {event.category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              by {event.user_name}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {formatTimestamp(event.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Event Details */}
                      <div className="mt-3 space-y-2">
                        {Object.entries(event.details).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="font-medium text-right max-w-xs truncate">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};