const path = require('path');
const Jimp = require('jimp');
//const fs = require('fs');


var uncachedServer = function(serverOptions) {
    let sourcePath = serverOptions.sourcePath;

    return function(req, res, next) {
        var imageParams = {
            'quality': parseInt(req.query['quality']) || 100,
            'width': parseInt(req.query['width']) || Jimp.AUTO,
            'height': parseInt(req.query['height']) || Jimp.AUTO,
        };

        var imageName = req.path.split('/').pop(); // get the full url (e.g. /1.jpg) and pop the last component
        var imagePath = path.join(sourcePath, imageName);

        Jimp.read(imagePath, function(err, image) {
            if(!image) {
                res.sendStatus(404);
                return next();
            }

            if(err) throw err;

            image
            .quality(imageParams.quality)
            .resize(imageParams.width, imageParams.height)
            .getBuffer(Jimp.MIME_JPEG, function(err, image) {
                res.writeHead(200, {'Content-Type': 'image/jpg'});
                res.end(image, 'binary');
                next();
            });
        });
    }
};

var cachedServer = function(serverOptions) {
    let sourcePath = serverOptions.sourcePath;
    let cachedPath = serverOptions.cachedPath;

    let getCached = function(imagePath, imageParams, callback) {
        console.log('getCached', imageParams);
        callback(undefined);
    }

    let getUncached = function(imagePath, callback) {
        console.log('getUncached', imagePath);
        Jimp.read(imagePath, function(err, image) {
            if(!image) { callback(false); }
            if(err) throw err;
            callback(image);
        });
    }

    let storeCached = function(image, callback) {
        console.log('storeCached');
        callback(image);
    }

    return function(req, res, next) {
        var imageParams = {
            'quality': parseInt(req.query['quality']) || 100,
            'width': parseInt(req.query['width']) || Jimp.AUTO,
            'height': parseInt(req.query['height']) || Jimp.AUTO,
        };

        var imageName = req.path.split('/').pop(); // get the full url (e.g. /1.jpg) and pop the last component
        var imagePath = path.join(sourcePath, imageName);

        getCached(imagePath, imageParams, function(image) {
            if(image) {
                res.writeHead(200, {'Content-Type': 'image/jpg'});
                res.end(image, 'binary');
                next();
            } else {
                getUncached(imagePath, function(image) {
                    if(!image) {
                        res.sendStatus();
                        return next();
                    } else {
                        image
                        .quality(imageParams.quality)
                        .resize(imageParams.width, imageParams.height)
                        .getBuffer(Jimp.MIME_JPEG, function(err, image) {
                            storeCached(image, function(image) {
                                res.writeHead(200, {'Content-Type': 'image/jpg'});
                                res.end(image, 'binary');
                                next();
                            });
                        });
                    }
                });
            }
        });
    }
};



module.exports = {
    uncachedServer: uncachedServer,
    cachedServer: cachedServer
};
