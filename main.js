import './style.css';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

let selectedSeats = [];
let maxSeats = 0;

async function initializeTheater() {
  const response = await fetch('/seats.json');
  const data = await response.json();
  
  // Set up header
  const header = document.getElementById('movie-info');
  header.innerHTML = `
    <div class="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-900 text-white">
      <img src="${data.movie.image}" alt="${data.movie.title}" class="w-32 rounded-lg shadow-lg">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold">${data.movie.title}</h1>
        <p class="text-gray-300">Release Date: ${data.movie.releaseDate}</p>
        <p class="text-gray-300">Show Time: ${data.movie.showTime}</p>
        <p class="text-gray-300">Auditorium: ${data.auditorium}</p>
        <div class="flex items-center gap-4">
          <label for="seat-count" class="text-sm">Select seats:</label>
          <select id="seat-count" class="bg-gray-800 rounded px-2 py-1">
            ${[1,2,3,4,5,6].map(num => `<option value="${num}">${num}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  `;

  // Set up seat selection handler
  document.getElementById('seat-count').addEventListener('change', (e) => {
    maxSeats = parseInt(e.target.value);
    selectedSeats = [];
    updateSeatSelection();
  });
  maxSeats = 1; // Default selection

  // Generate seat layout
  const seatContainer = document.getElementById('seat-layout');
  data.seatLayout.forEach((row, rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'flex justify-center gap-1';
    
    row.forEach((seat) => {
      if (seat === '&') {
        const spacer = document.createElement('div');
        spacer.className = 'w-8 h-8 m-1';
        rowDiv.appendChild(spacer);
        return;
      }

      const [seatId, price] = seat.split(':');
      const seatButton = document.createElement('button');
      seatButton.className = `seat ${getSeatClass(seatId, data.seatStatus)}`;
      seatButton.innerHTML = seatId;
      seatButton.dataset.seatId = seatId;
      seatButton.dataset.price = price;

      if (!data.seatStatus[seatId]) {
        seatButton.addEventListener('click', () => toggleSeat(seatId, price));
      }

      tippy(seatButton, {
        content: `Seat ${seatId} - ₹${price}`,
        placement: 'top',
      });

      rowDiv.appendChild(seatButton);
    });

    seatContainer.appendChild(rowDiv);
  });

  // Add legend
  const legend = document.getElementById('legend');
  legend.innerHTML = `
    <div class="flex flex-wrap justify-center gap-4 mt-8 text-sm">
      <div class="flex items-center gap-2">
        <div class="seat seat-available"></div>
        <span>Available</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="seat seat-selected"></div>
        <span>Selected</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="seat seat-taken"></div>
        <span>Taken</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="seat seat-progress"></div>
        <span>In Progress</span>
      </div>
    </div>
  `;
}

function getSeatClass(seatId, statusMap) {
  if (statusMap[seatId] === 'taken') return 'seat-taken';
  if (statusMap[seatId] === 'progress') return 'seat-progress';
  if (selectedSeats.includes(seatId)) return 'seat-selected';
  return 'seat-available';
}

function toggleSeat(seatId, price) {
  const seatIndex = selectedSeats.indexOf(seatId);
  if (seatIndex === -1) {
    if (selectedSeats.length < maxSeats) {
      selectedSeats.push(seatId);
    }
  } else {
    selectedSeats.splice(seatIndex, 1);
  }
  updateSeatSelection();
  updateTotalPrice();
}

function updateSeatSelection() {
  document.querySelectorAll('.seat').forEach(seat => {
    if (!seat.classList.contains('seat-taken') && !seat.classList.contains('seat-progress')) {
      seat.classList.remove('seat-selected');
      if (selectedSeats.includes(seat.dataset.seatId)) {
        seat.classList.add('seat-selected');
      }
    }
  });
}

function updateTotalPrice() {
  const total = selectedSeats.reduce((sum, seatId) => {
    const seatElement = document.querySelector(`[data-seat-id="${seatId}"]`);
    return sum + parseInt(seatElement.dataset.price);
  }, 0);
  
  document.getElementById('total-price').textContent = `Total: ₹${total}`;
}

initializeTheater();