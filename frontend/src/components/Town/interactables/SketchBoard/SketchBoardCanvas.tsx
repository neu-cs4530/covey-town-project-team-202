import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import SketchBoardAreaController from '../../../../classes/interactable/SketchBoardAreaController';
import { Color, TicTacToeGridPosition } from '../../../../types/CoveyTownSocket';

export type OfficeAreaProps = {
  officeAreaController: SketchBoardAreaController;
};

/**
 * A component that will render a single cell in the TicTacToe board, styled
 */
const StyledSketchBoardSquare = chakra(Button, {
  baseStyle: {
    height: '1px',
    width: '1px',
  },
});
/**
 * A component that will render the TicTacToe board, styled
 */
const StyledSketchBoard = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '1000px',
    height: '1000px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

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
  const toast = useToast();
  useEffect(() => {
    officeAreaController.addListener('boardChanged', setBoard);
    return () => {
      officeAreaController.removeListener('boardChanged', setBoard);
    };
  }, [officeAreaController]);
  return (
    <StyledSketchBoard aria-label='Sketch-board-canvas'>
      {board.map((row, rowIndex) => {
        return row.map((cell, colIndex) => {
          return <StyledSketchBoardSquare key={rowIndex * 1000 + colIndex} />;
        });
      })}
    </StyledSketchBoard>
  );
}
