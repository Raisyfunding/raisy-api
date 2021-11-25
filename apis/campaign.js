require("dotenv").config();
// const { default: axios } = require("axios");
const router = require("express").Router();

// const ethers = require("ethers");

const mongoose = require("mongoose");
const Campaign = mongoose.model("Campaign");

const auth = require("./middleware/auth");
const validateSignature = require("../apis/middleware/auth.sign");

// const RaisyCampaignsContractABI = require("../constants/raisycampaignsabi");

const Logger = require("../services/logger");
const extractAddress = require("../services/address.utils");
const service_auth = require("./middleware/auth.tracker");

router.post("/campaigndetails", auth, async (req, res) => {
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

	let campaignId = req.body.campaignId;
	let title = req.body.title;
	let description = req.body.description;
	let coverImageHash = req.body.coverImageHash;
	let amountToRaise = req.body.amountToRaise;
	let nbMilestones = req.body.nbMilestones;
	let pctReleasePerMilestone = req.body.pctReleasePerMilestone;
	let endAt = req.body.endAt;

	// let pctSum = pctReleasePerMilestone.reduce((acc, cur) => {
	// 	return acc + cur;
	// }, 0);

	// if (pctSum !== 10000) {
	// 	return res.status(400).json({
	// 		status: "failed",
	// 		data: "Release percentages don't add up to 100%",
	// 	});
	// }

	let campaign = await Campaign.findOne({ campaignId: campaignId });

	// if the campaign already exists just return an error
	if (campaign) {
		return res.json({
			status: "failed",
			data: "Campaign already exists",
		});
	} else {
		let _campaign = new Campaign();
		_campaign.campaignId = campaignId;
		_campaign.title = title;
		_campaign.description = description;
		_campaign.coverImageHash = coverImageHash;
		_campaign.amountToRaise = amountToRaise;
		_campaign.nbMilestones = nbMilestones;
		_campaign.pctReleasePerMilestone = pctReleasePerMilestone;
		_campaign.endAt = endAt;
		_campaign.creator = owner;
		_campaign.createdAt = new Date(); // set creation date
		_campaign.signature = signature;
		_campaign.signatureAddress = retrievedAddr;

		let newCampaign = await _campaign.save();

		if (newCampaign) {
			return res.send({
				status: "success",
				data: newCampaign.toJson(),
			});
		} else {
			return res.send({
				status: "failed",
			});
		}
	}
});

router.get("/fetchAllCampaigns", async (_, res) => {
	let all = await Campaign.find().sort({ title: 1 });
	return res.json({
		status: "success",
		data: all,
	});
});

router.get("/getCampaign/:campaignID", async (req, res) => {
	try {
		let campaignID = req.params.campaignID;
		let campaign = await Campaign.findOne({ campaignId: campaignID });
		return res.json({
			status: "success",
			data: campaign,
		});
	} catch (error) {
		return res.json({
			status: "failed",
		});
	}
});

router.post("/newDonation", service_auth, async (req, res) => {
	try {
		Logger.info(req.body);
		let campaignID = req.body.campaignId;
		let donationAmount = req.body.amount;

		let campaign = await Campaign.findOne({ campaignId: campaignID });

		campaign.amountRaised += donationAmount;
		campaign.nbDonations += 1;
		campaign.lastDonationDate = Date.now();

		await campaign.save();

		return res.json({});
	} catch (error) {
		return res.json({ status: "failed", error: error });
	}
});

module.exports = router;
