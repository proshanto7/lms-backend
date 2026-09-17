import { Router } from "express";
import category from "./category.route.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Category route working Good ✅" });
});

router.use("/", category);

export default router;
