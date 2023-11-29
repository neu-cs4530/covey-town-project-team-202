import { createContext } from 'react';
import { Color } from '../../../../types/CoveyTownSocket';

/**
 * Context for the SketchBoard component
 */
export type SketchBoardContextType = {
  color: Color;
  setColor: (color: Color) => void;
  drawEnabled: boolean;
  setDrawEnabled: (enabled: boolean) => void;
  roomLocked: boolean;
  setRoomLocked: (isLocked: boolean) => void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SketchBoardContext = createContext<SketchBoardContextType | undefined>(undefined);
