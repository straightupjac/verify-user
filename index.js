
const Twitter = require('twitter');
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
    this.twitterClient = new Twitter({
      consumer_key: twitterConfig.consumer_key,
      consumer_secret: twitterConfig.consumer_secret,
      bearer_token: twitterConfig.bearer_token,
    })
    this.arweaveClient = new ArweaveClient(adminAddress, arweaveKeyfile);
    this.options = options;
  }

  // get signature for verification
  createTwitterSignature(twitterHandle, address) {
    const salt = this.getSalt(address);
    if (salt.msg === 'error') {
      return {
        msg: 'error getting salt'
      }
    }
    const signature = keccak256(toUtf8Bytes([address, twitterHandle, salt].join('-')));
    return {
      msg: 'success',
      signature
    }
  }

  // get salt, create a new one if one does not exist
  async getSalt(address) {
    // create new salt
    const createSalt = async (address) => {
      const salt = randomBytes(32).toString();
      const SALT_DOC = `${options.projectName}_salt`;
      const DOC_TYPE = `${options.projectName}_doc_type`;
      const tags = {};
      tags[DOC_TYPE] = 'salt';
      tags['address'] = keccak256(address);
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
    const checkSalt = async (address) => {
      const tags = {
        address: keccak256(address),
      };
      tags[`${options.projectName}_doc_type`] = 'salt';
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

    const salt = await checkSalt(address);
    if (!salt) {
      return await createSalt(address);
    }
  }

  // store signature and name
  // name should not be traceable back to twitter
  async storeSignature(signature, name = '') {
    if (!signature) {
      return {
        msg: 'error, no signature provided'
      }
    }
    const SIG_DOC = `${options.projectName}_signature`;
    const DOC_TYPE = `${options.projectName}_doc_type`;
    const tags = {};
    tags[DOC_TYPE] = 'signature';
    tags['signature'] = signature;
    tags['name'] = name;

    const doc = await this.arweaveClient.addDocument(SIG_DOC, name, tags);
    if (doc.posted) {
      return {
        msg: 'success',
        signature,
        name,
      };
    } else {
      return {
        msg: 'error adding signature'
      }
    }
  }

  async getSignature(twitterHandle, address) {
    const signature = this.createTwitterSignature(twitterHandle, address);
    const tags = {
      signature: signature,
    };

    tags[`${options.projectName}_doc_type`] = 'signature';
    const sigDoc = await this.arweaveClient.getDocumentsByTags(tags)
    if (sigDoc.length > 0) {
      return {
        msg: 'success',
        name: sigDoc[0].name,
        signature: sigDoc.signature,
      }
    } else {
      return {
        msg: "error couldn't find user",
      };
    }
  }

  // twitter handle and account address required
  // optional: name, to display
  async verifyTwitter(twitterHandle, address, name = '') {
    const salt = this.getSalt(address);
    if (salt.msg === 'error') {
      return {
        msg: 'error getting salt'
      }
    }

    const tweetTemplate = `${this.options.twitterMessage}`
    const signature = keccak256(toUtf8Bytes([address, twitterHandle, salt].join('-')));
    this.twitterClient.get('statuses/user_timeline', {
      screen_name: handle,
      include_rts: false,
      count: 5,
      tweet_mode: 'extended',
    }, (error, tweets, _) => {
      if (!error) {
        for (const tweet of tweets) {
          if (tweet.full_text.startsWith(tweetTemplate) && (tweet.full_text.includes(signature))) {
            const res = this.storeSignature(signature, name);
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
}


module.exports = {
  VerifyUserClient,
  DEFAULT_OPTIONS,
}