const fs = require('fs');
const path = require('path');

var imageServer = function(options) {
    let imageSourcePath = options.imageSourcePath;
    let imageDestPath = options.imageDestPath;
    console.log('new ImageServer');

    return function(req, res, next) {
        var imageName = req.url.split('/').pop(); // get the full url (e.g. /1.jpg) and pop the last component
        var imagePath = path.join(imageSourcePath, imageName);
        fs.readFile(imagePath, function(err, image) {
            res.writeHead(200, {'Content-Type': 'image/jpg'});
            res.end(image, 'binary');
            next();
        });
    }
}

// example server

const express = require('express');
const app = express();

app.use(imageServer({
    imageSourcePath: path.join(__dirname, 'images'),
    imageDestPath: path.join(__dirname, 'dest')
}));


app.listen(3000, function() {
    console.log('Example app listening on port 3000');
});
