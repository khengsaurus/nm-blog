import { DBService } from "enums";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true }, // useUnifiedTopology: true
  file: (req, file) => {
    console.log("REQ: ----->");
    console.log(req);
    console.log("FILE: ----->");
    console.log(file);
    console.log("MIME: ----->");
    console.log(file.mimetype);
    
    const match = ["image/png", "image/jpeg"];
    if (match.indexOf(file.mimetype) !== -1) {
      const filename = `${file.originalname}`;
      console.log(filename);
      return filename;
    }

    return {
      bucketName: DBService.IMAGES,
      filename: `${file.originalname}`,
    };
  },
});

const upload = multer({ storage }).single("file");
export default upload;
