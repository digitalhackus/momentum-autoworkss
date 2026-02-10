import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Send
} from "lucide-react";
import { motion } from "motion/react";
import { ComingSoon } from "./ComingSoon";

const notifications = [
  {
    id: 1,
    type: "service_due",
    title: "Service Reminder",
    message: "Toyota Camry (ABC-1234) - Oil change due in 5 days",
    customer: "John Smith",
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
    dueDate: "2024-11-06",
    priority: "medium",
    sent: false,
    time: "2h ago"
  },
  {
    id: 2,
    type: "service_overdue",
    title: "Overdue Service Alert",
    message: "BMW X5 (JKL-7890) - Service overdue by 15 days",
    customer: "Robert Brown",
    phone: "+1 (555) 987-6543",
    email: "robert.brown@email.com",
    dueDate: "2024-10-16",
    priority: "high",
    sent: true,
    time: "1 day ago"
  },
  {
    id: 3,
    type: "service_due",
    title: "Upcoming Maintenance",
    message: "Ford F-150 (DEF-9012) - Scheduled maintenance in 3 days",
    customer: "Mike Wilson",
    phone: "+1 (555) 456-7890",
    email: "mike.wilson@email.com",
    dueDate: "2024-11-04",
    priority: "medium",
    sent: false,
    time: "3h ago"
  },
  {
    id: 4,
    type: "service_completed",
    title: "Service Completed",
    message: "Honda Civic (XYZ-5678) - Oil change and tire rotation completed",
    customer: "Sarah Johnson",
    phone: "+1 (555) 234-5678",
    email: "sarah.johnson@email.com",
    dueDate: "2024-10-31",
    priority: "low",
    sent: true,
    time: "5h ago"
  },
  {
    id: 5,
    type: "service_due",
    title: "Annual Inspection Due",
    message: "Tesla Model 3 (GHI-3456) - Annual inspection due in 7 days",
    customer: "Emily Davis",
    phone: "+1 (555) 345-6789",
    email: "emily.davis@email.com",
    dueDate: "2024-11-08",
    priority: "medium",
    sent: false,
    time: "1 day ago"
  },
];

const stats = [
  { label: "Pending Reminders", value: 24, icon: Bell, color: "blue" },
  { label: "Sent Today", value: 18, icon: Send, color: "green" },
  { label: "Overdue Alerts", value: 5, icon: AlertCircle, color: "red" },
  { label: "Scheduled", value: 42, icon: Clock, color: "orange" },
];

export function Notifications() {
  return (
    <ComingSoon 
      featureName="Smart Notifications" 
      description="Automated SMS, Email and WhatsApp alerts for your customers when their services are due, completed, or overdue."
      icon="rocket"
    >
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl mb-1 lg:mb-2">Notifications & Reminders</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage service reminders and customer notifications</p>
          </div>
          <div className="flex gap-2 lg:gap-3">
            <Button className="bg-theme hover:bg-theme-dark flex-1 lg:flex-none" size="sm">
              <Send className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Send Bulk Reminders</span>
              <span className="sm:hidden">Send</span>
            </Button>
            <Button variant="outline" className="flex-1 lg:flex-none" size="sm">
              <Calendar className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Schedule</span>
            </Button>
          </div>
        </div>

        {/* Important Note */}
        <Card className="border-l-4 border-l-blue-600 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-theme mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="text-blue-900">
                    <span className="font-medium">Note:</span> For this to work, we need to collect <span className="font-medium">Vehicle Daily Mileage</span> to calculate estimated service due date.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label}>
                <Card className={`border-l-4 border-l-${stat.color}-500`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-3xl">{stat.value}</p>
                      </div>
                      <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                        <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Service Reminders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 rounded-lg border bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 bg-blue-100`}>
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ComingSoon>
  );
}
