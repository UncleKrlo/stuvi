import React from 'react';
import { FormattedMessage } from '../../../util/reactIntl';
import css from './ProfileSettingsForm.module.css';

const ConfirmationModal = ({ onConfirm, onCancel }) => (
  <div className={css.modalOverlay}>
    <div className={css.modalContent}>
      <p>
        <FormattedMessage id="ProfileSettingsForm.confirmRemoveImage" />
      </p>
      <div className={css.modalButtons}>
        <button onClick={onConfirm} className={css.confirmButton}>
          <FormattedMessage id="ProfileSettingsForm.yes" />
        </button>
        <button onClick={onCancel} className={css.cancelButton}>
          <FormattedMessage id="ProfileSettingsForm.no" />
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmationModal;