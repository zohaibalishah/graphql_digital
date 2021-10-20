const CognitoExpress = require('cognito-express')
const express = require('express')
const fs = require('fs')
const authenticatedRoute = express.Router()

const cognitoExpress = new CognitoExpress({
    region: "us-east-1",
    cognitoUserPoolId: "us-east-1_S8T8TecVs",
    tokenUse: "access", //Possible Values: access | id 
    tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
  });

  
authenticatedRoute.use(function(req, res, next) {
    // Pass in access token via headers
    let clientToken = req.headers.accesstoken
    if (!clientToken) return res.status(401).send("Access Token missing from header")
    cognitoExpress.validate(clientToken, function(err, response) {
        if (err) return res.status(401).send(err)
        res.locals.user = response
        next()
    })
})

authenticatedRoute.get('/list', function(req, res, next) {
    res.send(fs.readdirSync('/var/images/'))
})

authenticatedRoute.get('/retrive/:name', function(req, res, next) {
    if (!req.params.name) {
        res.status(422).json({ error: 'No filename' })
    }
    var options = {
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }
    return res.sendFile('/var/images/' + req.params.name, options , function(err) {
        if (err) {
            next(err)
          } else {
            console.log('Sent:', fileName)
          }
    })
})
