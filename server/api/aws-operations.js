const AWS = require('aws-sdk');

// Asegúrate de que estas variables estén definidas en el servidor
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

      console.log('Getting presigned URL with params:', params);

      const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
      
      // Construye la URL final que tendrá el archivo
      const finalUrl = `https://profilegallery.s3.amazonaws.com/${fileName}`;
      
      console.log('Generated URLs:', { presignedUrl, finalUrl });

      return res.json({ 
        presignedUrl,
        finalUrl 
      });
    }
    
    // Para eliminaciones (DELETE)
    if (req.method === 'DELETE') {
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
    console.error('AWS operation error:', error);
    res.status(500).json({ error: error.message });
  }
}; 