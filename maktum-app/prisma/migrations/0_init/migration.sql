-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "title" TEXT,
    "altText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IconLibrary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT,
    "svgCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "password" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "firstName" TEXT,
    "lastName" TEXT,
    "gender" TEXT,
    "birthYear" TEXT,
    "province" TEXT,
    "city" TEXT,
    "educationDegree" TEXT,
    "major" TEXT,
    "artResearchField" TEXT,
    "cooperationInterests" TEXT,
    "email" TEXT,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "adminPermissions" TEXT,
    "adminPassword" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'BULK',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "triggerEvent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sendInApp" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT,
    "bodyHtml" TEXT,
    "themeColor" TEXT,
    "iconUrl" TEXT,
    "coverUrl" TEXT,
    "ctaButtons" TEXT,
    "sendSms" BOOLEAN NOT NULL DEFAULT false,
    "smsText" TEXT,
    "targetCount" INTEGER NOT NULL DEFAULT 0,
    "smsSentCount" INTEGER NOT NULL DEFAULT 0,
    "smsFailCount" INTEGER NOT NULL DEFAULT 0,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DownloadHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "downloadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DownloadHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DownloadHistory_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Taxonomy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "preTitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Dossier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "hubCoverDesktop" TEXT,
    "hubCoverMobile" TEXT,
    "isVisibleInHub" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "layoutSize" TEXT DEFAULT 'STANDARD',
    "preTitle" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverDesktop" TEXT,
    "coverMobile" TEXT,
    "themeColor" TEXT DEFAULT '#06b6d4',
    "gradientFrom" TEXT DEFAULT '#06b6d4',
    "gradientTo" TEXT DEFAULT '#d946ef',
    "titleGradientStart" TEXT DEFAULT '#ffffff',
    "titleGradientEnd" TEXT DEFAULT '#ffffff',
    "preTitleColor" TEXT DEFAULT '#a3a3a3',
    "descColor" TEXT DEFAULT '#d1d5db',
    "showRadar" BOOLEAN NOT NULL DEFAULT true,
    "radarTitle" TEXT DEFAULT 'رادار موضوعی پرونده',
    "showCreators" BOOLEAN NOT NULL DEFAULT true,
    "creatorsTitle" TEXT DEFAULT 'اشخاص و پدیدآورندگان مرتبط',
    "showTipLine" BOOLEAN NOT NULL DEFAULT true,
    "tipPreTitle" TEXT DEFAULT 'پورتال ارتباط امن',
    "tipTitle" TEXT DEFAULT 'سندی در دست دارید؟',
    "tipDesc" TEXT,
    "tipBtnText" TEXT DEFAULT 'ارسال امن سند',
    "tipBtnLink" TEXT DEFAULT '#',
    "tipBtnIcon" TEXT DEFAULT 'upload',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleBase" TEXT NOT NULL,
    "titleHighlight" TEXT,
    "subtitle" TEXT,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "coverDesktop" TEXT,
    "coverMobile" TEXT,
    "publishedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "readTime" TEXT,
    "ageRating" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "displaySettings" TEXT,
    "body" TEXT,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "lead" TEXT,
    "formats" TEXT,
    "previews" TEXT,
    "previewGallery" TEXT,
    "fileSpecs" TEXT,
    "changelog" TEXT,
    "downloadLinks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminReply" TEXT,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OtpLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "isSuccess" BOOLEAN NOT NULL DEFAULT true,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "errorMsg" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_DossierTaxonomies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DossierTaxonomies_A_fkey" FOREIGN KEY ("A") REFERENCES "Dossier" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DossierTaxonomies_B_fkey" FOREIGN KEY ("B") REFERENCES "Taxonomy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ContentCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ContentCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContentCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Taxonomy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ContentCreators" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ContentCreators_A_fkey" FOREIGN KEY ("A") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContentCreators_B_fkey" FOREIGN KEY ("B") REFERENCES "Taxonomy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ContentTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ContentTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContentTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Taxonomy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DossierContents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DossierContents_A_fkey" FOREIGN KEY ("A") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DossierContents_B_fkey" FOREIGN KEY ("B") REFERENCES "Dossier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "Setting_group_idx" ON "Setting"("group");

-- CreateIndex
CREATE INDEX "Media_fileType_createdAt_idx" ON "Media"("fileType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Media_mimeType_idx" ON "Media"("mimeType");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "IconLibrary_name_key" ON "IconLibrary"("name");

-- CreateIndex
CREATE INDEX "IconLibrary_label_idx" ON "IconLibrary"("label");

-- CreateIndex
CREATE UNIQUE INDEX "OtpCode_phone_key" ON "OtpCode"("phone");

-- CreateIndex
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- CreateIndex
CREATE INDEX "OtpCode_createdAt_idx" ON "OtpCode"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_status_createdAt_idx" ON "User"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "User_isAdmin_isSuperAdmin_idx" ON "User"("isAdmin", "isSuperAdmin");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_province_city_idx" ON "User"("province", "city");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_triggerEvent_key" ON "Notification"("triggerEvent");

-- CreateIndex
CREATE INDEX "Notification_type_isActive_createdAt_idx" ON "Notification"("type", "isActive", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_isTemplate_isActive_idx" ON "Notification"("isTemplate", "isActive");

-- CreateIndex
CREATE INDEX "UserNotification_userId_isRead_createdAt_idx" ON "UserNotification"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserNotification_notificationId_idx" ON "UserNotification"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotification_userId_notificationId_key" ON "UserNotification"("userId", "notificationId");

-- CreateIndex
CREATE INDEX "Favorite_userId_createdAt_idx" ON "Favorite"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Favorite_contentId_idx" ON "Favorite"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_contentId_key" ON "Favorite"("userId", "contentId");

-- CreateIndex
CREATE INDEX "DownloadHistory_userId_contentId_downloadedAt_idx" ON "DownloadHistory"("userId", "contentId", "downloadedAt" DESC);

-- CreateIndex
CREATE INDEX "DownloadHistory_userId_downloadedAt_idx" ON "DownloadHistory"("userId", "downloadedAt" DESC);

-- CreateIndex
CREATE INDEX "DownloadHistory_contentId_downloadedAt_idx" ON "DownloadHistory"("contentId", "downloadedAt" DESC);

-- CreateIndex
CREATE INDEX "DownloadHistory_downloadedAt_idx" ON "DownloadHistory"("downloadedAt");

-- CreateIndex
CREATE INDEX "Taxonomy_slug_idx" ON "Taxonomy"("slug");

-- CreateIndex
CREATE INDEX "Taxonomy_type_createdAt_idx" ON "Taxonomy"("type", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Taxonomy_type_name_key" ON "Taxonomy"("type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Taxonomy_type_slug_key" ON "Taxonomy"("type", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Dossier_slug_key" ON "Dossier"("slug");

-- CreateIndex
CREATE INDEX "Dossier_status_isVisibleInHub_orderIndex_publishedAt_idx" ON "Dossier"("status", "isVisibleInHub", "orderIndex" ASC, "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Dossier_status_publishedAt_idx" ON "Dossier"("status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Dossier_viewCount_idx" ON "Dossier"("viewCount" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");

-- CreateIndex
CREATE INDEX "Content_status_type_publishedAt_idx" ON "Content"("status", "type", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Content_status_publishedAt_idx" ON "Content"("status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Content_status_viewCount_idx" ON "Content"("status", "viewCount" DESC);

-- CreateIndex
CREATE INDEX "Content_type_status_viewCount_idx" ON "Content"("type", "status", "viewCount" DESC);

-- CreateIndex
CREATE INDEX "Content_createdAt_idx" ON "Content"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Content_titleBase_idx" ON "Content"("titleBase");

-- CreateIndex
CREATE INDEX "Comment_contentId_status_createdAt_idx" ON "Comment"("contentId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Comment_status_createdAt_idx" ON "Comment"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Comment_userId_createdAt_idx" ON "Comment"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SearchLog_keyword_createdAt_idx" ON "SearchLog"("keyword", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SearchLog_userId_createdAt_idx" ON "SearchLog"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SearchLog_resultsCount_idx" ON "SearchLog"("resultsCount");

-- CreateIndex
CREATE INDEX "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");

-- CreateIndex
CREATE INDEX "OtpLog_phone_createdAt_idx" ON "OtpLog"("phone", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "OtpLog_purpose_isSuccess_createdAt_idx" ON "OtpLog"("purpose", "isSuccess", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "OtpLog_createdAt_idx" ON "OtpLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_DossierTaxonomies_AB_unique" ON "_DossierTaxonomies"("A", "B");

-- CreateIndex
CREATE INDEX "_DossierTaxonomies_B_index" ON "_DossierTaxonomies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContentCategories_AB_unique" ON "_ContentCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_ContentCategories_B_index" ON "_ContentCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContentCreators_AB_unique" ON "_ContentCreators"("A", "B");

-- CreateIndex
CREATE INDEX "_ContentCreators_B_index" ON "_ContentCreators"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContentTags_AB_unique" ON "_ContentTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ContentTags_B_index" ON "_ContentTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DossierContents_AB_unique" ON "_DossierContents"("A", "B");

-- CreateIndex
CREATE INDEX "_DossierContents_B_index" ON "_DossierContents"("B");

