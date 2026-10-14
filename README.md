# else — About us page (standalone)

Plain HTML, CSS and JavaScript. No build step, no dependencies. Fonts load from Google Fonts, so you need to be online.

```
index.html          the page
assets/styles.css   all styles (colours, fonts, buttons, sea, menu, cursor)
assets/main.js      interactions: header on scroll, rising sea, menu,
                    chapter 01 scroll sequence, closing typewriter,
                    "read the full conversation", cursor ring
```

## Look at it on your computer
Unzip, open the folder, double-click `index.html`. It opens in your browser. Everything works this way.

## Put it online (free)

**Option A: GitHub Pages** (good if the code should live on GitHub)
1. On github.com, create a new repository (for example `else-site`).
2. Click **Add file → Upload files** and drag in the *contents* of this folder (`index.html`, `README.md` and the `assets` folder). Commit.
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute the page is live at `https://<your-username>.github.io/else-site/`.

**Option B: Netlify Drop** (fastest, no GitHub needed)
Go to https://app.netlify.com/drop and drag this whole folder onto the page. You get a live link in seconds. With a free account the link stays up and you can rename it.

## Moving it into Webflow later
Webflow has GSAP built in, so the scroll effects can be rebuilt with Webflow Interactions, or this `main.js` can be pasted as custom code. The colours and type are in the project handoff note (kept outside this public repo).

## Notes
- All links are placeholders (`#`) until the other pages exist.
- With "reduce motion" switched on in the operating system, nothing pins or moves and every text sequence shows complete.
