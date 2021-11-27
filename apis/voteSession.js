require("dotenv").config();
// const { default: axios } = require("axios");
const router = require("express").Router();

// const ethers = require("ethers");

const mongoose = require("mongoose");
const VoteSession = mongoose.model("VoteSession");
const Campaign = mongoose.model("Campaign");

const auth = require("./middleware/auth");
const validateSignature = require("../apis/middleware/auth.sign");

// const Logger = require("../services/logger");
const extractAddress = require("../services/address.utils");
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
		const [voterC, campaignIdBN, voteSessionIdBN, voteRatioBN] = args;

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
		voteSession.nbVotes += 1;

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

router.post(
	"/addMessage/:campaignID/:voteSessionID",
	auth,
	async (req, res) => {
		let owner = extractAddress(req, res);
		let signature = req.body.signature;
		let retrievedAddr = req.body.signatureAddress;

		let isValidsignature = await validateSignature(
			owner,
			signature,
			retrievedAddr
		);
		if (!isValidsignature) {
			return res.status(400).json({
				status: "failed",
				data: "Invalid signature from user",
			});
		}

		try {
			let campaignID = req.params.campaignID;
			let voteSessionID = req.params.voteSessionID;

			let message = req.body.message;
			const campaign = await Campaign.findOne({ campaignId: campaignID });

			if (campaign.creator !== owner) {
				return res.json({
					status: "failed",
					data: "Only the creator of the campaign can add a message",
				});
			} else {
				let _voteSession = await VoteSession.findOne({
					campaignId: campaignID,
					id: voteSessionID,
				});

				_voteSession.message = message;

				_voteSession.save();
			}

			return res.json({ status: "success" });
		} catch (error) {
			return res.json({ status: "failed", error: error });
		}
	}
);

router.get("/lastVoteSession/:campaignID", async (req, res) => {
	try {
		let campaignID = req.params.campaignID;

		let voteSession = await VoteSession.findOne(
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
