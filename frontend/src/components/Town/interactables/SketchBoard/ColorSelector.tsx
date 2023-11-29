import React, { useContext } from 'react';
import { TwitterPicker } from 'react-color';
import { OfficeAreaProps } from './SketchBoardCanvas';
import { SketchBoardContext, SketchBoardContextType } from './sketchBoardContext';
import { Box } from '@chakra-ui/react';

export default function ColorSelector({ officeAreaController }: OfficeAreaProps): JSX.Element {
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
