import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfilePaperListState {
  currentPage: number;
  paperIds: string[];
  maxPage: number;
  totalCount: number;
}

interface GetPapersPayload {
  paperIds: string[];
  totalPages: number;
  page: number;
  totalElements: number;
}

export const PROFILE_REPRESENTATIVE_PAPER_LIST_INITIAL_STATE: ProfilePaperListState = {
  paperIds: [],
  currentPage: 0,
  maxPage: 0,
  totalCount: 0,
};

const profileRepresentativePaperListSlice = createSlice({
  name: 'profileRepresentativePaperListSlice',
  initialState: PROFILE_REPRESENTATIVE_PAPER_LIST_INITIAL_STATE,
  reducers: {
    getRepresentativePapers(state, action: PayloadAction<GetPapersPayload>) {
      state.currentPage = action.payload.page;
      state.totalCount = action.payload.totalElements;
      state.maxPage = action.payload.totalPages;
      state.paperIds = action.payload.paperIds;
    },
    addRepresentativePapers(state, action: PayloadAction<{ paperIds: string[]; totalCount: number }>) {
      state.paperIds = Array.from(new Set([...action.payload.paperIds, ...state.paperIds]));
      state.totalCount = action.payload.totalCount;
    },
  },
});

export const { getRepresentativePapers, addRepresentativePapers } = profileRepresentativePaperListSlice.actions;

export default profileRepresentativePaperListSlice.reducer;
