const { TwitterApi } = require('twitter-api-v2');
const { ArweaveClient } = require('ar-wrapper');
const { keccak256 } = require('@ethersproject/keccak256');
const { toUtf8Bytes } = require('@ethersproject/strings');
const { randomBytes } = require('crypto');

const DEFAULT_OPTIONS = {
  projectName: 'verify_user',
  twitterMessage: 'I am verifying my Twitter'
}
class VerifyUserClient {
  twitterClient;
  arweaveClient;
  options;

  constructor(twitterConfig, adminAddress, arweaveKeyfile, options = DEFAULT_OPTIONS) {
    this.twitterClient = new TwitterApi(twitterConfig.bearer_token);
    this.arweaveClient = new ArweaveClient(adminAddress, arweaveKeyfile);
    this.options = options;
  }

  // get hash for verification
  // optionally generated client side
  createTwitterVerificationHash(signature) {
    const salt = randomBytes(32).toString();
    const hash = keccak256(toUtf8Bytes([signature, salt].join('-')));
    return {
      status: 'Success',
      msg: 'success',
      hash
    }
  }

  // returns a message that is ready to sign with twitter userID embedded inside
  // optionally generated on client-side
  async generateMessageToSign(handle, messageTemplate = "Please sign to verify you own this address (gassless).") {
    if (!handle) {
      return {
        status: 'Error',
        msg: "error: handle is required"
      }
    }
    try {
      const { data: { id } } = await this.twitterClient.v2.userByUsername(handle);
      return {
        status: 'Success',
        msg: "success",
        messageToSign: `${messageTemplate} userId: ${id}`,
        userId: id,
      }
    } catch (err) {
      return {
        status: 'Error',
        msg: `error: internal error retrieving user id, ${err}`,
      }
    }
  }

  // twitter handle and verification hash required, no address stored
  // verification hash and handle are stored
  async verifyTwitter(handle, verificationHash) {
    const tweetTemplate = `${this.options.twitterMessage}`
    try {
      const { data: { id: userId } } = await this.twitterClient.v2.userByUsername(handle);
      const { data: tweets } = await this.twitterClient.v2.userTimeline(userId, { exclude: "replies", max_results: 5 });
      for (const tweet of tweets.data) {
        if (tweet.text.startsWith(tweetTemplate) && (tweet.text.includes(verificationHash))) {
          return {
            status: 'Success',
            msg: `succesfully verified twitter, tweetId: ${tweet.id}`,
          }
        }
      }
      return {
        status: 'Error',
        msg: `Could not find tweet of the form ${tweetTemplate} and ${verificationHash} from @${handle} (${userId})`
      }
    } catch (err) {
      return {
        status: 'Error',
        msg: `${err}`
      }
    }
  }

  // store signature and name
  // username should not be traceable back to twitter
  // signedMessage to verify user owns account
  async storeSignature(signedMessage, username) {
    if (!signedMessage) {
      return {
        status: 'Error',
        msg: 'error, missing required fields'
      }
    }
    const SIG_DOC = `${this.options.projectName}_signature`;
    const DOC_TYPE = `${this.options.projectName}_doc_type`;
    const tags = {};
    tags[DOC_TYPE] = 'signature';
    tags['username'] = username;
    tags['signedMessage'] = keccak256(toUtf8Bytes(signedMessage));

    const doc = await this.arweaveClient.addDocument(SIG_DOC, keccak256(toUtf8Bytes(signedMessage)), tags);
    if (doc.posted) {
      return {
        status: 'Success',
        msg: 'success',
        username,
      };
    } else {
      return {
        status: 'Error',
        msg: 'error adding signature'
      }
    }
  }

  // get signature from arweave
  async getUser(signedMessage) {
    const tags = {
      signedMessage: keccak256(toUtf8Bytes(signedMessage)),
    };
    tags[`${this.options.projectName}_doc_type`] = 'signature';
    const sigDoc = await this.arweaveClient.getDocumentsByTags(tags)
    if (sigDoc.length > 0) {
      return {
        status: 'Success',
        msg: 'success',
        username: sigDoc[0].tags['username'],
      }
    } else {
      return {
        status: 'Error',
        msg: "error couldn't find user",
      };
    }
  }
}


module.exports = {
  VerifyUserClient,
  DEFAULT_OPTIONS,
}