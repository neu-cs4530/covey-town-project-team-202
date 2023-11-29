import React, { useContext } from 'react';
import { TwitterPicker } from 'react-color';
import { SketchBoardContext, SketchBoardContextType } from './sketchBoardContext';
import { Box } from '@chakra-ui/react';

/**
 * ColorSelector component that has the available colors for a sketch board
 * @param officeAreaController the office area controller being used
 * @constructor
 */
export default function ColorSelector(): JSX.Element {
  const { color, setColor } = useContext(SketchBoardContext) as SketchBoardContextType;

  const handleColorChange = (newColor: any): void => {
    setColor(newColor.hex);
  };
  return (
    <Box mt='10px' mb='10px'>
      <TwitterPicker color={color} onChangeComplete={handleColorChange} />
    </Box>
  );
}
