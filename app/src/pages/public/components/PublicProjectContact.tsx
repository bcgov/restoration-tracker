import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiAccountCircleOutline, mdiDomain } from '@mdi/js';
import Icon from '@mdi/react';
import {
  IGetProjectForViewResponse,
  IGetProjectForViewResponseContactArrayItem
} from 'interfaces/useProjectApi.interface';
import React from 'react';

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
    },
    agencyOnlyContainer: {
      alignItems: 'center',
      fontWeight: 700,
      '& .contactName, .contactEmail': {
        display: 'none'
      }
    }
  })
);

export interface IPublicProjectContactProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Project contact content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectContact: React.FC<IPublicProjectContactProps> = ({ projectForViewData }) => {
  const { contact } = projectForViewData;
  const classes = useStyles();

  const publicContact = ({ is_public }: IGetProjectForViewResponseContactArrayItem) =>
    !JSON.parse(is_public) ? classes.agencyOnlyContainer : '';

  const hasContacts = contact.contacts && contact.contacts.length > 0;

  return (
    <>
      <ul className={classes.projectContactList}>
        {hasContacts &&
          contact.contacts.map((contactDetails, index) => (
            <Box
              component="li"
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              key={index}
              className={publicContact(contactDetails)}>
              <Box display="flex" className={publicContact(contactDetails)} pl={1}>
                <Icon
                  className={classes.contactIcon}
                  path={JSON.parse(contactDetails.is_public) ? mdiAccountCircleOutline : mdiDomain}
                  size={1}
                />
                <Box ml={2}>
                  <div className="contactName">
                    <strong data-testid="contact_name">
                      {contactDetails.first_name} {contactDetails.last_name}
                    </strong>
                  </div>
                  <div className="contactEmail">
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

export default PublicProjectContact;
