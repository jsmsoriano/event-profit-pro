import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, PieChart, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRevenue } from '@/hooks/useRevenue';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const { revenue, analytics, loading, calculateAnalytics } = useRevenue();
  const [timeRange, setTimeRange] = useState('12m');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    if (timeRange === '12m') {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      calculateAnalytics(startDate.toISOString().split('T')[0]);
    } else if (timeRange === '6m') {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      calculateAnalytics(startDate.toISOString().split('T')[0]);
    } else if (timeRange === '3m') {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      calculateAnalytics(startDate.toISOString().split('T')[0]);
    }
  }, [timeRange, calculateAnalytics]);

  const exportReport = () => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Revenue', 'Food Costs', 'Labor Costs', 'Net Profit'].join(','),
      ...revenue.map(record => [
        record.revenue_date,
        record.gross_revenue,
        record.food_costs,
        record.labor_costs,
        record.net_profit
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `revenue-report-${timeRange}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your business performance and insights</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics?.totalRevenue.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange} period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics?.totalProfit.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.profitMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Event Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics?.averageEventRevenue.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              per event
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Payment Method</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{analytics?.topPaymentMethod || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              most used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.revenueByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, '']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.revenueByClient.slice(0, 5) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="client_name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Cash', value: revenue.filter(r => r.payment_method === 'cash').length },
                      { name: 'Credit', value: revenue.filter(r => r.payment_method === 'credit').length },
                      { name: 'Check', value: revenue.filter(r => r.payment_method === 'check').length },
                      { name: 'Bank Transfer', value: revenue.filter(r => r.payment_method === 'bank_transfer').length }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Revenue Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenue.slice(0, 10).map((record) => (
              <div key={record.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{new Date(record.revenue_date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {record.payment_method.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${record.gross_revenue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    Profit: ${record.net_profit.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}