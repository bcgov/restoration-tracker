import Box from '@material-ui/core/Box';
import { mdiAccountCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import Typography from '@material-ui/core/Typography';

export interface IProjectContactProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectContactList: {
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      padding: 0,
      listStyleType: 'none',
      '& li + li': {
        marginTop: theme.spacing(1.5)
      }
    },
    contactIcon: {
      color: '#1a5a96'
    }
  })
);
/**
 * Project contact content for a project.
 *
 * @return {*}
 */
const ProjectContact: React.FC<IProjectContactProps> = ({ projectForViewData }) => {
  const {
    contact: { contacts }
  } = projectForViewData;
  const classes = useStyles();

  // To move primary contact on first index
  contacts.sort((a, b) => JSON.parse(b.is_primary) - JSON.parse(a.is_primary));

  return (
    <>
      {contacts.map((contactDetails, index) => (
        <ul className={classes.projectContactList} key={index}>
          <Box component="li" display="flex" flexDirection="row">
            <Box mr={2}>
              <Icon className={classes.contactIcon} path={mdiAccountCircleOutline} size={1.5} />
            </Box>
            <div>
              <div>
                <strong data-testid="contact_name">
                  {' '}
                  {contactDetails.first_name} {contactDetails.last_name}
                  {JSON.parse(contactDetails.is_primary) && (
                    <sup>
                      <Typography variant="caption" color="textSecondary">
                        {' '}
                        Primary
                      </Typography>
                    </sup>
                  )}
                </strong>
              </div>
              <div>
                <Link href="#">{contactDetails.email_address}</Link>
              </div>
              <div>{contactDetails.agency}</div>
            </div>
          </Box>
        </ul>
      ))}
    </>
  );
};

export default ProjectContact;
