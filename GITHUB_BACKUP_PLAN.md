# 🔄 GitHub Setup Backup Plan

## 🚨 SCENARIO'S WAAR AUTOMATISATIE KAN FALEN

### 1. **Token Problemen**
- Oude token is revoked/expired
- Nieuwe token heeft onvoldoende permissions
- API rate limiting

### 2. **Repository Conflicts**
- Repository naam bestaat al
- Lokale .git conflicteert met remote
- Branch verschillen

### 3. **Netwerk Problemen**
- GitHub API niet bereikbaar
- Push timeouts
- Firewall restrictions

### 4. **Authenticatie Problemen**
- 2FA vereist maar niet geconfigureerd
- SSH keys niet ingesteld
- Organization restrictions

## 🛡️ BACKUP STRATEGIEËN

### Strategie A: Handmatige Repository Creatie (Eenvoudigste)

**Stappen:**
1. **Ga naar:** https://github.com/new
2. **Voor elke repository:**
   - Naam: `social-media-ai-pipeline`
   - Beschrijving: Kopieer van README.md
   - Public: ✅
   - Add README: ❌ (belangrijk!)
   - Add .gitignore: ❌
   - Add license: ❌
3. **Klik "Create repository"**
4. **Herhaal voor alle 4**

**Tijd:** ~5 minuten per repository

### Strategie B: GitHub CLI (Aanbevolen Backup)

```bash
# Installeer GitHub CLI
# Mac: brew install gh
# Linux: apt install gh || yum install gh
# Windows: winget install GitHub.cli

# Authenticate
gh auth login

# Maak repositories
gh repo create social-media-ai-pipeline --public --description "€0/month AI video pipeline" -y
gh repo create zero-cost-ai-toolchain --public --description "Complete local AI toolchain" -y
gh repo create n8n-social-automation --public --description "n8n workflows for automation" -y
gh repo create social-media-analytics-dashboard --public --description "Real-time analytics dashboard" -y
```

### Strategie C: cURL API Calls (Technisch)

```bash
# Vervang TOKEN met nieuwe GitHub token
TOKEN="ghp_your_new_token_here"

# Maak repository via API
curl -X POST -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d '{"name":"social-media-ai-pipeline","description":"€0/month AI video pipeline","private":false}'
```

## 🔧 PUSH BACKUP OPLOSSINGEN

### Als `git push` faalt:

**Oplossing 1: Force Push**
```bash
cd social-media-ai-pipeline
git push origin main --force
```

**Oplossing 2: Reset Remote**
```bash
cd social-media-ai-pipeline
git remote remove origin
git remote add origin https://github.com/myopenclaw/social-media-ai-pipeline.git
git push -u origin main --force
```

**Oplossing 3: Nieuwe Clone**
```bash
# Clone lege repository
git clone https://github.com/myopenclaw/social-media-ai-pipeline.git temp-folder

# Kopieer lokale bestanden
cp -r /Users/clarenceetnel/.openclaw/workspace/social-media-ai-pipeline/* temp-folder/
cp -r /Users/clarenceetnel/.openclaw/workspace/social-media-ai-pipeline/.* temp-folder/ 2>/dev/null || true

# Push vanuit temp folder
cd temp-folder
git add .
git commit -m "Initial commit"
git push origin main
```

## 📋 STAP-VOOR-STAP BACKUP PROCEDURE

### Fase 1: Voorbereiding (5 minuten)
1. **Revoke oude token:** https://github.com/settings/tokens
2. **Maak nieuwe token:** Met `repo` en `workflow` scopes
3. **Update scripts:** Vervang token in `github_api_automation.js`
4. **Test token:** `curl -H "Authorization: token NEW_TOKEN" https://api.github.com/user`

### Fase 2: Repository Creatie (10 minuten)
```bash
# Optie A: Handmatig via website (4x)
# Optie B: GitHub CLI (1 commando)
gh repo create social-media-ai-pipeline --public --description "..." -y
# Optie C: Parallel creatie (open 4 tabs)
```

### Fase 3: Code Push (10 minuten)
```bash
# Eén voor één
./github_push_script.sh

# Of handmatig per repository
for repo in social-media-ai-pipeline zero-cost-ai-toolchain n8n-social-automation social-media-analytics-dashboard; do
  cd $repo
  git push -u origin main || git push -u origin main --force
  cd ..
done
```

### Fase 4: Verificatie (5 minuten)
1. **Controleer repositories:** https://github.com/myopenclaw?tab=repositories
2. **Controleer code:** Klik op elke repository → "Code" tab
3. **Update dashboard:** `node update_dashboard_launch.js`
4. **Documenteer problemen:** Update deze backup plan

## 🚨 NOODPROCEDURE (Alles faalt)

### Als niets werkt:

**Stap 1: Tijdelijke Oplossing**
```bash
# Maak repositories onder andere account
# Gebruik: test-account of organization

# Of gebruik GitLab/GitBucket als alternatief
```

**Stap 2: Offline Backup**
```bash
# Archiveer lokale code
tar -czf social-media-empire-backup.tar.gz \
  social-media-ai-pipeline \
  zero-cost-ai-toolchain \
  n8n-social-automation \
  social-media-analytics-dashboard

# Bewaar backup
mv social-media-empire-backup.tar.gz ~/backups/
```

**Stap 3: Plan B - Directe Social Media Setup**
1. **Sla GitHub over** tijdelijk
2. **Begin met social media accounts**
3. **Post eerste content**
4. **Keer later terug naar GitHub**

## 📊 SUCCES METRIEKEN (Backup Versie)

### Minimum Viable Success:
- [ ] 4 repositories aangemaakt (handmatig of automatisch)
- [ ] Code gepushed naar minstens 2 repositories
- [ ] Dashboard tracking actief

### Acceptable Success:
- [ ] Alle 4 repositories hebben code
- [ ] GitHub Pages enabled voor 1 repository
- [ ] Backup plan gedocumenteerd

### Full Success:
- [ ] Alle 4 repositories live met code
- [ ] GitHub Pages enabled voor alle
- [ ] Sponsorship-ready profile
- [ ] Dashboard tracking compleet

## 🔍 DIAGNOSE TOOLS

### Check Token:
```bash
curl -s -H "Authorization: token YOUR_TOKEN" https://api.github.com/user | grep login
```

### Check Repository:
```bash
curl -s https://api.github.com/repos/myopenclaw/social-media-ai-pipeline | grep -E '"name"|"html_url"'
```

### Check Push Status:
```bash
cd social-media-ai-pipeline
git status
git remote -v
git log --oneline -5
```

## 📞 ESCALATIE PAD

### Niveau 1: Automatische retry
- Wacht 2 minuten
- Probeer opnieuw met backoff

### Niveau 2: Semi-automatisch
- Gebruik GitHub CLI
- Handmatige tussenstappen

### Niveau 3: Volledig handmatig
- Website interface
- Documenteer elke stap

### Niveau 4: Alternatief platform
- GitLab
- Bitbucket
- Self-hosted Gitea

## ✅ POST-MORTEM CHECKLIST

Na oplossing van problemen:

1. [ ] **Root cause geïdentificeerd**
2. [ ] **Backup plan getest**
3. [ ] **Documentatie bijgewerkt**
4. [ ] **Preventieve maatregelen geïmplementeerd**
5. [ ] **Team geïnformeerd** (indien van toepassing)

## 🎯 TIJD MANAGEMENT

**Totaal budget:** 30 minuten  
**Backup activatie:** Bij 15 minuten als geen progressie  
**Escalatie:** Bij 25 minuten als backup ook faalt  

**Tijdsverdeling:**
- 0-10m: Automatische setup
- 10-15m: Diagnose en retry
- 15-25m: Backup plan uitvoeren
- 25-30m: Noodprocedure en documentatie

---

**⚠️ BELANGRIJK:** Het doel is **functionaliteit**, niet perfectie.  
Als GitHub setup faalt, ga door met social media accounts en keer later terug.

**🎯 PRINCIPE:** "Better done than perfect" - 80% succes is voldoende om door te gaan naar de volgende fase.