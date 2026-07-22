"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import type { CreatePostInput, PostDetail, PostStatus } from "@/src/types";
import { Prisma, PostStatus as PrismaPostStatus } from "@prisma/client";

export type PostStatusFilter = PostStatus | "ALL";

export async function getPosts(statusFilter: PostStatusFilter = "ALL", campaignId?: string) {
  const where = {
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    ...(campaignId ? { campaignId } : {}),
  };

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: {
        select: { id: true, name: true, email: true, role: true },
      },
      campaign: true,
      analytics: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return posts as PostDetail[];
}

export async function createPost(data: CreatePostInput & { status?: PostStatus; authorEmail?: string }) {
  const author = data.authorEmail
    ? await prisma.user.findUnique({ where: { email: data.authorEmail } })
    : null;

  if (!author) {
    throw new Error("Author not found.");
  }

  const post = await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      mediaUrl: data.mediaUrl ?? null,
      hashtags: data.hashtags ?? [],
      platforms: data.platforms ?? [],
      status: data.status ?? "DRAFT",
      campaignId: data.campaignId ?? null,
      scheduledAt: data.scheduledAt ?? null,
      authorId: author.id,
    },
    include: {
      author: true,
      campaign: true,
      analytics: true,
    },
  });

  revalidatePath("/");
  return post as PostDetail;
}

export async function updatePostStatus(postId: string, newStatus: PostStatus, rejectionNote?: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) {
    throw new Error("Post not found.");
  }

  const nextData: Prisma.PostUpdateInput = {
    status: newStatus,
    rejectionNote: newStatus === "REJECTED" ? rejectionNote ?? null : null,
  };

  if (newStatus === "PUBLISHED") {
    nextData.scheduledAt = new Date();
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: nextData,
    include: {
      author: true,
      campaign: true,
      analytics: true,
    },
  });

  revalidatePath("/");
  return updatedPost as PostDetail;
}

export async function submitPostForApproval(postId: string) {
  return updatePostStatus(postId, PrismaPostStatus.PENDING_APPROVAL);
}

export async function approvePost(postId: string) {
  return updatePostStatus(postId, PrismaPostStatus.APPROVED);
}

export async function rejectPost(postId: string, rejectionNote: string) {
  return updatePostStatus(postId, PrismaPostStatus.REJECTED, rejectionNote);
}

export async function publishPost(postId: string) {
  return updatePostStatus(postId, PrismaPostStatus.PUBLISHED);
}

export async function deletePost(postId: string) {
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/");
}
