import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Partnerships content for a project.
 *
 * @return {*}
 */
const Partnerships: React.FC<IPartnershipsProps> = (props) => {
  const {
    projectForViewData: {
      partnerships: { indigenous_partnerships, stakeholder_partnerships }
    },
    codes
  } = props;

  const hasIndigenousPartnerships = indigenous_partnerships && indigenous_partnerships.length > 0;
  const hasStakeholderPartnerships = stakeholder_partnerships && stakeholder_partnerships.length > 0;

  return (
    <>
      <dl>
        <div>
          <Typography component="dt" variant="body2" color="textSecondary">
            Indigenous Partners:
          </Typography>

          <Typography component="dd" variant="body2">
            {indigenous_partnerships?.map((indigenousPartnership: number, index: number) => {
              const codeValue = codes.first_nations.find((code) => code.id === indigenousPartnership);
              return (
                <span key={index} data-testid="indigenous_partners_data">
                  {codeValue?.name}
                </span>
              );
            })}
            {!hasIndigenousPartnerships && <span data-testid="no_indigenous_partners_data">None</span>}
          </Typography>
        </div>

        <div>
          <Typography component="dt" variant="body2" color="textSecondary">
            Other Partners:
          </Typography>

          <Typography component="dd" variant="body2">
            {stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
              return (
                <span key={index} data-testid="stakeholder_partners_data">
                  {stakeholderPartnership}
                </span>
              );
            })}
            {!hasStakeholderPartnerships && <span data-testid="no_stakeholder_partners_data">None</span>}
          </Typography>
        </div>
      </dl>
    </>
  );
};

export default Partnerships;
