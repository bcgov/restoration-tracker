import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  queryByTestId as rawQueryByTestId,
  getByTestId as rawGetByTestId
} from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import { Router } from 'react-router';
import ProjectAttachments from './ProjectAttachments';

const history = createMemoryHistory();

jest.mock('../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  project: {
    getProjectAttachments: jest.fn(),
    deleteProjectAttachment: jest.fn()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

const attachmentsList = [
  {
    id: 1,
    fileName: 'filename.test',
    lastModified: '2021-04-09 11:53:53',
    size: 3028,
    url: 'https://something.com'
  },
  {
    id: 20,
    fileName: 'filename20.test',
    lastModified: '2021-04-09 11:53:53',
    size: 30280000,
    url: 'https://something.com'
  },
  {
    id: 30,
    fileName: 'filename30.test',
    lastModified: '2021-04-09 11:53:53',
    size: 30280000000,
    securityToken: false,
    url: 'https://something.com'
  }
];

describe('ProjectAttachments', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.getProjectAttachments.mockClear();
    mockRestorationTrackerApi().project.deleteProjectAttachment.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('correctly opens and closes the file upload dialog', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <Router history={history}>
        <ProjectAttachments
          attachmentsList={attachmentsList}
          getAttachments={mockRestorationTrackerApi().project.getProjectAttachments}
        />
      </Router>
    );

    expect(getByTestId('h3-button-toolbar-Upload')).toBeInTheDocument();
    expect(queryByText('Upload Attachments')).not.toBeInTheDocument();

    fireEvent.click(getByTestId('h3-button-toolbar-Upload'));

    await waitFor(() => {
      expect(queryByText('Upload Attachments')).toBeInTheDocument();
    });

    expect(getByText('Close')).toBeInTheDocument();

    fireEvent.click(getByText('Close'));

    await waitFor(() => {
      expect(queryByText('Upload Attachments')).not.toBeInTheDocument();
    });
  });

  it('renders correctly with no attachments', () => {
    const { getByText } = render(
      <Router history={history}>
        <ProjectAttachments attachmentsList={[]} getAttachments={jest.fn()} />
      </Router>
    );

    expect(getByText('No Attachments')).toBeInTheDocument();
  });

  it('renders correctly with attachments', async () => {
    mockRestorationTrackerApi().project.getProjectAttachments.mockResolvedValue({ attachmentsList });

    const { getByText } = render(
      <Router history={history}>
        <ProjectAttachments
          attachmentsList={attachmentsList}
          getAttachments={mockRestorationTrackerApi().project.getProjectAttachments}
        />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('filename.test')).toBeInTheDocument();
    });
  });

  it('does not delete an attachment from the attachments when user selects no from dialog', async () => {
    mockRestorationTrackerApi().project.deleteProjectAttachment.mockResolvedValue(1);
    mockRestorationTrackerApi().project.getProjectAttachments.mockResolvedValue({ attachmentsList });

    const { baseElement, queryByText, getByTestId, queryByTestId, getAllByTestId } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectAttachments
            attachmentsList={attachmentsList}
            getAttachments={mockRestorationTrackerApi().project.getProjectAttachments}
          />
        </Router>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockRestorationTrackerApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: []
    });

    fireEvent.click(getAllByTestId('attachment-action-menu')[0]);

    await waitFor(() => {
      expect(rawQueryByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete')).toBeInTheDocument();
    });

    fireEvent.click(rawGetByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete'));

    await waitFor(() => {
      expect(queryByTestId('yes-no-dialog')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('no-button'));

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });
  });

  it('does not delete an attachment from the attachments when user clicks outside the dialog', async () => {
    mockRestorationTrackerApi().project.deleteProjectAttachment.mockResolvedValue(1);
    mockRestorationTrackerApi().project.getProjectAttachments.mockResolvedValue({ attachmentsList });

    const { baseElement, queryByText, getAllByRole, queryByTestId, getAllByTestId } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectAttachments
            attachmentsList={attachmentsList}
            getAttachments={mockRestorationTrackerApi().project.getProjectAttachments}
          />
        </Router>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockRestorationTrackerApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: []
    });

    fireEvent.click(getAllByTestId('attachment-action-menu')[0]);

    await waitFor(() => {
      expect(rawQueryByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete')).toBeInTheDocument();
    });

    fireEvent.click(rawGetByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete'));

    await waitFor(() => {
      expect(queryByTestId('yes-no-dialog')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    const background = getAllByRole('presentation')[0].firstChild;

    if (!background) {
      fail('Failed to click background.');
    }

    fireEvent.click(background);

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });
  });
});
