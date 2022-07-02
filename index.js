
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
  async createTwitterVerification(handle, address) {
    const salt = await this.getSalt(keccak256(address));
    if (salt.msg === 'error') {
      return {
        msg: 'error getting salt'
      }
    }
    const verification = keccak256(toUtf8Bytes([address, handle, salt].join('-')));
    return {
      msg: 'success',
      verification
    }
  }

  // get salt, create a new one if one does not exist
  async getSalt(hashedAddress) {
    // create new salt
    const createSalt = async (hashedAddress) => {
      const salt = randomBytes(32).toString();
      const SALT_DOC = `${this.options.projectName}_salt`;
      const DOC_TYPE = `${this.options.projectName}_doc_type`;
      const tags = {};
      tags[DOC_TYPE] = 'salt';
      tags['address'] = hashedAddress;
      tags['salt'] = salt;

      const doc = await this.arweaveClient.addDocument(SALT_DOC, salt, tags);
      if (doc.posted) {
        return {
          msg: 'success',
          salt,
        };
      } else {
        return {
          msg: 'error'
        }
      }
    }

    // query salt
    const checkSalt = async (hashedAddress) => {
      const tags = {
        address: hashedAddress,
      };
      tags[`${this.options.projectName}_doc_type`] = 'salt';
      const saltDoc = await this.arweaveClient.getDocumentsByTags(tags)
      if (saltDoc.length > 0) {
        return {
          msg: 'success',
          salt: saltDoc[0].content,
        }
      } else {
        return {
          msg: 'error',
        };
      }
    }

    const salt = await checkSalt(hashedAddress);
    if (!salt) {
      return await createSalt(hashedAddress);
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
        name: sigDoc[0].username,
      }
    } else {
      return {
        msg: "error couldn't find user",
      };
    }
  }

  // twitter handle and signature (verification hash) required, no address stored
  // optional: name, to display
  async verifyTwitter(handle, signature) {
    const storeVerifiedTwitter = async (handle, verificationHash) => {
      const DOC_TYPE = `${this.options.projectName}_doc_type`;
      const VERIFICATION_DOC = `${this.options.projectName}_verification`;
      const tags = {
        hash: verificationHash,
        handle,
      };
      tags[DOC_TYPE] = 'verification';
      const doc = await this.arweaveClient.addDocument(VERIFICATION_DOC, verificationHash, tags);
      if (doc.posted) {
        return {
          msg: 'success',
          signature: verificationHash,
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
    }, async (error, tweets, _) => {
      if (!error) {
        for (const tweet of tweets) {
          if (tweet.full_text.startsWith(tweetTemplate) && (tweet.full_text.includes(signature))) {
            try {
              return {
                msg: 'error: succesfully verified twitter but unable to store'
              }
              return await storeVerifiedTwitter(handle, signature);
            } catch (err) {
              return {
                msg: 'error: succesfully verified twitter but unable to store',
                data: err
              }
            }
          }
        }
        return {
          msg: 'error: no matching tweets found'
        }
      }
      else {
        return {
          msg: 'error: verifying error'
        }
      }
    });
    return {
      msg: 'error: could not connect to twitter client'
    }
  }

  // check if user is verified
  async isVerifiedTwitter(handle) {
    const DOC_TYPE = `${this.options.projectName}_doc_type`;
    const tags = {
      handle: handle,
    };
    tags[DOC_TYPE] = 'verification';

    const verfiedDoc = await this.arweaveClient.getDocumentsByTags(tags)
    if (verfiedDoc.length > 0) {
      return {
        msg: 'success user is verified',
        salt: saltDoc[0].tags.hash,
      }
    } else {
      return {
        msg: 'user not found',
      };
    }
  }
}


module.exports = {
  VerifyUserClient,
  DEFAULT_OPTIONS,
}