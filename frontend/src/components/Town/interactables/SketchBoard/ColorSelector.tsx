import React, { useContext } from 'react';
import { TwitterPicker } from 'react-color';
import { OfficeAreaProps } from './SketchBoardCanvas';
import { SketchBoardContext, SketchBoardContextType } from './sketchBoardContext';

/**
 * ColorSelector component that has the available colors for a sketch board
 * @param officeAreaController the office area controller being used
 * @constructor
 */
export default function ColorSelector({ officeAreaController }: OfficeAreaProps): JSX.Element {
  const { color, setColor } = useContext(SketchBoardContext) as SketchBoardContextType;

  const handleColorChange = (newColor: any): void => {
    setColor(newColor.hex);
  };
  return <TwitterPicker color={color} onChangeComplete={handleColorChange} />;
}
