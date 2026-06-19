import { useEffect, useRef, useState, useCallback } from "react";
import { useListOrders, useUpdateOrderStatus, OrderStatus, type Order } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChefHat, Clock, Volume2, VolumeX } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export function CookDisplay() {
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

  const handleStart = (id: number) =>
    updateStatus.mutate({ id, data: { status: OrderStatus.preparing } });
  const handleDone = (id: number) =>
    updateStatus.mutate({ id, data: { status: OrderStatus.completed } });

  const toggleSound = () => {
    unlockAudio();
    setSoundEnabled((v) => !v);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Luka" className="h-10 w-10 rounded-lg object-cover" />
          <p className="text-xs text-muted-foreground">Kitchen Display System</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <motion.div
                className="h-2.5 w-2.5 rounded-full bg-destructive"
                animate={pendingOrders.length > 0 ? { scale: [1, 1.4, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
              <span className="font-bold">{pendingOrders.length} معلق</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="font-bold">{preparingOrders.length} قيد التحضير</span>
            </div>
          </div>
          <Button
            size="sm"
            variant={soundEnabled ? "default" : "outline"}
            onClick={toggleSound}
            className="gap-2"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundEnabled ? "صوت مفعّل" : "صوت مطفأ"}
          </Button>
        </div>
      </div>

      {/* Unlock sound banner */}
      <AnimatePresence>
        {!audioUnlocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary/10 border-b border-primary/20 px-6 py-2 flex items-center justify-between overflow-hidden"
          >
            <p className="text-sm text-primary font-medium">
              🔔 اضغط "تفعيل الصوت" لتلقي تنبيهات الطلبات الجديدة
            </p>
            <Button size="sm" onClick={unlockAudio} className="gap-2">
              <Volume2 className="h-4 w-4" />
              تفعيل الصوت
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-x-reverse">
        {/* Pending */}
        <div className="flex flex-col bg-destructive/5">
          <div className="sticky top-0 z-10 bg-destructive/10 border-b px-6 py-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-destructive" />
            <h2 className="font-black text-lg text-destructive">طلبات جديدة</h2>
            <Badge variant="destructive" className="mr-2">{pendingOrders.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actionLabel="بدء التحضير ›"
                  actionVariant="default"
                  onAction={() => handleStart(order.id)}
                />
              ))}
            </AnimatePresence>
            {pendingOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                <CheckCircle2 className="h-10 w-10 opacity-20" />
                <p>لا توجد طلبات معلقة</p>
              </div>
            )}
          </div>
        </div>

        {/* Preparing */}
        <div className="flex flex-col bg-primary/5">
          <div className="sticky top-0 z-10 bg-primary/10 border-b px-6 py-3 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            <h2 className="font-black text-lg text-primary">قيد التحضير</h2>
            <Badge className="mr-2">{preparingOrders.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actionLabel="✓ تم التحضير"
                  actionVariant="success"
                  onAction={() => handleDone(order.id)}
                />
              ))}
            </AnimatePresence>
            {preparingOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                <ChefHat className="h-10 w-10 opacity-20" />
                <p>لا يوجد طلبات قيد التحضير</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  actionLabel,
  actionVariant,
  onAction,
}: {
  order: Order;
  actionLabel: string;
  actionVariant: "default" | "success";
  onAction: () => void;
}) {
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border bg-card shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-xl w-14 h-14 font-black leading-none">
            <span className="text-xs opacity-70">طاولة</span>
            <span className="text-2xl">{order.tableNumber}</span>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">#{order.id} · {format(new Date(order.createdAt), "HH:mm")}</div>
            <div className="text-sm font-medium text-muted-foreground">
              {elapsed === 0 ? "الآن" : `منذ ${elapsed} دقيقة`}
            </div>
          </div>
        </div>
        <div className="text-left">
          <div className="font-black text-lg text-primary">{formatPrice(order.totalPrice)}</div>
        </div>
      </div>

      <ul className="px-5 py-3 space-y-2">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-base">
            <span className="font-medium">{item.menuItemName}</span>
            <span className="font-black text-xl text-primary ml-3">{item.quantity}×</span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <div className="mx-4 mb-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive font-medium">
          ⚠️ {order.notes}
        </div>
      )}

      <div className="px-4 pb-4">
        <Button
          className={`w-full h-12 text-base font-bold ${actionVariant === "success" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </motion.div>
  );
}
