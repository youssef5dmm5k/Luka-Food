import { useEffect, useRef, useState, useCallback } from "react";
import { useGetOrderStats, useListOrders, useUpdateOrderStatus, OrderStatus, Order } from "@workspace/api-client-react";
import { statusLabel, formatPrice } from "@/lib/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock, ChefHat, Volume2, VolumeX } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export function OrdersManager() {
  const { data: stats } = useGetOrderStats({ query: { queryKey: ["orderStats"], refetchInterval: 2000 } });
  const { data: orders = [] } = useListOrders({}, { query: { queryKey: ["orders"], refetchInterval: 2000 } });
  const updateStatus = useUpdateOrderStatus();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevPendingIdsRef = useRef<Set<number> | null>(null);

  useEffect(() => {
    const audio = new Audio("/alert.mp3");
    audio.preload = "auto";
    audioRef.current = audio;
  }, []);

  const unlockAudio = useCallback(() => {
    if (!audioRef.current || audioUnlocked) return;
    const a = audioRef.current;
    a.volume = 0;
    a.play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
        a.volume = 1;
        setAudioUnlocked(true);
      })
      .catch(() => {
        a.volume = 1;
        setAudioUnlocked(true);
      });
  }, [audioUnlocked]);

  const pendingOrders = orders.filter((o: Order) => o.status === OrderStatus.pending);
  const preparingOrders = orders.filter((o: Order) => o.status === OrderStatus.preparing);
  const completedOrders = orders.filter((o: Order) => o.status === OrderStatus.completed);

  useEffect(() => {
    const currentIds = new Set<number>(pendingOrders.map((o: Order) => o.id));

    if (prevPendingIdsRef.current === null) {
      prevPendingIdsRef.current = currentIds;
      return;
    }

    const prevIds = prevPendingIdsRef.current;
    const hasNew = [...currentIds].some((id: number) => !prevIds.has(id));

    if (hasNew && soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    prevPendingIdsRef.current = currentIds;
  }, [pendingOrders, soundEnabled]);

  const handleUpdateStatus = (id: number, status: OrderStatus) => {
    updateStatus.mutate({ id, data: { status } });
  };

  return (
    <div className="space-y-4 p-4">
      {/* Sound unlock banner */}
      <AnimatePresence>
        {!audioUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <p className="text-sm text-primary font-medium">
              🔔 اضغط لتفعيل تنبيه صوتي عند وصول طلبات جديدة
            </p>
            <Button size="sm" onClick={unlockAudio} className="gap-2 shrink-0">
              <Volume2 className="h-4 w-4" />
              تفعيل الصوت
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">معلق</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <motion.div
              key={stats?.pending}
              initial={{ scale: 1.3, color: "hsl(var(--destructive))" }}
              animate={{ scale: 1, color: "hsl(var(--foreground))" }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold"
            >
              {stats?.pending || 0}
            </motion.div>
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
            <span className="text-sm font-bold text-muted-foreground font-en">TND</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatPrice(stats?.revenueToday || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">يتحدث تلقائياً كل ٢ ثانية</p>
        <Button
          size="sm"
          variant={soundEnabled ? "default" : "outline"}
          onClick={() => { unlockAudio(); setSoundEnabled(v => !v); }}
          className="gap-2"
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {soundEnabled ? "صوت مفعّل" : "صوت مطفأ"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OrderColumn
          title="طلبات جديدة"
          orders={pendingOrders}
          icon={<Clock className="w-5 h-5 text-destructive" />}
          highlight
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

function OrderColumn({
  title,
  orders,
  icon,
  action,
  highlight,
}: {
  title: string;
  orders: Order[];
  icon: React.ReactNode;
  action?: (order: Order) => React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`flex flex-col h-[calc(100vh-14rem)] rounded-xl border bg-muted/30 ${highlight && orders.length > 0 ? "border-destructive/40 ring-1 ring-destructive/20" : ""}`}>
      <div className="p-4 border-b bg-card rounded-t-xl flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <motion.div key={orders.length} initial={{ scale: 1.4 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
          <Badge variant={highlight && orders.length > 0 ? "destructive" : "secondary"}>{orders.length}</Badge>
        </motion.div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="bg-card border rounded-xl p-4 shadow-sm"
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
