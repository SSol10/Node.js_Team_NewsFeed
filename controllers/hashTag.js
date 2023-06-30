const { Posts, HashTags } = require("../models");
const hashTagRegex = /#[^\s#]*/g;

//해시태그를 검색하면 게시글이 나오도록
const searchHashTag = async (req, res) => {
    const hashTag = req.body;
    let { pageSize, pageNum } = req.params;
    pageSize = req.query.pageSize ? req.query.pageSize : 10;
    pageNum = req.query.pageNum ? req.query.pageNum : 1;
    try {
        if (!hashTagRegex.test(hashTag)) {
            return res.status(412).json({ message: "잘못된 해시태그입니다" });
        }
        const hashTagAndPosts = await HashTags.findOne({
            where: { tagContent: hashTag },
            include: [{ model: Posts ,
                attributes:["postId","postTitle","postContent","viewCount","createdAt"], //게시글 생성할때 보여줄 정보
                order:[{"viewCount":"DESC"}],
                through:{
                    model:Posts_Tags,
                    attributes:[]
                },
            }],
        });
        if(!hashTagAndPosts){
            return res.status(400).json({message:""});
        }
    } catch (err) {
        
    }
};
