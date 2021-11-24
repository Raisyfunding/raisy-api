require("dotenv").config();
const fs = require("fs");
const formidable = require("formidable");
const Logger = require("../services/logger");
const extractAddress = require("../services/address.utils");
const router = require("express").Router();
const pinataSDK = require("@pinata/sdk");
const auth = require("./middleware/auth");

const uploadPath = process.env.UPLOAD_PATH;
const pinata = pinataSDK(
	process.env.PINATA_API_KEY,
	process.env.PINATA_API_SECRET_KEY
);

/**
 * Pin cover image for campaign
 */
const pinCampaignFileToIPFS = async (fileName, title, address) => {
	const options = {
		pinataMetadata: {
			name: title,
			keyvalues: {
				title: title,
				address: address,
			},
		},
		pinataOptions: {
			cidVersion: 0,
		},
	};

	const readableStreamForFile = fs.createReadStream(uploadPath + fileName);

	try {
		let result = await pinata.pinFileToIPFS(readableStreamForFile, options);
		return result;
	} catch (error) {
		Logger.error(error);
		return "failed to pin file to ipfs";
	}
};

/**
 * Test the pinata SDK
 */
router.get("/ipfstest", async (req, res) => {
	pinata
		.testAuthentication()
		.then((result) => {
			res.send({
				result: result,
			});
		})
		.catch((err) => {
			Logger.error(err);
			res.send({
				result: "failed",
			});
		});
});

/**
 * Pin the campaign cover image to IPFS
 */
router.post("/uploadCampaignImage2Server", auth, async (req, res) => {
	let form = new formidable.IncomingForm();
	form.parse(req, async (err, fields, files) => {
		if (err) {
			Logger.error(err);
			return res.status(400).json({
				status: "failedParsingForm",
			});
		} else {
			let imgData = fields.imgData;
			let title = fields.title;

			let address = extractAddress(req, res);

			let extension = imgData.substring(
				"data:image/".length,
				imgData.indexOf(";base64")
			);

			let imageFileName = `${address}${title.replace(" ", "")}.${extension}`;
			imgData = imgData.replace(`data:image\/${extension};base64,`, "");

			fs.writeFile(uploadPath + imageFileName, imgData, "base64", (err) => {
				if (err) {
					Logger.error(err);
					return res.status(400).json({
						status: "failed to save an image file",
						err,
					});
				}
			});

			let filePinStatus = await pinCampaignFileToIPFS(
				imageFileName,
				title,
				address
			);
			// remove file once pinned
			try {
				fs.unlinkSync(uploadPath + imageFileName);
			} catch (error) {}

			return res.json({
				status: "success",
				data: filePinStatus.IpfsHash,
			});
		}
	});
});

module.exports = router;
