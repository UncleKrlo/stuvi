import React, { useState } from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import css from './ProfileImageGallery.module.css';

export const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const openGallery = (image) => {
    setSelectedImage(image);
  };

  const closeGallery = () => {
    setSelectedImage(null);
  };

  return (
    <div className={css.galleryContainer}>
      {images.map((image, index) => (
        <div
          key={index}
          className={css.galleryImageWrapper}
          onClick={() => openGallery(image)}
        >
          <img
            src={image.imageUrl}
            alt={`Profile ${index + 1}`}
            className={css.galleryImage}
          />
        </div>
      ))}
      {selectedImage && (
        <div className={css.galleryOverlay} onClick={closeGallery}>
          <div className={css.galleryModal}>
            <img
              src={selectedImage.imageUrl}
              alt="Selected profile"
              className={css.galleryModalImage}
            />
            <button className={css.galleryCloseButton} onClick={closeGallery}>
              <FormattedMessage id="ProfilePage.closeGallery" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};