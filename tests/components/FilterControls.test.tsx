import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterControls } from '@/components/filters/FilterControls';
import { FilterState } from '@/types';

const mockFilterState: FilterState = {
  serverTypeFilter: 'all',
  timeGranularity: 'hourly',
  dateRange: {
    start: '2025-09-16T00:00:00.000Z',
    end: '2025-09-16T23:59:59.999Z'
  }
};

describe('FilterControls Component Contract', () => {
  test('should render with required props', () => {
    const mockOnChange = jest.fn();
    
    render(
      <FilterControls
        currentState={mockFilterState}
        onFilterChange={mockOnChange}
      />
    );
    
    // Should render server type filter
    expect(screen.getByText(/server type/i) || screen.getByText(/all/i)).toBeInTheDocument();
    
    // Should render time period selector
    expect(screen.getByText(/time period/i) || screen.getByText(/hourly/i)).toBeInTheDocument();
  });

  test('should call onFilterChange when server type changes', () => {
    const mockOnChange = jest.fn();
    
    render(
      <FilterControls
        currentState={mockFilterState}
        onFilterChange={mockOnChange}
      />
    );
    
    // Find and change server type select
    const serverTypeSelect = screen.getByLabelText(/filter by server type/i);
    fireEvent.change(serverTypeSelect, { target: { value: 'local' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      serverTypeFilter: 'local'
    });
  });

  test('should call onFilterChange when granularity changes', () => {
    const mockOnChange = jest.fn();
    
    render(
      <FilterControls
        currentState={mockFilterState}
        onFilterChange={mockOnChange}
      />
    );
    
    // Find and change granularity to daily
    const granularitySelect = screen.getByLabelText(/select time granularity/i);
    fireEvent.change(granularitySelect, { target: { value: 'daily' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      timeGranularity: 'daily'
    });
  });

  test('should be keyboard accessible', () => {
    const mockOnChange = jest.fn();
    
    render(
      <FilterControls
        currentState={mockFilterState}
        onFilterChange={mockOnChange}
      />
    );
    
    // Should be able to tab to controls
    const firstControl = screen.getByRole('button') || screen.getAllByRole('combobox')[0];
    expect(firstControl).toBeInTheDocument();
    
    // Focus should work
    firstControl.focus();
    expect(document.activeElement).toBe(firstControl);
  });

  test('should display current filter state correctly', () => {
    const customState: FilterState = {
      serverTypeFilter: 'remote',
      timeGranularity: 'daily',
      dateRange: {
        start: '2025-09-16T00:00:00.000Z',
        end: '2025-09-16T23:59:59.999Z'
      }
    };
    
    const mockOnChange = jest.fn();
    
    render(
      <FilterControls
        currentState={customState}
        onFilterChange={mockOnChange}
      />
    );
    
    // Should show current selections
    expect(screen.getByDisplayValue(/remote/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/daily/i)).toBeInTheDocument();
  });
});