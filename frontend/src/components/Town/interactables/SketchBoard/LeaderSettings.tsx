import { Switch, Text } from '@chakra-ui/react';
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
      <Text fontSize='2xl'>Board Settings</Text>
      <Switch
        isChecked={drawEnabled}
        onChange={async () => {
          await officeAreaController.setDrawEnabled(!drawEnabled);
        }}>
        Allow Drawing
      </Switch>
      <br></br>
      <Switch
        onChange={async () => {
          await officeAreaController.lockRoom(!roomLocked);
        }}>
        Allow More Participants
      </Switch>
    </>
  );
}

export default LeaderSettings;
