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
