const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = process.env.PORT || 5001;

const Logger = require("./services/logger");

app.use(
	bodyParser.urlencoded({
		extended: false,
	})
);

require("./models/account");

app.use(require("./apis"));

app.use(bodyParser.json());
app.use(express.json());
app.use(cors({ origin: "*" }));
app.options("*", cors());

const connect = () => {
	const uri = process.env.DB_URL;

	mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	const db = mongoose.connection;
	db.on("error", console.error.bind(console, "connection error:"));
	db.once("open", function () {
		Logger.info("Raisy Backend has been connected to the db server");
		app.listen(port, () => {
			Logger.info(`Raisy Backend is running at port ${port}`);
		});
	});
};

connect();
