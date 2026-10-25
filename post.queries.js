import { memoryDb, nextId, nowIso } from "../db/index.js";

function getPostStats(postId, currentUserId) {
  const likes = memoryDb.likes.filter((like) => like.post_id === postId);
  const comments = memoryDb.comments.filter((comment) => comment.post_id === postId);

  return {
    like_count: likes.length,
    comment_count: comments.length,
    liked_by_me: likes.some((like) => like.user_id === currentUserId),
  };
}

export function listPosts(currentUserId) {
  return memoryDb.posts
    .map((post) => {
      const author = memoryDb.users.find((user) => user.id === post.user_id);
      const stats = getPostStats(post.id, currentUserId);

      return {
        id: post.id,
        content: post.content,
        image: post.image ?? null,
        created_at: post.created_at,
        username: author ? author.username : "unknown",
        ...stats,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function createPost({ user_id, content, image }) {
  const post = {
    id: nextId(memoryDb.posts),
    user_id,
    content,
    image: image ?? null,
    created_at: nowIso(),
  };

  memoryDb.posts.push(post);
  return {
    id: post.id,
    user_id: post.user_id,
    content: post.content,
    image: post.image,
    created_at: post.created_at,
  };
}

export function getPostDetail(postId, currentUserId) {
  const post = memoryDb.posts.find((item) => item.id === Number(postId));

  if (!post) {
    return null;
  }

  const author = memoryDb.users.find((user) => user.id === post.user_id);
  const comments = memoryDb.comments
    .filter((comment) => comment.post_id === Number(postId))
    .map((comment) => {
      const commenter = memoryDb.users.find((user) => user.id === comment.user_id);
      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        username: commenter ? commenter.username : "unknown",
      };
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return {
    post: {
      id: post.id,
      content: post.content,
      image: post.image ?? null,
      created_at: post.created_at,
      username: author ? author.username : "unknown",
      ...getPostStats(post.id, currentUserId),
    },
    comments,
  };
}

export function toggleLike(postId, userId) {
  const numericPostId = Number(postId);
  const existingLike = memoryDb.likes.find(
    (like) => like.post_id === numericPostId && like.user_id === userId,
  );

  if (existingLike) {
    memoryDb.likes = memoryDb.likes.filter(
      (like) => !(like.post_id === numericPostId && like.user_id === userId),
    );
  } else {
    memoryDb.likes.push({
      user_id: userId,
      post_id: numericPostId,
      created_at: nowIso(),
    });
  }

  const like_count = memoryDb.likes.filter((like) => like.post_id === numericPostId).length;
  return {
    liked: !existingLike,
    like_count,
  };
}

export function createComment({ post_id, user_id, content }) {
  const post = memoryDb.posts.find((item) => item.id === Number(post_id));

  if (!post) {
    throw new Error("post not found");
  }

  const user = memoryDb.users.find((item) => item.id === user_id);
  const newComment = {
    id: nextId(memoryDb.comments),
    post_id: Number(post_id),
    user_id,
    content,
    created_at: nowIso(),
  };

  memoryDb.comments.push(newComment);

  return {
    id: newComment.id,
    content: newComment.content,
    created_at: newComment.created_at,
    username: user ? user.username : "unknown",
  };
}
