import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Copy, 
  ExternalLink, 
  Eye, 
  BarChart3,
  Calendar,
  DollarSign,
  MousePointer,
  CreditCard
} from 'lucide-react';
import { mockPaymentLinks } from '@/data/mockData';

export function PaymentLinks() {
  const [selectedLink, setSelectedLink] = useState(mockPaymentLinks[0]);
  const [newLinkData, setNewLinkData] = useState({
    name: '',
    product: '',
    amount: '',
    currency: 'USD',
    hasExpiry: false,
    expiryDate: ''
  });

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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Configuration */}
        <div className="space-y-6">
          {/* Create New Link */}
          <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-amber-600" />
                Create Payment Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-left">
                <Label htmlFor="link-name" className="text-left">Link Name</Label>
                <Input
                  id="link-name"
                  value={newLinkData.name}
                  onChange={(e) => setNewLinkData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Subscription"
                  className="border-amber-200 focus:border-amber-400 text-left"
                />
              </div>
              
              <div className="text-left">
                <Label htmlFor="link-product" className="text-left">Product</Label>
                <Textarea
                  id="link-product"
                  value={newLinkData.product}
                  onChange={(e) => setNewLinkData(prev => ({ ...prev, product: e.target.value }))}
                  placeholder="Brief description of the product"
                  className="border-amber-200 focus:border-amber-400 text-left"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <Label htmlFor="link-amount" className="text-left">Amount</Label>
                  <Input
                    id="link-amount"
                    type="number"
                    value={newLinkData.amount}
                    onChange={(e) => setNewLinkData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="border-amber-200 focus:border-amber-400 text-left"
                  />
                </div>
                <div className="text-left">
                  <Label htmlFor="link-currency" className="text-left">Currency</Label>
                  <Input
                    id="link-currency"
                    value={newLinkData.currency}
                    readOnly
                    className="border-amber-200 bg-gray-50 text-left"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-left">
                <input 
                  type="checkbox" 
                  id="has-expiry"
                  className="rounded border-gray-400 text-orange-600 checked:bg-orange-600 checked:border-orange-600 focus:ring-orange-500 focus:ring-2 focus:ring-offset-2" 
                  checked={newLinkData.hasExpiry}
                  onChange={(e) => setNewLinkData(prev => ({ ...prev, hasExpiry: e.target.checked }))}
                />
                <Label htmlFor="has-expiry" className="text-left">Set expiration date</Label>
              </div>
              
              {newLinkData.hasExpiry && (
                <div className="text-left">
                  <Label htmlFor="expiry-date" className="text-left">Expiry Date</Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={newLinkData.expiryDate}
                    onChange={(e) => setNewLinkData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="border-amber-200 focus:border-amber-400 text-left"
                  />
                </div>
              )}
              
              <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                Create Payment Link
              </Button>
            </CardContent>
          </Card>

          {/* Existing Links */}
          <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center text-left">
                <CreditCard className="h-5 w-5 mr-2 text-amber-600" />
                Your Payment Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPaymentLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedLink?.id === link.id 
                        ? 'border-amber-400 bg-amber-50' 
                        : 'border-amber-200 hover:bg-amber-50/50'
                    }`}
                    onClick={() => setSelectedLink(link)}
                  >
                                         <div className="flex items-center justify-between">
                       <div className="text-left">
                         <h4 className="font-medium text-gray-900 text-left">{link.name}</h4>
                         <p className="text-sm text-gray-600 text-left">${link.amount}</p>
                       </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={link.isActive 
                            ? "bg-white text-orange-700 border hover:bg-orange-50 border-orange-200" 
                            : "bg-white text-gray-600 border hover:bg-gray-50 border-gray-200"
                          }
                        >
                          {link.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-white border border-gray-200 hover:bg-gray-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(link.url);
                          }}
                        >
                          <Copy className="h-3 w-3 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          {/* Preview Panel */}
          <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-amber-600" />
                Payment Terminal Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLink ? (
                <div className="border-2 border-dashed border-amber-200 rounded-lg p-6">
                  {/* Mock Payment Terminal */}
                  <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mx-auto flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {selectedLink.name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {selectedLink.description}
                        </p>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        ${selectedLink.amount}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                        Pay with Crypto
                      </Button>
                      <p className="text-xs text-gray-500">
                        Secure crypto payment powered by CryptoPay
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a payment link to preview</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Link Analytics */}
          {selectedLink && (
            <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-amber-600" />
                  Link Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${selectedLink.totalPaid}
                    </p>
                    <p className="text-sm text-gray-600">Total Received</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <MousePointer className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedLink.clickCount}
                    </p>
                    <p className="text-sm text-gray-600">Clicks</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Created
                    </span>
                    <span className="text-gray-900">
                      {formatDate(selectedLink.createdAt)}
                    </span>
                  </div>
                  {selectedLink.expiresAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Expires
                      </span>
                      <span className="text-gray-900">
                        {formatDate(selectedLink.expiresAt)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Payment URL</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white border border-gray-200 hover:bg-gray-50"
                        onClick={() => copyToClipboard(selectedLink.url)}
                      >
                        <Copy className="h-3 w-3 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white border border-gray-200 hover:bg-gray-50"
                        onClick={() => window.open('http://localhost:5173/cryptoPayUI', '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 break-all">
                    {selectedLink.url}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}