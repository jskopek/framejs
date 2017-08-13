const path = require('path');
const Jimp = require('jimp');
//const fs = require('fs');


class StorageHandlerNoStorage {
    constructor(serverOptions) {
    }
    getCached(imagePath, imageParams, callback) {
        callback(undefined);
    }
    getUncached(imagePath, callback) {
        Jimp.read(imagePath, function(err, image) {
            if(!image) { callback(false); }
            if(err) throw err;
            callback(image);
        });
    }
    storeCached(image, callback) {
        callback(image);
    }
}

//var storageHandlerNoStorage = function(options, imageParams, image, callback) {
//    callback(image); 
//};
//
//var storageHandlerStorage = function(options, imageParams, image, callback) {
//    console.log('storing at', options.imageDestPath, imageParams);
//    callback(image);
//};

var server = function(serverOptions) {
    let imageSourcePath = serverOptions.imageSourcePath;
    let imageDestPath = serverOptions.imageDestPath;

    let storageHandlerClass = serverOptions.storageHandler || StorageHandlerNoStorage;
    let storageHandler = new storageHandlerClass(serverOptions);

    return function(req, res, next) {
        var imageParams = {
            'quality': parseInt(req.query['quality']) || 100,
            'width': parseInt(req.query['width']) || Jimp.AUTO,
            'height': parseInt(req.query['height']) || Jimp.AUTO,
        };

        var imageName = req.path.split('/').pop(); // get the full url (e.g. /1.jpg) and pop the last component
        var imagePath = path.join(imageSourcePath, imageName);

        storageHandler.getCached(imagePath, imageParams, function(image) {
            if(image) {
                res.writeHead(200, {'Content-Type': 'image/jpg'});
                res.end(image, 'binary');
                next();
            } else {
                storageHandler.getUncached(imagePath, function(image) {
                    if(!image) {
                        res.sendStatus();
                        return next();
                    } else {
                        image
                        .quality(imageParams.quality)
                        .resize(imageParams.width, imageParams.height)
                        .getBuffer(Jimp.MIME_JPEG, function(err, image) {
                            storageHandler.storeCached(image, function(image) {
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
    StorageHandlerNoStorage: StorageHandlerNoStorage,
    //storageHandlerStorage: storageHandlerStorage,
    server: server
};
