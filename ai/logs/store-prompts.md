# State Management - Museum Store & Social Store

**Update Date**: 2026-04-10
**Component**: src/museum/store.js, src/museum/socialStore.js
**Status**: Completed

## Prompt

````
Create a state management system for a museum application using Vue 3 Composition API:

1. Museum Store (store.js)
   - Use Vue's reactive() for state
   - Include:
     * points: user reward points (initial: 100)
     * unlockedArtifactIds: array of collected artifact IDs
     * redeemedShopIds: array of redeemed shop items
     * artifacts: full list of artifact objects
     * zones: exhibition zones data
     * shopItems: available shop products
     * posts: community posts
     * lastScan: most recently scanned artifact
     * toast: temporary notification message

   - Computed properties:
     * collectibles: artifacts with unlocked status
     * unlockedCount: number of collected artifacts

   - Functions:
     * scanArtifact(artifactId): unlock artifact, add points
     * redeem(itemId): redeem shop item with points
     * toggleLike(postId): like/unlike community post
     * addPost(text): add new community post

2. Social Store (socialStore.js)
   - Manage saved posts for user
   - Functions:
     * savePost(post): add to savedPosts
     * unsavePost(postId): remove from savedPosts
     * isSaved(postId): check if post is saved

3. Artifact Data Structure
   ```javascript
   {
     id: "horus-falcon-statue",
     name: "Horus Falcon Statue",
     hallId: "h1",
     hallName: "Ancient Sculpture",
     story: "Description text...",
     points: 30,
     modelGlb: "/models/HorusFalcon.glb"
   }
````

1. Zone Data Structure
   ```javascript
   {
     id: "h1",
     name: "Ancient Sculpture",
     hint: "Largest hall...",
     summary: "...",
     exhibits: ["Exhibit1", "Exhibit2"],
     lng: 120.7388,
     lat: 31.272
   }
   ```

Use export function pattern: export function createMuseumStore() { ... }

```

## Output Summary

Generated store.js with comprehensive state management including:
- 13 initial artifacts with full metadata
- 3 exhibition zones
- 3 shop items
- Reactive computed properties
- Toast notification system with auto-dismiss
- Points and collection tracking

Generated socialStore.js with post saving functionality.

## Modifications

1. Added toast auto-dismiss timer management
2. Implemented proper cloneDeep for post comments in socialStore
3. Added "Revisited" bonus points (+5) for re-scanning artifacts
4. Added point validation for shop redemption
5. Implemented proper array mutation for liked state
```

