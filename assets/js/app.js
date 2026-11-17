(() => {
  "use strict";
  const CHANNEL_ID = "UCQlWWfImcRwJccdw0e5YLdQ";
  const UPLOADS_PLAYLIST = "UUQlWWfImcRwJccdw0e5YLdQ";
  const $ = (selector, scope=document) => scope.querySelector(selector);
  const $$ = (selector, scope=document) => [...scope.querySelectorAll(selector)];

  // Theme: save the visitor's choice locally; follow system preference on first visit.
  const themeButton = $("#themeToggle");
  const savedTheme = localStorage.getItem("aximo-theme");
  const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("aximo-theme", theme);
    themeButton?.setAttribute("aria-label", theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему");
    const icon = $(".theme-icon");
    if (icon) icon.textContent = theme === "dark" ? "☼" : "◐";
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#11140f" : "#f7f8f5";
  }
  applyTheme(savedTheme || (systemDark ? "dark" : "light"));
  themeButton?.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  // Mobile navigation.
  const menuButton = $("#menuToggle"), nav = $("#mainNav");
  menuButton?.addEventListener("click", () => {
    const opened = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(opened));
    menuButton.setAttribute("aria-label", opened ? "Закрыть меню" : "Открыть меню");
  });
  $$("#mainNav a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open"); menuButton?.setAttribute("aria-expanded", "false");
  }));

  // Reading progress and back-to-top.
  const progress = $("#readingProgress"), backTop = $("#backTop");
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? scrollY / max * 100 : 0) + "%";
    backTop.classList.toggle("visible", scrollY > 500);
  };
  addEventListener("scroll", updateScroll, {passive:true}); updateScroll();
  backTop?.addEventListener("click", () => scrollTo({top:0,behavior:"smooth"}));
  $("#year").textContent = new Date().getFullYear();

  // Reveal-on-scroll.
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); obs.unobserve(entry.target); }
    }), {threshold:.1});
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add("visible"));

  // Editorial cards: introductory evergreen content, not fabricated breaking news.
  const articles = [
    {category:"project",label:"О ПРОЕКТЕ",date:"AXIMOMEDIA_RU",title:"Больше, чем просто медиа",description:"Знакомство с идеей проекта: единое пространство для игр, технологий, развлечений и авторского контента.",body:"AXIMOMEDIA_RU объединяет несколько направлений цифрового контента. Сайт служит центральной точкой, откуда можно перейти к видео, публикациям и сообществу проекта."},
    {category:"platforms",label:"ПЛОЩАДКИ",date:"ГДЕ НАС НАЙТИ",title:"Все площадки AXIMO в одном месте",description:"Telegram, YouTube, RuTube, Lolka и Twitch — выбери удобную платформу и следи за обновлениями.",body:"У проекта есть несколько площадок с разными форматами. YouTube и RuTube используются для видео, Telegram — для публикаций и связи, а Twitch и Lolka — для стримингового направления."},
    {category:"community",label:"СООБЩЕСТВО",date:"COLLABORATIONS",title:"Открыты к совместным проектам",description:"Коллаборации, совместные эфиры, творческие инициативы и предложения по развитию медиабренда.",body:"AXIMOMEDIA_RU открыт к конструктивным предложениям о сотрудничестве. Для первого контакта можно написать в Telegram проекта и кратко описать идею, формат и предполагаемые сроки."},
    {category:"project",label:"НАПРАВЛЕНИЯ",date:"MEDIA GUIDE",title:"О чём AXIMOMEDIA_RU",description:"Игры, технологии, кино, развлечения и авторские проекты — направления, вокруг которых развивается бренд.",body:"Темы и форматы могут расширяться со временем. Основная идея остаётся неизменной: создавать интересный контент и объединять его общей визуальной и редакционной идентичностью."},
    {category:"platforms",label:"ВИДЕО",date:"YOUTUBE",title:"Как смотреть видео на сайте",description:"Выбирай карточку в медиацентре: поддерживаемые ролики открываются во встроенном плеере.",body:"Медиацентр загружает открытые публикации YouTube через RSS. Доступность ленты зависит от внешнего RSS-сервиса и настроек доступности видео на YouTube. Если загрузка не сработает, остаётся плейлист канала."},
    {category:"community",label:"СООБЩЕСТВО",date:"STAY CONNECTED",title:"Оставайся на связи",description:"Подписывайся на площадки бренда, чтобы не пропускать новые видео, публикации и анонсы.",body:"Ссылки на подтверждённые площадки собраны в разделе сообщества и в подвале сайта. Новые площадки можно добавить в index.html, когда будут известны точные адреса."}
  ];
  const newsGrid = $("#newsGrid"), newsSearch = $("#newsSearch"), newsEmpty = $("#newsEmpty");
  let activeNewsFilter = "all";
  function renderNews() {
    const q = (newsSearch.value || "").trim().toLocaleLowerCase("ru");
    const matches = articles.filter(a => (activeNewsFilter === "all" || a.category === activeNewsFilter) &&
      (a.title + " " + a.description + " " + a.label).toLocaleLowerCase("ru").includes(q));
    newsGrid.replaceChildren();
    matches.forEach(article => {
      const card = document.createElement("article"); card.className = "news-card";
      const meta = document.createElement("div"); meta.className = "news-meta";
      const cat = document.createElement("span"); cat.className = "news-category"; cat.textContent = article.label;
      const date = document.createElement("span"); date.textContent = article.date;
      meta.append(cat,date);
      const title = document.createElement("h3"); title.textContent = article.title;
      const desc = document.createElement("p"); desc.textContent = article.description;
      const link = document.createElement("a"); link.className = "text-link"; link.href = "https://t.me/AximoMedia_RU"; link.target = "_blank"; link.rel = "noopener"; link.textContent = "Обсудить в Telegram ↗";
      card.append(meta,title,desc,link); newsGrid.append(card);
    });
    newsEmpty.hidden = matches.length !== 0;
  }
  $$("#newsFilters .filter-tab").forEach(button => button.addEventListener("click", () => {
    $$("#newsFilters .filter-tab").forEach(b => b.classList.toggle("active", b === button));
    activeNewsFilter = button.dataset.filter; renderNews();
  }));
  newsSearch.addEventListener("input", renderNews); renderNews();

  // YouTube RSS catalog. No API key is embedded in the public static site.
  const videoGrid = $("#videoGrid"), feedStatus = $("#feedStatus"), videoSearch = $("#videoSearch");
  const player = $("#youtubePlayer"), playerTitle = $("#playerTitle"), playerDescription = $("#playerDescription");
  let videos = [], activeVideoFilter = "all";
  const videoIdFromUrl = url => {
    try { const u = new URL(url); return u.hostname.includes("youtu.be") ? u.pathname.slice(1) : (u.searchParams.get("v") || ""); }
    catch { return ""; }
  };
  const formatDate = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "YouTube" : new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long",year:"numeric"}).format(date);
  };
  const classify = title => {
    const t = (title || "").toLocaleLowerCase("ru");
    if (/игр|game|стрим|minecraft|resident|обзор игр|геймплей/.test(t)) return "gaming";
    if (/технолог|tech|нейросет|программ|код|it|ии\b/.test(t)) return "tech";
    return "other";
  };
  function renderVideos() {
    const q = (videoSearch.value || "").trim().toLocaleLowerCase("ru");
    const visible = videos.filter(v => (activeVideoFilter === "all" || v.category === activeVideoFilter) &&
      (v.title || "").toLocaleLowerCase("ru").includes(q));
    videoGrid.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement("div"); empty.className = "empty-state";
      empty.textContent = videos.length ? "По этому запросу ничего не найдено." : "Лента пока недоступна. Открой плейлист канала в плеере выше.";
      videoGrid.append(empty); return;
    }
    visible.slice(0,9).forEach(video => {
      const card = document.createElement("button"); card.type = "button"; card.className = "video-card";
      card.setAttribute("aria-label","Смотреть видео: " + video.title);
      const thumb = document.createElement("div"); thumb.className = "video-thumb";
      const img = document.createElement("img"); img.src = video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`; img.alt = ""; img.loading = "lazy";
      img.onerror = () => { img.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`; };
      const play = document.createElement("span"); play.className = "video-play"; play.textContent = "▶"; thumb.append(img,play);
      const body = document.createElement("div"); body.className = "video-card-body";
      const title = document.createElement("div"); title.className = "video-card-title"; title.textContent = video.title;
      const date = document.createElement("div"); date.className = "video-card-date"; date.textContent = formatDate(video.pubDate);
      body.append(title,date); card.append(thumb,body);
      card.addEventListener("click", () => {
        player.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&rel=0`;
        playerTitle.textContent = video.title; playerDescription.textContent = "Опубликовано: " + formatDate(video.pubDate);
        $("#playerFrame").scrollIntoView({behavior:"smooth",block:"center"});
      });
      videoGrid.append(card);
    });
  }
  $$("#videoFilters .filter-tab").forEach(button => button.addEventListener("click", () => {
    $$("#videoFilters .filter-tab").forEach(b => b.classList.toggle("active",b===button));
    activeVideoFilter = button.dataset.filter; renderVideos();
  }));
  videoSearch.addEventListener("input",renderVideos);
  async function loadVideos() {
    feedStatus.textContent = "Обновляем ленту YouTube…";
    const rss = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(CHANNEL_ID)}`;
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;
    try {
      const response = await fetch(endpoint,{headers:{Accept:"application/json"}});
      if (!response.ok) throw new Error("RSS proxy returned " + response.status);
      const data = await response.json();
      if (data.status !== "ok" || !Array.isArray(data.items)) throw new Error("Invalid RSS response");
      videos = data.items.map(item => ({...item,id:videoIdFromUrl(item.link),category:classify(item.title)})).filter(v=>v.id);
      feedStatus.textContent = `Загружено видео: ${videos.length}. Категории определяются по названию ролика.`;
      $("#videoCount").textContent = `В каталоге: ${videos.length} публикаций`;
      renderVideos();
    } catch(error) {
      console.warn("YouTube RSS:",error);
      feedStatus.textContent = "RSS-сервис временно недоступен. Доступен плейлист канала.";
      videoGrid.innerHTML = '<div class="empty-state">Не удалось загрузить карточки автоматически. Воспользуйся плейлистом во встроенном плеере или открой YouTube-канал.</div>';
      player.src = `https://www.youtube-nocookie.com/embed/videoseries?list=${UPLOADS_PLAYLIST}`;
    }
  }
  $("#refreshVideos").addEventListener("click",loadVideos);
  loadVideos();
})();