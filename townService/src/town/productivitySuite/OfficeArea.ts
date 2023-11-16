import Player from '../../lib/Player';
import { OfficeState, InteractableType } from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import OfficeModel from './OfficeModel';

export default abstract class OfficeArea<
  OfficeType extends OfficeModel<OfficeState>,
> extends InteractableArea {
  protected _office?: OfficeType;

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

  protected abstract getType(): InteractableType;

  public remove(player: Player): void {
    if (this._office) {
      this._office.leave(player);
    }
    super.remove(player);
  }
}
