class ClientData {
    constructor(clientId, oncall) {
        this.clientId = clientId;
        this.userId = null;
        this.oncall = oncall;
    }

    login(bool, userId) {
        this.userId = bool ? userId : null;
    }
}

module.exports = ClientData;