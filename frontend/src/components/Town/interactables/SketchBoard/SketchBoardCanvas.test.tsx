import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SketchBoardCanvas from './SketchBoardCanvas';
import { SketchBoardContextType } from './sketchBoardContext';

jest.mock('../../../../hooks/useTownController', () => jest.fn());
jest.mock('./sketchBoardContext', () => ({
  SketchBoardContext: {
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Consumer: ({ children }: { children: (value: SketchBoardContextType) => React.ReactNode }) =>
      <>{children({ color: '#ffffff', drawEnabled: true })}</>,
  },
}));

describe('SketchBoardCanvas', () => {
  let mockAreaController: any;
  let mockContextValue: SketchBoardContextType;

  beforeEach(() => {
    mockAreaController = {
      board: [
        ['#ffffff', '#ffffff', '#ffffff'],
        ['#ffffff', '#ffffff', '#ffffff'],
        ['#ffffff', '#ffffff', '#ffffff'],
      ],
      drawPixel: jest.fn(),
    };

    mockContextValue = {
      color: 'red',
      drawEnabled: true,
    };
  });

  test('renders SketchBoardCanvas component', () => {
    const { container } = render(
      <SketchBoardCanvas officeAreaController={mockAreaController} />
    );
    expect(container).toBeInTheDocument();
  });

  test('handles mouse events for drawing', async () => {
    const { container } = render(
      <SketchBoardCanvas officeAreaController={mockAreaController} />
    );

    const cell = container.querySelector('td');

    fireEvent.mouseDown(cell);
    fireEvent.mouseUp(cell);

    expect(mockAreaController.drawPixel).toHaveBeenCalledTimes(1);
    expect(mockAreaController.drawPixel).toHaveBeenCalledWith([
      { x: 0, y: 0, color: mockContextValue.color },
    ]);
  });

  // Add more tests as needed
});
