import {
  renderMeasurements,
  setClickHandler,
  setContent,
  showError,
  showIds,
} from "./ui";
import semver from "semver";
import feather from "feather-icons";

let fs;
let roots;

let currentPath = null;

export const saveTimings = async () => {
  const sessionStart = sessionStorage.getItem("BENCHMARK_SESSION");
  const measures = performance.getEntriesByType("measure");

  const data = {
    userAgent: navigator.userAgent,
    sessionStart: sessionStart,
    version: sessionStorage.getItem("BENCHMARK_WN_VERSION"),
    environment: sessionStorage.getItem("BENCHMARK_ENV"),
    timings: measures.map((measure) => ({
      name: measure.name,
      startTime: measure.startTime,
      duration: measure.duration,
    })),
  };

  const filePath = fs.appPath(nameToFilePath(`timings_${sessionStart}.json`));
  await fs.write(filePath, JSON.stringify(data));
  await fs.publish();
};

const getRoots = () => {
  let files = {};

  const wnVersion = webnative.VERSION;

  // Add the app path
  files[pathToString(fs.appPath())] = {
    name: pathToString(fs.appPath()),
  };

  roots[getKeyName("private")].forEach((path) => {
    files[`private/${pathToString(path)}`] = {
      name: `private/${pathToString(path)}`,
    };
  });

  roots[getKeyName("public")].forEach((path) => {
    files[`public/${pathToString(path)}`] = {
      name: `public/${pathToString(path)}`,
    };
  });

  return files;
};

const isRoot = (path) => {
  const roots = getRoots();
  return roots.hasOwnProperty(path);
};

const listFiles = async () => {
  if (!currentPath) {
    return renderFiles(getRoots());
  }
  try {
    performance.mark("BEGIN_LS");
    let files = await fs.ls(stringToPath(currentPath));
    renderFiles(files);
    performance.measure(`FS_LS ${currentPath}`, "BEGIN_LS");
    saveTimings();
    renderMeasurements();
  } catch (err) {
    showError(err);
  }
};

const addFile = async () => {
  const file = document.getElementById("input-file").files[0];
  if (!file) return;

  performance.mark("BEGIN_ADD");
  const fullPath = stringToPath(`${currentPath}${file.name}`);
  await fs.add(fullPath, file);
  await fs.publish();
  performance.measure("FS_ADD", "BEGIN_ADD");

  listFiles("private");
};

const mkDir = async () => {
  const name = document.getElementById("folder-name").value;
  if (!name) return;

  performance.mark("BEGIN_MKDIR");
  await fs.mkdir(dirToPath(`${currentPath}${name}`));
  await fs.publish();
  performance.measure("FS_MKDIR", "BEGIN_MKDIR");

  listFiles();
};

const handleClickFolder = (e) => {
  if (!e.target.attributes["data-path"]) return;
  const path = e.target.attributes["data-path"].value;
  currentPath = path;
  listFiles(path);
};

const handleCdUp = () => {
  if (!currentPath) return;

  if (isRoot(currentPath)) {
    currentPath = null;
    listFiles();
    return;
  }

  const parts = currentPath.slice(0, -1).split("/");
  parts.pop();
  currentPath = parts.join("/") + "/";
  listFiles();
};

const renderFileIcon = (file) => {
  return `<i data-feather="${file.isFile ? "file" : "folder"}"></i>`;
};

const renderToggle = (file) => {
  if (file.isFile) return file.name;

  const path = currentPath ? `${currentPath}${file.name}/` : file.name;
  return `<a href="#" class="fs-toggle text-blue-500" data-path="${path}">${file.name}</a>`;
};

const renderFileSize = (size) => {
  if (!size) return "";

  var i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
};

const renderDate = (mtime) => {
  if (!mtime) return "";
  return new Date(mtime).toLocaleString();
};

const renderFiles = (files) => {
  let output =
    '<table class="w-full"><tr><th></th><th>Name</th><th>Size</th><th>Last Modified</th>';
  Object.values(files).map((file) => {
    output += "<tr>";
    output += `<td>${renderFileIcon(file)}</td>`;
    output += `<td>${renderToggle(file)}</td>`;
    output += `<td>${renderFileSize(file.size)}</td>`;
    output += `<td>${renderDate(file.mtime)}</td>`;
    output += "</tr>";
  });
  output += "</table>";
  setContent("dirname", currentPath);
  setContent("ls-output", output);
  feather.replace();
};

export const initFilesystem = async (fileSystem, permissions) => {
  fs = fileSystem;
  roots = permissions.fs;

  performance.mark("BEGIN_FS_INIT");
  if (!(await fs.exists(fs.appPath()))) {
    await fs.mkdir(fs.appPath());
    await fs.publish();
  }
  performance.measure("FS_INIT", "BEGIN_FS_INIT");

  // Setup UI
  setClickHandler("add-file", addFile);
  setClickHandler("add-folder", mkDir);
  setClickHandler("cd-up", handleCdUp);
  setClickHandler("ls-output", handleClickFolder);

  showIds("filesystem");
  listFiles();
};

// Some helpers to juggle versions
const dirToPath = (path) => {
  // ensure directory ends with '/' if >= 24
  const wnVersion = webnative.VERSION;
  if (wnVersion && semver.minor(wnVersion) >= 24) {
    if (path.slice(-1) !== "/") {
      path += "/";
    }
  }
  return stringToPath(path);
};

const stringToPath = (path) => {
  const wnVersion = webnative.VERSION;
  if (wnVersion && semver.minor(wnVersion) >= 24) {
    return webnative.path.fromPosix(path);
  }
  return path;
};

const pathToString = (path) => {
  const wnVersion = webnative.VERSION;
  if (wnVersion && semver.minor(wnVersion) >= 24) {
    return webnative.path.toPosix(path);
  }
  return path + "/";
};

const nameToFilePath = (fileName) => {
  const wnVersion = webnative.VERSION;
  if (wnVersion && semver.minor(wnVersion) >= 24) {
    return webnative.path.file(fileName);
  }
  return fileName;
};

const getKeyName = (branch = "private") => {
  return webnative.VERSION && semver.minor(webnative.VERSION) >= 24
    ? branch
    : `${branch}Paths`;
};

export const formatForPermissions = (paths) => {
  return {
    [getKeyName("private")]: paths
      .filter((p) => p.type === "private")
      .map((p) => dirToPath(p.name)),
    [getKeyName("public")]: paths
      .filter((p) => p.type === "public")
      .map((p) => dirToPath(p.name)),
  };
};
