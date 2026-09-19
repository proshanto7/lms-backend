import { Router } from "express";
import lesson from "./lesson.route.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "lesson route working Good ✅" });
});

router.use("/", lesson);

export default router;
