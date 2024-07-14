import React from 'react';
import { func, node, object, shape, string } from 'prop-types';
import classNames from 'classnames';

import Field, { hasDataInFields } from '../../Field';
import BlockContainer from '../BlockContainer';

import css from './BlockDefault.module.css';

const FieldMedia = props => {
  const { className, media, sizes, options } = props;
  const hasMediaField = hasDataInFields([media], options);
  return hasMediaField ? (
    <div className={classNames(className, css.media)}>
      <Field data={media} sizes={sizes} options={options} />
    </div>
  ) : null;
};

const BlockDefault = props => {
  const {
    blockId,
    className,
    rootClassName,
    mediaClassName,
    textClassName,
    ctaButtonClass,
    title,
    text,
    callToAction,
    media,
    responsiveImageSizes,
    options,
  } = props;
  console.log(options);
  const classes = classNames(rootClassName || css.root, className);
  const hasTextComponentFields = hasDataInFields([title, text, callToAction], options);
  const isCardElement = blockId && blockId.includes('studiosbytype');
  const isArtistSection = title.content == 'Stuvi for Artists';
  const isStudioSection = title.content == 'Stuvi for Studios';
  const handleCardClick = href => {
    if (href) {
      window.location.href = href;
    }
  };

  return (
    <BlockContainer id={blockId} className={classes}>
      {isCardElement ? (
        <div
          className={classNames(css.card, mediaClassName)}
          onClick={() => handleCardClick(callToAction?.href)}
        >
          <FieldMedia media={media} sizes={responsiveImageSizes} options={options} />
          <div className={classNames(textClassName, css.cardText)}>
            <Field data={title} options={options} />
            <Field data={text} options={options} />
          </div>
        </div>
      ) : (
        <>
          {isStudioSection ? (
            <video
              src={'https://stuviassets.s3.amazonaws.com/gif-for-studios.mp4'}
              autoPlay
              loop
              muted
              playsInline
              className={mediaClassName}
              width={400}
              height={400}
            >
              Tu navegador no soporta el elemento de video.
            </video>
          ) : isArtistSection ? (
            <video
              src={'https://stuviassets.s3.amazonaws.com/gif-for-artists.mp4'}
              autoPlay
              loop
              muted
              playsInline
              className={mediaClassName}
              width={400}
              height={400}
            >
              Tu navegador no soporta el elemento de video.
            </video>
          ) : (
            <FieldMedia
              media={media}
              sizes={responsiveImageSizes}
              className={mediaClassName}
              options={options}
            />
          )}
          {hasTextComponentFields && (
            <div
              className={classNames(
                textClassName,
                css.text,
                { [css.artistSectionText]: isArtistSection } // Añade esta línea
              )}
            >
              {isStudioSection || isArtistSection ? (
                <h2>{title.content}</h2>
              ) : (
                <Field data={title} options={options} />
              )}
              <Field data={text} options={options} />
              {isStudioSection ? (
                <Field
                  data={callToAction}
                  className={css.ctaButtonOutlinedGreen}
                  options={options}
                />
              ) : isArtistSection ? (
                <Field data={callToAction} className={css.ctaButtonOutlined} options={options} />
              ) : (
                <Field data={callToAction} className={ctaButtonClass} options={options} />
              )}
            </div>
          )}
        </>
      )}
    </BlockContainer>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

BlockDefault.defaultProps = {
  className: null,
  rootClassName: null,
  mediaClassName: null,
  textClassName: null,
  ctaButtonClass: null,
  title: null,
  text: null,
  callToAction: null,
  media: null,
  responsiveImageSizes: null,
  options: null,
};

BlockDefault.propTypes = {
  blockId: string.isRequired,
  className: string,
  rootClassName: string,
  mediaClassName: string,
  textClassName: string,
  ctaButtonClass: string,
  title: object,
  text: object,
  callToAction: object,
  media: object,
  responsiveImageSizes: string,
  options: propTypeOption,
};

export default BlockDefault;
