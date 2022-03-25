import Box from '@material-ui/core/Box';
import { mdiAccountCircleOutline, mdiDomain } from '@mdi/js';
import Icon from '@mdi/react';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  IGetProjectForViewResponse,
  IGetProjectForViewResponseContactArrayItem
} from 'interfaces/useProjectApi.interface';
import Typography from '@material-ui/core/Typography';
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
        marginTop: theme.spacing(1.5)
      }
    },
    contactIcon: {
      color: '#1a5a96'
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

  return (
    <>
      <ul className={classes.projectContactList}>
        {contact.contacts.map((contactDetails, index) => (
          <Box component="li" display="flex" flexDirection="row" key={index} className={publicContact(contactDetails)}>
            <Box mr={2} className={publicContact(contactDetails)}>
              <Icon
                className={classes.contactIcon}
                path={JSON.parse(contactDetails.is_public) ? mdiAccountCircleOutline : mdiDomain}
                size={1.5}
              />
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
      </ul>
    </>
  );
};

export default PublicProjectContact;
