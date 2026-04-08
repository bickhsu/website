-- CreateTable
CREATE TABLE "sequences" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "status" VARCHAR(20) DEFAULT 'To-Do',
    "problem_statement" TEXT,
    "value_delivered" TEXT,
    "title" VARCHAR(150) NOT NULL DEFAULT 'Untitled Sequence',
    "domain" "DomainEnum" DEFAULT 'General',
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyframes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR(150) NOT NULL DEFAULT 'Untitled Keyframe',
    "content" TEXT,
    "hook" TEXT,
    "domain" "DomainEnum" DEFAULT 'General',
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keyframes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frames" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "content" TEXT,
    "created_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "frames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sequence_frames" (
    "sequence_id" UUID NOT NULL,
    "frame_id" UUID NOT NULL,
    "added_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sequence_frames_pkey" PRIMARY KEY ("sequence_id","frame_id","added_at")
);

-- CreateTable
CREATE TABLE "keyframe_frames" (
    "keyframe_id" UUID NOT NULL,
    "frame_id" UUID NOT NULL,
    "added_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keyframe_frames_pkey" PRIMARY KEY ("keyframe_id","frame_id","added_at")
);

-- CreateTable
CREATE TABLE "sequence_keyframes" (
    "sequence_id" UUID NOT NULL,
    "keyframe_id" UUID NOT NULL,
    "added_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sequence_keyframes_pkey" PRIMARY KEY ("sequence_id","keyframe_id","added_at")
);

-- AddForeignKey
ALTER TABLE "sequence_frames" ADD CONSTRAINT "sequence_frames_sequence_id_fkey" FOREIGN KEY ("sequence_id") REFERENCES "sequences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_frames" ADD CONSTRAINT "sequence_frames_frame_id_fkey" FOREIGN KEY ("frame_id") REFERENCES "frames"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyframe_frames" ADD CONSTRAINT "keyframe_frames_keyframe_id_fkey" FOREIGN KEY ("keyframe_id") REFERENCES "keyframes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyframe_frames" ADD CONSTRAINT "keyframe_frames_frame_id_fkey" FOREIGN KEY ("frame_id") REFERENCES "frames"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_keyframes" ADD CONSTRAINT "sequence_keyframes_sequence_id_fkey" FOREIGN KEY ("sequence_id") REFERENCES "sequences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_keyframes" ADD CONSTRAINT "sequence_keyframes_keyframe_id_fkey" FOREIGN KEY ("keyframe_id") REFERENCES "keyframes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
