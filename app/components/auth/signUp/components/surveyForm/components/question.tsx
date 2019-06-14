import * as React from 'react';
import { withStyles } from '../../../../../../helpers/withStylesHelper';
import { RadioSurveyQuestion, AvailableSurveyQuestion, AnswerParams } from '../../../../../../helpers/surveyHelper';
const styles = require('./question.scss');
interface BaseSurveyQuestionCompProps {
  question: AvailableSurveyQuestion;
  questionIndex: number;
  onChange: (answer: AnswerParams) => void;
}

interface RadioSurveyQuestionCompProps extends BaseSurveyQuestionCompProps {
  question: RadioSurveyQuestion;
}

const RadioSurveyQuestionComp: React.FC<RadioSurveyQuestionCompProps> = ({ question, onChange, questionIndex }) => {
  const optionList = question.options.map((option, i) => {
    return (
      <div className={styles.answerWrapper} key={i}>
        <label className={styles.label}>
          <input
            onChange={(e) => {
              const value = e.currentTarget.value;
              onChange({
                answer: value,
                questionIndex,
                optionIndex: i,
              });
            }}
            type="radio" value={option} className={styles.answerRadioBtn} checked={question.answer === option} />
          <span className={styles.answerDesc}>{option}</span>
        </label>
      </div>
    )
  })

  return (
    <div className={styles.questionContainer}>
      <div className={styles.title}>{question.content}</div>
      <div className={styles.answersWrapper}>{optionList}</div>
    </div>
  );
}

const QuestionComp: React.FC<BaseSurveyQuestionCompProps> = ({ question, onChange, questionIndex }) => {
  switch (question.type) {
    case 'radio':
      return (
        <RadioSurveyQuestionComp question={question as RadioSurveyQuestion} onChange={onChange} questionIndex={questionIndex} />
      )

    default:
      return null;
  }
}

export default withStyles<typeof QuestionComp>(styles)(QuestionComp);
