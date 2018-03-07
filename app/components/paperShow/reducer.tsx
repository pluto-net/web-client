import { List } from "immutable";
import { IReduxAction } from "../../typings/actionType";
import { ACTION_TYPES } from "../../actions/actionTypes";
import { PAPER_SHOW_INITIAL_STATE, PaperShowStateRecord, RelatedPaperMetaFactory } from "./records";
import { GetCommentsResult } from "../../api/types/comment";
import { PaperRecord } from "../../model/paper";

export function reducer(state = PAPER_SHOW_INITIAL_STATE, action: IReduxAction<any>): PaperShowStateRecord {
  switch (action.type) {
    case ACTION_TYPES.PAPER_SHOW_SUCCEEDED_TO_GET_PAPER: {
      return state.withMutations(currentState => {
        return currentState
          .set("hasErrorOnFetchingPaper", false)
          .set("isLoadingPaper", false)
          .set("paper", action.payload.paper);
      });
    }

    case ACTION_TYPES.PAPER_SHOW_START_TO_GET_PAPER: {
      return state.withMutations(currentState => {
        return currentState.set("hasErrorOnFetchingPaper", false).set("isLoadingPaper", true);
      });
    }

    case ACTION_TYPES.PAPER_SHOW_FAILED_TO_GET_PAPER: {
      return state.withMutations(currentState => {
        return currentState
          .set("hasErrorOnFetchingPaper", true)
          .set("isLoadingPaper", false)
          .set("paper", null);
      });
    }

    case ACTION_TYPES.PAPER_SHOW_SUCCEEDED_TO_GET_COMMENTS: {
      return state.withMutations(currentState => {
        const response: GetCommentsResult = action.payload.commentsResponse;

        return currentState
          .set("hasErrorOnFetchingComments", false)
          .set("isLoadingComments", false)
          .set("currentCommentPage", response.number)
          .set("commentTotalPage", response.totalPages)
          .set("comments", response.comments);
      });
    }

    case ACTION_TYPES.PAPER_SHOW_START_TO_GET_COMMENTS: {
      return state.withMutations(currentState => {
        return currentState.set("hasErrorOnFetchingComments", false).set("isLoadingComments", true);
      });
    }

    case ACTION_TYPES.PAPER_SHOW_FAILED_TO_GET_COMMENTS: {
      return state.withMutations(currentState => {
        return currentState
          .set("hasErrorOnFetchingComments", true)
          .set("isLoadingComments", false)
          .set("comments", null);
      });
    }

    case ACTION_TYPES.PAPER_SHOW_CHANGE_COMMENT_INPUT: {
      return state.set("commentInput", action.payload.comment);
    }

    case ACTION_TYPES.PAPER_SHOW_START_TO_POST_COMMENT: {
      return state.withMutations(currentState => {
        return currentState.set("isPostingComment", true).set("isFailedToPostingComment", false);
      });
    }

    case ACTION_TYPES.PAPER_SHOW_SUCCEEDED_TO_POST_COMMENT: {
      return state.withMutations(currentState => {
        return currentState
          .set("isPostingComment", false)
          .set("isFailedToPostingComment", false)
          .set("comments", currentState.comments.unshift(action.payload.comment))
          .set("commentInput", "");
      });
    }

    case ACTION_TYPES.PAPER_SHOW_FAILED_TO_POST_COMMENT: {
      return state.withMutations(currentState => {
        return currentState.set("isPostingComment", false).set("isFailedToPostingComment", true);
      });
    }

    case ACTION_TYPES.PAPER_SHOW_START_TO_GET_RELATED_PAPERS: {
      return state.withMutations(currentState => {
        return currentState
          .set("isLoadingRelatedPapers", true)
          .set("isFailedToGetRelatedPapers", false)
          .set("relatedPapersMeta", List());
      });
    }

    case ACTION_TYPES.PAPER_SHOW_SUCCEEDED_TO_GET_RELATED_PAPERS: {
      return state.withMutations(currentState => {
        const relatedPapersMeta = List(
          action.payload.papers.map((paper: PaperRecord) => RelatedPaperMetaFactory(paper.id)),
        );

        return currentState
          .set("isLoadingRelatedPapers", false)
          .set("isFailedToGetRelatedPapers", false)
          .set("relatedPaperTotalPage", action.payload.totalPages)
          .set("relatedPaperCurrentPage", action.payload.currentPage)
          .set("relatedPapersMeta", relatedPapersMeta)
          .set("relatedPapers", action.payload.papers);
      });
    }

    case ACTION_TYPES.PAPER_SHOW_FAILED_TO_GET_RELATED_PAPERS: {
      return state.withMutations(currentState => {
        return currentState.set("isLoadingRelatedPapers", false).set("isFailedToGetRelatedPapers", true);
      });
    }

    case ACTION_TYPES.PAPER_SHOW_TOGGLE_ABSTRACT: {
      const targetMetaIndex = state.relatedPapersMeta.findIndex(meta => meta.paperId === action.payload.paperId);

      if (targetMetaIndex < 0) {
        return state;
      }

      const currentValue = state.getIn(["relatedPapersMeta", targetMetaIndex, "isAbstractOpen"]);
      return state.setIn(["relatedPapersMeta", targetMetaIndex, "isAbstractOpen"], !currentValue);
    }

    case ACTION_TYPES.PAPER_SHOW_TOGGLE_AUTHORS: {
      const targetMetaIndex = state.relatedPapersMeta.findIndex(meta => meta.paperId === action.payload.paperId);

      if (targetMetaIndex < 0) {
        return state;
      }

      const currentValue = state.getIn(["relatedPapersMeta", targetMetaIndex, "isAuthorsOpen"]);
      return state.setIn(["relatedPapersMeta", targetMetaIndex, "isAuthorsOpen"], !currentValue);
    }

    case ACTION_TYPES.PAPER_SHOW_VISIT_TITLE: {
      const targetMetaIndex = state.relatedPapersMeta.findIndex(meta => meta.paperId === action.payload.paperId);

      if (targetMetaIndex < 0) {
        return state;
      }

      return state.setIn(["relatedPapersMeta", targetMetaIndex, "isTitleVisited"], true);
    }

    case ACTION_TYPES.PAPER_SHOW_CLOSE_FIRST_OPEN: {
      const targetMetaIndex = state.relatedPapersMeta.findIndex(meta => meta.paperId === action.payload.paperId);

      if (targetMetaIndex < 0) {
        return state;
      }

      return state.setIn(["relatedPapersMeta", targetMetaIndex, "isFirstOpen"], false);
    }

    case ACTION_TYPES.PAPER_SHOW_CLEAR_PAPER_SHOW_STATE: {
      return PAPER_SHOW_INITIAL_STATE;
    }

    default:
      return state;
  }
}
