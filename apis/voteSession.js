require("dotenv").config();
// const { default: axios } = require("axios");
const router = require("express").Router();

const ethers = require("ethers");

const mongoose = require("mongoose");
const VoteSession = mongoose.model("VoteSession");

// const auth = require("./middleware/auth");
// const validateSignature = require("../apis/middleware/auth.sign");

// const Logger = require("../services/logger");
// const extractAddress = require("../services/address.utils");
const service_auth = require("./middleware/auth.tracker");

router.post("/newVoteSession", service_auth, async (req, res) => {
	try {
		const { args, blockNumber, transactionHash } = req.body;
		const [campaignIdBN, voteSessionIdBN] = args;

		let campaignID = parseInt(campaignIdBN.hex);
		let voteSessionID = parseInt(voteSessionIdBN.hex);

		let voteSession = await VoteSession.findOne({
			campaignId: campaignID,
			id: voteSessionID,
		});

		if (voteSession) {
			return res.json({
				status: "failed",
				error: "Vote Session already exists",
			});
		} else {
			let _voteSession = new VoteSession();
			_voteSession.campaignId = campaignID;
			_voteSession.id = voteSessionID;
			_voteSession.startBlock = blockNumber;
			_voteSession.inProgress = true;

			let newVoteSession = await _voteSession.save();

			if (!newVoteSession) {
				throw Error("Unable to add newVoteSession to the DB");
			}
		}
	} catch (error) {
		return res.json({ status: "failed", error: error });
	}
});

router.post("newVote", service_auth, async (req, res) => {
	try {
		const { args, blockNumber, transactionHash } = req.body;
		const [campaignIdBN, voteSessionIdBN, voterC, voteRatioBN] = args;

		const campaignID = parseInt(campaignIdBN.hex);
		const voteSessionID = parseInt(voteSessionIdBN.hex);
		const voteRatio = parseInt(voteRatioBN.hex);
		const voter = voterC.toLowerCase();

		// First update the vote session
		let voteSession = await VoteSession.findOne({
			campaignId: campaignID,
			id: voteSessionID,
		});

		voteSession.voteRatio = voteRatio;

		await voteSession.save();

		return res.json({});
	} catch (error) {
		return res.json({ status: "failed", error: error });
	}
});

router.post("endVoteSession", service_auth, async (req, res) => {
	try {
		const { args, blockNumber, transactionHash } = req.body;
		const [campaignIdBN, voteSessionIdBN, numUnsuccessfulVotesBN] = args;

		let campaignID = parseInt(campaignIdBN.hex);
		const voteSessionID = parseInt(voteSessionIdBN.hex);
		let numUnsuccessfulVotes = parseInt(numUnsuccessfulVotesBN.hex);

		let voteSession = await VoteSession.findOne({
			campaignId: campaignID,
			id: voteSessionID,
		});

		voteSession.inProgress = false;
		voteSession.numUnsuccessfulVotes = numUnsuccessfulVotes;

		await voteSession.save();

		return res.json({});
	} catch (error) {
		return res.json({ status: "failed", error: error });
	}
});

router.get("/lastVoteSession/:campaignID", async (req, res) => {
	try {
		let campaignID = req.params.campaignID;

		let voteSession = VoteSession.findOne(
			{ campaignId: campaignID },
			{},
			{ sort: { id: -1 } }
		);

		return res.json({
			status: "success",
			data: voteSession,
		});
	} catch (error) {
		return res.json({ status: "failed", error: error });
	}
});

module.exports = router;
