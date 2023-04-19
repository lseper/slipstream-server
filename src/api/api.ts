import { Router } from "express";
import authRouter from "./auth/auth.routes";
import usersRouter from "./users/users.routes";

const apiRouter = Router();

apiRouter.get("/", (req, res) => {
	res.json({
		message: "API - 👋🌎🌍🌏",
	});
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);

export default apiRouter;
