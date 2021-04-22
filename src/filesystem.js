import {
  renderMeasurements,
  setClickHandler,
  setContent,
  showError,
  showIds,
} from "./ui";
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

  const fileName = fs.appPath(`timings_${sessionStart}.json`);
  await fs.write(fileName, JSON.stringify(data));
  await fs.publish();
};

const getRoots = () => {
  let files = {};

  // Add the app path
  files[fs.appPath()] = {
    name: fs.appPath(),
  };

  // Add private paths
  roots.private.directories.forEach((path) => {
    files[`private/${path}`] = {
      name: `private/${path}`,
    };
  });

  // Add public paths
  roots.private.directories.forEach((path) => {
    files[`public/${path}`] = {
      name: `public/${path}`,
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
    let files = await fs.ls(currentPath);
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
  await fs.add(`${currentPath}/${file.name}`, file);
  await fs.publish();
  performance.measure("FS_ADD", "BEGIN_ADD");

  listFiles("private");
};

const mkDir = async () => {
  const name = document.getElementById("folder-name").value;
  if (!name) return;

  performance.mark("BEGIN_MKDIR");
  await fs.mkdir(`${currentPath}/${name}`);
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

  const parts = currentPath.split("/");
  parts.pop();
  currentPath = parts.join("/");
  listFiles();
};

const renderFileIcon = (file) => {
  return `<i data-feather="${file.isFile ? "file" : "folder"}"></i>`;
};

const renderToggle = (file) => {
  if (file.isFile) return file.name;

  const path = currentPath ? `${currentPath}/${file.name}` : file.name;
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
