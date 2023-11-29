import Player from '../../lib/Player';
import {
  OfficeState,
  InteractableType,
  OfficeArea as OfficeAreaModel,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import OfficeModel from './OfficeModel';

/**
 * An OfficeArea is an InteractableArea that hosts an Office.
 */
export default abstract class OfficeArea<
  OfficeType extends OfficeModel<OfficeState, unknown>,
> extends InteractableArea {
  protected _office?: OfficeType;

  /**
   * HGets this office's OfficeType
   */
  public get office(): OfficeType | undefined {
    return this._office;
  }

  public toModel(): OfficeAreaModel<OfficeType['state']> {
    return {
      id: this.id,
      office: this._office?.toModel(),
      occupants: this.occupantsByID,
      type: this.getType(),
    };
  }

  /**
   * Gets the Interatable Type
   * @protected
   */
  protected abstract getType(): InteractableType;

  /**
   * removes a player from the office
   * @param player
   */
  public remove(player: Player): void {
    if (this._office) {
      this._office.leave(player);
    }
    super.remove(player);
  }
}
