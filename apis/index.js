const router = require("express").Router();

router.use("/auth", require("./auth"));
router.use("/account", require("./account"));
router.use("/campaign", require("./campaign"));
router.use("/schedule", require("./schedule"));
router.use("/voteSession", require("./voteSession"));
router.use("/ipfs", require("./ipfs"));

module.exports = router;
