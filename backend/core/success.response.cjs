const { StatusCodes, ReasonPhrases } = require('../utils/httpStatusCode.cjs');

class SuccessResponse {
    constructor({ message, statusCode = StatusCodes.OK, reasonStausCode = ReasonPhrases.OK, data = {} }) {
        this.message = message || reasonStausCode;
        this.status = statusCode;
        this.data = data || {};
    }
    send(res, headers = {}) {
        return res.status(this.status).json(this);
    }
}

class OK extends SuccessResponse {
    constructor({ message, data }) {
        super({ message, data });
    }
}

class CREATED extends SuccessResponse {
    constructor({ message, data, statusCode = StatusCodes.CREATED, reasonStausCode = ReasonPhrases.CREATED }) {
        super({ message, data, statusCode, reasonStausCode });
    }
}

module.exports = {
    OK,
    CREATED,
    SuccessResponse
}