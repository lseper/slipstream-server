import { hashSync } from "bcrypt";
import prisma from "../../utility/db";
import type { CreateUserDataType } from "../../types/user";

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
