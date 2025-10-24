ALTER TABLE "flowExecution" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "flowExecution_id_seq";
ALTER TABLE "flowExecution" ALTER COLUMN "id" SET DATA TYPE integer USING id::integer;