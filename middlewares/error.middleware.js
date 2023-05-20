const checkError = (err, req, res, next) => {
  console.log("*** Start of Error ***");
  console.log(`REQUEST FAILED: ${req.method} of URL ${req.originalUrl}`);
  console.log(err);
  console.log("*** End of error ***");

  if (err?.name === "ValidationError") {
    res.status(400).json(err);
  } else if (err.errmsg.indexOf("duplicate key") !== -1) {
    res.status(400).json(err);
  } else {
    res.status(500).json(err);
  }

  // res.status(500).send(err.stack); // stack indicates where the error occurred.
};
module.exports = { checkError };
