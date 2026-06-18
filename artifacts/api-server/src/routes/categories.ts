import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, categoriesTable } from "@workspace/db";
import {
  CreateCategoryBody,
  UpdateCategoryParams,
  UpdateCategoryBody,
  DeleteCategoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (req, res) => {
  const categories = await db
    .select()
    .from(categoriesTable)
    .orderBy(categoriesTable.id);
  res.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      createdAt: c.createdAt.toISOString(),
    })),
  );
});

router.post("/categories", async (req, res) => {
  const body = CreateCategoryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [created] = await db
    .insert(categoriesTable)
    .values({ name: body.data.name })
    .returning();
  res.status(201).json({
    id: created.id,
    name: created.name,
    createdAt: created.createdAt.toISOString(),
  });
});

router.put("/categories/:id", async (req, res) => {
  const params = UpdateCategoryParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateCategoryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db
    .update(categoriesTable)
    .set({ name: body.data.name })
    .where(eq(categoriesTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json({
    id: updated.id,
    name: updated.name,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.delete("/categories/:id", async (req, res) => {
  const params = DeleteCategoryParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.status(204).send();
});

export default router;
