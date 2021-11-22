require("dotenv").config();
const fs = require("fs");
const formidable = require("formidable");
const router = require("express").Router();
const ethers = require("ethers");
const mongoose = require("mongoose");

const Logger = require("../services/logger");
const auth = require("./middleware/auth");
const Account = mongoose.model("Account");

const extractAddress = require("../services/address.utils");

router.get("/getaccountinfo", auth, async (req, res) => {
	let address = extractAddress(req);
	let account = await Account.findOne({ address: address });
	if (account) {
		return res.json({
			status: "success",
			data: account.toAccountJSON(),
		});
	} else {
		return res.status(400).json({
			status: "failed",
		});
	}
});

module.exports = router;
