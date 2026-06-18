import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import menuItemsRouter from "./menuItems";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(menuItemsRouter);
router.use(ordersRouter);

export default router;
