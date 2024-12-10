const UserModel = require('../backend/models/user.model.cjs');
const init = require('../backend/dbs/init.mongodb.cjs')

async function resetAllBlocks() {
    try {
        const result = await UserModel.updateMany(
            {}, // Điều kiện: cập nhật tất cả documents
            { $set: { blocks: [] } } // Thay đổi: đặt trường `blocks` về []
        );

        console.log(`${result.modifiedCount} users' blocks reset to an empty array.`);
    } catch (error) {
        console.error('Error resetting blocks:', error);
    }
}

// Gọi hàm
resetAllBlocks();
