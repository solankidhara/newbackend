const { default: mongoose } = require("mongoose");

const sortAggregateQuery = (categories , limit , skip) => {
  return [
    {
      $lookup: {
        from: "tags",
        localField: "tag_one_id",
        foreignField: "_id",
        as: "tag_one_id",
      },
    },
    {
      $match: {
        "tag_one_id._id": mongoose.Types.ObjectId(categories.tag_one_id._id),
        "_id": {$ne:mongoose.Types.ObjectId(categories._id)},
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
      $match: {
        "tag_two_id._id": mongoose.Types.ObjectId(categories.tag_two_id._id),
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
      $match: {
        "category_id._id": mongoose.Types.ObjectId(categories.category_id._id),
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
      $match: {
        "content_type_id._id": mongoose.Types.ObjectId(categories.content_type_id._id),
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
};

const getCategoryById = (id) => {
  return [
    {
      $match: {
        "_id": mongoose.Types.ObjectId(id),
      },
    },

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
  ];
};

module.exports = { sortAggregateQuery, getCategoryById };
