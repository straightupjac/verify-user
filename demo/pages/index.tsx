import { Meta } from '@components/Meta'
import { SignInFlow } from '@components/SignInFlow'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Verify User Demo
        </h1>
        <SignInFlow />
        <p className={styles.description}>
          Check out the source code{' '}
          <a href="https://github.com/straightupjac/verify-user" target="_blank" rel="noreferrer">
            <code className={styles.code}>straightupjac/verify-user</code>
          </a>
        </p>

      </main>
    </div>
  )
}

export default Home
