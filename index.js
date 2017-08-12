const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

var imageServer = function(options) {
    let imageSourcePath = options.imageSourcePath;
    let imageDestPath = options.imageDestPath;

    return function(req, res, next) {
        var options = {
            'quality': parseInt(req.query['quality']) || 100,
            'width': parseInt(req.query['width']) || Jimp.AUTO,
            'height': parseInt(req.query['height']) || Jimp.AUTO
        };

        var imageName = req.path.split('/').pop(); // get the full url (e.g. /1.jpg) and pop the last component
        var imagePath = path.join(imageSourcePath, imageName);

        Jimp.read(imagePath, function(err, image) {
            if(err) throw err;
            image
                .quality(options.quality)
                .resize(options.width, options.height)
                .getBuffer(Jimp.MIME_JPEG, function(err, image) {
                    res.writeHead(200, {'Content-Type': 'image/jpg'});
                    res.end(image, 'binary');
                    next();
                });
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
