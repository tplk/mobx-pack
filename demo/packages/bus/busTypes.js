// @flow


/* export default class ApiMD {
  platformApi;
  constructor(platformApi) {
    this.platformApi = platformApi;
  }

  getBalance(cb, type) {
    this.platformApi.getBalance(cb, type);
  }

  selectAsset(asset) {
    this.platformApi.selectAsset(asset);
  }

  subsBidPrice(cb) {
    this.platformApi.subsBidPrice(cb);
  }

  subsSelectedAsset(cb){
    this.platformApi.subsSelectedAsset(cb);
  }

} */


export const PLATFORM_EVENTS = {
  CURRENT_ASSET: 'PLF_CURRENT_ASSET',
  CURRENT_BALANCE: 'PLF_CURRENT_BALANCE',
  GET_BALANCE: 'PLF_GET_BALANCE',
  CURRENT_PRICE: 'PLF_CURRENT_PRICE',
};


export const DEAL_FORM_LITE_EVENTS = {
  SET_AMOUNT: 'DFL_SET_AMOUNT',
  SET_ASSET: 'DFL_SET_ASSET',
};

