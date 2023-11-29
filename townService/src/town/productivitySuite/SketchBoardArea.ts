import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  OfficeInstance,
  SketchBoardState,
} from '../../types/CoveyTownSocket';
import OfficeArea from './OfficeArea';
import SketchBoardModel from './SketchBoardModel';

/**
 * A SketchBoardArea is an OfficeeArea that hosts a SketchBoard.
 */
export default class SketchBoardArea extends OfficeArea<SketchBoardModel> {
  protected getType(): InteractableType {
    return 'SketchBoardArea';
  }

  private _stateUpdated(updatedState: OfficeInstance<SketchBoardState>) {
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a user in this office area.
   * Supported commands:
   * - JoinOffice
   * - LeaveOffice
   * - PrivacyCommand
   * - OfficeUpdate
   * - OccupancyLimit
   * - SetDrawEnableCommand
   *
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - Any command: No office in progress (No office to leave)
   *  - Any command: invalid office ID (invalid office ID)
   *  - Any command: player is not in the game (Player not in game)
   *  - Commands controlled by the leader: player is not the leader (Only the leader can _)
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'JoinOffice') {
      let office = this._office;
      if (!office) {
        // No office in progress, make a new one
        office = new SketchBoardModel();
        this._office = office;
      }
      office.join(player);
      this._stateUpdated(office.toModel());
      return { officeID: office.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveOffice') {
      const office = this._office;
      if (!office) {
        throw new InvalidParametersError('No office to leave');
      }
      if (this._office?.id !== command.officeID) {
        throw new InvalidParametersError('invalid office ID');
      }
      office.leave(player);
      this._stateUpdated(office.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'PrivacyCommand') {
      const office = this._office;
      if (!office) {
        throw new InvalidParametersError('No office to leave');
      }
      if (this._office?.id !== command.officeID) {
        throw new InvalidParametersError('invalid office ID');
      }
      if (player.id !== this.office?.state.leader) {
        throw new InvalidParametersError('only the leader can set privacy');
      }
      office.privacy = command.privacySetting;
      this._stateUpdated(office.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'OfficeUpdate') {
      const office = this._office;
      if (!office) {
        throw new InvalidParametersError('No office to leave');
      }
      if (this._office?.id !== command.officeID) {
        throw new InvalidParametersError('invalid office ID');
      }
      this.office?.applyUpdate(player, command.update);
      this._stateUpdated(office.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'OccupancyLimit') {
      const office = this._office;
      if (!office) {
        throw new InvalidParametersError('No office to leave');
      }
      if (this._office?.id !== command.officeID) {
        throw new InvalidParametersError('invalid office ID');
      }
      if (player.id !== this.office?.state.leader) {
        throw new InvalidParametersError('only the leader can set privacy');
      }
      office.occupancyLimit = command.limit;
      this._stateUpdated(office.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SetDrawEnableCommand') {
      if (!this._office) {
        throw new InvalidParametersError('No office to leave');
      }
      if (player.id !== this.office?.state.leader) {
        throw new InvalidParametersError('Only the leader can enable drawing');
      }
      this.office.drawEnabled = command.newDrawEnable;
      this._stateUpdated(this.office.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
