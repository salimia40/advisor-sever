const ClientData = require('./clientData')

/**
 * @class DataManager
 * keeps track of all clients
 */
class ClientManager {

    constructor() {
        this.clientDatas = [];
    }

    addClient(clientId, onCall) {
        this.clientDatas.push(
            new ClientData(clientId, onCall)
        )
    }

    putClient(clientData) {
        this.clientDatas.push(clientData)
    }

    loginClient(clientId, userId = null) {
        let clientData = this.clientDatas.find((c) => c.clientId === clientId);
        clientData.login(true, userId);
    }

    logoutUser(clientId, userId) {
        console.log(this)
        console.log(this.clientDatas)
        let clientDatasS = this.clientDatas.filter((c) => c.userId === userId);
        return new Promise((res) => {
            let clientData = clientDatasS.find((c) => c.clientId === clientId);
            console.log(`nomber of clients ${clientDatasS.length}`)
            clientData.login(false, userId);
            res(!(clientDatasS.length > 1))
        })
    }

    disconnectClient(clientId) {
        this.clientDatas = this.clientDatas.filter((c) => c.clientId !== clientId);
    }

    callUser(action) {

        let clientDatas = this.clientDatas.filter((c) => c.userId === action.userId);
        clientDatas.forEach(clientData => clientData.oncall(action));

    }
}

module.exports = ClientManager