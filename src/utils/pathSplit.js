const pathSplit = (req, path) => {
  return  "/" + path.split("/").slice(1).join("/");
};
module.exports = pathSplit;
