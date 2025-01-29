import fs from "fs";
import path from "path";

// delete the file from array
export const deletefile = (links, filename) => {
  filename.forEach((file) => {
    fs.unlink(path.join(links, file), (err) => {
      if (err) {
        console.log(err);
      }
    });
  });
};

// delete the single file
export const deleteSingleFile = (links, file) => {
  fs.unlink(path.join(links, file), (err) => {
    if (err) {
      console.log(err);
    }
  });
};
