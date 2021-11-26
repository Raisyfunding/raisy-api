const mongoose = require("mongoose");

const VoteSession = mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  startBlock: { type: Number, default: 0 },
  voteRatio: { type: Number },
  inProgress: { type: Boolean },
  numUnsuccessfulVotes: { type: Number },
});

VoteSession.index({ campaignId: 1 }, { unique: true });

VoteSession.methods.toJson = function () {
  return {
    id: this.id,
    startBlock: this.startBlock,
    voteRatio: this.voteRatio,
    inProgress: this.inProgress,
    numUnsuccessfulVotes: this.inProgress,
  };
};

mongoose.model("VoteSession", VoteSession);

//  /// @notice Vote Structure
//  struct VoteSession {
//     uint256 id;
//     uint256 startBlock;
//     int256 voteRatio;
//     bool inProgress;
//     uint8 numUnsuccessfulVotes;
// }
