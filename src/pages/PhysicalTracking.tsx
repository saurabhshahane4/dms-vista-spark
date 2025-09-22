import { useState } from 'react';
import { FileText, MapPin, Package, Calendar, User, Building2, Archive, Box, BarChart, CheckCircle, ScanLine, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWarehouseNavigation } from '@/contexts/WarehouseContext';
import WarehouseModule from '@/components/warehouse/WarehouseModule';

const physicalStats = {
  totalFiles: 8234,
  available: 7891,
  checkedOut: 298,
  inTransit: 45
};

const recentActivity = [
  {
    id: "DOC-2024-001",
    name: "Annual Financial Report 2024",
    status: "available",
    location: "A-1-001"
  },
  {
    id: "DOC-2024-002", 
    name: "Employee Handbook Update",
    status: "checked-out",
    location: "B-2-005"
  },
  {
    id: "DOC-2024-003",
    name: "Contract Agreement - Vendor XYZ", 
    status: "in-transit",
    location: "C-1-010"
  }
];

const PhysicalTracking = () => {
  const [activeSubTab, setActiveSubTab] = useState("overview");

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'checked-out':
        return <User className="w-4 h-4 text-yellow-600" />;
      case 'in-transit':
        return <Package className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg p-6 border border-border/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Archive className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Physical Document Tracking</h2>
            <p className="text-sm text-muted-foreground">Track and manage physical document locations</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Physical Files</p>
              <p className="text-3xl font-bold text-foreground">{physicalStats.totalFiles.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Archive className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available</p>
              <p className="text-3xl font-bold text-foreground">{physicalStats.available.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Checked Out</p>
              <p className="text-3xl font-bold text-foreground">{physicalStats.checkedOut}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">In Transit</p>
              <p className="text-3xl font-bold text-foreground">{physicalStats.inTransit}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Sub Navigation */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Document Tracking
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Storage Locations
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Physical Document Overview */}
          <Card className="p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Physical Document Overview</h3>
                <p className="text-sm text-muted-foreground">Monitor and manage physical document locations and status</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <Button className="bg-primary hover:bg-primary/90">
                <ScanLine className="w-4 h-4 mr-2" />
                Scan Barcode
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-4">Recent Activity</h4>
              <div className="space-y-3">
                {recentActivity.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(doc.status)}
                      <div>
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusVariant(doc.status)}>
                        {doc.status.replace('-', ' ')}
                      </Badge>
                      <span className="text-sm font-mono text-muted-foreground">{doc.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6 mt-6">
          <Card className="p-6 border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Document Tracking</h3>
                  <p className="text-sm text-muted-foreground">Track physical document locations and movements</p>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <ScanLine className="w-4 h-4 mr-2" />
                Scan Document
              </Button>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <select className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>All Status</option>
                <option>Available</option>
                <option>Checked Out</option>
                <option>In Transit</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="font-medium text-foreground">Annual Financial Report 2024</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>DOC-2024-001</span>
                      <span>📍 A-1-001</span>
                      <span>📅 1/15/2024</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800">available</Badge>
                  <Button variant="outline" size="sm">Details</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="font-medium text-foreground">Employee Handbook Update</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>DOC-2024-002</span>
                      <span>📍 B-2-005</span>
                      <span>👤 sarah.johnson</span>
                      <span>📅 1/16/2024</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-yellow-100 text-yellow-800">checked-out</Badge>
                  <Button variant="outline" size="sm">Details</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-foreground">Contract Agreement - Vendor XYZ</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>DOC-2024-003</span>
                      <span>📍 C-1-010</span>
                      <span>📅 1/17/2024</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-100 text-blue-800">in-transit</Badge>
                  <Button variant="outline" size="sm">Details</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6 mt-6">
          <WarehouseModule />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Inventory Management</h3>
            <p className="text-muted-foreground">Complete inventory audits and reconciliation tools.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PhysicalTracking;