import { Box, Button, Center, Input, InputGroup, InputLeftAddon, Spinner, Text, useDisclosure, VStack } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Form, useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import * as Yup from 'yup';
import { VerifyUserClient } from 'verify-user';

enum SignInState {
  PromptTwitter,
  SignMessage,
  PostTwitter,
  VerifyTwitter,
  AskUsername,
  Success,
}

export const SignInFlow = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalState, setModalState] = useState(SignInState.PromptTwitter);
  const [handle, setHandle] = useState('');

  return (
    <Box padding={10}>
      {address ?
        <Button onClick={onOpen} >
          Sign in
        </Button>
        :
        <VStack gap={2}>
          <Box>
            Please connect wallet first.
          </Box>
          <ConnectButton />
        </VStack>
      }
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          {modalState === SignInState.PromptTwitter && <Welcome setHandle={setHandle} setModalState={setModalState} />}
          {modalState === SignInState.SignMessage && <SignMessage handle={handle} setModalState={setModalState} />}
        </ModalContent>
      </Modal>
    </Box>)


}

const Welcome = ({ setHandle, setModalState }: { setHandle: any, setModalState: any }) => {
  const [message, setMessage] = useState('');

  const TwitterHandleSchema = Yup.object().shape({
    handle: Yup.string()
      .min(2, 'Too Short!')
      .max(15, 'Too Long!')
      .matches(/^[a-zA-Z0-9_]{1,15}$/, 'invalid username')
      .required('Required'),
  });
  const formik = useFormik({
    initialValues: {
      handle: '',
    },
    onSubmit: (value) => {
      setModalState(SignInState.SignMessage);
      setHandle(value.handle);
    },
    validationSchema: TwitterHandleSchema,
  });

  useEffect(() => {
    setMessage(formik.errors.handle || '');
  }, [formik.errors]);

  return (
    <>
      <ModalHeader>Hello!</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={formik.handleSubmit}>
        <ModalBody>
          <Text>
            Please provide your Twitter handle (This willl not be saved)
          </Text>
          <InputGroup>
            <InputLeftAddon children="@" />
            <Input
              id='handle'
              name='handle'
              type="text"
              placeholder="straightupjac"
              value={formik.values.handle}
              onChange={formik.handleChange}

            />
          </InputGroup>

          <Text fontSize='12px' color="red.600">
            {message}
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button type="submit" variant='ghost'>Submit</Button>
        </ModalFooter>
      </form>
    </>
  )
}

const SignMessage = ({ handle, setModalState }: { handle: string, setModalState: any }) => {
  const { address } = useAccount();
  const { data: signature, isError, isLoading, isSuccess, signMessage } = useSignMessage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onSignMessage = () => {
    if (!address) {
      setMessage("your wallet must be connected")
    }
    setLoading(true);
    signMessage({ message: 'TODO:' });
  }

  useEffect(() => {
    if (!signature) {
      return;
    }
    console.log('signature', signature);
  }, [signature])

  const goBack = () => {
    setModalState(SignInState.PromptTwitter)
  }

  return (
    <>
      <ModalHeader>Hi @{handle}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack gap={4}>
          <Text>
            Please sign a message to prove you control this account (gasless)
          </Text>
          {loading ?
            <Button variant='solid' leftIcon={<Spinner />} disabled>Sign Message</Button> :
            <Button onClick={onSignMessage} variant='solid'>Sign Message</Button>}
          <Text fontSize='12px' color="red.600">
            {message}
          </Text>
        </VStack>
      </ModalBody>
      <ModalFooter justifyContent="start">
        <Button onClick={goBack} variant='ghost'>
          Go back
        </Button>
      </ModalFooter>
    </>
  )
}