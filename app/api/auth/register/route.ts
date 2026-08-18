import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, agencyName, subdomain, password } = await req.json();

    // Validate inputs
    if (!firstName || !lastName || !email || !agencyName || !subdomain || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!cleanSubdomain) {
      return NextResponse.json({ error: "Invalid subdomain" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // Check if subdomain already exists
    const existingAgency = await prisma.agency.findFirst({
      where: { OR: [{ subdomain: cleanSubdomain }, { slug: cleanSubdomain }] }
    });
    if (existingAgency) {
      return NextResponse.json({ error: "This subdomain is already taken. Please choose another." }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Agency and Admin User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name: agencyName,
          slug: cleanSubdomain,
          subdomain: cleanSubdomain,
          billingEmail: email,
          plan: "starter",
        },
      });

      const user = await tx.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password: hashedPassword,
          role: "admin",
          agencyId: agency.id,
        },
      });

      // Create email verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await tx.verificationToken.create({
        data: {
          identifier: user.email!,
          token: verificationToken,
          expires,
        },
      });

      // In dev: log the verification link to console
      const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
      console.log("\n\n[EMAIL VERIFICATION]");
      console.log(`To: ${email}`);
      console.log(`Verification URL: ${verifyUrl}\n\n`);

      return { agency, user, verificationToken };
    });

    // Auto-seed demo clients & snapshots so the new agency is fully populated immediately
    try {
      const { seedAgencyDemoData } = await import("@/app/actions");
      await seedAgencyDemoData(cleanSubdomain);
    } catch (e) {
      console.error("Auto-seeding demo data for new agency failed:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      subdomain: cleanSubdomain,
      userId: result.user.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
  }
}

// Check subdomain availability
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subdomain = searchParams.get("subdomain");

  if (!subdomain) {
    return NextResponse.json({ available: false, error: "Subdomain required" });
  }

  const clean = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (clean.length < 3) {
    return NextResponse.json({ available: false, error: "Subdomain must be at least 3 characters" });
  }

  const reserved = ["www", "app", "api", "admin", "mail", "localhost", "rankflow", "superadmin"];
  if (reserved.includes(clean)) {
    return NextResponse.json({ available: false, error: "This subdomain is reserved" });
  }

  const existing = await prisma.agency.findFirst({
    where: { OR: [{ subdomain: clean }, { slug: clean }] }
  });

  return NextResponse.json({ available: !existing, subdomain: clean });
}
