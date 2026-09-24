import { Router } from "express";
import enrollmentRequest from "./enrollmentRequest.route.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "enrollment-request route working Good ✅" });
});

router.use("/", enrollmentRequest);

export default router;
