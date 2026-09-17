import { Router } from "express";
import course from "./course.route.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Course route working Good ✅" });
});

router.use("/", course);

export default router;
