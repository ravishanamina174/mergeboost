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

// Updated to rely on text colors, allowing the background to remain clean white like the reference image
const statusStyles: Record<PostStatus, string> = {
  DRAFT: "text-slate-600",
  PENDING_APPROVAL: "text-amber-600",
  APPROVED: "text-sky-600",
  REJECTED: "text-rose-600",
  PUBLISHED: "text-emerald-600",
};

const platformLabels: Record<string, string> = {
  X_TWITTER: "X",
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
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
    <div className="mx-auto max-w-7xl space-y-12 pb-16 font-sans">
      {/* Soft, Modern Hero Section */}
      <section className="relative flex flex-col gap-12 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 px-8 py-16 text-slate-900 md:px-12 lg:flex-row lg:items-end lg:justify-between lg:py-20">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl font-light tracking-tighter md:text-6xl lg:text-7xl">
            Crafting your <br />
            <span className="font-serif italic text-slate-400">perfect content</span>
          </h1>
          <p className="mt-6 max-w-md text-base font-light leading-relaxed text-slate-500">
            Step into a space where creativity becomes a way of life. Review, schedule, and publish your digital assets with unparalleled ease.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-8 md:gap-12 lg:pb-4">
          <div className="flex flex-col gap-2">
            <span className="text-4xl font-bold tracking-tight lg:text-5xl">{metrics.total}</span>
            <span className="text-xs uppercase tracking-widest text-slate-500">Total Assets</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-4xl font-bold tracking-tight lg:text-5xl">{metrics.pending}</span>
            <span className="text-xs uppercase tracking-widest text-slate-500">Pending</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-4xl font-bold tracking-tight lg:text-5xl">{metrics.scheduled}</span>
            <span className="text-xs uppercase tracking-widest text-slate-500">Scheduled</span>
          </div>
          <div className="flex flex-col gap-2 text-emerald-600">
            <span className="text-4xl font-bold tracking-tight lg:text-5xl">{metrics.published}</span>
            <span className="text-xs uppercase tracking-widest text-emerald-700">Published</span>
          </div>
        </div>
      </section>

      {/* Content Pipeline */}
      <section className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-slate-900">Your content pipeline</h2>
            <p className="mt-2 text-sm text-slate-500">Discover a myriad of choices available through our service.</p>
          </div>
          
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Soft background tab navigation */}
            <div className="flex flex-wrap gap-1 rounded-lg bg-slate-50 p-1 border border-slate-100">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-md px-5 py-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key 
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" 
                      : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-6 py-1.5 text-sm font-medium text-white transition-all hover:bg-slate-800 shadow-sm md:ml-4"
            >
              <Sparkles className="h-4 w-4" />
              Create new
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {visiblePosts.map((post) => {
            const isCreator = currentUser.role === "CONTENT_CREATOR";
            const isApprover = currentUser.role === "CONTENT_APPROVER";
            const isAdmin = currentUser.role === "ADMIN";
            const canSubmit = isCreator && (post.status === "DRAFT" || post.status === "REJECTED");
            const canApprove = isApprover && post.status === "PENDING_APPROVAL";
            const canPublish = (isApprover || isAdmin || isCreator) && (post.status === "APPROVED" || post.status === "PUBLISHED");

            return (
              <article 
                key={post.id} 
                // Light gray card background to match the reference image
                className="group relative flex flex-col gap-8 rounded-xl bg-slate-50/70 p-6 transition-all duration-300 hover:bg-slate-50 md:flex-row md:p-8 border border-slate-100"
              >
                {/* Image Area */}
                <div className="w-full shrink-0 md:w-[280px] lg:w-[340px]">
                  {post.mediaUrl ? (
                    <Image
                      src={post.mediaUrl}
                      alt={post.title}
                      width={400}
                      height={400}
                      className="h-64 w-full rounded-lg object-cover bg-white shadow-sm md:h-full md:min-h-[240px]"
                    />
                  ) : (
                    <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg bg-white shadow-sm text-sm text-slate-400 md:h-full md:min-h-[240px] border border-slate-100">
                      <span className="font-serif italic">No visual asset</span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    {/* Clean White Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md bg-white border border-slate-200/60 shadow-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${statusStyles[post.status]}`}>
                        {post.status.replace(/_/g, " ")}
                      </span>
                      {post.platforms.map((platform) => (
                        <span key={platform} className="rounded-md bg-white border border-slate-200/60 shadow-sm px-3 py-1.5 text-xs font-medium text-slate-600">
                          {platformLabels[platform]}
                        </span>
                      ))}
                    </div>

                    <h3 className="mt-5 text-2xl font-medium tracking-tight text-slate-900">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-base font-light leading-relaxed text-slate-500 line-clamp-3">
                      {post.content}
                    </p>

                    {/* Metadata row */}
                    <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-400">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-xs text-slate-500">@</span>
                        {post.author.name ?? post.author.email}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>Campaign: <span className="text-slate-600">{post.campaign?.name ?? "Unassigned"}</span></span>
                      <span className="text-slate-300">|</span>
                      <span>Reach: <span className="text-slate-600">{post.analytics?.reach ?? 0}</span></span>
                    </div>

                    {post.status === "REJECTED" && post.rejectionNote ? (
                      <div className="mt-6 flex items-start gap-3 rounded-lg bg-white p-4 border border-rose-100 shadow-sm">
                        <MessageSquareWarning className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-rose-800">Rejection Feedback</p>
                          <p className="mt-1 text-sm text-rose-600 leading-relaxed">{post.rejectionNote}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-slate-200/60">
                    {canSubmit ? (
                      <button
                        type="button"
                        onClick={() => runAction(() => submitPostForApproval(post.id))}
                        className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 shadow-sm"
                      >
                        Submit for Approval
                      </button>
                    ) : null}

                    {canApprove ? (
                      <>
                        <button
                          type="button"
                          onClick={() => runAction(() => approvePost(post.id))}
                          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 shadow-sm"
                        >
                          Approve Asset
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectionPostId(post.id)}
                          className="rounded-md bg-white border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}

                    {canPublish ? (
                      <button
                        type="button"
                        onClick={() => runAction(() => publishPost(post.id))}
                        className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-500 shadow-sm"
                      >
                        Publish Now
                      </button>
                    ) : null}

                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => runAction(() => deletePost(post.id))}
                        className="rounded-md bg-white border border-rose-200 px-5 py-2 text-sm font-medium text-rose-600 transition-all hover:bg-rose-50 hover:border-rose-300 ml-auto shadow-sm"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>

                  {/* Inline Rejection UI */}
                  {rejectionPostId === post.id ? (
                    <div className="mt-5 rounded-lg bg-white p-5 border border-slate-200 shadow-sm">
                      <label className="text-sm font-semibold text-slate-800" htmlFor={`rejection-${post.id}`}>
                        Provide Rejection Reasoning
                      </label>
                      <textarea
                        id={`rejection-${post.id}`}
                        value={rejectionNote}
                        onChange={(event) => setRejectionNote(event.target.value)}
                        className="mt-3 min-h-[100px] w-full rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-all"
                        placeholder="Detail the compliance or content issue the creator needs to address..."
                      />
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!rejectionNote.trim()) return;
                            runAction(() => rejectPost(post.id, rejectionNote));
                            setRejectionPostId(null);
                            setRejectionNote("");
                          }}
                          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectionPostId(null);
                            setRejectionNote("");
                          }}
                          className="rounded-md bg-transparent px-5 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}

          {visiblePosts.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-24 text-center border border-slate-100">
              <span className="font-serif text-2xl italic text-slate-400">No content available in this view</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}