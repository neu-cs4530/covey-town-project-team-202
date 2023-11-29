import {
  Box,
  Flex,
  FormLabel,
  List,
  ListItem,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { PlayerScore } from '../../../../../../shared/types/CoveyTownSocket';
import SketchBoardAreaController from '../../../../classes/interactable/SketchBoardAreaController';
import PlayerController from '../../../../classes/PlayerController';
import PlayerName from '../../../SocialSidebar/PlayerName';

export default function PlayerInfo({
  officeAreaController,
}: {
  players: PlayerController[];
  officeAreaController: SketchBoardAreaController;
}): JSX.Element {
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>(
    officeAreaController.playerScores,
  );
  useEffect(() => {
    officeAreaController.addListener('scoresChanged', setPlayerScores);
    return () => {
      officeAreaController.removeListener('scoresChanged', setPlayerScores);
    };
  }, [officeAreaController]);

  return (
    <Stack>
      <Text fontSize='2xl'>Player Info</Text>
      <List>
        {playerScores.map((player: PlayerScore, id) => {
          return (
            <ListItem key={id}>
              {/* Player  Info */}
              <Flex direction='row' w='280px' justifyContent='space-between'>
                {/* Player ID */}
                <FormLabel>{player.playerID}</FormLabel>
                {/* Player Score */}
                {officeAreaController.isPlayerLeader ? (
                  <Box ml='auto'>
                    <NumberInput
                      width='50px'
                      size='xs'
                      variant='flush'
                      defaultValue={0}
                      min={0}
                      onChange={async (valueAsString: string) => {
                        if (Number.parseInt(valueAsString) > 0) {
                          await officeAreaController.newScore(
                            player.playerID,
                            Number.parseInt(valueAsString),
                          );
                        }
                      }}>
                      <NumberInputField size={5} height={10} value={player.score} />
                      <NumberInputStepper>
                        <NumberIncrementStepper bg='green.200' _active={{ bg: 'green.300' }} />
                        <NumberDecrementStepper bg='pink.200' _active={{ bg: 'pink.300' }} />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                ) : (
                  <Box>{player.score}</Box>
                )}
              </Flex>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
}
