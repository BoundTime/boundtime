# Git & GitHub Setup für BoundTime

## Voraussetzung: Git installieren

Git ist derzeit nicht auf deinem System installiert. Installiere es zuerst:

**Download:** https://git-scm.com/download/win

Nach der Installation das Terminal (oder Cursor) neu starten.

---

## Befehle zum Einrichten (nach Git-Installation)

Führe diese Befehle im Projektordner `c:\BoundTime` aus:

```bash
# 1. Git-Repository initialisieren
git init

# 2. Alle Dateien zur Staging-Area hinzufügen
git add .

# 3. Ersten Commit erstellen
git commit -m "Initial commit: BoundTime Community-Plattform"

# 4. GitHub-Repository erstellen und pushen
#    Zuerst auf github.com ein neues Repository "BoundTime" anlegen (ohne README),
#    dann:
git remote add origin https://github.com/DEIN-BENUTZERNAME/BoundTime.git
git branch -M main
git push -u origin main
```

**Alternativ mit GitHub CLI** (wenn `gh` installiert):

```bash
git init
git add .
git commit -m "Initial commit: BoundTime Community-Plattform"
gh repo create BoundTime --private --source=. --push
```

---

## Wichtig

- Ersetze `DEIN-BENUTZERNAME` durch deinen GitHub-Benutzernamen
- Bei `git push` wirst du nach deinen GitHub-Zugangsdaten gefragt (oder du nutzt einen Personal Access Token)
- Die Datei `.env.local` mit sensiblen Daten (Supabase Keys) ist über `.gitignore` ausgeschlossen und wird nicht hochgeladen
