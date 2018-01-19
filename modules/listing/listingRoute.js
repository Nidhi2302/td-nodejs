//Dependencies 
let express = require('express');
let listingCtr = require('./listingController.js');
let listingMiddleware = require('./listingMiddleware.js');
let auth = require("../../helper/auth");
let listingRouter = express.Router();

let listASpaceMiddleware = [auth.checkToken, listingMiddleware.validateInput("listASpace"), listingCtr.listASpace];
listingRouter.post('/list-a-space', listASpaceMiddleware);

let listingList = [auth.checkToken,listingCtr.listingList];
listingRouter.post('/listing-history', listingList);

let listingListAll = [auth.checkToken,listingCtr.listingListAll];
listingRouter.post('/all-listing-history', listingListAll);


let findASpaceMiddleware = [auth.checkToken, listingMiddleware.validateInput("findASpace"), listingCtr.findASpace];
listingRouter.post('/find-a-space', findASpaceMiddleware);

let findASpaceDetailMiddleware = [auth.checkToken,listingCtr.findASpaceDetail];
listingRouter.get('/find-a-space-detail/:id',findASpaceDetailMiddleware );


let managerListingList = [auth.checkToken,listingCtr.managerListingList];
listingRouter.post('/manager-listing-history', managerListingList);


module.exports = listingRouter;