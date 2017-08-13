// example server
const path = require('path');
const imageServer = require('./imageServer');
const express = require('express');
const app = express();

app.use(imageServer.server({
    imageSourcePath: path.join(__dirname, 'images'),
    imageDestPath: path.join(__dirname, 'dest'),
    storageHandler: imageServer.StorageHandlerNoStorage
}));


app.listen(3000, function() {
    console.log('Example app listening on port 3000');
});
