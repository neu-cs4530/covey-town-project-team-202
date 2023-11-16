import { nanoid } from 'nanoid';
import Player from '../../lib/Player';
import {
  OfficeInstance,
  OfficeInstanceID,
  OfficeState,
  PrivacyType,
} from '../../types/CoveyTownSocket';
import { DEFAULT_OCCUPANCY_LIMIT, PRIVATE } from '../../lib/Constants';

/**
 * This class is the base class for all games. It is responsible for managing the
 * state of the game. @see GameArea
 */
export default abstract class Office<StateType extends OfficeState> {
  private _state: StateType;

  protected _privacy: PrivacyType;

  public readonly id: OfficeInstanceID;

  protected _players: Player[] = [];

  protected _occupancyLimit: number;

  /**
   * Creates a new Game instance.
   * @param initialState State to initialize the game with.
   * @param emitAreaChanged A callback to invoke when the state of the game changes. This is used to notify clients.
   */
  public constructor(initialState: StateType) {
    this.id = nanoid() as OfficeInstanceID;
    this._state = initialState;
    this._privacy = PRIVATE;
    this._occupancyLimit = DEFAULT_OCCUPANCY_LIMIT;
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

  public abstract get privacy(): PrivacyType;

  public abstract set privacy(newPrivacy: PrivacyType);
}
