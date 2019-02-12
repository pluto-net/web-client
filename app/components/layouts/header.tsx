import * as React from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { debounce } from "lodash";
import * as Cookies from "js-cookie";
import MenuItem from "@material-ui/core/MenuItem";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import * as addDays from "date-fns/add_days";
import * as isAfter from "date-fns/is_after";
import TopToastBar from "../topToastBar";
import BubblePopover from "../common/bubblePopover";
import { AppState } from "../../reducers";
import Icon from "../../icons";
import { signOut } from "../auth/actions";
import * as Actions from "./actions";
import { openSignIn, openSignUp } from "../dialog/actions";
import { trackAction, trackDialogView, trackEvent } from "../../helpers/handleGA";
import { HeaderProps } from "./types/header";
import { withStyles } from "../../helpers/withStylesHelper";
import EnvChecker from "../../helpers/envChecker";
import { UserDevice } from "./records";
import ActionTicketManager from "../../helpers/actionTicketManager";
import { getCurrentPageType } from "../locationListener";
import InputWithSuggestionList from "../common/InputWithSuggestionList";
import getQueryParamsObject from "../../helpers/getQueryParamsObject";
import SafeURIStringHandler from "../../helpers/safeURIStringHandler";
import { HOME_PATH } from "../../constants/routes";
import { ACTION_TYPES } from "../../actions/actionTypes";
import PapersQueryFormatter from "../../helpers/papersQueryFormatter";
import TabNavigationBar, { TabItem } from "../common/tabNavigationBar";
import CircularProgress from "@material-ui/core/CircularProgress";
const styles = require("./header.scss");

const HEADER_BACKGROUND_START_HEIGHT = 10;
const LAST_UPDATE_DATE = "2019-01-30T08:13:33.079Z";
let ticking = false;

function mapStateToProps(state: AppState) {
  return {
    currentUserState: state.currentUser,
    layoutState: state.layout,
    articleSearchState: state.articleSearch,
    authorSearchState: state.authorSearch,
  };
}

interface HeaderStates {
  isTop: boolean;
  isUserDropdownOpen: boolean;
  userDropdownAnchorElement: HTMLElement | null;
  openTopToast: boolean;
}

@withStyles<typeof Header>(styles)
class Header extends React.PureComponent<HeaderProps, HeaderStates> {
  private userDropdownAnchorRef: HTMLElement | null;

  constructor(props: HeaderProps) {
    super(props);

    this.state = {
      isTop: true,
      isUserDropdownOpen: false,
      userDropdownAnchorElement: this.userDropdownAnchorRef,
      openTopToast: false,
    };
  }

  public componentDidMount() {
    if (!EnvChecker.isOnServer()) {
      window.addEventListener("scroll", this.handleScrollEvent, { passive: true });
      this.checkTopToast();
    }
  }

  public componentWillUnmount() {
    if (!EnvChecker.isOnServer()) {
      const { dispatch } = this.props;
      dispatch(Actions.clearKeywordCompletion());
      window.removeEventListener("scroll", this.handleScrollEvent);
    }
  }

  public componentWillReceiveProps(nextProps: HeaderProps) {
    const { dispatch, location } = this.props;

    if (location !== nextProps.location) {
      dispatch(Actions.clearKeywordCompletion());
    }
  }

  public render() {
    const navClassName = this.getNavbarClassName();

    return (
      <nav className={`${navClassName} mui-fixed`}>
        <div className={styles.headerContainer}>
          {this.getHeaderLogo()}
          <div className={styles.leftBox} />
          {this.getSearchFormContainer()}
          {this.getHeaderButtons()}
        </div>
        {location.pathname === "/search" || location.pathname === "/search/authors"
          ? this.getTabNavigationInSearch()
          : null}
        {this.getToastBar()}
      </nav>
    );
  }

  private getTabNavigationInSearch = () => {
    const { articleSearchState, authorSearchState } = this.props;
    const authorEntitiesInArticleSearch = articleSearchState.matchAuthors;
    let tabNaviItems: TabItem[];
    let authorCount: number;

    if (location.pathname === "/search" && authorEntitiesInArticleSearch) {
      authorCount = authorEntitiesInArticleSearch.totalElements;
      tabNaviItems = this.getTabNavigationItems(
        articleSearchState.searchInput,
        authorCount,
        articleSearchState.isLoading
      );
      return <TabNavigationBar tabItemsData={tabNaviItems} />;
    } else if (location.pathname === "/search/authors") {
      authorCount = authorSearchState.totalElements;
      tabNaviItems = this.getTabNavigationItems(
        authorSearchState.searchInput,
        authorCount,
        authorSearchState.isLoading
      );
      return <TabNavigationBar tabItemsData={tabNaviItems} />;
    }

    return null;
  };

  private getTabNavigationItems = (searchKeyword: string, authorCount: number, isLoading: boolean): TabItem[] => {
    const tabNavigationItems = [
      {
        tabName: "All",
        tabLink: {
          pathname: "/search",
          search: PapersQueryFormatter.stringifyPapersQuery({
            query: searchKeyword,
            sort: "RELEVANCE",
            filter: {},
            page: 1,
          }),
        },
      },
      {
        tabName: `Authors`,
        tabLink: {
          pathname: "/search/authors",
          search: PapersQueryFormatter.stringifyPapersQuery({
            query: searchKeyword,
            sort: "RELEVANCE",
            filter: {},
            page: 1,
          }),
        },
      },
    ];
    return tabNavigationItems;
  };

  private checkTopToast = () => {
    const old = new Date(LAST_UPDATE_DATE);
    const comparisonDate = addDays(old, 5);
    const now = new Date();
    const updateIsStaled = isAfter(now, comparisonDate);
    const alreadyOpenedTopToast = !!Cookies.get("alreadyOpenedTopToast");
    const shouldOpenToast = !updateIsStaled && !alreadyOpenedTopToast;

    if (shouldOpenToast) {
      this.setState(prevState => ({
        ...prevState,
        openTopToast: true,
      }));
    }
  };

  private getToastBar = () => {
    const { openTopToast } = this.state;

    if (openTopToast) {
      return <TopToastBar onClose={this.handleCloseTopToast} />;
    }
    return null;
  };

  private handleCloseTopToast = () => {
    Cookies.set("alreadyOpenedTopToast", "1", { expires: 3 });
    this.setState(prevState => ({ ...prevState, openTopToast: false }));
  };

  private getNavbarClassName = () => {
    const { location } = this.props;

    if (location.pathname !== HOME_PATH) {
      if (this.state.isTop) {
        return styles.navbar;
      } else {
        return `${styles.navbar} ${styles.scrolledNavbar}`;
      }
    } else {
      if (this.state.isTop) {
        return `${styles.navbar} ${styles.searchHomeNavbar}`;
      } else {
        return `${styles.navbar} ${styles.scrolledNavbar} ${styles.searchHomeNavbar}`;
      }
    }
  };

  private handleScrollEvent = () => {
    if (!ticking) {
      requestAnimationFrame(this.updateIsTopState);
    }

    ticking = true;
  };

  private updateIsTopState = () => {
    const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

    if (scrollTop < HEADER_BACKGROUND_START_HEIGHT) {
      this.setState({
        isTop: true,
      });
    } else {
      this.setState({
        isTop: false,
      });
    }

    ticking = false;
  };

  private changeSearchInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    if (value.length > 1) {
      this.delayedGetKeywordCompletion(value);
    }
  };

  private getKeywordCompletion = (searchInput: string) => {
    const { dispatch } = this.props;

    dispatch(Actions.getKeywordCompletion(searchInput));
  };

  // tslint:disable-next-line:member-ordering
  private delayedGetKeywordCompletion = debounce(this.getKeywordCompletion, 200);

  private handleSearchPush = (query: string) => {
    const { dispatch, history } = this.props;

    if (query.length < 2) {
      return dispatch({
        type: ACTION_TYPES.GLOBAL_ALERT_NOTIFICATION,
        payload: {
          type: "error",
          message: "You should search more than 2 characters.",
        },
      });
    }

    ActionTicketManager.trackTicket({
      pageType: getCurrentPageType(),
      actionType: "fire",
      actionArea: "topBar",
      actionTag: "query",
      actionLabel: query,
    });

    trackEvent({ category: "Search", action: "Query", label: "" });

    if (location.pathname === "/search/authors") {
      history.push(
        `/search/authors?${PapersQueryFormatter.stringifyPapersQuery({
          query,
          sort: "RELEVANCE",
          filter: {},
          page: 1,
        })}`
      );
    } else {
      history.push(
        `/search?${PapersQueryFormatter.stringifyPapersQuery({
          query,
          sort: "RELEVANCE",
          filter: {},
          page: 1,
        })}`
      );
    }
  };

  private getHeaderLogo = () => {
    const { location, layoutState } = this.props;
    const isNotHome = location.pathname !== HOME_PATH;

    if (layoutState.userDevice !== UserDevice.DESKTOP && isNotHome) {
      return (
        <Link to="/" className={styles.headerLogoMark}>
          <Icon icon="SCINAPSE_LOGO_SMALL" />
        </Link>
      );
    } else {
      return (
        <Link to="/" onClick={() => trackAction("/", "headerLogo")} className={styles.headerLogo}>
          <Icon icon="SCINAPSE_LOGO" />
        </Link>
      );
    }
  };

  private getSearchFormContainer = () => {
    const { location, layoutState } = this.props;

    const isShowSearchFormContainer = location.pathname !== HOME_PATH;
    const rawQueryParamsObj: Scinapse.ArticleSearch.RawQueryParams = getQueryParamsObject(location.search);
    const query = SafeURIStringHandler.decode(rawQueryParamsObj.query || "");

    return (
      <div style={!isShowSearchFormContainer ? { visibility: "hidden" } : {}} className={styles.searchFormContainer}>
        <div className={styles.searchInputBoxWrapper} tabIndex={0}>
          <InputWithSuggestionList
            defaultValue={query}
            onChange={this.changeSearchInput}
            placeholder="Search papers by title, author, doi or keyword"
            handleSubmit={this.handleSearchPush}
            suggestionList={layoutState.completionKeywordList.map(keyword => keyword.keyword)}
            wrapperClassName={styles.searchWrapper}
            style={{
              display: "flex",
              width: "100%",
              height: "44px",
              border: 0,
              borderRadius: "4px",
              padding: "0 44px 0 16px",
              backgroundColor: "white",
              overflow: "hidden",
              alignItems: "center",
            }}
            listWrapperStyle={{
              boxShadow: "rgba(0, 0, 0, 0.15) 0px 3px 8px 1px",
              zIndex: 998,
            }}
            listItemStyle={{
              height: "44px",
              lineHeight: "44px",
              padding: "0 18px",
            }}
            iconNode={<Icon icon="SEARCH_ICON" className={styles.searchIcon} />}
          />
        </div>
      </div>
    );
  };

  private handleClickSignOut = async () => {
    const { dispatch } = this.props;

    try {
      await dispatch(signOut());
      this.handleRequestCloseUserDropdown();
    } catch (_err) {
      dispatch({
        type: ACTION_TYPES.GLOBAL_ALERT_NOTIFICATION,
        payload: {
          type: "error",
          message: `Failed to sign out.`,
        },
      });
    }
  };

  private handleOpenSignIn = () => {
    const { dispatch } = this.props;

    dispatch(openSignIn());
  };

  private handleOpenSignUp = () => {
    const { dispatch } = this.props;

    dispatch(openSignUp());
  };

  private handleToggleUserDropdown = () => {
    this.setState({
      userDropdownAnchorElement: this.userDropdownAnchorRef,
      isUserDropdownOpen: !this.state.isUserDropdownOpen,
    });
  };

  private handleRequestCloseUserDropdown = () => {
    this.setState({
      isUserDropdownOpen: false,
    });
  };

  private userDropdownMenuItems = () => {
    const { currentUserState } = this.props;

    return (
      <div className={styles.menuItems}>
        {currentUserState.isAuthorConnected ? (
          <MenuItem classes={{ root: styles.profileButton }}>
            <Link
              className={styles.buttonOnLink}
              onClick={this.handleRequestCloseUserDropdown}
              to={`/authors/${currentUserState.authorId}?beta=true`}
            >
              Profile
            </Link>
          </MenuItem>
        ) : null}
        <MenuItem classes={{ root: styles.collectionButton }}>
          <Link
            className={styles.buttonOnLink}
            onClick={this.handleRequestCloseUserDropdown}
            to={`/users/${currentUserState.id}/collections`}
          >
            Collection
          </Link>
        </MenuItem>
        <MenuItem classes={{ root: styles.signOutButton }} onClick={this.handleClickSignOut}>
          <span className={styles.buttonText}>Sign Out</span>
        </MenuItem>
      </div>
    );
  };

  private getUserDropdown = () => {
    const { currentUserState } = this.props;

    const firstCharacterOfUsername = currentUserState.firstName.slice(0, 1).toUpperCase();

    return (
      <div className={styles.rightBox}>
        <div>
          {!currentUserState.profileImageUrl ? (
            <div
              className={styles.userDropdownChar}
              ref={el => (this.userDropdownAnchorRef = el)}
              onClick={this.handleToggleUserDropdown}
            >
              {firstCharacterOfUsername}
            </div>
          ) : (
            <div
              className={styles.userDropdownImg}
              ref={el => (this.userDropdownAnchorRef = el)}
              onClick={this.handleToggleUserDropdown}
            >
              <div
                style={{
                  backgroundImage: `url(${currentUserState.profileImageUrl})`,
                }}
                className={styles.profileImage}
              />
            </div>
          )}
          <BubblePopover
            open={this.state.isUserDropdownOpen}
            anchorEl={this.state.userDropdownAnchorElement!}
            placement="bottom-end"
            popperOptions={{
              positionFixed: true,
            }}
          >
            <ClickAwayListener onClickAway={this.handleRequestCloseUserDropdown}>
              {this.userDropdownMenuItems()}
            </ClickAwayListener>
          </BubblePopover>
        </div>
      </div>
    );
  };

  private getHeaderButtons = () => {
    const { currentUserState } = this.props;
    const { isLoggedIn } = currentUserState;

    if (!isLoggedIn) {
      return (
        <div className={styles.rightBox}>
          <div
            onClick={() => {
              this.handleOpenSignIn();
              trackDialogView("headerSignInOpen");
              ActionTicketManager.trackTicket({
                pageType: getCurrentPageType(),
                actionType: "fire",
                actionArea: "topBar",
                actionTag: "signIn",
                actionLabel: null,
              });
            }}
            className={styles.signInButton}
          >
            Sign in
          </div>
          <div
            onClick={() => {
              this.handleOpenSignUp();
              trackDialogView("headerSignUpOpen");
              ActionTicketManager.trackTicket({
                pageType: getCurrentPageType(),
                actionType: "fire",
                actionArea: "topBar",
                actionTag: "signUp",
                actionLabel: null,
              });
            }}
            className={styles.signUpButton}
          >
            Get Started
          </div>
        </div>
      );
    } else {
      return this.getUserDropdown();
    }
  };
}

export default withRouter(connect(mapStateToProps)(Header));
