/**
 * Generates extensions listed in the gallery
 * and provides several utility functions.
 */

/* Public Variables */
let _tagCache = [], _tagLoopNeedsInit = true;

function updateTags() {
  _tagLoopNeedsInit = false;
  let timer = 0;
  const animate = () => {
    for (let i = 0; i < _tagCache.length; i++) {
      const tag = _tagCache[i];
      const rng = tag.rngData;
      tag.style.transform = `scale(${(Math.sin(timer * rng) * .05) + .65}) rotate(${Math.cos(timer * rng) * .15}rad)`;
    }
    timer += 0.02;
    requestAnimationFrame(animate);
  };
  animate();
}

function displayExts(json, optFadeIn) {
  const oldDiv = document.querySelector(".ext-div");
  if (oldDiv) oldDiv.remove();

  const extEntries = Object.entries(json);
  const hasTags = extEntries.some(e => e[1].status);

  let shouldSplit = currentTags[0] === "all" && (hasTags || pins.length);
  const main = document.createElement("div");
  main.classList.add("ext-div");

  _tagCache = [];
  extEntries.forEach((item) => {
    const isOverride = item[0] === "override404";
    const info = {
      ...item[1],
      id: item[0],
      isOverride, optFadeIn
    };
    if (isOverride) info.banner = "pages/main-assets/404.svg";
    else info.banner = "thumbs/" + info.banner;
    const status = info.status;

    if (shouldSplit && !(status || pins.includes(info.id))) {
      const breaker = document.createElement("div");
      breaker.classList.add("ext-breaker");
      main.append(breaker, document.createElement("br"));
      shouldSplit = false;
    }
  
    const extensionDiv = document.createElement("extension-div");
    extensionDiv.metaData = info;
    main.appendChild(extensionDiv);
  });

  document.body.appendChild(main);
  if (_tagLoopNeedsInit) updateTags();
}

async function downloadExt(name, url) {
  url = "code/" + url;
  if (isSpecial) {
    const messager = window.opener || window.parent;
    if (!messager) return alert("Failed to request to the editors!");
    messager.postMessage({
      loadExt: `https://gaiawindwave90.github.io/VM-to-JS-Extensions/${url}`
    }, "https://potentiamod.github.io/editor.html"); // PotentiaMod
    messager.postMessage({
      loadExt: `https://gaiawindwave90.github.io/VM-to-JS-Extensions/${url}`
    }, "https://potentiamod.github.io/scratch-gui/editor.html"); // PotentiaMod development version
	    messager.postMessage({
      loadExt: `https://gaiawindwave90.github.io/VM-to-JS-Extensions/${url}`
    }, "https://gaiawindwave90.github.io/GaiaMod/editor.html"); // GaiaMod
	messager.postMessage({
      loadExt: `https://gaiawindwave90.github.io/VM-to-JS-Extensions/${url}`
    }, "https://gaiamod-main.github.io/editor.html"); // GaiaMod Legacy
	messager.postMessage({
      loadExt: `https://gaiawindwave90.github.io/VM-to-JS-Extensions/${url}`
    }, "https://versolot.github.io/editor.html"); // Versolot
	messager.postMessage({
      loadExt: `https://gaiawindwave90.github.io/VM-to-JS-Extensions/${url}`
    }, "https://super-chaosmod.github.io/editor.html"); // Super chaosMod
	messager.postMessage({
      loadExt: `https://gaiawindwave90.github.io/VM-to-JS-Extensions/${url}`
    }, "http://localhost:8601/editor.html"); // Only if it supports extensions loading to the editor like GaiaMod or PotentiaMod.
	

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    genText(
      "center-notif",
      `Copied to the mods!${isMobile ? "<br>" : " " }Check the Editor`
    );
    return;
  }

  if (downloadType === "url") {
    window.open(url);
    return;
  }

  let extCode = await (await fetch(url)).text();
  if (eraseDeprecation) {
    const regex = new RegExp(`\\s*/\\* Deprecation Marker \\*/[\\s\\S]*?/\\* Marker End \\*/`, "g");
    extCode = extCode.replace(regex, "").replace(/\n{3,}/g, "\n\n");
  }
  if (compress) {
    // compress extCode
    name += "-minified";
    try {
      extCode = (await Terser.minify(extCode)).code;
    } catch(e) {
      console.warn("Couldnt Compress Extension: " + name, e);
    }
  }

  if (downloadType === "clipboard") {
    navigator.clipboard.writeText(extCode)
      .then(() => genText("center-notif", "Copied to Clipboard!"))
      .catch(() => window.open(url));
  } else {
    const blobUrl = URL.createObjectURL(new Blob([extCode]));
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = name + ".js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  }
}
