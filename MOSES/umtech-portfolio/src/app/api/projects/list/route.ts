import { NextResponse } from 'next/server';
import { getProjects, getLikes, getShares, getProjectComments } from '@/lib/dataStore';

export async function GET() {
  try {
    const [projects, likes, shares] = await Promise.all([
      getProjects(),
      getLikes('projects'),
      getShares('projects'),
    ]);

    // Merge dynamic counts into each project
    const enriched = await Promise.all(
      projects.map(async (project) => {
        // Get comment count for this project
        let commentCount = 0;
        try {
          const comments = await getProjectComments(project.id);
          commentCount = comments.length;
        } catch { /* ignore */ }

        return {
          ...project,
          likes: likes[project.id] ?? project.likes ?? 0,
          shares: shares[project.id] ?? project.shares ?? 0,
          comments: commentCount,
        };
      })
    );

    // Sort: pinned first, then by date desc
    enriched.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
    });

    return NextResponse.json({ projects: enriched });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
