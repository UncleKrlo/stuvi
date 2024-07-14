import React, { useState } from 'react';
import css from './Accordion.module.css';

const Accordion = ({ items, title, description }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={css.accordionContainer}>
      <h2 className={css.accordionTitle}>{title}</h2>
      <p className={css.accordionDescription}>{description}</p>
      {items.map((item, index) => (
        <div key={index} className={css.accordionItem}>
          <button
            className={`${css.accordionButton} ${activeIndex === index ? css.active : ''}`}
            onClick={() => toggleAccordion(index)}
          >
            {item.question}
            <span className={`${css.accordionIcon} ${activeIndex === index ? css.open : ''}`}>
              {activeIndex === index ? '−' : '+'}
            </span>
          </button>
          {activeIndex === index && (
            <div className={css.accordionContent}>{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;