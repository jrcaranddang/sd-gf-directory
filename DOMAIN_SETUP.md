# 🌐 Connect sdglutenfree.com to Vercel

**You own the domain! Now let's connect it.**

---

## ✅ **STEP 1: Add Domain in Vercel (2 minutes)**

### **Go to Vercel Dashboard:**
1. Open: https://vercel.com/jrcaranddangs-projects
2. Click on your project: `sd-gf-directory`
3. Go to: **Settings** → **Domains**
4. Click: **Add Domain**
5. Enter: `sdglutenfree.com`
6. Click: **Add**

Vercel will show you DNS records to add.

---

## ✅ **STEP 2: Get DNS Records from Vercel**

Vercel will show something like:

### **Option A: If using Vercel nameservers (easiest):**
```
Type: NS
Value: ns1.vercel-dns.com
Value: ns2.vercel-dns.com
```

### **Option B: If using Namecheap DNS (common):**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## ✅ **STEP 3: Add DNS Records in Namecheap (3 minutes)**

### **Go to Namecheap:**
1. Login to Namecheap.com
2. Go to: **Domain List**
3. Click **Manage** next to `sdglutenfree.com`
4. Go to: **Advanced DNS** tab

### **Add Records:**

**For A Record:**
- Type: `A Record`
- Host: `@`
- Value: `76.76.21.21` (or whatever Vercel shows)
- TTL: `Automatic`
- Click **Save**

**For CNAME (www):**
- Type: `CNAME Record`
- Host: `www`
- Value: `cname.vercel-dns.com` (or whatever Vercel shows)
- TTL: `Automatic`
- Click **Save**

---

## ✅ **STEP 4: Wait for Propagation (5-30 minutes)**

### **What happens:**
1. DNS records propagate across internet (5-30 min usually)
2. Vercel detects the records
3. Vercel issues SSL certificate (automatic, free)
4. Domain goes live with HTTPS!

### **Check status:**
- In Vercel dashboard, domain will show "Valid" when ready
- You can also check: https://dnschecker.org/#A/sdglutenfree.com

---

## ✅ **STEP 5: Add www Subdomain (Optional but Recommended)**

In Vercel, also add:
- `www.sdglutenfree.com`

This ensures both work:
- http://sdglutenfree.com → redirects to https://sdglutenfree.com
- http://www.sdglutenfree.com → redirects to https://sdglutenfree.com

Vercel handles all redirects automatically!

---

## 🎯 **EXPECTED RESULT**

**After 15-30 minutes:**
- ✅ https://sdglutenfree.com → Your site!
- ✅ https://www.sdglutenfree.com → Your site!
- ✅ Free SSL certificate (green padlock)
- ✅ Auto-redirects from HTTP to HTTPS
- ✅ Old Vercel URL still works: https://sd-gf-directory.vercel.app

---

## 🚨 **TROUBLESHOOTING**

### **If domain doesn't work after 30 min:**

**Check DNS records:**
```bash
dig sdglutenfree.com
dig www.sdglutenfree.com
```

**Common issues:**
1. **Wrong IP in A record** → Check Vercel shows same IP
2. **TTL too high** → Set to Automatic or 300 seconds
3. **Cached DNS** → Wait longer or flush DNS cache
4. **Typo in CNAME** → Must be exactly what Vercel shows

### **Still not working?**
- Check Vercel dashboard for error messages
- Namecheap DNS can take up to 48 hours (but usually 15-30 min)
- Make sure you saved the DNS records

---

## 🎉 **ONCE IT'S LIVE**

### **Update everywhere:**

**Reddit posts:**
- Change URL from `sd-gf-directory.vercel.app`
- To: `sdglutenfree.com`

**Test checklist:**
- [ ] https://sdglutenfree.com works
- [ ] https://www.sdglutenfree.com works
- [ ] Green padlock (SSL) shows
- [ ] Site loads on mobile
- [ ] Animations work
- [ ] Search/filter works

---

## 💡 **PRO TIPS**

### **Set Primary Domain:**
In Vercel → Settings → Domains:
- Set `sdglutenfree.com` as primary
- All other URLs redirect to it

### **Email Forwarding (Optional):**
In Namecheap → Advanced DNS:
- Add email forwarding
- `info@sdglutenfree.com` → your email
- Free with domain!

### **Analytics (Later):**
Add Google Analytics or Vercel Analytics to track visitors

---

## 📊 **TIMELINE**

**Now:** Domain purchased ✅  
**5 min:** DNS records added  
**15-30 min:** Domain live with SSL  
**Tomorrow:** Post to Reddit with custom domain  
**This week:** Watch traffic grow  

---

## 🎯 **NEXT STEPS**

1. **Add domain in Vercel** (2 min)
2. **Copy DNS records** (30 sec)
3. **Add to Namecheap** (2 min)
4. **Wait 15-30 min** (grab coffee ☕)
5. **Test:** https://sdglutenfree.com
6. **Celebrate!** 🎉

---

**Let me know when you've added the DNS records and I'll help verify!** 🚀
