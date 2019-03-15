import {assert, expect} from 'chai';
import {
  buildRequests,
  conformBidRequest,
  DEFAULT_ENV,
  DEVELOPMENT,
  EMOTEEV_BASE_URL,
  EMOTEEV_BASE_URL_DEVELOPMENT,
  EMOTEEV_BASE_URL_STAGING,
  ADAPTER_VERSION,
  emoteevDebug,
  emoteevEnv,
  emoteevOverrides,
  emoteevUrl,
  ENDPOINT_PATH,
  endpointUrl,
  getDeviceDimensions,
  getDeviceInfo,
  getDocumentDimensions,
  getUserSyncs,
  getViewDimensions,
  isWebGLEnabled,
  PRODUCTION,
  requestsPayload,
  spec,
  STAGING,
  syncIframe,
  syncPixel,
  USER_SYNC_IFRAME_URL_PATH,
  USER_SYNC_IMAGE_URL_PATH,
  userSyncIframeUrl,
  userSyncImageUrl
} from 'modules/emoteevBidAdapter';
import {newBidder} from 'src/adapters/bidderFactory';
import {config} from 'src/config';
import * as utils from '../../../src/utils';

const cannedValidBidRequests = [{
  adUnitCode: '/19968336/header-bid-tag-1',
  auctionId: 'fcbf2b27-a951-496f-b5bb-1324ce7c0558',
  bidId: '2b8de6572e8193',
  bidRequestsCount: 1,
  bidder: 'emoteev',
  bidderRequestId: '1203b39fecc6a5',
  crumbs: {pubcid: 'f3371d16-4e8b-42b5-a770-7e5be1fdf03d'},
  params: {adSpaceId: 5084},
  sizes: [[300, 250], [250, 300], [300, 600]],
  transactionId: '58dbd732-7a39-45f1-b23e-1c24051a941c',
}];
const cannedBidderRequest = {
  auctionId: 'fcbf2b27-a951-496f-b5bb-1324ce7c0558',
  auctionStart: 1544200122837,
  bidderCode: 'emoteev',
  bidderRequestId: '1203b39fecc6a5',
  doneCbCallCount: 0,
  refererInfo: {
    canonicalUrl: undefined,
    numIframes: 0,
    reachedTop: true,
    referer: 'http://localhost:9999/integrationExamples/gpt/hello_world_emoteev.html',
    stack: ['http://localhost:9999/integrationExamples/gpt/hello_world_emoteev.html']
  },
  start: 1544200012839,
  timeout: 3000
};
const serverResponse =
  {
    body: [
      {
        requestId: cannedValidBidRequests[0].bidId,
        cpm: 1,
        width: cannedValidBidRequests[0].sizes[0][0],
        height: cannedValidBidRequests[0].sizes[0][1],
        ad: '<div><script src="https://some.sources"></script></div>',
        ttl: 360,
        creativeId: 123,
        netRevenue: false,
        currency: 'EUR',
      }
    ]
  };

describe('emoteevBidAdapter', function () {
  afterEach(function () {
    config.resetConfig();
  });

  const adapter = newBidder(spec);

  describe('inherited functions', function () {
    it('exists and is a function', function () {
      expect(adapter.callBids).to.exist.and.to.be.a('function');
    });
  });

  describe('conformBidRequest', function () {
    it('returns a bid-request', function () {
      expect(conformBidRequest(cannedValidBidRequests[0])).to.deep.equal({
        params: cannedValidBidRequests[0].params,
        crumbs: cannedValidBidRequests[0].crumbs,
        sizes: cannedValidBidRequests[0].sizes,
        bidId: cannedValidBidRequests[0].bidId,
        bidderRequestId: cannedValidBidRequests[0].bidderRequestId,
      });
    })
  });

  describe('emoteevDebug', function () {
    expect(emoteevDebug(null, null)).to.deep.equal(false);
    expect(emoteevDebug(null, true)).to.deep.equal(true);
    expect(emoteevDebug(JSON.stringify(true), null)).to.deep.equal(true);
  });

  describe('emoteevEnv', function () {
    expect(emoteevEnv(null, null)).to.deep.equal(DEFAULT_ENV);
    expect(emoteevEnv(null, STAGING)).to.deep.equal(STAGING);
    expect(emoteevEnv(STAGING, null)).to.deep.equal(STAGING);
  });

  describe('emoteevOverrides', function () {
    expect(emoteevOverrides(null, null)).to.deep.equal({});
    expect(emoteevOverrides(JSON.stringify({a: 1}), null)).to.deep.equal({a: 1});
    expect(emoteevOverrides('incorrect', null)).to.deep.equal({});
    expect(emoteevOverrides(null, {a: 1})).to.deep.equal({a: 1});
  });

  describe('emoteevUrl', function () {
    expect(emoteevUrl(null)).to.deep.equal(EMOTEEV_BASE_URL);
    expect(emoteevUrl('anything')).to.deep.equal(EMOTEEV_BASE_URL);
    expect(emoteevUrl(PRODUCTION)).to.deep.equal(EMOTEEV_BASE_URL);
    expect(emoteevUrl(STAGING)).to.deep.equal(EMOTEEV_BASE_URL_STAGING);
    expect(emoteevUrl(DEVELOPMENT)).to.deep.equal(EMOTEEV_BASE_URL_DEVELOPMENT);
  });

  describe('endpointUrl', function () {
    expect(endpointUrl(null, null)).to.deep.equal(EMOTEEV_BASE_URL.concat(ENDPOINT_PATH));
    expect(endpointUrl(null, PRODUCTION)).to.deep.equal(EMOTEEV_BASE_URL.concat(ENDPOINT_PATH));
    expect(endpointUrl(PRODUCTION, null)).to.deep.equal(EMOTEEV_BASE_URL.concat(ENDPOINT_PATH));
    expect(endpointUrl(null, STAGING)).to.deep.equal(EMOTEEV_BASE_URL_STAGING.concat(ENDPOINT_PATH));
    expect(endpointUrl(STAGING, null)).to.deep.equal(EMOTEEV_BASE_URL_STAGING.concat(ENDPOINT_PATH));
    expect(endpointUrl(null, DEVELOPMENT)).to.deep.equal(EMOTEEV_BASE_URL_DEVELOPMENT.concat(ENDPOINT_PATH));
    expect(endpointUrl(DEVELOPMENT, null)).to.deep.equal(EMOTEEV_BASE_URL_DEVELOPMENT.concat(ENDPOINT_PATH));
  });

  describe('userSyncIframeUrl', function () {
    expect(userSyncIframeUrl(null, null)).to.deep.equal(EMOTEEV_BASE_URL.concat(USER_SYNC_IFRAME_URL_PATH));
    expect(userSyncIframeUrl(null, PRODUCTION)).to.deep.equal(EMOTEEV_BASE_URL.concat(USER_SYNC_IFRAME_URL_PATH));
    expect(userSyncIframeUrl(PRODUCTION, null)).to.deep.equal(EMOTEEV_BASE_URL.concat(USER_SYNC_IFRAME_URL_PATH));
    expect(userSyncIframeUrl(null, STAGING)).to.deep.equal(EMOTEEV_BASE_URL_STAGING.concat(USER_SYNC_IFRAME_URL_PATH));
    expect(userSyncIframeUrl(STAGING, null)).to.deep.equal(EMOTEEV_BASE_URL_STAGING.concat(USER_SYNC_IFRAME_URL_PATH));
    expect(userSyncIframeUrl(null, DEVELOPMENT)).to.deep.equal(EMOTEEV_BASE_URL_DEVELOPMENT.concat(USER_SYNC_IFRAME_URL_PATH));
    expect(userSyncIframeUrl(DEVELOPMENT, null)).to.deep.equal(EMOTEEV_BASE_URL_DEVELOPMENT.concat(USER_SYNC_IFRAME_URL_PATH));
  });

  describe('userSyncImageUrl', function () {
    expect(userSyncImageUrl(null, null)).to.deep.equal(EMOTEEV_BASE_URL.concat(USER_SYNC_IMAGE_URL_PATH));
    expect(userSyncImageUrl(null, PRODUCTION)).to.deep.equal(EMOTEEV_BASE_URL.concat(USER_SYNC_IMAGE_URL_PATH));
    expect(userSyncImageUrl(PRODUCTION, null)).to.deep.equal(EMOTEEV_BASE_URL.concat(USER_SYNC_IMAGE_URL_PATH));
    expect(userSyncImageUrl(null, STAGING)).to.deep.equal(EMOTEEV_BASE_URL_STAGING.concat(USER_SYNC_IMAGE_URL_PATH));
    expect(userSyncImageUrl(STAGING, null)).to.deep.equal(EMOTEEV_BASE_URL_STAGING.concat(USER_SYNC_IMAGE_URL_PATH));
    expect(userSyncImageUrl(null, DEVELOPMENT)).to.deep.equal(EMOTEEV_BASE_URL_DEVELOPMENT.concat(USER_SYNC_IMAGE_URL_PATH));
    expect(userSyncImageUrl(DEVELOPMENT, null)).to.deep.equal(EMOTEEV_BASE_URL_DEVELOPMENT.concat(USER_SYNC_IMAGE_URL_PATH));
  });

  describe('getViewDimensions', function () {
    const window = {
      innerWidth: 1024,
      innerHeight: 768
    };
    const documentWithElement = {
      documentElement:
        {
          clientWidth: 512,
          clientHeight: 384
        }
    };
    const documentWithBody = {
      body:
        {
          clientWidth: 512,
          clientHeight: 384
        }
    };
    expect(getViewDimensions(window, documentWithElement)).to.deep.equal({
      width: 1024,
      height: 768
    });
    expect(getViewDimensions(window, documentWithBody)).to.deep.equal({width: 1024, height: 768});
    expect(getViewDimensions(window, documentWithElement)).to.deep.equal({
      width: 1024,
      height: 768
    });
    expect(getViewDimensions(window, documentWithBody)).to.deep.equal({width: 1024, height: 768});
    expect(getViewDimensions({}, documentWithElement)).to.deep.equal({width: 512, height: 384});
    expect(getViewDimensions({}, documentWithBody)).to.deep.equal({width: 512, height: 384});
  });

  describe('getDeviceDimensions', function () {
    const window = {screen: {width: 1024, height: 768}};
    expect(getDeviceDimensions(window)).to.deep.equal({width: 1024, height: 768});
    expect(getDeviceDimensions({})).to.deep.equal({width: '', height: ''});
  });

  describe('getDocumentDimensions', function () {
    expect(getDocumentDimensions({
      documentElement: {
        clientWidth: 1,
        clientHeight: 1,
        offsetWidth: 0,
        offsetHeight: 0,
        scrollWidth: 0,
        scrollHeight: 0,
      },
      body: {
        scrollHeight: 0,
        offsetHeight: 0,
      }
    })).to.deep.equal({width: 1, height: 1});

    expect(getDocumentDimensions({
      documentElement: {
        clientWidth: 0,
        clientHeight: 0,
        offsetWidth: 1,
        offsetHeight: 1,
        scrollWidth: 0,
        scrollHeight: 0,
      },
      body: {
        scrollHeight: 0,
        offsetHeight: 0,
      }
    })).to.deep.equal({width: 1, height: 1});

    expect(getDocumentDimensions({
      documentElement: {
        clientWidth: 0,
        clientHeight: 0,
        offsetWidth: 0,
        offsetHeight: 0,
        scrollWidth: 1,
        scrollHeight: 1,
      },
      body: {
        scrollHeight: 0,
        offsetHeight: 0,
      }
    })).to.deep.equal({width: 1, height: 1});

    expect(getDocumentDimensions({
      documentElement: {
        clientWidth: undefined,
        clientHeight: undefined,
        offsetWidth: undefined,
        offsetHeight: undefined,
        scrollWidth: undefined,
        scrollHeight: undefined,
      },
      body: {
        scrollHeight: undefined,
        offsetHeight: undefined,
      }
    })).to.deep.equal({width: '', height: ''});
  });

  describe('getDeviceInfo', function () {
    expect(getDeviceInfo(
      {width: 1, height: 2},
      {width: 3, height: 4},
      {width: 5, height: 6},
      true
    )).to.deep.equal({
      deviceWidth: 1,
      deviceHeight: 2,
      browserWidth: 3,
      browserHeight: 4,
      documentWidth: 5,
      documentHeight: 6,
      webGL: true
    });
  });

  describe('isBidRequestValid', function () {
    it('should return true when required params found', function () {
      const validBid = {
        bidder: 'emoteev',
        params: {
          adSpaceId: 12345,
        },
        mediaTypes: {
          banner: {
            sizes: [[750, 200]]
          }
        },
      };
      expect(spec.isBidRequestValid(validBid)).to.equal(true);
    });

    it('should return false when required params are invalid', function () {
      expect(spec.isBidRequestValid({
        bidder: '', // invalid bidder
        params: {
          adSpaceId: 12345,
        },
        mediaTypes: {
          banner: {
            sizes: [[750, 200]]
          }
        },
      })).to.equal(false);
      expect(spec.isBidRequestValid({
        bidder: 'emoteev',
        params: {
          adSpaceId: '', // invalid adSpaceId
        },
        mediaTypes: {
          banner: {
            sizes: [[750, 200]]
          }
        },
      })).to.equal(false);
      expect(spec.isBidRequestValid({
        bidder: 'emoteev',
        params: {
          adSpaceId: 12345,
        },
        mediaTypes: {
          banner: {
            sizes: [[750]] // invalid size
          }
        },
      })).to.equal(false);
    });
  });

  describe('requestsPayload', function () {
    const
      currency = 'EUR',
      emoteevEnv = STAGING,
      emoteevDebug = true,
      emoteevOverrides = {
        iAmOverride: 'iAmOverride'
      };

    const payload = requestsPayload(
      cannedValidBidRequests,
      cannedBidderRequest,
      {
        currency,
        emoteev: {
          env: STAGING,
          debug: emoteevDebug,
          overrides: emoteevOverrides
        }
      });

    expect(payload).to.exist.and.have.all.keys(
      'adapterVersion',
      'bidRequests',
      'currency',
      'debug',
      'iAmOverride',
      'language',
      'refererInfo',
      'deviceInfo',
      'userAgent',
    );

    expect(payload.bidRequests[0]).to.exist.and.have.all.keys(
      'params',
      'crumbs',
      'sizes',
      'bidId',
      'bidderRequestId',
    );

    expect(payload.adapterVersion).to.deep.equal(ADAPTER_VERSION);
    expect(payload.bidRequests[0].params).to.deep.equal(cannedValidBidRequests[0].params);
    expect(payload.bidRequests[0].crumbs).to.deep.equal(cannedValidBidRequests[0].crumbs);
    expect(payload.bidRequests[0].mediaTypes).to.deep.equal(cannedValidBidRequests[0].mediaTypes);
    expect(payload.bidRequests[0].bidId).to.deep.equal(cannedValidBidRequests[0].bidId);
    expect(payload.bidRequests[0].bidderRequestId).to.deep.equal(cannedValidBidRequests[0].bidderRequestId);
    expect(payload.currency).to.deep.equal(currency);
    expect(payload.debug).to.deep.equal(emoteevDebug);
    expect(payload.iAmOverride).to.deep.equal('iAmOverride');
    expect(payload.language).to.deep.equal(navigator.language);
    expect(payload.deviceInfo).to.exist.and.have.all.keys(
      'browserWidth',
      'browserHeight',
      'deviceWidth',
      'deviceHeight',
      'documentWidth',
      'documentHeight',
      'webGL',
    );
    expect(payload.userAgent).to.deep.equal(navigator.userAgent);
  });

  describe('buildRequests', function () {
    const request = buildRequests(cannedValidBidRequests, cannedBidderRequest);
    expect(request).to.exist.and.have.all.keys(
      'method',
      'url',
      'data',
    );
    expect(request.method).to.equal('POST');
    expect(request.url).to.equal(endpointUrl(emoteevEnv, emoteevEnv));
  });

  describe('interpretResponse', function () {
    it('bid objects from response', function () {
      const bidResponses = spec.interpretResponse(serverResponse);
      expect(bidResponses).to.be.an('array').that.is.not.empty; // yes, syntax is correct
      expect(bidResponses[0]).to.have.all.keys(
        'requestId',
        'cpm',
        'width',
        'height',
        'ad',
        'ttl',
        'creativeId',
        'netRevenue',
        'currency',
      );

      expect(bidResponses[0].requestId).to.equal(cannedValidBidRequests[0].bidId);
      expect(bidResponses[0].cpm).to.equal(serverResponse.body[0].cpm);
      expect(bidResponses[0].width).to.equal(serverResponse.body[0].width);
      expect(bidResponses[0].height).to.equal(serverResponse.body[0].height);
      expect(bidResponses[0].ad).to.equal(serverResponse.body[0].ad);
      expect(bidResponses[0].ttl).to.equal(serverResponse.body[0].ttl);
      expect(bidResponses[0].creativeId).to.equal(serverResponse.body[0].creativeId);
      expect(bidResponses[0].netRevenue).to.equal(serverResponse.body[0].netRevenue);
      expect(bidResponses[0].currency).to.equal(serverResponse.body[0].currency);
    });
  });

  describe('syncIframe', function () {
    expect(syncIframe([], false, PRODUCTION, PRODUCTION)).to.deep.equal([]);
    expect(syncIframe([], true, PRODUCTION, PRODUCTION)).to.deep.equal([{
      type: 'iframe',
      url: EMOTEEV_BASE_URL.concat(USER_SYNC_IFRAME_URL_PATH)
    }]);
  });

  describe('syncPixel', function () {
    expect(syncPixel([], false, PRODUCTION, PRODUCTION)).to.deep.equal([]);
    expect(syncPixel([], true, PRODUCTION, PRODUCTION)).to.deep.equal([{
      type: 'image',
      url: EMOTEEV_BASE_URL.concat(USER_SYNC_IMAGE_URL_PATH)
    }]);
  });

  describe('getUserSyncs', function () {
    assert.isArray(getUserSyncs({
      iframeEnabled: true,
      pixelEnabled: true
    }));
  });

  describe('isWebGLEnabled', function () {
    const document = new Document();
    assert.isBoolean(isWebGLEnabled(document));
  });
});
