import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Package,
  DollarSign,
  Edit,
  MoreVertical,
  Image as ImageIcon,
  BarChart3,
  ChevronDown,
  X,
  ArrowUp,
  Settings
} from 'lucide-react';
import { mockProducts } from '@/data/mockData';

export function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredProducts.map(p => p.id));
      setSelectedItems(allIds);
      setSelectAll(true);
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredProducts.length);
  };

  const categories = [...new Set(mockProducts.map(p => p.category))];
  const totalValue = mockProducts.reduce((sum, product) => 
    sum + (product.price * product.stock), 0
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 text-left">Product Catalog</h1>
                  <p className="text-gray-600 mt-2">
                    Manage your inventory and product listings for crypto payments.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-gray-300">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                  <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create product
                  </Button>
                </div>
              </div>





      {/* Product Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === 'all' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedStatus('all')}
        >
          <CardContent className="p-3">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedStatus === 'all' ? 'text-orange-700' : 'text-gray-600'}`}>All</p>
              <p className={`text-xl font-bold ${selectedStatus === 'all' ? 'text-orange-900' : 'text-gray-900'}`}>1</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === 'active' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedStatus('active')}
        >
          <CardContent className="p-3">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedStatus === 'active' ? 'text-orange-700' : 'text-gray-600'}`}>Active</p>
              <p className={`text-xl font-bold ${selectedStatus === 'active' ? 'text-orange-900' : 'text-gray-900'}`}>1</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === 'archived' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedStatus('archived')}
        >
          <CardContent className="p-3">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedStatus === 'archived' ? 'text-orange-700' : 'text-gray-600'}`}>Archived</p>
              <p className={`text-xl font-bold ${selectedStatus === 'archived' ? 'text-orange-900' : 'text-gray-900'}`}>0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Created
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Status Active
            <ChevronDown className="h-3 w-3 ml-1" />
            <X className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <ArrowUp className="h-3 w-3 mr-1" />
            Export prices
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <ArrowUp className="h-3 w-3 mr-1" />
            Export products
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Edit columns
          </Button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-400 text-orange-600 checked:bg-orange-600 checked:border-orange-600 focus:ring-orange-500 focus:ring-2 focus:ring-offset-2" 
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-400 text-orange-600 checked:bg-orange-600 checked:border-orange-600 focus:ring-orange-500 focus:ring-2 focus:ring-offset-2" 
                        checked={selectedItems.has(product.id)}
                        onChange={() => handleSelectItem(product.id)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                        <Package className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm text-gray-900">${product.price} USD</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {new Date().toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {new Date().toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-600 bg-transparent border-none shadow-none">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No products found matching your filters.</p>
          <p className="text-sm mt-1">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}