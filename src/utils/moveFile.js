const fs = require("fs").promises;
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const uploadImage = async (url, filePath) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return await fs.writeFile(filePath, buffer);
};

module.exports = uploadImage;
