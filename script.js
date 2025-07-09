document.getElementById('sargamForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('songTitle').value;
  const sargam = document.getElementById('songSargam').value;

  const newArticle = document.createElement('article');
  newArticle.innerHTML = `<h2>${title}</h2><pre>${sargam}</pre>`;

  document.getElementById('songs-list').appendChild(newArticle);

  this.reset();
});
