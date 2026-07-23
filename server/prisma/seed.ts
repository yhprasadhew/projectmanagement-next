import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const pool = new pg.Pool({ connectionString: process.env.DIRECT_DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function deleteAllData() {
  try {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "Team", "User", "Project", "ProjectTeam", "Task", "Attachment", "Comment", "TaskAssignment" RESTART IDENTITY CASCADE;`
    );
    console.log("All tables truncated and identities restarted successfully");
  } catch (error) {
    console.error("Error truncating data:", error);
    try {
      await prisma.team.updateMany({
        data: {
          productOwnerUserId: null,
          projectManagerUserId: null,
        },
      });
      await prisma.taskAssignment.deleteMany({});
      await prisma.comment.deleteMany({});
      await prisma.attachment.deleteMany({});
      await prisma.task.deleteMany({});
      await prisma.projectTeam.deleteMany({});
      await prisma.project.deleteMany({});
      await prisma.user.deleteMany({});
      await prisma.team.deleteMany({});
      console.log("All data cleared via deleteMany fallback");
    } catch (e) {
      console.error("Fallback deletion failed:", e);
    }
  }
}

async function main() {
  const dataDirectory = path.join(
    process.cwd(),
    "prisma",
    "seedData",
  );

  await deleteAllData();

  // 1. Seed Team (without circular references initially)
  const teamFilePath = path.join(dataDirectory, "team.json");
  const teamData = JSON.parse(fs.readFileSync(teamFilePath, "utf-8"));
  for (const team of teamData) {
    await prisma.team.create({
      data: {
        teamName: team.teamName,
      },
    });
  }
  console.log("Seeded Team (without circular references)");

  // 2. Seed Project
  const projectFilePath = path.join(dataDirectory, "project.json");
  const projectData = JSON.parse(fs.readFileSync(projectFilePath, "utf-8"));
  for (const project of projectData) {
    await prisma.project.create({ data: project });
  }
  console.log("Seeded Project");

  // 3. Seed User
  const userFilePath = path.join(dataDirectory, "user.json");
  const userData = JSON.parse(fs.readFileSync(userFilePath, "utf-8"));
  for (const user of userData) {
    await prisma.user.create({ data: user });
  }
  console.log("Seeded User");

  // 4. Seed ProjectTeam
  const projectTeamFilePath = path.join(dataDirectory, "projectTeam.json");
  const projectTeamData = JSON.parse(fs.readFileSync(projectTeamFilePath, "utf-8"));
  for (const pt of projectTeamData) {
    await prisma.projectTeam.create({ data: pt });
  }
  console.log("Seeded ProjectTeam");

  // 5. Seed Task
  const taskFilePath = path.join(dataDirectory, "task.json");
  const taskData = JSON.parse(fs.readFileSync(taskFilePath, "utf-8"));
  for (const task of taskData) {
    await prisma.task.create({ data: task });
  }
  console.log("Seeded Task");

  // 6. Seed Attachment
  const attachmentFilePath = path.join(dataDirectory, "attachment.json");
  const attachmentData = JSON.parse(fs.readFileSync(attachmentFilePath, "utf-8"));
  for (const attachment of attachmentData) {
    await prisma.attachment.create({ data: attachment });
  }
  console.log("Seeded Attachment");

  // 7. Seed Comment
  const commentFilePath = path.join(dataDirectory, "comment.json");
  const commentData = JSON.parse(fs.readFileSync(commentFilePath, "utf-8"));
  for (const comment of commentData) {
    await prisma.comment.create({ data: comment });
  }
  console.log("Seeded Comment");

  // 8. Seed TaskAssignment
  const taskAssignmentFilePath = path.join(dataDirectory, "taskAssignment.json");
  const taskAssignmentData = JSON.parse(fs.readFileSync(taskAssignmentFilePath, "utf-8"));
  for (const ta of taskAssignmentData) {
    await prisma.taskAssignment.create({ data: ta });
  }
  console.log("Seeded TaskAssignment");

  // 9. Update Team circular references now that Users are seeded
  for (const team of teamData) {
    await prisma.team.update({
      where: { teamName: team.teamName },
      data: {
        productOwnerUserId: team.productOwnerUserId,
        projectManagerUserId: team.projectManagerUserId,
      },
    });
  }
  console.log("Updated Team circular references");

  // 10. Reset identity sequences for all tables that were seeded with explicit IDs
  console.log("Resetting identity sequences...");
  const tables = [
    "Team",
    "Project",
    "User",
    "ProjectTeam",
    "Task",
    "Attachment",
    "Comment",
    "TaskAssignment",
  ];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(max(id), 1)) FROM "${table}";`
    );
  }
  console.log("Identity sequences reset successfully");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());