import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, menuItemsTable, categoriesTable } from "@workspace/db";
import {
  ListMenuItemsQueryParams,
  CreateMenuItemBody,
  UpdateMenuItemParams,
  UpdateMenuItemBody,
  PatchMenuItemParams,
  PatchMenuItemBody,
  DeleteMenuItemParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toMenuItem(item: typeof menuItemsTable.$inferSelect, categoryName?: string | null) {
  return {
    id: item.id,
    categoryId: item.categoryId,
    categoryName: categoryName ?? null,
    name: item.name,
    description: item.description ?? null,
    price: parseFloat(item.price),
    imageUrl: item.imageUrl ?? null,
    available: item.available,
    createdAt: item.createdAt.toISOString(),
  };
}

router.get("/menu-items", async (req, res) => {
  const query = ListMenuItemsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db
    .select({
      item: menuItemsTable,
      categoryName: categoriesTable.name,
    })
    .from(menuItemsTable)
    .leftJoin(categoriesTable, eq(menuItemsTable.categoryId, categoriesTable.id))
    .where(
      query.data.categoryId
        ? eq(menuItemsTable.categoryId, query.data.categoryId)
        : undefined,
    )
    .orderBy(menuItemsTable.categoryId, menuItemsTable.id);

  res.json(rows.map((r) => toMenuItem(r.item, r.categoryName)));
});

router.post("/menu-items", async (req, res) => {
  const body = CreateMenuItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [created] = await db
    .insert(menuItemsTable)
    .values({
      categoryId: body.data.categoryId,
      name: body.data.name,
      description: body.data.description ?? null,
      price: String(body.data.price),
      imageUrl: body.data.imageUrl ?? null,
      available: body.data.available ?? true,
    })
    .returning();

  const cat = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, created.categoryId))
    .limit(1);

  res.status(201).json(toMenuItem(created, cat[0]?.name ?? null));
});

router.put("/menu-items/:id", async (req, res) => {
  const params = UpdateMenuItemParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateMenuItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db
    .update(menuItemsTable)
    .set({
      categoryId: body.data.categoryId,
      name: body.data.name,
      description: body.data.description ?? null,
      price: String(body.data.price),
      imageUrl: body.data.imageUrl ?? null,
      available: body.data.available ?? true,
    })
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  const cat = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, updated.categoryId))
    .limit(1);

  res.json(toMenuItem(updated, cat[0]?.name ?? null));
});

router.patch("/menu-items/:id", async (req, res) => {
  const params = PatchMenuItemParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = PatchMenuItemBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const patch: Record<string, unknown> = {};
  if (body.data.categoryId !== undefined) patch.categoryId = body.data.categoryId;
  if (body.data.name !== undefined) patch.name = body.data.name;
  if (body.data.description !== undefined) patch.description = body.data.description;
  if (body.data.price !== undefined) patch.price = String(body.data.price);
  if (body.data.imageUrl !== undefined) patch.imageUrl = body.data.imageUrl;
  if (body.data.available !== undefined) patch.available = body.data.available;

  const [updated] = await db
    .update(menuItemsTable)
    .set(patch)
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  const cat = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, updated.categoryId))
    .limit(1);

  res.json(toMenuItem(updated, cat[0]?.name ?? null));
});

router.delete("/menu-items/:id", async (req, res) => {
  const params = DeleteMenuItemParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(menuItemsTable)
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.status(204).send();
});

export default router;
