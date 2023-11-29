import _ from 'lodash';
import {
  OfficeArea,
  GameInstanceID,
  InteractableID,
  OfficeState,
  PrivacyType,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';

export type OfficeEventTypes = BaseInteractableEventMap & {
  officeStart: () => void;
  officeUpdated: () => void;
  officeEnd: () => void;
  playersChange: (newPlayers: PlayerController[]) => void;
  roomLockChanged: (isLocked: boolean) => void;
};

/**
 * This class is the base class for all office controllers. It is responsible for managing the
 * state of the office, and for sending commands to the server to update the state of the office.
 * It is also responsible for notifying the UI when the state of the office changes, by emitting events.
 */
export default abstract class OfficeAreaController<
  State extends OfficeState,
  EventTypes extends OfficeEventTypes,
> extends InteractableAreaController<EventTypes, OfficeArea<State>> {
  protected _instanceID?: GameInstanceID;

  protected _townController: TownController;

  protected _model: OfficeArea<State>;

  protected _players: PlayerController[] = [];

  constructor(id: InteractableID, officeArea: OfficeArea<State>, townController: TownController) {
    super(id);
    this._model = officeArea;
    this._townController = townController;

    const office = officeArea.office;
    if (office && office.players)
      this._players = office.players.map(playerID => this._townController.getPlayer(playerID));
  }

  get players(): PlayerController[] {
    return this._players;
  }

  public get observers(): PlayerController[] {
    return this.occupants.filter(eachOccupant => !this._players.includes(eachOccupant));
  }

  /**
   * Sends a request to the server to join the current office in the office area, or create a new one if there is no office in progress.
   *
   * @throws An error if the server rejects the request to join the office.
   */
  public async joinOffice() {
    const { officeID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinOffice',
    });
    this._instanceID = officeID;
  }

  /**
   * Sends a request to the server to leave the current office in the office area.
   */
  public async leaveOffice() {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'LeaveOffice',
        officeID: instanceID,
      });
    }
  }

  /**
   * Sends a request to the server to set the privacy of the office
   * @param newPrivacySetting the new privacy setting to be set to
   * @protected
   */
  protected async _setPrivacy(newPrivacySetting: PrivacyType) {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'PrivacyCommand',
        officeID: instanceID,
        privacySetting: newPrivacySetting,
      });
    }
  }

  /**
   * Sends a request to the server to start the office
   * @param newModel the new model to compare to
   * @protected
   */
  protected _updateFrom(newModel: OfficeArea<State>): void {
    const newPlayers =
      newModel.office?.players.map(playerID => this._townController.getPlayer(playerID)) ?? [];
    if (!newPlayers && this._players.length > 0) {
      this._players = [];
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('playersChange', []);
    }
    if (
      this._players.length != newModel.office?.players.length ||
      _.xor(newPlayers, this._players).length > 0
    ) {
      this._players = newPlayers;
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('playersChange', newPlayers);
    }
    this._model = newModel;
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit('officeUpdated');
    this._instanceID = newModel.office?.id ?? this._instanceID;
  }

  toInteractableAreaModel(): OfficeArea<State> {
    return this._model;
  }

  /**
   * Sets this model to locked or unlocked
   */
  public get roomLocked(): boolean {
    return this._model.office?.state.privacy === 'PRIVATE';
  }
}
