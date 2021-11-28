const mongoose = require("mongoose");

const VoteSession = mongoose.Schema({
	campaignId: { type: Number, required: true, unique: true },
	id: { type: Number, required: true, default: 0 },
	startBlock: { type: Number, required: true },
	voteRatio: { type: Number, default: 0 },
	inProgress: { type: Boolean, default: false, required: true },
	numUnsuccessfulVotes: { type: Number, default: 0 },
	message: { type: String, default: "" },
	nbVotes: { type: Number, default: 0 },
});

VoteSession.index({ campaignId: 1 });

VoteSession.methods.toJson = function () {
	return {
		campaignId: this.campaignId,
		id: this.id,
		startBlock: this.startBlock,
		voteRatio: this.voteRatio,
		inProgress: this.inProgress,
		numUnsuccessfulVotes: this.inProgress,
	};
};

mongoose.model("VoteSession", VoteSession);
