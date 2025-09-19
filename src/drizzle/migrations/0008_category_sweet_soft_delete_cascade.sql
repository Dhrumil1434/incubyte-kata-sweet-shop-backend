-- Drop existing triggers
DROP TRIGGER IF EXISTS on_category_soft_delete;
DROP TRIGGER IF EXISTS on_category_deactivate;
DROP TRIGGER IF EXISTS on_category_reactivate;

-- Single trigger that handles both deletedAt and isActive changes
DELIMITER $$
CREATE TRIGGER on_category_status_change
AFTER UPDATE ON categories
FOR EACH ROW
BEGIN
    -- If category is soft-deleted (deletedAt changed from NULL to timestamp)
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        -- Soft-delete all sweets in this category
        UPDATE sweets 
        SET deleted_at = NOW(), is_active = false 
        WHERE category_id = NEW.id AND deleted_at IS NULL;
    END IF;
    
    -- If category is deactivated (isActive changed from true to false)
    IF OLD.is_active = true AND NEW.is_active = false AND NEW.deleted_at IS NULL THEN
        -- Deactivate all sweets in this category (but don't soft-delete them)
        UPDATE sweets 
        SET is_active = false 
        WHERE category_id = NEW.id AND deleted_at IS NULL;
    END IF;
    
    -- If category is reactivated (isActive changed from false to true and not deleted)
    IF OLD.is_active = false AND NEW.is_active = true AND NEW.deleted_at IS NULL THEN
        -- Reactivate all sweets in this category
        UPDATE sweets 
        SET is_active = true 
        WHERE category_id = NEW.id AND deleted_at IS NULL;
    END IF;
END$$
DELIMITER ;