import { useGetOrderStats, useListOrders, useUpdateOrderStatus, OrderStatus, Order } from "@workspace/api-client-react";
import { statusLabel, formatPrice } from "@/lib/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock, ChefHat, Trash2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export function OrdersManager() {
  const { data: stats } = useGetOrderStats({ query: { queryKey: ["orderStats"], refetchInterval: 5000 } });
  const { data: orders = [] } = useListOrders({}, { query: { queryKey: ["orders"], refetchInterval: 5000 } });
  const updateStatus = useUpdateOrderStatus();

  const handleUpdateStatus = (id: number, status: OrderStatus) => {
    updateStatus.mutate({ id, data: { status } });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "bg-destructive/10 text-destructive border-destructive/20";
      case "preparing": return "bg-primary/10 text-primary border-primary/20";
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "";
    }
  };

  // Separate orders by status
  const pendingOrders = orders.filter(o => o.status === OrderStatus.pending);
  const preparingOrders = orders.filter(o => o.status === OrderStatus.preparing);
  const completedOrders = orders.filter(o => o.status === OrderStatus.completed);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">معلق</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">قيد التحضير</CardTitle>
            <ChefHat className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.preparing || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي اليوم</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalToday || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إيرادات اليوم</CardTitle>
            <span className="text-sm font-bold text-muted-foreground">TND</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatPrice(stats?.revenueToday || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OrderColumn 
          title="طلبات جديدة" 
          orders={pendingOrders} 
          icon={<Clock className="w-5 h-5 text-destructive" />}
          action={(order) => (
            <Button 
              className="w-full mt-4" 
              onClick={() => handleUpdateStatus(order.id, OrderStatus.preparing)}
            >
              بدء التحضير
            </Button>
          )}
        />
        <OrderColumn 
          title="قيد التحضير" 
          orders={preparingOrders} 
          icon={<ChefHat className="w-5 h-5 text-primary" />}
          action={(order) => (
            <Button 
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white" 
              onClick={() => handleUpdateStatus(order.id, OrderStatus.completed)}
            >
              <CheckCircle2 className="ml-2 w-4 h-4" /> إكمال الطلب
            </Button>
          )}
        />
        <OrderColumn 
          title="مكتملة (مؤخراً)" 
          orders={completedOrders.slice(0, 10)} 
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
        />
      </div>
    </div>
  );
}

function OrderColumn({ title, orders, icon, action }: { title: string, orders: Order[], icon: React.ReactNode, action?: (order: Order) => React.ReactNode }) {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] rounded-xl border bg-muted/30">
      <div className="p-4 border-b bg-card rounded-t-xl flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <Badge variant="secondary">{orders.length}</Badge>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4 border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-black">طاولة {order.tableNumber}</span>
                      <span className="text-xs text-muted-foreground">#{order.id}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "HH:mm")}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-primary">{formatPrice(order.totalPrice)}</div>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium">
                        <span className="text-primary ml-1">{item.quantity}x</span> 
                        {item.menuItemName}
                      </span>
                    </li>
                  ))}
                </ul>

                {order.notes && (
                  <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-4 font-medium">
                    ملاحظة: {order.notes}
                  </div>
                )}

                {action && action(order)}
              </motion.div>
            ))}
          </AnimatePresence>
          {orders.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              لا توجد طلبات
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
