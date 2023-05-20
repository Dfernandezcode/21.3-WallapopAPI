const infoReq = (req, res, next) => {
  const date = new Date();
  console.log(`Petición de tipo ${req.method} a la url ${req.originalUrl} el ${date}`);
  next();
};

module.exports = { infoReq };
