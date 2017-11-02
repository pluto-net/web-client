import * as React from "react";
import * as moment from "moment";
import { Link } from "react-router-dom";
import Type from "../../articleShow/components/type";
import { IArticleRecord } from "../../../model/article";
import formatNumber from "../../../helpers/formatNumber";
import UserProfileIcon from "../../common/userProfileIcon";

const shave = require("shave").default;
const styles = require("./feedItem.scss");

export interface IFeedItemProps {
  article: IArticleRecord;
}

// const ACTIVATE_POINT_THRESHOLD = 5;

class FeedItem extends React.PureComponent<IFeedItemProps, {}> {
  private abstractElement: HTMLDivElement;

  private shaveTexts() {
    if (!!this.abstractElement) {
      shave(this.abstractElement, 88);
    }
  }

  private getEvaluationPoint() {
    const { article } = this.props;
    const totalPoint = article.point ? formatNumber(article.point.total, 2) : 0;
    // if (article.evaluations && article.evaluations.count() >= ACTIVATE_POINT_THRESHOLD) {
    // return <div className={`${styles.evaluationPoint} ${styles.activeEvaluationPoint}`}>{totalPoint}</div>;
    // } else {
    return <div className={styles.evaluationPoint}>{totalPoint}</div>;
    // }
  }

  public componentDidMount() {
    this.shaveTexts();
  }

  public render() {
    const { article } = this.props;

    return (
      <div className={styles.feedItemWrapper}>
        <div className={styles.contentSection}>
          <div className={styles.leftBox}>
            <div className={styles.tagWrapper}>
              <Type tag={article.type} />
            </div>
            <div className={styles.contentWrapper}>
              <Link to={`/articles/${article.id}`} className={styles.title}>
                {article.title}
              </Link>
              <Link to={`/articles/${article.id}`}>
                <div ref={ele => (this.abstractElement = ele)} className={styles.abstractSummary}>
                  {article.summary}
                </div>
              </Link>
            </div>
          </div>

          <div className={styles.rightBox}>
            <div className={styles.rightBoxContent}>
              {this.getEvaluationPoint()}
              <div className={styles.evaluationPointText}>pointed</div>
            </div>
          </div>
        </div>
        <div className={styles.informationBox}>
          <div className={styles.informationLeftBox}>
            <Link to={`/users/${article.createdBy.id}`}>
              <div className={styles.profileImageWrapper}>
                <UserProfileIcon
                  profileImage={article.createdBy.profileImage}
                  userId={article.createdBy.id}
                  type="small"
                />
              </div>
              <div className={styles.authorInformation}>
                <div className={styles.authorName}>{article.createdBy.name}</div>
                <div className={styles.authorInstitution}>{article.createdBy.institution}</div>
              </div>
            </Link>
          </div>
          <div className={styles.informationRightBox}>
            <div className={styles.createdAt}>{moment(article.createdAt).format("ll")}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default FeedItem;
