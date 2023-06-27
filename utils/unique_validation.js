const unique_validation = async (field,Model,errCode, value, next) => {
  await Model.findOne({[field] : value }) //[]동적으로 키값받기
    .then((data) => {
      if (data) {
        throw new Error(errCode);
      }
      next();
    })
    .catch((err) => {
      return next(err);
    });
};

module.exports = unique_validation