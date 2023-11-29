import { border, Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  SKETCHBOARD_PIXEL,
  SKETCHBOARD_WIDTH,
  SKETCHBOARD_HEIGHT,
} from '../../../../../../townService/src/lib/Constants';
import SketchBoardAreaController from '../../../../classes/interactable/SketchBoardAreaController';
import { Color } from '../../../../types/CoveyTownSocket';
import { on } from 'events';

export type OfficeAreaProps = {
  officeAreaController: SketchBoardAreaController;
};

/**
 * A component that renders the TicTacToe board
 *
 * Renders the TicTacToe board as a "StyledTicTacToeBoard", which consists of 9 "StyledTicTacToeSquare"s
 * (one for each cell in the board, starting from the top left and going left to right, top to bottom).
 * Each StyledTicTacToeSquare has an aria-label property that describes the cell's position in the board,
 * formatted as `Cell ${rowIndex},${colIndex}`.
 *
 * The board is re-rendered whenever the board changes, and each cell is re-rendered whenever the value
 * of that cell changes.
 *
 * If the current player is in the office, then each StyledTicTacToeSquare is clickable, and clicking
 * on it will make a move in that cell. If there is an error making the move, then a toast will be
 * displayed with the error message as the description of the toast. If it is not the current player's
 * turn, then the StyledTicTacToeSquare will be disabled.
 *
 * @param officeAreaController the controller for the TicTacToe office
 */
export default function SketchBoardCanvas({ officeAreaController }: OfficeAreaProps): JSX.Element {
  const [board, setBoard] = useState<Color[][]>(officeAreaController.board);
  const [currentColor, setCurrentColor] = useState<Color>(`#123456`);
  const [shouldDraw, setShouldDraw] = useState<boolean>(false);
  const toast = useToast();

  const handleBoardChanged = (newBoard: Color[][]) => {
    setBoard(newBoard);
  };
  useEffect(() => {
    officeAreaController.addListener('canvasChanged', handleBoardChanged);
    return () => {
      officeAreaController.removeListener('canvasChanged', handleBoardChanged);
    };
  }, [officeAreaController]);

  const draw = async () => {
    if (shouldDraw) {
      await officeAreaController.drawPixel([{ x: 0, y: 0, color: currentColor }]);
    }
  };

  return (
    <table style={{ border: '1px black solid' }}>
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
                      width: '20px',
                      backgroundColor: board[rowIndex][colIndex],
                    }}
                    onMouseDown={() => setShouldDraw(true)}
                    onMouseUp={() => setShouldDraw(false)}
                    onMouseEnter={async () => {
                      if (shouldDraw) {
                        await officeAreaController.drawPixel([
                          { x: rowIndex, y: colIndex, color: currentColor },
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
