import { TwitterApi } from 'twitter-api-v2';

const twitterClient = new TwitterApi(process.env.BEARER_TOKEN || "")

export const verifyTweet = async (handle: string, verificationHash: string) => {
  const tweetTemplate = 'I am verifying I own this account.'

  try {
    const { data: { id: userId } } = await twitterClient.v2.userByUsername(handle);
    const { data: tweets } = await twitterClient.v2.userTimeline(userId, { exclude: "replies", max_results: 5 });
    for (const tweet of tweets.data) {
      if (tweet.text.startsWith(tweetTemplate) && (tweet.text.includes(verificationHash))) {
        return {
          status: 'Success',
          msg: `succesfully verified twitter, tweetId: ${tweet.id}`,
        }
      }
    }
    return tweets;
  } catch (err) {
    return {
      status: 'Error',
      msg: `${err}`
    }
  }
}