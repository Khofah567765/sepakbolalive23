function changeChannel(url) {
            document.getElementById('player').src = url;
        }

        function switchCategory(category) {
            // Hide all categories
            const categories = document.querySelectorAll('.category');
            categories.forEach(cat => cat.classList.remove('active'));
            
            // Show the selected category
            document.getElementById(category).classList.add('active');

            // Change the title
            document.getElementById('current-title').innerText = document.getElementById(category).querySelector('h2').innerText;
        }
