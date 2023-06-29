const decompress = require("decompress");
const path = require("path");
const fs = require("fs").promises;
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
  const bagName = file.originalname.split(".")[0];
  file_no_ext = Date.now() + "-" + bagName;
  await decompress(file.path, file.destination + "/" + file_no_ext)
    .then((files) => {
      console.log(files);
    })
    .catch((err) => {
      console.log(err);
    });
  // TODO check if file is a valid bag
  const bagPath =
    "/app/" + file.destination + "/" + file_no_ext + "/" + bagName;
  if (!(await isValidBag(bagPath))) {
    return false;
  }
  // TODO move files to public/uploads
  // delete file after decompress
  //fs.unlink(file.path, (err) => {
  //  if (err) {
  //    console.error(err);
  //    return;
  //  }
  //});

  return true;
};

const isValidBag = async (bagPath) => {
  const manifestFileExists = await fileExists(
    path.join(bagPath, "manifest-md5.txt")
  );
  const dataDirExists = await fileExists(path.join(bagPath, "data"));
  if (!manifestFileExists || !dataDirExists) {
    return false;
  }
  console.log("manifest file exists");
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
      console.log("errrr: " + err);
      return false;
    }
  }
  return true;
};

// Function to calculate the MD5 checksum of a file
const calculateChecksum = (data) => {
  return crypto.createHash("md5").update(data).digest("hex");
};
