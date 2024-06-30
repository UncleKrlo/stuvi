import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configura AWS S3
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SH_ACCESS_KEY,
  region: 'us-east-1',
});

const s3 = new AWS.S3();

export const uploadImageToS3 = async file => {
  const params = {
    Bucket: 'profilegallery',
    Key: `${Date.now()}-${file.name}`,
    Body: file,
    ACL: 'public-read',
    ContentType: file.type,
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data.Location);
    });
  });
};
// export const uploadImageToS3 = async (file) => {
//   const fileExtension = file.name.split('.').pop();
//   const fileName = `${uuidv4()}.${fileExtension}`;
//   const params = {
//     Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
//     Key: fileName,
//     Body: file
//   };
//   console.log('Uploading with params:', params);
//   try {
//     const data = await s3.upload(params).promise();
//     return data.Location;
//   } catch (error) {
//     console.error('Error uploading image:', error);
//     throw error;
//   }
// };
export const deleteImageFromS3 = async imageUrl => {
  const urlParts = imageUrl.split('/');
  const key = urlParts[urlParts.length - 1];

  const params = {
    Bucket: 'profilegallery',
    Key: key,
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};
