import {
  DUMMY_TEST,
  EMAIL_RECOMMEND_PAPER_SIGN_UP_BANNER,
  COLLECTION_BUTTON_TEXT_EXPERIMENT,
} from './abTestGlobalValue';
import { dummy, emailRecommendPaperSignUpBanner, collectionButtonText } from './abTestObject';

export interface UserGroup<N = string> {
  groupName: N;
  weight: number;
}

export interface Test<N = string> {
  name: ABTest;
  userGroup: UserGroup<N>[];
}

export type ABTest =
  | typeof DUMMY_TEST
  | typeof EMAIL_RECOMMEND_PAPER_SIGN_UP_BANNER
  | typeof COLLECTION_BUTTON_TEXT_EXPERIMENT;

export interface SignUpConversionExpTicketContext {
  pageType: Scinapse.ActionTicket.PageType;
  actionArea: Scinapse.ActionTicket.ActionArea | Scinapse.ActionTicket.PageType | null;
  actionLabel: string | null;
  expName?: string;
}

export const LIVE_TESTS: Test[] = [dummy, emailRecommendPaperSignUpBanner, collectionButtonText];

function getRandomPool(): { [key: string]: string[] } {
  const randomPool: { [key: string]: string[] } = {};

  LIVE_TESTS.forEach(test => {
    const testGroupWeightedPool: string[] = [];
    test.userGroup.forEach(group => {
      for (let i = 0; i < group.weight; i++) {
        testGroupWeightedPool.push(group.groupName);
      }
    });

    randomPool[test.name] = testGroupWeightedPool;
  });

  return randomPool;
}

const RANDOM_POOL = getRandomPool();

export function getRandomUserGroup(testName: string): string {
  const testGroupWeightedPool = RANDOM_POOL[testName];
  return testGroupWeightedPool[Math.floor(Math.random() * testGroupWeightedPool.length)];
}
