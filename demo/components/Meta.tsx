import Head from "next/head"

export const Meta = () => {
  return (
    <Head>
      <title>verify-user demo</title>
      <meta name="title" content="Verify User" />
      <meta name="description" content="An experiement to verify a user's address and twitter account are linked without storing any identifiable user data." />
      <link rel="icon" href="/favicon.ico" />
      <meta property="og:type" content="website" />
      <meta name="og:title" content="Verify User" />
      <meta name="og:description" content="An experiement to verify a user's address and twitter account are linked without storing any identifiable user data." />
    </Head>
  )
}