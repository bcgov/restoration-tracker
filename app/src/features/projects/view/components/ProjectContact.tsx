import Box from '@material-ui/core/Box';
import { mdiAccountCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

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
  const { contact } = projectForViewData;
  const classes = useStyles();

  return (
    <>
      {contact.contacts.map((contactDetails, index) => (
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
