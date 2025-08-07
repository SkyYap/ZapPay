import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, CreditCard, Calendar, Star, Zap, Clock } from 'lucide-react';

export function Billing() {
  return (
    <div className="p-6 pt-12">
      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Receipt className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Billing Management</CardTitle>
          <CardDescription className="text-lg">
            Comprehensive billing and subscription management is coming soon
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Our comprehensive billing and subscription management system is under development. 
            Soon you'll have complete control over your account billing and payment processing costs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Payment Methods</h4>
                <p className="text-sm text-muted-foreground">
                  Manage your payment methods and billing info
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Billing History</h4>
                <p className="text-sm text-muted-foreground">
                  View and download your billing statements
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Plan Management</h4>
                <p className="text-sm text-muted-foreground">
                  Upgrade or modify your subscription plan
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button disabled className="w-full md:w-auto">
              <Zap className="mr-2 h-4 w-4" />
              Get Notified
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}