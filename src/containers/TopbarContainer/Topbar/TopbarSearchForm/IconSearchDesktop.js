import React from 'react';

import css from './TopbarSearchForm.module.css';

const IconSearchDesktop = ({ style, color, width, height }) => (
  <svg
    className={css.iconSvg}
    style={{ ...style }}
    width={width ? width : "21"}
    height={height ? height : "22"}
    viewBox="0 0 21 22"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      className={css.iconSvgGroup}
      transform="matrix(-1 0 0 1 20 1)"
      strokeWidth="2"
      fill="none"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ stroke: color }}
    >
      <path d="M13 14l5.241 5.241" />
      <circle cx="7.5" cy="7.5" r="7.5" />
    </g>
  </svg>
);

export default IconSearchDesktop;
