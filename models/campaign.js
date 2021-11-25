const mongoose = require("mongoose");

const Campaign = mongoose.Schema(
	{
		campaignId: { type: Number, required: true, unique: true },
		title: { type: String, required: true, maxLength: 30 },
		description: { type: String, required: true },
		coverImageHash: { type: String, required: true },
		amountToRaise: { type: Number, required: true },
		createdAt: { type: Date, required: true },
		endAt: { type: Date, required: true },
		creator: { type: String, required: true },
		amountRaised: { type: Number, default: 0 },
		nbDonations: { type: Number, default: 0 },
		nbMilestones: { type: Number, default: 0 },
		pctReleasePerMilestone: [{ type: Number }],
		lastDonationDate: { type: Date },
		signature: { type: String },
		signatureAddress: { type: String },
	},
	{ timestamps: true }
);

Campaign.index({ campaignId: 1 }, { unique: true });

Campaign.methods.toJson = function () {
	return {
		campaignId: this.campaignId,
		title: this.title,
		description: this.description,
		coverImageHash: this.coverImageHash,
		amountToRaise: this.amountToRaise,
		createdAt: this.createdAt,
		endAt: this.endAt,
		creator: this.creator,
		amountRaised: this.amountRaised,
		nbDonations: this.nbDonations,
		nbMilestones: this.nbMilestones,
		pctReleasePerMilestone: this.pctReleasePerMilestone,
		signature: this.signature,
		signatureAddress: this.signatureAddress,
	};
};

mongoose.model("Campaign", Campaign);
