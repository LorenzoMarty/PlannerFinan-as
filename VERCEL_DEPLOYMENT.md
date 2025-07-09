# Deploy no Vercel com Supabase

Este guia mostra como configurar e fazer deploy da aplicação no Vercel com integração Supabase.

## 🚀 Deploy Rápido

### 1. Conectar Repository

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione o repository do GitHub
4. Configure as variáveis de ambiente

### 2. Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = sua_chave_anonima_aqui
```

**⚠️ IMPORTANTE:** Configure essas variáveis para todos os ambientes:

- Production
- Preview
- Development

### 3. Configurações do Build

O Vercel detecta automaticamente que é uma aplicação Vite. Se necessário, configure:

```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4. Deploy

Após configurar as variáveis de ambiente, clique em **Deploy**.

## 🔧 Configurações Avançadas

### vercel.json

O arquivo `vercel.json` está configurado para:

- Redirecionamento SPA (todas as rotas para index.html)
- Configuração de variáveis de ambiente
- Otimizações de performance

### Domínio Personalizado

1. Vá em **Settings > Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

### Configuração de Headers

Para melhor performance e segurança, adicione em `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 🔍 Troubleshooting

### Erro: "Environment variables not defined"

**Solução:**

1. Verifique se as variáveis estão configuradas no Vercel
2. Faça um novo deploy após configurar
3. Certifique-se que os nomes estão exatos: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### Erro: "Failed to fetch"

**Solução:**

1. Verifique se a URL do Supabase está correta
2. Teste a conectividade do Supabase dashboard
3. Verifique se o projeto Supabase está ativo

### Erro: "CORS policy"

**Solução:**

1. No Supabase, vá em **Settings > API**
2. Adicione o domínio do Vercel em **CORS origins**:
   ```
   https://seu-app.vercel.app
   https://*.vercel.app (para previews)
   ```

### Aplicação funciona local mas não no Vercel

**Solução:**

1. Verifique se build local funciona: `npm run build && npm run preview`
2. Compare variáveis de ambiente
3. Verifique logs no Vercel dashboard

### Performance lenta

**Solução:**

1. Habilite Edge Functions se necessário
2. Configure cache headers
3. Use região mais próxima no Vercel

## 📊 Monitoramento

### Analytics

Habilite o Vercel Analytics para monitorar:

- Performance
- Core Web Vitals
- User sessions
- Error tracking

### Logs

Acesse os logs em **Functions > View Function Logs** para debug.

### Status

Configure monitoramento de uptime para:

- Status da aplicação
- Conectividade com Supabase
- Performance da API

## 🔒 Segurança

### Variables de Ambiente

- ✅ Nunca commit credenciais no código
- ✅ Use apenas variáveis `VITE_` para frontend
- ✅ Configure diferentes valores para dev/prod

### Headers de Segurança

O `vercel.json` inclui headers básicos de segurança. Para aplicações em produção, considere:

- Content Security Policy (CSP)
- Strict Transport Security (HSTS)
- Cookie policies

### Supabase Security

1. Configure Row Level Security (RLS) no Supabase
2. Use políticas restritivas
3. Monitore usage no dashboard do Supabase

## 🚀 Performance

### Otimizações Automáticas

O Vercel aplica automaticamente:

- Gzip/Brotli compression
- CDN global
- Image optimization (se usar `next/image`)
- Tree shaking

### Otimizações Manuais

1. **Code Splitting**: A aplicação já usa lazy loading
2. **Bundle Analysis**: Use `npm run build -- --analyze`
3. **Preload Resources**: Configure preload hints

## 📱 PWA (Progressive Web App)

Para habilitar PWA no Vercel:

1. Instale `vite-plugin-pwa`
2. Configure service worker
3. Adicione manifest.json
4. Configure cache strategy

## 🔄 CI/CD

### Deploy Automático

O Vercel faz deploy automático quando:

- Push para main/master (production)
- Pull request (preview)
- Push para outras branches (development)

### Preview Deployments

Cada pull request gera um preview único:

- URL temporária para testes
- Mesmo ambiente de produção
- Ideal para QA

### Branch Deployments

Configure branches específicas para staging:

1. Vá em **Settings > Git**
2. Configure production branch
3. Habilite preview para outras branches

## 💰 Custos

### Free Tier

O plano gratuito inclui:

- 100GB bandwidth/mês
- Deployments ilimitados
- Preview deployments
- Analytics básico

### Pro Features

Para aplicações maiores:

- Bandwidth adicional
- Analytics avançado
- Password protection
- Custom domains ilimitados

## 📞 Suporte

Se encontrar problemas:

1. **Documentação**: [vercel.com/docs](https://vercel.com/docs)
2. **Community**: [vercel.com/community](https://vercel.com/community)
3. **GitHub Issues**: Reporte bugs específicos
4. **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

**🎉 Pronto!** Sua aplicação PlannerFin está agora rodando no Vercel com Supabase integrado!
