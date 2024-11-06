import { awsOperations } from '../../../util/api';

export const uploadImageToS3 = async file => {
  try {
    // Obtener URL prefirmada del servidor
    const { presignedUrl, finalUrl } = await awsOperations.getPresignedUrl({ 
      filename: file.name,
      contentType: file.type 
    });

    // Subir directamente a S3 usando la URL prefirmada
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      console.error('Error response:', await uploadResponse.text());
      throw new Error('Error uploading to S3');
    }

    // Retornar la URL final del archivo
    return finalUrl;
  } catch (error) {
    console.error('Error en la subida:', error);
    throw error;
  }
};

export const deleteImageFromS3 = async imageUrl => {
  try {
    const response = await awsOperations.deleteImage(imageUrl);
    if (!response.success) {
      throw new Error('Error deleting from S3');
    }
    return response;
  } catch (error) {
    console.error('Error en la eliminación:', error);
    throw error;
  }
};
