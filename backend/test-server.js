import express from "express";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/chat", (req, res) => {
    console.log("Got request!");
    res.json({ response: "Hello from test server!" });
});

app.listen(port, () => {
    console.log(`Test server running on ${port}`);
});
