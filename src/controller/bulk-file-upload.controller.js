var path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const Content = require("../models/content.model");
const uploadImage = require("../utils/moveFile");

const bulkFileUpload = async (req, res) => {
  try {
    const dt = await XLSX.readFile(req.file.path, {});
    const first_worksheet = dt.Sheets[dt.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(first_worksheet);


    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    const updatedPath = await Promise.all(data.map(async (ele) => {
       uploadImage(ele.mainFile,"./public/images/mainFile/" + "mainFile-" +uniqueSuffix + path.basename(ele.mainFile) + "");
       uploadImage(ele.thumbFile,"./public/images/thumbFile/" + "thumbFile-" +uniqueSuffix + path.basename(ele.thumbFile) + "");
       uploadImage(ele.waterMarkFile,"./public/images/waterMarkFile/" + "waterMarkFile-" +uniqueSuffix + path.basename(ele.waterMarkFile) + "");
        return {
          ...ele,
          mainFile:"images/mainFile/" + "mainFile-" +uniqueSuffix + path.basename(ele.mainFile) + "",
          thumbFile:"images/thumbFile/" + "thumbFile-" +uniqueSuffix + path.basename(ele.thumbFile) + "",
          waterMarkFile:"images/waterMarkFile/" + "waterMarkFile-" +uniqueSuffix + path.basename(ele.waterMarkFile) + "",
        }
    }
    ));

    const contents = await Content.insertMany(updatedPath)
    if(contents.length){
      fs.unlinkSync(req.file.path);
      return res.status(200).json({ message: "successfully uploaded excel file" });
    }
    return res.status(400).json({ message: "something went's wrong please contact administrator" });
  } catch (err) {
    res.status(err?.status || 500).json({
      message: err?.message,
    });
  }
};

module.exports = { bulkFileUpload };  
