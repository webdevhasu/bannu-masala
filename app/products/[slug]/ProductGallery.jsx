'use client';
import { useState } from 'react';
import styles from './page.module.css';

export default function ProductGallery({ images, altText }) {
  const [activeImg, setActiveImg] = useState(images[0] || '/logo.png');
  const [isZoomed, setIsZoomed] = useState(false);
  const [bgPosition, setBgPosition] = useState('50% 50%');

  const handleMouseMove = (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return; // Skip for touch
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBgPosition(`${x}% ${y}%`);
  };

  const handleMouseEnter = () => {
    if (window.matchMedia('(pointer: coarse)').matches) return; // Skip for touch
    setIsZoomed(true);
  };

  return (
    <div className={styles.gallery}>
      <div 
        className={`${styles.mainImageWrapper} ${isZoomed ? styles.zoomed : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => { setIsZoomed(false); setBgPosition('50% 50%'); }}
        onMouseMove={handleMouseMove}
      >
        <img 
          src={activeImg} 
          alt={altText} 
          className={styles.mainImage} 
          style={{ opacity: isZoomed ? 0 : 1 }}
        />
        {isZoomed && (
          <div 
            className={styles.zoomLens} 
            style={{ 
              backgroundImage: `url(${activeImg})`,
              backgroundPosition: bgPosition 
            }} 
          />
        )}
      </div>
      
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((img, idx) => (
            <button 
              key={idx}
              className={`${styles.thumbBtn} ${activeImg === img ? styles.activeThumb : ''}`}
              onClick={() => setActiveImg(img)}
            >
              <img src={img} alt={`Thumbnail ${idx+1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
