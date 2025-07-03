import cloudinary from '../../config/cloudinary.js';
import streamifier from 'streamifier';
import { User } from '../model/user.model.js';

export const SignUp = async (req, res, next) => {
  try {
    const { name, password } = req.body;

    const isExistUser = await User.findOne({name})
    
    if(isExistUser){
      return res.status(200).json({message:"user exist",success:false})
    }

    let avatarUrl = '';
    if (req.file) {
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'avatars' },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file.buffer);
      avatarUrl = result.secure_url;
    }

    // Save user to DB (pseudo-code)
    const user = {
      name,
      password,
      avatar: avatarUrl,
    };

    await User.create(user)
    
    return res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
