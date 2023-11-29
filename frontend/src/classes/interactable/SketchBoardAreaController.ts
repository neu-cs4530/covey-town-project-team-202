import _ from 'lodash';
import {
  Color,
  DrawPixel,
  OfficeArea,
  OfficeCommand,
  PlayerID,
  PlayerScore,
  SketchBoardState,
} from '../../types/CoveyTownSocket';
import OfficeAreaController, { OfficeEventTypes } from './OfficeAreaController';
import { SKETCHBOARD_HEIGHT, SKETCHBOARD_WIDTH } from '../../../../townService/src/lib/Constants';

export type SketchBoardEvents = OfficeEventTypes & {
  canvasChanged: (board: Color[][]) => void;
  occupancyLimitChanged: (newLimit: number) => void;
  drawEnableChanged: (newDrawEnable: boolean) => void;
  scoresChanged: (newScores: PlayerScore[]) => void;
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
    if (newModel.office) {
      if (!_.isEqual(newModel.office?.state.board, oldModel.office?.state.board)) {
        this.emit('canvasChanged', this.board);
      }
      if (newModel.office?.state.drawEnabled !== oldModel.office?.state.drawEnabled) {
        this.emit('drawEnableChanged', newModel.office.state.drawEnabled);
      }
      if (oldModel.office?.state.privacy !== newModel.office.state.privacy) {
        this.emit('roomLockChanged', this.roomLocked);
      }
      if (oldModel.office?.state.pointsList !== newModel.office.state.pointsList) {
        this.emit('scoresChanged', this.playerScores);
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
    this._sendInteractableCommandHelper({
      type: 'OfficeUpdate',
      officeID: 's',
      update: {
        type: 'DrawCommand',
        stroke: pixelsToDraw,
      },
    });
  }

  public async resetBoard() {
    this._sendInteractableCommandHelper({
      type: 'OfficeUpdate',
      officeID: 's',
      update: {
        type: 'ResetCommand',
      },
    });
  }

  public get drawEnabled(): boolean {
    if (!this._model.office) {
      return true;
    }
    return this._model.office.state.drawEnabled;
  }

  public async setDrawEnabled(newDrawEnabledValue: boolean) {
    this._sendInteractableCommandHelper({
      type: 'SetDrawEnableCommand',
      newDrawEnable: newDrawEnabledValue,
    });
  }

  public get leader(): PlayerID | undefined {
    return this._model.office?.state.leader;
  }

  public lockRoom(shouldLock: boolean) {
    if (shouldLock) {
      this._setPrivacy('PRIVATE');
    } else {
      this._setPrivacy('PUBLIC');
    }
  }

  public get isPlayerLeader(): boolean {
    return this._townController.ourPlayer.id === this._model.office?.state.leader;
  }

  public get playerScores(): PlayerScore[] {
    return this._model.office?.state.pointsList ?? [];
  }

  public async newScore(playerID: PlayerID, newScore: number) {
    this._sendInteractableCommandHelper({
      type: 'OfficeUpdate',
      officeID: 's',
      update: {
        type: 'UpdateScore',
        playerID: playerID,
        score: newScore,
      },
    });
  }

  private async _sendInteractableCommandHelper(command: OfficeCommand) {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        ...command,
        officeID: instanceID,
      });
    }
  }
}
