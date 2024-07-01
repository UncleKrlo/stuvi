import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import css from './BirthdayField.module.css'

const BirthdayField = ({ input, meta, intl, formId }) => {
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 18); // Edad mínima de 18 años

  const handleChange = (date) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      input.onChange(formattedDate);
    } else {
      input.onChange(null);
    }
  };

  return (
    <div className={css.birthdayField}>
      <label htmlFor={formId ? `${formId}.birthday` : 'birthday'}>
        {intl.formatMessage({ id: 'SignupForm.birthdayLabel' })}
      </label>
      <DatePicker
        className={css.datePicker} 
        id={formId ? `${formId}.birthday` : 'birthday'}
        selected={input.value && !isNaN(new Date(input.value).getTime()) ? new Date(input.value) : null}        onChange={handleChange}
        maxDate={minDate}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
        placeholderText={intl.formatMessage({ id: 'SignupForm.birthdayPlaceholder' })}
      />
      {meta.error && meta.touched && <span className={css.error}>{meta.error}</span>}
    </div>
  );
};

export default BirthdayField;