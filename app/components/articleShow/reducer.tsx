import { IReduxAction } from "../../typings/actionType";
import { ARTICLE_SHOW_INITIAL_STATE, IArticleShowStateRecord, ARTICLE_REVIEW_STEP } from "./records";
import { ACTION_TYPES } from "../../actions/actionTypes";
import { IReviewsRecord } from "../../model/review";
import { ICommentRecord } from "../../model/comment";

export function reducer(state = ARTICLE_SHOW_INITIAL_STATE, action: IReduxAction<any>): IArticleShowStateRecord {
  switch (action.type) {
    case ACTION_TYPES.ARTICLE_SHOW_TOGGLE_PEER_REVIEW_COMPONENT: {
      let peerEvaluationId: string = null;
      if (state.peerEvaluationId !== action.payload.peerEvaluationId) {
        peerEvaluationId = action.payload.peerEvaluationId;
      }
      return state.set("peerEvaluationId", peerEvaluationId);
    }

    case ACTION_TYPES.ARTICLE_SHOW_CHANGE_REVIEW_STEP: {
      return state.set("currentStep", action.payload.step);
    }

    case ACTION_TYPES.ARTICLE_SHOW_CHANGE_REVIEW_SCORE: {
      switch (action.payload.step) {
        case ARTICLE_REVIEW_STEP.FIRST: {
          return state.set("myOriginalityScore", action.payload.score);
        }

        case ARTICLE_REVIEW_STEP.SECOND: {
          return state.set("mySignificanceScore", action.payload.score);
        }
        case ARTICLE_REVIEW_STEP.THIRD: {
          return state.set("myValidityScore", action.payload.score);
        }
        case ARTICLE_REVIEW_STEP.FOURTH: {
          return state.set("myOrganizationScore", action.payload.score);
        }

        default:
          break;
      }
    }

    case ACTION_TYPES.ARTICLE_SHOW_CHANGE_REVIEW_INPUT: {
      return state.set("reviewInput", action.payload.review);
    }

    case ACTION_TYPES.ARTICLE_SHOW_START_TO_SUBMIT_REVIEW: {
      return state.withMutations(currentState => {
        return currentState.set("isEvaluationSubmitLoading", true).set("hasEvaluationSubmitError", false);
      });
    }

    case ACTION_TYPES.ARTICLE_SHOW_FAILED_TO_SUBMIT_REVIEW: {
      return state.withMutations(currentState => {
        return currentState.set("isEvaluationSubmitLoading", false).set("hasEvaluationSubmitError", true);
      });
    }

    case ACTION_TYPES.ARTICLE_SHOW_SUCCEEDED_SUBMIT_REVIEW: {
      return state.withMutations(currentState => {
        return currentState
          .set("evaluationIdsToShow", currentState.evaluationIdsToShow.push(action.payload.evaluation.id))
          .set("isEvaluationSubmitLoading", false)
          .set("hasEvaluationSubmitError", false);
      });
    }

    case ACTION_TYPES.ARTICLE_SHOW_START_TO_GET_ARTICLE: {
      return state.withMutations(currentState => {
        return currentState.set("isLoading", true).set("hasError", false);
      });
    }

    case ACTION_TYPES.ARTICLE_SHOW_FAILED_TO_GET_ARTICLE: {
      return state.withMutations(currentState => {
        return currentState.set("isLoading", false).set("hasError", true);
      });
    }

    case ACTION_TYPES.ARTICLE_SHOW_SUCCEEDED_TO_GET_ARTICLE: {
      return state.withMutations(currentState => {
        return currentState.set("isLoading", false).set("hasError", false);
      });
    }

    case ACTION_TYPES.ARTICLE_SHOW_START_TO_PEER_REVIEW_COMMENT_SUBMIT: {
      return state.withMutations(currentState => {
        return currentState.set("evaluationCommentHasError", false).set("evaluationCommentIsLoading", true);
      });
    }

    case ACTION_TYPES.ARTICLE_SHOW_SUCCEEDED_TO_PEER_REVIEW_COMMENT_SUBMIT: {
      return state.withMutations(currentState => {
        const newCommentStates = currentState.commentStates.push({
          evaluationId: action.payload.evaluationId,
          isLoading: true,
          isEnd: false,
          page: 0,
          commentIdsToShow: [action.payload.comment.id],
        });

        return currentState
          .set("commentStates", newCommentStates)
          .set("evaluationCommentHasError", false)
          .set("evaluationCommentIsLoading", false);
      });
    }

    case ACTION_TYPES.ARTICLE_SHOW_FAILED_TO_PEER_REVIEW_COMMENT_SUBMIT: {
      return state.withMutations(currentState => {
        return currentState.set("evaluationCommentHasError", true).set("evaluationCommentIsLoading", false);
      });
    }

    case ACTION_TYPES.ARTICLE_SHOW_START_TO_GET_REVIEWS: {
      return state.withMutations(currentState => {
        return currentState.set("isEvaluationLoading", true).set("hasEvaluationError", false);
      });
    }

    case ACTION_TYPES.ARTICLE_SHOW_FAILED_TO_GET_REVIEWS: {
      return state.withMutations(currentState => {
        return currentState.set("isEvaluationLoading", false).set("hasEvaluationError", true);
      });
    }

    case ACTION_TYPES.SUCCEEDED_TO_FETCH_REVIEWS: {
      return state.withMutations(currentState => {
        const evaluations: IReviewsRecord = action.payload.evaluations;
        const evaluationIds = evaluations.map(evaluation => evaluation.id).toList();

        return currentState
          .set("evaluationPage", action.payload.nextPage)
          .set("evaluationIsEnd", action.payload.isEnd)
          .set("evaluationIdsToShow", evaluationIds)
          .set("isEvaluationLoading", false)
          .set("hasEvaluationError", false);
      });
    }

    case ACTION_TYPES.ARTICLE_SHOW_START_TO_GET_COMMENTS: {
      const targetStateKey = state.commentStates.findKey(
        commentState => commentState.evaluationId === action.payload.evaluationId,
      );

      if (targetStateKey === undefined) {
        const newCommentStates = state.commentStates.push({
          evaluationId: action.payload.evaluationId,
          isLoading: true,
          isEnd: false,
          page: 0,
          commentIdsToShow: [],
        });
        return state.set("commentStates", newCommentStates);
      } else {
        const targetState = state.commentStates.get(targetStateKey);
        const newState = {
          ...targetState,
          ...{
            isLoading: true,
          },
        };
        return state.setIn(["commentStates", targetStateKey], newState);
      }
    }

    case ACTION_TYPES.SUCCEEDED_TO_FETCH_COMMENTS: {
      const targetStateKey = state.commentStates.findKey(
        commentState => commentState.evaluationId === action.payload.evaluationId,
      );
      const targetState = state.commentStates.get(targetStateKey);
      const newCommentIds = action.payload.comments.map((comment: ICommentRecord) => comment.id).toArray();

      const newState = {
        ...targetState,
        ...{
          isLoading: false,
          page: action.payload.currentPage,
          commentIdsToShow: targetState.commentIdsToShow.concat(newCommentIds),
        },
      };

      return state.setIn(["commentStates", targetStateKey], newState);
    }

    case ACTION_TYPES.ARTICLE_SHOW_FAILED_TO_GET_REVIEWS: {
      const targetStateKey = state.commentStates.findKey(
        commentState => commentState.evaluationId === action.payload.evaluationId,
      );

      const targetState = state.commentStates.get(targetStateKey);

      const newState = {
        ...targetState,
        ...{
          isLoading: false,
        },
      };

      return state.setIn(["commentStates", targetStateKey], newState);
    }

    case ACTION_TYPES.ARTICLE_SHOW_OPEN_AUTHOR_LIST: {
      return state.set("isAuthorListOpen", true);
    }

    case ACTION_TYPES.ARTICLE_SHOW_CLOSE_AUTHOR_LIST: {
      return state.set("isAuthorListOpen", false);
    }

    case ACTION_TYPES.GLOBAL_LOCATION_CHANGE: {
      return ARTICLE_SHOW_INITIAL_STATE;
    }

    default:
      return state;
  }
}
