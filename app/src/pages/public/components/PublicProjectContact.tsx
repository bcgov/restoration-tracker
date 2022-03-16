import Box from '@material-ui/core/Box';
import { mdiAccountCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { Typography } from '@material-ui/core';

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
  const publicContacts = contact.contacts.filter(({ is_public }) => JSON.parse(is_public));
  const privateContacts = contact.contacts.filter(({ is_public }) => !JSON.parse(is_public));
  const classes = useStyles();

  return (
    <>
      <ul className={classes.projectContactList}>
        {publicContacts.map((contactDetails, index) => (
          <Box component="li" display="flex" flexDirection="row" key={index}>
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
        ))}
        {privateContacts.map((contactDetails, index) => (
          <li key={index} data-testid="contact_agency">
            <Typography component="span" variant="body2">
              {contactDetails.agency}
            </Typography>
          </li>
        ))}
      </ul>
    </>
  );
};

export default PublicProjectContact;
