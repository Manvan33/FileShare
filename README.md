# FileShare  
_A user-friendly NodeJS program to share files on a LAN_  
Ideal for computer -> phone transfers 

# Installation
You will need to have NodeJS and npm installed  
**Install** the requirements with  
`npm install`  

# Usage
**Launch** the application with  
`npm start`

# Configuration 
You can change some **settings** by editing `options.txt`  
(this file is created automaticaly when the programm starts for the first time).  
* `RECEIVE_PATH` = the path in which the files will be uploaded  
* `SHARED_PATH` = folder that will be publicly shared  
* `PORT` = Network port, Requires a restart of the app to be changed  

# Features  

Share one or multiple files by uploading them on the main page.  
You can then send a link or a QR-Code to the device on which you want to retrieve the file.

# Screenshots

### Main interface :
![image](https://user-images.githubusercontent.com/44155819/109871603-a6fee680-7c6b-11eb-9f07-549ad784f637.png)
### Configuration interface
![image](https://user-images.githubusercontent.com/44155819/109871720-c138c480-7c6b-11eb-9a25-1804a1266bce.png)
### Responsive mobile version
![image](https://user-images.githubusercontent.com/44155819/109873586-3ad1b200-7c6e-11eb-8d2d-1c5f9f3cb9ac.png)
### QR Sharing
![image](https://user-images.githubusercontent.com/44155819/109873647-5472f980-7c6e-11eb-9d1a-96886d79f62b.png)

# Build

Releases are built using [node pkg](https://github.com/tetratelabs/node-pkg).

After installing, you can build binairies with 

```bash
$ pkg ./server.js
```