import UserModel from "../models/user.model.js";


const getAllUsers = async (req, res) =>{
    try {
        const getUser = await UserModel.find()
        res.status(200).json({
            user: getUser,
            message: 'get all users'
        })
    } catch (error) {
        res.status(500).json(error);
    }
}
const deleteUser = async (req, res) => {
    try {
        const {id} = req.params
        const user = await UserModel.findByIdAndDelete(id)
        res.status(200).json({
            deleteUser: user,
            message: 'User deleted successfully'
        })
    } catch (error) {
        res.status(500).json(error);
    }
};
const userController = {
    getAllUsers,
    deleteUser
}
export default userController