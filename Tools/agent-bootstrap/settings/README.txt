user-settings.merge.json  -> НЕ копировать поверх, а ДОБАВИТЬ ключи в %USERPROFILE%\.claude\settings.json
                             (плагины и маркетплейс; плагины для проекта необязательны).
project-settings.local.json -> положить как C:\Users\cloude-agent\work\AoW4_RbbP_Wiki\.claude\settings.local.json
                             (минимальный список разрешений БЕЗ git push / gh pr create / gh pr merge:
                             эти действия по договорённости идут только после «мерж» владельца,
                             окно подтверждения — вторая страховка).
НЕ переносить: ~/.claude/.credentials.json, ~/.config/gh/hosts.yml (токены) — авторизация на новом сервере заново.
Старый settings.local.json (89 разрешений) не переносится: он состоял из одноразовых команд с линуксовыми путями.
