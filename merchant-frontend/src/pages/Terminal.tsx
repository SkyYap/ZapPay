import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Tablet, Zap } from 'lucide-react';

export function Terminal() {
  return (
    <div className="p-6 pt-12">
      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Monitor className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">POS Terminal</CardTitle>
          <CardDescription className="text-lg">
            Point-of-sale crypto payment terminal is coming soon
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Our crypto payment terminal is currently in development. Soon you'll be able to accept 
            cryptocurrency payments in-person with our sleek POS solution.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Monitor className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Desktop Terminal</h4>
                <p className="text-sm text-muted-foreground">
                  Full-featured POS system for countertop use
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Tablet className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Tablet Solution</h4>
                <p className="text-sm text-muted-foreground">
                  Portable tablet-based payment processing
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Mobile App</h4>
                <p className="text-sm text-muted-foreground">
                  Accept payments anywhere with your smartphone
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button disabled className="w-full md:w-auto">
              <Zap className="mr-2 h-4 w-4" />
              Join Waitlist
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}