import { OrderStatus } from "@workspace/api-client-react";

export function formatPrice(price: number): string {
  return `${price.toFixed(3)} د.ت`;
}

export const statusLabel: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "معلق",
  [OrderStatus.preparing]: "قيد التحضير",
  [OrderStatus.completed]: "مكتمل",
};

export function isEnglishText(text: string): boolean {
  const latinChars = text.match(/[a-zA-Z]/g)?.length || 0;
  return latinChars > 0 && latinChars / text.length > 0.5;
}
