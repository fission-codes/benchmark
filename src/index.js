import feather from "feather-icons";
import semver from "semver";
import init from "./init";
import { renderPaths, setClickHandler } from "./ui";

const MIN_SUPPORTED = "v0.21.4";

feather.replace();

window.addEventListener("DOMContentLoaded", async () => {
  const sessionStart = initSessionStorage("BENCHMARK_SESSION", Date.now());
  const versions = await getVersions();
  const wnVersion = initSessionStorage(
    "BENCHMARK_WN_VERSION",
    versions["latest"]
  );
  const env = initSessionStorage("BENCHMARK_ENV", "production");
  const paths = JSON.parse(initSessionStorage("BENCHMARK_PATHS", "[]"));

  const versionSelect = document.getElementById("webnative-version");
  await initVersionSelect(versions, versionSelect, wnVersion);
  versionSelect.onchange = (e) => {
    const version = e.target.value;
    sessionStorage.setItem("BENCHMARK_WN_VERSION", version);
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

      setClickHandler("path-add", () => {
        const newPath = {
          name: document.getElementById("path-name").value,
          type: document.getElementById("path-type").value,
        };

        paths.push(newPath);

        sessionStorage.setItem("BENCHMARK_PATHS", JSON.stringify(paths));
        document.getElementById("path-name").value = "";
        renderPaths(paths);
        init(wn, env, paths);
      });
      renderPaths(paths);
      init(wn, env, paths);
    })
    .catch((err) => {
      console.error("Unable to initialize", err);
    });
});

const loadWebnative = (version) => {
  console.log(`🔀 Loading webnative version: ${version}`);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = resolve;
    script.onerror = reject;
    script.src = getSourceURL(version);
    document.head.append(script);
  });
};

const initSessionStorage = (key, defaultValue) => {
  let value = sessionStorage.getItem(key);
  if (!value) {
    sessionStorage.setItem(key, defaultValue);
    value = defaultValue;
  }

  return value;
};

const getVersions = () => {
  // NOTE: this is a CORS-enabled registry mirror
  const url = "https://registry.npmjs.cf/webnative";
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const versions = data["dist-tags"];
      // Grab the previous major versions:
      let lastVersion = versions["latest"];
      Object.keys(data["versions"])
        .reverse()
        .forEach((v) => {
          if (
            !semver.prerelease(v) &&
            semver.gt(lastVersion, MIN_SUPPORTED) &&
            semver.minor(v) < semver.minor(lastVersion)
          ) {
            lastVersion = versions[v] = v;
          }
        });
      return versions;
    })
    .catch((err) => console.error(err));
};

const initVersionSelect = async (versions, el, current) => {
  Object.keys(versions).forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.innerHTML = versions[key];
    if (current === versions[key]) {
      opt.selected = true;
    }
    el.appendChild(opt);
  });
};

const getSourceURL = (version) => {
  let url = `//unpkg.com/webnative@${version}`;
  if (version === "latest" || semver.gte(version, "0.26.0")) {
    url += "/dist/index.min.js";
  }
  return url;
};
