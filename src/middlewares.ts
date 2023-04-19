import { JwtPayload, TokenExpiredError, verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
	payload?: JwtPayload;
}

export function isAuthenticated(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) {
	const { authorization } = req.headers;

	if (!authorization) {
		res.status(401);
		throw new Error("🚫 Un-Authorized 🚫");
	}

	try {
		const token = authorization.split(" ")[1];
		const payload = verify(token, process.env.JWT_ACCESS_SECRET!);
		if (typeof payload === "string") {
			throw new Error("Error decoding token with secret :(");
		}
		req.payload = payload;
	} catch (err) {
		res.status(401);
		if (isTokenExpiredError(err)) {
			throw new Error(err.name);
		}
		throw new Error("🚫 Un-Authorized 🚫");
	}

	return next();
}

function isTokenExpiredError(error: any): error is TokenExpiredError {
	return error && error.name === "TokenExpiredError";
}
