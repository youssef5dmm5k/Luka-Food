import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Lock } from "lucide-react";

const CORRECT_PIN = "7733";

interface PinDialogProps {
  open: boolean;
  onClose: () => void;
}

export function PinDialog({ open, onClose }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setPin("");
      setError(false);
      onClose();
      setLocation("/kitchen");
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 1500);
    }
  };

  const handleClose = () => {
    setPin("");
    setError(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Lock className="w-5 h-5 text-primary" />
            دخول لوحة التحكم
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="أدخل رمز الدخول"
            className={`text-center text-xl tracking-widest ${error ? "border-destructive ring-destructive" : ""}`}
            autoFocus
            dir="ltr"
          />
          {error && (
            <p className="text-center text-sm text-destructive font-medium">رمز خاطئ، حاول مجدداً</p>
          )}
          <Button type="submit" className="w-full">دخول</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
