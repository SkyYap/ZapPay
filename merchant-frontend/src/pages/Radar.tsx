import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Zap, Activity, Lock } from 'lucide-react';

export function Radar() {
  return (
    <div className="p-6 pt-12">
      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Radar Security</CardTitle>
          <CardDescription className="text-lg">
            Advanced fraud detection and security monitoring is coming soon
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            Our advanced fraud detection and security monitoring system is under development. 
            Soon you'll have real-time protection against fraudulent transactions and security threats.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Fraud Detection</h4>
                <p className="text-sm text-muted-foreground">
                  AI-powered fraud detection and prevention
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Real-time Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Continuous security monitoring and alerts
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Compliance Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Regulatory compliance and risk management
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