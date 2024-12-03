import React, { useState } from 'react';
import css from './SubscriptionCard.module.css';

const SubscriptionCard = () => {
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = -(x - centerX) / 25;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  };

  return (
    <div 
      className={css.card}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform }}
    >
      <div className={css.cardHeader}>
        <div className={css.pricing}>
          <span className={css.price}>$35</span>
          <span className={css.period}>/month</span>
        </div>
      </div>
      
      <div className={css.cardContent}>
        <div className={css.benefitsSection}>
          {/* <h3 className={css.sectionTitle}>Subscription Benefits:</h3> */}
          <ul className={css.benefitsList}>
            <li className={css.benefitItem}>
              <span className={css.icon}>🕐</span>
              <span>
                <span className={css.underlinedText}>
                  1 free hour per booking
                  <span className={css.tooltip2}>
                    Valid for the first 3 bookings per month, when booking 2 or more hours
                  </span>
                </span>
              </span>
            </li>
            <li className={css.benefitItem}>
              <span className={css.icon}>👥</span>
              <span className={css.underlinedText}>
                Hyper-access to Stuvi's Community
                <span className={css.tooltip}>
                  • Discord Access
                  <br />
                  • Exclusive live events
                  <br />
                  • Stuvi's Playlists
                </span>
              </span>
            </li>
            <li className={css.benefitItem}>
              <span className={css.icon}>📅</span>
              <span className={css.underlinedText}>
                Early Access to Flash Sales
                <span className={css.tooltip2}>
                    Priority access to monthly flash sales
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className={css.cardFooter}>
        <button className={css.subscribeButton}>Subscribe Now</button>
      </div>
    </div>
  );
};

export default SubscriptionCard; 