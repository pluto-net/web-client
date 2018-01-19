import * as React from "react";
import { connect } from "react-redux";
import * as Actions from "./actions";
import { IAppState } from "../../../reducers";
import { parse } from "qs";
import Icon from "../../../icons";
import { push } from "react-router-redux";
import { closeDialog } from "../../dialog/actions";
import ButtonSpinner from "../../common/spinner/buttonSpinner";
import { IEmailVerificationContainerProps, IEmailVerificationParams } from "./types";

const styles = require("./emailVerification.scss");

export function mapStateToProps(state: IAppState) {
  return {
    emailVerificationState: state.emailVerification,
    routing: state.routing,
  };
}

class EmailVerification extends React.PureComponent<IEmailVerificationContainerProps, {}> {
  public componentDidMount() {
    const { dispatch } = this.props;
    const searchString = this.getCurrentSearchParamsString();
    const searchParams: IEmailVerificationParams = this.getParsedSearchParamsObject(searchString);
    const searchToken = searchParams.token;
    const searchEmail = searchParams.email;

    if (!!searchToken && !!searchEmail) {
      this.verifyToken(searchToken);
    } else {
      alert("Email verifying token or email does not exist!");
      dispatch(push("/"));
    }
  }

  public render() {
    const { emailVerificationState } = this.props;
    const searchString = this.getCurrentSearchParamsString();
    const searchParams: IEmailVerificationParams = this.getParsedSearchParamsObject(searchString);
    const searchEmail = searchParams.email;

    if (emailVerificationState.isLoading) {
      return (
        <div className={styles.emailVerificationContainer}>
          <div className={styles.isLoadingContainer}>
            <ButtonSpinner size={50} thickness={4} />
          </div>
        </div>
      );
    } else if (emailVerificationState.hasError) {
      return (
        <div className={styles.emailVerificationContainer}>
          <div className={styles.innerContainer}>
            <div className={styles.title}>VERIFICATION FAILED</div>
            <div className={styles.content}>{`Mail verification failed.
            Please try verification again.`}</div>
            <Icon className={styles.emailVerificationFailIconWrapper} icon="EMAIL_VERIFICATION_FAIL" />
            <div onClick={this.resendVerificationEmail} className={styles.resendEmailButton}>
              RESEND MAIL
            </div>
            <div className={styles.toEmail}>
              to <span className={styles.email}>{searchEmail}</span>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.emailVerificationContainer}>
          <div className={styles.innerContainer}>
            <div className={styles.title}>VERIFICATION COMPLETED</div>
            <div className={styles.content}>{`Sign up is all done.
            Now, you can use full feature of service.`}</div>
            <Icon className={styles.emailVerificationCompleteIconWrapper} icon="EMAIL_VERIFICATION_COMPLETE" />
            <div onClick={this.confirm} className={styles.confirmButton}>
              OKAY
            </div>
          </div>
        </div>
      );
    }
  }

  private verifyToken = (token: string) => {
    const { dispatch } = this.props;

    dispatch(Actions.verifyToken(token));
  };

  private confirm = () => {
    const { dispatch, handleChangeDialogType } = this.props;
    const isDialog = !!handleChangeDialogType;

    if (isDialog) {
      dispatch(closeDialog());
    } else {
      dispatch(push("/"));
    }
  };

  private getCurrentSearchParamsString = () => {
    const { routing } = this.props;
    return routing.location.search;
  };

  private getParsedSearchParamsObject = (searchString: string): IEmailVerificationParams => {
    return parse(searchString, { ignoreQueryPrefix: true });
  };

  private resendVerificationEmail = () => {
    const { dispatch, handleChangeDialogType } = this.props;
    const searchString = this.getCurrentSearchParamsString();
    const searchParams: IEmailVerificationParams = this.getParsedSearchParamsObject(searchString);

    const searchEmail = searchParams.email;

    dispatch(Actions.resendVerificationEmail(searchEmail, !!handleChangeDialogType));
  };
}

export default connect(mapStateToProps)(EmailVerification);
