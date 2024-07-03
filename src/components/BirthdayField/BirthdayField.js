import React, { useState } from 'react';
import css from './BirthdayField.module.css';

const BirthdayField = ({ input, meta, intl, formId }) => {
  const [date, setDate] = useState(input.value || '');

  const handleChange = e => {
    const newDate = e.target.value;
    setDate(newDate);
    input.onChange(newDate);
  };

  return (
    <div className={css.birthdayField}>
      <label htmlFor={formId ? `${formId}.birthday` : 'birthday'}>
        {intl.formatMessage({ id: 'SignupForm.birthdayLabel' })}
      </label>
      <input
        type="date"
        id={formId ? `${formId}.birthday` : 'birthday'}
        value={date}
        onChange={handleChange}
        max={new Date().toISOString().split('T')[0]} // Establece la fecha máxima como hoy
      />
      {meta.error && meta.touched && <span className={css.error}>{meta.error}</span>}
    </div>
  );
};

export default BirthdayField;
