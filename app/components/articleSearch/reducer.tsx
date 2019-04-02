import { ACTION_TYPES } from "../../actions/actionTypes";
import { ARTICLE_SEARCH_INITIAL_STATE, ArticleSearchState } from "./records";
import { SearchResult } from "../../api/search";
import { ChangeRangeInputParams, FILTER_TYPE_HAS_RANGE, FILTER_RANGE_TYPE } from "../../constants/paperSearch";
import { AddPaperToCollectionParams, RemovePapersFromCollectionParams } from "../../api/collection";
import { Paper } from "../../model/paper";
import { Filter, RawFilter } from "../../api/member";
import { isEqual } from "lodash";
import { objectifyRawFilterList } from "../../helpers/FilterObjectGenerator";
import { LOCAL_STORAGE_FILTERS } from "./constants";
const store = require("store");

export function reducer(
  state: ArticleSearchState = ARTICLE_SEARCH_INITIAL_STATE,
  action: ReduxAction<any>
): ArticleSearchState {
  switch (action.type) {
    case ACTION_TYPES.ARTICLE_SEARCH_TOGGLE_EXPANDING_FILTER_BOX: {
      return { ...state, isJournalFilterExpanding: !state.isJournalFilterExpanding };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_CHANGE_SEARCH_INPUT: {
      return { ...state, searchInput: action.payload.searchInput };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_START_TO_GET_PAPERS: {
      const filters = action.payload.filters;

      return {
        ...state,
        isContentLoading: true,
        isFilterLoading: true,
        pageErrorCode: null,
        searchFromSuggestion: false,
        searchInput: action.payload.query,
        sort: action.payload.sort,
        yearFilterFromValue: filters.yearFrom || 0,
        yearFilterToValue: filters.yearTo || 0,
        fosFilter: filters.fos || [],
        journalFilter: filters.journal || [],
        suggestionKeyword: "",
        highlightedSuggestionKeyword: "",
      };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_SUCCEEDED_TO_GET_PAPERS: {
      const payload: SearchResult = action.payload;

      const sortedFosList = payload.data.aggregation.fosList.sort((a, b) => {
        if (state.fosFilter.includes(a.id) && !state.fosFilter.includes(b.id)) {
          return -1;
        } else if (!state.fosFilter.includes(a.id) && state.fosFilter.includes(b.id)) {
          return 1;
        } else {
          return 0;
        }
      });

      const sortedJournals = payload.data.aggregation.journals.sort((a, b) => {
        if (state.journalFilter.includes(a.id) && !state.journalFilter.includes(b.id)) {
          return -1;
        } else if (!state.journalFilter.includes(a.id) && state.journalFilter.includes(b.id)) {
          return 1;
        } else {
          return 0;
        }
      });

      const journalFilterObject = payload.data.aggregation.journals.filter(journal =>
        state.journalFilter.includes(journal.id)
      );
      const fosFilterObject = payload.data.aggregation.fosList.filter(fos => state.fosFilter.includes(fos.id));

      if (payload.data.page) {
        return {
          ...state,
          isContentLoading: false,
          isFilterLoading: false,
          pageErrorCode: null,
          isEnd: payload.data.page.last,
          page: payload.data.page.page,
          totalElements: payload.data.page.totalElements,
          totalPages: payload.data.page.totalPages,
          searchItemsToShow: payload.data.content,
          suggestionKeyword: payload.data.suggestion ? payload.data.suggestion.suggestQuery : "",
          highlightedSuggestionKeyword: payload.data.suggestion ? payload.data.suggestion.highlighted : "",
          searchFromSuggestion: payload.data.resultModified,
          aggregationData: { ...payload.data.aggregation, journals: sortedJournals, fosList: sortedFosList },
          journalFilterObject,
          fosFilterObject,
          matchAuthors: payload.data.matchedAuthor,
        };
      }

      return state;
    }

    case ACTION_TYPES.ARTICLE_SEARCH_FAILED_TO_GET_PAPERS: {
      return { ...state, isContentLoading: false, isFilterLoading: false, pageErrorCode: action.payload.statusCode };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_START_TO_GET_REFERENCE_PAPERS:
    case ACTION_TYPES.ARTICLE_SEARCH_START_TO_GET_CITED_PAPERS: {
      return { ...state, isContentLoading: true, isFilterLoading: false, pageErrorCode: null };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_SUCCEEDED_TO_GET_REFERENCE_PAPERS:
    case ACTION_TYPES.ARTICLE_SEARCH_SUCCEEDED_TO_GET_CITED_PAPERS: {
      return {
        ...state,
        isEnd: action.payload.isEnd,
        page: action.payload.nextPage,
        searchItemsToShow: action.payload.papers,
        totalElements: action.payload.totalElements,
        totalPages: action.payload.totalPages,
        isContentLoading: false,
        isFilterLoading: false,
        pageErrorCode: null,
      };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_FAILED_TO_GET_REFERENCE_PAPERS:
    case ACTION_TYPES.ARTICLE_SEARCH_FAILED_TO_GET_CITED_PAPERS: {
      return { ...state, isContentLoading: false, isFilterLoading: false };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_CHANGE_FILTER_RANGE_INPUT: {
      const payload: ChangeRangeInputParams = action.payload;

      if (payload.type === FILTER_TYPE_HAS_RANGE.PUBLISHED_YEAR) {
        if (payload.rangeType === FILTER_RANGE_TYPE.FROM && payload.numberValue) {
          return { ...state, yearFilterFromValue: payload.numberValue };
        } else if (payload.rangeType === FILTER_RANGE_TYPE.TO && payload.numberValue) {
          return { ...state, yearFilterToValue: payload.numberValue };
        } else {
          return state;
        }
      } else {
        return state;
      }
    }

    case ACTION_TYPES.GLOBAL_SUCCEEDED_ADD_PAPER_TO_COLLECTION: {
      const payload: AddPaperToCollectionParams = action.payload;

      const newSavedInCollection = payload.collection;
      const paperId = payload.paperId;

      const newSearchItemsToShow: Paper[] = state.searchItemsToShow.map(paper => {
        if (paper.id === paperId) {
          const newPaper = {
            ...paper,
            relation: {
              savedInCollections:
                !!paper.relation && paper.relation.savedInCollections.length >= 1
                  ? [newSavedInCollection, ...paper.relation.savedInCollections]
                  : [newSavedInCollection],
            },
          };
          return newPaper;
        } else {
          return paper;
        }
      });

      return { ...state, searchItemsToShow: newSearchItemsToShow };
    }

    case ACTION_TYPES.GLOBAL_SUCCEEDED_REMOVE_PAPER_FROM_COLLECTION: {
      const payload: RemovePapersFromCollectionParams = action.payload;

      const removedSavedInCollection = payload.collection;
      const paperId = payload.paperIds[0];

      const newSearchItemsToShow: Paper[] = state.searchItemsToShow.map(paper => {
        if (paper.id === paperId) {
          const savedInCollection = paper.relation.savedInCollections;

          const removedIndex: number = savedInCollection
            .map(data => {
              return data.id;
            })
            .indexOf(removedSavedInCollection.id);

          const newPaper = {
            ...paper,
            relation: {
              savedInCollections: [
                ...savedInCollection.slice(0, removedIndex),
                ...savedInCollection.slice(removedIndex + 1, savedInCollection.length),
              ],
            },
          };

          return newPaper;
        } else {
          return paper;
        }
      });

      return { ...state, searchItemsToShow: newSearchItemsToShow };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_START_TO_PUT_CURRENT_USER_FILTERS: {
      return { ...state, isFilterSaveBoxLoading: true };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_FAILED_TO_PUT_CURRENT_USER_FILTERS: {
      return { ...state, isFilterSaveBoxLoading: false };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_SUCCEEDED_TO_GET_CURRENT_USER_FILTERS: {
      const rawFilterList: RawFilter[] = action.payload.rawFilter;
      const localRawFilterList: RawFilter[] = store.get(LOCAL_STORAGE_FILTERS);

      const fetchedFilterList = objectifyRawFilterList(rawFilterList);
      const localFilterList = objectifyRawFilterList(localRawFilterList);

      const localOnlyFilters = localFilterList.filter(
        localFilter => !fetchedFilterList.some(fetchedFilter => isEqual(fetchedFilter.filter, localFilter.filter))
      );

      store.set(LOCAL_STORAGE_FILTERS, []);

      return { ...state, myFilters: [...fetchedFilterList, ...localOnlyFilters] };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_SUCCEEDED_TO_PUT_CURRENT_USER_FILTERS: {
      const payload: RawFilter[] = action.payload;
      const migrationFilters = objectifyRawFilterList(payload);

      return { ...state, myFilters: migrationFilters, isFilterSaveBoxLoading: false };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_SET_FILTER_IN_FILTER_SET: {
      const payload: Filter | null = action.payload;

      return { ...state, selectedFilter: payload };
    }

    case ACTION_TYPES.AUTH_SUCCEEDED_TO_SIGN_OUT: {
      return { ...state, selectedFilter: null };
    }

    default: {
      return state;
    }
  }
}
