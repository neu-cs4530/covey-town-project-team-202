import React, { useContext } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { TwitterPicker } from 'react-color';
import { OfficeAreaProps } from './SketchBoardCanvas';
import { SketchBoardContext, SketchBoardContextType } from './sketchBoardContext';

export default function ColorSelector({ officeAreaController }: OfficeAreaProps): JSX.Element {
  const { color, setColor } = useContext(SketchBoardContext) as SketchBoardContextType;

  const handleColorChange = (newColor: any): void => {
    setColor(newColor.hex);
  };
  return <TwitterPicker color={color} onChangeComplete={handleColorChange} />;
}
