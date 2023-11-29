import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Container,
  Flex,
} from '@chakra-ui/react';
import { useCallback } from 'react';
import { useInteractable, useOfficeAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import OfficeArea from '../OfficeArea';
import SketchBoardAreaController from '../../../../classes/interactable/SketchBoardAreaController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import SketchBoardCanvas from './SketchBoardCanvas';
import PlayerController from '../../../../classes/PlayerController';
import ColorSelector from './ColorSelector';
import PlayerInfo from './PlayerInfo';
import LeaderSettings from './LeaderSettings';
import SketchButtons from './SketchButtons';

function SketchBoardArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const colors = ['red', 'green', 'blue', 'black'];
  const officeAreaController = useOfficeAreaController<SketchBoardAreaController>(interactableID);
  const townController = useTownController();
  const [players, setPlayers] = useState<PlayerController[]>(officeAreaController.players);

  const isPlayerInOffice = () =>
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
  return (
    <Flex flexDirection='row'>
      <Container flexDirection='column'>
        {/* <Button
          onClick={async () => {
            await officeAreaController.joinOffice();
          }}>
          Join SketchBoard
        </Button> */}
        <SketchBoardCanvas officeAreaController={officeAreaController}></SketchBoardCanvas>
        <ColorSelector></ColorSelector>
        <SketchButtons officeAreaController={officeAreaController}></SketchButtons>
      </Container>
      <Container flexDirection='column'>
        <PlayerInfo></PlayerInfo>
        <LeaderSettings></LeaderSettings>
      </Container>
    </Flex>
  );
}

// return (
//   <Container flexDirection='column' justifyContent='center'>
//     {(!isPlayerInOffice()) && <Button
//       onClick={async () => {
//         await officeAreaController.joinOffice();
//       }}>
//       Join SketchBoard
//     </Button>}
//     {(isPlayerInOffice()) &&
//       <>
//         <Container
//         centerContent={true}
//         flexDirection='row'
//         justifyContent='center'
//         alignItems={'flex-start'}>
//         <SketchBoardCanvas officeAreaController={officeAreaController}></SketchBoardCanvas>
//         <List>
//           {colors.map((color, id) => {
//             return (
//               <ListItem key={id}>
//                 <div
//                   style={{
//                     backgroundColor: color,
//                     height: `${COLOR_PALLETE_CHOICE_HEIGHT}px`,
//                     width: `${COLOR_PALLETE_CHOICE_WIDTH}px`,
//                   }}/>
//               </ListItem>
//             );
//           })}
//         </List>
//         <List title='List of players on canvas:'>
//           {players.map((player, id) => {
//             return <ListItem key={id}>{player.id}</ListItem>;
//           })}
//         </List>
//         </Container><Container flexDirection='row'>
//           <Button
//             onClick={async () => {
//               await officeAreaController.leaveOffice();
//             }}>
//             Leave SketchBoard
//           </Button>
//           <Button
//             onClick={async () => {
//               await officeAreaController.resetBoard();
//             }}>
//             Reset SketchBoard
//           </Button>
//         </Container>
//       </>
//     }
//   </Container>
// );
// }

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
        <ModalContent
        // maxH={`${SKETCHBOARD_HEIGHT * SKETCHBOARD_PIXEL * 2}px`}
        // maxW={`${SKETCHBOARD_WIDTH * SKETCHBOARD_PIXEL * 2}px`}
        >
          <ModalHeader>{officeArea.name}</ModalHeader>
          <ModalCloseButton />
          <SketchBoardArea interactableID={officeArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
