/**
 * Package imports
*/
import express from 'express';
import cors from 'cors';

/**
 * Local file imports
*/
import * as connection from "./database/connection.js";
import * as auth from "./middleware/auth.js";
import payment from './routes/payment.js';
import user from './routes/user.js';

const app = express();
const port = process.env.PORT || 5000;

// DB connection
connection.connectDb();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes included
app.get("/welcome", auth.verifyToken, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});
app.use("/api/payment", payment);
app.use("/api/user", user);

app.listen(port, () => console.log(`server started on port ${port}`));