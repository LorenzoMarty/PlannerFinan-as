# 🚀 Setup Rápido - Vercel + Supabase

## 1. Variáveis de Ambiente no Vercel

No painel do Vercel, configure:

```
VITE_SUPABASE_URL = https://hzqidfqjysjclksqqvqj.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cWlkZnFqeXNqY2xrc3FxdnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDM5ODQsImV4cCI6MjA1MTkxOTk4NH0.xxx
```

## 2. CORS no Supabase

No Supabase Dashboard:

- Settings > API > CORS origins
- Adicione: `https://seu-app.vercel.app`
- Adicione: `https://*.vercel.app` (para previews)

## 3. Deploy

```bash
# Verificar configuração antes do deploy
npm run verify-vercel

# Ou deploy direto do Git
git push origin main
```

## 4. Testar

Após deploy:

1. Acesse sua aplicação
2. Clique no ícone ☁️ no header
3. Teste a conexão com Supabase
4. Verifique se dados são salvos

## 🔧 Troubleshooting

### "Environment variables not found"

- Configure no Vercel Dashboard
- Redeploy após configurar

### "CORS error"

- Configure CORS no Supabase
- Verifique domínio exato

### "Connection failed"

- Verifique URL e Key do Supabase
- Teste localmente primeiro

## ✅ Checklist de Deploy

- [ ] Variáveis configuradas no Vercel
- [ ] CORS configurado no Supabase
- [ ] Build local funciona (`npm run build`)
- [ ] Verificação passou (`npm run verify-vercel`)
- [ ] Deploy realizado
- [ ] Testes na aplicação funcionando

---

📖 **Documentação completa**: `VERCEL_DEPLOYMENT.md`
