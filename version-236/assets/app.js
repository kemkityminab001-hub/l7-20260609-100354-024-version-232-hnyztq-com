const mobileButton = document.querySelector('.mobile-menu-button');
const mobilePanel = document.querySelector('.mobile-panel');

if (mobileButton && mobilePanel) {
  mobileButton.addEventListener('click', () => {
    const opened = mobilePanel.classList.toggle('is-open');
    mobileButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    mobileButton.textContent = opened ? '×' : '☰';
  });
}

document.querySelectorAll('.js-search-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    const input = form.querySelector('input[name="q"]');
    const query = input ? input.value.trim() : '';

    if (!query) {
      event.preventDefault();
      if (input) {
        input.focus();
      }
    }
  });
});

const hero = document.querySelector('.js-hero');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('.hero-dot'));
  let index = 0;
  let timer = null;

  const showSlide = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  const startTimer = () => {
    timer = window.setInterval(() => {
      showSlide(index + 1);
    }, 5200);
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      if (timer) {
        window.clearInterval(timer);
      }

      showSlide(dotIndex);
      startTimer();
    });
  });

  if (slides.length > 1) {
    startTimer();
  }
}

const cardFilter = document.querySelector('.js-card-filter');
const cardList = document.querySelector('.js-card-list');
const filterCount = document.querySelector('.filter-count strong');

if (cardFilter && cardList) {
  const cards = Array.from(cardList.querySelectorAll('.movie-card'));

  const updateCards = () => {
    const keyword = cardFilter.value.trim().toLowerCase();
    let count = 0;

    cards.forEach((card) => {
      const content = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.region,
        card.textContent,
      ].join(' ').toLowerCase();
      const visible = !keyword || content.includes(keyword);
      card.hidden = !visible;

      if (visible) {
        count += 1;
      }
    });

    if (filterCount) {
      filterCount.textContent = String(count);
    }
  };

  cardFilter.addEventListener('input', updateCards);
}

const hlsLoaders = new WeakMap();

async function attachVideo(video, source) {
  if (!video || !source) {
    return;
  }

  if (video.dataset.ready === '1') {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.ready = '1';
    return;
  }

  const module = await import('./hls-vendor-dru42stk.js');
  const Hls = module.H;

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hlsLoaders.set(video, hls);
    video.dataset.ready = '1';
  }
}

async function playVideo(shell) {
  const video = shell.querySelector('.site-video');
  const overlay = shell.querySelector('.video-overlay');
  const source = video ? video.dataset.video : '';

  if (!video || !source) {
    return;
  }

  if (overlay) {
    overlay.classList.add('is-hidden');
  }

  await attachVideo(video, source);

  try {
    await video.play();
  } catch (error) {
    video.controls = true;
  }
}

document.querySelectorAll('.js-video-shell').forEach((shell) => {
  const overlay = shell.querySelector('.video-overlay');
  const video = shell.querySelector('.site-video');

  if (overlay) {
    overlay.addEventListener('click', () => {
      playVideo(shell);
    });
  }

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        playVideo(shell);
      }
    });
  }
});
