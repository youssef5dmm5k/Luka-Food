import { useListCategories, useListMenuItems, type MenuItem } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/helpers";
import { useCart } from "@/contexts/cart-context";
import { CartDrawer } from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PinDialog } from "@/components/pin-dialog";

function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!item.available || added) return;
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-shadow ${!item.available ? "opacity-50 grayscale" : ""}`}
      data-testid={`card-menu-item-${item.id}`}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {item.imageUrl ? (
          <motion.img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/10">
            <span className="text-4xl font-black text-secondary/30 group-hover:text-secondary/50 transition-colors">LUKA</span>
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <span className="rounded-full bg-background px-4 py-1 font-bold text-destructive">غير متوفر</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
          <span className="font-black text-primary whitespace-nowrap">{formatPrice(item.price)}</span>
        </div>
        {item.description && (
          <p className="mb-4 text-sm text-muted-foreground flex-1 leading-relaxed">{item.description}</p>
        )}

        <motion.div whileTap={{ scale: 0.95 }} className="mt-auto">
          <Button
            className={`w-full rounded-xl transition-all duration-300 ${added ? "bg-green-600 hover:bg-green-700" : ""}`}
            disabled={!item.available}
            onClick={handleAdd}
            data-testid={`button-add-to-cart-${item.id}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  تمت الإضافة
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  إضافة للسلة
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function ClientMenu() {
  const { data: categories = [], isLoading: isLoadingCategories } = useListCategories();
  const { data: menuItems = [], isLoading: isLoadingItems } = useListMenuItems();
  const { addItem } = useCart();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showPin, setShowPin] = useState(false);

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === null) return menuItems.filter((i) => i.available !== false);
    return menuItems.filter((i) => i.categoryId === selectedCategoryId);
  }, [menuItems, selectedCategoryId]);

  if (isLoadingCategories || isLoadingItems) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
        />
        <p className="text-sm text-muted-foreground animate-pulse">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.img
              src="/logo.jpg"
              alt="Luka Food"
              className="h-12 w-12 rounded-xl object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-primary tracking-tight">Luka Food</span>
              <span className="text-[10px] text-muted-foreground font-semibold tracking-wide">Fast Food & Resto</span>
            </div>
          </div>

          <button
            onClick={() => setShowPin(true)}
            className="w-2 h-2 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 transition-colors focus:outline-none"
            aria-label="."
            data-testid="btn-hidden-kitchen"
            title=""
          />
        </div>

        <ScrollArea className="w-full whitespace-nowrap border-t">
          <div className="flex w-max space-x-2 space-x-reverse px-4 py-3">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              className="rounded-full px-6"
              onClick={() => setSelectedCategoryId(null)}
            >
              الكل
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                className="rounded-full px-6"
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAdd={() => addItem(item)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredItems.length === 0 && (
          <div className="flex py-20 flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground">لا توجد أصناف في هذا القسم</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 left-6 z-50">
        <CartDrawer />
      </div>

      <footer className="border-t bg-card/50 py-5 px-4 mt-8">
        <div className="container mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Luka Food" className="h-10 w-10 rounded-xl object-cover" />
            <a
              href="https://www.facebook.com/profile.php?id=100054244160876"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#1565C0] transition-colors text-white font-bold px-5 py-2.5 rounded-full text-sm"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              تابعنا على فيسبوك
            </a>
          </div>
          <div className="flex items-center gap-3">
            <img src="/raqm-studio.jpg" alt="RAQM Studio" className="h-7 w-7 rounded-full object-cover" />
            <span className="text-xs text-muted-foreground">
              <span className="font-medium">RAQM Studio</span>
              <span className="mx-1.5">·</span>
              <span>في حالة أردت التواصل معنا</span>
            </span>
          </div>
        </div>
      </footer>

      <PinDialog open={showPin} onClose={() => setShowPin(false)} />
    </div>
  );
}
