const express = require("express");
const router = express.Router();
const { Posts,HashTags,Posts_Tags } = require("../models");
const authMiddleware = require("../middleware/auth_middleware");
const db = require("../models");
const { Op } = require('sequelize');



router.get("/posts", ansync(req,res) => {
    try{
    const posts = await posts.findall({
        attributes: ['commentId', 'userId', 'postId', 'commentContent', 'viewContent'],
        // posts.findall 통해 모든 게시글을 찾겠다 그 후 attridutes 사용

        order: [['userId', 'desc']],
        // order을 통해 데이터를 내림차순으로 정렬, 혹은 오름차순으로 정렬
    });
    if (!posts.length) {
        return res.status(400).json({
          message: '게시글 조회에 실패하셨습니다.',
       });
      } catch(err) {
        res.status(200).send(posts);
      }
    });

router
    .route("/")
    .post(
        async (req, res, next) => {
            await authMiddleware(["userId"],req,res,next)
        },
        async (req, res) => {
            // { hashtag: [array] }도 res에 추가하기
            const { postTitle, postContent } = req.body;
            const { userId } = res.locals.user; // 요거는 테스트용 후에 인증 미들웨어 사용하면 필요없음.
            //해시태그

            const parseHashtag = (hashtag) => {
                if (!hashtag) {
                    return;
                }
                return hashtag.trim().split(",");
            };


            if (!postTitle || !postContent) {
                return res
                    .status(412)
                    .json({ message: "데이터 형식이 올바르지 않습니다." });
            }

            if (postTitle.trim() === "") {
                return res.status(412).json({
                    message: "게시글 제목의 형식이 일치하지 않습니다.",
                });
            }
            if (postContent.trim() === "") {
                return res.status(412).json({
                    message: "게시글 내용의 형식이 일치하지 않습니다.",
                });
            }

            try { //포스트아이디 생성 후 
                await db.sequelize.transaction(async(transaction)=>{
                        const post = await Posts.create({
                            userId: Number(userId),
                            postTitle,
                            postContent,
                        // hashtag 어떻게 넣을지 확인
                        },{transaction});
                    const postId = post.postId;

                    const hashTags = await postContent.match(/#[^\s#]*/g); //#과 문자열로 이루어진 배열 반환

                    if(!hashTags){const returnedHashTagArray = await HashTags.bulkCreate(await hashTags.map((hashTag)=>{
                            return {tagContent:hashTag}
                       }),{ignoreDuplicates:true,transaction})
                       console.log(returnedHashTagArray)

                        for(let index = 0; index < hashTags.length; index++){

                            const tagIdFindNull = returnedHashTagArray[index].tagId
                            if(tagIdFindNull===null){
                                const hashTag = hashTags[index];
                                const tagForFind =await HashTags.findOne({
                                    where:{tagContent:hashTag},
                                    attributes:["tagId"],
                                    transaction,
                                    })
                                const tagIdForFind = tagForFind.tagId;
                                hashTags[index]= { tagId: tagIdForFind }
                            }else{
                                hashTags[index] ={tagId:returnedHashTagArray[index].tagId}
                            }
                        } 

                        await Posts_Tags.bulkCreate(await hashTags.map((tag)=>{
                                return {postId:postId,tagId:tag.tagId}
                        }),{transaction})}
                        return res.status(201).json({
                            message: "게시글 작성에 성공하였습니다.",
                            posts: {
                                userId,
                                postTitle,
                                postContent,
                            },
                        });
                    })

            } catch (err) {
                console.error(`POST /api/posts error message: ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    );

router
    .route("/:postId")
    .delete(async (req,res,next)=>{
        await authMiddleware(["userId"],req,res,next)
    },async (req,res) => {
        const { postId } = req.params;
        const {userId}= res.locals.user;
        // const { nickname } = res.locals.user;

        if (!postId) {
            res.status(400).json({
                message: "데이터 형식이 올바르지 않습니다.",
            });
        } else {
            try {
                const postDeletedCount = await Posts.destroy({
                    where: {
                        postId: Number(postId),
                        userId
                    },
                    force: true
                });
                if( !postDeletedCount){
                    return res
                        .status(403)
                        .json({
                            errorMessage:
                                "게시글을 삭제할 권한이 존재하지 않습니다.",
                        })
                }
                return res
                    .status(200)
                    .json({ message: "게시글을 삭제하였습니다." });
            } catch (err) {
                console.error(`DELETE /api/posts/:id Error Message: ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    });

    //수정시 고려사항: 게시글의 해시태그가 달라졌을때를 고려한다.
    //1. 게시글의 해시태그를 분리해서 저장한다.
    //2. posts_tags테이블에서 해당 게시글에 저장된 태그들을 불러온다.
    //3. 만약 해시태그가 기존에 있던것과 일치하면 그대로 나두며,
    //4. 만약 해시태그가 기존에 있던것과 일치하지 않고 달라졌다면
    //5. 기존의 해시태그를 지우고, 새로운 해시태그 관계를 생성한다.
    //6. 게시글 수정
router.route("/:postId").put(async (req,res,next)=>{
        await authMiddleware([],req,res,next)
    },async (req,res) => {
        try{
            const {postId} = req.params;
            const {postTitle,postContent} = req.body;
            const hashTags = postContent.match(/#[^\s#]*/g);
            const post = await Posts.findByPk(Number(postId))
            if(!post){
                return res.status(412).json({message:"게시글을 찾을 수 없습니다."})
            }
            db.sequelize.transaction(async (transaction)=>{
                await post.update({postTitle,postContent},{transaction})
                await Posts_Tags.destroy({ where:{postId}, transaction})
                if(hashTags){ //db에 저장된 해시태그도, 수정된 해시태그도 없을때
        
                    const bulkHashTag = hashTags.map((tag)=>{
                        return {tagContent:tag}
                    })
                    await HashTags.bulkCreate(bulkHashTag,{ignoreDuplicates:true,transaction})
        
                    const tagFind =await HashTags.findAll({ //db에 저장된 해시태그 불러오기
                        where:{
                            tagContent:
                            {[Op.or]:hashTags}
                        },
                        attributes:["tagId"],
                        transaction
                    })//bulkcreate를 한 후 수행하는게 효율적
                    await Posts_Tags.bulkCreate(tagFind.map(tag=>{
                        return {postId,tagId:tag.tagId}
                    }),{transaction})
                    return res.status(200).json({message: "정상적으로 수정되었습니다"})
                }
            })

        }catch(err){
            console.log(err)
            return res.status(400).json({message:"수정이 정상적으로 완료되지 않았습니다."})
        }






    });
module.exports = router;
