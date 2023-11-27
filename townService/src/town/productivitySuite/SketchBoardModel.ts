import {
  DEFAULT_OCCUPANCY_LIMIT,
  PRIVATE,
  SKETCHBOARD_HEIGHT,
  SKETCHBOARD_WIDTH,
} from '../../lib/Constants';
import Player from '../../lib/Player';
import {
  Color,
  DrawCommand,
  DrawPixel,
  PlayerScore,
  SketchBoardState,
  SketchBoardUpdateCommand,
  UpdateScoreCommand,
} from '../../types/CoveyTownSocket';
import Office from './OfficeModel';

export default class SketchBoardModel extends Office<SketchBoardState, SketchBoardUpdateCommand> {
  public constructor() {
    const board: Color[][] = [];
    for (let i = 0; i < SKETCHBOARD_HEIGHT; i++) {
      const row: Color[] = [];
      for (let j = 0; j < SKETCHBOARD_WIDTH; j++) {
        row.push(`#${'ffffff'}`);
      }
      board.push(row);
    }
    super({
      board,
      backgroundColor: `#${'ffffff'}`,
      privacy: 'PUBLIC',
      occupancyLimit: DEFAULT_OCCUPANCY_LIMIT,
      leader: undefined,
      pointsList: [],
    });
  }

  public applyUpdate(update: SketchBoardUpdateCommand): void {
    switch (update.type) {
      case 'DrawCommand':
        // eslint-disable-next-line no-case-declarations
        const drawCommand = update as DrawCommand;
        this._drawPixel(drawCommand.stroke);
        break;
      case 'ResetCommand':
        this._resetBoard();
        break;
      case 'UpdateScore':
        this._updateScore(update);
        break;
      default:
    }
  }

  private _updateScore(update: UpdateScoreCommand): void {
    const { playerID, score } = update;

    if (this._players.filter(p => p.id === playerID).length === 0) {
      throw new Error('Player is not in sketch board');
    }

    const playerScore = this.state.pointsList.find(p => p.playerID === playerID);
    if (playerScore) {
      playerScore.score = score;
    } else {
      const newPlayerScore: PlayerScore = {
        playerID,
        score,
      };
      this.state.pointsList.push(newPlayerScore);
    }
  }

  private _resetBoard(): void {
    for (let i = 0; i < this.state.board.length; i++) {
      for (let j = 0; j < this.state.board[0].length; j++) {
        this.state.board[i][j] = this.state.backgroundColor;
      }
    }
  }

  private _drawPixel(stroke: DrawPixel[]): void {
    stroke.forEach((pixelToDraw: DrawPixel) => {
      // TODO: add error messages if x and y out of bounds
      this.state.board[pixelToDraw.x][pixelToDraw.y] = pixelToDraw.color;
    });
  }

  protected _join(player: Player): void {
    if (this._players.length === this.occupancyLimit) {
      throw new Error('Sketch board is full');
    }

    if (this._players.filter(p => p.id === player.id).length > 0) {
      throw new Error('PLAYER EXIST');
    }

    if (this.privacy === PRIVATE) {
      throw new Error('Board is private');
    }

    if (!this.state.leader) {
      this.state.leader = player.id;
    }
  }

  protected _leave(player: Player): void {
    if (!this._players.filter(p => p.id === player.id)) {
      throw new Error('PLAYER DOES NOT EXIST');
    }

    if (this._players.length === 1) {
      this.state.leader = undefined;
    } else if (player.id === this.state.leader) {
      const otherPlayers = this._players.filter(p => p.id !== player.id);
      this.state.leader = otherPlayers[0].id;
    }
  }
}
