import { hashSync } from "bcrypt";
import prisma from "../../utility/db";
import { SeedGenerationAlgorithm, Tournament, User } from "@prisma/client";
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
