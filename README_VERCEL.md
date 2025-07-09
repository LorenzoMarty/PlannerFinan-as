# PlannerFin - Deploy no Vercel + Supabase

## 🚀 Deploy Rápido no Vercel

### 1. Configurar Variáveis de Ambiente

No painel do Vercel, adicione:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = sua_chave_anonima
```

### 2. Configurar CORS no Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em Settings > API > CORS origins
3. Adicione:
   - `https://seu-app.vercel.app`
   - `https://*.vercel.app` (para previews)

### 3. Deploy

1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### 4. Verificar

```bash
# Verificar configuração antes do deploy
npm run verify-vercel
```

## 📁 Arquivos de Configuração

### `vercel.json`

- Configuração de rewrites para SPA
- Configuração de variáveis de ambiente
- Otimizações de performance

### Scripts Adicionais

- `npm run verify-vercel` - Verificar configuração
- `npm run prebuild` - Executa verificação antes do build

## 🔧 Troubleshooting

### Erro: "Environment variables not found"

- Configure no Vercel Dashboard
- Redeploy após configurar

### Erro: "CORS policy"

- Configure CORS no Supabase
- Verifique domínio exato

### Erro: "Connection failed"

- Verifique URL e Key do Supabase
- Teste localmente primeiro

## 📖 Documentação Completa

- **Setup Rápido**: `QUICK_VERCEL_SETUP.md`
- **Deploy Completo**: `VERCEL_DEPLOYMENT.md`
- **Configuração Supabase**: `SUPABASE_SETUP.md`

## ✅ Checklist de Deploy

- [ ] Variáveis configuradas no Vercel
- [ ] CORS configurado no Supabase
- [ ] Build local funciona (`npm run build`)
- [ ] Verificação passou (`npm run verify-vercel`)
- [ ] Deploy realizado
- [ ] Testes na aplicação funcionando

---

🎉 **Sua aplicação está pronta para funcionar no Vercel!**
