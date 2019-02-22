 class ClientData {
    constructor(clientId ,clientManager){
        this.clientId = clientId;
        this.userId = null;
        this.clientManager = clientManager;
    }

    login(bool,userId){
       this.userId = bool? userId: null; 
    }

    call(action){
        this.clientManager.callAction(action);
    }
}

class DataManager {

   constructor(){
       this.clientDatas = [];
   }

   addClient(clientId,clientManager){
       this.clientDatas.push(
           new ClientData(clientId,clientManager)
       )
   }

   loginClient(clientId,userId = null){
       // var clients = this.clientDatas.filter((c)=> c.clientId == clientId);
       var clientData = this.clientDatas.find((c) => c.clientId === clientId);
       clientData.login(true,userId);
       console.log(clientData);
       console.log(this.clientDatas);
   }

   logoutUser(clientId,userId){
    var clientDatas = this.clientDatas.filter((c) => c.userId === userId);
    var clientData = clientDatas.find((c) => c.clientId === clientId);
    clientData.login(false,userId);
     return !(clientDatas.length > 1);
   }

   disconnectClient(clientId){   
    this.clientDatas = this.clientDatas.filter((c)=> c.clientId !== clientId);
    console.log(this.clientDatas);
   }

   callUser(userId,action){
    var clientDatas = this.clientDatas.filter((c) => c.userId === userId);
    clientDatas.forEach(clientData => clientData.call(action));
   }
   
}



var userId = 'userid';
var userId = 'userid2';
var userId = 'userid2';
var clientId = 'clientId';
var clientId2 = 'clientId2';
var clientId3 = 'clientId3';
var clientManager = 'clientManager'
const dataManager = new DataManager();

dataManager.addClient(clientId,clientManager);
dataManager.addClient(clientId2,clientManager);
dataManager.addClient(clientId3,clientManager);
dataManager.loginClient(clientId,userId);
dataManager.loginClient(clientId3,userId);
console.log(dataManager.logoutUser(clientId,userId));
dataManager.disconnectClient(clientId2);
