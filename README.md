# advisor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/puyaars/advisor/blob/master/LICENSE)

Advisor is an app to connect university students with theire advisors so they can chat, connect and communicate, there's also groups for students to connect each other.
this project is backend for the app.

## Requirements

For development, you will only need Node.js and a node global package, Yarn, installed in your environement.
Also mongodb and [liara file server](https://liara.ir/) are used

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v11.9.0

    $ npm --version
    6.5.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

###
## Install

    $ git clone https://github.com/puyaars/advisor
    $ cd advisor
    $ npm install

## Configure app

Open `server/config/config.json` then edit it with your settings. You will need:

- A mongodb server;
- A liara file server;
- A email service;

## https Endpoints
    
all content should be urlencoded
endpoints sighned with @AUTH should have token header for autentication 

    upload any file
        @POST - /api/upload
        @BODY file
    
    download file knowing its name
        @GET - /api/files/:name
    
    confirm user's email address
        @GET - /email/:userId/:code     

    login and get api tocken
        @POST - /api/login
        @BODY @REQUIRED username
        @BODY @REQUIRED password

    register and get api tocken
        @POST - /api/register
        @BODY @REQUIRED username
        @BODY @REQUIRED password
        @BODY @REQUIRED name
        @BODY @REQUIRED email
        @BODY @REQUIRED role
        @BODY advisorId

    @AUTH get current user info
        @GET - /api/user
    
    @AUTH get spsific user info
        @POST - /api/user
        @BODY @REQUIRED uid
    
    @AUTH find users
        @POST - /api/user
        @BODY @REQUIRED query
    
    @AUTH update current user info
        @POST - /api/user
        @BODY email
        @BODY name
        @BODY bio
        @BODY avatarSmall
        @BODY avatarLarge

    @AUTH change password
        @POST - /api/user/password
        @BODY @REQUIRED password
        @BODY @REQUIRED passwordNew
    


## Running the project

    $ npm start

## Deployment

deploy using liara cli

```
npm install -g @liara/cli
cd my-website
liara deploy
████████████████████████████████████████ 100%
 Deployment finished successfully. 
https://my-website.liara.run
```

## Built With

    - Node.js
    - express.js
    - socket.io
    - mongoose


## Authors

* **AliReza Salimi** - *all the jobs* - [puyaars](https://github.com/puyaars)

[![alt text][1.1]][1]
[![alt text][2.1]][2]

[1.1]: http://i.imgur.com/tXSoThF.png (twitter icon with padding)
[2.1]: http://i.imgur.com/P3YfQoD.png (facebook icon with padding)

[1]: http://www.twitter.com/puyaars
[2]: http://www.facebook.com/puyaars

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/puyaars/advisor/blob/master/LICENSE) file for details