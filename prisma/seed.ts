import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  Platform,
  PostStatus,
  PrismaClient,
  Role,
} from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding MergeBoost database...\n");

  // Clear existing data (respect foreign key order)
  await prisma.analytics.deleteMany();
  await prisma.post.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ Cleared existing records");

  const admin = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "admin@mergeboost.dev",
      role: Role.ADMIN,
      consentGiven: true,
    },
  });

  const creator = await prisma.user.create({
    data: {
      name: "Sam Chen",
      email: "creator@mergeboost.dev",
      role: Role.CONTENT_CREATOR,
      consentGiven: true,
    },
  });

  const approver = await prisma.user.create({
    data: {
      name: "Jordan Blake",
      email: "approver@mergeboost.dev",
      role: Role.CONTENT_APPROVER,
      consentGiven: true,
    },
  });

  console.log("✓ Created 3 users");

  const sprintDrop = await prisma.campaign.create({
    data: {
      name: "Late-Night Release Sprint Drop",
      objective: "Driving late-night dev pre-orders",
      targetAudience: "Full-stack engineers, indie hackers, and startup devs shipping after midnight",
      startDate: new Date("2026-01-15T00:00:00.000Z"),
      endDate: new Date("2026-03-31T23:59:59.000Z"),
    },
  });

  const cyberMonday = await prisma.campaign.create({
    data: {
      name: "Cyber Monday Bug-Fix Pack",
      objective: "Black Friday/Cyber Monday bundle promotion",
      targetAudience: "Developers hunting deals on productivity tools and wellness stacks",
      startDate: new Date("2026-11-24T00:00:00.000Z"),
      endDate: new Date("2026-12-02T23:59:59.000Z"),
    },
  });

  const hackathon = await prisma.campaign.create({
    data: {
      name: "Hackathon Hydration 2026",
      objective: "Community awareness at major dev events",
      targetAudience: "Hackathon participants, ML engineers, and open-source contributors",
      startDate: new Date("2026-04-01T00:00:00.000Z"),
      endDate: new Date("2026-10-31T23:59:59.000Z"),
    },
  });

  console.log("✓ Created 3 campaigns");

  const publishedPosts = await Promise.all([
    prisma.post.create({
      data: {
        title: "Ship at 2 AM Without the Crash",
        content:
          "Your deploy window doesn't care about your sleep schedule. MergeBoost Sprint Fuel blends L-theanine + adaptogenic mushrooms so you stay sharp through the final PR — without the 3 AM jitter spiral. Pre-order the Late-Night Release Sprint Drop before Friday. 🚀☕",
        mediaUrl:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
        hashtags: ["MergeBoost", "DevLife", "Nootropics", "ShipIt", "LateNightCoding"],
        platforms: [Platform.X_TWITTER, Platform.LINKEDIN],
        status: PostStatus.PUBLISHED,
        scheduledAt: new Date("2026-02-10T02:00:00.000Z"),
        authorId: creator.id,
        approverId: approver.id,
        campaignId: sprintDrop.id,
        createdAt: new Date("2026-02-08T18:30:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Green CI, Green Drink",
        content:
          "All tests passing? Celebrate with something that won't wreck tomorrow's standup. MergeBoost Focus Flow is built for devs who treat their brain like production infrastructure. 20% off Sprint Drop bundles — link in bio.",
        mediaUrl:
          "https://images.unsplash.com/photo-1461740680194-0881f0a0f7a0?w=1200&q=80",
        hashtags: ["MergeBoost", "CleanCode", "DevWellness", "CICD"],
        platforms: [Platform.INSTAGRAM, Platform.X_TWITTER],
        status: PostStatus.PUBLISHED,
        scheduledAt: new Date("2026-02-14T20:00:00.000Z"),
        authorId: creator.id,
        approverId: approver.id,
        campaignId: sprintDrop.id,
        createdAt: new Date("2026-02-12T11:00:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Cyber Monday: Debug Your Energy Stack",
        content:
          "Black Friday got you a new keyboard. Cyber Monday gets you a brain upgrade. The Bug-Fix Pack bundles 3 MergeBoost formulas — Focus, Recovery, and Sprint — for less than your monthly API bill. Limited stock for dev teams.",
        mediaUrl:
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
        hashtags: ["CyberMonday", "MergeBoost", "DevDeals", "BugFixPack"],
        platforms: [Platform.LINKEDIN, Platform.FACEBOOK, Platform.X_TWITTER],
        status: PostStatus.PUBLISHED,
        scheduledAt: new Date("2026-11-28T09:00:00.000Z"),
        authorId: creator.id,
        approverId: approver.id,
        campaignId: cyberMonday.id,
        createdAt: new Date("2026-11-25T14:00:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "48-Hour Hackathon? Hydrate Like You Mean It",
        content:
          "MergeBoost is the official hydration partner at Hackathon Hydration 2026. Find us at the sponsor table — free samples, sticker packs, and a leaderboard for teams who ship the wildest MVP. Your stack has logging. Your body deserves monitoring too.",
        mediaUrl:
          "https://images.unsplash.com/photo-1531483015267-7f01ad2ad2f4?w=1200&q=80",
        hashtags: ["HackathonHydration", "MergeBoost", "BuildInPublic", "OpenSource"],
        platforms: [Platform.INSTAGRAM, Platform.TIKTOK, Platform.YOUTUBE],
        status: PostStatus.PUBLISHED,
        scheduledAt: new Date("2026-05-18T10:00:00.000Z"),
        authorId: creator.id,
        approverId: approver.id,
        campaignId: hackathon.id,
        createdAt: new Date("2026-05-15T16:45:00.000Z"),
      },
    }),
  ]);

  await Promise.all(
    publishedPosts.map((post, index) =>
      prisma.analytics.create({
        data: {
          postId: post.id,
          likes: [842, 1203, 2156, 3891][index],
          shares: [156, 289, 412, 678][index],
          comments: [47, 93, 128, 214][index],
          reach: [12400, 18750, 34200, 52100][index],
        },
      }),
    ),
  );

  console.log("✓ Created 4 PUBLISHED posts with analytics");

  await Promise.all([
    prisma.post.create({
      data: {
        title: "Standup-Proof Focus for Remote Teams",
        content:
          "Async standups at 9 AM after a late deploy? MergeBoost Recovery Blend helps you show up coherent — not just camera-on. Scheduling this for Monday 8 AM EST. Remote dev teams get 15% off with code REMOTE15.",
        mediaUrl:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
        hashtags: ["RemoteDev", "MergeBoost", "AsyncLife", "FocusStack"],
        platforms: [Platform.LINKEDIN],
        status: PostStatus.APPROVED,
        scheduledAt: new Date("2026-07-28T08:00:00.000Z"),
        authorId: creator.id,
        approverId: approver.id,
        campaignId: sprintDrop.id,
        createdAt: new Date("2026-07-22T09:15:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Refactor Your Refuel Routine",
        content:
          "Technical debt isn't the only thing accumulating. Swap the fourth espresso for MergeBoost Focus Flow — same velocity, fewer heart palpitations. Dropping this Thursday on X and Instagram.",
        mediaUrl:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80",
        hashtags: ["MergeBoost", "DevHealth", "RefactorYourRoutine"],
        platforms: [Platform.X_TWITTER, Platform.INSTAGRAM],
        status: PostStatus.APPROVED,
        scheduledAt: new Date("2026-08-07T17:30:00.000Z"),
        authorId: creator.id,
        approverId: approver.id,
        campaignId: sprintDrop.id,
        createdAt: new Date("2026-08-01T13:20:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Bundle Alert: 3 Drinks, 1 Sprint",
        content:
          "Cyber Monday Bug-Fix Pack goes live in 72 hours. Three formulas, one checkout, zero decision fatigue. Perfect for teams doing incident response season. Calendar reminder set for Nov 29 6 AM PT.",
        mediaUrl:
          "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80",
        hashtags: ["BugFixPack", "CyberMonday", "MergeBoost", "DevTeams"],
        platforms: [Platform.FACEBOOK, Platform.LINKEDIN],
        status: PostStatus.APPROVED,
        scheduledAt: new Date("2026-11-29T06:00:00.000Z"),
        authorId: creator.id,
        approverId: approver.id,
        campaignId: cyberMonday.id,
        createdAt: new Date("2026-11-26T10:00:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Live Demo: MergeBoost at DevConf 2026",
        content:
          "We're pouring samples at DevConf main hall — booth #42. Short TikTok + YouTube Short scheduled for day-one hype. If you're presenting, grab a can before your talk. Your audience will thank you.",
        mediaUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
        hashtags: ["DevConf2026", "MergeBoost", "HackathonHydration", "Booth42"],
        platforms: [Platform.TIKTOK, Platform.YOUTUBE],
        status: PostStatus.APPROVED,
        scheduledAt: new Date("2026-06-12T14:00:00.000Z"),
        authorId: creator.id,
        approverId: approver.id,
        campaignId: hackathon.id,
        createdAt: new Date("2026-06-08T11:30:00.000Z"),
      },
    }),
  ]);

  console.log("✓ Created 4 APPROVED / scheduled posts");

  await Promise.all([
    prisma.post.create({
      data: {
        title: "TypeScript Tips & Taurine",
        content:
          "Thread idea: 5 TS patterns that saved our codebase — sponsored by the can keeping me awake through generics. MergeBoost Sprint Fuel, not another energy drink rebrand. Submitting for approval before the TS meetup post.",
        mediaUrl:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80",
        hashtags: ["TypeScript", "MergeBoost", "DevTwitter", "Generics"],
        platforms: [Platform.X_TWITTER],
        status: PostStatus.PENDING_APPROVAL,
        authorId: creator.id,
        campaignId: sprintDrop.id,
        createdAt: new Date("2026-07-20T22:10:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Before/After: 4-Hour Deep Work Block",
        content:
          "Carousel concept — slide 1: messy desk + 3 empty mugs. Slide 6: shipped feature + one MergeBoost can. Authentic dev productivity, not hustle porn. Needs legal review on claims before we post.",
        mediaUrl:
          "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=1200&q=80",
        hashtags: ["DeepWork", "MergeBoost", "DevProductivity"],
        platforms: [Platform.INSTAGRAM, Platform.LINKEDIN],
        status: PostStatus.PENDING_APPROVAL,
        authorId: creator.id,
        campaignId: sprintDrop.id,
        createdAt: new Date("2026-07-21T15:40:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Flash Sale Copy — Bug-Fix Pack",
        content:
          "24-hour flash: Bug-Fix Pack at 30% off for GitHub contributors. Proof-of-contribution verification via OAuth. Copy ready — waiting on approver sign-off for discount depth.",
        mediaUrl:
          "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&q=80",
        hashtags: ["OpenSource", "MergeBoost", "FlashSale", "BugFixPack"],
        platforms: [Platform.X_TWITTER, Platform.FACEBOOK],
        status: PostStatus.PENDING_APPROVAL,
        authorId: creator.id,
        campaignId: cyberMonday.id,
        createdAt: new Date("2026-11-27T08:55:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Hackathon Survival Kit Unboxing",
        content:
          "60-second unboxing: MergeBoost mini-fridge, sticker sheet, and the Hydration 2026 playbook. Targeting Reels + TikTok. Music licensing pending — content otherwise ready for review.",
        mediaUrl:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
        hashtags: ["Unboxing", "HackathonHydration", "MergeBoost", "DevKit"],
        platforms: [Platform.INSTAGRAM, Platform.TIKTOK],
        status: PostStatus.PENDING_APPROVAL,
        authorId: creator.id,
        campaignId: hackathon.id,
        createdAt: new Date("2026-05-20T19:00:00.000Z"),
      },
    }),
  ]);

  console.log("✓ Created 4 PENDING_APPROVAL posts");

  await Promise.all([
    prisma.post.create({
      data: {
        title: "README.md but Make It a Recipe",
        content:
          "Draft idea: document the MergeBoost morning stack like a README — prerequisites, install steps, expected output (flow state by 10 AM). Still writing the humor section. Not ready for review.",
        mediaUrl:
          "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&q=80",
        hashtags: ["MergeBoost", "DevHumor", "README"],
        platforms: [Platform.X_TWITTER, Platform.LINKEDIN],
        status: PostStatus.DRAFT,
        authorId: creator.id,
        campaignId: sprintDrop.id,
        createdAt: new Date("2026-07-19T12:00:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Team Bundle Pricing Teaser",
        content:
          "Working on Cyber Monday team pricing tiers — 5-pack, 10-pack, whole-floor-of-SF-office pack. Need finance numbers before this goes anywhere near approval.",
        mediaUrl:
          "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
        hashtags: ["MergeBoost", "TeamDeals", "CyberMonday"],
        platforms: [Platform.LINKEDIN],
        status: PostStatus.DRAFT,
        authorId: creator.id,
        campaignId: cyberMonday.id,
        createdAt: new Date("2026-11-20T10:30:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Open Source Maintainer Spotlight Series",
        content:
          "Series pitch: interview maintainers about burnout + recovery rituals. MergeBoost sponsors the series, not the opinions. Outline only — interviews not scheduled yet.",
        mediaUrl:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
        hashtags: ["OpenSource", "Maintainers", "MergeBoost", "DevCommunity"],
        platforms: [Platform.YOUTUBE, Platform.LINKEDIN],
        status: PostStatus.DRAFT,
        authorId: creator.id,
        campaignId: hackathon.id,
        createdAt: new Date("2026-06-01T09:00:00.000Z"),
      },
    }),
  ]);

  console.log("✓ Created 3 DRAFT posts");

  await Promise.all([
    prisma.post.create({
      data: {
        title: "10x Your Output Overnight (REJECTED DRAFT)",
        content:
          "MergeBoost makes you 10x faster GUARANTEED. Hack your biology like you hack your API. Side effects may include becoming a senior engineer by Tuesday.",
        mediaUrl:
          "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&q=80",
        hashtags: ["MergeBoost", "10xEngineer", "Hustle"],
        platforms: [Platform.X_TWITTER, Platform.INSTAGRAM],
        status: PostStatus.REJECTED,
        rejectionNote:
          "Too aggressive on performance claims — '10x' and 'guaranteed' will trigger platform ad policies and our legal team. Reframe around sustained focus without quantified promises.",
        authorId: creator.id,
        approverId: approver.id,
        campaignId: sprintDrop.id,
        createdAt: new Date("2026-07-15T20:00:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Roast Your Tech Stack + Win Free Cans",
        content:
          "Quote-tweet your worst legacy codebase screenshot. Most cursed stack wins 12 free cans. We reserve the right to publicly shame the winner.",
        mediaUrl:
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
        hashtags: ["MergeBoost", "TechRoast", "LegacyCode"],
        platforms: [Platform.X_TWITTER],
        status: PostStatus.REJECTED,
        rejectionNote:
          "Tone is off-brand — 'publicly shame' reads hostile, not playful. Revise the CTA to celebrate messy code with empathy. Also need official contest terms before any giveaway post.",
        authorId: creator.id,
        approverId: approver.id,
        campaignId: cyberMonday.id,
        createdAt: new Date("2026-11-22T16:20:00.000Z"),
      },
    }),
    prisma.post.create({
      data: {
        title: "Energy Drink vs MergeBoost — Fight Video",
        content:
          "TikTok concept: pit MergeBoost against [Competitor X] in a blind taste test. Loser gets deprecated. 🔥",
        mediaUrl:
          "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=1200&q=80",
        hashtags: ["MergeBoost", "TasteTest", "DevTok"],
        platforms: [Platform.TIKTOK, Platform.YOUTUBE],
        status: PostStatus.REJECTED,
        rejectionNote:
          "Cannot name or visually identify competitor products without marketing/legal clearance. Rework as a 'why we built MergeBoost differently' story — no direct comparison, no deprecate joke (confusing for non-devs).",
        authorId: creator.id,
        approverId: approver.id,
        campaignId: hackathon.id,
        createdAt: new Date("2026-05-10T14:30:00.000Z"),
      },
    }),
  ]);

  console.log("✓ Created 3 REJECTED posts with rejection notes");

  const counts = {
    users: await prisma.user.count(),
    campaigns: await prisma.campaign.count(),
    posts: await prisma.post.count(),
    analytics: await prisma.analytics.count(),
  };

  console.log("\n✅ Seed complete!");
  console.log(`   Users:     ${counts.users}`);
  console.log(`   Campaigns: ${counts.campaigns}`);
  console.log(`   Posts:     ${counts.posts}`);
  console.log(`   Analytics: ${counts.analytics}`);
  console.log(`   Admin:     ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
