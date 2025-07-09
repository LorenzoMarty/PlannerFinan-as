import { supabase } from "./supabase";
import { SupabaseDataService } from "@/services/SupabaseDataService";

export async function setupDemoUsers() {
  const demoUsers = [
    {
      email: "demo@plannerfin.com",
      password: "123456",
      name: "Usuário Demo",
      profileData: {
        bio: "Usuário de demonstração do PlannerFin",
        phone: "(11) 99999-9999",
        location: "São Paulo, SP",
      },
    },
    {
      email: "admin@plannerfin.com",
      password: "admin123",
      name: "Administrador",
      profileData: {
        bio: "Administrador do sistema PlannerFin",
        phone: "(11) 98888-8888",
        location: "Rio de Janeiro, RJ",
      },
    },
  ];

  console.log("🚀 Configurando usuários demo...");

  for (const user of demoUsers) {
    try {
      console.log(`📝 Criando usuário: ${user.email}`);

      // Tentar fazer login primeiro para ver se o usuário já existe
      const { data: existingSession, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password,
        });

      if (existingSession?.user) {
        console.log(`✅ Usuário ${user.email} já existe`);
        continue;
      }

      // Se login falhou, criar novo usuário
      if (loginError?.message.includes("Invalid login credentials")) {
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              name: user.name,
            },
          },
        });

        if (error) {
          console.error(`❌ Erro ao criar ${user.email}:`, error.message);
          continue;
        }

        if (data.user) {
          console.log(`✅ Usuário ${user.email} criado com sucesso`);

          // Se o usuário foi criado, fazer login para configurar o perfil
          const { data: loginData, error: loginError } =
            await supabase.auth.signInWithPassword({
              email: user.email,
              password: user.password,
            });

          if (loginData?.user) {
            // Criar perfil no banco
            await SupabaseDataService.createUserProfile({
              id: loginData.user.id,
              email: user.email,
              name: user.name,
            });

            // Atualizar com dados extras
            await SupabaseDataService.updateUserProfile(
              loginData.user.id,
              user.profileData,
            );

            console.log(`📋 Perfil criado para ${user.email}`);
          }
        }
      } else {
        console.error(
          `❌ Erro inesperado para ${user.email}:`,
          loginError?.message,
        );
      }
    } catch (error) {
      console.error(`❌ Erro geral para ${user.email}:`, error);
    }
  }

  // Fazer logout no final
  await supabase.auth.signOut();
  console.log("🎉 Configuração de usuários demo concluída!");
}

// Função para resetar dados demo
export async function resetDemoData() {
  console.log("🧹 Resetando dados demo...");

  const demoEmails = ["demo@plannerfin.com", "admin@plannerfin.com"];

  for (const email of demoEmails) {
    try {
      // Login temporário para obter ID do usuário
      const { data: session, error } = await supabase.auth.signInWithPassword({
        email,
        password: email.includes("demo") ? "123456" : "admin123",
      });

      if (session?.user) {
        const userId = session.user.id;

        // Deletar dados relacionados
        await supabase.from("budget_entries").delete().eq("user_id", userId);
        await supabase.from("categories").delete().eq("user_id", userId);
        await supabase.from("budgets").delete().eq("owner_id", userId);
        await supabase.from("user_profiles").delete().eq("id", userId);

        console.log(`🗑️ Dados resetados para ${email}`);
      }
    } catch (error) {
      console.log(`⚠️ Usuário ${email} não existe ou erro ao resetar`);
    }
  }

  await supabase.auth.signOut();
  console.log("✅ Reset concluído!");
}
