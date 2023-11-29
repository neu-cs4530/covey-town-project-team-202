import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Container,
  Button,
  Flex,
} from '@chakra-ui/react';
import { useCallback } from 'react';
import { useInteractable, useOfficeAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import OfficeArea from '../OfficeArea';
import SketchBoardAreaController from '../../../../classes/interactable/SketchBoardAreaController';
import { Color, InteractableID } from '../../../../types/CoveyTownSocket';
import SketchBoardCanvas from './SketchBoardCanvas';
import PlayerController from '../../../../classes/PlayerController';
import ColorSelector from './ColorSelector';
import PlayerInfo from './PlayerInfo';
import LeaderSettings from './LeaderSettings';
import SketchButtons from './SketchButtons';
import { SketchBoardContext } from './sketchBoardContext';

function SketchBoardArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const officeAreaController = useOfficeAreaController<SketchBoardAreaController>(interactableID);
  const townController = useTownController();
  const [players, setPlayers] = useState<PlayerController[]>(officeAreaController.players);

  const [color, setColor] = useState<Color>('#000000');
  const [drawEnabled, setDrawEnabled] = useState<boolean>(officeAreaController.drawEnabled);
  const [roomLocked, setRoomLocked] = useState<boolean>(officeAreaController.roomLocked);

  useEffect(() => {
    officeAreaController.addListener('drawEnableChanged', setDrawEnabled);
    officeAreaController.addListener('roomLockChanged', setRoomLocked);
    return () => {
      officeAreaController.removeListener('drawEnableChanged', setDrawEnabled);
      officeAreaController.removeListener('roomLockChanged', setRoomLocked);
    };
  }, [officeAreaController]);

  const isPlayerInOffice = (): boolean =>
    players.filter(player => player.id === townController.ourPlayer.id).length > 0;

  useEffect(() => {
    const updateOfficeState = () => {
      setPlayers(officeAreaController.players);
    };
    officeAreaController.addListener('officeUpdated', updateOfficeState);
    return () => {
      officeAreaController.removeListener('officeUpdated', updateOfficeState);
    };
  }, [townController, officeAreaController]);
  function isPlayerLeader() {
    return officeAreaController.leader === townController.ourPlayer.id;
  }

  return (
    <>
      {isPlayerInOffice() && (
        <SketchBoardContext.Provider
          value={{
            color: color,
            setColor: setColor,
            drawEnabled: drawEnabled,
            setDrawEnabled: setDrawEnabled,
            roomLocked: roomLocked,
            setRoomLocked: setRoomLocked,
          }}>
          <Flex flexDirection='row'>
            <Container flexDirection='column'>
              <SketchBoardCanvas officeAreaController={officeAreaController}></SketchBoardCanvas>
              <ColorSelector officeAreaController={officeAreaController}></ColorSelector>
              <SketchButtons officeAreaController={officeAreaController}></SketchButtons>
            </Container>
            <Container flexDirection='column'>
              <PlayerInfo></PlayerInfo>
              {isPlayerLeader() && <LeaderSettings officeAreaController={officeAreaController} />}
            </Container>
          </Flex>
        </SketchBoardContext.Provider>
      )}
      {!isPlayerInOffice() && !roomLocked && (
        <Button
          onClick={async () => {
            await officeAreaController.joinOffice();
          }}>
          Join SketchBoard
        </Button>
      )}
      {!isPlayerInOffice() && roomLocked && <div>The room is currently locked</div>}
      Draw is {drawEnabled ? 'on' : 'off'}
    </>
  );
}

/**
 * A wrapper component for the TicTacToeArea component.
 * Determines if the player is currently in a tic tac toe area on the map, and if so,
 * renders the TicTacToeArea component in a modal.
 *
 */
export default function SketchBoardAreaWrapper(): JSX.Element {
  const officeArea = useInteractable<OfficeArea>('officeArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (officeArea) {
      townController.interactEnd(officeArea);
      const controller = townController.getOfficeAreaController(officeArea);
      controller.leaveOffice();
    }
  }, [townController, officeArea]);

  if (officeArea && officeArea.getData('type') === 'SketchBoard') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{officeArea.name}</ModalHeader>
          <ModalCloseButton />
          <SketchBoardArea interactableID={officeArea.name} />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
