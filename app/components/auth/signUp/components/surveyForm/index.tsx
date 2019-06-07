import * as React from 'react';
import { withStyles } from '../../../../../helpers/withStylesHelper';
import { SCINAPSE_SURVEY_QUESTIONS, SurveyType } from './constants';
import Question from './components/question';
import { AppState } from '../../../../../reducers';
import { connect } from 'react-redux';
import { SurveyFormState } from '../../../../../reducers/surveyForm';
import { Dispatch } from 'redux';
import ActionTicketManager from '../../../../../helpers/actionTicketManager';
import { getCurrentPageType } from '../../../../locationListener';
import * as classNames from 'classnames';
import { ActionCreators } from '../../../../../actions/actionTypes';
import { DialogState } from '../../../../dialog/reducer';
import GlobalDialogManager from '../../../../../helpers/globalDialogManager';
const styles = require('./surveyForm.scss');

interface SurveyFormProps {
  SurveyFormState: SurveyFormState;
  DialogState: DialogState;
  dispatch: Dispatch<any>;
}

function randomizedAnswers(defaultQuestion: SurveyType) {
  const defaultAnswers = defaultQuestion.answers;
  const randomizedAnswersSurveyContext = {
    ...defaultQuestion,
    answer: defaultAnswers.sort(() => {
      return 0.5 - Math.random();
    }),
  };
  return randomizedAnswersSurveyContext;
}

function openFinalSignUpDialog(nextSignUpStep: string) {
  if (nextSignUpStep === 'email') {
    GlobalDialogManager.openFinalSignUpWithEmailDialog();
  } else {
    GlobalDialogManager.openFinalSignUpWithSocialDialog();
  }
}

const SurveyForm: React.FC<SurveyFormProps> = ({ SurveyFormState, dispatch, DialogState }) => {
  const [surveyQuestions, setSurveyQuestions] = React.useState<SurveyType[]>([]);
  const [isActive, setIsActive] = React.useState<boolean>(false);

  React.useEffect(() => {
    const questions = SCINAPSE_SURVEY_QUESTIONS.map(question => {
      return question.random ? randomizedAnswers(question) : question;
    });

    setSurveyQuestions(questions);
  }, []);

  React.useEffect(
    () => {
      setIsActive(surveyQuestions.length > 0 && surveyQuestions.length === SurveyFormState.surveyResult.length);
    },
    [SurveyFormState.surveyResult]
  );

  const questionsList = surveyQuestions.map((question, index) => {
    return <Question key={index} qKey={index} context={question} dispatch={dispatch} />;
  });

  return (
    <div className={styles.surveyFormContainer}>
      <div className={styles.btnWrapper}>
        <div>{questionsList}</div>
        <button
          className={classNames({
            [styles.activeSubmitBtn]: isActive,
            [styles.inActiveSubmitBtn]: !isActive,
          })}
          onClick={() => {
            ActionTicketManager.trackTicket({
              pageType: getCurrentPageType(),
              actionType: 'fire',
              actionArea: 'surveyForm',
              actionTag: 'submitSurvey',
              actionLabel: JSON.stringify(SurveyFormState.surveyResult),
            });
            dispatch(ActionCreators.submitToSurvey());
            openFinalSignUpDialog(DialogState.nextSignUpStep!);
          }}
          disabled={!isActive}
        >
          Submit
        </button>
        <button
          className={styles.skipBtn}
          onClick={() => {
            openFinalSignUpDialog(DialogState.nextSignUpStep!);
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
};

function mapStateToProps(state: AppState) {
  return {
    SurveyFormState: state.surveyFormState,
    DialogState: state.dialog,
  };
}

export default connect(mapStateToProps)(withStyles<typeof styles>(styles)(SurveyForm));