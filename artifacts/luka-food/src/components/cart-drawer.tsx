import { ShoppingBag, X, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/helpers";
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
import { useCreateOrder } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function CartDrawer() {
  const { items, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    if (!tableNumber) {
      toast({
        title: "رقم الطاولة مطلوب",
        description: "يرجى إدخال رقم الطاولة لتأكيد الطلب",
        variant: "destructive",
      });
      return;
    }

    createOrder.mutate(
      {
        data: {
          tableNumber: parseInt(tableNumber),
          notes,
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
        },
        onError: () => {
          toast({
            title: "حدث خطأ",
            description: "لم نتمكن من تأكيد طلبك، يرجى المحاولة مرة أخرى",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon" className="relative h-12 w-12 rounded-full shadow-lg">
          <ShoppingBag className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
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
            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.menuItem.id} className="flex items-center gap-4 rounded-lg border p-4">
                    {item.menuItem.imageUrl && (
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.menuItem.name}</h4>
                      <p className="text-sm font-medium text-primary">
                        {formatPrice(item.menuItem.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                      >
                        {item.quantity === 1 ? <X className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">رقم الطاولة</Label>
                  <Input
                    id="tableNumber"
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="أدخل رقم الطاولة"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="بدون بصل، حار جداً..."
                    className="resize-none"
                  />
                </div>
              </div>
            </ScrollArea>
            <SheetFooter className="mt-6 border-t pt-6 flex-col space-y-4 sm:space-y-0">
              <div className="flex items-center justify-between text-lg font-bold w-full">
                <span>المجموع:</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <Button 
                className="w-full h-12 text-lg" 
                onClick={handleCheckout}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "جاري التأكيد..." : "تأكيد الطلب"}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
