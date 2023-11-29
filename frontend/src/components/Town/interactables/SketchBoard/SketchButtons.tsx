import { Button } from '@chakra-ui/react';
import React from 'react';
import { OfficeAreaProps } from './SketchBoardCanvas';

/**
 * SketchButtons component that has buttons to handle leaving and resetting the sketch board
 * @param officeAreaController the controller of the specific office area
 * @constructor
 */
function SketchButtons({ officeAreaController }: OfficeAreaProps): JSX.Element {
  return (
    <>
      <Button
        onClick={async () => {
          await officeAreaController.leaveOffice();
        }}>
        Leave SketchBoard
      </Button>
      <Button
        onClick={async () => {
          await officeAreaController.resetBoard();
        }}>
        Reset SketchBoard
      </Button>
    </>
  );
}

export default SketchButtons;
