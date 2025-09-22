import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Box, Archive, TrendingUp, Users, FileText } from 'lucide-react';
import { useWarehouse } from '@/hooks/useWarehouse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  warehouseUtilization: Array<{
    warehouse: string;
    total_capacity: number;
    used_capacity: number;
    utilization_rate: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  capacityTrends: Array<{
    date: string;
    total_capacity: number;
    used_capacity: number;
  }>;
  topLocations: Array<{
    location: string;
    document_count: number;
    path: string;
  }>;
}

const LocationAnalytics = () => {
  const { user } = useAuth();
  const { warehouses, racks } = useWarehouse();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    warehouseUtilization: [],
    statusDistribution: [],
    capacityTrends: [],
    topLocations: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch warehouse utilization
      const { data: utilizationData, error: utilizationError } = await supabase
        .from('warehouses')
        .select(`
          id,
          name,
          zones(
            shelves(
              racks(
                capacity,
                current_count,
                status
              )
            )
          )
        `)
        .eq('user_id', user.id);

      if (utilizationError) throw utilizationError;

      // Process warehouse utilization
      const warehouseUtilization = utilizationData.map(warehouse => {
        let totalCapacity = 0;
        let usedCapacity = 0;

        warehouse.zones.forEach((zone: any) => {
          zone.shelves.forEach((shelf: any) => {
            shelf.racks.forEach((rack: any) => {
              totalCapacity += rack.capacity;
              usedCapacity += rack.current_count;
            });
          });
        });

        return {
          warehouse: warehouse.name,
          total_capacity: totalCapacity,
          used_capacity: usedCapacity,
          utilization_rate: totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0,
        };
      });

      // Calculate status distribution
      const statusCounts = {
        empty: 0,
        partial: 0,
        full: 0,
        'over-capacity': 0,
      };

      let totalRacks = 0;
      utilizationData.forEach(warehouse => {
        warehouse.zones.forEach((zone: any) => {
          zone.shelves.forEach((shelf: any) => {
            shelf.racks.forEach((rack: any) => {
              statusCounts[rack.status as keyof typeof statusCounts]++;
              totalRacks++;
            });
          });
        });
      });

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: totalRacks > 0 ? (count / totalRacks) * 100 : 0,
      }));

      // Fetch top locations by document count
      const { data: topLocationsData, error: topLocationsError } = await supabase
        .from('document_locations')
        .select(`
          rack_id,
          racks(
            name,
            code,
            shelves(
              name,
              zones(
                name,
                warehouses(name)
              )
            )
          )
        `)
        .eq('user_id', user.id);

      if (topLocationsError) throw topLocationsError;

      // Process top locations
      const locationCounts: { [key: string]: { count: number; path: string } } = {};
      
      topLocationsData.forEach((item: any) => {
        const rack = item.racks;
        if (!rack) return;

        const path = `${rack.shelves?.zones?.warehouses?.name} > ${rack.shelves?.zones?.name} > ${rack.shelves?.name} > ${rack.name}`;
        const key = `${rack.name} (${rack.code})`;
        
        if (!locationCounts[key]) {
          locationCounts[key] = { count: 0, path };
        }
        locationCounts[key].count++;
      });

      const topLocations = Object.entries(locationCounts)
        .map(([location, data]) => ({
          location,
          document_count: data.count,
          path: data.path,
        }))
        .sort((a, b) => b.document_count - a.document_count)
        .slice(0, 10);

      // Generate mock capacity trends (in a real app, this would come from historical data)
      const capacityTrends = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        
        const totalCapacity = warehouseUtilization.reduce((sum, w) => sum + w.total_capacity, 0);
        const baseUsed = warehouseUtilization.reduce((sum, w) => sum + w.used_capacity, 0);
        
        return {
          date: date.toISOString().split('T')[0],
          total_capacity: totalCapacity,
          used_capacity: Math.max(0, baseUsed + Math.floor(Math.random() * 20 - 10)),
        };
      });

      setAnalytics({
        warehouseUtilization,
        statusDistribution,
        capacityTrends,
        topLocations,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const totalCapacity = analytics.warehouseUtilization.reduce((sum, w) => sum + w.total_capacity, 0);
  const totalUsed = analytics.warehouseUtilization.reduce((sum, w) => sum + w.used_capacity, 0);
  const overallUtilization = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;

  const COLORS = {
    empty: '#94a3b8', // muted
    partial: '#f59e0b', // warning
    full: '#10b981', // success  
    'over-capacity': '#ef4444', // destructive
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Location Analytics</h1>
        <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-dms-blue/10 rounded-lg">
              <Building2 className="w-6 h-6 text-dms-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Warehouses</p>
              <p className="text-2xl font-bold">{warehouses.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-dms-green/10 rounded-lg">
              <Archive className="w-6 h-6 text-dms-green" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Racks</p>
              <p className="text-2xl font-bold">{racks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-dms-purple/10 rounded-lg">
              <FileText className="w-6 h-6 text-dms-purple" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documents Stored</p>
              <p className="text-2xl font-bold">{totalUsed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-dms-orange/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-dms-orange" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilization Rate</p>
              <p className="text-2xl font-bold">{overallUtilization.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse Utilization */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Warehouse Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.warehouseUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="warehouse" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'utilization_rate' ? `${value}%` : value,
                  name === 'utilization_rate' ? 'Utilization Rate' : 
                  name === 'total_capacity' ? 'Total Capacity' : 'Used Capacity'
                ]}
              />
              <Bar dataKey="total_capacity" fill="hsl(var(--muted))" name="total_capacity" />
              <Bar dataKey="used_capacity" fill="hsl(var(--primary))" name="used_capacity" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rack Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.status} (${(props.percentage || 0).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capacity Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Capacity Trends (30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.capacityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [
                  value,
                  name === 'total_capacity' ? 'Total Capacity' : 'Used Capacity'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="total_capacity" 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5"
                name="total_capacity"
              />
              <Line 
                type="monotone" 
                dataKey="used_capacity" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="used_capacity"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Locations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Most Used Locations</h3>
          <div className="space-y-3">
            {analytics.topLocations.map((location, index) => (
              <div key={location.location} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{location.location}</p>
                    <p className="text-sm text-muted-foreground">{location.path}</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {location.document_count} docs
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-dms-blue">Capacity Planning</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Overall utilization: {overallUtilization.toFixed(1)}%</li>
              <li>• {analytics.statusDistribution.find(s => s.status === 'over-capacity')?.count || 0} racks are over capacity</li>
              <li>• {analytics.statusDistribution.find(s => s.status === 'empty')?.count || 0} racks are empty and available</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-dms-green">Optimization Opportunities</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Consider redistributing documents from over-capacity racks</li>
              <li>• {analytics.topLocations.length} locations are being heavily utilized</li>
              <li>• Review access patterns for frequently used locations</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LocationAnalytics;