const mongoose = require("mongoose");

const Schedule = mongoose.Schema({
  campaignId: { type: Number, required: true, unique: true },
  nbMilestones: { type: Number, required: true },
  pctReleasePerMilestone: [{ type: Number, required: true }],
  pctRelease: { type: Number, default: 0 },
  currentMilestone: { type: Number, default: 0 },
  wantsRefund: { type: Number, default: 0 },
  stage: { type: Number, required: true },
});

Schedule.index({ campaignId: 1 }, { unique: true });

Schedule.methods.toJson = function () {
  return {
    campaignId: this.campaignId,
    nbMilestones: this.nbMilestones,
    pctReleasePerMilestone: this.pctReleasePerMilestone,
    pctRelease: this.pctRelease,
    currentMilestone: this.currentMilestone,
    wantsRefund: this.wantsRefund,
    stage: this.stage,
  };
};

mongoose.model("Schedule", Schedule);
