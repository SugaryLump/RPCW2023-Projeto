const decompress = require("decompress");
const path = require("path");
const fs = require("fs").promises;
const fs_extra = require("fs-extra");
const crypto = require("crypto");
const fileExists = async (path) => !!(await fs.stat(path).catch((e) => false));

async function listFilesInDirectory(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);
    console.log("Files in directory:");
    files.forEach((file) => {
      console.log(file);
    });
  } catch (err) {
    console.error("Error reading directory:", err);
  }
}

module.exports.validateFile = async function (file) {
  console.log(file);
  if (file.mimetype != "application/zip") {
    return false;
  }
  const outer_folder = file.filename.split(".")[0];
  const bagName = file.originalname.split(".")[0];
  const fullFolderPath = file.destination + "/" + outer_folder;
  await decompress(file.path, fullFolderPath)
    .then((files) => {
      console.log(files);
    })
    .catch((err) => {
      console.log(err);
    });
  const bagPath = "/app/" + fullFolderPath + "/" + bagName;
  const isValid = await isValidBag(bagPath);

  if (isValid) {
    // TODO move unzipped
    deleteFile(fullFolderPath + ".zip");
    await moveFile(
      "/app/" + fullFolderPath,
      "/app/public/uploads/" + outer_folder
    );
    return outer_folder;
  } else {
    console.log("Gonna delete: " + fullFolderPath);
    deleteFile(fullFolderPath);
    deleteFile(fullFolderPath + ".zip");
    return false;
  }
};

const moveFile = async (oldPath, newPath) => {
  try {
    await fs_extra.move(oldPath, newPath);
  } catch (err) {
    console.log(err);
  }
};

const deleteFile = async (path) => {
  try {
    fs.rm(path, { recursive: true, force: true });
  } catch (err) {
    console.log(err);
  }
};

const isValidBag = async (bagPath) => {
  const manifestFileExists = await fileExists(
    path.join(bagPath, "manifest-md5.txt")
  );
  const dataDirExists = await fileExists(path.join(bagPath, "data"));
  if (!manifestFileExists || !dataDirExists) {
    return false;
  }
  try {
    var manifestContent = await fs.readFile(
      path.join(bagPath, "manifest-md5.txt"),
      "utf-8"
    );
  } catch (err) {
    return false;
  }

  manifestContent = manifestContent.trim().split("\n");

  for (line of manifestContent) {
    const [checksum, fileName] = line.split("  ");
    const filePath = path.join(bagPath, fileName);
    try {
      const data = await fs.readFile(filePath);
      const calculatedChecksum = calculateChecksum(data);
      console.log(checksum + ";" + calculatedChecksum);
      if (checksum !== calculatedChecksum) {
        return false;
      }
    } catch (err) {
      // File doesn't even exist for example
      return false;
    }
  }
  return true;
};

// Function to calculate the MD5 checksum of a file
const calculateChecksum = (data) => {
  return crypto.createHash("md5").update(data).digest("hex");
};

async function generateTree(directoryPath, prefix = "") {
  console.log(directoryPath);
  const files = await fs.readdir(directoryPath);

  let tree = "";

  for (const file of files) {
    const filePath = directoryPath + "/" + file;
    const stats = await fs.stat(filePath);
    const isDirectory = stats.isDirectory();

    tree += prefix;
    tree += isDirectory ? file + "/" : file;
    tree += "\n";

    if (isDirectory) {
      const nestedPrefix = prefix + "  ";
      tree += await generateTree(filePath, nestedPrefix);
    }
  }

  return tree;
}
module.exports.generateTree = generateTree;
