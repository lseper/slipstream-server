import { Router } from "express";
import authRouter from "./auth/auth.routes";
import usersRouter from "./users/users.routes";
import tournamentsRouter from "./tournaments/tournaments.routes";

const apiRouter = Router();

apiRouter.get("/", (req, res) => {
	res.json({
		message: "API - 👋🌎🌍🌏",
	});
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/tournaments", tournamentsRouter);

export default apiRouter;
