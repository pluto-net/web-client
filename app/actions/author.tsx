import axios, { CancelToken } from 'axios';
import { normalize } from 'normalizr';
import { Dispatch } from 'redux';
import { ActionCreators } from './actionTypes';
import alertToast from '../helpers/makePlutoToastAction';
import PlutoAxios from '../api/pluto';
import AuthorAPI, { DEFAULT_AUTHOR_PAPERS_SIZE } from '../api/author';
import ProfileInfoAPI, { AwardParams, EducationParams, ExperienceParams } from '../api/profileInfo';
import { GetAuthorPapersParams } from '../api/author/types';
import { Paper, paperSchema } from '../model/paper';
import { CVInfoType } from '../model/profileInfo';
import { CurrentUser } from '../model/currentUser';
import { AUTHOR_PAPER_LIST_SORT_TYPES } from '../components/common/sortBox';
import { getAuthor, getCoAuthors, getAuthorPapers } from '../containers/authorShow/actions';
import { CommonError } from '../model/error';
import { AppThunkAction } from '../store/types';
import { addProfileEntities } from '../reducers/profileEntity';

interface AddRemovePapersAndFetchPapersParams {
  authorId: string;
  papers: Paper[];
  currentUser: CurrentUser;
  cancelToken: CancelToken;
}

interface FetchAuthorShowRelevantDataParams {
  authorId: string;
  page?: number;
  sort?: AUTHOR_PAPER_LIST_SORT_TYPES;
}

export function fetchAuthorPapers(params: GetAuthorPapersParams) {
  return async (dispatch: Dispatch<any>) => {
    await dispatch(
      getAuthorPapers({
        authorId: params.authorId,
        query: params.query,
        size: params.size,
        page: params.page,
        sort: params.sort,
        cancelToken: params.cancelToken,
      })
    );
  };
}

export function fetchAuthorShowRelevantData(params: FetchAuthorShowRelevantDataParams): AppThunkAction {
  return async (dispatch: Dispatch<any>, getState) => {
    const { currentUser } = getState();
    const { authorId } = params;

    try {
      dispatch(ActionCreators.startToLoadAuthorShowPageData());
      const isMine =
        currentUser && currentUser.isLoggedIn && currentUser.isAuthorConnected && currentUser.authorId === authorId;

      const promiseArr = [];
      promiseArr.push(dispatch(getAuthor(authorId)));
      promiseArr.push(dispatch(getCoAuthors(authorId)));
      promiseArr.push(
        dispatch(
          fetchAuthorPapers({
            authorId,
            size: DEFAULT_AUTHOR_PAPERS_SIZE,
            page: params.page ? params.page : 1,
            sort: isMine ? 'RECENTLY_ADDED' : 'NEWEST_FIRST',
          })
        )
      );

      await Promise.all(promiseArr);

      dispatch(ActionCreators.finishToLoadAuthorShowPageData());
    } catch (err) {
      if (!axios.isCancel(err)) {
        const error = PlutoAxios.getGlobalError(err);
        console.error(`Error for fetching author show page data`, error);
        dispatch(ActionCreators.failedToLoadAuthorShowPageData({ statusCode: (error as CommonError).status }));
      }
    }
  };
}

export async function postNewAuthorCVInfo(
  type: keyof CVInfoType,
  profileSlug: string,
  params: AwardParams | EducationParams | ExperienceParams
) {
  try {
    if (type === 'awards') {
      return await ProfileInfoAPI.postNewAwardInAuthor(profileSlug, params as AwardParams);
    } else if (type === 'educations') {
      return await ProfileInfoAPI.postNewEducationInAuthor(profileSlug, params as EducationParams);
    } else if (type === 'experiences') {
      return await ProfileInfoAPI.postNewExperienceInAuthor(profileSlug, params as ExperienceParams);
    }
  } catch (err) {
    alertToast({
      type: 'error',
      message: `Had an error to add ${type} data.`,
    });
  }
}

export async function removeAuthorCvInfo(type: keyof CVInfoType, id: string) {
  try {
    if (type === 'awards') {
      return await ProfileInfoAPI.deleteAwardInAuthor(id);
    } else if (type === 'educations') {
      return await ProfileInfoAPI.deleteEducationInAuthor(id);
    } else if (type === 'experiences') {
      return await ProfileInfoAPI.deleteExperienceInAuthor(id);
    }
  } catch (err) {
    alertToast({
      type: 'error',
      message: `Had an error to delete ${type} data.`,
    });
  }
}

export async function updateAuthorCvInfo(
  type: keyof CVInfoType,
  params: AwardParams | EducationParams | ExperienceParams
) {
  if (type === 'awards') {
    return await ProfileInfoAPI.updateAwardInAuthor(params as AwardParams);
  } else if (type === 'educations') {
    return await ProfileInfoAPI.updateEducationInAuthor(params as EducationParams);
  } else if (type === 'experiences') {
    return await ProfileInfoAPI.updateExperienceInAuthor(params as ExperienceParams);
  }
}

export function updateProfileImage(profileSlug: string, formData: FormData) {
  return async (dispatch: Dispatch<any>) => {
    try {
      const normalizedProfile = await AuthorAPI.updateAuthorProfileImage(profileSlug, formData);
      dispatch(addProfileEntities(normalizedProfile.entities));
    } catch (err) {
      const error = PlutoAxios.getGlobalError(err);
      alertToast({ type: 'error', message: error.message });
    }
  };
}

function addPaperToAuthorPaperList(authorId: string, papers: Paper[], cancelToken: CancelToken) {
  return async (dispatch: Dispatch<any>) => {
    const paperIds = papers.map(paper => paper.id);
    dispatch(ActionCreators.startToAddPaperToAuthorPaperList());

    await AuthorAPI.addPapersToAuthorPaperList(authorId, paperIds, cancelToken);

    // HACK: you should normalize papers in API level
    const normalizedPapers = normalize(papers, [paperSchema]);
    dispatch(ActionCreators.addEntity(normalizedPapers));
    dispatch(ActionCreators.succeededToAddPaperToAuthorPaperList());
  };
}

export function addPapersAndFetchPapers(params: AddRemovePapersAndFetchPapersParams) {
  return async (dispatch: Dispatch<any>) => {
    try {
      await dispatch(addPaperToAuthorPaperList(params.authorId, params.papers, params.cancelToken));
      await dispatch(
        fetchAuthorShowRelevantData({
          authorId: params.authorId,
        })
      );
    } catch (err) {
      dispatch(ActionCreators.failedToAddPaperToAuthorPaperList());
    }
  };
}

export function removePaperFromPaperList(params: AddRemovePapersAndFetchPapersParams) {
  return async (dispatch: Dispatch<any>) => {
    const paper = params.papers[0];

    try {
      await AuthorAPI.removeAuthorPapers(params.authorId, [paper.id]);
      await dispatch(
        fetchAuthorShowRelevantData({
          authorId: params.authorId,
        })
      );
    } catch (err) {
      const error = PlutoAxios.getGlobalError(err);
      console.error(error);
      alertToast({
        type: 'error',
        message: 'Had an error to remove publication',
      });
    }
  };
}

export function updateRepresentativePapers(authorId: string, papers: Paper[]) {
  return async (dispatch: Dispatch<any>) => {
    await AuthorAPI.updateRepresentativePapers({
      authorId,
      paperIds: papers.map(paper => paper.id),
    });

    dispatch(
      ActionCreators.succeedToUpdateAuthorRepresentativePapers({
        authorId,
        papers,
      })
    );
  };
}
