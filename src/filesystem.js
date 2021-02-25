import { renderMeasurements, setClickHandler, setContent, showIds } from "./ui";

let fs;

const listFiles = async () => {
  performance.mark("BEGIN_LS");
  const files = await fs.ls(fs.appPath());
  renderFiles(files);
  performance.measure("FS_LS", "BEGIN_LS");
  renderMeasurements();
};

const addFile = async () => {
  const file = document.getElementById("input-file").files[0];
  if (!file) return;

  performance.mark("BEGIN_ADD");
  await fs.add(fs.appPath(file.name), file);
  await fs.publish();
  performance.measure("FS_ADD", "BEGIN_ADD");

  listFiles();
};

const mkDir = async () => {
  const name = document.getElementById("folder-name").value;
  if (!name) return;

  performance.mark("BEGIN_MKDIR");
  await fs.mkdir(fs.appPath(name));
  await fs.publish();
  performance.measure("FS_MKDIR", "BEGIN_MKDIR");

  listFiles();
};

const renderFiles = (files) => {
  let output =
    '<table class="w-full"><tr><th></th><th>Name</th><th>Modified</th>';
  Object.values(files).map((file) => {
    output += "<tr>";
    output += `<td>${file.isFile ? "_" : "+"}</td>`;
    output += `<td>${file.name}</td>`;
    output += `<td>${new Date(file.mtime).toLocaleString()}</td>`;
    output += "</tr>";
  });
  output += "</table>";
  setContent("ls-output", output);
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
  showIds("filesystem");
  listFiles();
};
