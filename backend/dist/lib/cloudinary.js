"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageBufferToCloudinary = uploadImageBufferToCloudinary;
exports.uploadFileBufferToCloudinary = uploadFileBufferToCloudinary;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
function uploadImageBufferToCloudinary(input) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder: input.folder,
            public_id: input.fileNameNoExt,
            resource_type: "image",
        }, (err, result) => {
            if (err || !result)
                return reject(err || new Error("cloudinary upload failed"));
            resolve({
                publicId: result.public_id,
                secureUrl: result.secure_url,
            });
        });
        stream.end(input.buffer);
    });
}
// Generic file upload for any resource type (raw files, images, etc.)
function uploadFileBufferToCloudinary(input) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder: input.folder,
            public_id: input.fileNameNoExt,
            resource_type: input.resourceType || "auto",
            ...(input.format && { format: input.format }),
        }, (err, result) => {
            if (err || !result)
                return reject(err || new Error("cloudinary upload failed"));
            resolve({
                publicId: result.public_id,
                secureUrl: result.secure_url,
            });
        });
        stream.end(input.buffer);
    });
}
