-- 1. Agregar columna email a perfiles
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Actualizar función del trigger para incluir email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (id, rol, email)
  VALUES (new.id, 'cajero', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Actualizar perfiles existentes (si los hay)
-- Nota: Esto solo funciona si se corre manualmente o si se tiene acceso a auth.users
UPDATE public.perfiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;
