import { Text, IconButton, VStack } from "@chakra-ui/react";
import styles from "@styles/Home.module.css";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className={`${styles.footer}`}>
      <VStack gap={0}>
        <Text>
          {`straightupjac`} &copy; {new Date().getFullYear()}
        </Text>
        <a href="https://github.com/straightupjac/verify-user" rel="noreferrer" target="_blank" >
          <IconButton
            aria-label="github icon"
            colorScheme="dark"
            variant="ghost"
            icon={<FaGithub />}
          />
        </a>
      </VStack>
    </footer>
  );
};

export default Footer;
