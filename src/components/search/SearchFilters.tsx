import { useState } from 'react';
import { Filter, X, Calendar, Building, FileType, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchFiltersProps {
  activeFilters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
}

const SearchFilters = ({ activeFilters, onFiltersChange }: SearchFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...activeFilters };
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-muted-foreground" />
          <Select 
            value={activeFilters.customer || ''} 
            onValueChange={(value) => updateFilter('customer', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer-a">Customer A Corp</SelectItem>
              <SelectItem value="customer-b">Customer B Ltd</SelectItem>
              <SelectItem value="customer-c">Customer C Inc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <FileType className="w-4 h-4 text-muted-foreground" />
          <Select 
            value={activeFilters.documentType || ''} 
            onValueChange={(value) => updateFilter('documentType', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="legal">Legal Documents</SelectItem>
              <SelectItem value="financial">Financial Records</SelectItem>
              <SelectItem value="hr">HR Documents</SelectItem>
              <SelectItem value="technical">Technical Specs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select 
            value={activeFilters.dateRange || ''} 
            onValueChange={(value) => updateFilter('dateRange', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="ml-auto"
        >
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(activeFilters).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="flex items-center gap-2">
              {key}: {Array.isArray(value) ? value.join(', ') : value}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilter(key, undefined)}
              />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Advanced Search Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Location Filter */}
                <div className="space-y-3">
                  <Label className="font-medium">Location</Label>
                  <div className="space-y-2">
                    <Select 
                      value={activeFilters.warehouse || ''} 
                      onValueChange={(value) => updateFilter('warehouse', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wh001">Main Warehouse</SelectItem>
                        <SelectItem value="wh002">Secondary Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={activeFilters.zone || ''} 
                      onValueChange={(value) => updateFilter('zone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zone-a">Zone A</SelectItem>
                        <SelectItem value="zone-b">Zone B</SelectItem>
                        <SelectItem value="zone-c">Zone C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* File Properties */}
                <div className="space-y-3">
                  <Label className="font-medium">File Properties</Label>
                  <div className="space-y-2">
                    <Select 
                      value={activeFilters.fileType || ''} 
                      onValueChange={(value) => updateFilter('fileType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="File Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="doc">Word Documents</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="excel">Excel Files</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Input 
                        placeholder="Min size (MB)" 
                        type="number"
                        value={activeFilters.minSize || ''}
                        onChange={(e) => updateFilter('minSize', e.target.value)}
                      />
                      <Input 
                        placeholder="Max size (MB)" 
                        type="number"
                        value={activeFilters.maxSize || ''}
                        onChange={(e) => updateFilter('maxSize', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Filters */}
                <div className="space-y-3">
                  <Label className="font-medium">Status</Label>
                  <div className="space-y-2">
                    {['Active', 'Archived', 'Retention Due', 'Under Review'].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={status}
                          checked={activeFilters.status?.includes(status.toLowerCase()) || false}
                          onCheckedChange={(checked) => {
                            const currentStatus = activeFilters.status || [];
                            const newStatus = checked 
                              ? [...currentStatus, status.toLowerCase()]
                              : currentStatus.filter((s: string) => s !== status.toLowerCase());
                            updateFilter('status', newStatus);
                          }}
                        />
                        <Label htmlFor={status} className="text-sm">{status}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label className="font-medium">Tags</Label>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Enter tags (comma separated)"
                      value={activeFilters.tags || ''}
                      onChange={(e) => updateFilter('tags', e.target.value)}
                    />
                  </div>
                </div>

                {/* Custom Date Range */}
                <div className="space-y-3">
                  <Label className="font-medium">Custom Date Range</Label>
                  <div className="space-y-2">
                    <Input 
                      type="date"
                      placeholder="From"
                      value={activeFilters.dateFrom || ''}
                      onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    />
                    <Input 
                      type="date"
                      placeholder="To"
                      value={activeFilters.dateTo || ''}
                      onChange={(e) => updateFilter('dateTo', e.target.value)}
                    />
                  </div>
                </div>

                {/* Priority & Confidentiality */}
                <div className="space-y-3">
                  <Label className="font-medium">Classification</Label>
                  <div className="space-y-2">
                    <Select 
                      value={activeFilters.priority || ''} 
                      onValueChange={(value) => updateFilter('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priority Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={activeFilters.confidentiality || ''} 
                      onValueChange={(value) => updateFilter('confidentiality', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Confidentiality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="confidential">Confidential</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear All
                </Button>
                <Button onClick={() => setShowAdvanced(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchFilters;