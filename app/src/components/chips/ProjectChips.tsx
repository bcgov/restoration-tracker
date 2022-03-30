import Chip, { ChipProps } from '@material-ui/core/Chip';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import moment from 'moment';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chip: {
      color: 'white',
      textTransform: 'uppercase',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.02rem'
    },
    chipActive: {
      backgroundColor: theme.palette.success.main
    },
    chipPublishedCompleted: {
      backgroundColor: theme.palette.success.main
    },
    chipUnpublished: {
      backgroundColor: theme.palette.text.disabled
    },
    chipDraft: {
      backgroundColor: theme.palette.info.main
    },
    chipPriority: {
      backgroundColor: theme.palette.info.dark
    }
  })
);

export const ProjectStatusChip: React.FC<{ startDate: string; endDate?: string; chipProps?: Partial<ChipProps> }> = (
  props
) => {
  const classes = useStyles();

  let chipLabel;
  let chipStatusClass;

  if (!props.endDate || moment(props.endDate).endOf('day').isAfter(moment())) {
    chipLabel = 'Active';
    chipStatusClass = classes.chipActive;
  } else {
    chipLabel = 'Completed';
    chipStatusClass = classes.chipPublishedCompleted;
  }

  return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} {...props.chipProps} />;
};

export const ProjectDraftChip: React.FC<{ chipProps?: Partial<ChipProps> }> = (props) => {
  const classes = useStyles();

  return <Chip size="small" className={clsx(classes.chip, classes.chipDraft)} label="Draft" {...props.chipProps} />;
};

export const ProjectPriorityChip: React.FC<{ chipProps?: Partial<ChipProps> }> = (props) => {
  const classes = useStyles();

  return (
    <Chip size="small" className={clsx(classes.chip, classes.chipPriority)} label="Priority" {...props.chipProps} />
  );
};
