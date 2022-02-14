import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

const useStyles = makeStyles({
  table: {
    minWidth: 650
  },
  heading: {
    fontWeight: 'bold'
  },
  tableCellBorderTop: {
    borderTop: '100px solid rgba(224, 224, 224, 1)'
  }
});

export interface IPublicProjectContactProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Project contact content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectContact: React.FC<IPublicProjectContactProps> = (props) => {
  const {
    projectForViewData: { contact }
  } = props;

  const classes = useStyles();

  return (
    <Box>
      <Box mb={2} data-testid="projectContactTitle">
        <Typography variant="h3">Project Contacts</Typography>
      </Box>
      {contact.contacts.length ? (
        <TableContainer>
          <Table className={classes.table} aria-label="permits-list-table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.heading}>Name</TableCell>
                <TableCell className={classes.heading}>Email Address</TableCell>
                <TableCell className={classes.heading}>Agency</TableCell>
              </TableRow>
            </TableHead>
            {contact.contacts.map((item, i) => (
              <TableBody key={i}>
                <TableRow>
                  <TableCell component="th" scope="row">
                    {item.first_name} {item.last_name}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {item.email_address}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {item.agency}
                  </TableCell>
                </TableRow>
              </TableBody>
            ))}
          </Table>
        </TableContainer>
      ) : (
        <Box component="ul" className="listNoBullets">
          <Box component="li">
            <Typography component="dd" variant="body1">
              No Contacts
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PublicProjectContact;
