const express = require("express")
const router = express.Router()

const { index, aadhaarOCR } = require("../controllers/index.controller")
const { validate } = require("../middlewares/validators/wrapper.validator")
const { indexValidator } = require("../middlewares/validators/index.validations")

router.get("/", index)
router.post("/", indexPost)
router.post("/ocr", aadhaarOCR)

module.exports = router
