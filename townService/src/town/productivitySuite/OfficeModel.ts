import { nanoid } from 'nanoid';
import Player from '../../lib/Player';
import {
  OfficeInstance,
  OfficeInstanceID,
  OfficeState,
  PrivacyType,
} from '../../types/CoveyTownSocket';
/**
 * This class is the base class for all offices. It is responsible for managing the
 * state of the game. @see OfficeArea
 */
export default abstract class Office<StateType extends OfficeState, UpdateType> {
  private _state: StateType;

  public readonly id: OfficeInstanceID;

  protected _players: Player[] = [];

  /**
   * Creates a new Office instance.
   * @param initialState State to initialize the office with.
   * @param emitAreaChanged A callback to invoke when the state of the office changes. This is used to notify clients.
   */
  public constructor(initialState: StateType) {
    this.id = nanoid() as OfficeInstanceID;
    this._state = initialState;
  }

  /**
   * Gets the state of the office
   */
  public get state() {
    return this._state;
  }

  /**
   * Sets the state of the office
   * @param newState the new state
   * @protected
   */
  protected set state(newState: StateType) {
    this._state = newState;
  }

  /**
   * Attempt to join an office .
   * This method should be implemented by subclasses.
   * @param player The player to join the office.
   * @throws InvalidParametersError if the player can not join the office
   */
  protected abstract _join(player: Player): void;

  /**
   * Attempt to leave an office.
   * This method should be implemented by subclasses.
   * @param player The player to leave the office.
   * @throws InvalidParametersError if the player can not leave the office
   */
  protected abstract _leave(player: Player): void;

  /**
   * Attempt to join an office.
   * @param player The player to join the office.
   * @throws InvalidParametersError if the player can not join the office
   */
  public join(player: Player): void {
    this._join(player);
    this._players.push(player);
  }

  /**
   * Attempt to leave an office.
   * @param player The player to leave the office.
   * @throws InvalidParametersError if the player can not leave the office
   */
  public leave(player: Player): void {
    this._leave(player);
    this._players = this._players.filter(p => p.id !== player.id);
  }

  public toModel(): OfficeInstance<StateType> {
    return {
      state: this._state,
      id: this.id,
      players: this._players.map(player => player.id),
    };
  }

  /**
   * Gets the privacy of the office
   */
  public get privacy(): PrivacyType {
    return this._state.privacy;
  }

  /**
   * Sets the privacy of the office
   * @param newPrivacy the new privacy of the office
   */
  public set privacy(newPrivacy: PrivacyType) {
    this._state.privacy = newPrivacy;
  }

  /**
   * Sets the occupancy limit of the office
   * @param limit what to set the limit to
   */
  public set occupancyLimit(limit: number) {
    this._state.occupancyLimit = limit;
  }

  /**
   * Gets the occupancy limit of the office
   */
  public get occupancyLimit() {
    return this._state.occupancyLimit;
  }

  public abstract applyUpdate(player: Player, update: UpdateType): void;
}
