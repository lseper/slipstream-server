import { hashSync } from "bcrypt";
import prisma from "../../utility/db";
import {
	SeedGenerationAlgorithm,
	Tournament,
	User,
	Participant,
} from "@prisma/client";
import { Platform } from "@prisma/client";

export async function createTournament(
	ownerId: string,
	tournamentName: string,
	racesPerRound: number,
	partsPerRace: number,
	startTime: Date,
	setupsCount: number,
	platform: Platform,
	dlc: boolean,
	seedGenerationAlgorithm: SeedGenerationAlgorithm
) {
	return await prisma.tournament.create({
		data: {
			name: tournamentName,
			racesPerRound,
			partsPerRace,
			startTime,
			setupsCount,
			platform,
			dlc,
			seedGenerationAlgorithm,
			User: {
				connect: { id: ownerId },
			},
		},
	});
}

export async function getTournamentById(tournamentId: string) {
	return await prisma.tournament.findUnique({
		where: { id: tournamentId },
		include: { participants: true, rounds: true }, // Include participants and rounds to avoid overwriting existing data
	});
}

export async function createParticipantsForTournament(
	tournament: Tournament & { participants: Participant[] },
	userIDs: string[]
) {
	return await Promise.all(
		userIDs.map(async (userId) => {
			const existingParticipant = tournament.participants.find(
				(participant) => participant.userId === userId
			);
			if (existingParticipant) {
				// Skip adding participants that are already part of the tournament
				return existingParticipant;
			} else {
				const participant = await prisma.participant.create({
					data: {
						user: { connect: { id: userId } },
						Tournament: { connect: { id: tournament.id } },
					},
				});
				return participant;
			}
		})
	);
}

export async function addParticipantsToTournament(
	tournamentId: string,
	participants: Participant[]
) {
	try {
		// Update the tournament with the new participants array
		const updatedTournament = await prisma.tournament.update({
			where: { id: tournamentId },
			data: {
				participants: {
					connect: participants.map((p) => ({ id: p.id })),
				},
			},
		});

		console.log(
			`Added ${participants.length} participants to tournament ${tournamentId}`
		);
		return updatedTournament;
	} catch (error) {
		console.error(
			`Error adding participants to tournament ${tournamentId}`
		);
	}
}
