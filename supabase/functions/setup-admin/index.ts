import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Criar o usuário admin no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'josiasoliveiraux@gmail.com',
      password: '@Luluzinha78',
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        full_name: 'Administrador'
      }
    })

    if (authError) {
      throw authError
    }

    if (!authData.user) {
      throw new Error('Falha ao criar usuário')
    }

    // Atribuir role de admin ao usuário
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'admin'
      })

    if (roleError) {
      // Se o usuário já tem a role, não é erro
      if (roleError.code !== '23505') {
        throw roleError
      }
    }

    console.log('Admin criado com sucesso:', authData.user.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin criado com sucesso',
        userId: authData.user.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro ao criar admin:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Verifique se o usuário já existe ou se as credenciais estão corretas'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
