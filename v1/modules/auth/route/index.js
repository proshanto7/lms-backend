import { Router } from "express";
import user from "./User.routes.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Auth route working Good ✅" });
});

router.use("/", user);

export default router;
