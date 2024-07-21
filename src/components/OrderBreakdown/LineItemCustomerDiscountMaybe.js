import React from 'react';
import { string } from 'prop-types';

import { FormattedMessage, intlShape } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { propTypes, LINE_ITEM_DISCOUNT_COMMISSION } from '../../util/types';

import css from './OrderBreakdown.module.css';

const LineItemCustomerDiscountMaybe = props => {
  const { lineItems, intl } = props;

  const discount = lineItems.find(
    item => item.code === LINE_ITEM_DISCOUNT_COMMISSION
  );

  return discount ? (
    <div className={css.lineItem}>
      <span className={css.itemLabel}>
        <FormattedMessage id="OrderBreakdown.discount" values={{ discountPercentage: 10 }} />
      </span>
      <span className={css.itemValue}>{formatMoney(intl, discount.lineTotal)}</span>
    </div>
  ) : null;
};

LineItemCustomerDiscountMaybe.propTypes = {
  lineItems: propTypes.lineItems.isRequired,
  intl: intlShape.isRequired,
};

export default LineItemCustomerDiscountMaybe;
