import React, { useState, useEffect, useRef } from 'react';
import css from './BirthdayField.module.css';

const BirthdayField = ({ input, meta, intl, formId }) => {
  const { touched, error } = meta;
  const showError = touched && error;
  const inputRef = useRef(null);

  const [displayValue, setDisplayValue] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  };

  const parseDateForInput = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';
    
    let [month, day, year] = parts.map(part => part.replace(/\D/g, ''));
    
    month = month.slice(0, 2).padStart(2, '0');
    day = day.slice(0, 2).padStart(2, '0');
    year = year.slice(0, 4).padStart(4, '0');
    
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
      return '';
    }

    // Check if the date is not in the future
    const inputDate = new Date(year, monthNum - 1, dayNum);
    const currentDate = new Date();
    if (inputDate > currentDate) {
      return '';
    }

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    setDisplayValue(formatDateForDisplay(input.value));
  }, [input.value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    if (e.target.type === 'date') {
      const parsedDate = parseDateForInput(formatDateForDisplay(newValue));
      if (parsedDate) {
        input.onChange(parsedDate);
      } else {
        input.onChange('');
        setDisplayValue('');
      }
    } else {
      setDisplayValue(newValue);
      const parsedDate = parseDateForInput(newValue);
      if (parsedDate) {
        input.onChange(parsedDate);
      } else {
        input.onChange('');
      }
    }
  };

  const handleFocus = () => {
    setIsDatePickerOpen(true);
    if (inputRef.current) {
      inputRef.current.type = 'date';
      inputRef.current.value = input.value || '';
    }
  };

  const handleBlur = (e) => {
    setIsDatePickerOpen(false);
    if (inputRef.current) {
      inputRef.current.type = 'text';
      const formattedDate = formatDateForDisplay(input.value);
      setDisplayValue(formattedDate);
    }
    input.onBlur(e);
  };

  // Get the current date in YYYY-MM-DD format for the max attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={css.birthdayField}>
      <label htmlFor={formId ? `${formId}.birthday` : 'birthday'}>
        {intl.formatMessage({ id: 'SignupForm.birthdayLabel' })}
      </label>
      <div className={css.inputWrapper}>
        <input
          {...input}
          ref={inputRef}
          type={isDatePickerOpen ? "date" : "text"}
          id={formId ? `${formId}.birthday` : 'birthday'}
          className={`${css.dateInput} ${showError ? css.error : ''}`}
          placeholder="mm/dd/yyyy"
          value={isDatePickerOpen ? input.value : displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          max={today} // This prevents selecting future dates in the date picker
        />
      </div>
      {showError && <span className={css.errorMessage}>{error}</span>}
    </div>
  );
};

export default BirthdayField;
