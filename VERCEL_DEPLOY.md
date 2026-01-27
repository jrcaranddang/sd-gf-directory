# 🚀 Deploy to Vercel - Step by Step

**Time: 3 minutes**

---

## ✅ **OPTION 1: Web UI (EASIEST)**

### **Step 1: Go to Vercel**
Open: https://vercel.com/new

### **Step 2: Sign Up/Login**
- Click "Continue with GitHub"
- Authorize Vercel

### **Step 3: Import Project**

**You have 2 choices:**

#### **Choice A: Import from GitHub (Recommended)**
1. First, push to GitHub:
```bash
cd /home/ubuntu/clawd/gf-directory
git remote add origin https://github.com/YOUR-USERNAME/sd-gf-directory.git
git push -u origin main
```

2. Then in Vercel:
- Click "Import Git Repository"
- Select your GitHub repo
- Click "Deploy"

**Done!** Vercel gives you URL like: `https://sd-gf-directory.vercel.app`

---

#### **Choice B: Upload Files Directly**
1. In Vercel dashboard, click "Add New" → "Project"
2. Click "Browse" or drag/drop
3. Upload the `index.html` file
4. Click "Deploy"

**Done!** Get instant URL.

---

## ✅ **OPTION 2: CLI (From Your Machine)**

### **Step 1: Login to Vercel**
```bash
vercel login
```
This opens browser to authenticate.

### **Step 2: Deploy**
```bash
cd /home/ubuntu/clawd/gf-directory
vercel --prod
```

### **Step 3: Get URL**
Vercel shows you the live URL!

---

## 🎯 **RECOMMENDED: Use Web UI (Choice A)**

**Why?**
- No CLI authentication needed
- Can see deployment logs
- Easy to manage later
- GitHub integration = auto-deploy on push

---

## 📝 **AFTER DEPLOYMENT**

### **You'll Get:**
```
✅ https://sd-gf-directory.vercel.app
```

**Test it:**
1. Open URL in browser
2. Test on mobile
3. Try search/filters
4. Make sure everything works

### **Then:**
1. Copy the URL
2. Update Reddit post with this URL
3. Post tomorrow morning (Tuesday 9-11 AM PST)

---

## 🔧 **TO UPDATE SITE LATER**

### **If using GitHub integration:**
```bash
# Edit index.html
git add .
git commit -m "Added 5 new restaurants"
git push
```
**Site auto-deploys in 30 seconds!**

### **If using CLI:**
```bash
# Edit index.html
vercel --prod
```

---

## 🌐 **CUSTOM DOMAIN (OPTIONAL)**

### **If you buy domain (e.g., sdglutenfree.com):**

1. In Vercel dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records (Vercel shows you how)
4. Enable SSL (automatic)

**Cost:** $12/year for domain

---

## ✅ **QUICK START**

**Fastest way RIGHT NOW:**

1. Go to: https://vercel.com/new
2. Sign in with GitHub
3. Click "Import Git Repository"
4. If repo doesn't exist yet:
   ```bash
   # Create GitHub repo first
   cd /home/ubuntu/clawd/gf-directory
   gh repo create sd-gf-directory --public --source=. --push
   ```
5. Then import in Vercel
6. Click "Deploy"

**Done in 2 minutes!** 🚀

---

## 🎯 **YOUR NEXT 3 ACTIONS**

1. **Deploy to Vercel** (2 min) - Use web UI
2. **Get live URL** (instant)
3. **Test it** (1 min)

**Then tomorrow: Post to Reddit with live URL!**

---

**Need help with any step? Just ask!** 💪
