import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Stellar Expeditions title', () => {
  render(<App />);
  const heading = screen.getByText(/Stellar Expeditions/i);
  expect(heading).toBeInTheDocument();
});
