import { useListCategories, useListMenuItems } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/helpers";
import { useCart } from "@/hooks/use-cart";
import { CartDrawer } from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ClientMenu() {
  const { data: categories = [], isLoading: isLoadingCategories } = useListCategories();
  const { data: menuItems = [], isLoading: isLoadingItems } = useListMenuItems();
  const { addItem } = useCart();
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const filteredItems = useMemo(() => {
    if (!selectedCategoryId) return menuItems;
    return menuItems.filter(item => item.categoryId === selectedCategoryId);
  }, [menuItems, selectedCategoryId]);

  if (isLoadingCategories || isLoadingItems) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">LUKA FOOD</h1>
            <p className="text-sm text-muted-foreground">أصالة المذاق التونسي</p>
          </div>
        </div>
        
        {/* Categories */}
        <ScrollArea className="w-full whitespace-nowrap border-b">
          <div className="flex w-max space-x-2 space-x-reverse p-4">
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

      {/* Menu Grid */}
      <main className="container mx-auto px-4 py-8">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={item.id}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg ${!item.available ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary/10">
                      <span className="text-4xl font-black text-secondary/30">LUKA</span>
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
                    <span className="font-black text-primary whitespace-nowrap">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mb-4 text-sm text-muted-foreground flex-1">
                      {item.description}
                    </p>
                  )}
                  
                  <Button
                    className="w-full mt-auto rounded-xl"
                    disabled={!item.available}
                    onClick={() => addItem(item)}
                  >
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة للسلة
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredItems.length === 0 && (
          <div className="flex py-20 flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground">لا توجد أصناف في هذا القسم</p>
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <CartDrawer />
      </div>
    </div>
  );
}
