-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subdomain" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "billingEmail" TEXT,
    "customDomain" TEXT,
    "serankingApiKey" TEXT,
    "brandingJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "agencyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "industry" TEXT,
    "notes" TEXT,
    "contactEmail" TEXT,
    "contactName" TEXT,
    "logo" TEXT,
    "serankingProjectId" INTEGER,
    "agencyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SERankingProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serankingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SERankingProject_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KeywordSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "serankingProjectId" TEXT NOT NULL,
    "top3Count" INTEGER NOT NULL DEFAULT 0,
    "top10Count" INTEGER NOT NULL DEFAULT 0,
    "top30Count" INTEGER NOT NULL DEFAULT 0,
    "top100Count" INTEGER NOT NULL DEFAULT 0,
    "totalKeywords" INTEGER NOT NULL DEFAULT 0,
    "avgPosition" REAL,
    "positionsJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KeywordSnapshot_serankingProjectId_fkey" FOREIGN KEY ("serankingProjectId") REFERENCES "SERankingProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BacklinkSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "serankingProjectId" TEXT NOT NULL,
    "domainTrust" INTEGER,
    "totalBacklinks" INTEGER NOT NULL DEFAULT 0,
    "newBacklinks" INTEGER NOT NULL DEFAULT 0,
    "lostBacklinks" INTEGER NOT NULL DEFAULT 0,
    "referringDomains" INTEGER NOT NULL DEFAULT 0,
    "dofollowLinks" INTEGER NOT NULL DEFAULT 0,
    "nofollowLinks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BacklinkSnapshot_serankingProjectId_fkey" FOREIGN KEY ("serankingProjectId") REFERENCES "SERankingProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "serankingProjectId" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL DEFAULT 0,
    "pagesCrawled" INTEGER NOT NULL DEFAULT 0,
    "criticalIssues" INTEGER NOT NULL DEFAULT 0,
    "warningIssues" INTEGER NOT NULL DEFAULT 0,
    "noticeIssues" INTEGER NOT NULL DEFAULT 0,
    "issuesJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditSnapshot_serankingProjectId_fkey" FOREIGN KEY ("serankingProjectId") REFERENCES "SERankingProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticsSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "serankingProjectId" TEXT NOT NULL,
    "organicSessions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" REAL,
    "avgPosition" REAL,
    "topQueriesJson" TEXT,
    "topPagesJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsSnapshot_serankingProjectId_fkey" FOREIGN KEY ("serankingProjectId") REFERENCES "SERankingProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sectionsJson" TEXT,
    "pdfUrl" TEXT,
    "aiRecsJson" TEXT,
    "shareSlug" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" DATETIME,
    "generatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Report_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agencyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "dayOfMonth" INTEGER NOT NULL DEFAULT 1,
    "autoSend" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" DATETIME,
    "nextRunAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReportSchedule_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReportSchedule_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "acceptedAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invitation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_subdomain_key" ON "Agency"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "SERankingProject_serankingId_key" ON "SERankingProject"("serankingId");

-- CreateIndex
CREATE UNIQUE INDEX "SERankingProject_clientId_key" ON "SERankingProject"("clientId");

-- CreateIndex
CREATE INDEX "KeywordSnapshot_serankingProjectId_date_idx" ON "KeywordSnapshot"("serankingProjectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "KeywordSnapshot_serankingProjectId_date_key" ON "KeywordSnapshot"("serankingProjectId", "date");

-- CreateIndex
CREATE INDEX "BacklinkSnapshot_serankingProjectId_date_idx" ON "BacklinkSnapshot"("serankingProjectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "BacklinkSnapshot_serankingProjectId_date_key" ON "BacklinkSnapshot"("serankingProjectId", "date");

-- CreateIndex
CREATE INDEX "AuditSnapshot_serankingProjectId_date_idx" ON "AuditSnapshot"("serankingProjectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AuditSnapshot_serankingProjectId_date_key" ON "AuditSnapshot"("serankingProjectId", "date");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_serankingProjectId_date_idx" ON "AnalyticsSnapshot"("serankingProjectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsSnapshot_serankingProjectId_date_key" ON "AnalyticsSnapshot"("serankingProjectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Report_shareSlug_key" ON "Report"("shareSlug");

-- CreateIndex
CREATE INDEX "Report_clientId_periodStart_idx" ON "Report"("clientId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "ReportSchedule_clientId_key" ON "ReportSchedule"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");
