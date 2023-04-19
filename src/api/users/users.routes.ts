import { Router } from "express";
import { isAuthenticated } from "../../middlewares";
import { findUserById } from "./users.services";
import { omit } from "lodash";

const usersRouter = Router();

usersRouter.get("/profile", isAuthenticated, async (req, res, next) => {
	try {
		// @ts-ignore - angry as it can't tell that .payload is added to req object by isAuthenticated middleware
		const { userId } = req.payload;
		const user = await findUserById(userId);
		if (!user) {
			res.status(404);
			throw new Error(`User with id ${userId} not found`);
		}
		const userWithPasswordOmitted = omit(user, "password");
		res.json(userWithPasswordOmitted);
	} catch (err) {
		next(err);
	}
});

export default usersRouter;
