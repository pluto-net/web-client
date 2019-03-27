import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router";
import { isEqual, findIndex } from "lodash";
import Popper from "@material-ui/core/Popper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { withStyles } from "../../../helpers/withStylesHelper";
import { ArticleSearchState } from "../../../components/articleSearch/records";
import { Filter } from "../../../api/member";
import {
  setSavedFilterSet,
  putCurrentUserFilters,
  putLocalStorageFilters,
} from "../../../components/articleSearch/actions";
import PapersQueryFormatter from "../../../helpers/papersQueryFormatter";
import getQueryParamsObject from "../../../helpers/getQueryParamsObject";
import SavedFilterItem from "../savedFilterItem";
import newFilterSetTitleGenerator from "../../../helpers/newFilterSetTitleGenerator";
import FilterTitleBox from "./titleBox";
import { CurrentUser } from "../../../model/currentUser";
import Icon from "../../../icons";
import { openSignIn } from "../../../components/dialog/actions";
const styles = require("./filterSaveBox.scss");

interface FilterSaveBoxProps {
  articleSearchState: ArticleSearchState;
  currentUserState: CurrentUser;
  dispatch: Dispatch<any>;
}

const FilterSaveBox: React.FunctionComponent<FilterSaveBoxProps & RouteComponentProps<any>> = props => {
  const { articleSearchState, currentUserState, dispatch, history, location } = props;
  const { savedFilterSet, myFilters, searchInput, sort } = articleSearchState;

  let popoverAnchorEl: HTMLDivElement | null;

  const [isOpen, setIsOpen] = React.useState(false);
  const [isChange, setIsChange] = React.useState(false);

  const rawQueryParamsObj = getQueryParamsObject(location.search);

  React.useEffect(
    () => {
      const currentFilter = PapersQueryFormatter.objectifyPapersFilter(rawQueryParamsObj.filter);
      const savedFilter = !!savedFilterSet
        ? PapersQueryFormatter.objectifyPapersFilter(savedFilterSet.filter)
        : PapersQueryFormatter.objectifyPapersFilter();

      if (isEqual(savedFilter, currentFilter)) {
        setIsChange(false);
      } else {
        setIsChange(true);
      }
    },
    [props.location, savedFilterSet]
  );

  function newFiltersGenerator(changedFilterIndex: number | undefined, changedFilter: Filter) {
    const newFilters =
      changedFilterIndex !== undefined && changedFilterIndex >= 0
        ? [
            changedFilter,
            ...myFilters.slice(0, changedFilterIndex),
            ...myFilters.slice(changedFilterIndex + 1, myFilters.length),
          ]
        : [changedFilter, ...myFilters];

    return newFilters;
  }

  function handleClickSaveChangesBtn(changedFilterReq: Filter | string, currentSavedFilterSet: Filter) {
    const changedFilter =
      typeof changedFilterReq === "string" ? { ...currentSavedFilterSet, filter: changedFilterReq } : changedFilterReq;

    const changedFilterIndex = !!savedFilterSet ? findIndex(myFilters, savedFilterSet) : undefined;

    const newFilters = newFiltersGenerator(changedFilterIndex, changedFilter);
    if (currentUserState.isLoggedIn) {
      dispatch(putCurrentUserFilters(newFilters));
    } else {
      dispatch(putLocalStorageFilters(newFilters));
    }
    dispatch(setSavedFilterSet(changedFilter));
  }

  function handleClickCreateNewFilterBtn(changedFilterReq: Filter | string) {
    if (myFilters.length === 5 && !currentUserState.isLoggedIn) {
      return dispatch(openSignIn());
    }

    const baseEmojis = ["🐺", "🐶", "🦊", "🐱", "🦌", "🦒", "🐹", "🐰"];
    const randomEmoji = baseEmojis[Math.floor(Math.random() * baseEmojis.length)];

    const changedFilter =
      typeof changedFilterReq === "string"
        ? {
            name: newFilterSetTitleGenerator({
              fos: articleSearchState.fosFilterObject,
              journal: articleSearchState.journalFilterObject,
              yearFrom: articleSearchState.yearFilterFromValue,
              yearTo: articleSearchState.yearFilterToValue,
            }),
            emoji: randomEmoji,
            filter: changedFilterReq,
          }
        : changedFilterReq;

    const newFilters = newFiltersGenerator(undefined, changedFilter);

    if (currentUserState.isLoggedIn) {
      dispatch(putCurrentUserFilters(newFilters));
    } else {
      dispatch(putLocalStorageFilters(newFilters));
    }
    dispatch(setSavedFilterSet(changedFilter));
  }

  function handleClickFilterItem(
    query: string,
    currentSort: Scinapse.ArticleSearch.SEARCH_SORT_OPTIONS,
    filter: Filter | null
  ) {
    dispatch(setSavedFilterSet(!!filter ? filter : null));
    history.push({
      pathname: "/search",
      search: PapersQueryFormatter.stringifyPapersQuery({
        query,
        page: 1,
        sort: currentSort,
        filter: !!filter ? PapersQueryFormatter.objectifyPapersFilter(filter.filter) : {},
      }),
    });
    setIsOpen(false);
  }

  function handleClickDeleteButton(deleteIndex: number) {
    const newFilters = [...myFilters.slice(0, deleteIndex), ...myFilters.slice(deleteIndex + 1, myFilters.length)];

    if (currentUserState.isLoggedIn) {
      dispatch(putCurrentUserFilters(newFilters));
    } else {
      dispatch(putLocalStorageFilters(newFilters));
    }

    if (!!savedFilterSet && findIndex(newFilters, savedFilterSet) === -1) {
      dispatch(setSavedFilterSet(null));
    }
  }

  const filterItems =
    !!myFilters && myFilters.length > 0
      ? myFilters.map((filter, index) => {
          return (
            <SavedFilterItem
              searchInput={searchInput}
              sort={sort}
              savedFilter={filter}
              onClickFilterItem={handleClickFilterItem}
              onClickDeleteBtn={() => handleClickDeleteButton(index)}
              key={index}
            />
          );
        })
      : null;

  return (
    <ClickAwayListener
      onClickAway={() => {
        setIsOpen(false);
      }}
    >
      <div ref={el => (popoverAnchorEl = el)}>
        <FilterTitleBox
          hasFilterChanged={isChange}
          isDropdownOpen={isOpen}
          onClickDropdownOpen={setIsOpen}
          onClickSaveChangesBtn={handleClickSaveChangesBtn}
          onClickCreateNewFilterBtn={handleClickCreateNewFilterBtn}
          onClickFilterItem={handleClickFilterItem}
          articleSearchState={articleSearchState}
        />
        <Popper
          open={isOpen}
          anchorEl={popoverAnchorEl!}
          placement="bottom-end"
          disablePortal={true}
          modifiers={{ flip: { enabled: false } }}
          style={{ width: "100%", position: "absolute", backgroundColor: "white", zIndex: 99 }}
        >
          <ul className={styles.popperWrapper}>
            <li onClick={() => handleClickFilterItem(searchInput, sort, null)} className={styles.filterItemWrapper}>
              <div className={styles.defaultFilterItem}>
                <Icon icon="DEFAULT" className={styles.defaultFilterItemIcon} />
                <span className={styles.defaultFilterItemTitle}>All Result (Default)</span>
              </div>
            </li>
            {filterItems}
          </ul>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default withRouter(connect()(withStyles<typeof FilterSaveBox>(styles)(FilterSaveBox)));
