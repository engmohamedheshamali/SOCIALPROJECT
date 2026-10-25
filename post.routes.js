import express from "express";
import { z } from "zod";
import { checkAuth } from "../middleware/checkAuth.js";
import { uploadImage } from "../middleware/upload.js";
import { validateBody } from "../middleware/validateBody.js";
import { createComment, createPost, getPostDetail, listPosts, toggleLike } from "../queries/post.queries.js";
import { commentSchema, createPostSchema } from "../validation-schemas/posts.js";

export const postRouter = express.Router();

postRouter.use(checkAuth);

postRouter.get("/", (req, res) => {
  return res.status(200).json({ data: listPosts(req.user.id) });
});

postRouter.post("/", uploadImage("image"), (req, res) => {
  const payload = {
    content: req.body?.content ?? "",
    image: req.file ? req.file.filename : null,
  };

  const result = createPostSchema.safeParse(payload);
  if (!result.success) {
    const tree = z.treeifyError(result.error);
    return res.status(422).json({ errors: tree?.properties ?? {} });
  }

  const created = createPost({
    user_id: req.user.id,
    content: result.data.content,
    image: result.data.image,
  });

  return res.status(201).json({
    message: "post created successfully",
    data: created,
  });
});

postRouter.get("/:id", (req, res) => {
  const detail = getPostDetail(req.params.id, req.user.id);

  if (!detail) {
    return res.status(404).json({ error: "post not found" });
  }

  return res.status(200).json({ data: detail });
});

postRouter.post("/:id/like", (req, res) => {
  const detail = getPostDetail(req.params.id, req.user.id);

  if (!detail) {
    return res.status(404).json({ error: "post not found" });
  }

  const result = toggleLike(req.params.id, req.user.id);
  return res.status(200).json({ data: result });
});

postRouter.post("/:id/comments", validateBody(commentSchema), (req, res) => {
  const postDetail = getPostDetail(req.params.id, req.user.id);

  if (!postDetail) {
    return res.status(404).json({ error: "post not found" });
  }

  const comment = createComment({
    post_id: req.params.id,
    user_id: req.user.id,
    content: req.body.content,
  });

  return res.status(201).json({
    message: "comment created successfully",
    data: comment,
  });
});
