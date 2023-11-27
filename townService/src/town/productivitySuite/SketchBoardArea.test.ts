import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import { JoinOfficeCommand, TownEmitter } from '../../types/CoveyTownSocket';
import SketchBoardArea from './SketchBoardArea';
import { createPlayerForTesting } from '../../TestUtils';
import exp from 'constants';

describe('SketchBoardArea', () => {
  let area: SketchBoardArea;
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  const id = nanoid();
  const townEmitter = mock<TownEmitter>();

  beforeEach(() => {
    townEmitter.emit.mockClear();
    area = new SketchBoardArea(id, testAreaBox, townEmitter);
  });

  describe('constructor', () => {
    test('should set the id', () => {
      expect(area.id).toBe(id);
    });
    test('should set the bounding box', () => {
      expect(area.boundingBox).toEqual(testAreaBox);
    });
  });

  describe('handleCommand', () => {
    let player1 = createPlayerForTesting();
    let player2 = createPlayerForTesting();

    beforeEach(() => {
      player1 = createPlayerForTesting();
      player2 = createPlayerForTesting();
    });

    describe('JoinOffice', () => {
      test('should create a new office if there is no office in progress', () => {
        const command: JoinOfficeCommand = { type: 'JoinOffice' };
        const result = area.handleCommand(command, player1);
        expect(area.office).toBeDefined();
        expect(result).toEqual({ officeID: area.office?.id });
      });
      test('should join an existing office if there is an office in progress', () => {
        const command: JoinOfficeCommand = { type: 'JoinOffice' };
        area.handleCommand(command, player1);
        const officeId = area.office?.id;
        const result = area.handleCommand(command, player2);
        expect(result).toEqual({ officeID: officeId });
      });
      test('should throw an error if the player is already in an office', () => {
        const command: JoinOfficeCommand = { type: 'JoinOffice' };
        area.handleCommand(command, player1);
        expect(() => {
          area.handleCommand(command, player1);
        }).toThrowError();
      });
      test('should emit a town changed event when a player joins an office', () => {
        const command: JoinOfficeCommand = { type: 'JoinOffice' };
        area.handleCommand(command, player1);
        expect(townEmitter.emit).toHaveBeenCalledWith('interactableUpdate', {
          coveyTownID: id,
          occupants: [player1.id],
        });
      });
    });
  });
});
