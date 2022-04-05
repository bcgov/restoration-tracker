import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiAccountCircleOutline, mdiDomain } from '@mdi/js';
import Icon from '@mdi/react';
import {
  IGetProjectForViewResponse,
  IGetProjectForViewResponseContactArrayItem
} from 'interfaces/useProjectApi.interface';
import React from 'react';

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
    },
    agencyOnlyContainer: {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 'bold'
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
              key={index}
              className={publicContact(contactDetails)}>
              
              <Box ml={1} mr={2} className={publicContact(contactDetails)}>
                <Icon
                  className={classes.contactIcon}
                  path={JSON.parse(contactDetails.is_public) ? mdiAccountCircleOutline : mdiDomain}
                  size={1}
                />
              </Box>

              <Box>
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

              <Box>
                {JSON.parse(contactDetails.is_primary) && (
                  <Chip size="small" label="PRIMARY" />
                )}
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

export default PublicProjectContact;
