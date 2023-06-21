const FileType = require("../models/file-type.model");
const LicenseType = require("../models/license-type");
const SizeType = require("../models/size.model");

const getFilter = async (req, res) => {
  try {
    const files = await FileType.aggregate([
      { $project: { value: "$_id", label: "$name", _id: 0 } },
    ]);
    const contentSize = await SizeType.aggregate([{ $project: { value: "$_id", label: "$name", _id: 0 } }]);
    const license = await LicenseType.aggregate([{ $project: { value: "$_id", label: "$name", _id: 0 } }]);

    return res.status(200).json({fileTypes:files , sizes:contentSize , licenses: license});
  } catch (err) {
    res.status(err?.status || 500).json({
      message: err?.message,
    });
  }
};

module.exports = {
  getFilter,
};
