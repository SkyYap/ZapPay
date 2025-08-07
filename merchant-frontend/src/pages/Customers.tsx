import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  UserPlus, 
  Mail, 
  Calendar,
  DollarSign,
  CreditCard,
  MoreVertical,
  Eye,
  Copy,
  Download,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  Plus
} from 'lucide-react';
import { mockCustomers } from '@/data/mockData';

export function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const filterOptions = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'created-date', label: 'Created date', icon: Calendar },
    { id: 'type', label: 'Type', icon: Settings },
    { id: 'more', label: 'More filters', icon: Plus },
  ];

  const actionButtons = [
    { id: 'copy', label: 'Copy', icon: Copy },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'analyze', label: 'Analyze', icon: BarChart3 },
    { id: 'edit-columns', label: 'Edit columns', icon: Settings },
  ];

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(currentCustomers.map(c => c.id));
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
    setSelectAll(newSelected.size === currentCustomers.length);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-left">Customers</h1>
          <p className="text-gray-600 mt-2">
            Manage your customer relationships and payment history.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Add customer
        </Button>
      </div>

      {/* Customer Segments */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedSegment === 'all' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedSegment('all')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedSegment === 'all' ? 'text-orange-700' : 'text-gray-600'}`}>All</p>
              <p className={`text-2xl font-bold ${selectedSegment === 'all' ? 'text-orange-900' : 'text-gray-900'}`}>58</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedSegment === 'top' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedSegment('top')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedSegment === 'top' ? 'text-orange-700' : 'text-gray-600'}`}>Top customers</p>
              <p className={`text-2xl font-bold ${selectedSegment === 'top' ? 'text-orange-900' : 'text-gray-900'}`}>12</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedSegment === 'first-time' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedSegment('first-time')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedSegment === 'first-time' ? 'text-orange-700' : 'text-gray-600'}`}>First-time customers</p>
              <p className={`text-2xl font-bold ${selectedSegment === 'first-time' ? 'text-orange-900' : 'text-gray-900'}`}>8</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedSegment === 'repeat' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedSegment('repeat')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedSegment === 'repeat' ? 'text-orange-700' : 'text-gray-600'}`}>Repeat customers</p>
              <p className={`text-2xl font-bold ${selectedSegment === 'repeat' ? 'text-orange-900' : 'text-gray-900'}`}>23</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedSegment === 'recent' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedSegment('recent')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedSegment === 'recent' ? 'text-orange-700' : 'text-gray-600'}`}>Recent customers</p>
              <p className={`text-2xl font-bold ${selectedSegment === 'recent' ? 'text-orange-900' : 'text-gray-900'}`}>15</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedSegment === 'high-refunds' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedSegment('high-refunds')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedSegment === 'high-refunds' ? 'text-orange-700' : 'text-gray-600'}`}>High refunds</p>
              <p className={`text-2xl font-bold ${selectedSegment === 'high-refunds' ? 'text-orange-900' : 'text-gray-900'}`}>3</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedSegment === 'high-disputes' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedSegment('high-disputes')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedSegment === 'high-disputes' ? 'text-orange-700' : 'text-gray-600'}`}>High disputes</p>
              <p className={`text-2xl font-bold ${selectedSegment === 'high-disputes' ? 'text-orange-900' : 'text-gray-900'}`}>1</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((filter) => (
            <Button
              key={filter.id}
              variant="outline"
              size="sm"
              className="rounded-full border-gray-300 hover:border-gray-400"
            >
              <Plus className="h-3 w-3 mr-1" />
              {filter.label}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          {actionButtons.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="border-gray-300 hover:border-gray-400"
            >
              <action.icon className="h-4 w-4 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
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
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default payment method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total spend
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payments
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refunds
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disputes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
              </tr>
            </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
              {currentCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-400 text-orange-600 checked:bg-orange-600 checked:border-orange-600 focus:ring-orange-500 focus:ring-2 focus:ring-offset-2" 
                        checked={selectedItems.has(customer.id)}
                        onChange={() => handleSelectItem(customer.id)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{customer.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {/* Empty for now */}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{formatDate(customer.lastSeen)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{formatCurrency(customer.totalSpent)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{customer.totalTransactions}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{formatCurrency(0)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">R</span>
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {filteredCustomers.length} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="border-gray-300"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="border-gray-300"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No customers found matching your search.</p>
            <p className="text-sm mt-1">Try adjusting your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}