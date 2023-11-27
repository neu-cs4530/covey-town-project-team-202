import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { TwitterPicker } from 'react-color';
import { OfficeAreaProps } from './SketchBoardCanvas';

export default function ColorSelector({ officeAreaController }: OfficeAreaProps): JSX.Element {
  return <TwitterPicker />;
}
