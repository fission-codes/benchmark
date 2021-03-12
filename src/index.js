import * as wn from "webnative";
import feather from "feather-icons";
import init from './init'

feather.replace();

wn.setup.debug({ enabled: true });

const env = sessionStorage.getItem('BENCHMARK_ENV')
init(env);

document.getElementById('environment').onchange = (e) => {
  const env = e.target.value;
  console.log(`Changed env to: ${env}`)
  sessionStorage.setItem('BENCHMARK_ENV', env)
  init(env)
}