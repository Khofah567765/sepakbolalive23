<script>
  function switchCategory(categoryId) {
    // Sembunyikan semua kategori
    document.querySelectorAll('.category').forEach(cat => cat.classList.remove('active'));

    // Tampilkan kategori yang dipilih
    const selected = document.getElementById(categoryId);
    selected.classList.add('active');

    // Ambil dan tampilkan judul dari <h2> tersembunyi dalam kategori tersebut
    const newTitle = selected.querySelector('h2')?.innerText || '';
    document.getElementById('current-title').innerText = newTitle;
  }

  function changeChannel(src) {
    document.getElementById('player').src = src;
  }
</script>
