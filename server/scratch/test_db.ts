import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const connectionString = "postgresql://neondb_owner:npg_gUVbCT3p1iAo@ep-wandering-shadow-aytqmxah-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: "BobSmith" },
          { email: "bobsmith@example.com" }
        ]
      }
    });

    if (!user) {
      console.log("Error: BobSmith user not found in the database!");
      return;
    }

    console.log("User found in database:");
    console.log("ID:", user.id);
    console.log("Username:", user.username);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Password Hash:", user.password);

    if (user.password) {
      const isValid = await bcrypt.compare("password123", user.password);
      console.log("Is password123 valid for this hash?", isValid);
    } else {
      console.log("Password field is null!");
    }

  } catch (error) {
    console.error("Database connection error:", error);
  } finally {
    await pool.end();
  }
}

main();
