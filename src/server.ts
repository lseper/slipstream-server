import express from "express";
import apiRouter from "./api/api";

const app = express();
app.use(express.json());

// Start server
const PORT = process.env.PORT || 5001;
app.use("/api/v1", apiRouter);
app.listen(PORT, () => {
	console.log(`Server is running on https://localhost:${PORT}`);
});
