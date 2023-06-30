const jwt = require("jsonwebtoken");
const tokenKey = "4joTuna";

module.exports = async (req, res, next) => {
    try {
        console.log("isMemberTest!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        const { Authorization } = req.cookies;
        const [authType, authToken] = (Authorization ?? "").split(" ");
        if (!authToken || authType !== "Bearer") {
            res.locals.user = { userId: null };
            return next();
        }
        const { email } = jwt.verify(authToken, tokenKey);
        const user = await Users.findOne({
            where: { email },
            attributes: userFieldNamesArray.concat("refreshToken"), //배열안에 REFRESH_TOKEN과 함께, 가져오고싶은 필드이름을 지정 (push는 길이반환 , concat은 배열반환)
        }); //

        if (!user) {
            res.clearCookie("Authorization");
            res.locals.user = { userId: null };
            return next();
        }
        console.log(user);
        //리프레시토큰으로 인증기간이 맞는지 확인
        jwt.verify(user.refreshToken, tokenKey);
        res.locals.user = user;
        next();
    } catch (err) {
        console.log(err);
        res.clearCookie("Authorization");
        res.locals.user = { userId: null }
        next();
    }
};
