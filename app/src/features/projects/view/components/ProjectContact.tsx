import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
// import { mdiAccountCircleOutline } from '@mdi/js';
// import Icon from '@mdi/react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectContactProps {
  projectForViewData: IGetProjectForViewResponse;
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
        marginTop: theme.spacing(1.5),
        paddingTop: theme.spacing(1.5),
        borderTop: '1px solid #dddddd'
      }
    },
    contactIcon: {
      color: '#575759'
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

  const hasContacts = contact.contacts && contact.contacts.length > 0;

  return (
    <>
      <ul className={classes.projectContactList}>
        {contact.contacts.map((contactDetails, index) => (
          <Box component="li" key={index}>
            {/* <Box mr={2}>
              <Icon className={classes.contactIcon} path={mdiAccountCircleOutline} size={1.25} />
            </Box> */}
            <Box display="flex" justifyContent="space-between">
              <Box>
                <div>
                  <strong data-testid="contact_name">
                    {contactDetails.first_name} {contactDetails.last_name}
                  </strong>
                </div>
                <div>
                  <Link href="#">{contactDetails.email_address}</Link>
                </div>
                <div>{contactDetails.agency}</div>
              </Box>
              <Box>{JSON.parse(contactDetails.is_primary) && <Chip size="small" label="PRIMARY" />}</Box>
            </Box>
          </Box>
        ))}

        {!hasContacts && (
          <li>
            <Typography variant="body2" data-testid="no_contacts">
              No Contacts
            </Typography>
          </li>
        )}
      </ul>
    </>
  );
};

export default ProjectContact;
