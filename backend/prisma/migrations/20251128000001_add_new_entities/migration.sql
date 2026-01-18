-- CreateTable: AgeCategory
CREATE TABLE "AgeCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Role (EmployeeRole reference table)
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Subtitle
CREATE TABLE "Subtitle" (
    "id" TEXT NOT NULL,
    "titleId" TEXT,
    "episodeId" TEXT,
    "languageCode" TEXT NOT NULL,
    "languageName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'SRT',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subtitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgeCategory_code_key" ON "AgeCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex for Subtitle
-- Note: Unique constraint on nullable columns handled via application logic
-- For titles (films): ensure unique languageCode per titleId
-- For episodes: ensure unique languageCode per episodeId
CREATE UNIQUE INDEX "Subtitle_title_lang_unique" ON "Subtitle"("titleId", "languageCode") WHERE "episodeId" IS NULL;
CREATE UNIQUE INDEX "Subtitle_episode_lang_unique" ON "Subtitle"("episodeId", "languageCode") WHERE "episodeId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "Subtitle" ADD CONSTRAINT "Subtitle_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtitle" ADD CONSTRAINT "Subtitle_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add new columns to Profile for AgeCategory relation (optional, keeping enum for backward compatibility)
ALTER TABLE "Profile" ADD COLUMN "ageCategoryId" TEXT;

-- AddForeignKey for Profile -> AgeCategory
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_ageCategoryId_fkey" FOREIGN KEY ("ageCategoryId") REFERENCES "AgeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add new columns to Title for AgeCategory relation (optional, keeping enum for backward compatibility)
ALTER TABLE "Title" ADD COLUMN "minAgeCategoryId" TEXT;

-- AddForeignKey for Title -> AgeCategory
ALTER TABLE "Title" ADD CONSTRAINT "Title_minAgeCategoryId_fkey" FOREIGN KEY ("minAgeCategoryId") REFERENCES "AgeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add new column to Employee for Role relation (optional, keeping enum for backward compatibility)
ALTER TABLE "Employee" ADD COLUMN "roleId" TEXT;

-- AddForeignKey for Employee -> Role
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed AgeCategory data
INSERT INTO "AgeCategory" ("id", "code", "name", "description", "minAge", "maxAge", "createdAt", "updatedAt") VALUES
('age-kids', 'KIDS', 'Kids', 'Content suitable for children', 0, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('age-teen', 'TEEN', 'Teen', 'Content suitable for teenagers', 13, 17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('age-adult', 'ADULT', 'Adult', 'Content suitable for adults', 18, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Role data
INSERT INTO "Role" ("id", "code", "name", "description", "level", "permissions", "createdAt", "updatedAt") VALUES
('role-junior', 'JUNIOR', 'Junior Employee', 'Junior level access', 1, ARRAY['view_accounts'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role-mid', 'MID', 'Mid-level Employee', 'Mid-level access with account management', 2, ARRAY['view_accounts', 'manage_accounts'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role-senior', 'SENIOR', 'Senior Employee', 'Full access including financial data', 3, ARRAY['view_accounts', 'manage_accounts', 'view_finance', 'view_history'], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

