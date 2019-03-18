import {registerBidder} from '../src/adapters/bidderFactory';
import {BANNER} from '../src/mediaTypes';
import * as utils from '../src/utils';
import {config} from '../src/config';

export const BIDDER_CODE = 'emoteev';
export const ADAPTER_VERSION = '1.35.0';

export const EMOTEEV_BASE_URL = 'https://prebid.emoteev.com';
export const EMOTEEV_BASE_URL_STAGING = 'https://prebid-staging.emoteev.com';
export const EMOTEEV_BASE_URL_DEVELOPMENT = 'http://localhost:3000';

export const ENDPOINT_PATH = '/api/prebid/bid';
export const USER_SYNC_IFRAME_URL_PATH = '/api/prebid/sync-iframe';
export const USER_SYNC_IMAGE_URL_PATH = '/api/prebid/sync-image';

export const PRODUCTION = 'production';
export const STAGING = 'staging';
export const DEVELOPMENT = 'development';
export const DEFAULT_ENV = PRODUCTION;

export const conformBidRequest = bidRequest => {
  return {
    params: bidRequest.params,
    crumbs: bidRequest.crumbs,
    sizes: bidRequest.sizes,
    bidId: bidRequest.bidId,
    bidderRequestId: bidRequest.bidderRequestId,
  };
};

export const emoteevDebug = (parameterDebug, configDebug) => {
  if (parameterDebug && parameterDebug.length && parameterDebug.length > 0) return JSON.parse(parameterDebug);
  else if (configDebug) return configDebug;
  else return false;
};

export const emoteevEnv = (parameterEnv, configEnv) => {
  if (utils.contains([PRODUCTION, STAGING, DEVELOPMENT], parameterEnv)) return parameterEnv;
  else if (utils.contains([PRODUCTION, STAGING, DEVELOPMENT], configEnv)) return configEnv;
  else return DEFAULT_ENV;
};

export const emoteevOverrides = (parameterOverrides, configOverrides) => {
  if (parameterOverrides && parameterOverrides.length !== 0) {
    let parsedParams = null;
    try {
      parsedParams = JSON.parse(parameterOverrides);
    } catch (error) {
      parsedParams = null;
    }
    if (parsedParams) return parsedParams;
  }
  if (configOverrides && Object.keys(configOverrides).length !== 0) return configOverrides;
  else return {};
};

export const emoteevUrl = (environment) => {
  switch (environment) {
    case DEVELOPMENT:
      return EMOTEEV_BASE_URL_DEVELOPMENT;
    case STAGING:
      return EMOTEEV_BASE_URL_STAGING;
    default:
      return EMOTEEV_BASE_URL;
  }
};

export const endpointUrl = (parameterEnv, configEnv) => emoteevUrl(emoteevEnv(parameterEnv, configEnv)).concat(ENDPOINT_PATH);
export const userSyncIframeUrl = (parameterEnv, configEnv) => emoteevUrl(emoteevEnv(parameterEnv, configEnv)).concat(USER_SYNC_IFRAME_URL_PATH);
export const userSyncImageUrl = (parameterEnv, configEnv) => emoteevUrl(emoteevEnv(parameterEnv, configEnv)).concat(USER_SYNC_IMAGE_URL_PATH);

export const getViewDimensions = (window, document) => {
  let w = window;
  let prefix = 'inner';

  if (window.innerWidth === undefined || window.innerWidth === null) {
    w = document.documentElement || document.body;
    prefix = 'client';
  }

  return {
    width: w[`${prefix}Width`],
    height: w[`${prefix}Height`],
  };
};

export const getDeviceDimensions = (window) => {
  return {
    width: window.screen ? window.screen.width : '',
    height: window.screen ? window.screen.height : '',
  };
};

export const getDocumentDimensions = (document) => {
  const de = document.documentElement;
  const be = document.body;

  const bodyHeight = be ? Math.max(be.offsetHeight, be.scrollHeight) : 0;

  const w = Math.max(de.clientWidth, de.offsetWidth, de.scrollWidth);
  const h = Math.max(
    de.clientHeight,
    de.offsetHeight,
    de.scrollHeight,
    bodyHeight
  );

  return {
    width: isNaN(w) ? '' : w,
    height: isNaN(h) ? '' : h,
  };
};

export const isWebGLEnabled = () => {
  // Create test canvas
  let canvas = document.createElement('canvas');

  // The gl context
  let gl = null;

  // Try to get the regular WebGL
  try {
    gl = canvas.getContext('webgl');
  } catch (ex) {
    canvas = undefined;
    return false;
  }

  // No regular WebGL found
  if (!gl) {
    // Try experimental WebGL
    try {
      gl = canvas.getContext('experimental-webgl');
    } catch (ex) {
      canvas = undefined;
      return false;
    }
  }

  return !!gl;
};

export const getDeviceInfo = (deviceDimensions, viewDimensions, documentDimensions, webGL) => {
  return {
    browserWidth: viewDimensions.width,
    browserHeight: viewDimensions.height,
    deviceWidth: deviceDimensions.width,
    deviceHeight: deviceDimensions.height,
    documentWidth: documentDimensions.width,
    documentHeight: documentDimensions.height,
    webGL: webGL,
  };
};

const validateSizes = sizes => utils.isArray(sizes) && sizes.some(size => utils.isArray(size) && size.length === 2);

export const syncIframe = (syncs, enabled, parameterEnv, configEnv) => {
  if (enabled) {
    return syncs.concat([{
      type: 'iframe',
      url: userSyncIframeUrl(parameterEnv, configEnv),
    }]
    );
  } else {
    return syncs;
  }
};

export const syncPixel = (syncs, enabled, parameterEnv, configEnv) => {
  if (enabled) {
    return syncs.concat([{
      type: 'image',
      url: userSyncImageUrl(parameterEnv, configEnv),
    }]);
  } else {
    return syncs;
  }
};

export const getUserSyncs = (syncOptions) => {
  const parameterEnv = utils.getParameterByName('emoteev.env');
  const configEnv = config.getConfig('emoteev.env');
  let syncs = [];
  syncs = syncIframe(syncs, syncOptions.iframeEnabled, parameterEnv, configEnv);
  syncs = syncPixel(syncs, syncOptions.pixelEnabled, parameterEnv, configEnv);
  return syncs;
};

export const requestsPayload = (validBidRequests, bidderRequest, config) => {
  const emoteevConfig = (config['emoteev'] || {});
  return Object.assign({},
    {
      akPbjsVersion: ADAPTER_VERSION,
      bidRequests: validBidRequests.map(conformBidRequest),
      currency: config['currency'],
      debug: emoteevDebug(utils.getParameterByName('emoteevDebug'), emoteevConfig['debug']),
      language: navigator.language,
      refererInfo: bidderRequest.refererInfo,
      deviceInfo: getDeviceInfo(getDeviceDimensions(window), getViewDimensions(window, document), getDocumentDimensions(document), isWebGLEnabled(document)),
      userAgent: navigator.userAgent,
    },
    emoteevOverrides(utils.getParameterByName('emoteevOverrides'), emoteevConfig['overrides']));
};

export const buildRequests = (validBidRequests, bidderRequest) => {
  return {
    method: 'POST',
    url: endpointUrl(utils.getParameterByName('emoteevEnv'), config.getConfig('emoteev.env')),
    data: JSON.stringify(requestsPayload(validBidRequests, bidderRequest, config.getConfig()))
  };
};

export const isBidRequestValid = (bid) => {
  return !!(
    bid &&
    bid.params &&
    bid.params.adSpaceId &&
    bid.bidder === BIDDER_CODE &&
    validateSizes(bid.mediaTypes.banner.sizes)
  );
};

export const interpretResponse = (serverResponse) => serverResponse.body;

export const spec = {
  code: BIDDER_CODE,
  supportedMediaTypes: [BANNER],
  isBidRequestValid: isBidRequestValid,
  buildRequests: buildRequests,
  interpretResponse: interpretResponse,
  getUserSyncs: getUserSyncs,
};

registerBidder(spec);
