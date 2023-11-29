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
    // track the number of people in the ()
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
    beforeEach(() => {
      office.join(player1);
    });
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
      office.applyUpdate(player1, updateToSend.update);
      expect(office.state.board[0][0]).toBe(`#${111111}`);
    });
    test('draw a list of pixels together', () => {
      const pixelsToDraw: DrawPixel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => ({
        x: c,
        y: c,
        color: `#${111111}`,
      }));
      const drawCommand: DrawCommand = {
        type: 'DrawCommand',
        stroke: pixelsToDraw,
      };
      const updateToSend: OfficeUpdate<SketchBoardUpdateCommand> = {
        playerID: player1.id,
        officeID: office.id,
        update: drawCommand,
      };
      expect(office.state.board[0][0]).toBe(`#${'ffffff'}`);
      office.applyUpdate(player1, updateToSend.update);
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(c =>
        expect(office.state.board[c][c]).toBe(`#${111111}`),
      );
    });
    test('reset canvas resets draw pixels back to white', () => {
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
      office.applyUpdate(player1, updateToSend.update);
      expect(office.state.board[0][0]).toBe(`#${111111}`);

      office.applyUpdate(player1, { type: 'ResetCommand' });
      expect(office.state.board[0][0]).toBe(`#ffffff`);
    });
    test('update command updates the score of a player', () => {
      const updateToSend: OfficeUpdate<SketchBoardUpdateCommand> = {
        playerID: player1.id,
        officeID: office.id,
        update: { type: 'UpdateScore', playerID: player1.id, score: 10 },
      };
      expect(office.state.pointsList.length).toBe(0);
      office.applyUpdate(player1, updateToSend.update);
      expect(office.state.pointsList.length).toBe(1);
      expect(office.state.pointsList[0].score).toBe(10);
      expect(office.state.pointsList[0].playerID).toBe(player1.id);
    });
    test('update command throws an error if the player in the update command is not in the board session', () => {
      const player2 = createPlayerForTesting();
      const updateToSend: OfficeUpdate<SketchBoardUpdateCommand> = {
        playerID: player2.id,
        officeID: office.id,
        update: { type: 'UpdateScore', playerID: player2.id, score: 10 },
      };
      expect(office.state.pointsList.length).toBe(0);
      expect(() => office.applyUpdate(player1, updateToSend.update)).toThrowError();
    });
  });
});
