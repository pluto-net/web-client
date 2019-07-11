import { AggregationData } from '../model/aggregation';
import { ACTION_TYPES, SearchActions } from '../actions/actionTypes';
import { FILTER_BUTTON_TYPE } from '../components/filterButton';
import { JournalSuggestion } from '../api/completion';
import { toggleElementFromArray } from '../helpers/toggleElementFromArray';

export interface SearchFilterState extends AggregationData {
  activeButton: FILTER_BUTTON_TYPE | null;
  currentYearFrom: number | string;
  currentYearTo: number | string;
  selectedJournalIds: number[];
  selectedFOSIds: number[];
  addedJournals: JournalSuggestion[];
}

export const SEARCH_FILTER_INITIAL_STATE: SearchFilterState = {
  activeButton: null,
  currentYearFrom: '',
  currentYearTo: '',
  selectedJournalIds: [],
  selectedFOSIds: [],
  // data
  fosList: [],
  journals: [],
  yearAll: [],
  yearFiltered: [],
  addedJournals: [],
};

export function reducer(state = SEARCH_FILTER_INITIAL_STATE, action: SearchActions) {
  switch (action.type) {
    case ACTION_TYPES.ARTICLE_SEARCH_SUCCEEDED_TO_GET_PAPERS: {
      const { data } = action.payload;

      if (!data.aggregation) return state;

      return {
        ...state,
        ...data.aggregation,
      };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_SET_ACTIVE_FILTER_BOX_BUTTON: {
      return {
        ...state,
        activeButton: action.payload.button,
      };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_SYNC_FILTERS_WITH_QUERY_PARAMS: {
      const { filters } = action.payload;

      return {
        ...state,
        currentYearFrom: filters.yearFrom,
        currentYearTo: filters.yearTo,
        selectedJournalIds: filters.journal,
        selectedFOSIds: filters.fos,
      };
    }

    case ACTION_TYPES.ARTICLE_SEARCH_SELECT_JOURNAL_FILTER_ITEM: {
      return {
        ...state,
        selectedJournalIds: toggleElementFromArray(action.payload.journalId, state.selectedJournalIds),
      };
    }

    default:
      return state;
  }
}
