import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import { denormalize } from "normalizr";
import { AppState } from "../../reducers";
import ArticleSpinner from "../common/spinner/articleSpinner";
import { withStyles } from "../../helpers/withStylesHelper";
import { CurrentUser } from "../../model/currentUser";
import { CollectionShowState } from "./reducer";
import { collectionSchema, Collection } from "../../model/collection";
import { fetchTargetCollection } from "./sideEffect";
import { Configuration } from "../../reducers/configuration";
const styles = require("./collectionShow.scss");

function mapStateToProps(state: AppState) {
  return {
    currentUser: state.currentUser,
    collectionShow: state.collectionShow,
    configuration: state.configuration,
    collection: denormalize(
      state.collectionShow.mainCollectionId,
      collectionSchema,
      state.entities
    )
  };
}

export interface CollectionShowMatchParams {
  collectionId: string;
}

export interface CollectionShowProps
  extends RouteComponentProps<CollectionShowMatchParams>,
    Readonly<{
      currentUser: CurrentUser;
      configuration: Configuration;
      collectionShow: CollectionShowState;
      collection: Collection | undefined;
      dispatch: Dispatch<any>;
    }> {}

@withStyles<typeof CollectionShow>(styles)
class CollectionShow extends React.PureComponent<CollectionShowProps, {}> {
  public componentDidMount() {
    const { dispatch, match, location, configuration } = this.props;

    const notRenderedAtServerOrJSAlreadyInitialized =
      !configuration.initialFetched || configuration.clientJSRendered;

    if (notRenderedAtServerOrJSAlreadyInitialized) {
      fetchTargetCollection({
        dispatch,
        match,
        pathname: location.pathname
      });
    }
  }

  public componentWillReceiveProps(nextProps: CollectionShowProps) {
    const { dispatch, match, location } = nextProps;

    const currentCollectionId = this.props.match.params.collectionId;
    const nextCollectionId = match.params.collectionId;

    if (currentCollectionId !== nextCollectionId) {
      fetchTargetCollection({
        dispatch,
        match,
        pathname: location.pathname
      });
    }
  }

  public render() {
    const { collectionShow, collection } = this.props;

    if (collectionShow.isLoadingCollection) {
      return (
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <ArticleSpinner className={styles.loadingSpinner} />
          </div>
        </div>
      );
    } else if (collection) {
      return (
        <div className={styles.headSection}>
          <div className={styles.container}>
            <div className={styles.leftBox}>
              <div className={styles.title}>{collection.title}</div>
              <div className={styles.description}>{collection.description}</div>
              <div className={styles.infoWrapper}>
                <span>Created by</span>
                <strong>{` ${collection.createdBy.name} · `}</strong>
                <strong>{`${distanceInWordsToNow(
                  collection.createdAt
                )} `}</strong>
                <span>ago</span>
              </div>
            </div>
            <div className={styles.rightBox} />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default connect(mapStateToProps)(withRouter(CollectionShow));
