require("dotenv").config();
const fs = require("fs");
const formidable = require("formidable");
const router = require("express").Router();
const ethers = require("ethers");
const mongoose = require("mongoose");

const Logger = require("../services/logger");
const auth = require("./middleware/auth");
const Account = mongoose.model("Account");
const toLowerCase = require("../utils/utils");

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

router.get("/nonce/:address", auth, async (req, res) => {
	try {
		let address = toLowerCase(req.params.address);
		if (!ethers.utils.isAddress(address))
			return res.json({
				status: "failed",
				data: "invalid erc20 address",
			});
		let account = await Account.findOne({ address: address });
		if (account) {
			return res.json({
				status: "success",
				data: account.nonce,
			});
		} else {
			let _account = new Account();
			_account.address = address;
			_account.nonce = Math.floor(Math.random() * 9999999);
			let __account = await _account.save();
			return res.json({
				status: "success",
				data: __account.nonce,
			});
		}
	} catch (error) {
		return res.json({
			status: "failed",
		});
	}
});

module.exports = router;
