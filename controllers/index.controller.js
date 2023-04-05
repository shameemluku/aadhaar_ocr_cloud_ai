const { successResponse } = require("../helpers/methods")

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
index = async (req, res) => {
    res.send(
        successResponse("Server is Running Great")
    )
}


indexPost = async (req, res) => {
    res.send(
        successResponse("Express JS API Boiler Plate post api working like a charm...", {
            data: "here comes you payload...",
            request: req.body
        })
    )
}

aadhaarOCR = async (req, res) => {
    res.send(
        successResponse("Inside Aadhaar OCR")
    )
}

module.exports = {
    index,
    aadhaarOCR,
    indexPost
}

