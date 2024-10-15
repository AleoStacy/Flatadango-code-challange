// Your code here
document.addEventListener('DOMContentLoaded', () => {
  const endpoint = 'http://localhost:3000/films'; 

  fetch(endpoint)
    .then((response) => response.json())
    .then((movies) => {
      const filmsList = document.getElementById('films');
      filmsList.innerHTML = ''; 

      movies.forEach((movie) => {
        const filmItem = document.createElement('li');
        filmItem.classList.add('film', 'item'); 
        filmItem.textContent = movie.title; 

        if (movie.capacity - movie.tickets_sold === 0) {
          filmItem.classList.add('sold-out');
        }

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('ui', 'red', 'button', 'mini'); 
        deleteButton.style.marginLeft = '10px'; 
        deleteButton.addEventListener('click', (event) => {
          event.stopPropagation(); 
          deleteMovie(movie.id, filmItem);
        });

        filmItem.appendChild(deleteButton);

        filmItem.addEventListener('click', () => fetchAndUpdateMovieDetails(movie.id));

        filmsList.appendChild(filmItem);
      });
    })
    .catch((error) => {
      console.error('Error fetching movie list:', error);
    });

  function fetchAndUpdateMovieDetails(movieId) {
    fetch(`http://localhost:3000/films/${movieId}`)
      .then((response) => response.json())
      .then((movie) => {
        updateMovieDetails(movie);
      })
      .catch((error) => {
        console.error('Error fetching movie details:', error);
      });
  }

  function updateMovieDetails(movie) {
    document.getElementById('poster').src = movie.poster;

    document.getElementById('title').textContent = movie.title;

    document.getElementById('runtime').textContent = `${movie.runtime} minutes`;

    document.getElementById('showtime').textContent = movie.showtime;

    const remainingTickets = movie.capacity - movie.tickets_sold;

    document.getElementById('ticket-num').textContent = `${remainingTickets} remaining tickets`;

    document.getElementById('film-info').textContent = movie.description;

    const buyButton = document.getElementById('buy-ticket');
    buyButton.disabled = remainingTickets === 0; 
    buyButton.textContent = remainingTickets === 0 ? 'Sold Out' : 'Buy Ticket';

    buyButton.onclick = () => {
      if (remainingTickets > 0) {
        movie.tickets_sold++;

        const newRemainingTickets = movie.capacity - movie.tickets_sold;
        document.getElementById('ticket-num').textContent = `${newRemainingTickets} remaining tickets`;

        if (newRemainingTickets === 0) {
          buyButton.textContent = 'Sold Out';
          buyButton.disabled = true;
        }

        persistTicketsSold(movie);
      }
    };
  }

  function persistTicketsSold(movie) {
    fetch(`http://localhost:3000/films/${movie.id}`, { 
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tickets_sold: movie.tickets_sold,
      }),
    })
      .then((response) => response.json())
      .then((updatedMovie) => {
        console.log('Successfully updated tickets on the server:', updatedMovie);
      })
      .catch((error) => {
        console.error('Error updating tickets on the server:', error);
      });
  }

  function deleteMovie(movieId, filmItem) {
    fetch(`http://localhost:3000/films/${movieId}`, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          filmItem.remove();
          console.log(`Movie with ID ${movieId} deleted successfully.`);
        } else {
          console.error('Error deleting movie from the server');
        }
      })
      .catch((error) => {
        console.error('Error deleting movie:', error);
      });
  }
});
