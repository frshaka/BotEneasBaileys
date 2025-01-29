-- CreateTable
CREATE TABLE "erp_players" (
    "id" INTEGER NOT NULL,
    "nick" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "erp_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_gvg" (
    "id" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "isGvg" BOOLEAN NOT NULL DEFAULT false,
    "fixed" BOOLEAN NOT NULL DEFAULT false,
    "rotation" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "erp_gvg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_relics_team" (
    "id" TEXT NOT NULL,
    "team" TEXT NOT NULL,

    CONSTRAINT "erp_relics_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_relics_players_team" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "erp_relics_players_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_relics_dmg" (
    "id" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "playerTeamId" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "boss" TEXT NOT NULL,
    "damage" VARCHAR(50) NOT NULL,

    CONSTRAINT "erp_relics_dmg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" SERIAL NOT NULL,
    "groupId" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "content" TEXT,
    "links" TEXT[],
    "sentiment" VARCHAR(50),

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentimentos" (
    "word" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "sentimentos_pkey" PRIMARY KEY ("word")
);

-- CreateIndex
CREATE UNIQUE INDEX "erp_players_phone_key" ON "erp_players"("phone");

-- AddForeignKey
ALTER TABLE "erp_gvg" ADD CONSTRAINT "erp_gvg_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "erp_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_relics_players_team" ADD CONSTRAINT "erp_relics_players_team_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "erp_relics_team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_relics_players_team" ADD CONSTRAINT "erp_relics_players_team_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "erp_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_relics_dmg" ADD CONSTRAINT "erp_relics_dmg_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "erp_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "erp_relics_dmg" ADD CONSTRAINT "erp_relics_dmg_playerTeamId_fkey" FOREIGN KEY ("playerTeamId") REFERENCES "erp_relics_players_team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
