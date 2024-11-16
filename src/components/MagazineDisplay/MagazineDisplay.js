import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useHistory } from 'react-router-dom';
import css from './MagazineDisplay.module.css';
import { openDB } from 'idb';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Cache key para el PDF
const CACHE_KEY = 'magazine-pdf-cache';
const PDF_URL = "https://stuviassets.s3.us-east-1.amazonaws.com/Stuvi+Magazine+Digital.pdf";

const STORAGE_KEY = 'magazine-current-page';
const SCALE_STORAGE_KEY = 'magazine-scale';

const DB_NAME = 'magazine-cache';
const STORE_NAME = 'pdf-store';

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
};

export const DEFAULT_PDF_URL = "https://stuviassets.s3.us-east-1.amazonaws.com/Stuvi+Magazine+Digital.pdf";
export const DEFAULT_CACHE_KEY = 'magazine-pdf-cache';

const getStoredPage = () => {
  if (typeof window !== 'undefined') {
    return parseInt(localStorage.getItem(STORAGE_KEY)) || 1;
  }
  return 1;
};

const getStoredScale = () => {
  if (typeof window !== 'undefined') {
    const storedScale = localStorage.getItem(SCALE_STORAGE_KEY);
    if (storedScale) return parseFloat(storedScale);
    return window.innerWidth <= 768 ? 0.5 : 0.7;
  }
  return 0.7;
};

const MagazineDisplay = ({ pdfUrl = DEFAULT_PDF_URL, cacheKey = DEFAULT_CACHE_KEY }) => {
  const history = useHistory();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(getStoredPage);
  const [scale, setScale] = useState(getStoredScale);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  const [isReallyLoaded, setIsReallyLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pdfSource, setPdfSource] = useState(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        // Intentar obtener del cache primero
        const cache = await caches.open(cacheKey);
        const cachedResponse = await cache.match(pdfUrl);
        
        if (cachedResponse) {
          // Si está en cache, usar el blob del cache
          const blob = await cachedResponse.blob();
          setPdfSource(blob);
          setIsReallyLoaded(true);
          setLoadingProgress(100);
          setIsLoading(false);
        } else {
          // Si no está en cache, usar la URL directa
          setPdfSource(pdfUrl);
        }
      } catch (error) {
        console.warn('Cache error, falling back to direct URL:', error);
        setPdfSource(pdfUrl);
      }
    };

    loadPdf();
  }, [pdfUrl, cacheKey]);

  useEffect(() => {
    // Simular progreso de carga solo si aún no está realmente cargado
    if (!isReallyLoaded) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) { // Solo llegamos al 95% hasta que realmente cargue
            clearInterval(interval);
            return 95;
          }
          return prev + 1;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isReallyLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, pageNumber.toString());
    }
  }, [pageNumber]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SCALE_STORAGE_KEY, scale.toString());
    }
  }, [scale]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setIsReallyLoaded(true);
    setLoadingProgress(100);
    setIsInitialLoad(false);
    
    // Solo guardar en cache si es la primera carga
    if (isInitialLoad) {
      fetch(pdfUrl)
        .then(response => response.blob())
        .then(async blob => {
          try {
            const db = await initDB();
            await db.put(STORE_NAME, blob, pdfUrl);
          } catch (error) {
            console.warn('Failed to cache PDF:', error);
          }
        });
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }

  function onDocumentLoadError(err) {
    console.error('Error loading PDF:', err);
    setError('Failed to load the magazine. Please try again later.');
    setIsLoading(false);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  }

  function previousPage() {
    if (isMobile) {
      changePage(-1);
    } else {
      if (pageNumber === 3) {
        setPageNumber(1);
      } else {
        changePage(-2);
      }
    }
  }

  function nextPage() {
    if (isMobile) {
      changePage(1);
    } else {
      if (pageNumber === 1) {
        setPageNumber(2);
      } else {
        changePage(2);
      }
    }
  }

  function zoomIn() {
    setScale(prevScale => {
      const newScale = Math.min(2, prevScale + 0.1);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SCALE_STORAGE_KEY, newScale.toString());
      }
      return newScale;
    });
  }

  function zoomOut() {
    setScale(prevScale => {
      const newScale = Math.max(0.3, prevScale - 0.1);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SCALE_STORAGE_KEY, newScale.toString());
      }
      return newScale;
    });
  }

  const getPageDisplay = () => {
    if (isMobile) {
      return `${pageNumber} / ${numPages}`;
    }
    if (pageNumber === 1 || pageNumber === numPages) {
      return `${pageNumber} / ${numPages}`;
    }
    return `${pageNumber}-${Math.min(pageNumber + 1, numPages)} / ${numPages}`;
  };

  const renderPages = () => {
    if (isMobile) {
      // En mobile, solo mostrar una página
      return (
        <Page 
          pageNumber={pageNumber} 
          scale={scale}
          className={css.singlePage}
          loading={<div className={css.loader}>Loading page...</div>}
        />
      );
    }

    // En desktop, mostrar solo la portada o dos páginas
    if (pageNumber === 1) {
      return (
        <Page 
          pageNumber={1} 
          scale={scale}
          className={css.singlePage}
          loading={<div className={css.loader}>Loading page...</div>}
        />
      );
    }

    return (
      <div className={css.pagesContainer}>
        <Page 
          pageNumber={pageNumber} 
          scale={scale}
          className={css.page}
          loading={<div className={css.loader}>Loading page...</div>}
        />
        {pageNumber < numPages && (
          <Page 
            pageNumber={pageNumber + 1} 
            scale={scale}
            className={css.page}
            loading={<div className={css.loader}>Loading page...</div>}
          />
        )}
      </div>
    );
  };

  const handleBack = () => {
    history.push('/p/magazines');
  };

  // Añadir opciones para el PDF
  const pdfOptions = {
    cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`
  };

  return (
    <div className={css.magazineContainer}>
      <button onClick={handleBack} className={css.backButton}>
        ← Magazines
      </button>

      {(isInitialLoad && (!isReallyLoaded || isLoading)) && (
        <div className={css.loadingOverlay}>
          <div>Loading magazine... {loadingProgress}%</div>
          <div className={css.progressBar}>
            <div 
              className={css.progressFill} 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {error ? (
        <div className={css.error}>{error}</div>
      ) : (
        <>
          <div className={css.documentWrapper}>
            <Document
              file={pdfSource}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className={css.loader}>Loading magazine...</div>}
              className={css.document}
              options={pdfOptions}
            >
              {renderPages()}
            </Document>
          </div>

          <div className={css.controls}>
            <button 
              onClick={previousPage} 
              disabled={pageNumber <= 1}
              className={css.controlButton}
            >
              ‹
            </button>
            
            <span className={css.pageInfo}>
              {getPageDisplay()}
            </span>
            
            <button 
              onClick={nextPage} 
              disabled={isMobile ? pageNumber >= numPages : pageNumber >= numPages - 1}
              className={css.controlButton}
            >
              ›
            </button>
          </div>

          {isMobile && (
            <div className={css.mobileInstructions}>
              <p>Pinch to zoom in/out</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MagazineDisplay; 