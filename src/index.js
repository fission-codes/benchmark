import * as wn from "webnative";
import feather from "feather-icons";
import init from './init'

feather.replace();

wn.setup.debug({ enabled: true });

init();

document.getElementById('environment').onchange = (e) => {
  console.log('Changed env to: ', e.target.value)
  init(e.target.value)
}