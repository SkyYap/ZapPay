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
  Plus, 
  Package,
  MoreVertical,
  BarChart3,
  ChevronDown,
  X,
  ArrowUp,
  Settings
} from 'lucide-react';
import { api, type Product } from '@/services/api';

export function Products() {
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

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

  const filteredProducts = products;

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

  const [isLoading, setIsLoading] = useState(false);

  const handleCreateProduct = async () => {
    if (!productName.trim() || !productPrice.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.createProduct({
        name: productName.trim(),
        pricing: parseFloat(productPrice)
      });

      if (response.success) {
        console.log('Product created successfully:', response.product);
        // Reset form and close modal
        setProductName('');
        setProductPrice('');
        setIsCreateModalOpen(false);
        // Refresh the products list
        await fetchProducts();
      } else {
        console.error('Failed to create product:', response.error);
        // TODO: Show error message to user
      }
    } catch (error) {
      console.error('Error creating product:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setProductName('');
    setProductPrice('');
    setIsCreateModalOpen(false);
  };


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
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Product</DialogTitle>
                        <DialogDescription>
                          Add a new product to your catalog. Fill in the details below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="product-name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="product-name"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="Enter product name"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="product-price" className="text-right">
                            Price
                          </Label>
                          <Input
                            id="product-price"
                            type="number"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            placeholder="0.00"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={handleCancelCreate}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateProduct}
                          disabled={!productName.trim() || !productPrice.trim() || isLoading}
                          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                        >
                          {isLoading ? 'Creating...' : 'Create Product'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
              <p className={`text-xl font-bold ${selectedStatus === 'all' ? 'text-orange-900' : 'text-gray-900'}`}>
                {isLoadingProducts ? '...' : products.length}
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
                {isLoadingProducts ? '...' : products.length}
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
              {isLoadingProducts ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No products found.</p>
                    <p className="text-sm mt-1">Create your first product to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
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
                        <div className="text-sm text-gray-900">${product.pricing} USD</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {new Date(product.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {new Date(product.updated_at).toLocaleDateString('en-US', { 
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {isLoadingProducts ? 'Loading...' : `${filteredProducts.length} result${filteredProducts.length !== 1 ? 's' : ''}`}
      </div>
    </div>
  );
}