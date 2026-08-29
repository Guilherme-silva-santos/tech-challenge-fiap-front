# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Deploy

Push na `master` builda o Vite e sincroniza o `dist/` para um bucket S3 servido como site estático — workflow em [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Em pull request roda só o build.

A infra (bucket, role OIDC, permissões) vive na stack `base/` do [repositório da API](https://github.com/pedruvaz/tech-challenge-fiap), em `infra/terraform/base/`. Depois do `terraform apply` de lá, configurar neste repositório (Settings → Secrets and variables → Actions):

| Onde | Nome | Valor |
| --- | --- | --- |
| Variable | `AWS_DEPLOY_ROLE_ARN` | output `github_actions_role_arn` da stack `base/` |
| Variable | `AWS_REGION` | ex.: `us-east-1` |
| Variable | `S3_BUCKET_NAME` | output `frontend_bucket_name` da stack `base/` |
| Variable | `VITE_API_URL` | URL pública da API (NLB do EKS) |

Tudo variable, nenhum secret: ARN de role não é informação sensível — quem impede assume indevido é o trust OIDC da role, restrito aos repositórios do projeto.

Enquanto `S3_BUCKET_NAME` não existir, o job de deploy fica skipped — criar a var é o que arma o deploy. A URL do site sai no output `frontend_website_endpoint` do Terraform (e no summary de cada run): é o endpoint de website do S3, HTTP puro, com `error_document` apontando para o `index.html` para as rotas do React Router sobreviverem a refresh.
