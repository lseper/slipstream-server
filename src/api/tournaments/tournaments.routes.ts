import { Router } from "express";
import { omit } from "lodash";
import { isAuthenticated } from "../../middlewares";
import {
	addParticipantsToTournament,
	createParticipantsForTournament,
	createTournament,
	getTournamentById,
} from "./tournaments.services";
import { findUserById, userExists } from "../users/users.services";

const tournamentsRouter = Router();

tournamentsRouter.get("/:tournamentId", async (req, res, next) => {
	try {
		const { tournamentId } = req.params;
		const tournament = await getTournamentById(tournamentId);
		if (!tournament) {
			res.status(404);
			throw new Error(`Tournament with id ${tournamentId} not found`);
		}
		res.json(tournament);
	} catch (err) {
		next(err);
	}
});

tournamentsRouter.post(
	"/:tournamentId",
	isAuthenticated,
	async (req, res, next) => {
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
			const { tournamentId } = req.params;
			const { participants } = req.body;

			// Find the tournament to which we want to add participants
			const tournament = await getTournamentById(tournamentId);

			if (!tournament) {
				res.status(404);
				throw new Error(`Tournament with id ${tournamentId} not found`);
			}

			if (tournament.userId !== userId) {
				res.status(403);
				throw new Error(
					`Only Tournament owner can add participants to a tournament. TO id: ${tournament.userId}, but given id: ${userId}`
				);
			}

			// Create a new participant object for each user ID and add it to the tournament's participants array
			const participantsToAdd = await createParticipantsForTournament(
				tournament,
				participants
			);

			if (!participantsToAdd) {
				res.status(404);
				throw new Error(
					`You've attempted invite users to the tournament that do not exist`
				);
			}

			const updatedTournament = addParticipantsToTournament(
				tournamentId,
				participantsToAdd
			);

			if (!updatedTournament) {
				res.status(500);
				throw new Error(
					`Some error ocurred in adding participants to the tournament :(`
				);
			}
			res.json(updatedTournament);
		} catch (err) {
			next(err);
		}
	}
);

export default tournamentsRouter;
