jest.mock('../../../api/auth');
jest.mock('../../../helpers/makePlutoToastAction');
jest.mock('normalize.css', () => {});
jest.unmock('../actions');

import * as Actions from '../actions';
import { generateMockStore } from '../../../__tests__/mockStore';
import { ACTION_TYPES } from '../../../actions/actionTypes';
import { RAW } from '../../../__mocks__';

describe('auth actions', () => {
  let store: any;
  let tempWindowConfirmFunc: any;

  beforeAll(() => {
    tempWindowConfirmFunc = window.confirm;
  });

  afterAll(() => {
    window.confirm = tempWindowConfirmFunc;
  });

  beforeEach(() => {
    store = generateMockStore();
    store.clearActions();
  });

  describe('signOut action', () => {
    it('should return AUTH_SUCCEEDED_TO_SIGN_OUT action', async () => {
      window.confirm = jest.fn(() => true);
      await store.dispatch(Actions.signOut());
      const actions = store.getActions();

      expect(actions[0]).toEqual({
        type: ACTION_TYPES.AUTH_SUCCEEDED_TO_SIGN_OUT,
      });
    });
  });

  describe('checkLoggedIn action', () => {
    it('should return AUTH_SUCCEEDED_TO_CHECK_LOGGED_IN type action', async () => {
      await store.dispatch(Actions.checkAuthStatus());
      const actions = store.getActions();

      expect(actions[0].type).toEqual(ACTION_TYPES.AUTH_SUCCEEDED_TO_CHECK_LOGGED_IN);
    });

    it('should return recordifiedUser payload action', async () => {
      await store.dispatch(Actions.checkAuthStatus());
      const actions = store.getActions();
      const mockUser = RAW.MEMBER;

      expect(JSON.stringify(actions[0].payload.user)).toEqual(JSON.stringify(mockUser));
    });

    it('should return loggedIn payload action', async () => {
      await store.dispatch(Actions.checkAuthStatus());
      const actions = store.getActions();
      const mockLoggedIn = true;

      expect(actions[0].payload.loggedIn).toEqual(mockLoggedIn);
    });

    it('should return loggedIn payload action', async () => {
      await store.dispatch(Actions.checkAuthStatus());
      const actions = store.getActions();
      const mockOauthLoggedIn = false;

      expect(actions[0].payload.oauthLoggedIn).toEqual(mockOauthLoggedIn);
    });
  });
});
