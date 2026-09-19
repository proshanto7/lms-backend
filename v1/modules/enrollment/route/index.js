import { Router } from "express";
import enrollment from "./enrollment.route.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "enrollment route working Good ✅" });
});

router.use("/", enrollment);

export default router;
