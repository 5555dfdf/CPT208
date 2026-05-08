# CommunityView.vue - Social Features Implementation

**Update Date**: 2026-04-15
**Component**: CommunityView.vue
**Status**: Completed

## Prompt

```
Create a Vue 3 component for a community/social features page:

1. Post Feed Display
   - List of community posts with:
     * Author name and avatar
     * Time posted (e.g., "12m ago")
     * Post title and content
     * Post image (optional)
     * Engagement stats: likes, comments, saves
     * Action buttons: like, comment, save

2. Post Interaction
   - Like button: toggle liked state, increment/decrement counter
   - Save button: add/remove from saved posts using social store
   - Comment button: expand to show comment list

3. Comment Section
   - Nested comment list under each post
   - Each comment has: author, avatar, text, time, likes
   - Comment input field for adding new comments

4. Post Composition
   - Draft title and content inputs
   - Toggle compose mode with button
   - Submit new posts to museum store

5. Mock Data Structure
   ```javascript
   {
     id: 'c1',
     author: 'Ethan',
     avatar: avatarImg,
     timeAgo: '12m ago',
     title: 'BookmarkSet Drop',
     text: 'Description...',
     image: bookmarkSetImg,
     likes: 32,
     comments: 3,
     saves: 13,
     liked: false,
     saved: false,
     commentList: [
       { id: 'c1m1', author: 'Nora', avatar: avatar1Img, text: '...', timeAgo: '6m ago', likes: 5, liked: false }
     ]
   }
   ```

Use Vue 3 Composition API with <script setup>.
Inject both museum and social stores.
```

## Output Summary

Generated CommunityView.vue with:
- Post feed with engagement metrics
- Like/save/comment interactions
- Expandable comment sections
- Post composition form
- Avatar images for mock users

## Modifications

1. Added avatar images (avatar1-4.png) for mock users
2. Implemented comment toggle visibility
3. Added post detail view when clicking on post
4. Implemented addComment function for new comments
5. Connected savePost/unsavePost to social store
6. Added visual feedback for liked and saved states