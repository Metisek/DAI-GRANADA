//ratings.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM załadowany, inicjalizuję modale.');

    // Pobranie referencji do przycisków i modali
    const rateProductModal = document.getElementById('rateProductModal');
    const rateProductButton = document.getElementById('rateProductButton');
    const editRatingButton = document.getElementById('editRatingButton');

    if (rateProductModal) {
        // Inicjalizacja modala Bootstrap bez jQuery
        const modalInstance = new bootstrap.Modal(rateProductModal);

        if (rateProductButton) {
            rateProductButton.addEventListener('click', () => {
                try {
                    modalInstance.show(); // Pokazuje modal
                } catch (error) {
                    console.error('Błąd przy wyświetlaniu modala #rateProductModal:', error);
                    alert('Nie udało się wyświetlić modala.');
                }
            });
        }

        if (editRatingButton) {
            editRatingButton.addEventListener('click', () => {
                try {
                    modalInstance.show(); // Pokazuje modal
                } catch (error) {
                    console.error('Błąd przy wyświetlaniu modala #rateProductModal:', error);
                    alert('Nie udało się wyświetlić modala.');
                }
            });
        }
    } else {
        console.error('Nie znaleziono modala #rateProductModal.');
    }

    // Funkcja do aktualizacji gwiazdek po ocenie
    function updateStars(ele, rating) {
        let new_html_with_stars = '';
        for (let i = 1; i <= 5; i++) {
            new_html_with_stars += `<span class="star ${i <= rating ? 'gold' : 'gray'}" data-_id="${ele.dataset._id}" data-star="${i}">&#9733;</span>`;
        }
        ele.innerHTML = new_html_with_stars;
    }

    // Pobieranie ocen z API
    const ele_stars = document.getElementsByClassName('stars');
    for (const ele of ele_stars) {
        const ide = ele.dataset._id;

        // Pobieranie ogólnej oceny produktu
        fetch(`/api/ratings/${ide}`)
            .then(response => response.json())
            .then(data => {
                const rating = data.rate;
                const count = data.count;
                let new_html_with_stars = '';
                for (let i = 1; i <= 5; i++) {
                    new_html_with_stars += `<span class="star ${i <= rating ? 'gold' : 'gray'}" data-_id="${ide}" data-star="${i}">&#9733;</span>`;
                }
                new_html_with_stars += ` <span>${rating.toFixed(1)} (${count})</span>`;
                ele.innerHTML = new_html_with_stars;
            })
            .catch(error => {
                console.error('Błąd pobierania oceny produktu:', error);
                alert('Błąd pobierania oceny. Sprawdź konsolę.');
            });

        // Pobieranie oceny użytkownika
        fetch(`/api/ratings/user/${ide}`)
            .then(response => response.json())
            .then(data => {
                const userStars = document.querySelector(`.user-stars[data-_id="${ide}"]`);
                if (data.userRating) {
                    let user_html_with_stars = 'Twoja ocena: ';
                    for (let i = 1; i <= 5; i++) {
                        user_html_with_stars += `<span class="star ${i <= data.userRating.rate ? 'gold' : 'gray'}" data-_id="${ide}" data-star="${i}">&#9733;</span>`;
                    }
                    user_html_with_stars += ` ${data.userRating.rate}`;
                    if (userStars) userStars.innerHTML = user_html_with_stars;

                    if (rateProductButton) rateProductButton.style.display = 'none';
                    if (editRatingButton) editRatingButton.style.display = 'block';
                } else {
                    if (rateProductButton) rateProductButton.style.display = 'block';
                    if (editRatingButton) editRatingButton.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Błąd pobierania oceny użytkownika:', error);
                alert('Błąd pobierania oceny użytkownika. Sprawdź konsolę.');
            });
    }

    // Obsługa formularza oceniania produktu
    const rateProductForm = document.getElementById('rateProductForm');
    if (rateProductForm) {
        rateProductForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const productId = rateProductForm.product_id.value;
            const rating = rateProductForm.rating.value;

            fetch(`/api/ratings/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rate: rating }),
            })
                .then(response => {
                    if (response.status === 401) {
                        alert('Musisz być zalogowany, aby ocenić ten produkt.');
                        return;
                    }
                    return response.json();
                })
                .then(data => {
                    if (data) {
                        updateStars(document.querySelector(`.stars[data-_id="${productId}"]`), data.rate);
                        new bootstrap.Modal(rateProductModal).hide();
                        location.reload(); // Odśwież stronę
                    }
                })
                .catch(error => {
                    console.error('Błąd wysyłania oceny:', error);
                    alert('Błąd wysyłania oceny. Sprawdź konsolę.');
                });
        });
    }
});
