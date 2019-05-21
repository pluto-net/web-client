import * as React from "react";
import Axios from "axios";
import { connect } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withStyles } from "../../helpers/withStylesHelper";
import PaperAPI from "../../api/paper";
import ScinapseButton from "../common/scinapseButton";
import ActionTicketManager from "../../helpers/actionTicketManager";
import Icon from "../../icons";
import { PaperPdf, Paper } from "../../model/paper";
import { ActionCreators } from "../../actions/actionTypes";
import { AUTH_LEVEL, blockUnverifiedUser } from "../../helpers/checkAuthDialog";
import getAPIHost from "../../api/getHost";
import { PaperSource } from "../../model/paperSource";
import { EXTENSION_APP_ID } from "../../constants/scinapse-extension";
import EnvChecker from "../../helpers/envChecker";
import RelatedPapers from "../relatedPapers";
import AfterDownloadContents from "./component/afterDownloadContents";
import { PDFViewerProps } from "./types";
import { AppState } from "../../reducers";
import { makeGetMemoizedPapers } from "../../selectors/papersSelector";
import { getMemoizedCurrentUser } from "../../selectors/getCurrentUser";
import { getMemoizedPDFViewerState } from "../../selectors/getPDFViewer";
import ProgressSpinner from "./component/progressSpinner";
const { Document, Page, pdfjs } = require("react-pdf");
const styles = require("./pdfViewer.scss");

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function trackClickButton(actionTag: Scinapse.ActionTicket.ActionTagType, paperId: number) {
  ActionTicketManager.trackTicket({
    pageType: "paperShow",
    actionType: "fire",
    actionArea: "pdfViewer",
    actionTag,

    actionLabel: String(paperId),
  });
}

const baseBtnStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "150px",
  height: "40px",
};

const readAllBtnStyle: React.CSSProperties = {
  ...baseBtnStyle,
  borderRadius: "27.5px",
  border: "1px solid #bbc2d0",
  fontSize: "16px",
  fontWeight: 500,
  letterSpacing: "1px",
  color: "#34495e",
};

const downloadPdfBtnStyle: React.CSSProperties = {
  ...baseBtnStyle,
  color: "white",
  backgroundColor: "#3e7fff",
  marginLeft: "16px",
};

function fetchPDFFromExtension(sources: PaperSource[]): Promise<{ data: Blob }> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && typeof chrome !== "undefined") {
      chrome.runtime.sendMessage(EXTENSION_APP_ID, { message: "CHECK_EXTENSION_EXIST" }, reply => {
        if (!reply || !reply.success) {
          return reject();
        }
      });

      const channel = new MessageChannel();
      window.postMessage(
        {
          type: "GET_PDF",
          sources,
        },
        "*",
        [channel.port2]
      );

      channel.port1.onmessage = e => {
        if (e.data.success) {
          console.log("SUCCESS TO GET PDF from EXTENSION");
          resolve(e.data);
        } else {
          reject();
        }
      };
    } else {
      reject();
    }
  });
}

async function fetchPDFFromAPI(paper: Paper) {
  let pdf: PaperPdf | undefined = paper.bestPdf;
  if (!pdf) {
    pdf = await PaperAPI.getBestPdfOfPaper({ paperId: paper.id });
  }

  if (pdf && pdf.hasBest) {
    const res = await Axios.get(`${getAPIHost()}/proxy/pdf?url=${encodeURIComponent(pdf.url)}`, {
      responseType: "blob",
    });
    return { data: res.data as Blob };
  }
  return null;
}

const PDFContent: React.FC<{ pdfBlob: Blob | null; isExpanded: boolean; pageCountToShow: number }> = React.memo(
  props => {
    if (!props.pdfBlob) return null;

    let pageContent;
    if (props.isExpanded) {
      pageContent = Array.from(new Array(props.pageCountToShow), (_el, i) => (
        <Page pdf={props.pdfBlob} width={996} margin={"0 auto"} key={i} pageNumber={i + 1} />
      ));
    }

    pageContent = <Page pdf={props.pdfBlob} width={996} margin={"0 auto"} pageNumber={1} />;

    return <>{pageContent}</>;
  }
);

const PDFViewer: React.FunctionComponent<PDFViewerProps> = props => {
  const {
    dispatch,
    paper,
    PDFViewerState,
    relatedPaperList,
    isLoadingRelatedPaperList,
    shouldShowRelatedPapers,
    afterDownloadPDF,
    currentUser,
  } = props;
  const wrapperNode = React.useRef<HTMLDivElement | null>(null);
  const actionTag = PDFViewerState.isExpanded ? "viewLessPDF" : "viewMorePDF";

  React.useEffect(
    () => {
      if (paper.urls.length > 0) {
        dispatch(ActionCreators.startToFetchPDF());
        fetchPDFFromExtension(paper.urls)
          .then(res => {
            dispatch(ActionCreators.setPDFBlob({ blob: res.data }));
          })
          .catch(() => {
            return fetchPDFFromAPI(paper);
          })
          .then(res => {
            if (res && res.data) {
              dispatch(ActionCreators.setPDFBlob({ blob: res.data }));
            } else {
              throw new Error();
            }
          })
          .catch(_err => {
            dispatch(ActionCreators.failToFetchPDF());
          });
      }
    },
    [paper.id]
  );

  if (PDFViewerState.isLoading) {
    return <ProgressSpinner />;
  }

  if (PDFViewerState.hasClickedDownloadBtn) {
    return (
      <div ref={wrapperNode} className={styles.contentWrapper}>
        <AfterDownloadContents
          onClickReloadBtn={() => {
            dispatch(ActionCreators.clickPDFReloadBtn());
          }}
          relatedPaperList={relatedPaperList}
          isLoggedIn={currentUser.isLoggedIn}
          isRelatedPaperLoading={isLoadingRelatedPaperList}
        />
      </div>
    );
  }

  if (!!PDFViewerState.pdfBlob) {
    return (
      <div ref={wrapperNode} className={styles.contentWrapper}>
        <Document
          file={PDFViewerState.pdfBlob}
          error={null}
          loading={
            <div className={styles.loadingContainer}>
              <CircularProgress size={100} thickness={2} color="inherit" />
            </div>
          }
          onLoadSuccess={(pdf: any) => {
            dispatch(ActionCreators.succeedToFetchPDF({ pdf }));
            ActionTicketManager.trackTicket({
              pageType: "paperShow",
              actionType: "view",
              actionArea: "pdfViewer",
              actionTag: "viewPDF",
              actionLabel: String(paper.id),
            });
          }}
          onLoadError={() => {
            dispatch(ActionCreators.failToFetchPDF());
          }}
        >
          <PDFContent
            pdfBlob={PDFViewerState.parsedPDFObject}
            isExpanded={PDFViewerState.isExpanded}
            pageCountToShow={PDFViewerState.pageCountToShow}
          />
        </Document>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "40px",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {!PDFViewerState.hasFailed && (
            <>
              {PDFViewerState.isExpanded ? (
                <>
                  <ScinapseButton
                    gaCategory="PDF viewer"
                    gaAction="download PDF"
                    style={downloadPdfBtnStyle}
                    target="_blank"
                    href={paper.bestPdf.url}
                    rel="nofollow"
                    content={
                      <span className={styles.downloadBtnWrapper}>
                        <Icon icon="DOWNLOAD" className={styles.downloadIcon} /> Download PDF
                      </span>
                    }
                    onClick={async e => {
                      if (!EnvChecker.isOnServer()) {
                        e.preventDefault();

                        const isBlocked = await blockUnverifiedUser({
                          authLevel: AUTH_LEVEL.VERIFIED,
                          actionArea: "pdfViewer",
                          actionLabel: "downloadPdf",
                          userActionType: "downloadPdf",
                        });

                        if (isBlocked) {
                          return;
                        }
                        dispatch(ActionCreators.clickPDFDownloadBtn());
                        trackClickButton("downloadPdf", paper.id);
                        window.open(paper.bestPdf.url, "_blank");
                        afterDownloadPDF();
                      }
                    }}
                    isExternalLink
                    downloadAttr
                  />
                  <RelatedPapers shouldShowRelatedPapers={shouldShowRelatedPapers} />
                </>
              ) : (
                <ScinapseButton
                  gaCategory="PDF viewer"
                  gaAction={actionTag}
                  style={readAllBtnStyle}
                  content={
                    <span>
                      READ ALL <Icon icon="ARROW_POINT_TO_UP" className={styles.arrowIcon} />
                    </span>
                  }
                  isLoading={PDFViewerState.isLoading}
                  disabled={PDFViewerState.hasFailed}
                  onClick={async () => {
                    const isBlocked = await blockUnverifiedUser({
                      authLevel: AUTH_LEVEL.VERIFIED,
                      actionArea: "pdfViewer",
                      actionLabel: actionTag,
                      userActionType: actionTag,
                    });

                    trackClickButton(actionTag, props.paper.id);

                    if (isBlocked) {
                      return;
                    }

                    dispatch(ActionCreators.clickPDFViewMoreBtn());
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

function mapStateToProps(state: AppState) {
  const getRelatedPapers = makeGetMemoizedPapers(() => state.relatedPapersState.paperIds);

  return {
    currentUser: getMemoizedCurrentUser(state),
    PDFViewerState: getMemoizedPDFViewerState(state),
    relatedPaperList: getRelatedPapers(state),
    isLoadingRelatedPaperList: state.relatedPapersState.isLoading,
  };
}

export default connect(mapStateToProps)(withStyles<typeof PDFViewer>(styles)(PDFViewer));
