-- Add manager_id to branches table
ALTER TABLE public.branches 
ADD COLUMN manager_id text;

-- Add index for better performance
CREATE INDEX idx_branches_manager_id ON public.branches(manager_id);