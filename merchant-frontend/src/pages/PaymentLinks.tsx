import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { 
  Plus, 
  Copy, 
  BarChart3,
  CreditCard,
  ChevronDown,
  X,
  ArrowUp,
  Settings,
  MoreVertical
} from 'lucide-react';
import { api, type Product, type PaymentLink } from '@/services/api';

export function PaymentLinks() {
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLinkData, setCreateLinkData] = useState({
    linkName: '',
    productId: '',
    hasExpiry: false,
    expiryDate: ''
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Table state
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);

  // Fetch payment links on component mount
  useEffect(() => {
    fetchPaymentLinks();
  }, []);

  // Fetch products when modal opens
  useEffect(() => {
    if (isCreateModalOpen) {
      fetchProducts();
    }
  }, [isCreateModalOpen]);

  const fetchPaymentLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const response = await api.getPaymentLinks();
      if (response.success) {
        setPaymentLinks(response.payment_links || []);
      } else {
        console.error('Failed to fetch payment links:', response.error);
      }
    } catch (error) {
      console.error('Error fetching payment links:', error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await api.getProducts();
      if (response.success) {
        setProducts(response.products || []);
      } else {
        console.error('Failed to fetch products:', response.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleCreateLink = async () => {
    if (!createLinkData.linkName.trim() || !createLinkData.productId) {
      return;
    }

    setIsCreating(true);
    try {
      // Find the selected product
      const selectedProduct = products.find(p => p.id === createLinkData.productId);
      if (!selectedProduct) {
        console.error('Selected product not found');
        return;
      }

      // Prepare the data for API call
      const paymentLinkData = {
        link_name: createLinkData.linkName.trim(),
        product_name: selectedProduct.name,
        expiry_date: createLinkData.hasExpiry && createLinkData.expiryDate 
          ? new Date(createLinkData.expiryDate).toISOString()
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // Default to 1 year from now
      };

      const response = await api.createPaymentLink(paymentLinkData);

      if (response.success) {
        console.log('Payment link created successfully:', response.payment_link);
        // Reset form and close modal
        setCreateLinkData({
          linkName: '',
          productId: '',
          hasExpiry: false,
          expiryDate: ''
        });
        setIsCreateModalOpen(false);
        // Refresh the payment links list
        await fetchPaymentLinks();
      } else {
        console.error('Failed to create payment link:', response.error);
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setCreateLinkData({
      linkName: '',
      productId: '',
      hasExpiry: false,
      expiryDate: ''
    });
    setIsCreateModalOpen(false);
  };

  // Table handling functions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredPaymentLinks.map(link => link.id));
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
    setSelectAll(newSelected.size === filteredPaymentLinks.length);
  };

  const filteredPaymentLinks = paymentLinks;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // In a real app, you'd show a toast notification here
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-left">Payment Links</h1>
          <p className="text-gray-600 mt-2">
            Create and manage payment links for easy crypto transactions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analyze
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Payment Link</DialogTitle>
                <DialogDescription>
                  Create a new payment link for your customers. Select a product and configure the link settings.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="link-name" className="text-left">
                    Link Name
                  </Label>
                  <Input
                    id="link-name"
                    value={createLinkData.linkName}
                    onChange={(e) => setCreateLinkData(prev => ({ ...prev, linkName: e.target.value }))}
                    placeholder="Enter link name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product-select" className="text-left">
                    Product
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={createLinkData.productId}
                      onValueChange={(value) => setCreateLinkData(prev => ({ ...prev, productId: value }))}
                      disabled={isLoadingProducts}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Select a product"} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.pricing}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="has-expiry-modal"
                        className="rounded border-gray-400 text-orange-600 checked:bg-orange-600 checked:border-orange-600 focus:ring-orange-500 focus:ring-2 focus:ring-offset-2" 
                        checked={createLinkData.hasExpiry}
                        onChange={(e) => setCreateLinkData(prev => ({ ...prev, hasExpiry: e.target.checked }))}
                      />
                      <Label htmlFor="has-expiry-modal">Set expiration date</Label>
                    </div>
                  </div>
                </div>
                {createLinkData.hasExpiry && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiry-date-modal" className="text-left">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry-date-modal"
                      type="date"
                      value={createLinkData.expiryDate}
                      onChange={(e) => setCreateLinkData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancelCreate}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateLink}
                  disabled={!createLinkData.linkName.trim() || !createLinkData.productId || isCreating}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Payment Links Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card 
          className={`border-2 cursor-pointer hover:shadow-md transition-shadow ${selectedStatus === 'all' ? 'border-orange-200 bg-orange-50' : 'border border-gray-200'}`}
          onClick={() => setSelectedStatus('all')}
        >
          <CardContent className="p-3">
            <div className="text-center">
              <p className={`text-sm font-medium ${selectedStatus === 'all' ? 'text-orange-700' : 'text-gray-600'}`}>All</p>
              <p className={`text-xl font-bold ${selectedStatus === 'all' ? 'text-orange-900' : 'text-gray-900'}`}>
                {isLoadingLinks ? '...' : paymentLinks.length}
              </p>
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
              <p className={`text-xl font-bold ${selectedStatus === 'active' ? 'text-orange-900' : 'text-gray-900'}`}>
                {isLoadingLinks ? '...' : paymentLinks.filter(link => new Date(link.expiry_date) > new Date()).length}
              </p>
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
              <p className={`text-xl font-bold ${selectedStatus === 'archived' ? 'text-orange-900' : 'text-gray-900'}`}>
                {isLoadingLinks ? '...' : paymentLinks.filter(link => new Date(link.expiry_date) <= new Date()).length}
              </p>
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
            Export links
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Edit columns
          </Button>
        </div>
      </div>

      {/* Payment Links Table */}
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
                  Link Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
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
              {isLoadingLinks ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                      <span>Loading payment links...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPaymentLinks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payment links found.</p>
                    <p className="text-sm mt-1">Create your first payment link to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredPaymentLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-400 text-orange-600 checked:bg-orange-600 checked:border-orange-600 focus:ring-orange-500 focus:ring-2 focus:ring-offset-2" 
                          checked={selectedItems.has(link.id)}
                          onChange={() => handleSelectItem(link.id)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{link.link_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{link.product_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">${link.pricing} USD</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {link.expiry_date ? formatDate(link.expiry_date) : 'No expiry'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {formatDate(link.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {formatDate(link.updated_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-400 hover:text-gray-600 bg-transparent border-none shadow-none">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => copyToClipboard(`${window.location.origin}/payment/${link.payment_link}`)}
                            className="cursor-pointer"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy payment link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {isLoadingLinks ? 'Loading...' : `${filteredPaymentLinks.length} result${filteredPaymentLinks.length !== 1 ? 's' : ''}`}
      </div>
    </div>
  );
}