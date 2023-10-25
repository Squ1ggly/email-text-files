import { Router } from "express";
import sendEmailsWithFilesAttached from "../controllers/send-email-with-files";

const mainRouter = Router();

mainRouter.post("/send-email-with-files", sendEmailsWithFilesAttached);

mainRouter.use("/", (req, res, next) => {
  next("Not a valid route");
  return;
});

export default mainRouter;
