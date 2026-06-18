import { useState } from "react";
import { 
  useListCategories, 
  useCreateCategory, 
  useDeleteCategory, 
  useListMenuItems, 
  useCreateMenuItem, 
  useDeleteMenuItem,
  usePatchMenuItem
} from "@workspace/api-client-react";
import { formatPrice } from "@/lib/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, SelectGroup, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListCategoriesQueryKey, getListMenuItemsQueryKey } from "@workspace/api-client-react";

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

  // Category State
  const [newCatName, setNewCatName] = useState("");
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);

  // Menu Item State
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCat, setNewItemCat] = useState("");
  const [newItemImg, setNewItemImg] = useState("");

  const handleCreateCategory = () => {
    if (!newCatName) return;
    createCategory.mutate({ data: { name: newCatName } }, {
      onSuccess: () => {
        toast({ title: "تم إضافة القسم بنجاح" });
        setNewCatName("");
        setIsCatDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      }
    });
  };

  const handleDeleteCategory = (id: number) => {
    deleteCategory.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "تم حذف القسم" });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      }
    });
  };

  const handleCreateMenuItem = () => {
    if (!newItemName || !newItemPrice || !newItemCat) return;
    createMenuItem.mutate({
      data: {
        name: newItemName,
        description: newItemDesc,
        price: parseFloat(newItemPrice),
        categoryId: parseInt(newItemCat),
        imageUrl: newItemImg,
      }
    }, {
      onSuccess: () => {
        toast({ title: "تم إضافة الصنف بنجاح" });
        setNewItemName("");
        setNewItemDesc("");
        setNewItemPrice("");
        setNewItemCat("");
        setNewItemImg("");
        setIsItemDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
      }
    });
  };

  const handleToggleAvailability = (id: number, currentAvailable: boolean) => {
    patchMenuItem.mutate({ id, data: { available: !currentAvailable } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
      }
    });
  };

  const handleDeleteMenuItem = (id: number) => {
    deleteMenuItem.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "تم حذف الصنف" });
        queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Categories Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>الأقسام</CardTitle>
          <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 ml-2" /> إضافة قسم</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة قسم جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>اسم القسم</Label>
                  <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="مثال: مقبلات" />
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
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <span className="font-medium">{cat.name}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive rounded-full" onClick={() => handleDeleteCategory(cat.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {categories.length === 0 && <span className="text-muted-foreground text-sm">لا توجد أقسام</span>}
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>أصناف قائمة الطعام</CardTitle>
          <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 ml-2" /> إضافة صنف</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة صنف جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>اسم الصنف</Label>
                  <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="مثال: كسكسي باللحم" />
                </div>
                <div className="space-y-2">
                  <Label>القسم</Label>
                  <Select value={newItemCat} onValueChange={setNewItemCat}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>السعر (د.ت)</Label>
                  <Input type="number" step="0.001" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="0.000" />
                </div>
                <div className="space-y-2">
                  <Label>رابط الصورة (اختياري)</Label>
                  <Input value={newItemImg} onChange={e => setNewItemImg(e.target.value)} placeholder="https://..." dir="ltr" className="text-left" />
                </div>
                <div className="space-y-2">
                  <Label>الوصف (اختياري)</Label>
                  <Textarea value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateMenuItem} disabled={createMenuItem.isPending}>حفظ</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {menuItems.map(item => (
              <div key={item.id} className="border rounded-xl p-4 flex flex-col gap-3 relative bg-card">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-lg">{item.name}</div>
                  <div className="font-black text-primary">{formatPrice(item.price)}</div>
                </div>
                <div className="text-xs text-muted-foreground bg-muted w-max px-2 py-1 rounded-md">{item.categoryName}</div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch 
                      id={`avail-${item.id}`} 
                      checked={item.available} 
                      onCheckedChange={() => handleToggleAvailability(item.id, item.available)}
                    />
                    <Label htmlFor={`avail-${item.id}`} className="text-xs cursor-pointer">{item.available ? "متاح" : "غير متوفر"}</Label>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteMenuItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {menuItems.length === 0 && <div className="col-span-full py-8 text-center text-muted-foreground">لا توجد أصناف</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
