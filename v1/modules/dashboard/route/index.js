import { Router } from "express";
import dashboard from "./dashboard.route.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Dashboard route working Good ✅" });
});

router.use("/", dashboard);

export default router;
