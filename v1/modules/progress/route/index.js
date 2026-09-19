import { Router } from "express";
import progress from "./progress.route.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Progress route working Good ✅" });
});

router.use("/", progress);

export default router;
