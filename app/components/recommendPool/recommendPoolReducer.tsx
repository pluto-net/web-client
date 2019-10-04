import { createSlice, PayloadAction } from 'redux-starter-kit';
import { uniqWith, isEqual } from 'lodash';
import ActionTicketManager from '../../helpers/actionTicketManager';
import { RECOMMENDED_PAPER_LOGGING_FOR_NON_USER } from './recommendPoolConstants';
import { RecommendationAction } from '../../api/recommendation';
const store = require('store');

export interface RecommendPoolState {
  isOpen: boolean;
  actionArea: string;
  tempRecActionLogs: RecommendationAction[];
}

export const RECOMMEND_POOL_INITIAL_STATE: RecommendPoolState = {
  isOpen: false,
  actionArea: '',
  tempRecActionLogs: store.get(RECOMMENDED_PAPER_LOGGING_FOR_NON_USER) || [],
};

const recommendPoolSlice = createSlice({
  slice: 'recommendPool',
  initialState: RECOMMEND_POOL_INITIAL_STATE,
  reducers: {
    addPaperToTempPool: (state, action: PayloadAction<{ recAction: RecommendationAction }>) => {
      const newRecActionLogs = uniqWith([action.payload.recAction, ...state.tempRecActionLogs], isEqual).slice(0, 20);
      state.tempRecActionLogs = newRecActionLogs;
      store.set(RECOMMENDED_PAPER_LOGGING_FOR_NON_USER, newRecActionLogs);
    },
    openRecommendPapersDialog(
      state,
      action: PayloadAction<{
        pageType: Scinapse.ActionTicket.PageType;
        actionArea: string;
      }>
    ) {
      ActionTicketManager.trackTicket({
        pageType: action.payload.pageType,
        actionType: 'view',
        actionArea: 'knowledgeBaseNoti',
        actionTag: 'viewKnowledgeBaseNoti',
        actionLabel: action.payload.actionArea,
      });
      state.isOpen = true;
      state.actionArea = action.payload.actionArea;
    },
    closeRecommendPapersDialog(state) {
      state.isOpen = false;
      state.actionArea = '';
    },
  },
});

export const { addPaperToTempPool, openRecommendPapersDialog, closeRecommendPapersDialog } = recommendPoolSlice.actions;

export default recommendPoolSlice.reducer;
