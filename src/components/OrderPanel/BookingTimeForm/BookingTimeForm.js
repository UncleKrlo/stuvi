import React, { Component } from 'react';
import { array, bool, func, number, object, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import classNames from 'classnames';

import { FormattedMessage, intlShape, injectIntl } from '../../../util/reactIntl';
import { timestampToDate } from '../../../util/dates';
import { propTypes } from '../../../util/types';
import { BOOKING_PROCESS_NAME } from '../../../transactions/transaction';

import {
  Form,
  H6,
  PrimaryButton,
  FieldCheckbox,
  FieldTextInput,
  SecondaryButton,
  Button,
} from '../../../components';
import { formatMoney } from '../../../util/currency';
import { types as sdkTypes } from '../../../util/sdkLoader';
import EstimatedCustomerBreakdownMaybe from '../EstimatedCustomerBreakdownMaybe';
import FieldDateAndTimeInput from './FieldDateAndTimeInput';

import css from './BookingTimeForm.module.css';
const { Money } = sdkTypes;

// If you made it here, you deserve these discount codes you sneaky.
const VALID_DISCOUNT_CODES = ['ELHUESO', 'STUVI10', 'STUV10', 'MAKE.MUSIC'];

export class BookingTimeFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discountCode: '',
      isCodeValid: false,
      isCodeLocked: false,
      validationMessage: '',
    };
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.verifyDiscountCode = this.verifyDiscountCode.bind(this);
    this.removeDiscount = this.removeDiscount.bind(this);
    this.handleDiscountCodeChange = this.handleDiscountCodeChange.bind(this);
  }

  handleFormSubmit(e) {
    this.props.onSubmit(e);
  }

  // When the values of the form are updated we need to fetch
  // lineItems from this template's backend for the EstimatedTransactionMaybe
  // In case you add more fields to the form, make sure you add
  // the values here to the orderData object.
  handleDiscountCodeChange(event) {
    const { value } = event.target;
    this.setState({ discountCode: value });
  }
  
  verifyDiscountCode = () => {
    const { discountCode } = this.state;
    const isValid = VALID_DISCOUNT_CODES.includes(discountCode.toUpperCase());
  
    this.setState(
      {
        isCodeValid: isValid,
        isCodeLocked: isValid,
        validationMessage: isValid
          ? this.props.intl.formatMessage({ id: 'BookingTimeForm.validDiscountCode' })
          : this.props.intl.formatMessage({ id: 'BookingTimeForm.invalidDiscountCode' }),
      },
      () => {
        if (isValid && this.formApi) {
          this.formApi.change('discountCode', discountCode);
          this.handleOnChange({
            values: { ...this.formApi.getState().values, discountCode, hasDiscountCode: true },
          });
        }
      }
    );
  };

  removeDiscount = () => {
    this.setState(
      {
        discountCode: '',
        isCodeValid: false,
        isCodeLocked: false,
        validationMessage: '',
      },
      () => {
        if (this.formApi) {
          this.formApi.change('discountCode', '');
          this.handleOnChange({
            values: {
              ...this.formApi.getState().values,
              discountCode: '',
              hasDiscountCode: false,
            },
          });
        }
      }
    );
  };

  handleOnChange(formValues) {
    const { bookingStartTime, bookingEndTime } = formValues.values;
    const startDate = bookingStartTime ? timestampToDate(bookingStartTime) : null;
    const endDate = bookingEndTime ? timestampToDate(bookingEndTime) : null;

    const listingId = this.props.listingId;
    const isOwnListing = this.props.isOwnListing;

    // Note: we expect values bookingStartTime and bookingEndTime to be strings
    // which is the default case when the value has been selected through the form
    const isStartBeforeEnd = bookingStartTime < bookingEndTime;

    const discountCode = formValues.values.discountCode;
    const hasDiscountCode = this.state.isCodeValid;

    const hasSoundEngineerFee = formValues.values?.soundEngineerFee?.length > 0;
    const hasMixingEngineerFee = formValues.values?.mixingEngineerFee?.length > 0;
    const hasComposerFee = formValues.values?.composerFee?.length > 0;
    const hasProducerFee = formValues.values?.producerFee?.length > 0;
    if (
      bookingStartTime &&
      bookingEndTime &&
      isStartBeforeEnd &&
      !this.props.fetchLineItemsInProgress
    ) {
      this.props.onFetchTransactionLineItems({
        orderData: {
          bookingStart: startDate,
          bookingEnd: endDate,
          discountCode,
          hasDiscountCode,
          hasSoundEngineerFee,
          hasMixingEngineerFee,
          hasComposerFee,
          hasProducerFee,
        },
        listingId,
        isOwnListing,
      });
    }
  }

  render() {
    const {
      rootClassName,
      className,
      price: unitPrice,
      dayCountAvailableForBooking,
      marketplaceName,
      ...rest
    } = this.props;
    const classes = classNames(rootClassName || css.root, className);

    return (
      <FinalForm
        {...rest}
        unitPrice={unitPrice}
        onSubmit={this.handleFormSubmit}
        render={fieldRenderProps => {
          const {
            endDatePlaceholder,
            startDatePlaceholder,
            formId,
            form,
            pristine,
            handleSubmit,
            intl,
            isOwnListing,
            listingId,
            values,
            monthlyTimeSlots,
            onFetchTimeSlots,
            timeZone,
            lineItems,
            fetchLineItemsInProgress,
            fetchLineItemsError,
            payoutDetailsWarning,
            soundEngineerFee,
            mixingEngineerFee,
            composerFee,
            producerFee,
          } = fieldRenderProps;

          const startTime = values && values.bookingStartTime ? values.bookingStartTime : null;
          const endTime = values && values.bookingEndTime ? values.bookingEndTime : null;
          const startDate = startTime ? timestampToDate(startTime) : null;
          const endDate = endTime ? timestampToDate(endTime) : null;
          const areDatesSelected = (startDate, endDate) => {
            return startDate && endDate;
          };
          this.formApi = form;
          // This is the place to collect breakdown estimation data. See the
          // EstimatedCustomerBreakdownMaybe component to change the calculations
          // for customized payment processes.
          const breakdownData =
            startDate && endDate
              ? {
                  startDate,
                  endDate,
                }
              : null;

          const showEstimatedBreakdown =
            breakdownData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;

          const soundEngineerLabel = soundEngineerFee
            ? intl.formatMessage(
                { id: 'BookingDatesForm.soundEngineerLabel' },
                {
                  fee: formatMoney(
                    intl,
                    new Money(soundEngineerFee.amount, soundEngineerFee.currency)
                  ),
                }
              )
            : null;

          const soundEngineerMaybe = soundEngineerFee ? (
            <FieldCheckbox
              id={`${formId}.soundEngineerFee`}
              name="soundEngineerFee"
              label={soundEngineerLabel}
              value="soundEngineerFee"
            />
          ) : null;
          const mixingEngineerLabel = mixingEngineerFee
            ? intl.formatMessage(
                { id: 'BookingDatesForm.mixingEngineerLabel' },
                {
                  fee: formatMoney(
                    intl,
                    new Money(mixingEngineerFee.amount, mixingEngineerFee.currency)
                  ),
                }
              )
            : null;

          const mixingEngineerMaybe = mixingEngineerFee ? (
            <FieldCheckbox
              id={`${formId}.mixingEngineerFee`}
              name="mixingEngineerFee"
              label={mixingEngineerLabel}
              value="mixingEngineerFee"
            />
          ) : null;
          const composerLabel = composerFee
            ? intl.formatMessage(
                { id: 'BookingDatesForm.composerLabel' },
                { fee: formatMoney(intl, new Money(composerFee.amount, composerFee.currency)) }
              )
            : null;

          const composerMaybe = composerFee ? (
            <FieldCheckbox
              id={`${formId}.composerFee`}
              name="composerFee"
              label={composerLabel}
              value="composerFee"
            />
          ) : null;
          const producerLabel = producerFee
            ? intl.formatMessage(
                { id: 'BookingDatesForm.producerLabel' },
                { fee: formatMoney(intl, new Money(producerFee.amount, producerFee.currency)) }
              )
            : null;

          const producerMaybe = producerFee ? (
            <FieldCheckbox
              id={`${formId}.producerFee`}
              name="producerFee"
              label={producerLabel}
              value="producerFee"
            />
          ) : null;
          return (
            <Form onSubmit={handleSubmit} className={classes} enforcePagePreloadFor="CheckoutPage">
              <FormSpy
                subscription={{ values: true }}
                onChange={values => {
                  this.handleOnChange(values);
                }}
              />
              {monthlyTimeSlots && timeZone ? (
                <FieldDateAndTimeInput
                  startDateInputProps={{
                    label: intl.formatMessage({ id: 'BookingTimeForm.bookingStartTitle' }),
                    placeholderText: startDatePlaceholder,
                  }}
                  endDateInputProps={{
                    label: intl.formatMessage({ id: 'BookingTimeForm.bookingEndTitle' }),
                    placeholderText: endDatePlaceholder,
                  }}
                  className={css.bookingDates}
                  listingId={listingId}
                  onFetchTimeSlots={onFetchTimeSlots}
                  monthlyTimeSlots={monthlyTimeSlots}
                  values={values}
                  intl={intl}
                  form={form}
                  pristine={pristine}
                  timeZone={timeZone}
                  dayCountAvailableForBooking={dayCountAvailableForBooking}
                />
              ) : null}
              <div className={css.feeContainer}>
                <div className={css.feeDiv}>{soundEngineerMaybe}</div>
                <div className={css.feeDiv}>{mixingEngineerMaybe}</div>
                <div className={css.feeDiv}>{composerMaybe}</div>
                <div className={css.feeDiv}>{producerMaybe}</div>
              </div>

              {showEstimatedBreakdown ? (
                <div className={css.priceBreakdownContainer}>
                  <H6 as="h3" className={css.bookingBreakdownTitle}>
                    <FormattedMessage id="BookingTimeForm.priceBreakdownTitle" />
                  </H6>
                  <hr className={css.totalDivider} />
                  <EstimatedCustomerBreakdownMaybe
                    breakdownData={breakdownData}
                    lineItems={lineItems}
                    timeZone={timeZone}
                    currency={unitPrice.currency}
                    marketplaceName={marketplaceName}
                    processName={BOOKING_PROCESS_NAME}
                  />

                  {areDatesSelected(startDate, endDate) && (
                    <>
                      <label>
                        {' '}
                        <FormattedMessage id="BookingTimeForm.discountCodeLabel" />
                      </label>

                      <div className={css.discountCodeContainer}>
                        <input
                          type="text"
                          value={this.state.discountCode}
                          onChange={this.handleDiscountCodeChange}
                          disabled={this.state.isCodeLocked}
                          placeholder={intl.formatMessage({
                            id: 'BookingTimeForm.discountCodePlaceholder',
                          })}
                        />
                        {!this.state.isCodeLocked ? (
                          <Button
                            className={css.verifyButton}
                            type="button"
                            onClick={this.verifyDiscountCode}
                          >
                            <FormattedMessage id="BookingTimeForm.verifyCode" />
                          </Button>
                        ) : (
                          <Button
                            className={css.removeButton}
                            type="button"
                            onClick={this.removeDiscount}
                          >
                            <FormattedMessage id="BookingTimeForm.removeDiscount" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}

                  {areDatesSelected(startDate, endDate) && this.state.validationMessage && (
                    <p className={this.state.isCodeValid ? css.validCode : css.invalidCode}>
                      {this.state.validationMessage}
                    </p>
                  )}

                  <input
                    type="hidden"
                    name="discountCode"
                    value={this.state.isCodeValid ? this.state.discountCode : ''}
                  />
                </div>
              ) : null}

              {fetchLineItemsError ? (
                <span className={css.sideBarError}>
                  <FormattedMessage id="BookingTimeForm.fetchLineItemsError" />
                </span>
              ) : null}

              <div className={css.submitButton}>
                <PrimaryButton type="submit" inProgress={fetchLineItemsInProgress}>
                  <FormattedMessage id="BookingTimeForm.requestToBook" />
                </PrimaryButton>
              </div>

              <p className={css.finePrint}>
                {payoutDetailsWarning ? (
                  payoutDetailsWarning
                ) : (
                  <FormattedMessage
                    id={
                      isOwnListing
                        ? 'BookingTimeForm.ownListing'
                        : 'BookingTimeForm.youWontBeChargedInfo'
                    }
                  />
                )}
              </p>
            </Form>
          );
        }}
      />
    );
  }
}

BookingTimeFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  price: null,
  isOwnListing: false,
  listingId: null,
  startDatePlaceholder: null,
  endDatePlaceholder: null,
  monthlyTimeSlots: null,
  lineItems: null,
  fetchLineItemsError: null,
};

BookingTimeFormComponent.propTypes = {
  rootClassName: string,
  className: string,

  marketplaceName: string.isRequired,
  price: propTypes.money,
  isOwnListing: bool,
  listingId: propTypes.uuid,
  monthlyTimeSlots: object,
  onFetchTimeSlots: func.isRequired,
  timeZone: string.isRequired,

  onFetchTransactionLineItems: func.isRequired,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,

  // for tests
  startDatePlaceholder: string,
  endDatePlaceholder: string,

  dayCountAvailableForBooking: number.isRequired,
};

const BookingTimeForm = compose(injectIntl)(BookingTimeFormComponent);
BookingTimeForm.displayName = 'BookingTimeForm';

export default BookingTimeForm;
