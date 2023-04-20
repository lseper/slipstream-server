import { Router } from "express";
import { v4 } from "uuid";
import { compare } from "bcrypt";
import { generateTokens } from "../../utility/jwt";
import {
	addRefreshTokenToWhitelist,
	findRefreshTokenById,
	deleteRefreshToken,
	revokeTokens,
} from "./auth.services";
import {
	findUserByEmail,
	createUserByEmailAndPassword,
	findUserById,
} from "../users/users.services";
import { Role } from "../../types/user";
import { verify } from "jsonwebtoken";
import { hashToken } from "../../utility/hashToken";

const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
	try {
		console.log(req.body)
		const { email, password, name } = req.body;
		if (!email || !password) {
			res.status(400);
			throw new Error("You must provide an email and a password.");
		}

		const existingUser = await findUserByEmail(email);

		if (existingUser) {
			res.status(400);
			throw new Error("Email already in use.");
		}

		const user = await createUserByEmailAndPassword({
			email,
			password,
			name,
			role: Role.Enum.USER,
		});
		// for some reason "-" isn't allowed in the
		const jti = v4();
		const { accessToken, refreshToken } = generateTokens(user, jti);
		await addRefreshTokenToWhitelist({
			jti,
			refreshToken,
			userId: user.id,
		});

		res.json({
			accessToken,
			refreshToken,
		});
	} catch (err) {
		next(err);
	}
});

authRouter.post("/login", async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			res.status(400);
			throw new Error("You must provide an email and a password.");
		}

		const existingUser = await findUserByEmail(email);

		if (!existingUser) {
			res.status(403);
			throw new Error("Invalid login credentials.");
		}

		const validPassword = await compare(password, existingUser.password);
		if (!validPassword) {
			res.status(403);
			throw new Error("Invalid login credentials.");
		}

		const jti = v4();
		const { accessToken, refreshToken } = generateTokens(existingUser, jti);
		await addRefreshTokenToWhitelist({
			jti,
			refreshToken,
			userId: existingUser.id,
		});

		res.json({
			accessToken,
			refreshToken,
		});
	} catch (err) {
		next(err);
	}
});

authRouter.post("/refreshToken", async (req, res, next) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			res.status(400);
			throw new Error("Missing refresh token.");
		}
		const payload = verify(refreshToken, process.env.JWT_REFRESH_SECRET!);

		if (typeof payload === "string") {
			throw new Error("Error decoding token with secret :(");
		}

		if (!payload.jti) {
			throw new Error(`jti not present on payload, payload: ${payload}`);
		}

		const savedRefreshToken = await findRefreshTokenById(payload.jti);

		if (!savedRefreshToken || savedRefreshToken.revoked === true) {
			res.status(401);
			throw new Error("Unauthorized");
		}

		const hashedToken = hashToken(refreshToken);
		if (hashedToken !== savedRefreshToken.hashedToken) {
			res.status(401);
			throw new Error("Unauthorized");
		}

		const user = await findUserById(payload.userId);
		if (!user) {
			res.status(401);
			throw new Error("Unauthorized");
		}

		await deleteRefreshToken(savedRefreshToken.id);
		const jti = v4();
		const { accessToken, refreshToken: newRefreshToken } = generateTokens(
			user,
			jti
		);
		await addRefreshTokenToWhitelist({
			jti,
			refreshToken: newRefreshToken,
			userId: user.id,
		});

		res.json({
			accessToken,
			refreshToken: newRefreshToken,
		});
	} catch (err) {
		next(err);
	}
});

// This endpoint is only for demo purpose.
// Move this logic where you need to revoke the tokens( for ex, on password reset)
authRouter.post("/revokeRefreshTokens", async (req, res, next) => {
	try {
		const { userId } = req.body;
		await revokeTokens(userId);
		res.json({ message: `Tokens revoked for user with id #${userId}` });
	} catch (err) {
		next(err);
	}
});

export default authRouter;
