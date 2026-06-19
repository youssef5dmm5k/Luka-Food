import { useListCategories, useListMenuItems, type MenuItem } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/helpers";
import { useCart } from "@/contexts/cart-context";
import { CartDrawer } from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, Check } from "lucide-react";
import { useState, useMemo, useRef } from "react";
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
        {item.available && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
              {formatPrice(item.price)}
            </span>
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

        <motion.div
          whileTap={{ scale: 0.95 }}
          className="mt-auto"
        >
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export function ClientMenu() {
  const { data: categories = [], isLoading: isLoadingCategories } = useListCategories();
  const { data: menuItems = [], isLoading: isLoadingItems } = useListMenuItems();
  const { addItem } = useCart();
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({});

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showPin, setShowPin] = useState(false);

  const categorySections = useMemo(() => {
    if (selectedCategoryId !== null) {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      const items = menuItems.filter((i) => i.categoryId === selectedCategoryId);
      return cat ? [{ category: cat, items }] : [];
    }
    return categories
      .map((cat) => ({
        category: cat,
        items: menuItems.filter((i) => i.categoryId === cat.id && i.available !== false),
      }))
      .filter((s) => s.items.length > 0);
  }, [menuItems, categories, selectedCategoryId]);

  const scrollToCategory = (id: number) => {
    setSelectedCategoryId(null);
    requestAnimationFrame(() => {
      const el = sectionRefs.current[id];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

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
                onClick={() => {
                  if (selectedCategoryId === null) {
                    scrollToCategory(category.id);
                  } else {
                    setSelectedCategoryId(category.id);
                  }
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        <AnimatePresence>
          {categorySections.map(({ category, items }) => (
            <motion.section
              key={category.id}
              ref={(el) => { sectionRefs.current[category.id] = el; }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-black">{category.name}</h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {items.length} صنف
                </span>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAdd={() => addItem(item)}
                  />
                ))}
              </motion.div>
            </motion.section>
          ))}
        </AnimatePresence>

        {categorySections.length === 0 && (
          <div className="flex py-20 flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground">لا توجد أصناف في هذا القسم</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 left-6 z-50">
        <CartDrawer />
      </div>

      <footer className="border-t bg-card/50 py-4 px-4 mt-8">
        <div className="container mx-auto flex items-center justify-center gap-3">
          <img src="/raqm-studio.jpg" alt="RAQM Studio" className="h-8 w-8 rounded-full object-cover" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">RAQM Studio</span>
            <span className="mx-2">·</span>
            <span>في حالة أردت التواصل معنا</span>
          </div>
        </div>
      </footer>

      <PinDialog open={showPin} onClose={() => setShowPin(false)} />
    </div>
  );
}
