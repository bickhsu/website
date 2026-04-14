/*
  Warnings:

  - The primary key for the `keyframe_frames` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sequence_frames` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sequence_keyframes` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "keyframe_frames" DROP CONSTRAINT "keyframe_frames_pkey",
ADD CONSTRAINT "keyframe_frames_pkey" PRIMARY KEY ("keyframe_id", "frame_id");

-- AlterTable
ALTER TABLE "sequence_frames" DROP CONSTRAINT "sequence_frames_pkey",
ADD CONSTRAINT "sequence_frames_pkey" PRIMARY KEY ("sequence_id", "frame_id");

-- AlterTable
ALTER TABLE "sequence_keyframes" DROP CONSTRAINT "sequence_keyframes_pkey",
ADD CONSTRAINT "sequence_keyframes_pkey" PRIMARY KEY ("sequence_id", "keyframe_id");
