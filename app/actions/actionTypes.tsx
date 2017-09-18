export const ACTION_TYPES = {
  GLOBAL_LOCATION_CHANGE: "@@router/LOCATION_CHANGE",

  SIGN_IN_CHANGE_EMAIL_INPUT: Symbol("SIGN_IN.CHANGE_EMAIL_INPUT"),
  SIGN_IN_CHANGE_PASSWORD_INPUT: Symbol("SIGN_IN.CHANGE_PASSWORD_INPUT"),

  SIGN_IN_FORM_ERROR: Symbol("SIGN_IN.FORM_ERROR"),

  SIGN_IN_START_TO_SIGN_IN: Symbol("SIGN_IN.START_TO_SIGN_IN"),
  SIGN_IN_FAILED_TO_SIGN_IN: Symbol("SIGN_IN.FAILED_TO_SIGN_IN"),
  SIGN_IN_SUCCEEDED_TO_SIGN_IN: Symbol("SIGN_IN.SUCCEEDED_TO_SIGN_IN"),

  SIGN_UP_CHANGE_EMAIL_INPUT: Symbol("SIGN_UP.CHANGE_EMAIL_INPUT"),
  SIGN_UP_SUCCEEDED_TO_CHECK_DUPLICATED_EMAIL: Symbol("SIGN_UP_SUCCEEDED_TO_CHECK_DUPLICATED_EMAIL"),
  SIGN_UP_FAILED_TO_CHECK_DUPLICATED_EMAIL: Symbol("SIGN_UP_FAILED_TO_CHECK_DUPLICATED_EMAIL"),

  SIGN_UP_CHANGE_PASSWORD_INPUT: Symbol("SIGN_UP.CHANGE_PASSWORD_INPUT"),
  SIGN_UP_CHANGE_REPEAT_PASSWORD_INPUT: Symbol("SIGN_UP.CHANGE_REPEAT_PASSWORD_INPUT"),
  SIGN_UP_CHANGE_FULL_NAME_INPUT: Symbol("SIGN_UP.CHANGE_FULL_NAME_INPUT"),

  SIGN_UP_FORM_ERROR: Symbol("SIGN_UP.FORM_ERROR"),
  SIGN_UP_REMOVE_FORM_ERROR: Symbol("SIGN_UP.REMOVE_FORM_ERROR"),

  SIGN_UP_START_TO_CREATE_ACCOUNT: Symbol("SIGN_UP.START_TO_CREATE_ACCOUNT"),
  SIGN_UP_FAILED_TO_CREATE_ACCOUNT: Symbol("SIGN_UP.FAILED_TO_CREATE_ACCOUNT"),
  SIGN_UP_SUCCEEDED_TO_CREATE_ACCOUNT: Symbol("SIGN_UP.SUCCEEDED_TO_CREATE_ACCOUNT"),

  SIGN_OUT_SUCCEEDED_TO_SIGN_OUT: Symbol("SIGN_OUT_SUCCEEDED_TO_SIGN_OUT"),
  SIGN_OUT_FAILED_TO_SIGN_OUT: Symbol("SIGN_OUT_FAILED_TO_SIGN_OUT"),

  GLOBAL_DIALOG_OPEN: Symbol("GLOBAL_DIALOG_OPEN"),
  GLOBAL_DIALOG_CLOSE: Symbol("GLOBAL_DIALOG_CLOSE"),
};
