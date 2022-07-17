import { IconButton, Text, VStack } from '@chakra-ui/react'
import Footer from '@components/Footer'
import { SignInFlow } from '@components/SignInFlow'
import type { NextPage } from 'next'
import { FaGithub } from 'react-icons/fa'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <>
      <div className={styles.container}>
        <main className={styles.main}>
          <VStack gap={2}>
            <h1 className={styles.title}>
              Verify User Demo
            </h1>
            <Text fontSize='1.5rem'>
              {`An experiement to verify a user's crypto address and twitter account are linked without storing any identifiable user data. No identifiable data will be stored.`}
            </Text>
            <SignInFlow />
            <p className={styles.description}>
              Check out the source code{' '}
              <a href="https://github.com/straightupjac/verify-user" target="_blank" rel="noreferrer">
                <code className={styles.code}>straightupjac/verify-user</code>
              </a>
            </p>
            <a href="https://github.com/straightupjac/verify-user" rel="noreferrer" target="_blank" >
              <IconButton
                aria-label="github icon"
                colorScheme="dark"
                variant="ghost"
                icon={<FaGithub />}
              />
            </a>
          </VStack>
        </main>
      </div>
    </>
  )
}

export default Home
