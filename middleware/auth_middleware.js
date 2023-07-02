const jwt = require('jsonwebtoken');
const { Users } = require('../models');
const tokenKey = '4joTuna';

const authMiddleware = async (userFieldNamesArray, req, res, next) => {
    try {
        const { Authorization } = req.cookies;
        const [authType, authToken] = (Authorization ?? '').split(' ');

        if (!authToken || authType !== 'Bearer') {
            return res
                .status(403)
                .json({ errorMessage: '로그인이 필요한 기능입니다' });
        }
        const { email } = jwt.verify(authToken, tokenKey);
        const user = await Users.findOne({
            where: { email },
            attributes: userFieldNamesArray.concat('refreshToken'), //배열안에 REFRESH_TOKEN과 함께, 가져오고싶은 필드이름을 지정 (push는 길이반환 , concat은 배열반환)
        });

        if (!user) {
            // res.clearCookie('Authorization');
            // 쿠키를 지우기 때문에 로그인 한 유저가 권한이 없는 작업을 수행했을 경우 로그아웃이 되는 문제 발생
            return res
                .status(403)
                .json({ errorMessage: '로그인이 필요한 기능입니다' });
        }
        //리프레시토큰으로 인증기간이 맞는지 확인
        jwt.verify(user.refreshToken, tokenKey);
        res.locals.user = user;
        next();
    } catch (err) {
        console.log(err);
        res.clearCookie('Authorization');
        return res.status(403).json({ errorMessage: '로그인에 실패하였습니다' });
    }
};

module.exports = authMiddleware;
