const { execute } = require("../Utils/adhaar-ocr")
const { successResponse, failResponse } = require("../helpers/methods")

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
index = async (req, res) => {
    res.send(successResponse("Server is Running Great"))
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
    try {
        const { front, back } = req.body

        

        if (front === "" || back === "") {
            res.status(400).json(failResponse("Front and back images needed to be in base64"))
        }

        const result = await execute(front.split("base64,")[1], back.split("base64,")[1])

        res.send(
            successResponse({
                data: result
            })
        )
    } catch (error) {
        res.status(500).json(failResponse("Internal Server Error"))
    }
}

module.exports = {
    index,
    aadhaarOCR,
    indexPost
}
