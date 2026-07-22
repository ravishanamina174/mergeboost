import type {
  Analytics,
  Campaign,
  Platform,
  Post,
  PostStatus,
  Role,
  User,
} from "@prisma/client";

export type { Analytics, Campaign, Platform, Post, PostStatus, Role, User };

/** Post with author relation loaded */
export type PostWithAuthor = Post & {
  author: User;
};

/** Post with approver relation loaded */
export type PostWithApprover = Post & {
  approver: User | null;
};

/** Post with campaign relation loaded */
export type PostWithCampaign = Post & {
  campaign: Campaign | null;
};

/** Post with analytics relation loaded */
export type PostWithAnalytics = Post & {
  analytics: Analytics | null;
};

/** Full post detail for dashboard and approval views */
export type PostDetail = Post & {
  author: User;
  approver: User | null;
  campaign: Campaign | null;
  analytics: Analytics | null;
};

/** Campaign with associated posts */
export type CampaignWithPosts = Campaign & {
  posts: Post[];
};

/** User with post counts for admin listings */
export type UserWithPostCounts = User & {
  _count: {
    postsCreated: number;
    postsApproved: number;
  };
};

/** Serializable post summary safe for client components */
export type PostSummary = Pick<
  Post,
  | "id"
  | "title"
  | "content"
  | "mediaUrl"
  | "hashtags"
  | "platforms"
  | "status"
  | "scheduledAt"
  | "createdAt"
> & {
  author: Pick<User, "id" | "name" | "email">;
};

/** Input shape for creating a new post */
export type CreatePostInput = Pick<
  Post,
  "title" | "content" | "mediaUrl" | "hashtags" | "platforms"
> & {
  campaignId?: string | null;
  scheduledAt?: Date | null;
};

/** Input shape for updating post content before approval */
export type UpdatePostInput = Partial<
  Pick<
    Post,
    | "title"
    | "content"
    | "mediaUrl"
    | "hashtags"
    | "platforms"
    | "scheduledAt"
    | "campaignId"
  >
>;

/** Analytics metrics snapshot */
export type AnalyticsMetrics = Pick<
  Analytics,
  "likes" | "shares" | "comments" | "reach"
>;
