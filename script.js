<script>
document.getElementById('sargamForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('songTitle').value.trim();
  const sargam = document.getElementById('songSargam').value.trim();

  if (title && sargam) {
    const article = document.createElement('article');
    article.innerHTML = `<h2>🎵 ${title}</h2><pre>${sargam}</pre>`;
    document.getElementById('songs-list').appendChild(article);
    this.reset();
  }
  });

  document.getElementById('searchInput').addEventListener('input', function () {
    const filter = this.value.toLowerCase();
    const cards = document.querySelectorAll('.song-card');

    cards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      const match = title.includes(filter) || desc.includes(filter);
      card.style.display = match ? 'block' : 'none';
    });
  });
</script>
