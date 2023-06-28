const unique_validation = async function (field, errCode, value, next) {
  await this.findOne({ where: { [field]: value } }) //[]동적으로 키값받기
    .then((data) => {
      if (data) {
        throw new Error(errCode);
      }
      next();
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = unique_validation;
