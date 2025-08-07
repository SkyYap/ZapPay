import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  CreditCard, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  Activity,
  Clock,
  Plus
} from 'lucide-react';
import { mockDashboardStats, mockTransactions, mockChartData } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Home() {
  const navigate = useNavigate();
  const recentTransactions = mockTransactions.slice(0, 5);
  const chartData = mockChartData.slice(-7); // Last 7 days

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Sky!</h1>
        <p className="text-muted-foreground">
          Browse our developer docs or explore all the ways to start using Stripe.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${mockDashboardStats.totalRevenue.toLocaleString()}`}
          change={mockDashboardStats.revenueChange}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Transactions"
          value={mockDashboardStats.totalTransactions.toLocaleString()}
          change={mockDashboardStats.transactionChange}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Active Customers"
          value={mockDashboardStats.activeCustomers.toLocaleString()}
          change={mockDashboardStats.customerChange}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Conversion Rate"
          value={`${mockDashboardStats.conversionRate}%`}
          change={mockDashboardStats.conversionChange}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Revenue over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`$${value}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest payment activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {transaction.customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${transaction.amount}
                    </p>
                    <StatusBadge status={transaction.status} />
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/transactions')}
            >
              View All Transactions
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 flex-col items-start">
              <Plus className="mb-2 h-4 w-4" />
              <span>Create Payment Link</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start">
              <CreditCard className="mb-2 h-4 w-4" />
              <span>View All Transactions</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col items-start">
              <Activity className="mb-2 h-4 w-4" />
              <span>Download Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}