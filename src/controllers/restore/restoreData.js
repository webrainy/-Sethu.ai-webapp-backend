// const { initProductsModel } = require("../../models/products");

// import { Router } from "express";
// import csv from "csv-parser";
// import fs from "fs";
// import csvUpload from "../../middlewares/uploads.js";
// import { RESPONSE } from "../../config/global.js";
// import { send, setErrResMsg } from "../../helper/responseHelper.js";
// const router = Router();

// router.post("/", csvUpload.single("csv"), async (req, res) => {
//   if (!req.file) {
//     return send(res, setErrResMsg(RESPONSE.REQUIRED, "CSV"));
//   }
//   const product = await initProductsModel();
//   const csvFile = req.file;
//   const csvFilePath = csvFile.path;
//   // console.log(csvFilePath);
//   //     console.log(csv);
//   fs.createReadStream(csvFilePath)
//     .pipe(csv())
//     .on("data", async (row) => {
//       try {
//         // await product.create({
//         //   product_name: row.product_name,
//         //   description: row.description,
//         //   reg_price: row.reg_price,
//         //   image: [row.image],
//         //   offer_price: row.offer_price,
//         //   per_sq_ft: row.per_sq_ft,
//         //   priceType: row.priceType,
//         // });
//       } catch (error) {
//         console.error("Error inserting product:", error);
//         return send(res, setErrResMsg(RESPONSE.ERR, error));
//       }
//     })
//     .on("end", () => {
//       console.log(
//         "CSV file successfully processed, and data inserted into the database."
//       );
//       return send(res, RESPONSE.SUCCESS);
//     });
// });

// module.exports = router;
