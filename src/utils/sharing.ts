export const shareOnTwitter = (title: string, url: string) => {
  const text = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);
  window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
    "_blank"
  );
};

export const shareOnLinkedIn = (title: string, url: string) => {
  const shareUrl = encodeURIComponent(url);
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    "_blank"
  );
};