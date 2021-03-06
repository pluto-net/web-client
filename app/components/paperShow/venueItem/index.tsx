import * as React from 'react';
import { Link } from 'react-router-dom';
import * as format from 'date-fns/format';
import { withStyles } from '../../../helpers/withStylesHelper';
import { Paper } from '../../../model/paper';
import ActionTicketManager from '../../../helpers/actionTicketManager';
const styles = require('./venueItem.scss');

interface PaperShowVenueItemProps {
  paper: Paper;
}

const PaperShowVenueItem: React.SFC<PaperShowVenueItemProps> = props => {
  const { paper } = props;
  const { journal, conferenceInstance } = paper;

  if (!paper || !paper.year) {
    return null;
  }

  return (
    <div className={styles.published}>
      <div className={styles.paperContentBlockHeader}>Published to</div>
      <ul className={styles.venueList}>
        {journal ? (
          <li className={styles.venueItem}>
            <Link
              to={`/journals/${journal.id}`}
              onClick={() => {
                ActionTicketManager.trackTicket({
                  pageType: 'paperShow',
                  actionType: 'fire',
                  actionArea: 'paperDescription',
                  actionTag: 'journalShow',
                  actionLabel: String(journal.id),
                });
              }}
            >
              <div className={styles.venueTitle}>{`${journal.title || paper.venue} ${journal.impactFactor &&
                `[IF: ${journal.impactFactor.toFixed(2)}]`}`}</div>
              <div className={styles.venueYear}>
                Published date: <span className={styles.yearNumber}>{format(paper.publishedDate, 'MMM D, YYYY')}</span>
              </div>
            </Link>
          </li>
        ) : (
          <li className={styles.venueItem}>
            {conferenceInstance &&
              conferenceInstance.conferenceSeries &&
              conferenceInstance.conferenceSeries.name && (
                <div className={styles.venueTitleReadonly}>{`${conferenceInstance.conferenceSeries.name}`}</div>
              )}
            <div className={styles.venueYear}>
              Year: <span className={styles.yearNumber}>{paper.year}</span>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default withStyles<typeof PaperShowVenueItem>(styles)(PaperShowVenueItem);
