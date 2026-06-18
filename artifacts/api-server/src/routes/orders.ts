import { Router, type IRouter } from "express";
import { eq, and, gte, sql } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, menuItemsTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toOrder(
  order: typeof ordersTable.$inferSelect,
  items: (typeof orderItemsTable.$inferSelect)[],
) {
  return {
    id: order.id,
    tableNumber: order.tableNumber,
    status: order.status,
    totalPrice: parseFloat(order.totalPrice),
    notes: order.notes ?? null,
    createdAt: order.createdAt.toISOString(),
    items: items.map((i) => ({
      id: i.id,
      menuItemId: i.menuItemId,
      menuItemName: i.menuItemName,
      quantity: i.quantity,
      unitPrice: parseFloat(i.unitPrice),
    })),
  };
}

router.get("/orders/stats", async (_req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [stats] = await db
    .select({
      pending: sql<number>`count(*) filter (where ${ordersTable.status} = 'pending')`,
      preparing: sql<number>`count(*) filter (where ${ordersTable.status} = 'preparing')`,
      completed: sql<number>`count(*) filter (where ${ordersTable.status} = 'completed')`,
    })
    .from(ordersTable);

  const [todayStats] = await db
    .select({
      totalToday: sql<number>`count(*)`,
      revenueToday: sql<number>`coalesce(sum(${ordersTable.totalPrice}), 0)`,
    })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, todayStart));

  res.json({
    pending: Number(stats.pending),
    preparing: Number(stats.preparing),
    completed: Number(stats.completed),
    totalToday: Number(todayStats.totalToday),
    revenueToday: parseFloat(String(todayStats.revenueToday)),
  });
});

router.get("/orders", async (req, res) => {
  const query = ListOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const where = query.data.status
    ? eq(ordersTable.status, query.data.status)
    : undefined;

  const orders = await db
    .select()
    .from(ordersTable)
    .where(where)
    .orderBy(sql`${ordersTable.createdAt} desc`);

  const orderIds = orders.map((o) => o.id);
  const items =
    orderIds.length > 0
      ? await db
          .select()
          .from(orderItemsTable)
          .where(sql`${orderItemsTable.orderId} = ANY(${sql.raw(`ARRAY[${orderIds.join(",")}]`)})`)
      : [];

  const itemsByOrder = items.reduce(
    (acc, item) => {
      if (!acc[item.orderId]) acc[item.orderId] = [];
      acc[item.orderId].push(item);
      return acc;
    },
    {} as Record<number, (typeof orderItemsTable.$inferSelect)[]>,
  );

  res.json(orders.map((o) => toOrder(o, itemsByOrder[o.id] ?? [])));
});

router.post("/orders", async (req, res) => {
  const body = CreateOrderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const menuItemIds = body.data.items.map((i) => i.menuItemId);
  const menuItems = await db
    .select()
    .from(menuItemsTable)
    .where(sql`${menuItemsTable.id} = ANY(${sql.raw(`ARRAY[${menuItemIds.join(",")}]`)})`);

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  let total = 0;
  for (const item of body.data.items) {
    const mi = menuItemMap.get(item.menuItemId);
    if (!mi) {
      res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      return;
    }
    if (!mi.available) {
      res.status(400).json({ error: `Menu item "${mi.name}" is not available` });
      return;
    }
    total += parseFloat(mi.price) * item.quantity;
  }

  const [order] = await db
    .insert(ordersTable)
    .values({
      tableNumber: body.data.tableNumber,
      notes: body.data.notes ?? null,
      totalPrice: String(total.toFixed(3)),
      status: "pending",
    })
    .returning();

  const orderItemValues = body.data.items.map((item) => {
    const mi = menuItemMap.get(item.menuItemId)!;
    return {
      orderId: order.id,
      menuItemId: item.menuItemId,
      menuItemName: mi.name,
      quantity: item.quantity,
      unitPrice: mi.price,
    };
  });

  const insertedItems = await db
    .insert(orderItemsTable)
    .values(orderItemValues)
    .returning();

  res.status(201).json(toOrder(order, insertedItems));
});

router.patch("/orders/:id/status", async (req, res) => {
  const params = UpdateOrderStatusParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateOrderStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ status: body.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, updated.id));

  res.json(toOrder(updated, items));
});

export default router;
