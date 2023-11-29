import { Switch } from '@chakra-ui/react';
import React, { useContext } from 'react';
import { OfficeAreaProps } from './SketchBoardCanvas';
import { SketchBoardContext, SketchBoardContextType } from './sketchBoardContext';

/**
 * LeaderSettings component that has the available settings for a sketch board
 * that only a leader a can see
 * @param officeAreaController the controller of the specific office area
 * @constructor
 */
function LeaderSettings({ officeAreaController }: OfficeAreaProps): JSX.Element {
  const { drawEnabled, roomLocked } = useContext(SketchBoardContext) as SketchBoardContextType;
  return (
    <>
      <Switch
        onChange={async () => {
          await officeAreaController.setDrawEnabled(!drawEnabled);
        }}>
        {drawEnabled ? 'Drawing enabled' : 'Enable drawing'}
      </Switch>
      <br></br>
      <Switch
        onChange={async () => {
          await officeAreaController.lockRoom(!roomLocked);
        }}>
        {roomLocked ? 'Room is locked' : 'Room is unlocked'}
      </Switch>
    </>
  );
}

export default LeaderSettings;
