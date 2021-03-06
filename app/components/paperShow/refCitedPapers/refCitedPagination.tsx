import React from 'react';
import { useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { REF_CITED_CONTAINER_TYPE } from '../constants';
import DesktopPagination from '../../common/desktopPagination';
import MobilePagination from '../../common/mobilePagination';
import { AppState } from '../../../reducers';
import getQueryParamsObject from '../../../helpers/getQueryParamsObject';
import { PaperShowMatchParams, PaperShowPageQueryParams } from '../../../containers/paperShow/types';
import { getStringifiedUpdatedQueryParams } from './searchContainer';
import { UserDevice } from '../../layouts/reducer';

type RefCitedPapersPaginationProps = RouteComponentProps<PaperShowMatchParams> & {
  type: REF_CITED_CONTAINER_TYPE;
  paperId: string;
};

interface GetPaginationLinkParams {
  type: REF_CITED_CONTAINER_TYPE;
  paperId: string;
  queryParams: PaperShowPageQueryParams;
}

const getRefPaginationLink = ({ type, paperId, queryParams }: GetPaginationLinkParams) => (page: number) => {
  const queryParamsKey = type === 'reference' ? 'ref-page' : 'cited-page';

  return {
    to: `/papers/${paperId}`,
    search: getStringifiedUpdatedQueryParams(queryParams, { [queryParamsKey]: page }),
    state: { scrollTo: type },
  };
};

const RefCitedPagination: React.FC<RefCitedPapersPaginationProps> = props => {
  const { type, location, paperId } = props;
  const isMobile = useSelector((state: AppState) => state.layout.userDevice === UserDevice.MOBILE);
  const totalPage = useSelector((state: AppState) => {
    return type === 'reference' ? state.paperShow.referencePaperTotalPage : state.paperShow.citedPaperTotalPage;
  });
  const currentPage = useSelector((state: AppState) => {
    return type === 'reference' ? state.paperShow.referencePaperCurrentPage : state.paperShow.citedPaperCurrentPage;
  });

  const queryParams = getQueryParamsObject(location.search);

  if (isMobile) {
    return (
      <MobilePagination
        totalPageCount={totalPage}
        currentPageIndex={currentPage}
        getLinkDestination={getRefPaginationLink({ type, paperId, queryParams })}
        wrapperStyle={{
          margin: '12px 0',
        }}
      />
    );
  } else {
    return (
      <DesktopPagination
        type={`paper_show_${type}_papers`}
        totalPage={totalPage}
        currentPageIndex={currentPage}
        getLinkDestination={getRefPaginationLink({ type, paperId, queryParams })}
        wrapperStyle={{ margin: '32px 0 56px 0' }}
        actionArea={type === 'reference' ? 'refList' : 'citedList'}
      />
    );
  }
};

export default withRouter(RefCitedPagination);
