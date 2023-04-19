import { sign } from "jsonwebtoken";
import { User } from "@prisma/client";

// Usually I keep the token between 5 minutes - 15 minutes
export function generateAccessToken(user: User) {
	if (!process.env.JWT_ACCESS_SECRET) {
		throw new Error(
			"Cannot generate refresh token as JWT_ACCESS_SECRET is undefined"
		);
	}
	return sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
		expiresIn: "5m",
	});
}

// I choosed 8h because i prefer to make the user login again each day.
// But keep him logged in if he is using the app.
// You can change this value depending on your app logic.
// I would go for a maximum of 7 days, and make him login again after 7 days of inactivity.
export function generateRefreshToken(user: User, jti: string) {
	if (!process.env.JWT_REFRESH_SECRET) {
		throw new Error(
			"Cannot generate refresh token as JWT_REFRESH_SECRET is undefined"
		);
	}
	return sign(
		{
			userId: user.id,
			jti,
		},
		process.env.JWT_REFRESH_SECRET,
		{
			expiresIn: "8h",
		}
	);
}

export function generateTokens(user: User, jti: string) {
	const accessToken = generateAccessToken(user);
	const refreshToken = generateRefreshToken(user, jti);

	return {
		accessToken,
		refreshToken,
	};
}
