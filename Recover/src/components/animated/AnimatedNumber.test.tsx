import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedNumber } from './AnimatedNumber';

describe('AnimatedNumber', () => {
  it('should render the number', () => {
    render(<AnimatedNumber value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render with custom duration', () => {
    render(<AnimatedNumber value={100} duration={2} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render zero correctly', () => {
    render(<AnimatedNumber value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render negative numbers', () => {
    render(<AnimatedNumber value={-5} />);
    expect(screen.getByText('-5')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AnimatedNumber value={42} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
