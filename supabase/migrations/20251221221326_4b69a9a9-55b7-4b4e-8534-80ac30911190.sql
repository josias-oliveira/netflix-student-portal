-- Criar bucket público para certificados
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true);

-- Política: Admins podem fazer upload de templates
CREATE POLICY "Admins can upload certificate templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificates' 
  AND has_role(auth.uid(), 'admin')
);

-- Política: Admins podem atualizar templates
CREATE POLICY "Admins can update certificate templates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'certificates' 
  AND has_role(auth.uid(), 'admin')
);

-- Política: Admins podem deletar arquivos
CREATE POLICY "Admins can delete certificate files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'certificates' 
  AND has_role(auth.uid(), 'admin')
);

-- Política: Qualquer pessoa pode ver certificados (para validação)
CREATE POLICY "Anyone can view certificates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'certificates');