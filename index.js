
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
  createTwitterVerificationHash(handle, address) {
    const salt = randomBytes(32).toString();
    const hash = keccak256(toUtf8Bytes([address, handle, salt].join('-')));
    return {
      msg: 'success',
      hash
    }
  }

  // twitter handle and verification hash required, no address stored
  // verification hash and handle are stored
  async verifyTwitter(handle, verificationHash) {
    const storeVerifiedTwitter = async (handle, verificationHash) => {
      const DOC_TYPE = `${options.projectName}_doc_type`;
      const VERIFICATION_DOC = `${options.projectName}_verification`;
      const tags = {
        hash: verificationHash,
        handle,
      };
      tags[DOC_TYPE] = 'verification';
      const doc = await this.arweaveClient.addDocument(VERIFICATION_DOC, verificationHash, tags);
      if (doc.posted) {
        return {
          msg: 'success',
        };
      } else {
        return {
          msg: 'error adding verification hash'
        }
      }
    }

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
            storeVerifiedTwitter(handle, verificationHash).then((data) => {
              return {
                msg: 'succesfully verified twitter',
                data: data
              }
            })
            break;
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

  // check if user is verified
  async isVerifiedTwitter(handle) {
    const DOC_TYPE = `${options.projectName}_doc_type`;
    const tags = {
      handle: handle,
    };
    tags[DOC_TYPE] = 'verification';

    const verfiedDoc = await this.arweaveClient.getDocumentsByTags(tags)
    if (verfiedDoc.length > 0) {
      return {
        msg: 'success user is verified',
        hash: saltDoc[0].tags.hash,
      }
    } else {
      return {
        msg: 'user not found',
      };
    }
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