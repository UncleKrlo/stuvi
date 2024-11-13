import { awsOperations } from '../../../util/api';

export const uploadImageToS3 = async file => {
  try {
    const { presignedUrl, finalUrl } = await awsOperations.getPresignedUrl({ 
      filename: file.name,
      contentType: file.type 
    });

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Error uploading to S3');
    }

    return finalUrl;
  } catch (error) {
    throw error;
  }
};

export const deleteImageFromS3 = async imageUrl => {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:${process.env.REACT_APP_DEV_API_SERVER_PORT || 4000}`
      : '';
    
    const response = await fetch(`${baseUrl}/api/aws-operations`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Error deleting from S3');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};
