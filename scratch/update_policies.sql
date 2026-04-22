-- Actualizar política para que los admins puedan ver todos los perfiles
CREATE POLICY "Admins pueden ver todos los perfiles"
ON public.perfiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'admin'
  )
);

-- Política para que los admins puedan actualizar perfiles (para cambiar roles)
CREATE POLICY "Admins pueden actualizar perfiles"
ON public.perfiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'admin'
  )
);
