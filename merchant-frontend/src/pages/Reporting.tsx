import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, Zap } from 'lucide-react';

export function Reporting() {
  return (
    <div className="p-6 pt-12">
      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Analytics Dashboard</CardTitle>
          <CardDescription className="text-lg">
            Advanced reporting and analytics features are coming soon
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            We're working hard to bring you comprehensive analytics, detailed reports, 
            and powerful insights to help you grow your crypto payment business.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Real-time Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Live performance metrics and insights
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Advanced Reports</h4>
                <p className="text-sm text-muted-foreground">
                  Detailed financial and business reports
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Custom Dashboards</h4>
                <p className="text-sm text-muted-foreground">
                  Personalized analytics views
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button disabled className="w-full md:w-auto">
              <Clock className="mr-2 h-4 w-4" />
              Notify When Available
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}