import { Button } from '@chakra-ui/react';
import React, { useContext } from 'react';
import { OfficeAreaProps } from './SketchBoardCanvas';
import { SketchBoardContext, SketchBoardContextType } from './sketchBoardContext';

function SketchButtons({ officeAreaController }: OfficeAreaProps): JSX.Element {
  const { color, drawEnabled } = useContext(SketchBoardContext) as SketchBoardContextType;
  return (
    <>
      {(officeAreaController.isPlayerLeader || drawEnabled) && (
        <Button
          ml='40px'
          mt='auto'
          mb='auto'
          onClick={async () => {
            await officeAreaController.resetBoard();
          }}>
          ↻
        </Button>
      )}
      <Button
        m='10px'
        mt='auto'
        mb='auto'
        onClick={async () => {
          await officeAreaController.leaveOffice();
        }}>
        Leave
      </Button>
    </>
  );
}

export default SketchButtons;
