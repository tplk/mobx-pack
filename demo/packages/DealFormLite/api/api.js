// @flow
import { type CurrentPairPayloadType, type CurrentRatePayloadType } from '../../bus/busTypes.js';
import Emitter from '../../helper/helperClass/Emitter.js';

class Api {
  emitter = new Emitter();

  setPair(pair: CurrentPairPayloadType): void {
    console.log(['pair', pair]);
  }
  setRate(rate: CurrentRatePayloadType): void {
    console.log(['rate', rate]);
  }
}

/*
Emitter test
const api1 = new Api();
const api2 = new Api();
const handler1 = rate => {
  console.log([`handler1 = ${rate}`]);
};
const handler2 = rate => {
  console.log([`handler2 = ${rate}`]);
};

api1.subsRate(handler1);
api1.subsRate(handler2);

let cnt = 0;
setInterval(() => {
  cnt += 1;
  api1.emitter.emit(api1.subsRate, cnt);
  api2.emitter.emit(api2.subsRate, cnt);

}, 1000);

setTimeout(()=>{
  api1.emitter.removeSubscribers(api1.subsRate);
}, 10000); */

export default new Api();