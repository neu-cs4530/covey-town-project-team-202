import React, { useContext, useEffect, useState } from 'react';
import {
  SKETCHBOARD_PIXEL,
  SKETCHBOARD_WIDTH,
  SKETCHBOARD_HEIGHT,
} from '../../../../../../townService/src/lib/Constants';
import SketchBoardAreaController from '../../../../classes/interactable/SketchBoardAreaController';
import { Color } from '../../../../types/CoveyTownSocket';
import { SketchBoardContext, SketchBoardContextType } from './sketchBoardContext';
import useTownController from '../../../../hooks/useTownController';

export type OfficeAreaProps = {
  officeAreaController: SketchBoardAreaController;
};

/**
 * A component that renders the Sketch Board
 *
 * Each cell is drawable on mouse click/hold and is always visible to all players
 * Only able to draw on any cell if the drawEnabled is true or you're the leader
 *
 * @param officeAreaController the controller of the specific office area
 */
export default function SketchBoardCanvas({ officeAreaController }: OfficeAreaProps): JSX.Element {
  const townController = useTownController();
  const { color, drawEnabled } = useContext(SketchBoardContext) as SketchBoardContextType;
  const [board, setBoard] = useState<Color[][]>(officeAreaController.board);
  const [shouldDraw, setShouldDraw] = useState<boolean>(false);

  const handleBoardChanged = (newBoard: Color[][]) => {
    setBoard(newBoard);
  };
  useEffect(() => {
    officeAreaController.addListener('canvasChanged', handleBoardChanged);
    return () => {
      officeAreaController.removeListener('canvasChanged', handleBoardChanged);
    };
  }, [officeAreaController]);

  return (
    <table
      style={{
        border: '1px black solid',
        width: SKETCHBOARD_WIDTH * SKETCHBOARD_PIXEL,
        height: SKETCHBOARD_HEIGHT * SKETCHBOARD_PIXEL,
      }}>
      <tbody>
        {board.map((row, rowIndex) => {
          return (
            <tr key={rowIndex}>
              {row.map((_, colIndex) => {
                return (
                  <td
                    key={rowIndex * 10 + colIndex}
                    style={{
                      height: SKETCHBOARD_PIXEL,
                      width: SKETCHBOARD_PIXEL,
                      backgroundColor: board[rowIndex][colIndex],
                    }}
                    onMouseDown={() => setShouldDraw(true)}
                    onMouseUp={() => setShouldDraw(false)}
                    onMouseEnter={async () => {
                      if (
                        shouldDraw &&
                        (drawEnabled || townController.ourPlayer.id === officeAreaController.leader)
                      ) {
                        await officeAreaController.drawPixel([
                          { x: rowIndex, y: colIndex, color: color },
                        ]);
                      }
                    }}
                  />
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
