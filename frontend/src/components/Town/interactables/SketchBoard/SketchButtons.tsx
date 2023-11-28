import { Button } from '@chakra-ui/react';
import React from 'react';
import { OfficeAreaProps } from './SketchBoardCanvas';

function SketchButtons({ officeAreaController }: OfficeAreaProps): JSX.Element {
  return (
    <>
      <Button
        onClick={async () => {
          await officeAreaController.joinOffice();
        }}>
        Join SketchBoard
      </Button>
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
