-- AlterTable
ALTER TABLE `students` ADD COLUMN `entry_school_year_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_entry_school_year_id_fkey` FOREIGN KEY (`entry_school_year_id`) REFERENCES `school_years`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
