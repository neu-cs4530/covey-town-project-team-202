import { PRIVATE } from '../../lib/Constants';
import Player from '../../lib/Player';
import { PrivacyType, SketchBoardState } from '../../types/CoveyTownSocket';
import Office from './OfficeModel';

export default class SketchBoardModel extends Office<SketchBoardState> {
  protected _join(player: Player): void {
    if (this._players.length === this._occupancyLimit) {
      throw new Error('Method not implemented.');
    }

    if (this._players.filter(p => p.id === player.id)) {
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

  public get privacy(): PrivacyType {
    return this.state.privacy;
  }

  public set privacy(newPrivacy: PrivacyType) {
    this.privacy = newPrivacy;
  }
}
