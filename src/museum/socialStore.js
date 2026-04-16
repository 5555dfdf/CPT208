import { reactive } from "vue";

function cloneCommentList(commentList = []) {
  return commentList.map((comment) => ({ ...comment }));
}

function clonePost(post) {
  return {
    ...post,
    saved: true,
    commentList: cloneCommentList(post.commentList || []),
  };
}

export function createSocialStore() {
  const state = reactive({
    savedPosts: [],
  });

  function savePost(post) {
    if (!post?.id) return;
    const idx = state.savedPosts.findIndex((item) => item.id === post.id);
    if (idx === -1) {
      state.savedPosts.unshift(clonePost(post));
      return;
    }
    state.savedPosts[idx] = {
      ...state.savedPosts[idx],
      ...clonePost(post),
      saved: true,
    };
  }

  function unsavePost(postId) {
    if (!postId) return;
    const idx = state.savedPosts.findIndex((item) => item.id === postId);
    if (idx !== -1) state.savedPosts.splice(idx, 1);
  }

  function isSaved(postId) {
    return state.savedPosts.some((item) => item.id === postId);
  }

  return {
    state,
    savePost,
    unsavePost,
    isSaved,
  };
}
