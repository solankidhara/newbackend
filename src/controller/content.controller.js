const Content = require("../models/content.model");
const pathSplit = require("../utils/pathSplit");
const deleteJsonEntries = require("../utils/deleteJsonEntries");
const ContentType = require("../models/content-type.model");
const Category = require("../models/category.model");
const { default: mongoose } = require("mongoose");
const { getCategoryById, sortAggregateQuery } = require("../queries/contentAggregateQueries");

const addContent = async (req, res) => {
  const { name, category_id, content_type_id, description, tagOne, tagTwo, file_type_id, license_type_id, size_id, isFree } = req.body;

  const content = new Content({
    mainFile: req.files ? pathSplit(req, req.files?.mainFile[0].path) : "notfound",
    thumbFile: req.files ? pathSplit(req, req.files?.thumbFile[0].path) : "notfound",
    waterMarkFile: req.files ? pathSplit(req, req.files?.waterMarkFile[0].path) : "notfound",
    user_id: req.user._id,
    tag_one_id: tagOne,
    tag_two_id: tagTwo,
    file_type: file_type_id,
    license_type: license_type_id,
    size: size_id,
    name: name,
    content_type_id: content_type_id,
    category_id: category_id,
    description: description,
    isFree: isFree,
  });
  try {
    const data = await content.save();
    if (data) {
      res.status(200).json({ message: "data uploaded successfully" });
    }
  } catch (err) {
    res.status(err?.status || 500).json({
      message: err?.message,
    });
  }
};

const getContent = async (req, res) => {
  try {
    const populateQuery = [
      { path: "category_id", select: "name -_id" },
      { path: "content_type_id", select: "type -_id" },
    ];

    const content = await Content.find({ user_id: req.user._id }).populate(populateQuery).exec();

    const data = content.map((ele, index) => {
      const obj = ele.toObject();
      obj.contentType = obj.content_type_id.type;
      obj.categoryName = obj.category_id.name;
      deleteJsonEntries(obj, ["content_type_id", "category_id", "__v", "updatedAt", "createdAt"]);
      return obj;
    });

    return res.status(200).json(data);
  } catch (err) {
    res.status(err?.status || 500).json({
      message: err?.message,
    });
  }
};

const getAllFiles = async (req, res) => {
  const { tag, contentType, fileType, licenseType, size, limit, skip } = req.body;
  try {
    const aggregateQuery = [
      {
        $lookup: {
          from: "tags",
          localField: "tag_one_id",
          foreignField: "_id",
          as: "tag_one_id",
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "tag_two_id",
          foreignField: "_id",
          as: "tag_two_id",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category_id",
        },
      },
      {
        $lookup: {
          from: "content_types",
          localField: "content_type_id",
          foreignField: "_id",
          as: "content_type_id",
        },
      },
      {
        $lookup: {
          from: "file_types",
          localField: "file_type",
          foreignField: "_id",
          as: "file_type",
        },
      },
      {
        $lookup: {
          from: "license_types",
          localField: "license_type",
          foreignField: "_id",
          as: "license_type",
        },
      },
      {
        $lookup: {
          from: "sizes",
          localField: "size",
          foreignField: "_id",
          as: "size",
        },
      },
      {
        $match: {
          $and: [
            { "content_type_id.type": { $regex: contentType, $options: "i" } },
            {
              $or: [
                { "tag_one_id.tagName": { $regex: tag||'', $options: "i" } },
                { "tag_two_id.tagName": { $regex: tag|| '', $options: "i" } },
                { "category_id.name": { $regex: tag || '', $options: "i" } },
              ],
            },
            {
              $and:[
                 { "file_type.name": { $regex: fileType||'', $options: "i" } },
                 { "license_type.name": { $regex: licenseType || '', $options: "i" } },
                 { "size.name": { $regex: size || '', $options: "i" } },
              ]
            }
          ],
          $or: [{ deleted: false }, { deleted: null }],
        },
      },
      {
        $project: {
          _id: 1,
          description: 1,
          thumbFile: 1,
          waterMarkFile: 1,
          tag_one_id: 1,
          tag_two_id: 1,
          category_id: 1,
          content_type_id: 1,
          file_type: 1,
          license_type: 1,
          size: 1,
        },
      },
      { $sort: { _id: 1 } },
      { $limit: limit },
      { $skip: skip },
    ];

    const categoryArray = await Content.aggregate(aggregateQuery).unwind(
      "tag_one_id",
      "tag_two_id",
      "category_id",
      "content_type_id",
      "file_type",
      "license_type",
      "size"
    );

    return res.status(200).json(categoryArray);
  } catch (err) {
    res.status(err?.status || 500).json({
      message: err?.message,
    });
  }
};

const getRelatedFiles = async (req, res) => {
  const { id, skip, limit } = req.body;
  try {
    const categories = await Content.aggregate(getCategoryById(id)).unwind(
      "tag_one_id",
      "tag_two_id",
      "category_id",
      "content_type_id",
      "file_type",
      "license_type",
      "size"
    );

    if (categories[0]) {
      const categoryArray = await Content.aggregate(sortAggregateQuery(categories[0], limit, skip)).unwind(
        "tag_one_id",
        "tag_two_id",
        "category_id",
        "content_type_id",
        "file_type",
        "license_type",
        "size"
      );
      return res.status(200).json([...categories, ...categoryArray]);
    }
    return res.status(200).json({
      message: "details not found",
    });
  } catch (err) {
    res.status(err?.status || 500).json({
      message: err?.message,
    });
  }
};

const getMainFile = async (req, res) => {
  try {
    const categories = await Content.findById(req.params.id, {
      _id: 1,
      mainFile: 1,
    });
    return res.status(200).json(categories);
  } catch (err) {
    res.status(err?.status || 500).json({
      message: err?.message,
    });
  }
};

const updateContent = async (req, res) => {
  const { _id, category, contentType, tagOne, tagTwo, name, description, fileType, licenseType, size } = req.body;
  try {
    if (_id) {
      const updatedFields = {
        category_id: category.value,
        content_type_id: contentType.value,
        tag_one_id: tagOne.value,
        tag_two_id: tagTwo.value,
        file_type: fileType.value,
        license_type: licenseType.value,
        size: size.value,
      };
      if (name) {
        updatedFields.name = name;
      }
      if (description) {
        updatedFields.description = description;
      }
      const content = await Content.findByIdAndUpdate(_id, updatedFields);
      if (content) {
        return res.status(200).json({
          message: "updated successfully",
        });
      }
    }
    return res.status(200).json({
      message: "something wants wrong!!",
    });
  } catch (err) {
    res.status(err?.status || 500).json({
      message: err?.message,
    });
  }
};

module.exports = {
  addContent,
  getAllFiles,
  getMainFile,
  getContent,
  updateContent,
  getRelatedFiles,
};
