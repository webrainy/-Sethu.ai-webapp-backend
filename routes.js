import authApiHandler from "./src/controllers/auth/apiHandler.js";
import reviewerApiHandler from "./src/controllers/manageReviewer/apiHandler.js";
import studentApiHandler from "./src/controllers/manageStudent/apiHandler.js";
import batchApiHandler from "./src/controllers/manageBatch/apiHandler.js";
import assignmentApiHandler from "./src/controllers/manageAssignment/apiHandler.js";
import eventApiHandler from "./src/controllers/manageEvent/apiHandler.js";



const routes = (app) => {
  app.use("/api/auth", authApiHandler);
  app.use("/api/account", reviewerApiHandler);
  app.use("/api/student", studentApiHandler);
  app.use("/api/batch", batchApiHandler);
  app.use("/api/assign", assignmentApiHandler);
  app.use("/api/event", eventApiHandler);


};

export default routes;
