# 🚀 GitHub Repository Setup - Manual Guide

## 📋 OVERZICHT

**Gebruiker:** myopenclaw  
**Token status:** Niet geldig (403 error)  
**Repositories nodig:** 4  
**Tijdslimiet:** 30 minuten  

## 🎯 REPOSITORIES TE CREËREN

1. **social-media-ai-pipeline**
   - Beschrijving: €0/month AI video pipeline for YouTube/TikTok/Instagram automation. Local AI toolchain (Ollama, Piper TTS, Canvas, FFmpeg) replacing €192/month external services.
   - Topics: ai, automation, social-media, video-pipeline, zero-cost, open-source, youtube, tiktok, instagram, content-creation

2. **zero-cost-ai-toolchain**
   - Beschrijving: Complete local AI toolchain replacing €192/month external services. Includes Ollama (LLM), Piper TTS (text-to-speech), Canvas (graphics), FFmpeg (video). Self-hosted, private, unlimited usage.
   - Topics: ai, local-ai, ollama, piper-tts, ffmpeg, canvas, self-hosted, privacy, open-source, cost-saving

3. **n8n-social-automation**
   - Beschrijving: n8n workflows for social media content automation. Schedule, generate, and post content across 10+ platforms. Includes YouTube upload, cross-platform repurposing, analytics integration.
   - Topics: n8n, automation, workflow, social-media, content-scheduling, youtube-automation, cross-posting, analytics, open-source

4. **social-media-analytics-dashboard**
   - Beschrijving: Real-time analytics dashboard for 10+ social media accounts. Track followers, views, revenue across YouTube, TikTok, X.com, Instagram. Self-hosted, zero cost, privacy focused.
   - Topics: analytics, dashboard, social-media, metrics, real-time, self-hosted, privacy, open-source, monitoring

## 🔐 STAP 1: NIEUWE GITHUB TOKEN AANMAKEN

1. Ga naar: https://github.com/settings/tokens
2. Klik op "Generate new token" → "Generate new token (classic)"
3. Geef een naam: "OpenClaw Social Media Empire"
4. Selecteer scopes:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **workflow** (Update GitHub Action workflows)
   - ✅ **delete_repo** (Delete repositories)
   - ✅ **admin:org** (Full control of orgs and teams, read and write org projects)
5. Klik "Generate token"
6. **KOPIEER DE TOKEN DIRECT** - je ziet hem maar één keer!

## 🛠️ STAP 2: REPOSITORIES HANDMATIG AANMAKEN

### Optie A: Via GitHub Website (Aanbevolen)

Voor elke repository:

1. Ga naar: https://github.com/new
2. Vul in:
   - **Repository name:** (bijv. social-media-ai-pipeline)
   - **Description:** (zie bovenstaande beschrijving)
   - **Public** (niet private)
   - **☑️ Add a README file** → **NIET aanvinken!** (we hebben al lokale code)
   - **☑️ Add .gitignore** → **NIET aanvinken!**
   - **☑️ Choose a license** → **NIET aanvinken!**
3. Klik "Create repository"
4. Herhaal voor alle 4 repositories

### Optie B: Via GitHub CLI (Sneller)

```bash
# Installeer GitHub CLI eerst (als je die nog niet hebt)
# brew install gh (Mac)
# apt install gh (Linux)

# Authenticate
gh auth login

# Maak repositories aan
gh repo create social-media-ai-pipeline --public --description "€0/month AI video pipeline for YouTube/TikTok/Instagram automation" -y
gh repo create zero-cost-ai-toolchain --public --description "Complete local AI toolchain replacing €192/month external services" -y
gh repo create n8n-social-automation --public --description "n8n workflows for social media content automation" -y
gh repo create social-media-analytics-dashboard --public --description "Real-time analytics dashboard for 10+ social media accounts" -y
```

## 📤 STAP 3: LOKALE CODE PUSHEN

**BELANGRIJK:** Wacht tot alle 4 repositories zijn aangemaakt op GitHub voordat je pusht!

### Push Script Gebruiken:

```bash
# Maak het script uitvoerbaar
chmod +x github_push_script.sh

# Voer het script uit
./github_push_script.sh
```

### Handmatig Pushen:

Voor elke repository:

```bash
# Ga naar de repository map
cd social-media-ai-pipeline

# Controleer remote
git remote -v

# Push code naar GitHub
git push -u origin main

# Terug naar workspace
cd ..
```

Herhaal voor:
- `zero-cost-ai-toolchain`
- `n8n-social-automation` 
- `social-media-analytics-dashboard`

## 🌐 STAP 4: GITHUB PAGES INSCHAKELEN

Na het pushen, voor elke repository:

1. Ga naar repository op GitHub (bijv. https://github.com/myopenclaw/social-media-ai-pipeline)
2. Klik "Settings" → "Pages"
3. Bij "Source", selecteer:
   - Branch: `main`
   - Folder: `/` (root)
4. Klik "Save"
5. Wacht 1-2 minuten voor activering
6. Controleer URL: `https://myopenclaw.github.io/social-media-ai-pipeline/`

## 📊 STAP 5: DASHBOARD BIJWERKEN

Na succesvolle push:

```bash
# Update dashboard tracking
node update_dashboard_launch.js
```

## 🔄 BACKUP PLAN (ALS AUTOMATISATIE FAALT)

### Scenario 1: Token werkt niet
- Gebruik GitHub CLI (`gh auth login`)
- Of maak repositories handmatig aan via website

### Scenario 2: Push faalt
```bash
# Force push (gebruik alleen als nodig)
git push origin main --force

# Of reset remote
git remote remove origin
git remote add origin https://github.com/myopenclaw/REPO-NAME.git
git push -u origin main
```

### Scenario 3: Repository bestaat al
```bash
# Clone eerst
git clone https://github.com/myopenclaw/REPO-NAME.git temp-folder
# Kopieer lokale bestanden naar temp-folder
# Push vanuit temp-folder
```

## ✅ SUCCES METRIEKEN

- [ ] Alle 4 repositories bestaan op GitHub
- [ ] Alle 4 repositories hebben code gepushed
- [ ] GitHub Pages is ingeschakeld voor alle repositories
- [ ] Dashboard tracking is bijgewerkt
- [ ] Backup plan is klaar voor gebruik

## 🚨 BELANGRIJKE WAARSCHUWINGEN

1. **Token veiligheid:** De token in `github_api_automation.js` is **niet geldig**. Gebruik deze niet!
2. **Revoke oude token:** Ga naar https://github.com/settings/tokens en revoke de oude token
3. **Geen README initialiseren:** Bij repository creatie **NIET** "Add a README file" aanvinken
4. **Eerst aanmaken, dan pushen:** Wacht tot repositories bestaan op GitHub voordat je pusht

## 📞 SUPPORT

Als er problemen zijn:
1. Controleer of repositories bestaan: https://github.com/myopenclaw?tab=repositories
2. Controleer push errors met: `git push -v`
3. Update token indien nodig

## 🎯 VOLGENDE STAPPEN NA SUCCES

1. **GitHub Sponsors setup:** https://github.com/sponsors
2. **Social media accounts aanmaken:** 10 platforms
3. **Eerste content posten:** Batch van 100 videos
4. **Community building:** Discord server, engagement

---

**⏰ TIJDLIJN:** 30 minuten  
**🎯 DOEL:** 4 repositories live op GitHub met code  
**✅ SUCCES:** Alle repositories accessible op https://github.com/myopenclaw