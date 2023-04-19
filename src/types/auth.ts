import { z } from "zod";

export const Role = z.enum(["ADMIN", "USER"]);

export const CreateUserData = z.object({
	email: z.string(),
	name: z.string(),
	password: z.string(),
	role: Role,
});

export type CreateUserDataType = z.infer<typeof CreateUserData>;
