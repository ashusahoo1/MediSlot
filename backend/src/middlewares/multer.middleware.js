//?here we use multer to store files temporarily in public/temp file and use it to upload on cloudinary then once we are done we delete the 
//?files from the temporary storage in cloudinary.js
import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})