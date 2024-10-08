![App Screenshot](https://develop.artaniom.xyz/static/media/hero.81f8e8cd.jpg)

<h1 align="center">
  Artaniom Backend
</h1>


  <p align="center">Artaniom: Where masterpiece artworks meet technology</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
</p>

# Description
For the backend of this project, we use of [NestJS](https://nestjs.com/), which is one of the node.js frameworks.


# Installation

```bash
$ npm install
```

# Running the app

#### In addition to the codes, the .env file is also needed to launch the project You can create the .env file with the following command
```bash
$ touch .env
```
#### .env
```ini
; artaniom data
PORT = 3001
ADMINPORT = 3005
PORT_RUN = 8082
BASE_URL = https://artaniom.services
DEV = true
SIGN_MESSACE = Hello, Welcome to Artaniom In order to do any transaction you need to sign this message: I accept the Artaniom Terms of Service https://artaniom.io/TermsOfServices.
SIGN_ADMIN_MESSACE = Hello, Welcome to Artaniom Admin Panel In order to do any transaction you need to sign this message.
EXECUTION = development
privateKeySIGN = MIICWwIBAAKBgQCZH1lRSr1hWucjDYPyCSXAi0JacA

; blockchain data
EHTER_SCAN = https://goerli.etherscan.io
IPFS_URL = http://184.94.212.101:5001/
IPFS_GATEWAY = https://ipfs.artaniom.io/ipfs/
GOERLI_URL = https://eth-mainnet.g.alchemy.com/v2/skSJTZsxh3fvwjaFWa0OuaAOBks-ozi5
GOERLI_WEBSOCKET = wss://eth-mainnet.g.alchemy.com/v2/skSJTZsxh3fvwjaFWa0OuaAOBks-ozi5
IPFS_PROTOCOL = ipfs://
chainId = 5
privateKeyBlockchain = a38da706e758430c04522e214767c512a04217a91c1b55d323da8133e89b649e

;393d1f8c43128c7cac280dee1ed8a261399b261bcca0acaf9c99225de7e29434

; data base data
DATABASE_USER=test
DATABASE_PASSWORD=test
MONGO_URL = mongodb://root:3JdCpDy258arExmC@162.254.32.188:27017/development?authSource=admin
PWD = zw2z10&;4f
PWD2 = KYvUdvz$39k#C5uU
USER = root

; contracts addresses
CONTRACT_ADDRESS = 0x12C96B5A8e07d7af391ef2677567c37c9AFf1fEd
secondary_factory = 0x1f44e876a507d04365ed0dE5E6B8465f90F8E88F
core = 0xF1a2aA43A372545400e8c3950c215C1c044de85E
market = 0x8453F6399188a0D4D9882dc62AF37eE9C169b422

# fix = 0x1aB51fbaa00096535a0019449000833a002A7F84
# auction = 0xe41A47c6eFE8b73Cfd9808ED05B2D5E33Bcc6721
# test = 0xAFfffA124483Db6b4b201523250021FaE3a94708

```

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Demo  
[development marketPlace](https://develop.artaniom.xyz/)

## Docs  
[development](https://artaniom.services:8082/docs/)<br>
[local](https://localhost:3000/docs/)

<br><br>

# Technologies used  
<ul>
  <li>node.js</li>
  <li>nest.js</li>
  <li>websocket</li>
  <li>ipfs</li>
  <li>alchemy</li>
  <li>web3.js</li>
  <li>ether.js</li>
  <li>redis</li>
  <li>mongodb</li>
</ul>






{
  "username": "behrouz",
  "password": "!@#123qwe",
  "address": "0x42d90Ad282CCeBE4F900ED2d20cb0Ffa3EdAa838",
  "name": "Behrouz Torabi",
  "permision": [
    {
      "_method": "getAdmins",
      "allow": true
    },
    {
      "_method": "editAdmin",
      "allow": true
    },
    {
      "_method": "getCreateAdmin",
      "allow": true
    },
    {
      "_method": "postCreateAdmin",
      "allow": true
    },
    {
      "_method": "showUsers",
      "allow": true
    },
    {
      "_method": "makeLazyPermision",
      "allow": true
    },
    {
      "_method": "getAllCollection",
      "allow": true
    },
    {
      "_method": "changeHomeCollection",
      "allow": true
    },
    {
      "_method": "showItems",
      "allow": true
    },
    {
      "_method": "toggleInInterface",
      "allow": true
    }
  ],
  "admin_type": 4,
  "time_added": 1727338105,
  "last_update": {
    "by": "Full Access Admin",
    "time": 1727338205
  },
  "last_login": {
    "time": "1727411942",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhZWVkYWJkaSIsIl9pZCI6IjY2ZjYzNjk0ODE4MjI0MTEzMjRkMWY5YSIsImFkZHJlc3MiOiIweDQyZDkwQWQyODJDQ2VCRTRGOTAwRUQyZDIwY2IwRmZhM0VkQWE4MzgiLCJuYW1lIjoiRnVsbCBBY2Nlc3MgQWRtaW4iLCJwZXJtaXNpb24iOlt7Il9pZCI6IjY2ZjYzNmU2NzI2ZGFlNWI1MGVmMjk2NyIsIl9tZXRob2QiOiJnZXRBZG1pbnMiLCJhbGxvdyI6dHJ1ZX0seyJfaWQiOiI2NmY2MzZlNjcyNmRhZTViNTBlZjI5NjgiLCJfbWV0aG9kIjoiZWRpdEFkbWluIiwiYWxsb3ciOnRydWV9LHsiX2lkIjoiNjZmNjM2ZTY3MjZkYWU1YjUwZWYyOTY5IiwiX21ldGhvZCI6ImdldENyZWF0ZUFkbWluIiwiYWxsb3ciOnRydWV9LHsiX2lkIjoiNjZmNjM2ZTY3MjZkYWU1YjUwZWYyOTZhIiwiX21ldGhvZCI6InBvc3RDcmVhdGVBZG1pbiIsImFsbG93Ijp0cnVlfSx7Il9pZCI6IjY2ZjYzNmU2NzI2ZGFlNWI1MGVmMjk2YiIsIl9tZXRob2QiOiJzaG93VXNlcnMiLCJhbGxvdyI6dHJ1ZX0seyJfaWQiOiI2NmY2MzZlNjcyNmRhZTViNTBlZjI5NmMiLCJfbWV0aG9kIjoibWFrZUxhenlQZXJtaXNpb24iLCJhbGxvdyI6dHJ1ZX0seyJfaWQiOiI2NmY2MzZlNjcyNmRhZTViNTBlZjI5NmQiLCJfbWV0aG9kIjoiZ2V0QWxsQ29sbGVjdGlvbiIsImFsbG93Ijp0cnVlfSx7Il9pZCI6IjY2ZjYzNmU2NzI2ZGFlNWI1MGVmMjk2ZSIsIl9tZXRob2QiOiJjaGFuZ2VIb21lQ29sbGVjdGlvbiIsImFsbG93Ijp0cnVlfSx7Il9pZCI6IjY2ZjYzNmU2NzI2ZGFlNWI1MGVmMjk2ZiIsIl9tZXRob2QiOiJzaG93SXRlbXMiLCJhbGxvdyI6dHJ1ZX0seyJfaWQiOiI2NmY2MzZlNjcyNmRhZTViNTBlZjI5NzAiLCJfbWV0aG9kIjoidG9nZ2xlSW5JbnRlcmZhY2UiLCJhbGxvdyI6dHJ1ZX1dLCJpYXQiOjE3Mjc0MTE5NDIsImV4cCI6MTczMjU5NTk0Mn0.hd_WKBRgISIQk_YVUSBIf5k2kRjabNyunWal17t9P1w",
    "_id": {
      "$oid": "66f636e6726dae5b50ef2971"
    }
  },
  "maker": "Behrouz Torabi"
}






[
  {
    "title": "Documents",
    "file_type": [
      {
        "type": "pdf"
      },
      {
        "type": "docx"
      },
      {
        "type": "txt"
      }
    ],
    "icon": "document_icon.png",
    "show": true
  },
  {
    "title": "Images",
    "file_type": [
      {
        "type": "jpg"
      },
      {
        "type": "png"
      },
      {
        "type": "svg"
      }
    ],
    "icon": "image_icon.png",
    "show": true
  },
  {
    "title": "Videos",
    "file_type": [
      {
        "type": "mp4"
      },
      {
        "type": "avi"
      },
      {
        "type": "mov"
      }
    ],
    "icon": "video_icon.png",
    "show": false
  }
]




