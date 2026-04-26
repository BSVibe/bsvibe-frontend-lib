# @bsvibe/i18n

BSVibe shared i18n — `next-intl` wrapper with `common` + `auth` namespaces (ko/en).

## Status

Placeholder (Phase A bootstrap). Phase C 도입 시 본 구현. base structure만 Phase A에 미리 마련.

## Planned Surface

```ts
import { createI18nConfig } from "@bsvibe/i18n";

// next.config.ts
export default {
  experimental: {
    typedRoutes: true,
  },
  ...createI18nConfig({ locales: ["ko", "en"], defaultLocale: "ko" }),
};
```

## Namespaces

- `common` — 버튼/에러/폼 레이블 (shared lib 제공)
- `auth` — SSO UI (shared lib 제공)
- 제품 로컬 namespace는 각 제품 repo에서 관리

## Source

Phase C 진입 시 bsvibe-site 기존 커스텀 `src/i18n/{ko,en}.ts` 사전을 `messages/{ko,en}/common.json`으로 변환.
