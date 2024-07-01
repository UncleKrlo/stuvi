import React from 'react';
// import DatePicker from 'react-datepicker';
// import './ReactDatePicker.module.css'
import css from './BirthdayField.module.css'

const BirthdayField = ({ input, meta, intl, formId }) => {
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 18); // Edad mínima de 18 años

  const handleChange = (date) => {
    if (date) {
      const adjustedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const formattedDate = adjustedDate.toISOString().split('T')[0];
      input.onChange(formattedDate);
    } else {
      input.onChange(null);
    }
  };
  const parseDate = (dateString) => {
    if (dateString) {
      const [year, month, day] = dateString.split('-');
      return new Date(year, month - 1, day);
    }
    return null;
  };


  return (
    <div className={css.birthdayField}>
      <label htmlFor={formId ? `${formId}.birthday` : 'birthday'}>
        {intl.formatMessage({ id: 'SignupForm.birthdayLabel' })}
      </label>
      {/* <DatePicker
        className={css.datePicker} 
        id={formId ? `${formId}.birthday` : 'birthday'}
        value={input.value ? parseDate(input.value) : null}
        onChange={handleChange}
        maxDate={minDate}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
        placeholderText={intl.formatMessage({ id: 'SignupForm.birthdayPlaceholder' })}
      /> */}
      {meta.error && meta.touched && <span className={css.error}>{meta.error}</span>}
    </div>
  );
};

export default BirthdayField;