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
   * The board is a SKETCHBOARD_HEIGHTxSKETCHBOARD_WIDTH array of Color.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   * and board[SKETCHBOARD_HEIGHT][SKETCHBOARD_WIDTH] is the bottom-right cell
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
   * Updates the internal state of this SketchBoardAreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and
   * other common properties (including this._model).
   *
   * If the board has changed, emits a 'boardChanged' event with the new board. If the board has not changed,
   *  does not emit the event.
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
   * Sends a request to the server to draw a pixel
   *
   * @param pixelsToDraw the list of pixels to draw with the respective color
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

  /**
   * Sends a request to the server to reset the board
   */
  public async resetBoard() {
    this._sendInteractableCommandHelper({
      type: 'OfficeUpdate',
      officeID: 's',
      update: {
        type: 'ResetCommand',
      },
    });
  }

  /**
   * Gets the models drawEnabled state
   */
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

  /**
   * Gets the models leader
   */
  public get leader(): PlayerID | undefined {
    return this._model.office?.state.leader;
  }

  /**
   * sets the privacy to locked or unlocked based on input
   * @param shouldLock what to set the privacy to
   */
  public lockRoom(shouldLock: boolean) {
    if (shouldLock) {
      this._setPrivacy('PRIVATE');
    } else {
      this._setPrivacy('PUBLIC');
    }
  }

  /**
   * Determines if our player is the leader
   */
  public get isPlayerLeader(): boolean {
    return this._townController.ourPlayer.id === this._model.office?.state.leader;
  }

  /**
   * gets the list of player scores
   */
  public get playerScores(): PlayerScore[] {
    return this._model.office?.state.pointsList ?? [];
  }

  /**
   * Sends a request to the server to update the score of a player
   * @param playerID the player who's score to update
   * @param newScore the new score to give the player
   */
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
