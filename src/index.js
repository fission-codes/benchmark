import * as wn from "webnative";
import feather from "feather-icons";
import init from "./init";
import { renderPaths, setClickHandler } from "./ui";

feather.replace();

wn.setup.debug({ enabled: true });

window.addEventListener("DOMContentLoaded", () => {
  const env = sessionStorage.getItem("BENCHMARK_ENV") || "production";
  const paths = JSON.parse(sessionStorage.getItem("BENCHMARK_PATHS") || '{ "publicPaths": [], "privatePaths": []}');
  const envSelect = document.getElementById("environment");
  envSelect.value = env;

  envSelect.onchange = (e) => {
    const env = e.target.value;
    console.log(`🔀 Changed env to: ${env}`);
    sessionStorage.setItem("BENCHMARK_ENV", env);
    init(env, paths);
  };

  setClickHandler('path-add', () => {
    const newName = document.getElementById('path-name').value;
    const pathType = document.getElementById('path-type').value;
    if (pathType === 'public') {
      paths.publicPaths.push(newName)
    } else {
      paths.privatePaths.push(newName)
    }
    sessionStorage.setItem("BENCHMARK_PATHS", JSON.stringify(paths));
    document.getElementById('path-name').value = '';
    renderPaths(paths)
  })
  renderPaths(paths)
  init(env, paths);
});
