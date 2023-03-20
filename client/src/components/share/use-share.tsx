import i18next from 'i18next';

interface ShareTemplateProps {
  superBlock: string;
  block: string;
}

interface ShareTemplateReturnProps {
  handleRedirectToTwitter: () => void;
  redirectURL: string;
}

export const space = '%20';
export const hastag = '%23';
export const nextLine = '%0A';
export const action = 'intent/tweet';
export const twitterDomain = 'twitter.com';
export const freecodecampLearnDomainURL = 'www.freecodecamp.org/learn';
export const twitterDevelpoerDomainURL = 'https://developer.twitter.com';

export const useShare = ({
  superBlock,
  block
}: ShareTemplateProps): ShareTemplateReturnProps => {
  const redirectFreeCodeCampLearnURL = `https://${freecodecampLearnDomainURL}/${superBlock}/${hastag}${block}`;
  const i18nSupportedBlock =
    i18next.t(`intro:${superBlock}.blocks.${block}.title`) || block;

  const tweetMessage = `I${space}have${space}completed${space}${i18nSupportedBlock}${space}${hastag}freecodecamp`;
  const redirectURL = `https://${twitterDomain}/${action}?original_referer=${twitterDevelpoerDomainURL}&text=${tweetMessage}${nextLine}&url=${redirectFreeCodeCampLearnURL}`;

  const handleRedirectToTwitter = () => {
    window.open(redirectURL, '_blank');
  };
  return { handleRedirectToTwitter, redirectURL };
};
