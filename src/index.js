import feather from "feather-icons";
import init from "./init";
import { renderPaths, setClickHandler } from "./ui";

feather.replace();

window.addEventListener("DOMContentLoaded", () => {
  const wnVersion = sessionStorage.getItem("BENCHMARK_WN_VERSION") || "0.21.4";
  const env = sessionStorage.getItem("BENCHMARK_ENV") || "production";
  const paths = JSON.parse(sessionStorage.getItem("BENCHMARK_PATHS") || '{ "publicPaths": [], "privatePaths": []}');

  const versionSelect = document.getElementById("webnative-version");
  versionSelect.value = wnVersion;
  versionSelect.onchange = (e) => {
    const version = e.target.value;
    sessionStorage.setItem("BENCHMARK_WN_VERSION", version)
    window.location.reload();
  };

  loadWebnative(wnVersion)
    .then(() => {
      const wn = window.webnative;

      const envSelect = document.getElementById("environment");
      envSelect.value = env;
      envSelect.onchange = (e) => {
        const env = e.target.value;
        console.log(`🔀 Changed env to: ${env}`);
        sessionStorage.setItem("BENCHMARK_ENV", env);
        init(wn, env, paths);
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
      init(wn, env, paths);
    })
    .catch((err) => {
      console.error("Unable to initialize", err)
    })
});

const loadWebnative = version => {
  console.log(`🔀 Loading webnative version: ${version}`)
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'text/javascript';
    script.onload = resolve 
    script.onerror = reject 
    script.src = `//unpkg.com/webnative@${version}`
    document.head.append(script)
  })
}