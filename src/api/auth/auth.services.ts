import prisma from "../../utility/db";
import { hashToken } from "../../utility/hashToken";

// used when we create a refresh token.
export function addRefreshTokenToWhitelist({
	jti,
	refreshToken,
	userId,
}: {
	jti: string;
	refreshToken: string;
	userId: string;
}) {
	return prisma.refreshToken.create({
		data: {
			id: jti,
			hashedToken: hashToken(refreshToken),
			userId,
		},
	});
}

// used to check if the token sent by the client is in the database.
export function findRefreshTokenById(id: string) {
	const refreshToken = prisma.refreshToken.findUnique({
		where: {
			id,
		},
	});
	if (!refreshToken) {
		throw new Error(`Couldn't find a refresh token for id ${id}`);
	}
	return refreshToken;
}

// soft delete tokens after usage.
export function deleteRefreshToken(id: string) {
	return prisma.refreshToken.update({
		where: {
			id,
		},
		data: {
			revoked: true,
		},
	});
}

export function revokeTokens(userId: string) {
	return prisma.refreshToken.updateMany({
		where: {
			userId,
		},
		data: {
			revoked: true,
		},
	});
}
