const { Likes } = require("../models");

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("NewsFeed", "root", "4321aaaa", {
    host: "express-database.c6fzjazd8zwu.ap-northeast-2.rds.amazonaws.com",
    dialect: "mysql",
});

const prepareDataForClient = async (userId, posts) => {
    preparedData = await Promise.all(
        posts.map(async (post) => {
            const likesCount = await Likes.count({
                where: {
                    postId: Number(post.postId),
                },
            });
            let userHasClicked = null;
            if (userId) {
                userHasClicked = await Likes.findOne({
                    where: {
                        userId: Number(userId),
                        postId: Number(post.postId),
                    },
                });
            }
            if (userHasClicked) {
                userHasClicked = true;
            } else {
                userHasClicked = false;
            }

            return {
                postId: Number(post.postId),
                userId: post.userId,
                nickname: post.User.nickname,
                postTitle: post.postTitle,
                postContent: post.postContent,
                likesCount: likesCount,
                viewCount: post.viewCount,
                clicked: userHasClicked,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            };
        })
    );
    return preparedData;
};

async function getPostsByHashTag(hashTag, limit, offset) {
    try {
        const sqlQuery = `
        SELECT 
          h.tagId, h.tagContent, h.createdAt,h.updatedAt,
          p.postId AS \`Posts.postId\`, p.userId AS \`Posts.userId\`,p.postTitle AS \`Posts.postTitle\`,
          p.postContent AS \`Posts.postContent\`,p.viewCount AS \`Posts.viewCount\`,p.createdAt AS \`Posts.createdAt\`,
          \`Posts->Posts_Tags\`.\`postTagId\` AS \`Posts.Posts_Tags.postTagId\`,
          \`Posts->Posts_Tags\`.\`postId\` AS \`Posts.Posts_Tags.postId\`,
          \`Posts->Posts_Tags\`.\`tagId\` AS \`Posts.Posts_Tags.tagId\`,
          \`Posts->User\`.\`userId\` AS \`Posts.User.userId\`,
          \`Posts->User\`.\`nickname\` AS \`Posts.User.nickname\`
        FROM HashTags AS h
        LEFT OUTER JOIN (Posts_Tags AS \`Posts->Posts_Tags\`
        INNER JOIN Posts AS p ON p.postId = \`Posts->Posts_Tags\`.postId) ON h.tagId = \`Posts->Posts_Tags\`.tagId
        LEFT OUTER JOIN Users AS \`Posts->User\` ON p.userId = \`Posts->User\`.userId
        WHERE h.tagContent = :hashTag
        ORDER BY p.viewCount DESC
        LIMIT :limit OFFSET :offset
      `;

        const results = await sequelize.query(sqlQuery, {
            replacements: {
                hashTag,
                limit,
                offset,
            },
            type: Sequelize.QueryTypes.SELECT,
            raw: true,
            nest: true,
        });

        return results;
    } catch (err) {
        return err;
    }
}



module.exports = { prepareDataForClient,getPostsByHashTag };
