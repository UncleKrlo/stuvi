import React, { Component } from 'react';
import { bool, string } from 'prop-types';
import { compose } from 'redux';
import { Field, Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import { ensureCurrentUser } from '../../../util/data';
import { propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { isUploadImageOverLimitError } from '../../../util/errors';
import { getPropsForCustomUserFieldInputs } from '../../../util/userHelpers';
import { uploadImageToS3, deleteImageFromS3 } from './ProfileSettingsForm.duck';
import { FieldArray } from 'react-final-form-arrays';
import {
  Form,
  Avatar,
  Button,
  ImageFromFile,
  IconSpinner,
  FieldTextInput,
  H4,
  CustomExtendedDataField,
  AspectRatioWrapper,
  BirthdayField,
} from '../../../components';

import css from './ProfileSettingsForm.module.css';
import ConfirmationModal from './ConfirmationModal';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset

const DisplayNameMaybe = props => {
  const { userTypeConfig, intl } = props;

  const isDisabled = userTypeConfig?.defaultUserFields?.displayName === false;
  if (isDisabled) {
    return null;
  }

  const { required } = userTypeConfig?.displayNameSettings || {};
  const isRequired = required === true;

  const validateMaybe = isRequired
    ? {
        validate: validators.required(
          intl.formatMessage({
            id: 'ProfileSettingsForm.displayNameRequired',
          })
        ),
      }
    : {};

  return (
    <div className={css.sectionContainer}>
      <H4 as="h2" className={css.sectionTitle}>
        <FormattedMessage id="ProfileSettingsForm.displayNameHeading" />
      </H4>
      <FieldTextInput
        className={css.row}
        type="text"
        id="displayName"
        name="displayName"
        label={intl.formatMessage({
          id: 'ProfileSettingsForm.displayNameLabel',
        })}
        placeholder={intl.formatMessage({
          id: 'ProfileSettingsForm.displayNamePlaceholder',
        })}
        {...validateMaybe}
      />
      <p className={css.extraInfo}>
        <FormattedMessage id="ProfileSettingsForm.displayNameInfo" />
      </p>
    </div>
  );
};

const FieldAddImage = props => {
  const {
    formApi,
    aspectWidth = 1,
    aspectHeight = 1,
    onGalleryImageUpload,
    values,
    ...rest
  } = props;
  return (
    <Field form={null} {...rest}>
      {fieldprops => {
        const { accept, input, label, disabled: fieldDisabled } = fieldprops;
        const { name, type } = input;
        const onChange = e => {
          const file = e.target.files[0];
          formApi.change(`addProfileImage`, file);
          formApi.blur(`addProfileImage`);
          onGalleryImageUpload(formApi, values, file);
        };
        const inputProps = { accept, id: name, name, onChange, type };
        return (
          <div className={css.addImageWrapper}>
            <AspectRatioWrapper width={aspectWidth} height={aspectHeight}>
              {fieldDisabled ? null : <input {...inputProps} className={css.addImageInput} />}
              <label htmlFor={name} className={css.addImage}>
                {label}
              </label>
            </AspectRatioWrapper>
          </div>
        );
      }}
    </Field>
  );
};

class ProfileSettingsFormComponent extends Component {
  constructor(props) {
    super(props);

    this.uploadDelayTimeoutId = null;
    this.state = {
      uploadDelay: false,
      loadingPhoto: false,
    };
    this.submittedValues = {};
  }

  componentDidUpdate(prevProps) {
    // Upload delay is additional time window where Avatar is added to the DOM,
    // but not yet visible (time to load image URL from srcset)
    if (prevProps.uploadInProgress && !this.props.uploadInProgress) {
      this.setState({ uploadDelay: true });
      this.uploadDelayTimeoutId = window.setTimeout(() => {
        this.setState({ uploadDelay: false });
      }, UPLOAD_CHANGE_DELAY);
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.uploadDelayTimeoutId);
  }

  onGalleryImageUpload = async (formApi, values, file) => {
    console.log('trying to upload');
    try {
      // TODO: set loader
      this.setState({ loadingPhoto: true });
      const imageUrl = await uploadImageToS3(file);
      this.setState({ loadingPhoto: false });
      const profileGallerySaved = this.props.initialValues?.profileGallery;
      const currentProfileGallery = values.profileGallery || [];
      formApi.change('profileGallery', [...currentProfileGallery, { imageUrl }]);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  onGalleryImageRemove = async (formApi, index, imageUrl, values) => {
    try {
      await deleteImageFromS3(imageUrl);
      const currentProfileGallery = values.profileGallery || [];
      const updatedProfileGallery = currentProfileGallery.filter((_, i) => i !== index);
      formApi.change('profileGallery', updatedProfileGallery);
      // Espera a que se actualice el estado del formulario
      await new Promise(resolve => setTimeout(resolve, 0));

      // Ahora hacemos el submit
      formApi.submit();
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  render() {
    return (
      <FinalForm
        {...this.props}
        mutators={{ ...arrayMutators }}
        render={fieldRenderProps => {
          const {
            className,
            currentUser,
            handleSubmit,
            intl,
            invalid,
            onImageUpload,
            pristine,
            profileImage,
            rootClassName,
            updateInProgress,
            updateProfileError,
            uploadImageError,
            uploadInProgress,
            form,
            formId,
            marketplaceName,
            values,
            userFields,
            userTypeConfig,
          } = fieldRenderProps;

          const user = ensureCurrentUser(currentUser);

          // First name
          const firstNameLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.firstNameLabel',
          });
          const firstNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.firstNamePlaceholder',
          });
          const firstNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.firstNameRequired',
          });
          const firstNameRequired = validators.required(firstNameRequiredMessage);

          // Last name
          const lastNameLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNameLabel',
          });
          const lastNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNamePlaceholder',
          });
          const lastNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNameRequired',
          });
          const lastNameRequired = validators.required(lastNameRequiredMessage);

          // Bio
          const bioLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.bioLabel',
          });
          const bioPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.bioPlaceholder',
          });

          const uploadingOverlay =
            uploadInProgress || this.state.uploadDelay ? (
              <div className={css.uploadingImageOverlay}>
                <IconSpinner />
              </div>
            ) : null;

          const hasUploadError = !!uploadImageError && !uploadInProgress;
          const errorClasses = classNames({ [css.avatarUploadError]: hasUploadError });
          const transientUserProfileImage = profileImage.uploadedImage || user.profileImage;
          const transientUser = { ...user, profileImage: transientUserProfileImage };

          // Ensure that file exists if imageFromFile is used
          const fileExists = !!profileImage.file;
          const fileUploadInProgress = uploadInProgress && fileExists;
          const delayAfterUpload = profileImage.imageId && this.state.uploadDelay;
          const imageFromFile =
            fileExists && (fileUploadInProgress || delayAfterUpload) ? (
              <ImageFromFile
                id={profileImage.id}
                className={errorClasses}
                rootClassName={css.uploadingImage}
                aspectWidth={1}
                aspectHeight={1}
                file={profileImage.file}
              >
                {uploadingOverlay}
              </ImageFromFile>
            ) : null;

          // Avatar is rendered in hidden during the upload delay
          // Upload delay smoothes image change process:
          // responsive img has time to load srcset stuff before it is shown to user.
          const avatarClasses = classNames(errorClasses, css.avatar, {
            [css.avatarInvisible]: this.state.uploadDelay,
          });
          const avatarComponent =
            !fileUploadInProgress && profileImage.imageId ? (
              <Avatar
                className={avatarClasses}
                renderSizes="(max-width: 767px) 96px, 240px"
                user={transientUser}
                disableProfileLink
              />
            ) : null;

          const chooseAvatarLabel =
            profileImage.imageId || fileUploadInProgress ? (
              <div className={css.avatarContainer}>
                {imageFromFile}
                {avatarComponent}
                <div className={css.changeAvatar}>
                  <FormattedMessage id="ProfileSettingsForm.changeAvatar" />
                </div>
              </div>
            ) : (
              <div className={css.avatarPlaceholder}>
                <div className={css.avatarPlaceholderText}>
                  <FormattedMessage id="ProfileSettingsForm.addYourProfilePicture" />
                </div>
                <div className={css.avatarPlaceholderTextMobile}>
                  <FormattedMessage id="ProfileSettingsForm.addYourProfilePictureMobile" />
                </div>
              </div>
            );

          const submitError = updateProfileError ? (
            <div className={css.error}>
              <FormattedMessage id="ProfileSettingsForm.updateProfileFailed" />
            </div>
          ) : null;

          const classes = classNames(rootClassName || css.root, className);
          const submitInProgress = updateInProgress;
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const submitDisabled =
            invalid || pristine || pristineSinceLastSubmit || uploadInProgress || submitInProgress;

          const userFieldProps = getPropsForCustomUserFieldInputs(
            userFields,
            intl,
            userTypeConfig?.userType,
            false
          );

          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e);
              }}
            >
              <div className={css.sectionContainer}>
                <H4 as="h2" className={css.sectionTitle}>
                  <FormattedMessage id="ProfileSettingsForm.yourProfilePicture" />
                </H4>
                <Field
                  accept={ACCEPT_IMAGES}
                  id="profileImage"
                  name="profileImage"
                  label={chooseAvatarLabel}
                  type="file"
                  form={null}
                  uploadImageError={uploadImageError}
                  disabled={uploadInProgress}
                >
                  {fieldProps => {
                    const { accept, id, input, label, disabled, uploadImageError } = fieldProps;
                    const { name, type } = input;
                    const onChange = e => {
                      const file = e.target.files[0];
                      form.change(`profileImage`, file);
                      form.blur(`profileImage`);
                      if (file != null) {
                        const tempId = `${file.name}_${Date.now()}`;
                        onImageUpload({ id: tempId, file });
                      }
                    };

                    let error = null;

                    if (isUploadImageOverLimitError(uploadImageError)) {
                      error = (
                        <div className={css.error}>
                          <FormattedMessage id="ProfileSettingsForm.imageUploadFailedFileTooLarge" />
                        </div>
                      );
                    } else if (uploadImageError) {
                      error = (
                        <div className={css.error}>
                          <FormattedMessage id="ProfileSettingsForm.imageUploadFailed" />
                        </div>
                      );
                    }

                    return (
                      <div className={css.uploadAvatarWrapper}>
                        <label className={css.label} htmlFor={id}>
                          {label}
                        </label>
                        <input
                          accept={accept}
                          id={id}
                          name={name}
                          className={css.uploadAvatarInput}
                          disabled={disabled}
                          onChange={onChange}
                          type={type}
                        />
                        {error}
                      </div>
                    );
                  }}
                </Field>
                <div className={css.tip}>
                  <FormattedMessage id="ProfileSettingsForm.tip" />
                </div>
                <div className={css.fileInfo}>
                  <FormattedMessage id="ProfileSettingsForm.fileInfo" />
                </div>
              </div>
              <div className={css.sectionContainer}>
                <H4 as="h2" className={css.sectionTitle}>
                  <FormattedMessage id="ProfileSettingsForm.yourName" />
                </H4>
                <div className={css.nameContainer}>
                  <FieldTextInput
                    className={css.firstName}
                    type="text"
                    id="firstName"
                    name="firstName"
                    label={firstNameLabel}
                    placeholder={firstNamePlaceholder}
                    validate={validators.required(
                      intl.formatMessage({
                        id: 'ProfileSettingsForm.firstNameRequired',
                      })
                    )}
                  />
                  <FieldTextInput
                    className={css.lastName}
                    type="text"
                    id="lastName"
                    name="lastName"
                    label={lastNameLabel}
                    placeholder={lastNamePlaceholder}
                    validate={validators.required(
                      intl.formatMessage({
                        id: 'ProfileSettingsForm.lastNameRequired',
                      })
                    )}
                  />
                </div>
              </div>

              <DisplayNameMaybe userTypeConfig={userTypeConfig} intl={intl} />

              <div className={classNames(css.sectionContainer)}>
                <H4 as="h2" className={css.sectionTitle}>
                  <FormattedMessage id="ProfileSettingsForm.bioHeading" />
                </H4>
                <FieldTextInput
                  type="textarea"
                  id="bio"
                  name="bio"
                  label={intl.formatMessage({
                    id: 'ProfileSettingsForm.bioLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'ProfileSettingsForm.bioPlaceholder',
                  })}
                />
                <p className={css.extraInfo}>
                  <FormattedMessage id="ProfileSettingsForm.bioInfo" values={{ marketplaceName }} />
                </p>
              </div>
              <div className={classNames(css.sectionContainer)}>
                {/* {userFieldProps?.map(fieldProps => {
                  if (fieldProps.key === 'pub_birthday') {
                    return (
                      <Field
                        key={fieldProps.key}
                        component={BirthdayField}
                        name={fieldProps.name}
                        id={fieldProps.key}
                        intl={intl}
                        formId={formId}
                        validate={validators.composeValidators(
                          validators.required(
                            intl.formatMessage({ id: 'ProfileSettingsForm.required' })
                          ),
                          validators.ageWithinRange(
                            intl.formatMessage({ id: 'ProfileSettingsForm.tooYoung' }),
                            intl.formatMessage({ id: 'ProfileSettingsForm.tooOld' })
                          )
                        )}
                      />
                    );
                  }
                  return (
                    <CustomExtendedDataField key={fieldProps.key} {...fieldProps} formId={formId} />
                  );
                })} */}
                <FieldTextInput
                  type="text"
                  id="spotifyLink"
                  name="spotifyLink"
                  label={intl.formatMessage({
                    id: 'ProfileSettingsForm.spotifyLinkLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'ProfileSettingsForm.spotifyLinkPlaceholder',
                  })}
                />
                <p className={css.extraInfo}>
                  <FormattedMessage id="ProfileSettingsForm.spotifyLinkInfo" />
                </p>
              
              </div>
              
                
              <div className={classNames(css.sectionContainer, css.lastSection)}>
                <H4 as="h2" className={css.sectionTitle}>
                  <FormattedMessage id="ProfileSettingsForm.profileGalleryTitle" />
                </H4>
                <p className={css.extraInfo}>
                  <FormattedMessage id="ProfileSettingsForm.profileGalleryInfo" />
                </p>
                <FieldArray name="profileGallery">
                  {({ fields }) => (
                    <div>
                      {fields.map((name, index) => (
                        <Field name={`${name}.imageUrl`} key={name}>
                          {({ input }) => (
                            <>
                              <div className={css.galleryItem}>
                                <img
                                  src={input.value}
                                  alt={`Profile ${index + 1}`}
                                  style={{ width: 100, height: '100%', marginRight: '10px' }}
                                />
                                <button
                                  type="button"
                                  className={css.removeImage}
                                  onClick={() =>
                                    this.onGalleryImageRemove(form, index, input.value, values)
                                  }
                                >
                                  <FormattedMessage id="ProfileSettingsForm.removeImage" />
                                </button>
                              </div>
                            </>
                          )}
                        </Field>
                      ))}
                      <div style={{ marginTop: 30, marginBottom: 30 }}>
                        {this.state.loadingPhoto ? <IconSpinner /> : null}
                      </div>
                      {fields.length < 5 && (
                        <FieldAddImage
                          id="addProfileImage"
                          name="addProfileImage"
                          accept={ACCEPT_IMAGES}
                          label={intl.formatMessage({ id: 'ProfileSettingsForm.addImage' })}
                          type="file"
                          values={values}
                          onGalleryImageUpload={this.onGalleryImageUpload}
                          formApi={form}
                        />
                      )}
                    </div>
                  )}
                </FieldArray>
              </div>

              {submitError}
              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                disabled={submitDisabled}
                ready={pristineSinceLastSubmit}
              >
                <FormattedMessage id="ProfileSettingsForm.saveChanges" />
              </Button>
            </Form>
          );
        }}
      />
    );
  }
}

ProfileSettingsFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  formId: null,
  uploadImageError: null,
  updateProfileError: null,
  updateProfileReady: false,
};

ProfileSettingsFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  formId: string,

  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const ProfileSettingsForm = compose(injectIntl)(ProfileSettingsFormComponent);

ProfileSettingsForm.displayName = 'ProfileSettingsForm';

export default ProfileSettingsForm;
