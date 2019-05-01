# advisor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/puyaars/advisor/blob/master/LICENSE)

Advisor is an app to connect university students with theire advisors so the chat, connect and communicate, there's also groups for students to connect each other.
this project is backend for the app.
---
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

    - /upload @post             upload any file
    - /files/:name              download file knowing its name
    -/confirm/:userId/:code     confirm user's email address

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

##License
This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/puyaars/advisor/blob/master/LICENSE) file for details