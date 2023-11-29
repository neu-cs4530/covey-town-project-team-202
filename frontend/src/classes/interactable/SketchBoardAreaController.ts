import _ from 'lodash';
import { Color, DrawPixel, OfficeArea, SketchBoardState } from '../../types/CoveyTownSocket';
import OfficeAreaController, { OfficeEventTypes } from './OfficeAreaController';
import { SKETCHBOARD_HEIGHT, SKETCHBOARD_WIDTH } from '../../../../townService/src/lib/Constants';

export type SketchBoardEvents = OfficeEventTypes & {
  canvasChanged: (board: Color[][]) => void;
  privacyChanged: (isOurTurn: boolean) => void;
  occupancyLimitChanged: (newLimit: number) => void;
};

/**
 * This class is responsible for managing the state of the Tic Tac Toe game, and for sending commands to the server
 */
export default class SketchBoardAreaController extends OfficeAreaController<
  SketchBoardState,
  SketchBoardEvents
> {
  public isActive(): boolean {
    return true;
  }

  /**
   * Returns the current state of the board.
   *
   * The board is a 3x3 array of TicTacToeCell, which is either 'X', 'O', or undefined.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[2][2] is the bottom-right cell
   */
  get board(): Color[][] {
    // TODO: make a copy of the board instead of using exact (maybe)
    if (!this._model.office) {
      const board: Color[][] = [];
      for (let i = 0; i < SKETCHBOARD_HEIGHT; i++) {
        const row: Color[] = [];
        for (let j = 0; j < SKETCHBOARD_WIDTH; j++) {
          row.push(`#${'ffffff'}`);
        }
        board.push(row);
      }
      return board;
    }
    return this._model.office.state.board;
  }

  /**
   * Updates the internal state of this TicTacToeAreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and
   * other common properties (including this._model).
   *
   * If the board has changed, emits a 'boardChanged' event with the new board. If the board has not changed,
   *  does not emit the event.
   *
   * If the turn has changed, emits a 'turnChanged' event with true if it is our turn, and false otherwise.
   * If the turn has not changed, does not emit the event.
   */
  protected _updateFrom(newModel: OfficeArea<SketchBoardState>): void {
    // TODO
    const oldModel = this._model;
    super._updateFrom(newModel);
    if (newModel) {
      if (!_.isEqual(newModel.office?.state.board, oldModel.office?.state.board)) {
        this.emit('canvasChanged', this.board);
      }
    }
  }

  /**
   * Sends a request to the server to make a move in the game
   *
   * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
   *
   * @param row Row of the move
   * @param col Column of the move
   */
  public async drawPixel(pixelsToDraw: DrawPixel[]) {
    const instanceID = this._instanceID;
    if (!instanceID) {
      throw new Error('No board right now');
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'OfficeUpdate',
      officeID: instanceID,
      update: {
        type: 'DrawCommand',
        stroke: pixelsToDraw,
      },
    });
  }

  public async resetBoard() {
    const instanceID = this._instanceID;
    if (!instanceID) {
      throw new Error('No board right now');
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'OfficeUpdate',
      officeID: instanceID,
      update: {
        type: 'ResetCommand',
      },
    });
  }
}
