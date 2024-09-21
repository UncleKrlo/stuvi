import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { IconSpinner, LayoutComposer } from '../../components/index.js';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer.js';
import FooterContainer from '../FooterContainer/FooterContainer.js';

import { validProps } from './Field';

import SectionBuilder from './SectionBuilder/SectionBuilder.js';
import StaticPage from './StaticPage.js';
import Accordion from '../../components/Accordion/Accordion.js';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import * as reactSpring from '@react-spring/three';
import * as drei from '@react-three/drei';
import * as fiber from '@react-three/fiber';
import { Globals } from "@react-spring/shared";

Globals.assign({
  frameLoop: "demand",
});

import css from './PageBuilder.module.css';
import IconSearchDesktop from '../../containers/TopbarContainer/Topbar/TopbarSearchForm/IconSearchDesktop.js';

const getMetadata = (meta, schemaType, fieldOptions) => {
  const { pageTitle, pageDescription, socialSharing } = meta;

  // pageTitle is used for <title> tag in addition to page schema for SEO
  const title = validProps(pageTitle, fieldOptions)?.content;
  // pageDescription is used for different <meta> tags in addition to page schema for SEO
  const description = validProps(pageDescription, fieldOptions)?.content;
  // Data used when the page is shared in social media services
  const openGraph = validProps(socialSharing, fieldOptions);
  // We add OpenGraph image as schema image if it exists.
  const schemaImage = openGraph?.images1200?.[0]?.url;
  const schemaImageMaybe = schemaImage ? { image: [schemaImage] } : {};
  const isArticle = ['Article', 'NewsArticle', 'TechArticle'].includes(schemaType);
  const schemaHeadlineMaybe = isArticle ? { headline: title } : {};

  // Schema for search engines (helps them to understand what this page is about)
  // http://schema.org (This template uses JSON-LD format)
  //
  // In addition to this schema data for search engines, src/components/Page/Page.js adds some extra schemas
  // Read more about schema:
  // - https://schema.org/
  // - https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data
  const pageSchemaForSEO = {
    '@context': 'http://schema.org',
    '@type': schemaType || 'WebPage',
    description: description,
    name: title,
    ...schemaHeadlineMaybe,
    ...schemaImageMaybe,
  };

  return {
    title,
    description,
    schema: pageSchemaForSEO,
    socialSharing: openGraph,
  };
};

const LoadingSpinner = () => {
  return (
    <div className={css.loading}>
      <IconSpinner delay={600} />
    </div>
  );
};

//////////////////
// Page Builder //
//////////////////

/**
 * PageBuilder can be used to build content pages using page-asset.json.
 *
 * Note: props can include a lot of things that depend on
 * - pageAssetsData: json asset that contains instructions how to build the page content
 *   - asset should contain an array of _sections_, which might contain _fields_ and an array of _blocks_
 *     - _blocks_ can also contain _fields_
 * - fallbackPage: component. If asset loading fails, this is used instead.
 * - options: extra mapping of 3 level of sub components
 *   - sectionComponents: { ['my-section-type']: { component: MySection } }
 *   - blockComponents: { ['my-component-type']: { component: MyBlock } }
 *   - fieldComponents: { ['my-field-type']: { component: MyField, pickValidProps: data => Number.isInteger(data.content) ? { content: data.content } : {} }
 *     - fields have this pickValidProps as an extra requirement for data validation.
 * - pageProps: props that are passed to src/components/Page/Page.js component
 *
 * @param {Object} props
 * @returns page component
 */

const FaqSectionBuilder = ({ sections, options }) => {
  const faqSections = sections.map((section, index) => {
    const faqItems = section.blocks.map(block => ({
      question: block.title.content,
      answer: block.text.content
    }));

    return (
      <div key={index}>
        <Accordion items={faqItems} title={section.title.content} description={section.description.content} />
      </div>
    );
  });

  return <>{faqSections}</>;
};

const MusicStudioFinderBuilder = ({ sections, options }) => {
  const history = useHistory();

  const musicStudioFinderSections = sections.map((section, index) => {
    const description = section.description.content;

    const parseOptions = (text, prefix) => {
      const regex = new RegExp(`-${prefix}{([^}]*)}`, 'i');
      const match = text.match(regex);
      return match ? match[1].split(',').map(option => option.trim()) : [];
    };

    const typeOptions = ['Recording', 'Production', 'Rehearsal', 'Mixing', 'Mastering'];
    const areaOptions = ['Miami', 'Boston'];
    const priceOptions = ['$0-$30', '$31-$70', '$70+'];
    const gearOptions = ['Microphone', 'Acoustic Piano', 'Synthesizer', 'Electric Piano', 'Electric Guitar', 'Acoustic Guitar', 'Drumset', 'Electric Bass', 'Modular Synth'];

    const [studioType, setStudioType] = useState(typeOptions[0]);
    const [location, setLocation] = useState(areaOptions[0]);
    const [cost, setCost] = useState(priceOptions[0]);
    const [equipment, setEquipment] = useState(gearOptions[0]);

    const handleSubmit = (e) => {
      e.preventDefault();
      
      let bounds = '';
      if (location === 'Miami') {
        bounds = '26.75684164%2C-79.45406184%2C25.02483706%2C-81.01137385';
      } else if (location === 'Boston') {
        bounds = '43.05478412%2C-70.46798743%2C41.63591498%2C-71.90170325';
      }

      let studioTypeParam = '';
      if (studioType === 'Recording') {
        studioTypeParam = 'pub_StudioType=has_all%3ARecording';
      } else if (studioType === 'Production') {
        studioTypeParam = 'pub_StudioType=has_all%3AProduction';
      } else if (studioType === 'Rehearsal') {
        studioTypeParam = 'pub_StudioType=has_all%3ARehearsal';
      } else if (studioType === 'Mixing') {
        studioTypeParam = 'pub_StudioType=has_all%3AMixing_Mastering';
      } else if (studioType === 'Mastering') {
        studioTypeParam = 'pub_StudioType=has_all%3AMixing_Mastering';
      }

      let priceParam = '';
      if (cost === '$0-$30') {
        priceParam = 'price=0%2C30';
      } else if (cost === '$31-$70') {
        priceParam = 'price=31%2C70';
      } else if (cost === '$70+') {
        priceParam = 'price=70%2C305';
      }

      let equipmentParam = '';
      if (equipment === 'Microphone') {
        equipmentParam = 'pub_Mics=has_all%3ASHURE';
      } else {
        equipmentParam = `pub_Instruments=has_all%3A${equipment.replace(' ', '_')}`;
      }

      const searchUrl = `/s?bounds=${bounds}&${priceParam}&${equipmentParam}&${studioTypeParam}&mapSearch=true`;
      
      history.push(searchUrl);
    };

    const descriptionStyle = {
      fontSize: '1.2rem',
      color: '#F5F5F5',
      marginBottom: '2.2rem',
      textAlign: 'center',
    };

    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      color: '#F5F5F5',
    };

    const titleStyle = {
      fontSize: '4.5rem',
      color: '#F5F5F5',
      fontWeight: 'bold',
      marginTop: '3rem',
      marginBottom: '1.4rem',
      textAlign: 'center',
    };

    const formStyle = {
      display: 'flex',
      flexWrap: 'wrap',   
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.1rem',
      textAlign: 'center',
      maxWidth: '600px',  
      marginBottom: '1.4rem',
    };

    const selectStyle = {
      fontWeight: 'bold',
      color: '#F5F5F5',
      background: 'transparent',
      border: 'none',
      fontSize: '1.1rem',
      borderBottom: '2px solid #F5F5F5',
      cursor: 'pointer',
      padding: '0.2rem',
      margin: '0.35rem 0.5rem',
      textAlign: 'center',
      width: '130px',
      appearance: 'none',
    };

    const [isHovered, setIsHovered] = useState(false);
    const buttonStyle = {
      backgroundColor: isHovered ? '#F5F5F5' : 'var(--marketplaceColor)',
      fontWeight: 700,
      display: 'inline-block',
      padding: '15px 50px',
      borderRadius: 10,
      textDecoration: 'none',
      color: isHovered ? 'var(--marketplaceColor)' : 'white',
      border: '2px white solid',
      textAlign: 'center',
      boxSizing: 'border-box',
      zIndex: 2,
      position: 'relative',
      marginTop: '2rem',
      marginBottom: '2rem',
      fontSize: '1.1rem',
    };

    const responsiveStyle = `
      @media (max-width: 425px) {
        .studio-finder-form {
          flex-direction: column;
        }
      }
      @media (max-width: 580px) {
        .responsive-text {
          margin-top: 2.2rem !important;
          font-size: 3.5rem !important;
        }
        .description-text {
          width: 300px;
        }
      }
      @media (max-width: 457px) {
        .responsive-text {
          font-size: 3rem !important;
        }
      }
      @media (max-width: 396px) {
        .responsive-text {
          font-size: 2.6rem !important;
        }
      }
      @media (max-width: 347px) {
        .responsive-text {
          font-size: 2.3rem !important;
        }
      }
    `;

    return (
      <div style={containerStyle}>
        <style>{responsiveStyle}</style>
        <h1 className="responsive-text" style={titleStyle}>Music Studio Finder</h1>
        <p className="description-text" style={descriptionStyle}>Because we all know how hard it is to find a good studio these days.</p>
        <form onSubmit={handleSubmit} className="studio-finder-form" style={formStyle}>
          <span>I'm looking for a</span>
          <select
            value={studioType}
            onChange={(e) => setStudioType(e.target.value)}
            style={selectStyle}
          >
            {typeOptions.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>

          <span>music studio around</span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={selectStyle}
          >
            {areaOptions.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>

          <span>that costs</span>
          <select
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            style={selectStyle}
          >
            {priceOptions.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>

          <span>per hour and has a</span>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            style={selectStyle}
          >
            {gearOptions.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        </form>
        <button onClick={handleSubmit} style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}>
          Find Studio  
          <IconSearchDesktop style={{ marginLeft: '0.4rem', marginBottom: '0.05rem' }} color={isHovered ? 'var(--marketplaceColor)' : 'white'} width="18" height="18" />
        </button>
      </div>
    );
  });

  return <>{musicStudioFinderSections}</>;
};

const PageBuilder = props => {
  const {
    pageAssetsData,
    inProgress,
    error,
    fallbackPage,
    schemaType,
    options,
    currentPage,
    ...pageProps
  } = props;

  if (!pageAssetsData && fallbackPage && !inProgress && error) {
    return fallbackPage;
  }

  // Page asset contains UI info and metadata related to it.
  // - "sections" (data that goes inside <body>)
  // - "meta" (which is data that goes inside <head>)
  const { sections = [], meta = {} } = pageAssetsData || {};
  const pageMetaProps = getMetadata(meta, schemaType, options?.fieldComponents);

  const isFaqPage = pageAssetsData?.sections?.some(section =>
    section.sectionName && section.sectionName.includes('FAQ')
  );

  const isMusicStudioFinderPage = pageAssetsData?.sections?.some(section =>
    section.sectionName && section.sectionName.includes('Music Studio Finder')
  );

  const layoutAreas = `
    topbar
    main
    footer
  `;
  return (
    <StaticPage {...pageMetaProps} {...pageProps}>
      <LayoutComposer areas={layoutAreas} className={css.layout}>
        {props => {
          const { Topbar, Main, Footer } = props;
          return (
            <>
              <Topbar as="header" className={css.topbar}>
                <TopbarContainer currentPage={currentPage} />
              </Topbar>
              <Main as="main" className={css.main}>
                {sections.length === 0 && inProgress ? (
                  <LoadingSpinner />
                ) : isFaqPage ? (
                  <>
                    <FaqSectionBuilder sections={sections} options={options} />
                    {/* <ShaderGradientCanvas
                  importedFiber={{ ...fiber, ...drei, ...reactSpring }}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                  }}
                >
                  <ShaderGradient
                    type="waterPlane"
                    color1={['#1345CA']}
                    color2={['#ABCAEE']}
                    color3={['#2A623D']}
                    animate="on"
                    brightness={2.5}
                    cAzimuthAngle={180}
                    cDistance={5}
                    cPolarAngle={105}
                    cameraZoom={10}
                    lightType="3d"
                    grain="on"
                    positionX={0}
                    positionY={2}
                    positionZ={1}
                    reflection={1}
                    rotationX={40}
                    rotationY={0}
                    rotationZ={-50}
                    uDensity={5.5}
                    uFrequency={0}
                      uSpeed={0.1}
                      uStrength={1.5}
                      uTime={8}
                      />
                    </ShaderGradientCanvas> */}
                  </>
                ) : isMusicStudioFinderPage ? (
                  <>
                    <MusicStudioFinderBuilder sections={sections} options={options} />
                    <ShaderGradientCanvas
                      importedFiber={{...reactSpring, ...fiber}}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1,
                      }}
                    >
                      <ShaderGradient
                        type="waterPlane"
                        color1={['#1345CA']}
                        color2={['#ABCAEE']}
                        color3={['#2A623D']}
                        animate="on"
                        brightness={2.5}
                        cAzimuthAngle={180}
                        cDistance={2}
                        cPolarAngle={105}
                        cameraZoom={9}
                        lightType="3d"
                        grain="on"
                        positionX={0}
                        positionY={1.5}
                        positionZ={1}
                        reflection={1}
                        rotationX={40}
                        rotationY={0}
                        rotationZ={-50}
                        uDensity={2.5}
                        uFrequency={0}
                        uSpeed={0.1}
                        uStrength={1.1}
                        uTime={2}
                      />
                    </ShaderGradientCanvas>
                  </>
                ) : (
                  <SectionBuilder sections={sections} options={options} />
                )}
              </Main>
              <Footer>
                <FooterContainer />
              </Footer>
            </>
          );
        }}
      </LayoutComposer>
    </StaticPage>
  );
};

export { LayoutComposer, StaticPage, SectionBuilder };

export default PageBuilder;
