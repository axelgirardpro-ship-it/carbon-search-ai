-- Supprimer temporairement les politiques qui dépendent des colonnes à modifier
DROP POLICY IF EXISTS "Users can create datasets in their companies" ON public.datasets;
DROP POLICY IF EXISTS "Users can update datasets in their companies" ON public.datasets;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in their companies" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage workspace invitations" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Workspace owners can manage invitations" ON public.workspace_invitations;

-- Créer les types ENUM pour les dropdowns
CREATE TYPE public.user_role_type AS ENUM ('admin', 'gestionnaire', 'lecteur', 'supra_admin');
CREATE TYPE public.plan_type AS ENUM ('freemium', 'standard', 'premium');
CREATE TYPE public.import_status_type AS ENUM ('processing', 'completed', 'failed');
CREATE TYPE public.dataset_status_type AS ENUM ('active', 'inactive');
CREATE TYPE public.invitation_status_type AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE public.favorite_item_type AS ENUM ('emission_factor', 'search', 'dataset');
CREATE TYPE public.audit_action_type AS ENUM ('user_signup', 'user_login', 'user_logout', 'user_signup_error', 'data_import', 'data_export', 'role_assigned', 'workspace_created', 'invitation_sent', 'invitation_accepted');

-- Modifier les colonnes pour utiliser les ENUMs
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE public.user_role_type 
USING role::public.user_role_type;

ALTER TABLE public.workspaces 
ALTER COLUMN plan_type TYPE public.plan_type 
USING plan_type::public.plan_type;

ALTER TABLE public.search_quotas 
ALTER COLUMN plan_type TYPE public.plan_type 
USING plan_type::public.plan_type;

ALTER TABLE public.users 
ALTER COLUMN plan_type TYPE public.plan_type 
USING plan_type::public.plan_type;

ALTER TABLE public.data_imports 
ALTER COLUMN status TYPE public.import_status_type 
USING status::public.import_status_type;

ALTER TABLE public.datasets 
ALTER COLUMN status TYPE public.dataset_status_type 
USING status::public.dataset_status_type;

ALTER TABLE public.workspace_invitations 
ALTER COLUMN status TYPE public.invitation_status_type 
USING status::public.invitation_status_type;

ALTER TABLE public.workspace_invitations 
ALTER COLUMN role TYPE public.user_role_type 
USING role::public.user_role_type;

ALTER TABLE public.favorites 
ALTER COLUMN item_type TYPE public.favorite_item_type 
USING item_type::public.favorite_item_type;

ALTER TABLE public.audit_logs 
ALTER COLUMN action TYPE public.audit_action_type 
USING action::public.audit_action_type;

-- Recréer les politiques RLS
CREATE POLICY "Users can create datasets in their companies" ON public.datasets
FOR INSERT WITH CHECK (
  (user_id = auth.uid()) AND 
  ((company_id IS NULL) OR (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.workspace_id = datasets.company_id 
    AND user_roles.role = ANY (ARRAY['admin'::public.user_role_type, 'gestionnaire'::public.user_role_type])
  )))
);

CREATE POLICY "Users can update datasets in their companies" ON public.datasets
FOR UPDATE USING (
  (user_id = auth.uid()) OR (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.workspace_id = datasets.company_id 
    AND user_roles.role = ANY (ARRAY['admin'::public.user_role_type, 'gestionnaire'::public.user_role_type])
  ))
);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL USING (
  is_company_owner(workspace_id) OR 
  (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.user_role_type))
);

CREATE POLICY "Users can view roles in their companies" ON public.user_roles
FOR SELECT USING (
  (user_id = auth.uid()) OR 
  is_company_owner(workspace_id) OR 
  (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.user_role_type))
);

CREATE POLICY "Admins can manage workspace invitations" ON public.workspace_invitations
FOR ALL USING (
  workspace_id IN (
    SELECT user_roles.workspace_id FROM user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::public.user_role_type
  )
) WITH CHECK (
  workspace_id IN (
    SELECT user_roles.workspace_id FROM user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::public.user_role_type
  )
);

CREATE POLICY "Workspace owners can manage invitations" ON public.workspace_invitations
FOR ALL USING (
  workspace_id IN (
    SELECT workspaces.id FROM workspaces 
    WHERE workspaces.owner_id = auth.uid()
  )
) WITH CHECK (
  workspace_id IN (
    SELECT workspaces.id FROM workspaces 
    WHERE workspaces.owner_id = auth.uid()
  )
);

-- Ajouter axelgirard.pro+dev@gmail.com en supra admin
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'axelgirard.pro+dev@gmail.com';
    
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, workspace_id, role, assigned_by)
        VALUES (target_user_id, NULL, 'supra_admin'::public.user_role_type, target_user_id)
        ON CONFLICT (user_id, COALESCE(workspace_id, '00000000-0000-0000-0000-000000000000'::uuid), role) DO NOTHING;
        
        INSERT INTO public.audit_logs (user_id, action, details)
        VALUES (
            target_user_id,
            'role_assigned'::public.audit_action_type,
            jsonb_build_object(
                'role', 'supra_admin',
                'assigned_by_system', true,
                'email', 'axelgirard.pro+dev@gmail.com'
            )
        );
    END IF;
END $$;