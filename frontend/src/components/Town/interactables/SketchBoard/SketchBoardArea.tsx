import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import OfficeArea from '../OfficeArea';
import SketchBoardAreaController from '../../../../classes/interactable/SketchBoardAreaController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import SketchBoardCanvas from './SketchBoardCanvas';

function SketchBoardArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const officeAreaController =
    useInteractableAreaController<SketchBoardAreaController>(interactableID);
  //   const townController = useTownController();

  return (
    <>
      <SketchBoardCanvas officeAreaController={officeAreaController}></SketchBoardCanvas>
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
  console.log("SketchBoardAreaWrapperStart");
  const officeArea = useInteractable<OfficeArea>('officeArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (officeArea) {
      townController.interactEnd(officeArea);
      const controller = townController.getOfficeAreaController(officeArea);
      controller.leaveOffice();
    }
  }, [townController, officeArea]);
  console.log(officeArea);
  console.log(officeArea?.getData('type'));

  if (officeArea && officeArea.getData('type') === 'SketchBoard') {
    console.log("SketchBoardAreaWrapper");
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{officeArea.name}</ModalHeader>
          <ModalCloseButton />
          <SketchBoardArea interactableID={officeArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
