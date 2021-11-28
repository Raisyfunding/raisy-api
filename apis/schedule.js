require("dotenv").config();
// const { default: axios } = require("axios");
const router = require("express").Router();

const ethers = require("ethers");

const mongoose = require("mongoose");
const Schedule = mongoose.model("Schedule");

// const auth = require("./middleware/auth");
// const validateSignature = require("../apis/middleware/auth.sign");

// const Logger = require("../services/logger");
// const extractAddress = require("../services/address.utils");
const service_auth = require("./middleware/auth.tracker");

router.post("/newSchedule", service_auth, async (req, res) => {
	try {
		const { args, blockNumber, transactionHash } = req.body;
		const [campaignIdBN, nbMilestonesBN, pctReleasePerMilestoneBN] = args;

		let campaignID = parseInt(campaignIdBN.hex);
		let nbMilestones = parseInt(nbMilestonesBN.hex);
		let pctReleasePerMilestone = pctReleasePerMilestoneBN.map((pct) =>
			parseInt(pct.hex)
		);

		let schedule = await Schedule.findOne({ campaignId: campaignID });

		if (schedule) {
			throw Error("Schedule already registered");
		} else {
			let _schedule = new Schedule();
			_schedule.campaignId = campaignID;
			_schedule.nbMilestones = nbMilestones;
			_schedule.pctReleasePerMilestone = pctReleasePerMilestone;
			_schedule.stage = 1;

			let newSchedule = await _schedule.save();

			if (!newSchedule) {
				throw Error("Unable to add newSchedule to the database");
			}
		}
	} catch (error) {
		return res.json({ status: "failed", error: error });
	}
});

router.post("/fundsClaimed", service_auth, async (req, res) => {
	try {
		const { args, blockNumber, transactionHash } = req.body;
		const [campaignIdBN, creatorC] = args;

		const campaignID = parseInt(campaignIdBN.hex);
		const creator = creatorC.toLowerCase();

		// First update the schedule
		let schedule = await Schedule.findOne({ campaignId: campaignID });

		schedule.currentMilestone += 1;
		if (schedule.currentMilestone >= schedule.nbMilestones) {
			schedule.stage = 2;
		}
		schedule.lastClaimedDate = Date().now;

		// Then send an email to the creator to confirm

		await schedule.save();

		return res.json({});
	} catch (error) {
		return res.json({ status: "failed", error: error });
	}
});

router.post("/newRefundVote", service_auth, async (req, res) => {
	try {
		const { args, blockNumber, transactionHash } = req.body;
		const [campaignIdBN, voterC, wantsRefundBN] = args;

		const campaignID = parseInt(campaignIdBN.hex);
		const wantsRefund = parseInt(wantsRefundBN.hex);
		const voter = voterC.toLowerCase();

		// First update the schedule
		let schedule = await Schedule.findOne({ campaignId: campaignID });

		schedule.wantsRefund = wantsRefund;

		// Then send an email to the voter to confirm

		await schedule.save();

		return res.json({});
	} catch (error) {
		return res.json({ status: "failed", error: error });
	}
});

router.get("/getSchedule/:campaignID", async (req, res) => {
	try {
		let campaignID = req.params.campaignID;
		let schedule = await Schedule.findOne({ campaignId: campaignID });

		return res.json({
			status: "success",
			data: schedule,
		});
	} catch (error) {
		return res.json({ status: "failed", error: error });
	}
});

module.exports = router;
