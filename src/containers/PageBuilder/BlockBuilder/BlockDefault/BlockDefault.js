import React, { useEffect, useState } from 'react';
import { func, node, object, shape, string } from 'prop-types';
import classNames from 'classnames';

import Field, { hasDataInFields } from '../../Field';
import BlockContainer from '../BlockContainer';

import css from './BlockDefault.module.css';
import { Link } from 'react-router-dom';


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
  const classes = classNames(rootClassName || css.root, className);
  const hasTextComponentFields = hasDataInFields([title, text, callToAction], options);
  const isCardElement = blockId && blockId.includes('studiosbytype');

  const isArtistSection = title?.content === 'Stuvi for Artists';
  const isStudioSection = title?.content === 'Stuvi for Studios';
  const isLandingSection = title?.content === 'MUSIC STUDIOS THAT FIT YOUR VISION';
  const isJoinSection = blockId && blockId.includes('joinus');

  const [isOldSafari, setIsOldSafari] = useState(false);

  useEffect(() => {
    function getSafariVersion() {
      var ua = navigator.userAgent.toLowerCase();
      if (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1) {
        var versionMatch = ua.match(/version\/([\d.]+)/);
        if (versionMatch) {
          return parseFloat(versionMatch[1]);
        }
      }
      return false;
    }

    const safariVersion = getSafariVersion();
    if (safariVersion && safariVersion < 17.3) {
      setIsOldSafari(true);
    }
  }, []);

  const handleCardClick = href => {
    if (href && typeof href === 'string') {

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
              className={css.video}
            >
              Your browser does not support this video.
            </video>
          ) : isArtistSection ? (
            <video
              src={'https://stuviassets.s3.amazonaws.com/gif-for-artists.mp4'}
              autoPlay
              loop
              muted
              playsInline
              className={css.video}
            >
              Your browser does not support this video.
            </video>
          ) : isLandingSection ? (
            <video
              src={'https://stuviassets.s3.amazonaws.com/Hush+Maeve+Jules+Blondie.mp4'}
              autoPlay
              loop
              muted
              playsInline
              className={css.video}
            >
              Your browser does not support this video.
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
              className={classNames(textClassName, css.text, {
                [css.artistSectionText]: isArtistSection,
              })}

            >
              {isStudioSection || isArtistSection ? (
                <h2>{title.content}</h2>
              ) : isLandingSection ? (
                <h1 className={css.titleLanding}>{title.content}</h1>
              ) : isJoinSection ? (
                <h1 className={css.titleJoin}>{title.content}</h1>
              ) : (
                <Field data={title} options={options} />
              )}
              {isJoinSection ? (
                <>
                  <Field data={text} options={options} />
                  <h3 className={css.stuviLinkJoin}>stuvi.space</h3>
                </>
              ) : (
                <Field data={text} options={options} />
              )}

              {isStudioSection ? (
                <Field
                  data={callToAction}
                  className={css.ctaButtonOutlinedGreen}
                  options={options}
                />
              ) : isArtistSection ? (
                <Field data={callToAction} className={css.ctaButtonOutlined} options={options} />
              ) 
              : (isLandingSection || isJoinSection) && !isOldSafari ? (
                <div
                  className={
                    isJoinSection
                      ? css.animatedButtonContainerCentered
                      : css.animatedButtonContainer
                  }
                >
                  <div className={css.nav_cta_wrap_dark}>
                    <img
                      src="https://stuviassets.s3.amazonaws.com/background-button-animation.gif"
                      className={css.animation_dark}
                    />
                    <Link to={callToAction.href} className={css.cta_jag_blue}>
                      {callToAction.content}
                    </Link>
                  </div>
                </div>
              ) 
              : (
                <div className={
                  isJoinSection
                    ? css.animatedButtonContainerCentered
                    : null
                } >
                <Field data={callToAction} className={ctaButtonClass} options={options} />
                </div>
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
