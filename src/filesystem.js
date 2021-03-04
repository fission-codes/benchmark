import { renderMeasurements, setClickHandler, setContent, showIds } from "./ui";
import feather from 'feather-icons';

let fs;

let currentPath = 'private';

const listFiles = async () => {
  performance.mark("BEGIN_LS");
  let files = await fs.ls(currentPath);
  renderFiles(files);
  performance.measure(`FS_LS ${currentPath}`, "BEGIN_LS");
  renderMeasurements();
};

const addFile = async () => {
  const file = document.getElementById("input-file").files[0];
  if (!file) return;

  performance.mark("BEGIN_ADD");
  await fs.add(`${currentPath}/${file.name}`, file);
  await fs.publish();
  performance.measure("FS_ADD", "BEGIN_ADD");

  listFiles('private');
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

const handleClickFolder = e => {
  if (!e.target.attributes['data-path']) return;
  const path = e.target.attributes['data-path'].value;
  currentPath = path;
  listFiles(path);
}

const handleCdUp = () => {
  const parts = currentPath.split('/');
  if (parts.length <= 1) return;

  parts.pop();
  currentPath = parts.join('/')
  listFiles();
}

const renderFileIcon = file => {
  return `<i data-feather="${file.isFile ? 'file' : 'folder'}"></i>`
}

const renderFileSize = (size) => {
  var i = Math.floor( Math.log(size) / Math.log(1024) );
  return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};

const renderToggle = file => {
  if (file.isFile) return file.name;
  return `<a href="#" class="fs-toggle text-blue-500" data-path="${currentPath}/${file.name}">${file.name}</a>`;
}

const renderFiles = (files) => {
  let output =
    '<table class="w-full"><tr><th></th><th>Name</th><th>Size</th><th>Last Modified</th>';
  Object.values(files).map((file) => {
    output += "<tr>";
    output += `<td>${renderFileIcon(file)}</td>`;
    output += `<td>${renderToggle(file)}</td>`;
    output += `<td>${renderFileSize(file.size)}</td>`;
    output += `<td>${new Date(file.mtime).toLocaleString()}</td>`;
    output += "</tr>";
  });
  output += "</table>";
  setContent('dirname', currentPath);
  setContent('ls-output', output);
  feather.replace();
};

export const initFilesystem = async (fileSystem) => {
  fs = fileSystem;
  performance.mark("BEGIN_FS_INIT");
  if (!(await fs.exists(fs.appPath()))) {
    await fs.mkdir(fs.appPath());
    await fs.publish();
  }
  performance.measure("FS_INIT", "BEGIN_FS_INIT");
  setClickHandler("add-file", addFile);
  setClickHandler("add-folder", mkDir);
  setClickHandler("cd-up", handleCdUp);
  setClickHandler("ls-output", handleClickFolder);

  showIds("filesystem");
  listFiles();
};
