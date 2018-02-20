import * as React from "react";
import Icon from "../../../icons";
import { withStyles } from "../../../helpers/withStylesHelper";
const styles = require("./authInputBox.scss");

interface AuthInputBoxProps {
  onFocused: boolean;
  onFocusFunc: () => void;
  onChangeFunc: (value: string) => void;
  onBlurFunc?: () => void;
  defaultValue?: string;
  placeHolder?: string;
  hasError?: boolean;
  inputType: string;
  iconName: string;
}

const AuthInputBox = (props: AuthInputBoxProps) => {
  const {
    onFocused,
    onFocusFunc,
    onChangeFunc,
    onBlurFunc,
    defaultValue,
    placeHolder,
    hasError,
    inputType,
    iconName,
  } = props;
  let formBoxClassName = styles.formBox;
  if (hasError) {
    formBoxClassName = `${styles.formBox} ${styles.formError}`;
  } else if (onFocused) {
    formBoxClassName = `${styles.formBox} ${styles.onFocusedInputBox}`;
  }

  return (
    <div className={formBoxClassName}>
      <Icon className={`${styles.formBoxIconWrapper} ${styles[iconName]}`} icon={iconName} />
      <input
        onFocus={onFocusFunc}
        onChange={e => {
          onChangeFunc(e.currentTarget.value);
        }}
        onBlur={onBlurFunc}
        placeholder={placeHolder}
        className={`form-control ${styles.inputBox}`}
        value={defaultValue}
        type={inputType}
      />
    </div>
  );
};

export default withStyles<typeof AuthInputBox>(styles)(AuthInputBox);
