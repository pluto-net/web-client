import * as React from "react";
import { List } from "immutable";
import { ARTICLE_REVIEW_STEP, IArticleShowStateRecord, IReviewCommentsState } from "../../records";
import { IReviewStepProps } from "./reviewStep";
import { IArticleRecord } from "../../../../model/article";
import ArticleSpinner from "../../../common/spinner/articleSpinner";
import { ICurrentUserRecord } from "../../../../model/currentUser";
import { IReviewsRecord } from "../../../../model/review";
import { ICommentsRecord } from "../../../../model/comment";
import PeerEvaluationList from "../peerEvaluationList";
import MyReview from "../myReview";
import { IPostCommentParams } from "../../../../api/article";
const styles = require("./review.scss");

interface IArticleReviewProps extends IReviewStepProps {
  article: IArticleRecord;
  reviews: IReviewsRecord;
  currentUser: ICurrentUserRecord;
  articleShow: IArticleShowStateRecord;
  comments: ICommentsRecord;
  commentsState: List<IReviewCommentsState>;
  handleClickScore: (step: ARTICLE_REVIEW_STEP, score: number) => void;
  handleSubmitReview: (e: React.FormEvent<HTMLFormElement>) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  handleTogglePeerReview: (peerReviewId: number) => void;
  handlePeerReviewCommentSubmit: (params: IPostCommentParams) => void;
  handleVotePeerReview: (articleId: number, reviewId: number) => void;
  fetchComments: (articleId: number, reviewId: number, page?: number) => void;
  handleReviewChange: (review: string) => void;
}

function getMyReviewComponent(props: IArticleReviewProps) {
  const isFinal = props.currentUser && props.reviews && props.articleShow.currentStep === ARTICLE_REVIEW_STEP.FINAL;

  if (isFinal || props.article.reviewed) {
    return null;
  } else {
    return (
      <MyReview
        article={props.article}
        articleShow={props.articleShow}
        handleClickScore={props.handleClickScore}
        goToNextStep={props.goToNextStep}
        goToPrevStep={props.goToPrevStep}
        handleSubmitReview={props.handleSubmitReview}
        handleReviewChange={props.handleReviewChange}
        currentUser={props.currentUser}
      />
    );
  }
}

function getReviewComponent(props: IArticleReviewProps) {
  if (props.articleShow.isEvaluationSubmitLoading) {
    return <ArticleSpinner className={styles.spinnerWrapper} />;
  } else if (props.reviews.count() === 0) {
    return <div>{getMyReviewComponent(props)}</div>;
  } else {
    return (
      <div>
        {getMyReviewComponent(props)}
        <PeerEvaluationList
          fetchComments={props.fetchComments}
          commentsState={props.commentsState}
          handleVotePeerEvaluation={props.handleVotePeerReview}
          handlePeerEvaluationCommentSubmit={props.handlePeerReviewCommentSubmit}
          articleShow={props.articleShow}
          currentUser={props.currentUser}
          comments={props.comments}
          evaluations={props.reviews}
          handleTogglePeerEvaluation={props.handleTogglePeerReview}
        />
      </div>
    );
  }
}

const ArticleReview = (props: IArticleReviewProps) => {
  return (
    <div className={styles.evaluateWrapper}>
      <div className={styles.title}>Review</div>
      {getReviewComponent(props)}
    </div>
  );
};

export default ArticleReview;
