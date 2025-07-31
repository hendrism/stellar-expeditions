import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Notification from './Notification';

describe('Notification component', () => {
  it('renders notification content and triggers onClose', () => {
    const handleClose = jest.fn();
    const notification = {
      type: 'success',
      title: 'Mission Complete',
      message: 'All objectives achieved'
    };
    render(<Notification notification={notification} onClose={handleClose} />);
    expect(screen.getByText('Mission Complete')).toBeInTheDocument();
    expect(screen.getByText('All objectives achieved')).toBeInTheDocument();
    fireEvent.click(screen.getByText('OK'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('returns null when notification is not provided', () => {
    const { container } = render(<Notification notification={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
