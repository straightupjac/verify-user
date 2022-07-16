import { Box, Button, Center, Input, InputGroup, InputLeftAddon, Spinner, Text, useDisclosure, VStack } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useFormik } from 'formik';
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
import { FaTwitter } from 'react-icons/fa';

enum SignInState {
  PromptTwitter,
  SignMessage,
  PostTwitter,
  AskUsername,
  Success,
  WelcomeBack,
}

export const SignInFlow = () => {
  const { address } = useAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalState, setModalState] = useState(SignInState.PromptTwitter);
  const [handle, setHandle] = useState('');
  const [messageToSign, setMessageToSign] = useState('');
  const [signedMessage, setSignedMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!handle) {
      setMessageToSign('');
      return;
    }
    fetch(`api/generateMessageToSign/${handle}`).then((res) => res.json())
      .then((data) => {
        setMessageToSign(data.messageToSign)
      }).catch((err) => {
        console.log('err @ generateMessageToSign', `${err}`)
        setMessageToSign('');
      })
  }, [handle])

  return (
    <Box padding={10}>
      {address ?
        username ?
          <Box>
            {`Hello, ${username}. You're signed in!`}
          </Box>
          :
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
          {modalState === SignInState.PromptTwitter &&
            <Welcome setHandle={setHandle} setModalState={setModalState} />}
          {modalState === SignInState.SignMessage &&
            <SignMessage messageToSign={messageToSign} setSignedMessage={setSignedMessage} handle={handle} setModalState={setModalState} setUsername={setUsername} />}
          {modalState === SignInState.PostTwitter && <PostTwitter handle={handle} setModalState={setModalState} signedMessage={signedMessage} />}
          {modalState === SignInState.WelcomeBack && <WelcomeBack username={username} onClose={onClose} />}
          {modalState === SignInState.AskUsername && <AskUsername signedMessage={signedMessage} setUsername={setUsername} setModalState={setModalState} />}
          {modalState === SignInState.Success && <Success username={username} onClose={onClose} />}
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
            <InputLeftAddon>@</InputLeftAddon>
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

// branches off if user is returning or new
const SignMessage = ({ handle, setUsername, setModalState, messageToSign, setSignedMessage }
  : { handle: string, setModalState: any, messageToSign: string, setUsername: any, setSignedMessage: any }) => {
  const { address } = useAccount();
  const { data: signature, isError, isLoading, isSuccess, signMessage } = useSignMessage({ message: messageToSign });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSignMessage = () => {
    if (!address) {
      setError("your wallet must be connected")
    }
    setLoading(true);
    signMessage();
  }

  useEffect(() => {
    if (!signature) {
      return;
    }
    setSignedMessage(signature);

    setMessage('checking if you\'re a returning user...');
    // check if recognized user
    fetch(`api/getUser/${signature}`,).then((res) => res.json())
      .then((data) => {
        setMessage('');
        // user exists, (is returning)
        if (data.status === 'Success') {
          setUsername(data.username);
          setModalState(SignInState.WelcomeBack);
          setLoading(false);
        }
        else {
          setModalState(SignInState.PostTwitter);
          setLoading(false);
        }
      }).catch((err) => {
        console.log('err @ getUser', `${err}`);
        setMessage('');
        setError("We couldn't find your profile. You must be new.")
        setModalState(SignInState.PostTwitter);
        setLoading(false);
      });
  }, [signature, setSignedMessage, setModalState, setUsername])

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
          <Text fontSize='12px' color="gray.600">
            {message}
          </Text>
          <Text fontSize='12px' color="red.600">
            {error}
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

const PostTwitter = ({ signedMessage, handle, setModalState }: { handle: string, signedMessage: string, setModalState: any }) => {
  const [message, setMessage] = useState('');
  const [verificationHash, setVerificationHash] = useState('');

  const goBack = () => {
    setModalState(SignInState.PromptTwitter)
  }

  const verifyTweet = () => {
    fetch(`api/verifyTwitter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        handle,
        verificationHash
      }),
    }).then((res) => res.json())
      .then((data) => {
        if (data.status === 'Success') {
          setModalState(SignInState.AskUsername)
        }
        else {
          setMessage('We had trouble verifying your Twitter. Did you Tweet the verification hash?')
        }
      }).catch((err) => {
        console.log('err @ verifyTwitter', `${err}`);
        setMessage(`We had an issue verifying your Twitter. Did you Tweet the verification hash? . ${err}`)
      });
  }

  const tweetVerification = () => {
    fetch(`api/createTwitterVerificationHash/${signedMessage}`,).then((res) => res.json())
      .then((data) => {
        // user exists, (is returning)
        if (data.status === 'Success') {
          setVerificationHash(data.hash);
          const str = `I am verifying I own this account. ${data.hash}`;
          window.open(`https://twitter.com/intent/tweet?text=${encodeURI(str)}`);
          setMessage('');
        }
        else {
          setMessage('We had trouble generating a verification hash. Please try again.')
        }
      }).catch((err) => {
        console.log('err @ createTwitterVerificationHash', `${err}`);
        setMessage(`We had trouble generating a verification hash. Please try again. ${err}`)
      });
  }

  return (
    <>
      <ModalHeader>Verify Twitter</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack>
          <Text>
            Please post a verification hash on Twitter to prove you own this account.
          </Text>
          <Button leftIcon={<FaTwitter />} onClick={tweetVerification}>
            Tweet verification
          </Button>
          <Text fontSize='12px' color="red.600">
            {message}
          </Text>
        </VStack>
      </ModalBody>
      <ModalFooter justifyContent="space-between">
        <Button onClick={goBack} variant='ghost'>
          Go back
        </Button>
        <Button onClick={verifyTweet} variant='solid'>
          I Tweeted
        </Button>
      </ModalFooter>
    </>
  )
}

const WelcomeBack = ({ username, onClose }: { username: string, onClose: any }) => {
  return (
    <>
      <ModalHeader>Welcome back {username}</ModalHeader>
      <ModalCloseButton />

      <ModalBody>
        <Text>
          Excited to have you back!
        </Text>
      </ModalBody>
      <ModalFooter>
        <Button variant='solid' onClick={onClose}>Done</Button>
      </ModalFooter>
    </>
  )
}

const AskUsername = ({ signedMessage, setUsername, setModalState }: { signedMessage: string, setUsername: any, setModalState: any }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const UsernameSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, 'Too Short!')
      .max(20, 'Too Long!')
      .matches(/^[a-zA-Z0-9_]{1,15}$/, 'invalid username')
      .required('Required'),
  });
  const formik = useFormik({
    initialValues: {
      username: '',
    },
    onSubmit: (value) => {
      onSubmit(value.username);
    },
    validationSchema: UsernameSchema,
  });

  useEffect(() => {
    setMessage(formik.errors.username || '');
  }, [formik.errors]);

  const onSubmit = (username: string) => {
    setModalState(SignInState.SignMessage);
    setUsername(username);

    fetch(`api/storeSignature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        signature: signedMessage
      }),
    }).then((res) => res.json())
      .then((data) => {
        if (data.status === 'Success') {
          setModalState(SignInState.Success);
        } else {
          setMessage(`We had an issue with generating a new profile. Please try again.`)
        }
      }).catch((err) => {
        console.log('err @ storeSignature', `${err}`);
        setMessage(`We had an issue with generating a new profile. Please try again. ${err}`)
      });
  }

  return (
    <>
      <ModalHeader>Welcome new user</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={formik.handleSubmit}>
        <ModalBody>
          <VStack gap={2}>
            <Text>
              Please choose a username for this app. This will be saved and will not be linked to your Twitter handle or address.
            </Text>
            <InputGroup>
              <Input
                id='username'
                name='username'
                type="text"
                value={formik.values.username}
                onChange={formik.handleChange}
              />
            </InputGroup>
            <Text fontSize='12px' color="red.600">
              {message}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          {loading ?
            <Button type="submit" variant='solid' disabled rightIcon={<Spinner />}>Submit</Button> :
            <Button type="submit" variant='solid'>Submit</Button>}
        </ModalFooter>
      </form>
    </>
  )
}


const Success = ({ username, onClose }: { username: string, onClose: any }) => {
  return (
    <>
      <ModalHeader>Welcome {username}</ModalHeader>
      <ModalCloseButton />

      <ModalBody>
        <Text>
          In the future, you will only have to sign a message to log in. You will not have to Tweet to verify your twitter account again.
        </Text>
      </ModalBody>
      <ModalFooter>
        <Button variant='solid' onClick={onClose}>Done</Button>
      </ModalFooter>
    </>
  )
}
