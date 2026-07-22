'use client';

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Clock3, MessageSquareWarning, Rocket, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import {
  approvePost,
  deletePost,
  publishPost,
  rejectPost,
  submitPostForApproval,
  type PostStatusFilter,
} from "@/src/app/actions/postActions";
import type { PostDetail, PostStatus } from "@/src/types";

type ContentDashboardProps = {
  posts: PostDetail[];
};

const tabs: Array<{ key: PostStatusFilter; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Drafts" },
  { key: "PENDING_APPROVAL", label: "Pending Approval" },
  { key: "APPROVED", label: "Scheduled" },
  { key: "PUBLISHED", label: "Published" },
  { key: "REJECTED", label: "Rejected" },
];

const statusStyles: Record<PostStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-rose-100 text-rose-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
};

const platformLabels: Record<string, string> = {
  X_TWITTER: "X",
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
};

const platformStyles: Record<string, string> = {
  X_TWITTER: "border-slate-300 text-slate-600",
  LINKEDIN: "border-sky-300 text-sky-700",
  INSTAGRAM: "border-pink-300 text-pink-700",
  TIKTOK: "border-fuchsia-300 text-fuchsia-700",
  FACEBOOK: "border-indigo-300 text-indigo-700",
  YOUTUBE: "border-red-300 text-red-700",
};

export function ContentDashboard({ posts }: ContentDashboardProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<PostStatusFilter>("ALL");
  const [rejectionPostId, setRejectionPostId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [, startTransition] = useTransition();

  const visiblePosts = useMemo(() => {
    if (activeTab === "ALL") {
      return posts;
    }

    return posts.filter((post) => post.status === activeTab);
  }, [activeTab, posts]);

  const metrics = useMemo(() => {
    return {
      total: posts.length,
      pending: posts.filter((post) => post.status === "PENDING_APPROVAL").length,
      scheduled: posts.filter((post) => post.status === "APPROVED").length,
      published: posts.filter((post) => post.status === "PUBLISHED").length,
    };
  }, [posts]);

  const runAction = (action: () => Promise<unknown>) => {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total posts</p>
            <Sparkles className="h-4 w-4 text-violet-400" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">{metrics.total}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Pending approvals</p>
            <Clock3 className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">{metrics.pending}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Scheduled posts</p>
            <Rocket className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">{metrics.scheduled}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Published posts</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">{metrics.published}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Content pipeline</h2>
            <p className="text-sm text-slate-400">Review drafts, approvals, and published assets in one view.</p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
          >
            <Sparkles className="h-4 w-4" />
            New post
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                activeTab === tab.key ? "bg-white text-slate-900" : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {visiblePosts.map((post) => {
            const isCreator = currentUser.role === "CONTENT_CREATOR";
            const isApprover = currentUser.role === "CONTENT_APPROVER";
            const isAdmin = currentUser.role === "ADMIN";
            const canSubmit = isCreator && (post.status === "DRAFT" || post.status === "REJECTED");
            const canApprove = isApprover && post.status === "PENDING_APPROVAL";
            const canPublish = (isApprover || isAdmin || isCreator) && (post.status === "APPROVED" || post.status === "PUBLISHED");

            return (
              <article key={post.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[post.status]}`}>
                        {post.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-slate-400">{post.campaign?.name ?? "No campaign"}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{post.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{post.content}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.platforms.map((platform) => (
                        <span key={platform} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${platformStyles[platform]}`}>
                          {platformLabels[platform]}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <span>Author: {post.author.name ?? post.author.email}</span>
                      <span>Campaign: {post.campaign?.name ?? "Unassigned"}</span>
                      <span>Engagement: {post.analytics?.reach ?? 0}</span>
                    </div>

                    {post.status === "REJECTED" && post.rejectionNote ? (
                      <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-rose-300">
                          <MessageSquareWarning className="h-4 w-4" />
                          Feedback
                        </div>
                        <p className="mt-2 text-sm text-rose-200">{post.rejectionNote}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="w-full max-w-[220px] rounded-2xl border border-white/10 bg-white/5 p-2">
                    {post.mediaUrl ? (
                      <Image
                        src={post.mediaUrl}
                        alt={post.title}
                        width={400}
                        height={240}
                        className="h-40 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-xl bg-white/5 text-sm text-slate-500">
                        No image yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {canSubmit ? (
                    <button
                      type="button"
                      onClick={() => runAction(() => submitPostForApproval(post.id))}
                      className="rounded-full bg-violet-500 px-3 py-2 text-sm font-medium text-white hover:bg-violet-400"
                    >
                      Submit for Approval
                    </button>
                  ) : null}

                  {canApprove ? (
                    <>
                      <button
                        type="button"
                        onClick={() => runAction(() => approvePost(post.id))}
                        className="rounded-full bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-400"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectionPostId(post.id)}
                        className="rounded-full bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-400"
                      >
                        Reject
                      </button>
                    </>
                  ) : null}

                  {canPublish ? (
                    <button
                      type="button"
                      onClick={() => runAction(() => publishPost(post.id))}
                      className="rounded-full bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-400"
                    >
                      Publish Now
                    </button>
                  ) : null}

                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => runAction(() => deletePost(post.id))}
                      className="rounded-full border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>

                {rejectionPostId === post.id ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <label className="text-sm font-medium text-slate-300" htmlFor={`rejection-${post.id}`}>
                      Rejection reason
                    </label>
                    <textarea
                      id={`rejection-${post.id}`}
                      value={rejectionNote}
                      onChange={(event) => setRejectionNote(event.target.value)}
                      className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                      placeholder="Add the compliance or content issue the creator should address."
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!rejectionNote.trim()) {
                            return;
                          }
                          runAction(() => rejectPost(post.id, rejectionNote));
                          setRejectionPostId(null);
                          setRejectionNote("");
                        }}
                        className="rounded-full bg-rose-500 px-3 py-2 text-sm font-medium text-white"
                      >
                        Confirm rejection
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectionPostId(null);
                          setRejectionNote("");
                        }}
                        className="rounded-full border border-white/10 px-3 py-2 text-sm font-medium text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
