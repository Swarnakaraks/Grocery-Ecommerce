import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder
            },
            (error, result) => {
                if(error){
                    return reject(error);
                }

                resolve(result);
            }
        );

        uploadStream.end(buffer);

    })
}

export const deleteFromCloudinary = async (publicId) => {
    return await cloudinary.uploader.destroy(publicId);
};