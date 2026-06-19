import { ShoppingBag, X, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { formatPrice, isEnglishText } from "@/lib/helpers";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useCreateOrder, getListOrdersQueryKey, getGetOrderStatsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
  const { items, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();

  const handleCheckout = () => {
    const tableNum = parseInt(tableNumber);
    if (!tableNumber || isNaN(tableNum) || tableNum < 1) {
      toast({
        title: "رقم الطاولة مطلوب",
        description: "يرجى إدخال رقم طاولة صحيح",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({ title: "السلة فارغة", variant: "destructive" });
      return;
    }

    createOrder.mutate(
      {
        data: {
          tableNumber: tableNum,
          notes: notes || undefined,
          items: items.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
          })),
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "تم تأكيد الطلب بنجاح",
            description: "سيتم تحضير طلبك قريباً",
          });
          clearCart();
          setIsOpen(false);
          setTableNumber("");
          setNotes("");
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetOrderStatsQueryKey() });
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "لم نتمكن من تأكيد طلبك";
          toast({ title: "حدث خطأ", description: msg, variant: "destructive" });
        },
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="relative h-14 w-14 rounded-full shadow-xl ring-2 ring-background"
          data-testid="button-open-cart"
        >
          <ShoppingBag className="h-6 w-6" />
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
              >
                {totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-lg" dir="rtl">
        <SheetHeader>
          <SheetTitle className="text-right text-2xl font-bold">سلة الطلبات</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-20" />
            <p className="text-lg text-muted-foreground">السلة فارغة</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="space-y-3 px-1">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.menuItem.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 rounded-xl border bg-card p-3"
                    >
                      {item.menuItem.imageUrl && (
                        <img
                          src={item.menuItem.imageUrl}
                          alt={item.menuItem.name}
                          className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm leading-tight ${isEnglishText(item.menuItem.name) ? "font-en" : ""}`}>{item.menuItem.name}</h4>
                        <p className="text-sm font-bold text-primary">{formatPrice(item.menuItem.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          data-testid={`button-decrease-${item.menuItem.id}`}
                        >
                          {item.quantity === 1 ? <X className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        </Button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.menuItem.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-6 space-y-4 border-t pt-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">رقم الطاولة *</Label>
                  <Input
                    id="tableNumber"
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="أدخل رقم الطاولة"
                    min="1"
                    data-testid="input-table-number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="بدون بصل، حار جداً..."
                    className="resize-none"
                    rows={2}
                    data-testid="input-notes"
                  />
                </div>
              </div>
            </ScrollArea>

            <SheetFooter className="mt-4 border-t pt-4 flex-col gap-3">
              <div className="flex items-center justify-between text-lg font-bold w-full">
                <span>المجموع:</span>
                <span className="text-primary text-xl">{formatPrice(totalPrice)}</span>
              </div>
              <Button
                className="w-full h-12 text-lg font-bold"
                onClick={handleCheckout}
                disabled={createOrder.isPending}
                data-testid="button-confirm-order"
              >
                {createOrder.isPending ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
