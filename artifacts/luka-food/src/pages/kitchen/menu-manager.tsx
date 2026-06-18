import { useRef, useState } from "react";
import {
  useListCategories,
  useCreateCategory,
  useDeleteCategory,
  useListMenuItems,
  useCreateMenuItem,
  useDeleteMenuItem,
  usePatchMenuItem,
  getListCategoriesQueryKey,
  getListMenuItemsQueryKey,
} from "@workspace/api-client-react";
import { formatPrice } from "@/lib/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ImagePlus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MenuManager() {
  const { data: categories = [] } = useListCategories();
  const { data: menuItems = [] } = useListMenuItems();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const createMenuItem = useCreateMenuItem();
  const patchMenuItem = usePatchMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  const [newCatName, setNewCatName] = useState("");
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCat, setNewItemCat] = useState("");
  const [newItemImg, setNewItemImg] = useState("");
  const [imgPreview, setImgPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = async (file: File) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      setNewItemImg(dataUrl);
      setImgPreview(dataUrl);
    } catch {
      toast({ title: "خطأ في تحميل الصورة", variant: "destructive" });
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImageFile(file);
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    createCategory.mutate({ data: { name: newCatName.trim() } }, {
      onSuccess: () => {
        toast({ title: "تم إضافة القسم بنجاح" });
        setNewCatName("");
        setIsCatDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      },
      onError: () => toast({ title: "خطأ في إضافة القسم", variant: "destructive" }),
    });
  };

  const handleDeleteCategory = (id: number) => {
    deleteCategory.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "تم حذف القسم" });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      },
    });
  };

  const resetItemForm = () => {
    setNewItemName("");
    setNewItemDesc("");
    setNewItemPrice("");
    setNewItemCat("");
    setNewItemImg("");
    setImgPreview("");
  };

  const handleCreateMenuItem = () => {
    if (!newItemName.trim() || !newItemPrice || !newItemCat) {
      toast({ title: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price <= 0) {
      toast({ title: "السعر غير صحيح", variant: "destructive" });
      return;
    }
    createMenuItem.mutate({
      data: {
        name: newItemName.trim(),
        description: newItemDesc.trim() || undefined,
        price,
        categoryId: parseInt(newItemCat),
        imageUrl: newItemImg || undefined,
      },
    }, {
      onSuccess: () => {
        toast({ title: "تم إضافة الصنف بنجاح" });
        resetItemForm();
        setIsItemDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
      },
      onError: () => toast({ title: "خطأ في إضافة الصنف", variant: "destructive" }),
    });
  };

  const handleToggleAvailability = (id: number, current: boolean) => {
    patchMenuItem.mutate({ id, data: { available: !current } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }),
    });
  };

  const handleDeleteMenuItem = (id: number) => {
    deleteMenuItem.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "تم حذف الصنف" });
        queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
      },
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-8" dir="rtl">
      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>الأقسام</CardTitle>
          <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 ml-2" />إضافة قسم</Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader><DialogTitle>إضافة قسم جديد</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>اسم القسم</Label>
                  <Input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="مثال: مقبلات، بيتزا، مشروبات..."
                    onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateCategory} disabled={createCategory.isPending}>حفظ</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <span className="font-medium">{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-destructive rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {categories.length === 0 && <span className="text-muted-foreground text-sm">لا توجد أقسام بعد</span>}
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>أصناف قائمة الطعام</CardTitle>
          <Dialog open={isItemDialogOpen} onOpenChange={(open) => { setIsItemDialogOpen(open); if (!open) resetItemForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 ml-2" />إضافة صنف</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader><DialogTitle>إضافة صنف جديد</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label>اسم الصنف *</Label>
                  <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="مثال: كسكسي باللحم" />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>القسم *</Label>
                  <Select value={newItemCat} onValueChange={setNewItemCat}>
                    <SelectTrigger><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label>السعر (د.ت) *</Label>
                  <Input type="number" step="0.001" min="0" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="0.000" dir="ltr" className="text-left" />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>صورة الصنف</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
                  />
                  {imgPreview ? (
                    <div className="relative rounded-xl overflow-hidden border aspect-video">
                      <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setImgPreview(""); setNewItemImg(""); }}
                        className="absolute top-2 left-2 bg-background/80 rounded-full p-1 hover:bg-background transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      className="border-2 border-dashed border-muted-foreground/30 rounded-xl aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                    >
                      <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">اضغط لرفع صورة من جهازك</p>
                      <p className="text-xs text-muted-foreground/60">أو اسحب الصورة هنا</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>الوصف (اختياري)</Label>
                  <Textarea value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} placeholder="وصف مختصر للصنف..." rows={2} className="resize-none" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateMenuItem} disabled={createMenuItem.isPending} className="w-full">
                  {createMenuItem.isPending ? "جاري الحفظ..." : "إضافة الصنف"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {menuItems.map((item) => (
              <div key={item.id} className="border rounded-2xl overflow-hidden flex flex-col bg-card">
                {item.imageUrl ? (
                  <div className="aspect-video">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-muted">
                    <span className="text-2xl font-black text-muted-foreground/20">LUKA</span>
                  </div>
                )}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-bold text-sm leading-tight">{item.name}</div>
                    <div className="font-black text-primary text-sm whitespace-nowrap">{formatPrice(item.price)}</div>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted w-max px-2 py-0.5 rounded-full">{item.categoryName}</div>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`avail-${item.id}`}
                        checked={item.available}
                        onCheckedChange={() => handleToggleAvailability(item.id, item.available)}
                      />
                      <Label htmlFor={`avail-${item.id}`} className="text-xs cursor-pointer">
                        {item.available ? "متاح" : "غير متوفر"}
                      </Label>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteMenuItem(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {menuItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">لا توجد أصناف بعد</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
