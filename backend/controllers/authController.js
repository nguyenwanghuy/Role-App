import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js';
import RefreshTokenModel from '../models/refreshTokenModel.js';

const login = async(req,res) =>{
    try {
        const {username, password} = req.body;
        if(!username || !password) {
            return res.status(400).json({
                message: 'Invalid username or password'
            })
        }
        const existingUser = await UserModel.findOne({ username})
        if (!existingUser) {
            return res.status(400).json({
                message: "Wrong username",
            })
        }
        const isMatchPassword = await bcrypt.compare( 
            //so sánh password người dùng nhập lên với database
            password,
            existingUser.password
        )
        if(!isMatchPassword) {
            return res.status(400).json({
                message: "Wrong password",
            })
        }
        //token
        const jwtPayload = {
            id: existingUser.id,
            admin: existingUser.admin,
            username: existingUser.username,
            password: existingUser.password
        }
        const token = jwt.sign(jwtPayload,process.env.SECRET_KEY,{
            expiresIn: '15s'
        })
        //refresh token
        const refreshToken = jwt.sign(jwtPayload,process.env.SECRET_KEY_REFRESH_TOKEN,{
            expiresIn: '7d'
        })
         //STORE REFRESH TOKEN IN COOKIE
         res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // khi nào deploy thì chuyển thành true
            path: "/",
            sameSite: "strict",
        })
        return res.status(200).json({
            accessToken: token,
            refreshToken: refreshToken,
            message: 'Login successful'
        })
    } catch (error) {
        res.status(500).json(error);
    }
}
const register = async(req,res) =>{
    try {
        const {username,email,password} = req.body;
        if(!username || !email || !password) {
            return res.status(400).json({
                message: "Missing required keys",
            });
        }
        const existingUser = await UserModel.findOne({email});
        if(existingUser) {
            return res.json({
                message: "User already exists",
            })
        }
        //hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)
        //create new user
        const newUser = new UserModel({
            username,
            email,
            password: hashPassword
        })
        await newUser.save();
        res.status(200).json({
            message: 'Register new user successfully'
        })
    } catch (error) {
        res.status(500).json(error);
    }
}
const getMe = async (req, res) => {
    const { id } = req.user;
    const currentUser = await UserModel.findById(id).select('-password');
  
    if (!currentUser) {
      res.status(401);
      throw new Error('Unauthorized user');
    }
  
    res.json({
      userInfo: currentUser,
    });
  };
const requestRefreshToken = async (req, res) => {
    // Khi nào access token hết hạn thì lấy refresh token để tạo một access token mới
    // Lấy refresh token từ cookies
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({
            message: "You are not authenticated",
        });
    }

    try {
        // Xác minh refresh token
        jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: "Invalid refresh token",
                });
            }
            // Tạo access token mới
            const jwtPayload = {
                id: decoded.id,
                admin: decoded.admin,
                username: decoded.username,
                password: decoded.password,
            };
            const newAccessToken = jwt.sign(jwtPayload, process.env.SECRET_KEY, {
                expiresIn: "1h",
            });

            // Tạo refresh token mới
            const newRefreshToken = jwt.sign(jwtPayload, process.env.SECRET_KEY_REFRESH_TOKEN, {
                expiresIn: "7d",
            });
            // Lưu trữ refresh token mới trong cookie
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: false, // Khi triển khai, hãy chuyển thành true
                path: "/",
                sameSite: "strict",
            });

            try {
                // Lưu refresh token mới trong db
                const refreshTokenEntry = new RefreshTokenModel({
                    refreshToken: newRefreshToken,
                    userId: decoded.id,
                });
                await refreshTokenEntry.save();

                res.status(200).json({
                    accessToken: newAccessToken,
                });
            } catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};
const logout = async (req, res) => {
    res.clearCookie('refreshToken');
    res.status(200).json({
        message: 'Logged out'
    });
};
const authController = {
    login,
    register,
    requestRefreshToken,
    logout,
    getMe
}
export default authController