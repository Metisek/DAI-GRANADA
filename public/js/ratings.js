document.addEventListener('DOMContentLoaded', () => {
    const rateProductModal = document.getElementById('rateProductModal');
    const rateProductButton = document.getElementById('rateProductButton');
    const editRatingButton = document.getElementById('editRatingButton');
    const deleteRatingButton = document.getElementById('deleteRatingButton');
    const ratingSuccessMessage = document.getElementById('ratingSuccessMessage');
    let selectedRating = 0;

    // Obsługa modal
    if (rateProductModal) {
        const modalInstance = new bootstrap.Modal(rateProductModal);

        if (rateProductButton) {
            rateProductButton.addEventListener('click', () => {
                modalInstance.show();
            });
        }

        if (editRatingButton) {
            editRatingButton.addEventListener('click', () => {
                modalInstance.show();
            });
        }

        if (deleteRatingButton) {
            deleteRatingButton.addEventListener('click', () => {
                const productId = rateProductForm.product_id.value;
                fetch(`/api/ratings/${productId}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            location.reload();
                        } else {
                            alert('Failed to delete rating.');
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting rating:', error);
                    });
            });
        }
    }

    // Funkcja do aktualizacji gwiazdek
    function updateStars(element, rating, count) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += `<span class="star ${i <= rating ? 'gold' : 'gray'}">&#9733;</span>`;
        }
        starsHTML += ` <span>${rating.toFixed(1)} (${count})</span>`;
        element.innerHTML = starsHTML;
    }

    // Pobieranie ocen dla produktu
    const starElements = document.getElementsByClassName('stars');
    Array.from(starElements).forEach(element => {
        const productId = element.dataset._id;

        // Pobierz średnią ocenę
        fetch(`/api/ratings/${productId}`)
            .then(response => response.json())
            .then(data => {
                if (data.rate !== undefined) {
                    updateStars(element, data.rate, data.count);
                }
            })
            .catch(error => {
                console.error('Error fetching product rating:', error);
            });

        // Pobierz ocenę użytkownika
        fetch(`/api/ratings/user/${productId}`)
            .then(response => response.json())
            .then(data => {
                console.log('User rating data:', data); // Dodaj logi, aby sprawdzić dane
                const userStars = document.querySelector(`.user-stars[data-_id="${productId}"]`);
                const userRatingDiv = document.getElementById('userRating');

                if (data.userRating !== null && data.userRating !== undefined) {
                    let userStarsHTML = 'Your rating: ';
                    for (let i = 1; i <= 5; i++) {
                        userStarsHTML += `<span class="star ${i <= data.userRating ? 'gold' : 'gray'}">&#9733;</span>`;
                    }
                    userStarsHTML += ` ${data.userRating}`;

                    // Aktualizuj wyświetlanie gwiazdek użytkownika
                    if (userStars) {
                        userStars.innerHTML = userStarsHTML;
                        userStars.style.display = 'block';
                        if (userRatingDiv) {
                            userRatingDiv.style.display = 'block';
                        }
                    } else {
                        console.warn(`Element .user-stars dla produktu ${productId} nie został znaleziony.`);
                    }

                    // Ukryj przycisk dodania oceny, pokaż edycję/usuwanie
                    if (rateProductButton) rateProductButton.style.display = 'none';
                    if (editRatingButton) editRatingButton.style.display = 'block';
                    if (deleteRatingButton) deleteRatingButton.style.display = 'block';
                } else {
                    // Jeśli brak oceny użytkownika, pokaż przycisk dodania
                    if (userStars) {
                        userStars.style.display = 'none';
                    }
                    if (userRatingDiv) {
                        userRatingDiv.style.display = 'none';
                    }
                    if (rateProductButton) rateProductButton.style.display = 'block';
                    if (editRatingButton) editRatingButton.style.display = 'none';
                    if (deleteRatingButton) deleteRatingButton.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching user rating:', error);
            });
    });

    // Obsługa formularza oceny
    const rateProductForm = document.getElementById('rateProductForm');
    if (rateProductForm) {
        rateProductForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const productId = rateProductForm.product_id.value;

            fetch(`/api/ratings/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rate: selectedRating }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        const starsElement = document.querySelector(`.stars[data-_id="${productId}"]`);
                        updateStars(starsElement, data.rate, data.count);

                        const userStars = document.querySelector(`.user-stars[data-_id="${productId}"]`);
                        let userStarsHTML = 'Your rating: ';
                        for (let i = 1; i <= 5; i++) {
                            userStarsHTML += `<span class="star ${i <= selectedRating ? 'gold' : 'gray'}">&#9733;</span>`;
                        }
                        userStarsHTML += ` ${selectedRating}`;
                        if (userStars) {
                            userStars.innerHTML = userStarsHTML;
                            userStars.style.display = 'block';
                        }

                        ratingSuccessMessage.style.display = 'block';
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    }
                })
                .catch(error => {
                    console.error('Error submitting rating:', error);
                });
        });
    }

    // Obsługa kliknięcia gwiazdek w modal
    document.querySelectorAll('.rating-modal .star').forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.star, 10);
            const stars = star.parentElement.children;
            Array.from(stars).forEach((s, index) => {
                s.classList.remove('gold', 'gray');
                s.classList.add(index < selectedRating ? 'gold' : 'gray');
            });
        });
    });
});