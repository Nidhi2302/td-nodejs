# Node.js Template Project

## Introduction
 
This project provides required apis for tradingspaces project. 

## Table of Contents

  1. [Project setup guide](#setup)
  1. [Available Ready Modules](#modules)
  
##  Project setup guide
<a name="setup"></a>
### Prerequesites

1. Latest version of Node.js and NPM installed (npm-5.5.1,node-8.9.1)
2. Git installed


### Clone template code base
```
git clone http://git.sa-labs.info/tradingspaces/tradingspaces-nodejs.git
```

### Install depedencies

As per best practise node_modules should always be in .gitignore, move to directory where you have project checkout and run below command in terminal
```
npm install 
```

### Configuration file (.env)
All enviroment configuration variables like database configuration are managed through .env file

### Routes
Main routes are added in route.js under root folder

Individual routes are added under modules->moduleName folder

### Config
Config folder contains different config file like database.js, config.js. Update values under config if required

### Language

Add all message in translation file under languate folder.

Example:
```
"USER_PASSWORD_REQUIRE" : "Password Required”
```

## How to run node api

## Open api in poster
```
Example
<Domain or IP Address>:<port number as in .env file>/api/v1/<apiName> -> http://192.168.1.82:5000/api/v1/demo/get_users
```


# Modules
<a name="modules"></a>
## a. User Module
## b. Stripe Payment Module

    