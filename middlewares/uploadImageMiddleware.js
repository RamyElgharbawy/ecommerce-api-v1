const multer = require("multer");

const ApiError = require("../utils/apiError");

const multerOptions = () => {
  // 1- configure Multer Storage Engine
  //
  // 1)- Disk Storage Engine
  // const multerStorage = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     cb(null, "uploads/categories");
  //   },
  //   filename: function (req, file, cb) {
  //     const ext = file.mimetype.split("/")[1];
  //     // `model name - unique id - time stamp . file extension`
  //     const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
  //     cb(null, filename);
  //   },
  // });

  // 2)- Memory Storage Engine With Multer
  const multerStorage = multer.memoryStorage();

  // file filter func [check if file is image]
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images Allowed", 400), false);
    }
  };
  // 2- send storage to multer
  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixImages = (arrayOfImages) =>
  multerOptions().fields(arrayOfImages);
