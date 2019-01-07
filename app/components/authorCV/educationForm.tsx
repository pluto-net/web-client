import * as React from "react";
import ScinapseFormikInput from "../common/scinapseInput/scinapseFormikInput";
import ScinapseButton from "../common/scinapseButton";
import { withStyles } from "../../helpers/withStylesHelper";
import { Formik, Form, Field, FormikErrors, ErrorMessage } from "formik";
import scinapseFormikCheckbox from "../common/scinapseInput/scinapseFormikCheckbox";
import * as classNames from "classnames";
import { handelAvailableSubmitFlag } from "../../containers/authorCvSection";
const styles = require("./authorCVForm.scss");

export interface EducationFormState {
  id?: string;
  degree: string;
  department: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  institution_id: number | null;
  institution_name: string;
}

interface EducationFormProps {
  isOpen: boolean;
  isLoading: boolean;
  initialValues: EducationFormState;
  handleSubmitForm: (education: EducationFormState) => Promise<void>;
  handleClose: React.ReactEventHandler<{}>;
}

const validateForm = (values: EducationFormState) => {
  const errors: FormikErrors<EducationFormState> = {};

  if (!values.department && values.department.length < 2) {
    errors.department = "Minimum length is 1";
  }

  if (!values.degree && values.degree.length < 2) {
    errors.degree = "Minimum length is 1";
  }

  if (!values.institution_name && values.institution_name.length < 2) {
    errors.institution_name = "Not available institution";
  }

  if (!values.start_date) {
    errors.start_date = "Please selected valid date";
  }

  if (!values.is_current && !values.end_date) {
    errors.end_date = "Please selected valid date";
  }

  return errors;
};

@withStyles<typeof EducationForm>(styles)
class EducationForm extends React.PureComponent<EducationFormProps> {
  private formikNode: Formik<EducationFormState> | null;

  public componentWillReceiveProps(nextProps: EducationFormProps) {
    if (!this.props.isOpen && nextProps.isOpen && this.formikNode) {
      this.formikNode.resetForm();
    }
  }

  public render() {
    const { handleClose, isLoading, handleSubmitForm, initialValues } = this.props;
    const wrapperStyle: React.CSSProperties = { display: "inline-flex" };

    return (
      <Formik
        ref={(el: any) => (this.formikNode = el)}
        initialValues={initialValues}
        onSubmit={handleSubmitForm}
        validate={validateForm}
        enableReinitialize={true}
        render={({ values, errors, touched }) => {
          return (
            <Form>
              <div className={styles.contentSection}>
                <div className={styles.formControl}>
                  <div className={styles.inlineInput}>
                    <label htmlFor="institution_name">Institution</label>
                    <Field
                      name="institution_name"
                      type="text"
                      component={ScinapseFormikInput}
                      wrapperStyle={wrapperStyle}
                      className={classNames({
                        [styles.inputField]: true,
                        [styles.errorInputField]: !!errors.institution_name && touched.institution_name,
                      })}
                    />
                    <ErrorMessage name="institution_name" className={styles.errorMessage} component="div" />
                  </div>
                  <div className={styles.inlineInput}>
                    <label htmlFor="department">Department</label>
                    <Field
                      name="department"
                      type="text"
                      component={ScinapseFormikInput}
                      wrapperStyle={wrapperStyle}
                      className={classNames({
                        [styles.inputField]: true,
                        [styles.errorInputField]: !!errors.department && touched.department,
                      })}
                    />
                    <ErrorMessage name="department" className={styles.errorMessage} component="div" />
                  </div>
                  <div className={styles.inlineInput}>
                    <label htmlFor="degree">Degree</label>
                    <Field
                      name="degree"
                      type="text"
                      component={ScinapseFormikInput}
                      wrapperStyle={wrapperStyle}
                      className={classNames({
                        [styles.inputField]: true,
                        [styles.errorInputField]: !!errors.degree && touched.degree,
                      })}
                    />
                    <ErrorMessage name="degree" className={styles.errorMessage} component="div" />
                  </div>
                  <div className={styles.dateWrapper}>
                    <div className={styles.dateInlineInput}>
                      <label htmlFor="start_date">Time period</label>
                      <Field
                        name="start_date"
                        type="month"
                        className={classNames({
                          [styles.dateField]: true,
                          [styles.errorInputField]: !!errors.start_date && touched.start_date,
                        })}
                      />
                      <ErrorMessage name="start_date" className={styles.errorMessage} component="div" />
                    </div>
                    {!values.is_current ? (
                      <div className={styles.dateInlineInput}>
                        <Field
                          name="end_date"
                          type="month"
                          className={classNames({
                            [styles.dateField]: true,
                            [styles.errorInputField]: !!errors.end_date && touched.end_date,
                          })}
                        />
                        <ErrorMessage name="end_date" className={styles.errorMessage} component="div" />
                      </div>
                    ) : (
                      ""
                    )}
                    <div className={styles.dateCheckWrapper}>
                      <Field
                        className={styles.checkBox}
                        component={scinapseFormikCheckbox}
                        wrapperStyle={{ height: "100%" }}
                        name="is_current"
                        type="checkbox"
                        checked={initialValues.is_current}
                      />
                      <label htmlFor="is_current">currently doing</label>
                    </div>
                  </div>

                  <div className={styles.buttonsWrapper}>
                    <ScinapseButton
                      type="button"
                      onClick={handleClose}
                      gaCategory="New Author Show"
                      gaAction="Click Cancel Button in Author CV page"
                      gaLabel="Cancel education form"
                      content="Cancel"
                      style={{
                        height: "42px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        opacity: 0.25,
                        color: "#1e2a35",
                        border: "none",
                        display: "inline-block",
                        marginRight: "8px",
                      }}
                    />
                    <ScinapseButton
                      type="submit"
                      style={{
                        backgroundColor: handelAvailableSubmitFlag(errors, touched) ? "#48d2a0" : "#bbc2d0",
                        cursor: !handelAvailableSubmitFlag(errors, touched) ? "not-allowed" : "pointer",
                        width: "57px",
                        height: "42px",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                      disabled={isLoading}
                      gaCategory="New Author Show"
                      gaAction="Click Save Button in Author CV page "
                      gaLabel={`Save education in educationForm`}
                      content="Save"
                    />
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      />
    );
  }
}

export default EducationForm;
