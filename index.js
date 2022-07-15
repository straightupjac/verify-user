
const Twitter = require('twitter');
const { ArweaveClient } = require('ar-wrapper');
const { keccak256 } = require('@ethersproject/keccak256');
const { toUtf8Bytes } = require('@ethersproject/strings');

const DEFAULT_OPTIONS = {
  projectName: 'verify_user',
  twitterMessage: 'I am verifying my Twitter'
}

class VerifyUserClient {
  twitterClient;
  arweaveClient;
  options;

  constructor(twitterConfig, adminAddress, arweaveKeyfile, options = DEFAULT_OPTIONS) {
    this.twitterClient = new Twitter({
      consumer_key: twitterConfig.consumer_key,
      consumer_secret: twitterConfig.consumer_secret,
      bearer_token: twitterConfig.bearer_token,
    })

    this.arweaveClient = new ArweaveClient(adminAddress, arweaveKeyfile);
    this.options = options;
  }

  // get hash for verification
  // optionally generated client side
  createTwitterVerificationHash(signature) {
    const salt = randomBytes(32).toString();
    const hash = keccak256(toUtf8Bytes([signature, salt].join('-')));
    return {
      msg: 'success',
      hash
    }
  }

  // optionally generated on client-side
  async generateMessageToSign(handle) {
    if (!handle) {
      return {
        msg: "error: handle is required"
      }
    }
    this.twitterClient.get_user({ username: handle }, (error, tweets, response) => {
      if (error) return {
        msg: "error: internal error"
      }
      return {
        msg: 'success',
        messageToSign: `Please sign to verify you own this address.`,
        response
      }
    });
  }

  // twitter handle and verification hash required, no address stored
  // verification hash and handle are stored
  async verifyTwitter(handle, verificationHash) {
    const tweetTemplate = `${this.options.twitterMessage}`
    this.twitterClient.get('statuses/user_timeline', {
      screen_name: handle,
      include_rts: false,
      count: 5,
      tweet_mode: 'extended',
    }, (error, tweets, _) => {
      if (!error) {
        for (const tweet of tweets) {
          if (tweet.full_text.startsWith(tweetTemplate) && (tweet.full_text.includes(verificationHash))) {
            return {
              msg: 'succesfully verified twitter',
            }
          }
        }
      }
      else {
        return {
          msg: 'could not find verified tweet'
        }
      }
    });
  }

  // store signature and name
  // username should not be traceable back to twitter
  // signedMessage to verify user owns account
  async storeSignature(signedMessage, username) {
    if (!signedMessage) {
      return {
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
        msg: 'success',
        username,
      };
    } else {
      return {
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
        msg: 'success',
        username: sigDoc[0].username,
      }
    } else {
      return {
        msg: "error couldn't find user",
      };
    }
  }
}


module.exports = {
  VerifyUserClient,
  DEFAULT_OPTIONS,
}