-- CreateTable
CREATE TABLE "State" (
    "id" INTEGER NOT NULL,
    "acronym" TEXT NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "idState" INTEGER NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityHoliday" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "idCity" INTEGER NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "CityHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StateHoliday" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "idState" INTEGER NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "StateHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_idState_fkey" FOREIGN KEY ("idState") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityHoliday" ADD CONSTRAINT "CityHoliday_idCity_fkey" FOREIGN KEY ("idCity") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StateHoliday" ADD CONSTRAINT "StateHoliday_idState_fkey" FOREIGN KEY ("idState") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
