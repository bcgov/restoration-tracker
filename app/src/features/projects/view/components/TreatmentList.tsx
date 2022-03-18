import { Accordion, AccordionDetails, AccordionSummary, Divider, Grid, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { IGetProjectTreatment, IGetTreatmentItem, TreatmentSearchCriteria } from 'interfaces/useProjectApi.interface';
import DoneDialog from 'components/dialog/DoneDialog';
import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiMenuUp } from '@mdi/js';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';

export interface IProjectTreatmentListProps {
  treatmentList: IGetProjectTreatment[];
  getTreatments: (forceFetch: boolean, selectedYears?: TreatmentSearchCriteria) => void;
  refresh: () => void;
}

const useStyles = makeStyles({
  treatmentsTable: {
    '& .MuiTableCell-root': {
      verticalAlign: 'top'
    }
  },
  accordion: {
    '& .MuiAccordionDetails-root': {
      padding: 0
    }
  },
  pagination: {
    flex: '0 0 auto'
  },
  container: {
    height: '300px',
    maxHeight: 440
  },
  generalInfoTitleColor: {
    color: '#787f81'
  },
  generalInfoGridRow: {
    marginTop: 5
  },
  divider: {
    height: 2,
    marginTop: 16,
    marginBottom: 16
  }
});

/**
 * General information content for a project.
 *
 * @return {*}
 */
const TreatmentList: React.FC<IProjectTreatmentListProps> = (props) => {
  const classes = useStyles();
  const { treatmentList } = props;

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const [tableOpen, setTableOpen] = useState(false);

  const [opentreatmentDetails, setOpentreatmentDetails] = useState(false);
  const [currentTreatmentDetail, setCurrentTreatmentDetail] = useState<IGetProjectTreatment>();

  const viewTreatmentUnitDetailsDialog = (treatment: IGetProjectTreatment) => {
    setCurrentTreatmentDetail(treatment);
    setOpentreatmentDetails(true);
  };

  const handleFormattingTreatmentsYears = (treatments: IGetTreatmentItem[]) => {
    const treatmentsByYear: { [key: string]: Set<string> } = {};

    treatments.forEach((item) => {
      if (!treatmentsByYear[item.treatment_year]) {
        treatmentsByYear[item.treatment_year] = new Set();
        treatmentsByYear[item.treatment_year].add(item.treatment_name);
      } else {
        treatmentsByYear[item.treatment_year].add(item.treatment_name);
      }
    });

    const Year_Treatments: string[] = Object.entries(treatmentsByYear).map(([key, value]) => {
      const treatmentNamesString = Array.from(value).join(', ');
      const treatmentNamesByYearString = `${key} - ${treatmentNamesString}`;

      return treatmentNamesByYearString;
    });

    return Year_Treatments;
  };

  const TreatmentDetailDialog = () => {
    if (!currentTreatmentDetail) {
      return <></>;
    }

    const generalInformation = [
      { title: 'ID', value: currentTreatmentDetail.id },
      { title: 'Type', value: currentTreatmentDetail.type },
      { title: 'Width (m) / Length (m)', value: `${currentTreatmentDetail.width} / ${currentTreatmentDetail.length}` },
      { title: 'Area (ha)', value: currentTreatmentDetail.area },
      { title: 'Treatments', value: handleFormattingTreatmentsYears(currentTreatmentDetail.treatments) }
    ];

    return (
      <DoneDialog
        open={opentreatmentDetails}
        dialogTitle={`Treatment Unit Details: ${currentTreatmentDetail.id}`}
        onClose={() => {
          setOpentreatmentDetails(false);
          setCurrentTreatmentDetail(undefined);
        }}>
        <Box component="section" mt="5px">
          <Typography variant="subtitle2">
            <b>GENERAL INFORMATION</b>
          </Typography>
          <Divider className={classes.divider} />
          <Box>
            {generalInformation.map((info, idx) => (
              <Grid container key={idx} className={classes.generalInfoGridRow}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" className={classes.generalInfoTitleColor}>
                    {info.title}
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  {(Array.isArray(info.value) && info.value.length > 1 && (
                    <Box component="ul" pl={2} m={0}>
                      {info.value.map((item: any) => (
                        <li key={item}>{item}</li>
                      ))}
                    </Box>
                  )) ||
                    info.value}
                </Grid>
              </Grid>
            ))}
          </Box>
        </Box>
        <Box component="section" mt="25px">
          <Typography variant="subtitle2">
            <b>DESCRIPTION OF AREA</b>
          </Typography>
          <Divider className={classes.divider} />
          <Typography variant="subtitle2">
            {currentTreatmentDetail.description || 'No description available'}
          </Typography>
        </Box>
        <Box component="section" mt="25px">
          <Typography variant="subtitle2">
            <b>COMMENTS</b>
          </Typography>
          <Divider className={classes.divider} />
          <Typography variant="subtitle2">{currentTreatmentDetail.comments || 'No comments'}</Typography>
        </Box>
      </DoneDialog>
    );
  };

  const formatTreatmentYearColumnTable = (treatments: IGetTreatmentItem[], returnTreatments: boolean) => {
    const formattedTreatmentsYears = handleFormattingTreatmentsYears(treatments);

    const filteredYears: JSX.Element[]= [];
    const filteredTreatments: JSX.Element[] = [];

    if (Array.isArray(formattedTreatmentsYears)) {
      formattedTreatmentsYears.forEach((item: string) => {
        const split = item.split(' - ');
        filteredYears.push(<Box key={item}>{split[0]}</Box>);
        filteredTreatments.push(<Box key={item}>{split[1]}</Box>);

        if(formattedTreatmentsYears[formattedTreatmentsYears.indexOf(item) +1]){
          filteredYears.push(<Divider key={split[0]}></Divider>);
          filteredTreatments.push(<Divider key={split[1]}></Divider>);
        }
      });
    }

    if(returnTreatments){
      return filteredTreatments;
    }

    return filteredYears;
  };

  return (
    <>
      <Accordion expanded={tableOpen} onChange={() => setTableOpen(!tableOpen)} className={classes.accordion}>
        <AccordionSummary expandIcon={<Icon path={mdiMenuUp} size={1} />}>
          <strong>
            Found {treatmentList?.length} {treatmentList?.length !== 1 ? 'treatments' : 'treatment'}
          </strong>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" height="100%" width="100%">
            <Box component={TableContainer} flex="1 1 auto">
              <Table size="small" stickyHeader className={classes.treatmentsTable} aria-label="treatments-list-table">
                <TableHead>
                  <TableRow>
                    <TableCell width="50">ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align='center'>Year</TableCell>
                    <TableCell>Treatments</TableCell>
                    <TableCell align="right">Width (m)</TableCell>
                    <TableCell align="right">Length (m)</TableCell>
                    <TableCell align="right">Area (ha)</TableCell>
                    <TableCell align="left" width="130">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody data-testid="project-table">
                  {!treatmentList?.length && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Box display="flex" justifyContent="center">
                          No Treatments
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}

                  {treatmentList.length > 0 &&
                    treatmentList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                      return (
                        <TableRow key={row.id}>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell align='center'>{formatTreatmentYearColumnTable(row.treatments, false)}</TableCell>
                          <TableCell>{formatTreatmentYearColumnTable(row.treatments, true)}</TableCell>
                          <TableCell align="right">{row.width}</TableCell>
                          <TableCell align="right">{row.length}</TableCell>
                          <TableCell align="right">{row.area}</TableCell>
                          <TableCell align="left">
                            <Button
                              size="small"
                              color="primary"
                              variant="outlined"
                              aria-label="view treatment unit details"
                              data-testid="view-treatment-unit-details"
                              onClick={() => viewTreatmentUnitDetailsDialog(row)}>
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </Box>

            <TablePagination
              className={classes.pagination}
              rowsPerPageOptions={[5, 10, 15, 20]}
              component="div"
              count={treatmentList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={(event: unknown, newPage: number) => handleChangePage(event, newPage, setPage)}
              onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) =>
                handleChangeRowsPerPage(event, setPage, setRowsPerPage)
              }
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <TreatmentDetailDialog />
    </>
  );
};

export default TreatmentList;
