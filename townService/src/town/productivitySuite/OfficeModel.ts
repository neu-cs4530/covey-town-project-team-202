import { nanoid } from 'nanoid';
import Player from '../../lib/Player';
import {
  OfficeInstance,
  OfficeInstanceID,
  OfficeState,
  OfficeUpdate,
  PrivacyType,
} from '../../types/CoveyTownSocket';
import { DEFAULT_OCCUPANCY_LIMIT, PRIVATE } from '../../lib/Constants';

/**
 * This class is the base class for all offices. It is responsible for managing the
 * state of the game. @see OfficeArea
 */
export default abstract class Office<StateType extends OfficeState, UpdateType> {
  private _state: StateType;

  public readonly id: OfficeInstanceID;

  protected _players: Player[] = [];

  /**
   * Creates a new Game instance.
   * @param initialState State to initialize the game with.
   * @param emitAreaChanged A callback to invoke when the state of the game changes. This is used to notify clients.
   */
  public constructor(initialState: StateType) {
    this.id = nanoid() as OfficeInstanceID;
    this._state = initialState;
  }

  public get state() {
    return this._state;
  }

  protected set state(newState: StateType) {
    this._state = newState;
  }

  /**
   * Attempt to join an office .
   * This method should be implemented by subclasses.
   * @param player The player to join the game.
   * @throws InvalidParametersError if the player can not join the game
   */
  protected abstract _join(player: Player): void;

  /**
   * Attempt to leave an office.
   * This method should be implemented by subclasses.
   * @param player The player to leave the game.
   * @throws InvalidParametersError if the player can not leave the game
   */
  protected abstract _leave(player: Player): void;

  /**
   * Attempt to join an office.
   * @param player The player to join the game.
   * @throws InvalidParametersError if the player can not join the game
   */
  public join(player: Player): void {
    this._join(player);
    this._players.push(player);
  }

  /**
   * Attempt to leave a game.
   * @param player The player to leave the game.
   * @throws InvalidParametersError if the player can not leave the game
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

  public get privacy(): PrivacyType {
    return this._state.privacy;
  }

  public set privacy(newPrivacy: PrivacyType) {
    this._state.privacy = newPrivacy;
  }

  public set occupancyLimit(limit: number) {
    this._state.occupancyLimit = limit;
  }

  public get occupancyLimit() {
    return this._state.occupancyLimit;
  }

  public abstract applyUpdate(update: OfficeUpdate<UpdateType>): void;
}
