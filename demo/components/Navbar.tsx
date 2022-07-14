import { Button, Flex } from "@chakra-ui/react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export const NavBar = () => {
  return (
    <Flex
      as="header"
      position="fixed"
      justifyContent="end"
      w="100%"
      p={2}
      px={4}
      backdropFilter="saturate(150%) blur(20px)"
      zIndex={100}
    >
      <ConnectButton />
    </Flex>)
}