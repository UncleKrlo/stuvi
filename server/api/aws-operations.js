const AWS = require('aws-sdk');

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
};

console.log('AWS Config:', {
  ...awsConfig,
  secretAccessKey: '***' // No mostrar la clave secreta en logs
});

AWS.config.update(awsConfig);
const s3 = new AWS.S3();

module.exports = async (req, res) => {
  try {
    console.log('AWS operation request:', {
      method: req.method,
      body: req.body
    });

    // Para subidas (POST)
    if (req.method === 'POST') {
      const fileName = `${Date.now()}-${req.body.filename}`;
      const params = {
        Bucket: 'profilegallery',
        Key: fileName,
        ContentType: req.body.contentType,
        ACL: 'public-read',
        Expires: 3600,
      };

      const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
      const finalUrl = `https://profilegallery.s3.amazonaws.com/${fileName}`;

      return res.json({ 
        presignedUrl,
        finalUrl 
      });
    }
    
    if (req.method === 'DELETE') {
      if (!req.body || !req.body.imageUrl) {
        return res.status(400).json({ error: 'imageUrl is required in request body' });
      }

      const urlParts = req.body.imageUrl.split('/');
      const key = urlParts[urlParts.length - 1];
      
      await s3.deleteObject({
        Bucket: 'profilegallery',
        Key: key,
      }).promise();
      
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 