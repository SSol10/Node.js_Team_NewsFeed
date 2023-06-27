const email_validation_check = (email)=>{
    const email_validation = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    return email_validation.test(email);
}

module.exports = email_validation_check;