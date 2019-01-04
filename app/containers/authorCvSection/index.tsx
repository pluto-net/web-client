import * as React from "react";
import { denormalize } from "normalizr";
import { Dispatch, connect } from "react-redux";
import { ConnectedAuthorShowState } from "../connectedAuthorShow/reducer";
import { LayoutState } from "../../components/layouts/records";
import { withStyles } from "../../helpers/withStylesHelper";
import { AppState } from "../../reducers";
import { CurrentUser } from "../../model/currentUser";
import { authorSchema, Author } from "../../model/author/author";
import { profileSchema, Profile, CVInfoType } from "../../model/profile";
import Icon from "../../icons";
import AwardForm, { AwardFormState } from "../../components/authorCV/awardForm";
import { addAuthorCvInfo, removeAuthorCvInfo } from "../../actions/author";
import PlutoAxios from "../../api/pluto";
import alertToast from "../../helpers/makePlutoToastAction";
import EducationForm, { EducationFormState } from "../../components/authorCV/educationForm";
import ExperienceForm, { ExperienceFormState } from "../../components/authorCV/experienceForm";
import ExperienceItem from "../../components/authorCV/experienceItem";
import EducationItem from "../../components/authorCV/educationItem";
import AwardItem from "../../components/authorCV/awardItem";
const styles = require("./authorCvSection.scss");

interface AuthorCvSectionState {
  isOpenAwardForm: boolean;
  isOpenEducationForm: boolean;
  isOpenExperienceForm: boolean;
}

interface AuthorCvSectionProps {
  layout: LayoutState;
  author: Author;
  authorShow: ConnectedAuthorShowState;
  currentUser: CurrentUser;
  profile: Profile;
  dispatch: Dispatch<any>;
}

@withStyles<typeof AuthorCvSection>(styles)
class AuthorCvSection extends React.PureComponent<AuthorCvSectionProps, AuthorCvSectionState> {
  public constructor(props: AuthorCvSectionProps) {
    super(props);

    this.state = {
      isOpenAwardForm: false,
      isOpenEducationForm: false,
      isOpenExperienceForm: false,
    };
  }

  public render() {
    return (
      <div className={styles.leftContentWrapper}>
        {this.getEducationArea()}
        {this.getExperienceArea()}
        {this.getAwardArea()}
      </div>
    );
  }

  private getEducationArea = () => {
    return (
      <div className={styles.areaWrapper}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Education</span>
        </div>
        <div className={styles.sectionDescription} />
        {this.getEducationForm()}
        {this.getEducationList()}
      </div>
    );
  };

  private getEducationForm = () => {
    const { isOpenEducationForm } = this.state;

    return isOpenEducationForm ? (
      <EducationForm
        handleClose={this.handleToggleAuthorCVForm("educations")}
        isOpen={true}
        isLoading={false}
        handleSubmitForm={this.handleSubmitEducation}
        initialValues={{
          degree: "",
          department: "",
          start_date: "",
          end_date: "",
          is_current: false,
          institution_name: "",
          institution_id: null,
        }}
      />
    ) : (
      <div className={styles.buttonWrapper}>
        <span className={styles.openFormButton} onClick={this.handleToggleAuthorCVForm("educations")}>
          <Icon className={styles.plusIcon} icon="SMALL_PLUS" /> Add more
        </span>
      </div>
    );
  };

  private getEducationList = () => {
    const { profile, author } = this.props;
    if (profile.educations && profile.educations.length > 0) {
      const educations = profile.educations.map(education => {
        return (
          <EducationItem
            authorId={author.id}
            key={education.id}
            education={education}
            handleRemoveItem={this.handleDeleteCVInfo("educations")}
          />
        );
      });

      return educations;
    }

    return (
      <div className={styles.noItemSection}>
        <p className={styles.noItemSectionContext}>There is no educations information.</p>
      </div>
    );
  };
  private getExperienceArea = () => {
    return (
      <div className={styles.areaWrapper}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Experience</span>
        </div>
        <div className={styles.sectionDescription} />
        {this.getExperienceForm()}
        {this.getExperienceList()}
      </div>
    );
  };

  private getExperienceForm = () => {
    const { isOpenExperienceForm } = this.state;

    return isOpenExperienceForm ? (
      <ExperienceForm
        handleClose={this.handleToggleAuthorCVForm("experiences")}
        isOpen={true}
        isLoading={false}
        handleSubmitForm={this.handleSubmitExperience}
        initialValues={{
          department: "",
          description: "",
          start_date: "",
          end_date: "",
          position: "",
          institution_id: null,
          institution_name: "",
          is_current: false,
        }}
      />
    ) : (
      <div className={styles.buttonWrapper}>
        <span className={styles.openFormButton} onClick={this.handleToggleAuthorCVForm("experiences")}>
          <Icon className={styles.plusIcon} icon="SMALL_PLUS" /> Add more
        </span>
      </div>
    );
  };

  private getExperienceList = () => {
    const { profile, author } = this.props;
    if (profile.experiences && profile.experiences.length > 0) {
      const experiences = profile.experiences.map(experience => {
        return (
          <ExperienceItem
            authorId={author.id}
            key={experience.id}
            experience={experience}
            handleRemoveItem={this.handleDeleteCVInfo("experiences")}
          />
        );
      });

      return experiences;
    }

    return (
      <div className={styles.noItemSection}>
        <p className={styles.noItemSectionContext}>There is no experiences information.</p>
      </div>
    );
  };

  private getAwardArea = () => {
    return (
      <div className={styles.areaWrapper}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Award</span>
        </div>
        <div className={styles.sectionDescription} />
        {this.getAwardForm()}
        {this.getAwardList()}
      </div>
    );
  };

  private getAwardForm = () => {
    const { isOpenAwardForm } = this.state;

    return isOpenAwardForm ? (
      <AwardForm
        handleClose={this.handleToggleAuthorCVForm("awards")}
        isOpen={true}
        isLoading={false}
        handleSubmitForm={this.handleSubmitAward}
        initialValues={{
          title: "",
          received_date: "",
        }}
      />
    ) : (
      <div className={styles.buttonWrapper}>
        <span className={styles.openFormButton} onClick={this.handleToggleAuthorCVForm("awards")}>
          <Icon className={styles.plusIcon} icon="SMALL_PLUS" /> Add more
        </span>
      </div>
    );
  };

  private getAwardList = () => {
    const { profile, author } = this.props;

    if (profile.awards && profile.awards.length > 0) {
      const awards = profile.awards.map(award => {
        return (
          <AwardItem
            authorId={author.id}
            key={award.id}
            award={award}
            handleRemoveItem={this.handleDeleteCVInfo("awards")}
          />
        );
      });

      return awards;
    }
    return (
      <div className={styles.noItemSection}>
        <p className={styles.noItemSectionContext}>There is no awards information.</p>
      </div>
    );
  };

  private handleDeleteCVInfo = (cvInfoType: keyof CVInfoType) => (cvInfoId: string) => {
    const { author, dispatch } = this.props;

    dispatch(removeAuthorCvInfo(cvInfoType, author.id, cvInfoId));
  };

  private handleSubmitEducation = async (education: EducationFormState) => {
    const { dispatch, author } = this.props;
    const { isOpenEducationForm } = this.state;

    try {
      await dispatch(addAuthorCvInfo("educations", author.id, education));
      this.setState(prevState => ({ ...prevState, isOpenEducationForm: !isOpenEducationForm }));
    } catch (err) {
      const error = PlutoAxios.getGlobalError(err);
      console.error(error);
      alertToast({
        type: "error",
        message: "Had an error to add award data.",
      });
    }
  };

  private handleSubmitExperience = async (experience: ExperienceFormState) => {
    const { dispatch, author } = this.props;
    const { isOpenExperienceForm } = this.state;
    try {
      await dispatch(addAuthorCvInfo("experiences", author.id, experience));

      this.setState(prevState => ({ ...prevState, isOpenExperienceForm: !isOpenExperienceForm }));
    } catch (err) {
      const error = PlutoAxios.getGlobalError(err);
      console.error(error);
      alertToast({
        type: "error",
        message: "Had an error to add award data.",
      });
    }
  };

  private handleSubmitAward = async (award: AwardFormState) => {
    const { dispatch, author } = this.props;
    const { isOpenAwardForm } = this.state;
    try {
      await dispatch(addAuthorCvInfo("awards", author.id, award));
      this.setState(prevState => ({ ...prevState, isOpenAwardForm: !isOpenAwardForm }));
    } catch (err) {
      const error = PlutoAxios.getGlobalError(err);
      console.error(error);
      alertToast({
        type: "error",
        message: "Had an error to add award data.",
      });
    }
  };

  private handleToggleAuthorCVForm = (formType: keyof CVInfoType) => () => {
    const { isOpenAwardForm, isOpenEducationForm, isOpenExperienceForm } = this.state;

    switch (formType) {
      case "awards":
        this.setState(prevState => ({ ...prevState, isOpenAwardForm: !isOpenAwardForm }));
        break;
      case "educations":
        this.setState(prevState => ({ ...prevState, isOpenEducationForm: !isOpenEducationForm }));
        break;
      case "experiences":
        this.setState(prevState => ({ ...prevState, isOpenExperienceForm: !isOpenExperienceForm }));
        break;
      default:
        break;
    }
  };
}

function mapStateToProps(state: AppState) {
  return {
    layout: state.layout,
    authorShow: state.connectedAuthorShow,
    currentUser: state.currentUser,
    profile: denormalize(state.connectedAuthorShow.authorId, profileSchema, state.entities),
    author: denormalize(state.connectedAuthorShow.authorId, authorSchema, state.entities),
  };
}

export default connect(mapStateToProps)(AuthorCvSection);
