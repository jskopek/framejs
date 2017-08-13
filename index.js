// example server
const path = require('path');
const imageServer = require('./imageServer');
const express = require('express');
const app = express();

app.use('/uncached/', imageServer.uncachedServer({
    sourcePath: path.join(__dirname, 'images'),
}));

app.use('/cached/', imageServer.cachedServer({
    sourcePath: path.join(__dirname, 'images'),
    cachedPath: path.join(__dirname, 'cache'),
}));



app.listen(3000, function() {
    console.log('Example app listening on port 3000');
});
