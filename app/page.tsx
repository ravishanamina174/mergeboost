import { getPosts } from "@/src/app/actions/postActions";
import { ContentDashboard } from "@/src/components/dashboard/ContentDashboard";

export default async function Home() {
  const posts = await getPosts();

  return <ContentDashboard posts={posts} />;
}
