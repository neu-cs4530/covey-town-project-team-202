import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import {
  JoinOfficeCommand,
  LeaveOfficeCommand,
  OccupancyLimitCommand,
  OfficeUpdateCommand,
  PrivacyCommand,
  ResetCommand,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import SketchBoardArea from './SketchBoardArea';
import { createPlayerForTesting } from '../../TestUtils';

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
      test('should emit a town changed event when a player joins an office with the new player', () => {
        townEmitter.emit.mockClear();
        const command: JoinOfficeCommand = { type: 'JoinOffice' };
        area.handleCommand(command, player1);
        expect(townEmitter.emit).toHaveBeenCalledWith('interactableUpdate', {
          ...area.toModel(),
          office: { ...area.office?.toModel(), players: [player1.id] },
        });
      });
      test('should emit a town changed event when a player joins an office with all of the players', () => {
        townEmitter.emit.mockClear();
        const command: JoinOfficeCommand = { type: 'JoinOffice' };
        area.handleCommand(command, player1);
        townEmitter.emit.mockClear();
        area.handleCommand(command, player2);
        expect(townEmitter.emit).toHaveBeenCalledWith('interactableUpdate', {
          ...area.toModel(),
          office: { ...area.office?.toModel(), players: [player1.id, player2.id] },
        });
      });
    });
    describe('LeaveOffice', () => {
      test('should throw an error if the player is not in an office', () => {
        area.handleCommand({ type: 'JoinOffice' }, player1);
        const command: LeaveOfficeCommand = {
          type: 'LeaveOffice',
          officeID: area.office?.id ?? nanoid(),
        };
        expect(() => {
          area.handleCommand(command, player2);
        }).toThrowError();
      });
      test('should throw an error if there is no office', () => {
        const command: LeaveOfficeCommand = {
          type: 'LeaveOffice',
          officeID: area.office?.id ?? nanoid(),
        };
        expect(() => {
          area.handleCommand(command, player1);
        }).toThrowError();
      });
      test('should throw an error if the command office id does not match the area office id', () => {
        const command: LeaveOfficeCommand = { type: 'LeaveOffice', officeID: nanoid() };
        area.handleCommand({ type: 'JoinOffice' }, player1);
        expect(() => {
          area.handleCommand(command, player1);
        }).toThrowError();
      });
      test('should return undefined if the leave command is succesful', () => {
        area.handleCommand({ type: 'JoinOffice' }, player1);
        const command: LeaveOfficeCommand = {
          type: 'LeaveOffice',
          officeID: area.office?.id ?? nanoid(),
        };
        const result = area.handleCommand(command, player1);
        expect(result).toBeUndefined();
      });
      test('should emit a town changed event when a player leaves an office with the remaining players', () => {
        area.handleCommand({ type: 'JoinOffice' }, player1);
        area.handleCommand({ type: 'JoinOffice' }, player2);
        expect(townEmitter.emit).toHaveBeenCalledWith('interactableUpdate', {
          ...area.toModel(),
          office: { ...area.office?.toModel(), players: [player1.id, player2.id] },
        });

        townEmitter.emit.mockClear();
        const command: LeaveOfficeCommand = {
          type: 'LeaveOffice',
          officeID: area.office?.id ?? nanoid(),
        };

        area.handleCommand(command, player1);

        expect(townEmitter.emit).toHaveBeenCalledWith('interactableUpdate', {
          ...area.toModel(),
          office: { ...area.office?.toModel(), players: [player2.id] },
        });
      });
    });
    describe('PrivacyCommand', () => {
      test('should throw an error if the player is not the leader', () => {
        area.handleCommand({ type: 'JoinOffice' }, player1);
        area.handleCommand({ type: 'JoinOffice' }, player2);
        const command: PrivacyCommand = {
          type: 'PrivacyCommand',
          officeID: area.office?.id ?? nanoid(),
          privacySetting: 'PRIVATE',
        };
        expect(() => {
          area.handleCommand(command, player2);
        }).toThrowError();
      });
      test('should throw an error if there is no office', () => {
        const command: PrivacyCommand = {
          type: 'PrivacyCommand',
          officeID: area.office?.id ?? nanoid(),
          privacySetting: 'PRIVATE',
        };
        expect(() => {
          area.handleCommand(command, player1);
        }).toThrowError();
      });
      test('should throw an error if the command office id does not match the area office id', () => {
        const command: PrivacyCommand = {
          type: 'PrivacyCommand',
          officeID: nanoid(),
          privacySetting: 'PRIVATE',
        };
        area.handleCommand({ type: 'JoinOffice' }, player1);
        expect(() => {
          area.handleCommand(command, player1);
        }).toThrowError();
      });
      test('should set the privacy setting if the player is the leader and return undefined', () => {
        area.handleCommand({ type: 'JoinOffice' }, player1);
        const command: PrivacyCommand = {
          type: 'PrivacyCommand',
          officeID: area.office?.id ?? nanoid(),
          privacySetting: 'PRIVATE',
        };
        const result = area.handleCommand(command, player1);
        expect(area.office?.privacy).toBe('PRIVATE');
        expect(result).toBeUndefined();
      });
      test('should emit a town changed event when the privacy is changed with the new privacy status', () => {
        area.handleCommand({ type: 'JoinOffice' }, player1);

        townEmitter.emit.mockClear();
        const command: PrivacyCommand = {
          type: 'PrivacyCommand',
          officeID: area.office?.id ?? nanoid(),
          privacySetting: 'PRIVATE',
        };

        area.handleCommand(command, player1);
        expect(townEmitter.emit).toHaveBeenCalledWith('interactableUpdate', {
          ...area.toModel(),
          office: {
            ...area.office?.toModel(),
            state: { ...area.office?.state, privacy: 'PRIVATE' },
          },
        });
      });
    });
    describe('OfficeUpdate', () => {
      test('should throw an error if there is no office', () => {
        const command: OfficeUpdateCommand<ResetCommand> = {
          type: 'OfficeUpdate',
          officeID: area.office?.id ?? nanoid(),
          update: { type: 'ResetCommand' },
        };

        expect(() => area.handleCommand(command, player1)).toThrowError();
      });
      test('should throw an error if the officeId does not match the real office id', () => {
        area.handleCommand({ type: 'JoinOffice' }, player1);

        const command: OfficeUpdateCommand<ResetCommand> = {
          type: 'OfficeUpdate',
          officeID: nanoid(),
          update: { type: 'ResetCommand' },
        };

        expect(() => area.handleCommand(command, player1)).toThrowError();
      });
    });
    describe('OccupancyLimit', () => {
      it('should throw an error if the player is not the leader', () => {
        area.handleCommand({ type: 'JoinOffice' }, player1);
        area.handleCommand({ type: 'JoinOffice' }, player2);
        const command: OccupancyLimitCommand = {
          type: 'OccupancyLimit',
          officeID: area.office?.id ?? nanoid(),
          limit: 5,
        };

        expect(() => area.handleCommand(command, player2)).toThrowError();
      });
      it('should throw an error if there is no office instance', () => {
        const command: OccupancyLimitCommand = {
          type: 'OccupancyLimit',
          officeID: area.office?.id ?? nanoid(),
          limit: 5,
        };

        expect(() => area.handleCommand(command, player1)).toThrowError();
      });
      it("should throw an error if the office Id does not match the area's office id", () => {
        area.handleCommand({ type: 'JoinOffice' }, player1);
        const command: OccupancyLimitCommand = {
          type: 'OccupancyLimit',
          officeID: nanoid(),
          limit: 5,
        };

        expect(() => area.handleCommand(command, player1)).toThrowError();
      });
      it('should emit a town changed event when the occupancy limit is changed with the new occupancy', () => {
        area.handleCommand({ type: 'JoinOffice' }, player1);

        townEmitter.emit.mockClear();
        const command: OccupancyLimitCommand = {
          type: 'OccupancyLimit',
          officeID: area.office?.id ?? nanoid(),
          limit: 12,
        };

        area.handleCommand(command, player1);
        expect(townEmitter.emit).toHaveBeenCalledWith('interactableUpdate', {
          ...area.toModel(),
          office: {
            ...area.office?.toModel(),
            state: { ...area.office?.state, occupancyLimit: 12 },
          },
        });
      });
      it('should return undefined after succesfully changing the occupancy limit', () => {
        area.handleCommand({ type: 'JoinOffice' }, player1);

        townEmitter.emit.mockClear();
        const command: OccupancyLimitCommand = {
          type: 'OccupancyLimit',
          officeID: area.office?.id ?? nanoid(),
          limit: 12,
        };

        const result = area.handleCommand(command, player1);
        expect(result).toBeUndefined();
      });
    });
  });
});
