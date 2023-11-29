import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import SketchBoardAreaController from './SketchBoardAreaController';
import TownController from '../TownController';
import { Color, DrawPixel, OfficeArea, SketchBoardState } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import assert from 'assert';
import { SKETCHBOARD_HEIGHT, SKETCHBOARD_WIDTH } from '../../../../townService/src/lib/Constants';

describe('SketchBoardAreaController', () => {
  let area: SketchBoardAreaController;
  let officeArea: OfficeArea<SketchBoardState>;
  const id = nanoid();

  const players = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  mockTownController.getPlayer.mockImplementation(playerId => {
    const p = players.find(player => player.id === playerId);
    assert(p);
    return p;
  });

  const defaultBoard = () => {
    const board: Color[][] = [];
    for (let i = 0; i < SKETCHBOARD_HEIGHT; i++) {
      const row: Color[] = [];
      for (let j = 0; j < SKETCHBOARD_WIDTH; j++) {
        row.push(`#${'ffffff'}`);
      }
      board.push(row);
    }
    return board;
  };

  beforeEach(() => {
    mockTownController.sendInteractableCommand.mockReset();
    officeArea = {
      office: {
        state: {
          privacy: 'PUBLIC',
          occupancyLimit: 5,
          leader: players[0].id,
          board: defaultBoard(),
          backgroundColor: '#ffffff',
          pointsList: [],
        },
        id: id,
        players: [players[0].id, players[1].id],
      },
      type: 'SketchBoardArea',
      id: id,
      occupants: players.map(player => player.id),
    };
    area = new SketchBoardAreaController(id, officeArea, mockTownController);
  });

  describe('get board', () => {
    it('should return the board from the model', () => {
      assert.deepStrictEqual(area.board, defaultBoard());
    });
  });
  describe('updateFrom', () => {
    it('should emit a canvasChanged event when the board changes and change to the new board', () => {
      const newBoard = defaultBoard();
      newBoard[0][0] = '#000000';
      const newOfficeArea: OfficeArea<SketchBoardState> = {
        office: {
          state: {
            privacy: 'PUBLIC',
            occupancyLimit: 5,
            leader: players[0].id,
            board: newBoard,
            backgroundColor: '#ffffff',
            pointsList: [],
          },
          id: id,
          players: [players[0].id, players[1].id],
        },
        type: 'SketchBoardArea',
        id: id,
        occupants: players.map(player => player.id),
      };

      let canvasChanged = false;
      area.addListener('canvasChanged', () => {
        canvasChanged = true;
      });

      area.updateFrom(newOfficeArea, players);

      expect(mockTownController.sendInteractableCommand).not.toHaveBeenCalled();
      expect(canvasChanged).toBe(true);
      expect(area.board).toEqual(newBoard);
      expect(area.board).not.toEqual(defaultBoard());
    });
  });
  describe('drawPixel', () => {
    it('should send an OfficeUpdate command to the town controller', async () => {
      const instanceId = nanoid();
      mockTownController.sendInteractableCommand.mockResolvedValueOnce({ officeID: instanceId });
      await area.joinOffice();
      const pixelsToDraw: DrawPixel[] = [
        {
          x: 0,
          y: 0,
          color: '#000000',
        },
      ];
      await area.drawPixel(pixelsToDraw);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(id, {
        type: 'OfficeUpdate',
        officeID: instanceId,
        update: {
          type: 'DrawCommand',
          stroke: [
            {
              x: 0,
              y: 0,
              color: '#000000',
            },
          ],
        },
      });
    });
    it('should send an OfficeUpdate command to the town controller', async () => {
      const instanceId = nanoid();
      mockTownController.sendInteractableCommand.mockResolvedValueOnce({ officeID: instanceId });
      await area.joinOffice();
      const pixelsToDraw: DrawPixel[] = [
        {
          x: 0,
          y: 0,
          color: '#000000',
        },
      ];
      await area.drawPixel(pixelsToDraw);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(id, {
        type: 'OfficeUpdate',
        officeID: instanceId,
        update: {
          type: 'DrawCommand',
          stroke: [
            {
              x: 0,
              y: 0,
              color: '#000000',
            },
          ],
        },
      });
    });
    it('should throw an error if there is no instance id yet', async () => {
      const pixelsToDraw: DrawPixel[] = [
        {
          x: 0,
          y: 0,
          color: '#000000',
        },
      ];
      expect(area.drawPixel(pixelsToDraw)).rejects.toThrowError();
    });
  });
  describe('reset', () => {
    it('should send an OfficeUpdate command to the town controller', async () => {
      const instanceId = nanoid();
      mockTownController.sendInteractableCommand.mockResolvedValueOnce({ officeID: instanceId });
      await area.joinOffice();
      await area.resetBoard();
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(id, {
        type: 'OfficeUpdate',
        officeID: instanceId,
        update: {
          type: 'ResetCommand',
        },
      });
    });
    it('should throw an error if there is no instance id yet', async () => {
      expect(area.resetBoard()).rejects.toThrowError();
    });
  });
});
