/*
  Warnings:

  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - Added the required column `condition` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `category` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "image",
DROP COLUMN "name",
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "condition" TEXT NOT NULL,
ADD COLUMN     "dimensionHeight" DOUBLE PRECISION,
ADD COLUMN     "dimensionLength" DOUBLE PRECISION,
ADD COLUMN     "dimensionWidth" DOUBLE PRECISION,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "manualIncluded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "originalPackaging" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION,
ADD COLUMN     "workingConditionDesc" TEXT,
ADD COLUMN     "yearOfManufacture" INTEGER,
ALTER COLUMN "category" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Product_condition_idx" ON "public"."Product"("condition");

-- CreateIndex
CREATE INDEX "Product_brand_idx" ON "public"."Product"("brand");
