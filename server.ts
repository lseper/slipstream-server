import express from "express";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { PrismaClient } from "@prisma/client";
dotenv.config();

const prisma = new PrismaClient();

const app = express();

// Middleware
app.use(express.json());

const usersRouter = express.Router();
app.use('/users', usersRouter);

// Define a route for the '/users' path
usersRouter.get('/', (req, res) => {
	res.send('List of users...');
	// TODO: return users
});

// Define a dynamic route with a URL parameter on the '/users' path
usersRouter.get('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`User ${id} details...`);
	// TODO: return specific user
});

const userTournamentsRouter = express.Router({ mergeParams: true })
usersRouter.use('/:userId/tournaments', userTournamentsRouter);

userTournamentsRouter.get('/', (req, res) => {
	res.send('List of tournaments made by user...');
	// TODO return specific tournaments created by user
});


const tournamentsRouter = express.Router();
app.use('/tournaments', tournamentsRouter)

tournamentsRouter.get('/', (req, res) => {
	res.send('List of all tournaments...');
});
  
// Define a dynamic route with a URL parameter on the '/tournaments' path
tournamentsRouter.get('/:id', (req, res) => {
	const { id } = req.params;
	res.send(`Tournament ${id} details...`);
	// TODO return specific tournament
});

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

app.post("/", async (req, res) => {

})

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
