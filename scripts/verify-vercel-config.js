#!/usr/bin/env node

/**
 * Script para verificar configuração do Vercel antes do deploy
 */

const fs = require("fs");
const path = require("path");

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${description}: ${filePath} (não encontrado)`);
    return false;
  }
}

function checkEnvVars() {
  console.log("\n🔍 Verificando variáveis de ambiente...");

  const requiredVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
  let allPresent = true;

  requiredVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: configurada`);
    } else {
      console.log(`⚠️  ${varName}: não configurada (necessária no Vercel)`);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkPackageJson() {
  console.log("\n📦 Verificando package.json...");

  try {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

    // Verificar scripts necessários
    const requiredScripts = ["build", "dev"];
    requiredScripts.forEach((script) => {
      if (pkg.scripts && pkg.scripts[script]) {
        console.log(`✅ Script "${script}": ${pkg.scripts[script]}`);
      } else {
        console.log(`❌ Script "${script}": não encontrado`);
      }
    });

    // Verificar dependências do Supabase
    const supabaseDeps = ["@supabase/supabase-js"];
    supabaseDeps.forEach((dep) => {
      if (pkg.dependencies && pkg.dependencies[dep]) {
        console.log(`✅ Dependência "${dep}": ${pkg.dependencies[dep]}`);
      } else {
        console.log(`❌ Dependência "${dep}": não encontrada`);
      }
    });

    return true;
  } catch (error) {
    console.log(`❌ Erro ao ler package.json: ${error.message}`);
    return false;
  }
}

function checkVercelConfig() {
  console.log("\n⚙️ Verificando configuração do Vercel...");

  let vercelConfigOk = checkFile("vercel.json", "Configuração do Vercel");

  if (vercelConfigOk) {
    try {
      const config = JSON.parse(fs.readFileSync("vercel.json", "utf8"));

      // Verificar rewrites para SPA
      if (config.rewrites && config.rewrites.length > 0) {
        console.log("✅ Rewrites configurados para SPA");
      } else {
        console.log(
          "⚠️  Rewrites não configurados (pode causar problemas de roteamento)",
        );
      }

      // Verificar env vars
      if (config.env) {
        console.log("✅ Variáveis de ambiente configuradas no vercel.json");
      } else {
        console.log(
          "ℹ️  Configure as variáveis de ambiente no painel do Vercel",
        );
      }
    } catch (error) {
      console.log(`❌ Erro ao ler vercel.json: ${error.message}`);
      vercelConfigOk = false;
    }
  }

  return vercelConfigOk;
}

function checkSupabaseConfig() {
  console.log("\n🗄️ Verificando configuração do Supabase...");

  const supabaseFile = "src/lib/supabase.ts";
  if (checkFile(supabaseFile, "Cliente Supabase")) {
    try {
      const content = fs.readFileSync(supabaseFile, "utf8");

      if (
        content.includes("VITE_SUPABASE_URL") &&
        content.includes("VITE_SUPABASE_ANON_KEY")
      ) {
        console.log("✅ Variáveis de ambiente referenciadas corretamente");
      } else {
        console.log("❌ Variáveis de ambiente não referenciadas corretamente");
      }

      if (content.includes("createClient")) {
        console.log("✅ Cliente Supabase configurado");
      } else {
        console.log("❌ Cliente Supabase não configurado");
      }

      return true;
    } catch (error) {
      console.log(`❌ Erro ao ler ${supabaseFile}: ${error.message}`);
      return false;
    }
  }

  return false;
}

function printDeploymentInstructions() {
  console.log("\n🚀 Instruções para deploy no Vercel:");
  console.log("1. Conecte seu repositório no Vercel Dashboard");
  console.log("2. Configure as variáveis de ambiente:");
  console.log("   - VITE_SUPABASE_URL");
  console.log("   - VITE_SUPABASE_ANON_KEY");
  console.log("3. Configure no Supabase (CORS):");
  console.log("   - Adicione o domínio do Vercel nas configurações de CORS");
  console.log("   - Settings > API > CORS origins");
  console.log("4. Faça o deploy!");
  console.log("\n📖 Documentação completa: VERCEL_DEPLOYMENT.md");
}

function main() {
  console.log("🔍 Verificando configuração para deploy no Vercel...\n");

  const checks = [
    checkPackageJson(),
    checkVercelConfig(),
    checkSupabaseConfig(),
    checkEnvVars(),
  ];

  const allPassed = checks.every((check) => check);

  console.log("\n" + "=".repeat(50));

  if (allPassed) {
    console.log("🎉 Todas as verificações passaram!");
    console.log("✅ Projeto pronto para deploy no Vercel");
  } else {
    console.log("⚠️  Algumas verificações falharam");
    console.log("📋 Revise os itens marcados com ❌ antes do deploy");
  }

  printDeploymentInstructions();
}

if (require.main === module) {
  main();
}

module.exports = {
  checkFile,
  checkEnvVars,
  checkPackageJson,
  checkVercelConfig,
  checkSupabaseConfig,
};
