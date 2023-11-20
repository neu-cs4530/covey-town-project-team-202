import { createPlayerForTesting } from '../../TestUtils';
import {
  DrawCommand,
  DrawPixel,
  OfficeUpdate,
  SketchBoardUpdateCommand,
} from '../../types/CoveyTownSocket';
import SketchBoardModel from './SketchBoardModel';

describe('SketchBoardModel', () => {
  let office = new SketchBoardModel();
  let player1 = createPlayerForTesting();
  beforeEach(() => {
    office = new SketchBoardModel();
    player1 = createPlayerForTesting();
  });
  describe('join', () => {
    test('player can join a new game and becomes leader', () => {
      expect(office.state.leader).toBe(undefined);
      office.join(player1);
      expect(office.state.leader).toBe(player1.id);
    });
    test('more than one player can join a game', () => {
      expect(office.state.leader).toBe(undefined);
      office.join(player1);
      expect(office.state.leader).toBe(player1.id);
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      office.join(player2);
      office.join(player3);
    });
    test('throws an error when limit is reached', () => {
      expect(office.state.leader).toBe(undefined);
      office.join(player1);
      expect(office.state.leader).toBe(player1.id);
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      const player4 = createPlayerForTesting();
      const player5 = createPlayerForTesting();
      const player6 = createPlayerForTesting();
      office.join(player2);
      office.join(player3);
      office.join(player4);
      office.join(player5);
      expect(() => {
        office.join(player6);
      }).toThrowError();
    });
    // TODO: add more tests to check boundary conditions
  });
  describe('leave', () => {});
  describe('applyUpdate', () => {
    test('draw pixel on canvas', () => {
      const pixelToDraw: DrawPixel = {
        x: 0,
        y: 0,
        color: `#${111111}`,
      };
      const drawCommand: DrawCommand = {
        type: 'DrawCommand',
        stroke: [pixelToDraw],
      };
      const updateToSend: OfficeUpdate<SketchBoardUpdateCommand> = {
        playerID: player1.id,
        officeID: office.id,
        update: drawCommand,
      };
      expect(office.state.board[0][0]).toBe(`#${'ffffff'}`);
      office.applyUpdate(updateToSend);
      expect(office.state.board[0][0]).toBe(`#${111111}`);
    });
  });
});