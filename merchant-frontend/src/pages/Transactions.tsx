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
  Filter, 
  Download, 
  ExternalLink,
  Calendar,
  CreditCard,
  Clock,
  Plus,
  Settings,
  MoreVertical,
  BarChart3
} from 'lucide-react';
import { mockTransactions } from '@/data/mockData';
import type { Transaction } from '@/types';

export function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ExternalLink className="h-4 w-4 text-blue-600" />;
      case 'deposit':
        return <ExternalLink className="h-4 w-4 text-purple-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCryptoAmount = (amount: number, currency: string) => {
    if (currency === 'BTC') return amount.toFixed(8);
    if (currency === 'ETH') return amount.toFixed(6);
    return amount.toFixed(2);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredTransactions.slice(0, 9).map(t => t.id));
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
    setSelectAll(newSelected.size === filteredTransactions.slice(0, 9).length);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-left">Transactions</h1>
          <p className="text-gray-600 mt-2">
            Track and manage all your crypto payment transactions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze
          </Button>
          <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === 'all' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedStatus('all')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedStatus === 'all' ? 'text-orange-700' : 'text-gray-600'}`}>All</p>
              <p className={`text-2xl font-bold ${selectedStatus === 'all' ? 'text-orange-900' : 'text-gray-900'}`}>58</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === 'succeeded' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedStatus('succeeded')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedStatus === 'succeeded' ? 'text-orange-700' : 'text-gray-600'}`}>Succeeded</p>
              <p className={`text-2xl font-bold ${selectedStatus === 'succeeded' ? 'text-orange-900' : 'text-gray-900'}`}>41</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === 'refunded' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedStatus('refunded')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedStatus === 'refunded' ? 'text-orange-700' : 'text-gray-600'}`}>Refunded</p>
              <p className={`text-2xl font-bold ${selectedStatus === 'refunded' ? 'text-orange-900' : 'text-gray-900'}`}>6</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === 'disputed' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedStatus('disputed')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedStatus === 'disputed' ? 'text-orange-700' : 'text-gray-600'}`}>Disputed</p>
              <p className={`text-2xl font-bold ${selectedStatus === 'disputed' ? 'text-orange-900' : 'text-gray-900'}`}>0</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === 'failed' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedStatus('failed')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedStatus === 'failed' ? 'text-orange-700' : 'text-gray-600'}`}>Failed</p>
              <p className={`text-2xl font-bold ${selectedStatus === 'failed' ? 'text-orange-900' : 'text-gray-900'}`}>2</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === 'uncaptured' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedStatus('uncaptured')}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedStatus === 'uncaptured' ? 'text-orange-700' : 'text-gray-600'}`}>Uncaptured</p>
              <p className={`text-2xl font-bold ${selectedStatus === 'uncaptured' ? 'text-orange-900' : 'text-gray-900'}`}>0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Date and time
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Amount
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Currency
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Status
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Payment method
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="h-3 w-3 mr-1" />
            More filters
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Edit columns
          </Button>
        </div>
      </div>

      {/* Transaction Table */}
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
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refunded date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Decline reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.slice(0, 9).map((transaction, index) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-400 text-orange-600 checked:bg-orange-600 checked:border-orange-600 focus:ring-orange-500 focus:ring-2 focus:ring-offset-2" 
                        checked={selectedItems.has(transaction.id)}
                        onChange={() => handleSelectItem(transaction.id)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </span>
                      <StatusBadge status={transaction.status} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const methods = ['USDT', 'USDC', 'ETH'] as const;
                        const method = methods[index % methods.length];
                        const colors = {
                          'USDT': 'bg-green-100 text-green-600',
                          'USDC': 'bg-blue-100 text-blue-600',
                          'ETH': 'bg-purple-100 text-purple-600'
                        } as const;
                        return (
                          <>
                            <span className="text-sm text-gray-900">{method}</span>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      Order {transaction.id.slice(-4)} from {transaction.customer.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{transaction.customer.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {new Date(transaction.timestamp).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}, {new Date(transaction.timestamp).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">—</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">—</span>
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
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Viewing 1-20 of 58 results
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}