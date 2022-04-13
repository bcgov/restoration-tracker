import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiAccountCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectContactProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    projectContactList: {
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      padding: 0
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
          <Box component="li" key={index} display="flex" justifyContent="space-between">
            <Box display="flex" pl={1}>
              <Icon className={classes.contactIcon} path={mdiAccountCircleOutline} size={1} />
              <Box ml={2}>
                <div>
                  <strong data-testid="contact_name">
                    {contactDetails.first_name} {contactDetails.last_name}
                  </strong>
                </div>
                <div>
                  <Link href={'mailto:' + contactDetails.email_address}>{contactDetails.email_address}</Link>
                </div>
                <div>{contactDetails.agency}</div>
              </Box>
            </Box>
            <Box>{JSON.parse(contactDetails.is_primary) && <Chip size="small" label="PRIMARY" />}</Box>
          </Box>
        ))}

        {!hasContacts && (
          <li>
            <Typography variant="body2" color="textSecondary" data-testid="no_contacts">
              No Contacts
            </Typography>
          </li>
        )}
      </ul>
    </>
  );
};

export default ProjectContact;
