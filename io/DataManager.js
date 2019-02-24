const User = require("../models/user");
const queueManager = require('./queueManager');
const log = require("../log/log");

class ClientData {
    constructor(clientId, clientManager) {
        this.clientId = clientId;
        this.userId = null;
        this.clientManager = clientManager;
    }

    login(bool, userId) {
        this.userId = bool ? userId : null;
    }

    call(action) {
        this.clientManager.callAction(action);
    }
}

var clientDatas;

class DataManager {

    constructor() {
        clientDatas = [];
    }

    addClient(clientId, clientManager) {
        // this.clientDatas.push(
        clientDatas.push(
            new ClientData(clientId, clientManager)
        )
    }

    loginClient(clientId, userId = null) {
        // var clients = this.clientDatas.filter((c)=> c.clientId == clientId);
        // var clientData = this.clientDatas.find((c) => c.clientId === clientId);
        var clientData = clientDatas.find((c) => c.clientId === clientId);
        clientData.login(true, userId);
        // console.log(clientData);
        // console.log(clientDatas);
    }

    logoutUser(clientId, userId) {
        // var clientDatas = this.clientDatas.filter((c) => c.userId === userId);
        var clientDatasS = clientDatas.filter((c) => c.userId === userId);
        var clientData = clientDatasS.find((c) => c.clientId === clientId);
        clientData.login(false, userId);
        return !(clientDatasS.length > 1);
    }

    disconnectClient(clientId) {
        // this.clientDatas = this.clientDatas.filter((c) => c.clientId !== clientId);
        clientDatas = clientDatas.filter((c) => c.clientId !== clientId);
        // console.log(this.clientDatas);
    }

    callUser(action) {
        // log.info(`dataManager: ${this}`);
        // var clientDatas = this.clientDatas;
        // var clientDatas = this.clientDatas;
        User.isOnline(action.userId, (bool) => {
            if (bool) {
                clientDatas = clientDatas.filter((c) => c.userId === action.userId);
                clientDatas.forEach(clientData => clientData.call(action));
            } else {
                queueManager(action);
            }
        })
    }

}

const dataManager = new DataManager();
module.exports = dataManager;