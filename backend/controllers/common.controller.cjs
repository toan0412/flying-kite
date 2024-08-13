const { BadRequestError, NotFoundError } = require('../core/error.response.cjs');
const { asyncHandler } = require('../helpers/asyncHandler.cjs');

// Hàm lấy tất cả các tài nguyên
exports.getAll = (Model) => asyncHandler(async (req, res) => {
  const items = await Model.find();
  res.status(200).json({
    status: 'success',
    results: items.length,
    data: {
      items
    }
  });
});

// Hàm lấy một tài nguyên theo ID
exports.getOneById = (Model, populateOptions) => asyncHandler(async (req, res) => {
  const item = await Model.findById(req.params.id).populate(populateOptions);
  if (!item) {
    throw new NotFoundError('No document found with that ID');
  }
  res.status(200).json({
    status: 'success',
    data: {
      item
    }
  });
});

// Hàm tạo mới một tài nguyên
exports.postOne = (Model) => asyncHandler(async (req, res) => {
  console.log('Request body', req.body);
  try {
    const newItem = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        item: newItem
      }
    });
  } catch (err) {
    console.error('Error creating item:', err);

    // Xử lý lỗi trùng lặp khóa trong MongoDB
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Duplicate key error: an item with the same value already exists.'
      });
    }

    // Ném ra lỗi BadRequestError cho các lỗi khác
    throw new BadRequestError(err.message);
  }
});



// Hàm cập nhật một tài nguyên theo ID
exports.updateOne = (Model) => asyncHandler(async (req, res) => {
  const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!item) {
    throw new NotFoundError('No document found with that ID');
  }
  res.status(200).json({
    status: 'success',
    data: {
      item
    }
  });
});

// Hàm xóa một tài nguyên theo ID
exports.deleteOne = (Model) => asyncHandler(async (req, res) => {
  const item = await Model.findByIdAndDelete(req.params.id);
  if (!item) {
    throw new NotFoundError('No document found with that ID');
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});
