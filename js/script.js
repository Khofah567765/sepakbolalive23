function changeChannel(url) {
    document.getElementById('player').src = url;
}

function switchCategory(category) {
    const categories = document.querySelectorAll('.category');
    categories.forEach(cat => cat.classList.remove('active'));

    document.getElementById(category).classList.add('active');
    document.getElementById('current-title').innerText =
        document.getElementById(category).querySelector('h2').innerText;
}
