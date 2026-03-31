import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import suppliersRouter from "./suppliers";
import customersRouter from "./customers";
import productsRouter from "./products";
import purchasesRouter from "./purchases";
import salesRouter from "./sales";
import paymentsRouter from "./payments";
import returnsRouter from "./returns";
import ledgerRouter from "./ledger";
import dashboardRouter from "./dashboard";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/suppliers", suppliersRouter);
router.use("/customers", customersRouter);
router.use("/products", productsRouter);
router.use("/purchases", purchasesRouter);
router.use("/sales", salesRouter);
router.use("/payments", paymentsRouter);
router.use("/returns", returnsRouter);
router.use("/ledger", ledgerRouter);
router.use("/dashboard", dashboardRouter);
router.use("/reports", reportsRouter);

export default router;
