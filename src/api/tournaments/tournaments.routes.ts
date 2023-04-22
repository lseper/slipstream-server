import { Router } from "express";
import { omit } from "lodash";
import { isAuthenticated } from "../../middlewares";
import { createTournament } from "./tournaments.services";
import { findUserById } from "../users/users.services";

const tournamentsRouter = Router();

tournamentsRouter.get("/", async (req, res, next) => {
	try {
		// @ts-ignore - angry as it can't tell that .payload is added to req object by isAuthenticated middleware
		const { userId } = req.payload;
		// @ts-ignore
		console.log(req.payload);
		const user = findUserById(userId);
		if (!user) {
			res.status(404);
			throw new Error(`User with id ${userId} not found`);
		}
		const userTournaments = user.Tournaments;
		res.json(userTournaments);
	} catch (err) {
		next(err);
	}
});

export default tournamentsRouter;
