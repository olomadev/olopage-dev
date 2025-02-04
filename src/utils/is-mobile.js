const mobileRE =
  /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|samsungbrowser.*mobile|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
const notMobileRE = /CrOS/;
const tabletRE = /android|ipad|playbook|silk/i;

/**
 * Determines if the current device is a mobile or tablet device.
 * @param {Object} opts - Options for the detection.
 * @param {string|Object} [opts.ua] - User agent string or request object.
 * @param {boolean} [opts.tablet] - Whether to detect tablets.
 * @param {boolean} [opts.featureDetect] - Whether to use feature detection.
 * @returns {boolean} `true` if the device is mobile or tablet, `false` otherwise.
 */
export const isMobile = (opts = {}) => {
  let ua = opts.ua || (typeof navigator !== 'undefined' && navigator.userAgent);

  if (ua && typeof ua === 'object' && ua.headers && typeof ua.headers['user-agent'] === 'string') {
    ua = ua.headers['user-agent'];
  }

  if (typeof ua !== 'string') {
    return false;
  }

  if (mobileRE.test(ua) && !notMobileRE.test(ua)) {
    return true;
  }

  if (opts.tablet && tabletRE.test(ua)) {
    return true;
  }

  if (
    opts.tablet &&
    opts.featureDetect &&
    typeof navigator !== 'undefined' &&
    navigator.maxTouchPoints > 1 &&
    ua.includes('Macintosh') &&
    ua.includes('Safari')
  ) {
    return true;
  }

  return false;
};
export default isMobile;