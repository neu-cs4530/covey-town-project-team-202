import _ from 'lodash';
import {
  OfficeArea,
  GameInstanceID,
  InteractableID,
  OfficeState,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';

export type OfficeEventTypes = BaseInteractableEventMap & {
  officeStart: () => void;
  officeUpdated: () => void;
  officeEnd: () => void;
  playersChange: (newPlayers: PlayerController[]) => void;
};

/**
 * This class is the base class for all office controllers. It is responsible for managing the
 * state of the office, and for sending commands to the server to update the state of the office.
 * It is also responsible for notifying the UI when the state of the office changes, by emitting events.
 */
export default abstract class GameAreaController<
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

  protected _updateFrom(newModel: OfficeArea<State>): void {
    // TODO
  }

  toInteractableAreaModel(): OfficeArea<State> {
    return this._model;
  }
}
