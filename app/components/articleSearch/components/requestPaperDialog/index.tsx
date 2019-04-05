import * as React from "react";
import { CurrentUser } from "../../../../model/currentUser";
import { withStyles } from "../../../../helpers/withStylesHelper";
import { AppState } from "../../../../reducers";
import { RouteComponentProps, withRouter } from "react-router-dom";
import FeedbackManager from "@pluto_network/scinapse-feedback";
import { connect, Dispatch } from "react-redux";
import * as Cookies from "js-cookie";
import Dialog from "@material-ui/core/Dialog";
import { Formik, FormikErrors, Form, Field } from "formik";
import validateEmail from "../../../../helpers/validateEmail";
import * as classNames from "classnames";
import Icon from "../../../../icons";
import ScinapseFormikInput from "../../../common/scinapseInput/scinapseFormikInput";
import ReduxAutoSizeTextarea from "../../../common/autoSizeTextarea/reduxAutoSizeTextarea";
import { ACTION_TYPES } from "../../../../actions/actionTypes";
import ActionTicketManager from "../../../../helpers/actionTicketManager";
declare var ga: any;
const styles = require("./requestPaperDialog.scss");

const LAST_SUCCEEDED_EMAIL_KEY = "l_s_e_k";

interface RequestPaperDialogProps extends RouteComponentProps<any> {
  isOpen: boolean;
  onClose: () => void;
  query: string | null;
  currentUser: CurrentUser;
  dispatch: Dispatch<any>;
}

interface FormState {
  email: string;
  content: string;
}

function validateForm(values: FormState) {
  const errors: FormikErrors<FormState> = {};
  if (!validateEmail(values.email)) {
    errors.email = "Please enter valid e-mail address.";
  }
  return errors;
}

const RequestPaperDialog: React.FunctionComponent<RequestPaperDialogProps> = props => {
  const { currentUser, location, isOpen, onClose, dispatch, query } = props;
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmitForm(values: FormState) {
    setIsLoading(true);

    const feedbackManger = new FeedbackManager();

    let gaId = "";
    if (typeof ga !== "undefined") {
      ga((tracker: any) => {
        gaId = tracker.get("clientId");
      });
    }

    const href: string = location.pathname;

    try {
      await feedbackManger.sendFeedback({
        content: values.content,
        email: values.email,
        referer: href,
        userId: currentUser.isLoggedIn ? currentUser.id.toString() : "",
        gaId,
      });

      ActionTicketManager.trackTicket({
        pageType: "searchResult",
        actionType: "fire",
        actionArea: "noPaperNotiPage",
        actionTag: "sendRequestPaper",
        actionLabel: query,
      });

      dispatch({
        type: ACTION_TYPES.GLOBAL_ALERT_NOTIFICATION,
        payload: {
          type: "success",
          message: "Sent request successfully.",
        },
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert(err);
    }
    setIsLoading(false);
  }

  React.useEffect(
    () => {
      if (currentUser.isLoggedIn) {
        setEmail(currentUser.email);
      } else {
        setEmail(Cookies.get(LAST_SUCCEEDED_EMAIL_KEY) || "");
      }
    },
    [currentUser.isLoggedIn]
  );

  return (
    <Dialog open={isOpen} onClose={onClose} classes={{ paper: styles.dialogPaper }}>
      <div className={styles.title}>Request Full-text</div>
      <div className={styles.subtitle}>
        We will send you a checked paper by sending a request to the authors instead.
      </div>

      <Formik
        initialValues={{ email, content: "" }}
        validate={validateForm}
        onSubmit={handleSubmitForm}
        enableReinitialize
        render={({ errors }) => (
          <Form className={styles.form}>
            <label htmlFor="email" className={styles.label}>
              YOUR EMAIL*
            </label>
            <Field
              name="email"
              type="email"
              className={classNames({
                [styles.emailInput]: true,
                [styles.emailInputError]: !!errors.email,
              })}
              placeholder="ex) researcher@university.com"
              component={ScinapseFormikInput}
            />
            <label htmlFor="content" className={styles.contentLabel}>
              ADD YOUR MESSAGE (Optional)
            </label>
            <Field
              name="content"
              component={ReduxAutoSizeTextarea}
              textareaClassName={styles.textAreaWrapper}
              textareaStyle={{ padding: "8px" }}
              rows={3}
              placeholder="Add the URL(web address), DOI, or the citation sentence of the paper to be included."
            />
            <div className={styles.btnWrapper}>
              <button className={styles.cancelBtn} type="button" onClick={onClose}>
                cancel
              </button>
              <button disabled={isLoading} className={styles.submitBtn} type="submit">
                <Icon icon="SEND" className={styles.sendIcon} />
                Send
              </button>
            </div>
          </Form>
        )}
      />
    </Dialog>
  );
};

function mapStateToProps(state: AppState) {
  return {
    currentUser: state.currentUser,
  };
}

export default withRouter(connect(mapStateToProps)(withStyles<typeof RequestPaperDialog>(styles)(RequestPaperDialog)));