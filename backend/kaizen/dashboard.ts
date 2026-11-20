
import { api } from "encore.dev/api";
import { db } from "./db";

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  teamMembers: number;
  completedTasks: number;
}

export const getDashboardStats = api(
  { method: "GET", path: "/dashboard/stats", expose: true },
  async (): Promise<DashboardStats> => {
    const projects = await db.queryRow<{ count: number }>`
      SELECT COUNT(*)::int AS count FROM projects
    `;

    const tasks = await db.queryRow<{ count: number }>`
      SELECT COUNT(*)::int AS count FROM tasks
    `;

    const members = await db.queryRow<{ count: number }>`
      SELECT COUNT(*)::int AS count FROM users
    `;

    const completed = await db.queryRow<{ count: number }>`
      SELECT COUNT(*)::int AS count
      FROM tasks
      WHERE status = 'Done'
    `;

    return {
      totalProjects: projects?.count ?? 0,
      totalTasks: tasks?.count ?? 0,
      teamMembers: members?.count ?? 0,
      completedTasks: completed?.count ?? 0,
    };
  }
);
