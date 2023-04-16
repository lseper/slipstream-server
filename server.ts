import express from "express";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { PrismaClient } from "@prisma/client";
dotenv.config();

const prisma = new PrismaClient();

const app = express();

console.log(process.env.DATABASE_URL);

// Middleware
app.use(express.json());

// Routes
app.get("/", async (req, res) => {
	try {
		// Query data from Prisma
		const users = await prisma.user.findMany();
		res.json(users);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch users" });
	}
});

// Initialize MongoDB connection
async function connectToDatabase() {
	try {
		await prisma.$connect();
		console.log("Connected to MongoDB database");
	} catch (error) {
		console.error("Failed to connect to MongoDB database:", error);
		process.exit(1);
	}
}

connectToDatabase();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
