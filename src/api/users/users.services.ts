import { hashSync } from "bcrypt";
import prisma from "../../utility/db";
import type { CreateUserDataType } from "../../types/user";
import { Request, Response } from "express";

export function findUserByEmail(email: string) {
	return prisma.user.findUnique({
		where: {
			email,
		},
	});
}

export function createUserByEmailAndPassword(user: CreateUserDataType) {
	user.password = hashSync(user.password, 12);
	return prisma.user.create({
		data: user,
	});
}

export function findUserById(id: string) {
	return prisma.user.findUnique({
		where: {
			id,
		},
	});
}

export async function userExists(req: Request, res: Response) {
	// @ts-ignore - angry as it can't tell that .payload is added to req object by isAuthenticated middleware
	const { userId } = req.payload;
	// @ts-ignore
	const user = await findUserById(userId);
	if (!user) {
		res.status(404);
		throw new Error(`User with id ${userId} not found`);
	}
}
