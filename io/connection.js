
/*********************************
 TODO list:
 simple Login and register for advisors
 // add email confirmation and password recovery
 student creation and management function for advisors
 post and comment that advisors can create posts and students receive their advisor's post and both can comment
 student information updates
 comment replies
 advisor-student chat
 group chats
 *********************************/

var clients = new Map();

const connectionListener = client => {

    let clientManager = new Client(client, () => {
        clients.delete(client.id);
    });
    clients.set(client.id, clientManager);
};

module.exports = connectionListener;


// to get key by value
// let people = new Map();
// people.set('1', 'jhon');
// people.set('2', 'jasmein');
// people.set('3', 'abdo');

// let jhonKeys = [...people.entries()]
//         .filter(({ 1: v }) => v === 'jhon')
//         .map(([k]) => k);