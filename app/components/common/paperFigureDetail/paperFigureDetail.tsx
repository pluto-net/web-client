import React from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../../reducers';
import { withStyles } from '../../../helpers/withStylesHelper';
import Icon from '../../../icons';
import { UserDevice } from '../../layouts/records';
import SliderButtons from './sliderButtons';
import { FIGURE_PREFIX } from '../../../constants/paperFigure';
import ActionTicketManager from '../../../helpers/actionTicketManager';
import { getCurrentPageType } from '../../locationListener';
const styles = require('./paperFigureDetail.scss');

type Props = ReturnType<typeof mapStateToProps> & { handleCloseDialogRequest: () => void };

const PaperFigureDetail: React.FC<Props> = props => {
  const { DialogState, handleCloseDialogRequest } = props;
  const { paperFigures, currentPaperFigureIndex } = DialogState;
  const paperFigureEl = React.useRef<HTMLDivElement | null>(null);

  const [showFigureIndex, setShowFigureIndex] = React.useState(currentPaperFigureIndex!);

  React.useEffect(() => {
    paperFigureEl.current && paperFigureEl.current.focus();
  }, []);

  const onClickPrevBtn = React.useCallback(
    () => {
      ActionTicketManager.trackTicket({
        pageType: getCurrentPageType(),
        actionType: 'fire',
        actionArea: 'figureDetail',
        actionTag: 'clickPrevBtn',
        actionLabel: String(showFigureIndex),
      });

      if (showFigureIndex === 0) {
        setShowFigureIndex(paperFigures!.length - 1);
      } else {
        setShowFigureIndex(showFigureIndex - 1);
      }
    },
    [paperFigures, showFigureIndex]
  );

  const onClickNextBtn = React.useCallback(
    () => {
      ActionTicketManager.trackTicket({
        pageType: getCurrentPageType(),
        actionType: 'fire',
        actionArea: 'figureDetail',
        actionTag: 'clickNextBtn',
        actionLabel: String(showFigureIndex),
      });

      if (showFigureIndex === paperFigures!.length - 1) {
        setShowFigureIndex(0);
      } else {
        setShowFigureIndex(showFigureIndex + 1);
      }
    },
    [paperFigures, showFigureIndex]
  );

  const onKeyDownInFigureContainer = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.keyCode) {
        case 37: {
          // left
          onClickPrevBtn();
          break;
        }

        case 39: {
          // right
          onClickNextBtn();
          break;
        }

        default:
          break;
      }
    },
    [onClickPrevBtn, onClickNextBtn]
  );

  if (!paperFigures) return null;

  const currentFigure = paperFigures[showFigureIndex];

  return (
    <div
      className={styles.paperFigureDetailContainer}
      ref={paperFigureEl}
      tabIndex={1}
      onKeyDown={onKeyDownInFigureContainer}
    >
      <div onClick={handleCloseDialogRequest} className={styles.closeButtonWrapper}>
        <Icon icon="X_BUTTON" className={styles.closeButtonIcon} />
      </div>
      <div className={styles.figureDetailImageWrapper}>
        <picture>
          <source srcSet={`${FIGURE_PREFIX}${currentFigure.path}`} type="image/jpeg" />
          <img
            className={styles.figureDetailImage}
            src={`${FIGURE_PREFIX}${currentFigure.path}`}
            alt={'paperFigureImage'}
          />
        </picture>
      </div>
      <div className={styles.figureDetailCaption}>{currentFigure.caption}</div>
      <SliderButtons
        isMobile={props.layout.userDevice !== UserDevice.DESKTOP}
        handleClickPrevBtn={onClickPrevBtn}
        handleClickNextBtn={onClickNextBtn}
      />
    </div>
  );
};

function mapStateToProps(state: AppState) {
  return {
    layout: state.layout,
    DialogState: state.dialog,
  };
}

export default connect(mapStateToProps)(withStyles<typeof PaperFigureDetail>(styles)(PaperFigureDetail));