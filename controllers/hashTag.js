// const { Posts, HashTags,Posts_Tags,Users } = require("../models");
const {prepareDataForClient,getPostsByHashTag} = require("../controllers/posts.js")
const hashTagRegex = /#[\dA-Za-zㄱ-ㅎㅏ-ㅣ가-힣]{1,18}/g;

//해시태그를 검색하면 게시글이 나오도록
const searchHashTag = async (req, res) => {
    const {userId}=res.locals.user;
    const hashTag = String(req.body.hashTag);
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 5;
    const pageNum = req.query.pageNum ? parseInt(req.query.pageNum) : 1;

    if(isNaN(pageSize)||isNaN(pageNum)){
        return res.status(412).json({message: "잘못된 페이지넘버입니다"})
    }
    try {
        hashTagRegex.lastIndex = 0;
        const isHashTagValid=  hashTagRegex.test(hashTag);
        if (!isHashTagValid) {
            return res.status(412).json({ message: "잘못된 해시태그입니다" });
        }
        const hashTagAndPosts=await getPostsByHashTag (hashTag,pageSize,(pageNum-1)*pageSize)

        if (!hashTagAndPosts) {
            return res
                .status(400)
                .json({ message: "해시태그 검색에 실패하였습니다" });
        }
        const posts = hashTagAndPosts.map((post)=>{
            return post.Posts;
        })


        const postsData = await prepareDataForClient(userId,posts);
        return res.status(200).json({
            pageNum,
            pageSize,
            contentNum:hashTagAndPosts.length,
            posts: postsData,
        });
    } catch (err) {
        console.log(err)
        // console.error(`GET /api/posts error message: ${err}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {searchHashTag}