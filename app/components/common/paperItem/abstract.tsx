import * as React from "react";
import { escapeRegExp } from "lodash";
import SearchQueryHighlightedContent from "../searchQueryHighlightedContent";
import { withStyles } from "../../../helpers/withStylesHelper";
const styles = require("./abstract.scss");

const MAX_LENGTH_OF_ABSTRACT = 400;

export interface AbstractProps {
  abstract: string;
  searchQueryText?: string;
}
export interface AbstractStates extends Readonly<{}> {
  isExtendContent: boolean;
}

@withStyles<typeof Abstract>(styles)
class Abstract extends React.PureComponent<AbstractProps, AbstractStates> {
  public constructor(props: AbstractProps) {
    super(props);
    this.state = {
      isExtendContent: false,
    };
  }

  public render() {
    const { abstract, searchQueryText } = this.props;

    if (!abstract) {
      return null;
    }

    const cleanAbstract = abstract
      .replace(/^ /gi, "")
      .replace(/\s{2,}/g, " ")
      .replace(/#[A-Z0-9]+#/g, "");

    let finalAbstract;
    if (cleanAbstract.length > MAX_LENGTH_OF_ABSTRACT) {
      finalAbstract = cleanAbstract.slice(0, MAX_LENGTH_OF_ABSTRACT) + "...";
    } else {
      finalAbstract = cleanAbstract;
    }

    const searchQuery = searchQueryText ? escapeRegExp(searchQueryText) : null;

    return (
      <SearchQueryHighlightedContent
        handelExtendContent={this.handelExtendContent}
        isExtendContent={this.state.isExtendContent}
        originContent={abstract}
        content={finalAbstract}
        searchQueryText={searchQuery}
        className={styles.abstract}
      />
    );
  }
  public handelExtendContent = () => {
    console.log("handelExtendContent");
    this.setState({ isExtendContent: !this.state.isExtendContent });
  };
}

export default Abstract;
