import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { fireEvent, render, waitFor } from '@testing-library/react';
import DoneDialog from 'components/dialog/DoneDialog';
import React from 'react';

const handleOnClose = jest.fn();

const TestComponent = () => {
  return (
    <Box>
      <Typography>This is a test component</Typography>
    </Box>
  );
};

const renderContainer = ({ dialogTitle, open = true }: { dialogTitle: string; open?: boolean }) => {
  return render(
    <div id="root">
      <DoneDialog dialogTitle={dialogTitle} open={open} onClose={handleOnClose}>
        <TestComponent />
      </DoneDialog>
    </div>
  );
};

describe('DoneDialog', () => {
  it('matches the snapshot when not open', () => {
    const { baseElement } = renderContainer({ dialogTitle: 'this is a test', open: false });

    expect(baseElement).toMatchSnapshot();
  });

  it('matches snapshot when open', () => {
    const { baseElement } = renderContainer({ dialogTitle: 'this is a test' });

    expect(baseElement).toMatchSnapshot();
  });

  it('calls the onClose prop when `Done` button is clicked', async () => {
    const { findByText } = renderContainer({ dialogTitle: 'this is a test' });

    const CloseButton = await findByText('Done', { exact: false });

    fireEvent.click(CloseButton);

    await waitFor(() => {
      expect(handleOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
