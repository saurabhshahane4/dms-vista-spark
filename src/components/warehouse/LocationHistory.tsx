import React from 'react';
import { History, ArrowRight, User, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWarehouse } from '@/hooks/useWarehouse';
import { format } from 'date-fns';

interface LocationHistoryProps {
  documentId?: string;
}

const LocationHistory: React.FC<LocationHistoryProps> = ({ documentId }) => {
  const { locationHistory, loading } = useWarehouse();

  const getActionBadge = (reason?: string) => {
    const action = reason?.toLowerCase() || 'moved';
    switch (action) {
      case 'assigned':
        return <Badge className="bg-green-100 text-green-800">Assigned</Badge>;
      case 'moved':
        return <Badge className="bg-blue-100 text-blue-800">Moved</Badge>;
      case 'returned':
        return <Badge className="bg-yellow-100 text-yellow-800">Returned</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Moved</Badge>;
    }
  };

  const formatLocation = (rack: any) => {
    if (!rack) return 'Unknown';
    return rack.barcode || rack.code || rack.name || 'Unknown';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <History className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Location History</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <History className="w-5 h-5 text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Location History</h3>
          <p className="text-sm text-muted-foreground">
            Track document movements and location changes
          </p>
        </div>
      </div>

      {locationHistory.length === 0 ? (
        <div className="text-center py-8">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No location history found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Movement</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationHistory.map((entry: any) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {entry.documents?.name || 'Unknown Document'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">
                        {formatLocation(entry.from_racks)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-mono">
                        {formatLocation(entry.to_racks)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getActionBadge(entry.reason)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(entry.moved_at), 'PPp')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {entry.notes || '-'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default LocationHistory;