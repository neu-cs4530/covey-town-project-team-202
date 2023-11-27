import { DEFAULT_OCCUPANCY_LIMIT } from '../../lib/Constants';
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
   *   - SketchBoardCommand
   *    - DrawCommand
   *    - ResetCommand
   *
   * If the command ended the office, records the outcome in this._history
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
   *  - LeaveGame and GameMove: No office in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the office in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
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
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
