const router = require("express").Router();

router.use("/auth", require("./auth"));
router.use("/account", require("./account"));
router.use("/campaign", require("./campaign"));
router.use("/ipfs", require("./ipfs"));

module.exports = router;
