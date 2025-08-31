
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Calendar, TrendingUp, Phone, UserCheck, Building, Home, Globe } from "lucide-react";
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {data.fullTimeEmployees} full-time, {data.partTimeEmployees} part-time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeBookings}</div>
            <p className="text-xs text-muted-foreground">Pending and in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month completed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Follow-ups</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todaysFollowUps}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Unique customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domestic Customers</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.domesticCustomers}</div>
            <p className="text-xs text-muted-foreground">Individual customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corporate Customers</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.corporateCustomers}</div>
            <p className="text-xs text-muted-foreground">Business customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeated Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.repeatedCustomers}</div>
            <p className="text-xs text-muted-foreground">2+ bookings this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Source Breakdown & Follow-up Schedule */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Customer Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.customerSources && data.customerSources.length > 0 ? (
                data.customerSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{source.source || 'Not Specified'}</p>
                      <p className="text-xs text-muted-foreground">{source.count} customers</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {source.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No source data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Follow-up Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.followUpCustomers.length > 0 ? (
                data.followUpCustomers.slice(0, 5).map((customer) => {
                  const isToday = customer.follow_up_date === new Date().toISOString().split('T')[0];
                  return (
                    <div key={customer.id} className={`flex items-center justify-between p-2 rounded-lg ${isToday ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{customer.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{customer.mobile_number}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={customer.customer_type === 'royal' ? 'default' : customer.customer_type === 'elite' ? 'secondary' : 'outline'} className="text-xs">
                          {customer.customer_type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(customer.follow_up_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No follow-ups scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repeated Customers & Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Repeated Customers Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Repeated Customers</span>
                <Badge variant="secondary">{data.repeatedCustomers}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Repeat Rate</span>
                <Badge variant="outline">
                  {data.totalCustomers > 0 ? Math.round((data.repeatedCustomers / data.totalCustomers) * 100) : 0}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Customers who have made 2 or more bookings within the past year
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivities.length > 0 ? (
                data.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className={`p-1.5 rounded-full ${
                      activity.type === 'employee' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'booking' ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {activity.type === 'employee' ? <Users className="h-3 w-3" /> :
                       activity.type === 'booking' ? <Briefcase className="h-3 w-3" /> :
                       <Calendar className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
