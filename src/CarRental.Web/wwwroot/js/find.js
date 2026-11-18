const sortSelect = document.getElementById('sortSelect');
const carsGrid = document.getElementById('carsGrid');
const searchParams = new URLSearchParams(window.location.search);
const savedLocation = sessionStorage.getItem('azuCarSelectedLocation');
const urlLocation = searchParams.get('location');
const selectedPickup = searchParams.get('pickup');
const selectedReturn = searchParams.get('return');
const locationOptions = document.getElementById('locationOptions');
const countText = document.getElementById('carCountText');
const noCarsMessage = document.getElementById('noCarsMessage');
const sampleDataNote = document.getElementById('sampleDataNote');

// default city
let selectedLocation = savedLocation || urlLocation || document.getElementById('filterLocationText')?.textContent.trim() || 'TP. Đà Nẵng';

function resolveVehicleImage(car) {
    const currentImage = car.coverImageUrl || '';
    const vehicleName = `${car.brand || ''} ${car.model || ''} ${car.name || ''}`;
    return window.AzuVehicleImages?.resolve(vehicleName, currentImage) || currentImage;
}

const sampleCars = [
    { name: 'TOYOTA VIOS G 2024', city: 'Hà Nội', district: 'Quận Cầu Giấy', price: '650K', rating: '4.9', trips: 18, year: 2024, seats: 5, image: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Toyota_Vios_%28XP150%29_sedan_front_view.jpg' },
    { name: 'HONDA CITY RS 2023', city: 'Hà Nội', district: 'Quận Đống Đa', price: '680K', rating: '5.0', trips: 12, year: 2023, seats: 5, image: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Honda_City_2020.jpg' },
    { name: 'MAZDA CX-5 PREMIUM 2024', city: 'Hà Nội', district: 'Quận Nam Từ Liêm', price: '1.050K', rating: '4.8', trips: 21, year: 2024, seats: 5, image: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Mazda_CX-5_Newground_1X7A6786.jpg' },
    { name: 'MITSUBISHI XPANDER 2023', city: 'Hà Nội', district: 'Quận Long Biên', price: '850K', rating: '4.9', trips: 15, year: 2023, seats: 7, image: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Mitsubishi_Xpander_Sport_%28depan%29%2C_Palangkaraya.jpg' },
    { name: 'KIA SONET PREMIUM 2024', city: 'TP. Hồ Chí Minh', district: 'Quận 1', price: '720K', rating: '4.9', trips: 16, year: 2024, seats: 5, image: 'https://upload.wikimedia.org/wikipedia/commons/7/75/2021_Kia_Sonet_1.5_Premiere_%28Indonesia%29_front_view_02.jpg' },
    { name: 'TOYOTA VIOS G 2023', city: 'TP. Hồ Chí Minh', district: 'Quận Bình Thạnh', price: '630K', rating: '4.8', trips: 20, year: 2023, seats: 5, image: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Toyota_Vios_%28XP150%29_sedan_front_view.jpg' },
    { name: 'HONDA CR-V L 2024', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', price: '1.250K', rating: '5.0', trips: 11, year: 2024, seats: 7, image: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Honda_CR-V%2C_Auto_2024%2C_Zurich_%28PANA0740%29.jpg' },
    { name: 'FORD TERRITORY TITANIUM 2024', city: 'TP. Hồ Chí Minh', district: 'Quận 7', price: '1.100K', rating: '4.9', trips: 14, year: 2024, seats: 5, image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Ford_Territory_003.jpg' }
];

function createSampleCarCard(car) {
    const card = document.createElement('div');
    card.className = 'car-card';
    card.dataset.sampleListing = 'true';
    card.dataset.city = car.city;
    card.dataset.seats = car.seats || 5;
    const priceKNum = parseInt((car.price || '650').replace(/[^\d]/g, ''), 10) || 650;
    card.dataset.priceK = priceKNum;
    card.dataset.rawPrice = priceKNum * 1000;
    card.dataset.trans = 'auto';
    card.dataset.fuel = (car.name || '').toLowerCase().includes('vf') ? 'electric' : 'gas';
    card.dataset.brand = getCarBrand(car.name);
    card.dataset.carType = getCarBodyType(car.name, car.seats);
    card.dataset.delivery = 'true';
    card.dataset.deposit = 'true';

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'car-img-wrapper';
    const image = document.createElement('img');
    image.src = window.AzuVehicleImages?.resolve(car.name, car.image) || car.image;
    image.addEventListener('error', () => {
        image.src = window.AzuVehicleImages?.placeholder || '';
    }, { once: true });
    image.onerror = () => {
        image.onerror = null;
        image.src = vehicleImagePlaceholder;
    };
    image.alt = car.name;
    imageWrapper.appendChild(image);

    const currentUserId = sessionStorage.getItem('azuCarUserId');
    if (currentUserId && car.ownerId && currentUserId === car.ownerId) {
        card.dataset.isMyCar = 'true';
        const myBadge = document.createElement('span');
        myBadge.className = 'badge-my-car';
        myBadge.innerHTML = '<i class="fa-solid fa-crown" style="color: #fbbf24;"></i> Xe của bạn';
        myBadge.setAttribute('style', 'position: absolute; bottom: 8px; left: 8px; background: rgba(15, 23, 42, 0.9); color: #fff; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; z-index: 2; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 1px solid rgba(251, 191, 36, 0.4);');
        imageWrapper.appendChild(myBadge);
    }

    if (['VIOS', 'CITY', 'XPANDER', 'SONET', 'CR-V'].some(m => car.name.toUpperCase().includes(m))) {
        card.dataset.instant = 'true';
        const badge = document.createElement('span');
        badge.className = 'badge-fast';
        badge.innerHTML = '<i class="fa-solid fa-bolt"></i> ĐẶT NHANH';
        imageWrapper.appendChild(badge);
    }

    const info = document.createElement('div');
    info.className = 'car-info';
    const tags = document.createElement('div');
    tags.className = 'car-tags-top';

    const transmission = document.createElement('span');
    transmission.className = 'tag-trans';
    transmission.textContent = 'SỐ TỰ ĐỘNG';
    const seats = document.createElement('span');
    seats.className = 'tag-seats';
    seats.textContent = `${car.seats} CHỖ`;
    tags.append(transmission, seats);

    const name = document.createElement('h3');
    name.textContent = car.name;
    const details = document.createElement('p');
    details.className = 'car-rating-loc';
    details.append(
        document.createTextNode(`★ ${car.rating} • ${car.trips} chuyến • Đời ${car.year}`),
        document.createElement('br')
    );
    const locationIcon = document.createElement('i');
    locationIcon.className = 'fa-solid fa-location-dot';
    details.append(locationIcon, document.createTextNode(` ${car.city}`));

    const footer = document.createElement('div');
    footer.className = 'car-footer';
    const price = document.createElement('span');
    price.className = 'car-price';
    price.append(document.createTextNode(car.price), document.createElement('span'));
    price.lastElementChild.textContent = '/ngày';
    footer.appendChild(price);
    info.append(tags, name, details, footer);
    card.append(imageWrapper, info);
    return card;
}

let carCards = [];
let initialOrder = [];

function refreshCarCards() {
    carCards = carsGrid ? Array.from(carsGrid.querySelectorAll('.car-card')) : [];
    initialOrder = [...carCards];
}

function createCarCardFromApi(car) {
    const card = document.createElement('div');
    card.className = 'car-card';
    card.dataset.vehicleId = car.vehicleId;
    card.dataset.listingId = car.listingId;
    card.dataset.ownerId = car.ownerId || '';
    card.dataset.ownerName = car.ownerName || '';
    card.dataset.rawPrice = car.pricePerDay;
    card.dataset.priceK = Math.round(Number(car.pricePerDay) / 1000);
    card.dataset.city = (car.city || '').trim();
    card.dataset.district = (car.district || '').trim();
    card.dataset.location = (car.location || '').trim();
    card.dataset.description = (car.description || '').trim();
    card.dataset.plate = (car.licensePlate || car.plate || '').trim();
    card.dataset.seats = car.seats || 5;
    card.dataset.trans = (car.transmission === 'Manual' || car.transmission === 'Số sàn') ? 'manual' : 'auto';

    const rawFuel = (car.fuelType || '').toLowerCase();
    const rawName = (car.name || '').toLowerCase();
    let fuelKey = 'gas';
    if (rawFuel.includes('elec') || rawFuel.includes('điện') || rawName.includes('điện') || rawName.includes('vf')) {
        fuelKey = 'electric';
    } else if (rawFuel.includes('dies') || rawFuel.includes('dầu')) {
        fuelKey = 'diesel';
    }
    card.dataset.fuel = fuelKey;

    const brandKey = (car.brand || getCarBrand(car.name) || '').toLowerCase().trim();
    card.dataset.brand = brandKey;
    card.dataset.carType = getCarBodyType(car.name, car.seats);

    if (car.vehicleId % 2 === 0 || car.vehicleId % 3 === 0) {
        card.dataset.delivery = 'true';
    }
    if (car.vehicleId % 2 === 1 || Number(car.pricePerDay) <= 1000000) {
        card.dataset.deposit = 'true';
    }

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'car-img-wrapper';

    const carUpper = (car.name || '').toUpperCase();
    if (['VIOS', 'CITY', 'XPANDER', 'VF', 'CR-V', 'CROSS', 'ACCENT', 'SANTA', 'CARNIVAL'].some(m => carUpper.includes(m))) {
        card.dataset.instant = 'true';
        const badge = document.createElement('span');
        badge.className = 'badge-fast';
        badge.innerHTML = '<i class="fa-solid fa-bolt"></i> ĐẶT NHANH';
        imageWrapper.appendChild(badge);
    }

    const image = document.createElement('img');
    image.src = resolveVehicleImage(car);
    image.addEventListener('error', () => {
        image.src = window.AzuVehicleImages?.placeholder || '';
    }, { once: true });
    image.onerror = () => {
        image.onerror = null;
        image.src = vehicleImagePlaceholder;
    };
    image.alt = car.name;
    imageWrapper.appendChild(image);

    const currentUserId = sessionStorage.getItem('azuCarUserId');
    if (currentUserId && car.ownerId && currentUserId === car.ownerId) {
        card.dataset.isMyCar = 'true';
        const myBadge = document.createElement('span');
        myBadge.className = 'badge-my-car';
        myBadge.innerHTML = '<i class="fa-solid fa-crown" style="color: #fbbf24;"></i> Xe của bạn';
        myBadge.setAttribute('style', 'position: absolute; bottom: 8px; left: 8px; background: rgba(15, 23, 42, 0.9); color: #fff; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; z-index: 2; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 1px solid rgba(251, 191, 36, 0.4);');
        imageWrapper.appendChild(myBadge);
    }

    const info = document.createElement('div');
    info.className = 'car-info';

    const tags = document.createElement('div');
    tags.className = 'car-tags-top';
    const transSpan = document.createElement('span');
    transSpan.className = 'tag-trans';
    transSpan.textContent = (car.transmission === 'Manual' || car.transmission === 'Số sàn') ? 'SỐ SÀN' : 'SỐ TỰ ĐỘNG';

    const seatsSpan = document.createElement('span');
    seatsSpan.className = 'tag-seats';
    seatsSpan.textContent = `${car.seats} CHỖ`;
    tags.append(transSpan, seatsSpan);

    const h3 = document.createElement('h3');
    h3.textContent = car.name;

    const details = document.createElement('p');
    details.className = 'car-rating-loc';
    const starIcon = document.createElement('i');
    starIcon.className = 'fa-solid fa-star text-warning';
    
    const hasRating = typeof car.rating === 'number' && car.rating > 0;
    const ratingVal = hasRating ? car.rating.toFixed(1) : '';
    const tripsVal = car.totalTrips || 0;
    const yearVal = car.year || 2023;

    if (hasRating) {
        details.append(
            starIcon,
            document.createTextNode(` ${ratingVal} • ${tripsVal} chuyến • `)
        );
    } else {
        const noRatingSpan = document.createElement('span');
        noRatingSpan.style.color = '#64748b';
        noRatingSpan.textContent = 'Chưa có đánh giá';
        details.append(
            noRatingSpan,
            document.createTextNode(` • ${tripsVal} chuyến • `)
        );
    }
    const bYear = document.createElement('b');
    bYear.textContent = `Đời ${yearVal}`;
    details.appendChild(bYear);
    details.appendChild(document.createElement('br'));

    const locIcon = document.createElement('i');
    locIcon.className = 'fa-solid fa-location-dot';
    details.append(locIcon, document.createTextNode(` ${car.city}`));

    const footer = document.createElement('div');
    footer.className = 'car-footer';
    const priceSpan = document.createElement('span');
    priceSpan.className = 'car-price';
    const priceK = Math.round(car.pricePerDay / 1000).toLocaleString('vi-VN') + 'K';
    priceSpan.append(document.createTextNode(priceK), document.createElement('span'));
    priceSpan.lastElementChild.textContent = '/ngày';
    footer.appendChild(priceSpan);

    info.append(tags, h3, details, footer);
    card.append(imageWrapper, info);
    return card;
}

async function loadVehiclesFromApi() {
    if (!carsGrid) return;
    try {
        const response = await fetch('/api/vehicles?pageSize=100');
        if (!response.ok) throw new Error('API error: ' + response.status);
        const resData = await response.json();
        const items = resData?.data?.items || [];
        if (items.length > 0) {
            carsGrid.replaceChildren();
            items.forEach(v => {
                carsGrid.appendChild(createCarCardFromApi(v));
            });
        } else {
            carsGrid.replaceChildren();
            sampleCars.forEach(car => carsGrid.appendChild(createSampleCarCard(car)));
        }
    } catch (err) {
        console.warn('Lỗi khi tải dữ liệu xe từ backend API, sử dụng dữ liệu dự phòng:', err);
        if (carsGrid && carsGrid.querySelectorAll('.car-card').length === 0) {
            carsGrid.replaceChildren();
            sampleCars.forEach(car => carsGrid.appendChild(createSampleCarCard(car)));
        }
    } finally {
        refreshCarCards();
        initCarBadges();
        buildLocationOptions();
        applyLocationFilter(selectedLocation || document.getElementById('filterLocationText')?.textContent);
        // auto open car detail
        const autoVehicleId = searchParams.get('vehicleId');
        if (autoVehicleId) {
            const targetCard = Array.from(carsGrid.querySelectorAll('.car-card'))
                .find(c => c.dataset.vehicleId == autoVehicleId);
            if (targetCard) {
                const carObj = carFromCard(targetCard);
                openCarPopup(carObj);
            } else {
                fetch(`/api/vehicles/${autoVehicleId}`)
                    .then(r => r.json())
                    .then(res => {
                        if (res.isSuccess && res.data) {
                            const d = res.data;
                            openCarPopup({
                                vehicleId: d.vehicleId,
                                listingId: d.listingId,
                                ownerId: d.ownerId,
                                ownerName: d.ownerName,
                                name: d.name,
                                brand: d.brand,
                                model: d.model,
                                year: d.year,
                                seats: d.seats,
                                transmission: d.transmission,
                                fuel: d.fuelType,
                                price: (Number(d.pricePerDay) / 1000).toLocaleString('vi-VN') + 'K',
                                rawPrice: d.pricePerDay,
                                location: d.location,
                                city: d.city,
                                district: d.district,
                                coverImageUrl: d.coverImageUrl,
                                rating: d.rating,
                                totalTrips: d.totalTrips,
                                trips: d.totalTrips
                            });
                        }
                    })
                    .catch(() => {});
            }
        }
    }
}

function getCarLocation(card) {
    return card.dataset.city || '';
}

function normalizeLocation(location) {
    return location
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/\btp\b\.?/gi, '')
        .replace(/\bphuong\b/gi, '')
        .toLocaleLowerCase('vi')
        .replace(/[,.]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function addLocationOption(city, count) {
    const button = document.createElement('button');
    button.className = 'location-option';
    button.type = 'button';
    button.dataset.location = city;

    const icon = document.createElement('span');
    icon.className = 'location-option-icon';
    icon.innerHTML = '<i class="fa-solid fa-location-dot"></i>';

    const details = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = city;
    const meta = document.createElement('small');
    meta.textContent = `${count} xe có sẵn`;
    details.append(name, meta);
    button.append(icon, details);

    button.addEventListener('click', () => {
        selectLocation(city);
    });

    locationOptions.appendChild(button);
}

async function buildLocationOptions() {
    if (!locationOptions) return;
    locationOptions.replaceChildren();

    const cityCounts = new Map();

    try {
        const resp = await fetch('/api/vehicles/cities');
        if (resp.ok) {
            const apiRes = await resp.json();
            if (apiRes && apiRes.isSuccess && Array.isArray(apiRes.data)) {
                apiRes.data.forEach(item => {
                    if (item.city) cityCounts.set(item.city.trim(), item.carCount || 0);
                });
            }
        }
    } catch (e) {
        console.warn('Could not fetch cities from API:', e);
    }

    const defaultCities = ['TP. Đà Nẵng', 'Hà Nội', 'TP. Hồ Chí Minh'];
    defaultCities.forEach(city => {
        if (!cityCounts.has(city)) cityCounts.set(city, 0);
    });

    carCards.forEach(card => {
        const city = (card.dataset.city || '').trim();
        if (city && !cityCounts.has(city)) {
            cityCounts.set(city, 1);
        }
    });

    // list cities
    cityCounts.forEach((count, city) => {
        addLocationOption(city, count);
    });
}

function selectLocation(location) {
    const chosen = (location || '').trim();
    if (!chosen) return;

    selectedLocation = chosen;
    applyLocationFilter(chosen);

    const locationModal = document.getElementById('locationModal');
    if (locationModal) locationModal.classList.remove('active');
}

function applyLocationFilter(location) {
    const chosenLocation = (location || 'TP. Đà Nẵng').trim();
    const heading = document.getElementById('resultsLocationHeading');
    const locationText = document.getElementById('filterLocationText');
    const locationCurrentText = document.getElementById('locationCurrentText');
    const isSampleCity = ['ha noi', 'ho chi minh'].some(city => normalizeLocation(chosenLocation) === city);

    if (locationText) locationText.textContent = chosenLocation;
    if (locationCurrentText) locationCurrentText.textContent = chosenLocation;
    if (heading) heading.textContent = `Xe tự lái tại ${chosenLocation}`;
    if (sampleDataNote) sampleDataNote.hidden = !isSampleCity;

    sessionStorage.setItem('azuCarSelectedLocation', chosenLocation);

    try {
        const url = new URL(window.location.href);
        url.searchParams.set('location', chosenLocation);
        window.history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
    } catch (e) {}

    applyAllFilters();
}

// Location Modal Event Handlers
const openLocationModal = document.getElementById('openLocationModal');
const locationModal = document.getElementById('locationModal');
const locationInput = document.getElementById('locationInput');
const locationCurrentText = document.getElementById('locationCurrentText');
const confirmLocationBtn = document.getElementById('confirmLocationBtn');
const closeLocationModalBtn = locationModal?.querySelector('.location-picker-close');

function showLocationModal() {
    if (!locationModal) return;
    if (locationInput) locationInput.value = '';
    const currentLoc = document.getElementById('filterLocationText')?.textContent.trim() || selectedLocation || 'TP. Đà Nẵng';
    if (locationCurrentText) locationCurrentText.textContent = currentLoc;

    document.querySelectorAll('#locationOptions .location-option').forEach(option => {
        option.hidden = false;
    });
    if (confirmLocationBtn) confirmLocationBtn.hidden = true;

    locationModal.classList.add('active');
    setTimeout(() => locationInput?.focus(), 60);
}

openLocationModal?.addEventListener('click', showLocationModal);
openLocationModal?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showLocationModal();
    }
});

closeLocationModalBtn?.addEventListener('click', () => {
    if (locationModal) locationModal.classList.remove('active');
});

locationModal?.addEventListener('click', (e) => {
    if (e.target === locationModal) {
        locationModal.classList.remove('active');
    }
});

locationInput?.addEventListener('input', function() {
    const query = this.value.trim().toLocaleLowerCase('vi');
    let hasExactMatch = false;
    document.querySelectorAll('#locationOptions .location-option').forEach(option => {
        const loc = option.dataset.location || '';
        const matches = loc.toLocaleLowerCase('vi').includes(query);
        option.hidden = !matches;
        if (loc.toLocaleLowerCase('vi') === query) hasExactMatch = true;
    });
    if (confirmLocationBtn) confirmLocationBtn.hidden = !query || hasExactMatch;
});

locationInput?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const visibleOption = Array.from(document.querySelectorAll('#locationOptions .location-option')).find(option => !option.hidden);
        if (visibleOption && visibleOption.dataset.location.toLocaleLowerCase('vi') === this.value.trim().toLocaleLowerCase('vi')) {
            selectLocation(visibleOption.dataset.location);
        } else if (this.value.trim()) {
            selectLocation(this.value.trim());
        }
    }
});

confirmLocationBtn?.addEventListener('click', () => {
    if (locationInput?.value.trim()) {
        selectLocation(locationInput.value.trim());
    }
});

// Time Modal Event Handlers
const openTimeModal = document.getElementById('openTimeModal');
const timeModal = document.getElementById('timeModal');
const closeTimeModalBtn = timeModal?.querySelector('[data-modal="timeModal"]');
const btnConfirmTime = document.getElementById('btnConfirmTime');
const selectPickupDate = document.getElementById('selectPickupDate');
const selectReturnDate = document.getElementById('selectReturnDate');
const selectedPickupDate = document.getElementById('selectedPickupDate');
const selectedReturnDate = document.getElementById('selectedReturnDate');
const currentMonthYearLabel = document.getElementById('currentMonthYearLabel');
const dynamicCalendarDays = document.getElementById('dynamicCalendarDays');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const pickupTimeSelect = document.getElementById('pickupTimeSelect');
const returnTimeSelect = document.getElementById('returnTimeSelect');
const tabDaily = document.getElementById('tabDaily');
const tabHourly = document.getElementById('tabHourly');
const dailyContent = document.getElementById('dailyContent');
const hourlyContent = document.getElementById('hourlyContent');
const modalPreviewText = document.getElementById('modalPreviewText');
const modalSubPreviewText = document.getElementById('modalSubPreviewText');

let timeModalSelectionTarget = 'start';
let timeModalCurrentMode = 'daily';
let todayDate = new Date();
let viewingYear = todayDate.getFullYear();
let viewingMonth = todayDate.getMonth();
let startDateObj = new Date();
let endDateObj = new Date();
endDateObj.setDate(startDateObj.getDate() + 2);

function formatVnDate(date) {
    if (!date) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

function updateRentalSummary() {
    const timeSummary = document.getElementById('filterTimeText');
    const pickupText = document.getElementById('pickupTimeText')?.textContent.trim();
    const returnText = document.getElementById('returnTimeText')?.textContent.trim();
    if (timeSummary && pickupText && returnText) {
        timeSummary.innerText = `${pickupText} – ${returnText}`;
    }
}

function updateDateSelection() {
    if (selectedPickupDate) selectedPickupDate.innerText = startDateObj ? formatVnDate(startDateObj) : 'Chọn ngày';
    if (selectedReturnDate) selectedReturnDate.innerText = endDateObj ? formatVnDate(endDateObj) : 'Chọn ngày';
    if (selectPickupDate) selectPickupDate.classList.toggle('active', timeModalSelectionTarget === 'start');
    if (selectReturnDate) selectReturnDate.classList.toggle('active', timeModalSelectionTarget === 'end');
    if (btnConfirmTime) {
        btnConfirmTime.disabled = timeModalCurrentMode === 'daily' && (!startDateObj || !endDateObj);
    }
}

function renderTimeModalCalendar() {
    if (!dynamicCalendarDays) return;
    dynamicCalendarDays.innerHTML = '';
    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    if (currentMonthYearLabel) currentMonthYearLabel.innerText = `${monthNames[viewingMonth]}, ${viewingYear}`;

    const firstDayIndex = (new Date(viewingYear, viewingMonth, 1).getDay() + 6) % 7;
    const totalDays = new Date(viewingYear, viewingMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        dynamicCalendarDays.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.innerText = day;
        dayDiv.style.padding = '8px 0';
        dayDiv.style.borderRadius = '6px';
        dayDiv.style.cursor = 'pointer';

        const currentObj = new Date(viewingYear, viewingMonth, day);

        if (startDateObj && currentObj.toDateString() === startDateObj.toDateString()) {
            dayDiv.style.background = '#00a550';
            dayDiv.style.color = '#fff';
            dayDiv.style.fontWeight = '700';
        } else if (endDateObj && currentObj.toDateString() === endDateObj.toDateString()) {
            dayDiv.style.background = '#dcfce7';
            dayDiv.style.color = '#15803d';
            dayDiv.style.fontWeight = '700';
        } else if (endDateObj && currentObj > startDateObj && currentObj < endDateObj) {
            dayDiv.style.background = '#f0fdf4';
        }

        dayDiv.addEventListener('click', () => {
            if (timeModalSelectionTarget === 'start') {
                startDateObj = currentObj;
                endDateObj = null;
                timeModalSelectionTarget = 'end';
            } else if (timeModalSelectionTarget === 'end') {
                if (!startDateObj || currentObj < startDateObj) {
                    startDateObj = currentObj;
                    endDateObj = null;
                } else {
                    endDateObj = currentObj;
                    timeModalSelectionTarget = null;
                }
            } else if (!startDateObj || (startDateObj && endDateObj)) {
                startDateObj = currentObj;
                endDateObj = null;
                timeModalSelectionTarget = 'end';
            } else if (startDateObj && !endDateObj) {
                if (currentObj < startDateObj) {
                    startDateObj = currentObj;
                } else {
                    endDateObj = currentObj;
                    timeModalSelectionTarget = null;
                }
            }
            renderTimeModalCalendar();
            updateDateSelection();
            updateTimePreview();
        });

        dynamicCalendarDays.appendChild(dayDiv);
    }
}

function updateTimePreview() {
    if (!modalPreviewText) return;
    if (timeModalCurrentMode === 'hourly') {
        const hourlyDateInput = document.getElementById('hourlyDateInput');
        const hourlyPickupTime = document.getElementById('hourlyPickupTime');
        const hourlyDuration = document.getElementById('hourlyDuration');
        const rawDate = hourlyDateInput ? hourlyDateInput.value : '';
        let formattedDate = '14/10/2026';
        if (rawDate) {
            const parts = rawDate.split('-');
            if (parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        const time = hourlyPickupTime ? hourlyPickupTime.value : '14:00';
        const hours = parseInt(hourlyDuration ? hourlyDuration.value : '2', 10);
        let [h, m] = time.split(':').map(Number);
        let endH = (h + hours) % 24;
        let endTimeStr = String(endH).padStart(2, '0') + ':' + String(m).padStart(2, '0');

        modalPreviewText.innerText = `${time}, ${formattedDate} - ${endTimeStr}, ${formattedDate}`;
        if (modalSubPreviewText) modalSubPreviewText.innerHTML = `Thời gian thuê: <span style="color: #00a550; font-weight: 700;">${hours} giờ</span>`;
    } else {
        if (!startDateObj) return;
        let startStr = formatVnDate(startDateObj);
        let endStr = endDateObj ? formatVnDate(endDateObj) : startStr;
        let pTime = pickupTimeSelect ? pickupTimeSelect.value : '21:00';
        let rTime = returnTimeSelect ? returnTimeSelect.value : '21:00';

        modalPreviewText.innerText = `${pTime}, ${startStr} - ${rTime}, ${endStr}`;
        if (modalSubPreviewText) {
            if (endDateObj) {
                const sZero = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), startDateObj.getDate());
                const eZero = new Date(endDateObj.getFullYear(), endDateObj.getMonth(), endDateObj.getDate());
                const days = Math.max(1, Math.round((eZero.getTime() - sZero.getTime()) / 86400000) + 1);
                modalSubPreviewText.innerHTML = `Thời gian thuê: <span style="color: #00a550; font-weight: 700;">${days} ngày</span>`;
            } else {
                modalSubPreviewText.innerHTML = `Thời gian thuê: <span style="color: #00a550; font-weight: 700;">Chọn ngày trả</span>`;
            }
        }
    }
}

if (openTimeModal && timeModal) {
    openTimeModal.addEventListener('click', () => {
        timeModalSelectionTarget = 'start';
        timeModal.classList.add('active');
        renderTimeModalCalendar();
        updateDateSelection();
        updateTimePreview();
    });

    closeTimeModalBtn?.addEventListener('click', () => {
        timeModal.classList.remove('active');
    });

    timeModal.addEventListener('click', (e) => {
        if (e.target === timeModal) timeModal.classList.remove('active');
    });

    prevMonthBtn?.addEventListener('click', () => {
        viewingMonth--;
        if (viewingMonth < 0) { viewingMonth = 11; viewingYear--; }
        renderTimeModalCalendar();
    });

    nextMonthBtn?.addEventListener('click', () => {
        viewingMonth++;
        if (viewingMonth > 11) { viewingMonth = 0; viewingYear++; }
        renderTimeModalCalendar();
    });

    selectPickupDate?.addEventListener('click', () => {
        timeModalSelectionTarget = 'start';
        updateDateSelection();
    });

    selectReturnDate?.addEventListener('click', () => {
        timeModalSelectionTarget = startDateObj ? 'end' : 'start';
        updateDateSelection();
    });

    tabDaily?.addEventListener('click', () => {
        timeModalCurrentMode = 'daily';
        tabDaily.style.color = '#00a550'; tabDaily.style.borderBottom = '2px solid #00a550';
        tabHourly.style.color = '#94a3b8'; tabHourly.style.borderBottom = 'none';
        if (dailyContent) dailyContent.style.display = 'block';
        if (hourlyContent) hourlyContent.style.display = 'none';
        updateDateSelection();
        updateTimePreview();
    });

    tabHourly?.addEventListener('click', () => {
        timeModalCurrentMode = 'hourly';
        tabHourly.style.color = '#00a550'; tabHourly.style.borderBottom = '2px solid #00a550';
        tabDaily.style.color = '#94a3b8'; tabDaily.style.borderBottom = 'none';
        if (hourlyContent) hourlyContent.style.display = 'block';
        if (dailyContent) dailyContent.style.display = 'none';
        updateDateSelection();
        updateTimePreview();
    });

    pickupTimeSelect?.addEventListener('change', updateTimePreview);
    returnTimeSelect?.addEventListener('change', updateTimePreview);

    btnConfirmTime?.addEventListener('click', () => {
        if (timeModalCurrentMode === 'daily' && startDateObj) {
            let startStr = formatVnDate(startDateObj);
            let endStr = endDateObj ? formatVnDate(endDateObj) : startStr;
            let pTime = pickupTimeSelect ? pickupTimeSelect.value : '21:00';
            let rTime = returnTimeSelect ? returnTimeSelect.value : '21:00';

            const pEl = document.getElementById('pickupTimeText');
            const rEl = document.getElementById('returnTimeText');
            if (pEl) pEl.innerText = `${pTime}, ${startStr}`;
            if (rEl) rEl.innerText = `${rTime}, ${endStr}`;
        } else if (timeModalCurrentMode === 'hourly' && modalPreviewText) {
            const pEl = document.getElementById('pickupTimeText');
            const rEl = document.getElementById('returnTimeText');
            const parts = modalPreviewText.innerText.split(' - ');
            if (pEl) pEl.innerText = parts[0] || '';
            if (rEl) rEl.innerText = parts[1] || '';
        }

        updateRentalSummary();
        timeModal.classList.remove('active');
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (locationModal) locationModal.classList.remove('active');
        if (timeModal) timeModal.classList.remove('active');
        const filterModal = document.getElementById('filterModal');
        if (filterModal) filterModal.classList.remove('active');
    }
});


// filter engine
const filterModal = document.getElementById('filterModal');
const openFilterModalBtn = document.getElementById('openFilterModalBtn');
const btnResetFilter = document.getElementById('btnResetFilter');
const btnApplyFilter = document.getElementById('btnApplyFilter');

const currentFilters = {
    price: searchParams.get('price') || 'all',
    seats: searchParams.get('seats') || 'all',
    trans: searchParams.get('trans') || 'all',
    fuel: searchParams.get('fuel') || 'all',
    instant: false,
    delivery: false,
    deposit: false,
    brand: searchParams.get('brand') || 'all',
    carType: searchParams.get('carType') || (searchParams.get('seats') === '7' ? '7-seats' : (searchParams.get('seats') === '4' ? '4-seats' : 'all'))
};

// sync url pills
if (currentFilters.carType !== 'all' && pillCarTypeText) {
    if (currentFilters.carType === '7-seats') pillCarTypeText.textContent = '7 chỗ';
    else if (currentFilters.carType === '4-seats') pillCarTypeText.textContent = '4-5 chỗ';
    else if (currentFilters.carType === 'suv') pillCarTypeText.textContent = 'SUV';
    else if (currentFilters.carType === 'electric') pillCarTypeText.textContent = 'Xe điện';
    pillBtnCarType?.classList.add('active');
}
if (currentFilters.brand !== 'all' && pillCarBrandText) {
    pillCarBrandText.textContent = currentFilters.brand.toUpperCase();
    pillBtnCarBrand?.classList.add('active');
}

if (openFilterModalBtn && filterModal) {
    openFilterModalBtn.addEventListener('click', () => {
        filterModal.classList.add('active');
    });

    filterModal.addEventListener('click', (e) => {
        if (e.target === filterModal) {
            filterModal.classList.remove('active');
        }
    });

    filterModal.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterModal.classList.remove('active');
        });
    });

    filterModal.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const group = chip.parentElement;
            group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    btnResetFilter?.addEventListener('click', () => {
        filterModal.querySelectorAll('.filter-chips-grid').forEach(grid => {
            grid.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            grid.querySelector('[data-value="all"]')?.classList.add('active');
        });
        filterModal.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        currentFilters.price = 'all';
        currentFilters.seats = 'all';
        currentFilters.trans = 'all';
        currentFilters.fuel = 'all';
        currentFilters.instant = false;
        currentFilters.delivery = false;
        currentFilters.deposit = false;
        currentFilters.brand = 'all';
        currentFilters.carType = 'all';

        // reset pills
        if (pillCarTypeText) pillCarTypeText.textContent = 'Loại xe';
        pillBtnCarType?.classList.remove('active');
        pillCarTypeMenu?.querySelectorAll('.pill-dropdown-item').forEach(i => {
            i.classList.toggle('active', i.dataset.type === 'all');
        });

        if (pillCarBrandText) pillCarBrandText.textContent = 'Hãng xe';
        pillBtnCarBrand?.classList.remove('active');
        pillCarBrandMenu?.querySelectorAll('.pill-dropdown-item').forEach(i => {
            i.classList.toggle('active', i.dataset.brand === 'all');
        });

        pillBtnInstant?.classList.remove('active');

        applyAllFilters();
        updateFilterBadge();
        filterModal.classList.remove('active');
    });

    btnApplyFilter?.addEventListener('click', () => {
        currentFilters.price = filterModal.querySelector('.filter-chip.active[data-filter="price"]')?.dataset.value || 'all';
        currentFilters.seats = filterModal.querySelector('.filter-chip.active[data-filter="seats"]')?.dataset.value || 'all';
        currentFilters.trans = filterModal.querySelector('.filter-chip.active[data-filter="trans"]')?.dataset.value || 'all';
        currentFilters.fuel = filterModal.querySelector('.filter-chip.active[data-filter="fuel"]')?.dataset.value || 'all';
        currentFilters.instant = !!document.getElementById('filterFeatureInstant')?.checked;
        currentFilters.delivery = !!document.getElementById('filterFeatureDelivery')?.checked;
        currentFilters.deposit = !!document.getElementById('filterFeatureDeposit')?.checked;

        if (pillBtnInstant) pillBtnInstant.classList.toggle('active', currentFilters.instant);

        applyAllFilters();
        updateFilterBadge();
        filterModal.classList.remove('active');
    });
}

function updateFilterBadge() {
    let count = 0;
    if (currentFilters.price !== 'all') count++;
    if (currentFilters.seats !== 'all') count++;
    if (currentFilters.trans !== 'all') count++;
    if (currentFilters.fuel !== 'all') count++;
    if (currentFilters.instant) count++;
    if (currentFilters.delivery) count++;
    if (currentFilters.deposit) count++;
    if (currentFilters.brand !== 'all') count++;
    if (currentFilters.carType !== 'all') count++;

    if (openFilterModalBtn) {
        openFilterModalBtn.classList.toggle('active-filtered', count > 0);
    }
}

function parseCardPriceK(card) {
    if (card.dataset.priceK) return Number(card.dataset.priceK);
    if (card.dataset.rawPrice) return Math.round(Number(card.dataset.rawPrice) / 1000);
    const text = card.querySelector('.car-price')?.textContent || '';
    const match = text.match(/([\d.]+)\s*k/i);
    if (!match) return 0;
    return parseInt(match[1].replace(/\./g, ''), 10) || 0;
}

function parseCardSeats(card) {
    if (card.dataset.seats) return Number(card.dataset.seats);
    const text = card.querySelector('.tag-seats')?.textContent || '';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 5;
}

function parseCardTrans(card) {
    if (card.dataset.trans) return card.dataset.trans;
    const text = (card.querySelector('.tag-trans')?.textContent || '').toLowerCase();
    return text.includes('sàn') ? 'manual' : 'auto';
}

function parseCardFuel(card) {
    if (card.dataset.fuel) return card.dataset.fuel;
    const text = (card.textContent || '').toLowerCase();
    if (text.includes('điện') || text.includes('vf')) return 'electric';
    if (text.includes('dầu') || text.includes('diesel')) return 'diesel';
    return 'gas';
}

function getCarBrand(carName) {
    const n = (carName || '').toLowerCase();
    if (n.includes('toyota')) return 'toyota';
    if (n.includes('hyundai')) return 'hyundai';
    if (n.includes('vinfast') || n.includes('vf')) return 'vinfast';
    if (n.includes('mazda')) return 'mazda';
    if (n.includes('honda')) return 'honda';
    if (n.includes('kia')) return 'kia';
    if (n.includes('ford')) return 'ford';
    if (n.includes('mitsubishi')) return 'mitsubishi';
    return 'other';
}

function getCarBodyType(carName, seats) {
    const n = (carName || '').toLowerCase();
    if (n.includes('ranger') || n.includes('hilux') || n.includes('bán tải')) return 'pickup';
    if (n.includes('vf3') || n.includes('wuling') || n.includes('vf8') || n.includes('vfe34') || n.includes('điện')) return 'electric';
    if (n.includes('xpander') || n.includes('ertiga') || n.includes('br-v') || n.includes('innova') || n.includes('carnival') || n.includes('veloz') || n.includes('xl7')) return 'mpv';
    if (n.includes('cross') || n.includes('sonet') || n.includes('territory') || n.includes('kona') || n.includes('xforce') || n.includes('kicks') || n.includes('mu-x') || n.includes('cx-5') || n.includes('cr-v') || n.includes('tucson') || n.includes('santafe') || n.includes('suv')) return 'suv';
    if (n.includes('vios') || n.includes('city') || n.includes('elantra') || n.includes('mazda 3') || n.includes('accent') || n.includes('cerato') || n.includes('k3') || n.includes('sedan')) return 'sedan';
    return seats >= 7 ? '7-seats' : '4-seats';
}

function isInstantBookingCar(card) {
    if (card.dataset.instant === 'true') return true;
    if (card.querySelector('.badge-fast')) return true;
    const name = (card.querySelector('h3')?.textContent || '').toUpperCase();
    const instantModels = ['VF3', 'CITY', 'SONET', 'VIOS 2026', 'XPANDER', 'MAZDA 3', 'TERRITORY', 'COROLLA CROSS', 'KONA', 'BR-V', 'RANGER'];
    return instantModels.some(m => name.includes(m));
}

function initCarBadges() {
    document.querySelectorAll('.car-card').forEach(card => {
        if (isInstantBookingCar(card)) {
            card.dataset.instant = 'true';
            const imgWrapper = card.querySelector('.car-img-wrapper');
            if (imgWrapper && !imgWrapper.querySelector('.badge-fast')) {
                const badge = document.createElement('span');
                badge.className = 'badge-fast';
                badge.innerHTML = '<i class="fa-solid fa-bolt"></i> ĐẶT NHANH';
                imgWrapper.prepend(badge);
            }
        }
    });
}

function applyAllFilters() {
    const chosenLocation = (document.getElementById('filterLocationText')?.textContent || selectedLocation || 'TP. Đà Nẵng').trim();
    const normalizedChoice = normalizeLocation(chosenLocation);
    let visibleCount = 0;

    const cards = carsGrid ? Array.from(carsGrid.querySelectorAll('.car-card')) : carCards;

    cards.forEach(card => {
        let match = true;

        // check city
        const carCity = normalizeLocation(getCarLocation(card));
        if (normalizedChoice && carCity) {
            const matchesLocation = carCity.includes(normalizedChoice) || normalizedChoice.includes(carCity);
            if (!matchesLocation) {
                match = false;
            }
        }

        const carName = (card.querySelector('h3')?.textContent || '').trim();
        const seats = parseCardSeats(card);
        const cardText = card.textContent.toLowerCase();

        // check car type
        if (match && currentFilters.carType !== 'all') {
            const bodyType = card.dataset.carType || getCarBodyType(carName, seats);
            if (currentFilters.carType === '4-seats' && seats > 5) match = false;
            else if (currentFilters.carType === '7-seats' && seats < 7) match = false;
            else if (currentFilters.carType === 'sedan' && bodyType !== 'sedan') match = false;
            else if (currentFilters.carType === 'suv' && bodyType !== 'suv') match = false;
            else if (currentFilters.carType === 'mpv' && bodyType !== 'mpv') match = false;
            else if (currentFilters.carType === 'pickup' && bodyType !== 'pickup') match = false;
            else if (currentFilters.carType === 'electric' && card.dataset.fuel !== 'electric' && bodyType !== 'electric') match = false;
        }

        // check brand
        if (match && currentFilters.brand !== 'all') {
            const carBrand = (card.dataset.brand || getCarBrand(carName)).toLowerCase();
            if (currentFilters.brand === 'other') {
                const majorBrands = ['toyota', 'hyundai', 'vinfast', 'mazda', 'honda', 'kia', 'ford', 'mitsubishi'];
                if (majorBrands.includes(carBrand)) match = false;
            } else if (carBrand !== currentFilters.brand.toLowerCase()) {
                match = false;
            }
        }

        // check instant
        if (match && currentFilters.instant && !isInstantBookingCar(card)) {
            match = false;
        }

        // check price
        if (match && currentFilters.price !== 'all') {
            const priceK = parseCardPriceK(card);
            if (currentFilters.price === 'under-800' && priceK >= 800) match = false;
            else if (currentFilters.price === '800-1200' && (priceK < 800 || priceK > 1200)) match = false;
            else if (currentFilters.price === 'above-1200' && priceK <= 1200) match = false;
        }

        // check seats
        if (match && currentFilters.seats !== 'all') {
            if (currentFilters.seats === '4' && seats > 5) match = false;
            else if (currentFilters.seats === '7' && seats < 7) match = false;
        }

        // check transmission
        if (match && currentFilters.trans !== 'all') {
            const trans = parseCardTrans(card);
            if (trans !== currentFilters.trans) match = false;
        }

        // check fuel
        if (match && currentFilters.fuel !== 'all') {
            const fuel = parseCardFuel(card);
            if (fuel !== currentFilters.fuel) match = false;
        }

        // check features
        if (match && currentFilters.delivery && card.dataset.delivery !== 'true' && !cardText.includes('tận nơi')) {
            match = false;
        }
        if (match && currentFilters.deposit && card.dataset.deposit !== 'true' && !cardText.includes('thế chấp')) {
            match = false;
        }

        if (match) {
            card.hidden = false;
            card.classList.remove('is-hidden');
            card.style.display = '';
            visibleCount++;
        } else {
            card.hidden = true;
            card.classList.add('is-hidden');
            card.style.display = 'none';
        }
    });

    if (countText) countText.textContent = `Tìm thấy ${visibleCount} xe phù hợp với chuyến đi của bạn`;
    if (noCarsMessage) {
        noCarsMessage.hidden = visibleCount > 0;
        noCarsMessage.style.display = visibleCount > 0 ? 'none' : 'block';
    }
}

if (carsGrid) {
    loadVehiclesFromApi();
}

document.addEventListener('location:selected', event => {
    applyLocationFilter(event.detail.location);
});

if (selectedPickup || selectedReturn) {
    const timeText = document.getElementById('filterTimeText');
    if (timeText) {
        timeText.textContent = [selectedPickup, selectedReturn].filter(Boolean).join(' – ');
    }
}

function currentSearchQuery() {
    const params = new URLSearchParams({
        location: document.getElementById('filterLocationText')?.textContent.trim() || '',
        pickup: document.getElementById('pickupTimeText')?.textContent.trim() || '',
        return: document.getElementById('returnTimeText')?.textContent.trim() || ''
    });
    return params.toString();
}

document.querySelector('.btn-back')?.addEventListener('click', () => {
    window.location.href = `index.html?${currentSearchQuery()}`;
});

const searchBtn = document.querySelector('.btn-search-action');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const loc = document.getElementById('filterLocationText')?.textContent.trim() || '';
        applyLocationFilter(loc);

        searchBtn.style.transform = 'scale(0.96)';
        setTimeout(() => { searchBtn.style.transform = ''; }, 150);

        const resultsSection = document.querySelector('.main-results-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

if (sortSelect && carsGrid) {
    if (!initialOrder || initialOrder.length === 0) initialOrder = Array.from(carsGrid.querySelectorAll('.car-card'));

    const getNumber = (element, selector) => {
        const match = element.querySelector(selector)?.textContent.match(/\d+/);
        return match ? Number(match[0]) : 0;
    };

    sortSelect.addEventListener('change', () => {
        const cards = Array.from(carsGrid.querySelectorAll('.car-card'));

        if (sortSelect.value === 'price-asc') {
            cards.sort((a, b) => getNumber(a, '.car-price') - getNumber(b, '.car-price'));
        } else if (sortSelect.value === 'popular') {
            const tripCount = card => {
                const match = card.querySelector('.car-rating-loc')?.textContent.match(/(\d+)\s*chuyến/);
                return match ? Number(match[1]) : 0;
            };
            cards.sort((a, b) => tripCount(b) - tripCount(a));
        } else {
            cards.sort((a, b) => initialOrder.indexOf(a) - initialOrder.indexOf(b));
        }

        cards.forEach(card => carsGrid.appendChild(card));
    });
}

// quick pills
const pillBtnCarType = document.getElementById('pillBtnCarType');
const pillCarTypeMenu = document.getElementById('pillCarTypeMenu');
const pillCarTypeWrap = document.getElementById('pillCarTypeWrap');
const pillCarTypeText = document.getElementById('pillCarTypeText');

const pillBtnCarBrand = document.getElementById('pillBtnCarBrand');
const pillCarBrandMenu = document.getElementById('pillCarBrandMenu');
const pillCarBrandWrap = document.getElementById('pillCarBrandWrap');
const pillCarBrandText = document.getElementById('pillCarBrandText');

const pillBtnInstant = document.getElementById('pillBtnInstant');

function closeAllPillDropdowns() {
    if (pillCarTypeMenu) pillCarTypeMenu.hidden = true;
    if (pillCarTypeWrap) pillCarTypeWrap.classList.remove('open');
    if (pillBtnCarType) pillBtnCarType.setAttribute('aria-expanded', 'false');

    if (pillCarBrandMenu) pillCarBrandMenu.hidden = true;
    if (pillCarBrandWrap) pillCarBrandWrap.classList.remove('open');
    if (pillBtnCarBrand) pillBtnCarBrand.setAttribute('aria-expanded', 'false');
}

// car type dropdown
pillBtnCarType?.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasOpen = pillCarTypeWrap?.classList.contains('open');
    closeAllPillDropdowns();
    if (!wasOpen) {
        if (pillCarTypeMenu) pillCarTypeMenu.hidden = false;
        pillCarTypeWrap?.classList.add('open');
        pillBtnCarType?.setAttribute('aria-expanded', 'true');
    }
});

// brand dropdown
pillBtnCarBrand?.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasOpen = pillCarBrandWrap?.classList.contains('open');
    closeAllPillDropdowns();
    if (!wasOpen) {
        if (pillCarBrandMenu) pillCarBrandMenu.hidden = false;
        pillCarBrandWrap?.classList.add('open');
        pillBtnCarBrand?.setAttribute('aria-expanded', 'true');
    }
});

// close dropdown outside
document.addEventListener('click', (e) => {
    if (!pillCarTypeWrap?.contains(e.target) && !pillCarBrandWrap?.contains(e.target)) {
        closeAllPillDropdowns();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllPillDropdowns();
    }
});

// select car type
pillCarTypeMenu?.querySelectorAll('.pill-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = item.dataset.type || 'all';
        currentFilters.carType = type;

        pillCarTypeMenu.querySelectorAll('.pill-dropdown-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        if (type === 'all') {
            if (pillCarTypeText) pillCarTypeText.textContent = 'Loại xe';
            pillBtnCarType?.classList.remove('active');
        } else {
            if (pillCarTypeText) pillCarTypeText.textContent = item.textContent.trim();
            pillBtnCarType?.classList.add('active');
        }

        closeAllPillDropdowns();
        applyAllFilters();
        updateFilterBadge();
    });
});

// select brand
pillCarBrandMenu?.querySelectorAll('.pill-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const brand = item.dataset.brand || 'all';
        currentFilters.brand = brand;

        pillCarBrandMenu.querySelectorAll('.pill-dropdown-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        if (brand === 'all') {
            if (pillCarBrandText) pillCarBrandText.textContent = 'Hãng xe';
            pillBtnCarBrand?.classList.remove('active');
        } else {
            if (pillCarBrandText) pillCarBrandText.textContent = item.textContent.trim();
            pillBtnCarBrand?.classList.add('active');
        }

        closeAllPillDropdowns();
        applyAllFilters();
        updateFilterBadge();
    });
});

// toggle instant
pillBtnInstant?.addEventListener('click', () => {
    const isNowActive = !currentFilters.instant;
    currentFilters.instant = isNowActive;
    pillBtnInstant.classList.toggle('active', isNowActive);

    const cb = document.getElementById('filterFeatureInstant');
    if (cb) cb.checked = isNowActive;

    applyAllFilters();
    updateFilterBadge();
});

function carFromCard(card) {
    const location = getCarLocation(card);
    const ratingLocText = card.querySelector('.car-rating-loc')?.textContent || '';
    const ratingMatch = ratingLocText.match(/(\d+\.\d+)/);
    const tripsMatch = ratingLocText.match(/(\d+)\s*chuyến/i);
    const yearMatch = ratingLocText.match(/Đời\s*(\d{4})/i);
    const priceText = card.querySelector('.car-price')?.childNodes[0]?.textContent.trim() || '524K';

    return {
        vehicleId: card.dataset.vehicleId || null,
        listingId: card.dataset.listingId || null,
        ownerId: card.dataset.ownerId || '',
        ownerName: card.dataset.ownerName || '',
        rawPrice: card.dataset.rawPrice ? Number(card.dataset.rawPrice) : null,
        pricePerDay: card.dataset.rawPrice ? Number(card.dataset.rawPrice) : null,
        city: card.dataset.city || '',
        district: card.dataset.district || '',
        location: card.dataset.location || location,
        description: card.dataset.description || '',
        licensePlate: card.dataset.plate || '',
        name: card.querySelector('h3')?.textContent.trim() || 'Xe AZU Car',
        image: card.querySelector('img')?.src || '',
        location,
        price: priceText,
        rating: ratingMatch ? ratingMatch[1] : '5.0',
        trips: tripsMatch ? `${tripsMatch[1]} chuyến` : '0 chuyến',
        year: yearMatch ? yearMatch[1] : '2023',
        transmission: card.querySelector('.tag-trans')?.textContent.trim() || 'Số tự động',
        seats: card.querySelector('.tag-seats')?.textContent.trim() || '5 chỗ'
    };
}

// car detail modal
const carDetailModal = document.getElementById('carDetailModal');
const closeCarPopup = document.getElementById('closeCarPopup');

// ==========================================
// LỊCH KHẢ DỤNG BẬN & TRỐNG CỦA XE (CALENDAR)
// ==========================================
let calCurrentYear = 2026;
let calCurrentMonth = 10; // 0-indexed: 10 = Nov
let calBlockedRanges = [];
let calBookedRanges = [];
let calSelectedStart = null;
let calSelectedEnd = null;
let calSelectionStep = 0; // 0: chọn ngày nhận, 1: chọn ngày trả

function parseDateOnly(dateVal) {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatVNShortDate(date) {
    if (!date) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

function isDayBusy(d) {
    const t = d.getTime();
    const inBlocked = calBlockedRanges.some(r => {
        const s = parseDateOnly(r.startDate);
        const e = parseDateOnly(r.endDate);
        return s && e && t >= s.getTime() && t <= e.getTime();
    });
    if (inBlocked) return true;

    const inBooked = calBookedRanges.some(r => {
        const s = parseDateOnly(r.startDate);
        const e = parseDateOnly(r.endDate);
        return s && e && t >= s.getTime() && t <= e.getTime();
    });
    return inBooked;
}

function isDayPast(d) {
    const today = new Date();
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d.getTime() < todayZero.getTime();
}

function initVehicleCalendar(blockedRanges, bookedRanges) {
    if (Array.isArray(blockedRanges) && blockedRanges.length > 0) calBlockedRanges = blockedRanges;
    if (Array.isArray(bookedRanges) && bookedRanges.length > 0) calBookedRanges = bookedRanges;

    if (!calSelectedStart) {
        const pStr = document.getElementById('pickupTimeText')?.textContent.trim() || document.getElementById('widgetPickupTime')?.textContent.trim();
        const rStr = document.getElementById('returnTimeText')?.textContent.trim() || document.getElementById('widgetReturnTime')?.textContent.trim();
        const pDate = parseVNTimeString(pStr);
        const rDate = parseVNTimeString(rStr);

        const now = new Date();
        if (pDate && !isNaN(pDate.getTime()) && pDate > now) {
            calSelectedStart = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate());
        } else {
            calSelectedStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        }

        if (rDate && !isNaN(rDate.getTime()) && rDate > calSelectedStart) {
            calSelectedEnd = new Date(rDate.getFullYear(), rDate.getMonth(), rDate.getDate());
        } else {
            calSelectedEnd = new Date(calSelectedStart.getTime() + 86400000);
        }
    }

    calCurrentYear = calSelectedStart.getFullYear();
    calCurrentMonth = calSelectedStart.getMonth();
    calSelectionStep = 0;
    renderAvailabilityCalendar();
    updateCalendarTriggerSummary();
}

function updateCalendarTriggerSummary() {
    const summaryText = document.getElementById('calQuickSummaryText');
    const datesText = document.getElementById('calQuickSelectedDatesText');
    if (!summaryText || !datesText) return;

    if (calSelectedStart && calSelectedEnd) {
        const days = Math.max(1, Math.round((calSelectedEnd.getTime() - calSelectedStart.getTime()) / 86400000) + 1);
        summaryText.innerHTML = `<span style="color: #00a550; font-weight: 700;"><i class="fa-solid fa-calendar-check"></i> Đã chọn ${days} ngày thuê</span>`;
        datesText.textContent = `${formatVNShortDate(calSelectedStart)} - ${formatVNShortDate(calSelectedEnd)} (21:00)`;
    } else if (calSelectedStart) {
        summaryText.textContent = 'Đang chọn khoảng ngày thuê...';
        datesText.textContent = `Nhận xe từ: ${formatVNShortDate(calSelectedStart)} (vui lòng chọn ngày trả xe)`;
    } else {
        summaryText.textContent = 'Lịch xe bận & trống';
        datesText.textContent = 'Nhấp để xem chi tiết các ngày đã có người đặt và chọn ngày thuê';
    }
}

function renderAvailabilityCalendar() {
    const monthTitle = document.getElementById('calMonthTitle');
    const daysGrid = document.getElementById('calDaysGrid');
    const prevBtn = document.getElementById('calPrevMonthBtn');
    const selectionText = document.getElementById('calSelectionText');
    const resetBtn = document.getElementById('calResetSelectionBtn');

    if (!daysGrid) return;

    if (monthTitle) {
        monthTitle.textContent = `Tháng ${calCurrentMonth + 1} / ${calCurrentYear}`;
    }

    const now = new Date();
    const currentYearMonth = now.getFullYear() * 12 + now.getMonth();
    const viewYearMonth = calCurrentYear * 12 + calCurrentMonth;
    if (prevBtn) {
        prevBtn.disabled = viewYearMonth <= currentYearMonth;
    }

    daysGrid.innerHTML = '';

    // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDay = new Date(calCurrentYear, calCurrentMonth, 1).getDay();
    const leadSpaces = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < leadSpaces; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cal-day empty';
        daysGrid.appendChild(emptyCell);
    }

    const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(calCurrentYear, calCurrentMonth, day);
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        cell.textContent = day;

        const isPast = isDayPast(dateObj);
        const isBusy = isDayBusy(dateObj);

        if (isPast) {
            cell.classList.add('past');
            cell.title = 'Ngày đã qua';
        } else if (isBusy) {
            cell.classList.add('busy');
            cell.title = 'Xe bận hoặc đã có người đặt';
        } else {
            cell.classList.add('available');
            cell.title = 'Xe trống - Bấm để chọn';
        }

        const timeVal = dateObj.getTime();
        const startTimeVal = calSelectedStart ? calSelectedStart.getTime() : null;
        const endTimeVal = calSelectedEnd ? calSelectedEnd.getTime() : null;

        if (startTimeVal && timeVal === startTimeVal) {
            cell.classList.add('selected-start');
            cell.title = 'Ngày nhận xe';
        } else if (endTimeVal && timeVal === endTimeVal) {
            cell.classList.add('selected-end');
            cell.title = 'Ngày trả xe';
        } else if (startTimeVal && endTimeVal && timeVal > startTimeVal && timeVal < endTimeVal) {
            cell.classList.add('in-selected-range');
        }

        if (!isPast && !isBusy) {
            cell.addEventListener('click', () => handleDayClick(dateObj));
        }

        daysGrid.appendChild(cell);
    }

    if (selectionText) {
        if (calSelectedStart && calSelectedEnd) {
            const days = Math.max(1, Math.round((calSelectedEnd.getTime() - calSelectedStart.getTime()) / 86400000) + 1);
            selectionText.innerHTML = `Đang chọn: <strong>${formatVNShortDate(calSelectedStart)}</strong> đến <strong>${formatVNShortDate(calSelectedEnd)}</strong> (${days} ngày)`;
            if (resetBtn) resetBtn.style.display = 'inline-flex';
        } else if (calSelectedStart) {
            selectionText.innerHTML = `Đã chọn nhận xe: <strong>${formatVNShortDate(calSelectedStart)}</strong>. Hãy bấm chọn ngày trả xe.`;
            if (resetBtn) resetBtn.style.display = 'inline-flex';
        } else {
            selectionText.textContent = 'Bấm trực tiếp vào ngày trên lịch để chọn ngày nhận và trả xe.';
            if (resetBtn) resetBtn.style.display = 'none';
        }
    }
}

function handleDayClick(clickedDate) {
    if (calSelectionStep === 0 || (calSelectedStart && calSelectedEnd)) {
        calSelectedStart = clickedDate;
        calSelectedEnd = null;
        calSelectionStep = 1;
        renderAvailabilityCalendar();
        updateCalendarTriggerSummary();
    } else {
        if (clickedDate.getTime() <= calSelectedStart.getTime()) {
            calSelectedStart = clickedDate;
            calSelectedEnd = null;
            calSelectionStep = 1;
            renderAvailabilityCalendar();
            updateCalendarTriggerSummary();
        } else {
            let hasBusyInRange = false;
            let checkD = new Date(calSelectedStart.getTime() + 86400000);
            while (checkD.getTime() <= clickedDate.getTime()) {
                if (isDayBusy(checkD)) {
                    hasBusyInRange = true;
                    break;
                }
                checkD.setDate(checkD.getDate() + 1);
            }

            if (hasBusyInRange) {
                alert('Khoảng thời gian này có ngày xe bận hoặc đã có người đặt. Vui lòng chọn khoảng thời gian trống liên tục.');
                return;
            }

            calSelectedEnd = clickedDate;
            calSelectionStep = 0;

            const widgetPickup = document.getElementById('widgetPickupTime');
            const widgetReturn = document.getElementById('widgetReturnTime');
            if (widgetPickup) widgetPickup.textContent = `21:00, ${formatVNShortDate(calSelectedStart)}`;
            if (widgetReturn) widgetReturn.textContent = `21:00, ${formatVNShortDate(calSelectedEnd)}`;

            const rawDaily = currentPopupCar?.rawPrice || 524000;
            updatePricingCalculation(rawDaily);
            renderAvailabilityCalendar();
            updateCalendarTriggerSummary();
        }
    }
}

// calendar navigation buttons
document.getElementById('calPrevMonthBtn')?.addEventListener('click', () => {
    calCurrentMonth--;
    if (calCurrentMonth < 0) {
        calCurrentMonth = 11;
        calCurrentYear--;
    }
    renderAvailabilityCalendar();
});

document.getElementById('calNextMonthBtn')?.addEventListener('click', () => {
    calCurrentMonth++;
    if (calCurrentMonth > 11) {
        calCurrentMonth = 0;
        calCurrentYear++;
    }
    renderAvailabilityCalendar();
});

document.getElementById('calResetSelectionBtn')?.addEventListener('click', () => {
    calSelectedStart = null;
    calSelectedEnd = null;
    calSelectionStep = 0;
    renderAvailabilityCalendar();
    updateCalendarTriggerSummary();
});

// Modal Lịch xe bận & trống
function openCarCalendarModal() {
    const modal = document.getElementById('carCalendarModal');
    if (!modal) return;
    modal.hidden = false;
    renderAvailabilityCalendar();
}

function closeCarCalendarModal() {
    const modal = document.getElementById('carCalendarModal');
    if (modal) modal.hidden = true;
}

document.getElementById('btnOpenCarCalendarModal')?.addEventListener('click', (e) => {
    e.preventDefault();
    openCarCalendarModal();
});

document.getElementById('closeCarCalendarModal')?.addEventListener('click', closeCarCalendarModal);
document.getElementById('btnCloseCarCalendarBottom')?.addEventListener('click', closeCarCalendarModal);

document.getElementById('carCalendarModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('carCalendarModal')) {
        closeCarCalendarModal();
    }
});

document.getElementById('btnApplyCalendarSelection')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (calSelectedStart && calSelectedEnd) {
        const widgetPickup = document.getElementById('widgetPickupTime');
        const widgetReturn = document.getElementById('widgetReturnTime');
        if (widgetPickup) widgetPickup.textContent = `21:00, ${formatVNShortDate(calSelectedStart)}`;
        if (widgetReturn) widgetReturn.textContent = `21:00, ${formatVNShortDate(calSelectedEnd)}`;

        const rawDaily = currentPopupCar?.rawPrice || 524000;
        updatePricingCalculation(rawDaily);
    }
    updateCalendarTriggerSummary();
    closeCarCalendarModal();
});

let currentPopupCar = null;

function openCarPopup(car) {
    currentPopupCar = car;
    if (typeof toggleOwnerListingEditMode === 'function') {
        toggleOwnerListingEditMode(false);
    }
    if (typeof loadCustomListingAttributes === 'function') {
        loadCustomListingAttributes(car.vehicleId);
    }

    // car header
    const titleEl = document.getElementById('popupCarTitle');
    if (titleEl) titleEl.textContent = car.name;

    const ratingEl = document.getElementById('popupCarRating');
    if (ratingEl) ratingEl.textContent = car.rating || '5.0';

    const tripsEl = document.getElementById('popupCarTrips');
    if (tripsEl) tripsEl.textContent = car.trips || '24 chuyến';

    const locEl = document.getElementById('popupCarLoc');
    if (locEl) locEl.textContent = car.location || 'TP. Đà Nẵng';

    const specificLocEl = document.getElementById('popupCarSpecificLoc');
    if (specificLocEl) specificLocEl.textContent = car.location || 'TP. Đà Nẵng';

    const widgetCarLocShort = document.getElementById('widgetCarLocShort');
    if (widgetCarLocShort) widgetCarLocShort.textContent = car.location || 'TP. Đà Nẵng';

    // gallery
    const mainImg = document.getElementById('popupMainImg');
    const thumb1 = document.getElementById('popupThumb1');
    const thumb2 = document.getElementById('popupThumb2');
    const thumb3 = document.getElementById('popupThumb3');

    const resolvedCarImage = resolveVehicleImage(car);
    if (mainImg) mainImg.src = resolvedCarImage;
    if (thumb1) thumb1.src = resolvedCarImage;
    if (thumb2) thumb2.src = resolvedCarImage;
    if (thumb3) thumb3.src = resolvedCarImage;

    // owner info
    const ownerNameEl = document.getElementById('popupOwnerName');
    const ownerAvatarText = document.getElementById('popupOwnerAvatarText');
    const ownerRatingEl = document.getElementById('popupOwnerRating');
    const nameToDisplay = car.ownerName || 'Chủ xe AZU';
    if (ownerNameEl) ownerNameEl.textContent = nameToDisplay;
    if (ownerAvatarText) ownerAvatarText.textContent = Array.from(nameToDisplay.trim())[0]?.toUpperCase() || 'C';
    if (ownerRatingEl) {
        const hasCarR = typeof car.rating === 'number' && car.rating > 0;
        const trCount = car.trips || car.totalTrips || 0;
        ownerRatingEl.innerHTML = hasCarR
            ? `<i class="fa-solid fa-star star-gold"></i> ${car.rating.toFixed(1)} • ${trCount} chuyến`
            : `Chưa có đánh giá • ${trCount} chuyến`;
    }

    const currentUserId = sessionStorage.getItem('azuCarUserId');
    const isMyCar = Boolean(currentUserId && car.ownerId && currentUserId === car.ownerId);
    const selfBadge = document.getElementById('popupOwnerSelfBadge');
    if (selfBadge) selfBadge.style.display = isMyCar ? 'inline-flex' : 'none';

    const btnRent = document.getElementById('btnRentCarSubmit');
    const btnOwnerManage = document.getElementById('btnOwnerManageCar');
    if (btnRent && btnOwnerManage) {
        if (isMyCar) {
            btnRent.style.display = 'none';
            btnOwnerManage.style.display = 'flex';
        } else {
            btnRent.style.display = 'block';
            btnOwnerManage.style.display = 'none';
        }
    }
    // load car detail api
    if (car.vehicleId) {
        fetch(`/api/vehicles/${car.vehicleId}`)
            .then(res => res.json())
            .then(detailRes => {
                if (detailRes.isSuccess && detailRes.data) {
                    const d = detailRes.data;
                    initVehicleCalendar(d.blockedRanges || [], d.bookedRanges || []);
                    if (d.images && d.images.length > 0) {
                        if (mainImg) mainImg.src = d.images[0].imagePath;
                        if (thumb1) thumb1.src = d.images[0].imagePath;
                        if (thumb2 && d.images[1]) thumb2.src = d.images[1].imagePath;
                        if (thumb3 && d.images[2]) thumb3.src = d.images[2].imagePath;
                    }
                    if (d.fuelType && fuelEl) {
                        const isElec = /electric|điện/i.test(d.fuelType);
                        fuelEl.textContent = isElec ? 'Điện' : (d.fuelType === 'Diesel' ? 'Dầu' : 'Xăng');
                    }
                    if (d.ownerName) {
                        if (ownerNameEl) ownerNameEl.textContent = d.ownerName;
                        if (ownerAvatarText) ownerAvatarText.textContent = Array.from(d.ownerName.trim())[0]?.toUpperCase() || 'C';
                    }
                    if (ownerRatingEl) {
                        const hasR = typeof d.rating === 'number' && d.rating > 0;
                        const t = d.totalTrips || 0;
                        ownerRatingEl.innerHTML = hasR
                            ? `<i class="fa-solid fa-star star-gold"></i> ${d.rating.toFixed(1)} • ${t} chuyến`
                            : `Chưa có đánh giá • ${t} chuyến`;
                    }
                    if (d.description) {
                        const descEl = document.getElementById('popupCarDescription');
                        if (descEl) descEl.innerHTML = `<p>${d.description.replace(/\n/g, '<br>')}</p>`;
                    }
                    if (d.location || d.city) {
                        const hostLocEl = document.getElementById('bookHostLocation');
                        if (hostLocEl) hostLocEl.textContent = `${d.location || d.city} (Miễn phí)`;
                        const specificLoc = document.getElementById('popupCarSpecificLoc');
                        if (specificLoc) specificLoc.textContent = d.location || d.city;
                    }
                    const uid = sessionStorage.getItem('azuCarUserId');
                    const isOwnerOfCar = Boolean(uid && d.ownerId && uid === d.ownerId);
                    if (selfBadge) selfBadge.style.display = isOwnerOfCar ? 'inline-flex' : 'none';
                    if (btnRent && btnOwnerManage) {
                        if (isOwnerOfCar) {
                            btnRent.style.display = 'none';
                            btnOwnerManage.style.display = 'flex';
                        } else {
                            btnRent.style.display = 'block';
                            btnOwnerManage.style.display = 'none';
                        }
                    }

                    if (d) {
                        Object.assign(currentPopupCar, d);
                    }
                    const sp = new URLSearchParams(window.location.search);
                    if (sp.get('action') === 'edit' && isOwnerOfCar) {
                        if (typeof toggleOwnerListingEditMode === 'function') {
                            toggleOwnerListingEditMode(true);
                        }
                    }

                    // render customer reviews
                    const reviewsHeading = document.getElementById('popupReviewsHeading') || carDetailModal?.querySelector('.car-popup-section .section-subheading');
                    const reviewsGrid = document.getElementById('popupReviewsGrid') || carDetailModal?.querySelector('.reviews-grid');
                    const moreReviewsBtn = document.getElementById('popupMoreReviewsBtn') || carDetailModal?.querySelector('.btn-more-reviews');

                    const totalRevCount = typeof d.totalReviews === 'number' ? d.totalReviews : (d.reviews ? d.reviews.length : 0);
                    const hasRev = typeof d.rating === 'number' && d.rating > 0 && totalRevCount > 0;

                    if (reviewsHeading) {
                        reviewsHeading.innerHTML = hasRev
                            ? `<i class="fa-solid fa-star star-gold"></i> ${d.rating.toFixed(1)} • ${totalRevCount} đánh giá`
                            : `Chưa có đánh giá (${totalRevCount} đánh giá)`;
                    }

                    if (reviewsGrid) {
                        const reviews = Array.isArray(d.reviews) ? d.reviews : [];
                        if (reviews.length === 0) {
                            reviewsGrid.innerHTML = '<p class="review-text" style="grid-column: 1 / -1; color: #94a3b8; font-style: italic; padding: 8px 0;">Xe chưa có đánh giá nào từ khách thuê.</p>';
                            if (moreReviewsBtn) moreReviewsBtn.style.display = 'none';
                        } else {
                            let showingAll = false;
                            const renderList = (limit) => {
                                reviewsGrid.innerHTML = '';
                                const items = limit ? reviews.slice(0, limit) : reviews;
                                items.forEach(r => {
                                    const card = document.createElement('div');
                                    card.className = 'review-card';
                                    const rawName = (r.reviewerName || 'Khách thuê').trim();
                                    const parts = rawName.split(/\s+/).filter(Boolean);
                                    const initials = parts.length >= 2
                                        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                                        : rawName.substring(0, 2).toUpperCase();
                                    const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '';
                                    const stars = Math.max(1, Math.min(5, r.rating || 5));
                                    const starsHtml = Array.from({ length: 5 }, (_, i) =>
                                        `<i class="fa-${i < stars ? 'solid' : 'regular'} fa-star"></i>`
                                    ).join('');

                                    const userDiv = document.createElement('div');
                                    userDiv.className = 'review-user';

                                    const avatarDiv = document.createElement('div');
                                    avatarDiv.className = 'review-avatar';
                                    avatarDiv.textContent = initials;

                                    const userInfoDiv = document.createElement('div');
                                    userInfoDiv.className = 'review-user-info';
                                    const h4 = document.createElement('h4');
                                    h4.textContent = rawName;
                                    const starsDiv = document.createElement('div');
                                    starsDiv.className = 'review-stars';
                                    starsDiv.innerHTML = starsHtml;
                                    userInfoDiv.appendChild(h4);
                                    userInfoDiv.appendChild(starsDiv);

                                    const dateSpan = document.createElement('span');
                                    dateSpan.className = 'review-date';
                                    dateSpan.textContent = dateStr;

                                    // report review (UC-S-04)
                                    const reportBtn = document.createElement('button');
                                    reportBtn.type = 'button';
                                    reportBtn.className = 'btn-report-review';
                                    reportBtn.title = 'Báo cáo đánh giá sai sự thật / vi phạm';
                                    reportBtn.style.cssText = 'background:transparent; border:none; color:#94a3b8; cursor:pointer; font-size:12px; margin-left:8px; padding:2px 4px; border-radius:4px; transition:all 0.15s;';
                                    reportBtn.innerHTML = '<i class="fa-regular fa-flag"></i>';
                                    reportBtn.addEventListener('mouseenter', () => { reportBtn.style.color = '#ef4444'; });
                                    reportBtn.addEventListener('mouseleave', () => { reportBtn.style.color = '#94a3b8'; });
                                    reportBtn.addEventListener('click', async (e) => {
                                        e.stopPropagation();
                                        if (!window.AzuStore.isLoggedIn()) {
                                            alert('Vui lòng đăng nhập để gửi báo cáo đánh giá.');
                                            return;
                                        }
                                        const reason = prompt('Nhập lý do báo cáo đánh giá này (sai sự thật, xúc phạm, thông tin sai lệch...):');
                                        if (!reason || reason.trim().length < 5) {
                                            if (reason !== null) alert('Vui lòng nhập lý do tối thiểu 5 ký tự.');
                                            return;
                                        }
                                        reportBtn.disabled = true;
                                        try {
                                            const res = await fetch(`/api/reviews/${r.reviewId}/report`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ reviewId: r.reviewId, reason: reason.trim() })
                                            });
                                            const data = await res.json();
                                            if (res.ok && data.isSuccess) {
                                                alert(data.message || 'Báo cáo đánh giá đã được gửi thành công đến Quản trị viên!');
                                                reportBtn.innerHTML = '<i class="fa-solid fa-flag" style="color:#ef4444"></i>';
                                                reportBtn.title = 'Đã báo cáo';
                                            } else {
                                                alert('Lỗi: ' + (data?.message || 'Không thể gửi báo cáo.'));
                                            }
                                        } catch(err) {
                                            alert('Lỗi kết nối máy chủ.');
                                        } finally {
                                            reportBtn.disabled = false;
                                        }
                                    });

                                    userDiv.appendChild(avatarDiv);
                                    userDiv.appendChild(userInfoDiv);
                                    userDiv.appendChild(dateSpan);
                                    userDiv.appendChild(reportBtn);

                                    const p = document.createElement('p');
                                    p.className = 'review-text';
                                    p.textContent = r.comment || 'Chuyến đi rất tốt!';

                                    card.appendChild(userDiv);
                                    card.appendChild(p);
                                    reviewsGrid.appendChild(card);
                                });
                            };

                            renderList(4);

                            if (moreReviewsBtn) {
                                if (reviews.length > 4) {
                                    moreReviewsBtn.style.display = 'inline-block';
                                    moreReviewsBtn.textContent = 'Xem thêm';
                                    moreReviewsBtn.onclick = () => {
                                        showingAll = !showingAll;
                                        renderList(showingAll ? null : 4);
                                        moreReviewsBtn.textContent = showingAll ? 'Thu gọn' : 'Xem thêm';
                                    };
                                } else {
                                    moreReviewsBtn.style.display = 'none';
                                }
                            }
                        }
                    }
                }
            })
            .catch(() => {});
    }

    // specs
    const transEl = document.getElementById('popupCarTrans');
    if (transEl) transEl.textContent = car.transmission || 'Số tự động';

    const seatsEl = document.getElementById('popupCarSeats');
    if (seatsEl) seatsEl.textContent = car.seats || '4 chỗ';

    const isElectric = /VF|Vinfast|Điện|Electric/i.test(car.name);
    const fuelEl = document.getElementById('popupCarFuel');
    const fuelIcon = document.getElementById('popupFuelIcon');
    const consEl = document.getElementById('popupCarConsumption');
    if (fuelEl) fuelEl.textContent = isElectric ? 'Điện' : 'Xăng';
    if (fuelIcon) {
        fuelIcon.className = isElectric ? 'fa-solid fa-bolt-lightning spec-icon' : 'fa-solid fa-gas-pump spec-icon';
    }
    if (consEl) consEl.textContent = isElectric ? '210km' : '6.5L/100km';

    // pricing
    let rawPrice = parseInt(String(car.price || '524').replace(/\D/g, ''), 10);
    if (!rawPrice || rawPrice < 100) rawPrice = 524;
    const priceVND = car.rawPrice || (rawPrice * 1000);
    const priceK = car.price || `${rawPrice}K`;

    const widgetPriceBig = document.getElementById('widgetPriceBig');
    if (widgetPriceBig) widgetPriceBig.textContent = priceK;

    const calcBasePrice = document.getElementById('calcBasePrice');
    if (calcBasePrice) calcBasePrice.textContent = `${priceVND.toLocaleString('vi-VN')}đ /ngày`;

    // dates
    const pickupTimeText = document.getElementById('pickupTimeText')?.textContent.trim() || '21:00, 15/10/2026';
    const returnTimeText = document.getElementById('returnTimeText')?.textContent.trim() || '21:00, 16/10/2026';
    const widgetPickup = document.getElementById('widgetPickupTime');
    const widgetReturn = document.getElementById('widgetReturnTime');
    if (widgetPickup) widgetPickup.textContent = pickupTimeText;
    if (widgetReturn) widgetReturn.textContent = returnTimeText;

    updatePricingCalculation(priceVND);
    initVehicleCalendar([], []);
    if (typeof updateCalendarTriggerSummary === 'function') {
        updateCalendarTriggerSummary();
    }

    // open popup
    if (carDetailModal) {
        carDetailModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }
}

function updatePricingCalculation(overrideDailyVND) {
    let days = 1;
    if (calSelectedStart && calSelectedEnd) {
        days = Math.max(1, Math.round((calSelectedEnd.getTime() - calSelectedStart.getTime()) / 86400000) + 1);
    }

    let rawDaily = overrideDailyVND;
    if (!rawDaily) {
        rawDaily = currentPopupCar?.rawPrice || (parseInt(String(currentPopupCar?.price || '524').replace(/\D/g, ''), 10) * 1000) || 524000;
    }

    const subtotal = rawDaily * days;
    const insuranceFee = 66501 * days;
    const passengerCheck = document.getElementById('passengerInsuranceCheck');
    const passengerFee = (passengerCheck && passengerCheck.checked) ? (30000 * days) : 0;

    const deliveryRadio = document.querySelector('input[name="deliveryOption"]:checked');
    const isDelivery = deliveryRadio && deliveryRadio.value === 'delivery';
    const deliveryFee = isDelivery ? 15000 : 0;

    const calcDeliveryFee = document.getElementById('calcDeliveryFee');
    if (calcDeliveryFee) {
        calcDeliveryFee.textContent = isDelivery ? '15.000đ (1km)' : 'Miễn phí';
        calcDeliveryFee.style.color = isDelivery ? '#2563eb' : '#10b981';
    }

    const rowPassenger = document.getElementById('rowPassengerInsurance');
    if (rowPassenger) rowPassenger.style.display = passengerFee > 0 ? 'flex' : 'none';

    const totalPrice = subtotal + insuranceFee + passengerFee + deliveryFee;
    const calcTotalPrice = document.getElementById('calcTotalPrice');
    if (calcTotalPrice) calcTotalPrice.textContent = `${totalPrice.toLocaleString('vi-VN')}đ`;

    const calcBasePrice = document.getElementById('calcBasePrice');
    if (calcBasePrice) calcBasePrice.textContent = `${rawDaily.toLocaleString('vi-VN')}đ /ngày (${days} ngày)`;
}

// options change
document.getElementById('passengerInsuranceCheck')?.addEventListener('change', () => {
    const rawPrice = currentPopupCar?.rawPrice || (parseInt(String(currentPopupCar?.price || '524').replace(/\D/g, ''), 10) * 1000) || 524000;
    updatePricingCalculation(rawPrice);
});

document.querySelectorAll('input[name="deliveryOption"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const rawPrice = currentPopupCar?.rawPrice || (parseInt(String(currentPopupCar?.price || '524').replace(/\D/g, ''), 10) * 1000) || 524000;
        updatePricingCalculation(rawPrice);
    });
});

// close popup
function closeCarModal() {
    if (typeof toggleOwnerListingEditMode === 'function') {
        toggleOwnerListingEditMode(false);
    }
    if (typeof closeCarCalendarModal === 'function') {
        closeCarCalendarModal();
    }
    if (carDetailModal) carDetailModal.hidden = true;
    document.body.style.overflow = '';
}

closeCarPopup?.addEventListener('click', closeCarModal);

carDetailModal?.addEventListener('click', (e) => {
    if (e.target === carDetailModal) {
        closeCarModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const calModal = document.getElementById('carCalendarModal');
        if (calModal && !calModal.hidden) {
            closeCarCalendarModal();
            return;
        }
        if (carDetailModal && !carDetailModal.hidden) {
            closeCarModal();
        }
    }
});

// booking modal
const bookingModal = document.getElementById('bookingModal');
const closeBookingModalBtn = document.getElementById('closeBookingModal');
const btnBackToCar = document.getElementById('btnBackToCar');
const bookingCheckoutForm = document.getElementById('bookingCheckoutForm');
const deliveryAddressGroup = document.getElementById('deliveryAddressGroup');
const bookDeliveryAddress = document.getElementById('bookDeliveryAddress');

function parseVNTimeString(str) {
    if (!str) return new Date();
    const match = str.match(/(?:(\d{1,2}):(\d{1,2}),?\s*)?(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
        const hours = match[1] ? parseInt(match[1], 10) : 9;
        const minutes = match[2] ? parseInt(match[2], 10) : 0;
        const day = parseInt(match[3], 10);
        const month = parseInt(match[4], 10) - 1;
        const year = parseInt(match[5], 10);
        return new Date(Date.UTC(year, month, day, hours, minutes));
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date() : d;
}

function getSelectedBookingDates() {
    if (calSelectedStart && calSelectedEnd) {
        const start = new Date(calSelectedStart);
        start.setHours(9, 0, 0, 0);
        const end = new Date(calSelectedEnd);
        end.setHours(21, 0, 0, 0);
        return { start, end };
    }

    const pStr = document.getElementById('bookPickupTime')?.textContent.trim() || document.getElementById('pickupTimeText')?.textContent.trim();
    const rStr = document.getElementById('bookReturnTime')?.textContent.trim() || document.getElementById('returnTimeText')?.textContent.trim();
    
    let start = parseVNTimeString(pStr);
    let end = parseVNTimeString(rStr);

    const now = new Date();
    if (start <= now) {
        start = new Date(Date.now() + 24 * 3600 * 1000);
        start.setMinutes(0, 0, 0);
    }
    if (end <= start) {
        end = new Date(start.getTime() + 2 * 24 * 3600 * 1000);
    }

    return { start, end };
}

async function refreshBookingPrice() {
    if (!currentPopupCar) return;
    const dates = getSelectedBookingDates();
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked')?.value || 'host';

    if (currentPopupCar.listingId) {
        try {
            const resp = await fetch('/api/bookings/calculate-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: Number(currentPopupCar.listingId),
                    startDate: dates.start.toISOString(),
                    endDate: dates.end.toISOString(),
                    deliveryMethod: deliveryMethod
                })
            });
            if (resp.ok) {
                const resData = await resp.json();
                if (resData.isSuccess && resData.data) {
                    const d = resData.data;
                    document.getElementById('bookBasePrice') && (document.getElementById('bookBasePrice').textContent = `${d.rentalSubtotal.toLocaleString('vi-VN')} đ (${d.rentalDays} ngày)`);
                    document.getElementById('bookInsurancePrice') && (document.getElementById('bookInsurancePrice').textContent = `${d.insuranceFee.toLocaleString('vi-VN')} đ`);
                    document.getElementById('bookDeliveryFee') && (document.getElementById('bookDeliveryFee').textContent = d.deliveryFee > 0 ? `${d.deliveryFee.toLocaleString('vi-VN')} đ` : 'Miễn phí');
                    document.getElementById('bookTotalPrice') && (document.getElementById('bookTotalPrice').textContent = `${d.priceLockedTotal.toLocaleString('vi-VN')} đ`);
                    document.getElementById('bookDepositPrice') && (document.getElementById('bookDepositPrice').textContent = `${d.depositAmount.toLocaleString('vi-VN')} đ`);
                    document.getElementById('bookRemainingPrice') && (document.getElementById('bookRemainingPrice').textContent = `${d.remainingAmount.toLocaleString('vi-VN')} đ`);
                    return;
                }
            }
        } catch (e) {
            console.warn('Could not calculate price via API:', e);
        }
    }

    const rawDaily = currentPopupCar.rawPrice || 700000;
    const sZero = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate());
    const eZero = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate());
    const days = Math.max(1, Math.round((eZero.getTime() - sZero.getTime()) / 86400000) + 1);
    const subtotal = rawDaily * days;
    const delivery = deliveryMethod === 'delivery' ? 100000 : 0;
    const ins = 50000 * days;
    const total = subtotal + delivery + ins;
    const deposit = Math.round(total * 0.25);
    const rem = total - deposit;

    document.getElementById('bookBasePrice') && (document.getElementById('bookBasePrice').textContent = `${subtotal.toLocaleString('vi-VN')} đ (${days} ngày)`);
    document.getElementById('bookInsurancePrice') && (document.getElementById('bookInsurancePrice').textContent = `${ins.toLocaleString('vi-VN')} đ`);
    document.getElementById('bookDeliveryFee') && (document.getElementById('bookDeliveryFee').textContent = delivery > 0 ? `${delivery.toLocaleString('vi-VN')} đ` : 'Miễn phí');
    document.getElementById('bookTotalPrice') && (document.getElementById('bookTotalPrice').textContent = `${total.toLocaleString('vi-VN')} đ`);
    document.getElementById('bookDepositPrice') && (document.getElementById('bookDepositPrice').textContent = `${deposit.toLocaleString('vi-VN')} đ`);
    document.getElementById('bookRemainingPrice') && (document.getElementById('bookRemainingPrice').textContent = `${rem.toLocaleString('vi-VN')} đ`);
}

function openBookingModal() {
    if (!currentPopupCar) return;

    // autofill user info
    const user = window.AzuStore?.getUser ? window.AzuStore.getUser() : null;
    const savedName = user?.fullName || user?.name || sessionStorage.getItem('azuCarDisplayName') || '';
    const savedPhone = user?.phone || sessionStorage.getItem('azuCarPhone') || '';
    const savedEmail = user?.email || sessionStorage.getItem('azuCarEmail') || '';
    const savedId = user?.licenseNumber || sessionStorage.getItem('azuCarLicenseNumber') || '';

    const nameInput = document.getElementById('bookRenterName');
    const phoneInput = document.getElementById('bookRenterPhone');
    const emailInput = document.getElementById('bookRenterEmail');
    const idInput = document.getElementById('bookRenterId');

    if (nameInput) nameInput.value = savedName === 'Người dùng' ? '' : savedName;
    if (phoneInput) phoneInput.value = savedPhone;
    if (emailInput) emailInput.value = savedEmail;
    if (idInput && !idInput.value && savedId) idInput.value = savedId;

    // reset contract & signature
    const agreeCheck = document.getElementById('checkAgreeContract');
    if (agreeCheck) agreeCheck.checked = false;

    const sigInput = document.getElementById('bookElectronicSignature');
    if (sigInput) sigInput.value = savedName === 'Người dùng' ? '' : savedName;

    const contractCode = document.getElementById('contractTempCode');
    if (contractCode) contractCode.textContent = Date.now().toString().slice(-8);

    // booking summary
    const thumbEl = document.getElementById('bookCarThumb');
    const titleEl = document.getElementById('bookCarTitle');
    const locEl = document.getElementById('bookCarLocation');
    const hostLocEl = document.getElementById('bookHostLocation');

    if (thumbEl) thumbEl.src = currentPopupCar.image || '';
    if (titleEl) titleEl.textContent = currentPopupCar.name || 'Xe AZU Car';
    if (locEl) locEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${currentPopupCar.location || 'TP. Đà Nẵng'}`;
    if (hostLocEl) hostLocEl.textContent = `${currentPopupCar.location || 'TP. Đà Nẵng'} (Miễn phí)`;

    const pickupTime = document.getElementById('widgetPickupTime')?.textContent.trim() || '21:00, 15/10/2026';
    const returnTime = document.getElementById('widgetReturnTime')?.textContent.trim() || '21:00, 16/10/2026';
    const basePrice = document.getElementById('calcBasePrice')?.textContent.trim() || `${currentPopupCar.price}/ngày`;
    const insPrice = document.getElementById('calcInsurancePrice')?.textContent.trim() || '66.501đ /ngày';
    const deliveryFee = document.getElementById('calcDeliveryFee')?.textContent.trim() || 'Miễn phí';
    const totalPrice = document.getElementById('calcTotalPrice')?.textContent.trim() || `${currentPopupCar.price}/ngày`;

    document.getElementById('bookPickupTime') && (document.getElementById('bookPickupTime').textContent = pickupTime);
    document.getElementById('bookReturnTime') && (document.getElementById('bookReturnTime').textContent = returnTime);
    document.getElementById('bookBasePrice') && (document.getElementById('bookBasePrice').textContent = basePrice);
    document.getElementById('bookInsurancePrice') && (document.getElementById('bookInsurancePrice').textContent = insPrice);
    document.getElementById('bookDeliveryFee') && (document.getElementById('bookDeliveryFee').textContent = deliveryFee);
    document.getElementById('bookTotalPrice') && (document.getElementById('bookTotalPrice').textContent = totalPrice);

    if (bookingModal) {
        bookingModal.hidden = false;
        refreshBookingPrice();
        if (!nameInput?.value) nameInput?.focus();
        else if (!phoneInput?.value) phoneInput?.focus();
        else emailInput?.focus();
    }
}

function closeBookingModal() {
    if (bookingModal) {
        bookingModal.hidden = true;
    }
}

// delivery method
document.querySelectorAll('input[name="deliveryMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.delivery-radio-label').forEach(lbl => {
            lbl.classList.toggle('active', lbl.contains(radio));
        });
        const isDelivery = radio.value === 'delivery';
        if (deliveryAddressGroup) deliveryAddressGroup.hidden = !isDelivery;
        if (bookDeliveryAddress) bookDeliveryAddress.required = isDelivery;
        if (isDelivery && bookDeliveryAddress) bookDeliveryAddress.focus();
        refreshBookingPrice();
    });
});

// payment method
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.payment-radio-label').forEach(lbl => {
            lbl.classList.toggle('active', lbl.contains(radio));
        });
    });
});

// rent button with GPLX Gate
document.getElementById('btnRentCarSubmit')?.addEventListener('click', () => {
    if (!currentPopupCar) return;

    // check login
    if (!window.AzuStore || !window.AzuStore.isLoggedIn()) {
        sessionStorage.setItem('azuCarPromptLogin', '1');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.add('active');
        } else {
            window.location.href = 'index.html';
        }
        return;
    }

    // check driver license
    const user = window.AzuStore.getUser ? window.AzuStore.getUser() : null;
    const hasDl = user && (user.hasDriverLicense === true || sessionStorage.getItem('azuCarHasDriverLicense') === 'true');
    if (!hasDl) {
        const gplxModal = document.getElementById('gplxRequiredModal');
        if (gplxModal) {
            gplxModal.hidden = false;
        } else {
            alert('Bạn cần cập nhật và xác thực Giấy phép lái xe (GPLX) trước khi thuê xe.');
            window.location.href = '/account#license';
        }
        return;
    }

    // open booking modal
    openBookingModal();
});

// sync popup state on login
window.addEventListener('azu:auth-changed', (e) => {
    const user = e.detail;
    if (user && currentPopupCar) {
        const myUserId = user.userId || sessionStorage.getItem('azuCarUserId');
        const isMyCar = myUserId && currentPopupCar.ownerId && String(myUserId) === String(currentPopupCar.ownerId);
        const selfBadge = document.getElementById('popupOwnerSelfBadge');
        const btnRent = document.getElementById('btnRentCarSubmit');
        const btnOwnerManage = document.getElementById('btnOwnerManageCar');
        if (selfBadge) selfBadge.style.display = isMyCar ? 'inline-flex' : 'none';
        if (btnRent && btnOwnerManage) {
            btnRent.style.display = isMyCar ? 'none' : 'flex';
            btnOwnerManage.style.display = isMyCar ? 'flex' : 'none';
        }
    }
});

// close booking modal
closeBookingModalBtn?.addEventListener('click', closeBookingModal);
btnBackToCar?.addEventListener('click', closeBookingModal);

bookingModal?.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
        closeBookingModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal && !bookingModal.hidden) {
        closeBookingModal();
    }
});

// GPLX required modal listeners
document.getElementById('closeGplxModal')?.addEventListener('click', () => {
    const modal = document.getElementById('gplxRequiredModal');
    if (modal) modal.hidden = true;
});
document.getElementById('btnCancelGplxModal')?.addEventListener('click', () => {
    const modal = document.getElementById('gplxRequiredModal');
    if (modal) modal.hidden = true;
});

// Sample Contract modal handlers
function openSampleContractModal() {
    const modal = document.getElementById('sampleContractModal');
    if (!modal || !currentPopupCar) return;

    const user = window.AzuStore?.getUser ? window.AzuStore.getUser() : null;
    const nameInput = document.getElementById('bookRenterName')?.value.trim();
    const idInput = document.getElementById('bookRenterId')?.value.trim();
    const sigInput = document.getElementById('bookElectronicSignature')?.value.trim();

    const ownerName = document.getElementById('contractOwnerName');
    if (ownerName) ownerName.textContent = currentPopupCar.ownerName || 'Chủ xe AZU Car';

    const renterName = document.getElementById('contractRenterName');
    if (renterName) renterName.textContent = nameInput || user?.fullName || user?.name || 'Khách thuê';

    const renterId = document.getElementById('contractRenterId');
    if (renterId) renterId.textContent = idInput || 'CCCD đối chiếu';

    const carName = document.getElementById('contractCarName');
    if (carName) carName.textContent = currentPopupCar.name || 'Ô tô AZU Car';

    const pickupTime = document.getElementById('contractPickupTime');
    if (pickupTime) pickupTime.textContent = document.getElementById('bookPickupTime')?.textContent || document.getElementById('widgetPickupTime')?.textContent || '';

    const returnTime = document.getElementById('contractReturnTime');
    if (returnTime) returnTime.textContent = document.getElementById('bookReturnTime')?.textContent || document.getElementById('widgetReturnTime')?.textContent || '';

    const totalPrice = document.getElementById('contractTotalPrice');
    if (totalPrice) totalPrice.textContent = document.getElementById('bookTotalPrice')?.textContent || document.getElementById('calcTotalPrice')?.textContent || '';

    const depositPrice = document.getElementById('contractDepositPrice');
    if (depositPrice) depositPrice.textContent = document.getElementById('bookDepositPrice')?.textContent || '';

    const sigStatus = document.getElementById('contractModalSigStatus');
    if (sigStatus) {
        sigStatus.innerHTML = sigInput
            ? `<i class="fa-solid fa-file-signature text-green"></i> Đã ký số: <strong>${sigInput.toUpperCase()}</strong>`
            : `<i class="fa-solid fa-pen-fancy"></i> Ký số điện tử bằng họ tên`;
    }

    modal.hidden = false;
}

function closeSampleContractModal() {
    const modal = document.getElementById('sampleContractModal');
    if (modal) modal.hidden = true;
}

document.getElementById('btnOpenContractModal')?.addEventListener('click', openSampleContractModal);
document.getElementById('linkOpenSampleContract')?.addEventListener('click', openSampleContractModal);
document.getElementById('closeSampleContractModal')?.addEventListener('click', closeSampleContractModal);
document.getElementById('btnCloseSampleContractBottom')?.addEventListener('click', closeSampleContractModal);

document.getElementById('btnAcceptSampleContract')?.addEventListener('click', () => {
    const agreeCheck = document.getElementById('checkAgreeContract');
    if (agreeCheck) agreeCheck.checked = true;
    closeSampleContractModal();
});

// ==========================================
// CHẾ ĐỘ CHỈNH SỬA BÀI ĐĂNG DÀNH CHO CHỦ XE (INLINE EDITING)
// ==========================================
let isOwnerEditModeActive = false;

function loadCustomListingAttributes(vehicleId) {
    if (!vehicleId) return;

    // 1. Tài sản thế chấp
    const savedCollateral = localStorage.getItem(`azu_car_collateral_${vehicleId}`);
    const colEl = document.getElementById('popupCarCollateralText');
    if (colEl) {
        colEl.textContent = savedCollateral || 'Không yêu cầu khách thuê thế chấp Tiền mặt hoặc Xe máy.';
    }

    // 2. Điều khoản riêng
    const savedTerms = localStorage.getItem(`azu_car_terms_${vehicleId}`);
    const termsUl = document.getElementById('popupCarTermsList');
    if (termsUl) {
        if (savedTerms) {
            try {
                const list = JSON.parse(savedTerms);
                if (Array.isArray(list) && list.length > 0) {
                    termsUl.innerHTML = list.map(item => `<li>${item}</li>`).join('');
                }
            } catch (e) {}
        } else {
            termsUl.innerHTML = `
                <li>Sử dụng xe đúng mục đích di chuyển an toàn.</li>
                <li>Không sử dụng xe vào mục đích phi pháp, vi phạm pháp luật.</li>
                <li>Không sử dụng xe thuê để cầm cố, thế chấp hoặc chuyển giao bên thứ ba.</li>
                <li>Không hút thuốc, nhả kẹo cao su, xả rác bừa bãi trong xe.</li>
                <li>Không chở hoa quả, thực phẩm tươi sống nặng mùi trong khoang xe.</li>
            `;
        }
    }

    // 3. Phụ phí có thể phát sinh
    const savedFees = localStorage.getItem(`azu_car_extrafees_${vehicleId}`);
    if (savedFees) {
        try {
            const fees = JSON.parse(savedFees);
            if (fees.feeLimit && fees.limitKm) {
                const d = document.getElementById('extraFeeLimitDesc');
                const c = document.getElementById('extraFeeLimitCost');
                if (d) d.textContent = `Phụ phí phát sinh nếu lộ trình di chuyển vượt quá ${fees.limitKm}km/ngày.`;
                if (c) c.textContent = `${Number(fees.feeLimit).toLocaleString('vi-VN')}đ/km`;
            }
            if (fees.feeOvertime) {
                const c = document.getElementById('extraFeeOvertimeCost');
                if (c) c.textContent = `${Number(fees.feeOvertime).toLocaleString('vi-VN')}đ/giờ`;
            }
            if (fees.feeClean) {
                const c = document.getElementById('extraFeeCleanCost');
                if (c) c.textContent = `${Number(fees.feeClean).toLocaleString('vi-VN')}đ`;
            }
            if (fees.feeDeodor) {
                const c = document.getElementById('extraFeeDeodorCost');
                if (c) c.textContent = `${Number(fees.feeDeodor).toLocaleString('vi-VN')}đ`;
            }
        } catch (e) {}
    } else {
        const dLimit = document.getElementById('extraFeeLimitDesc');
        const cLimit = document.getElementById('extraFeeLimitCost');
        if (dLimit) dLimit.textContent = 'Phụ phí phát sinh nếu lộ trình di chuyển vượt quá 300km/ngày.';
        if (cLimit) cLimit.textContent = '3.000đ/km';

        const dOvertime = document.getElementById('extraFeeOvertimeDesc');
        const cOvertime = document.getElementById('extraFeeOvertimeCost');
        if (dOvertime) dOvertime.textContent = 'Phụ phí phát sinh khi hoàn trả xe trễ giờ. Thuê thêm 1 ngày nếu trễ quá 5 giờ.';
        if (cOvertime) cOvertime.textContent = '70.000đ/giờ';

        const cClean = document.getElementById('extraFeeCleanCost');
        if (cClean) cClean.textContent = '80.000đ';

        const cDeodor = document.getElementById('extraFeeDeodorCost');
        if (cDeodor) cDeodor.textContent = '500.000đ';
    }
}

function toggleSectionEditor(sectionName, showEditor) {
    switch (sectionName) {
        case 'location': {
            const viewWrap = document.getElementById('viewCarLocWrapper');
            const editWrap = document.getElementById('editCarLocWrapper');
            if (viewWrap && editWrap) {
                viewWrap.style.display = showEditor ? 'none' : 'block';
                editWrap.style.display = showEditor ? 'block' : 'none';
                if (showEditor && currentPopupCar) {
                    const citySelect = document.getElementById('inlineCitySelect');
                    if (citySelect && currentPopupCar.city) {
                        const found = Array.from(citySelect.options).find(opt =>
                            opt.value.toLowerCase().includes(currentPopupCar.city.toLowerCase()) ||
                            currentPopupCar.city.toLowerCase().includes(opt.value.toLowerCase())
                        );
                        if (found) citySelect.value = found.value;
                    }
                    const distInput = document.getElementById('inlineDistrictInput');
                    if (distInput) distInput.value = currentPopupCar.district || '';
                    const locInput = document.getElementById('inlineLocationInput');
                    if (locInput) locInput.value = currentPopupCar.location || '';
                }
            }
            break;
        }
        case 'description': {
            const viewWrap = document.getElementById('viewCarDescWrapper');
            const editWrap = document.getElementById('editCarDescWrapper');
            if (viewWrap && editWrap) {
                viewWrap.style.display = showEditor ? 'none' : 'block';
                editWrap.style.display = showEditor ? 'block' : 'none';
                if (showEditor && currentPopupCar) {
                    const descInput = document.getElementById('inlineEditDescText');
                    if (descInput) {
                        descInput.value = currentPopupCar.description || (document.getElementById('popupCarDescription')?.innerText.trim() || '');
                    }
                }
            }
            break;
        }
        case 'price': {
            const editWrap = document.getElementById('inlineEditPriceWrapper');
            if (editWrap) {
                editWrap.style.display = showEditor ? 'block' : 'none';
                if (showEditor && currentPopupCar) {
                    const pInput = document.getElementById('inlineEditPriceInput');
                    if (pInput) {
                        const rawDaily = currentPopupCar.pricePerDay || currentPopupCar.rawPrice || 524000;
                        pInput.value = rawDaily;
                    }
                }
            }
            break;
        }
        case 'collateral': {
            const viewWrap = document.getElementById('viewCarCollateralWrapper');
            const editWrap = document.getElementById('editCarCollateralWrapper');
            if (viewWrap && editWrap) {
                viewWrap.style.display = showEditor ? 'none' : 'block';
                editWrap.style.display = showEditor ? 'block' : 'none';
                if (showEditor && currentPopupCar) {
                    const currentText = document.getElementById('popupCarCollateralText')?.textContent.trim() || '';
                    const typeSel = document.getElementById('inlineCollateralTypeSelect');
                    const customGrp = document.getElementById('inlineCollateralCustomGroup');
                    const customInp = document.getElementById('inlineCollateralCustomInput');
                    if (typeSel) {
                        if (/không yêu cầu|miễn thế chấp/i.test(currentText)) {
                            typeSel.value = 'none';
                            if (customGrp) customGrp.style.display = 'none';
                        } else if (/xe máy/i.test(currentText) && /tiền mặt/i.test(currentText)) {
                            typeSel.value = 'bike_or_cash';
                            if (customGrp) customGrp.style.display = 'none';
                        } else if (/tiền mặt/i.test(currentText)) {
                            typeSel.value = 'cash_only';
                            if (customGrp) customGrp.style.display = 'none';
                        } else {
                            typeSel.value = 'custom';
                            if (customGrp) customGrp.style.display = 'block';
                            if (customInp) customInp.value = currentText;
                        }
                    }
                }
            }
            break;
        }
        case 'terms': {
            const viewWrap = document.getElementById('viewCarTermsWrapper');
            const editWrap = document.getElementById('editCarTermsWrapper');
            if (viewWrap && editWrap) {
                viewWrap.style.display = showEditor ? 'none' : 'block';
                editWrap.style.display = showEditor ? 'block' : 'none';
                if (showEditor) {
                    const textarea = document.getElementById('inlineTermsTextarea');
                    if (textarea) {
                        const items = Array.from(document.querySelectorAll('#popupCarTermsList li')).map(li => li.textContent.trim()).filter(Boolean);
                        textarea.value = items.join('\n');
                    }
                }
            }
            break;
        }
        case 'extra-fees': {
            const viewWrap = document.getElementById('viewExtraFeesList');
            const editWrap = document.getElementById('editExtraFeesEditor');
            if (viewWrap && editWrap) {
                viewWrap.style.display = showEditor ? 'none' : 'block';
                editWrap.style.display = showEditor ? 'block' : 'none';
                if (showEditor && currentPopupCar) {
                    const feeLimitCostEl = document.getElementById('extraFeeLimitCost');
                    const feeLimitDescEl = document.getElementById('extraFeeLimitDesc');
                    const feeOvertimeCostEl = document.getElementById('extraFeeOvertimeCost');
                    const feeCleanCostEl = document.getElementById('extraFeeCleanCost');
                    const feeDeodorCostEl = document.getElementById('extraFeeDeodorCost');

                    const limitKmMatch = feeLimitDescEl?.textContent.match(/(\d+)\s*km/);
                    const limitVal = feeLimitCostEl ? parseInt(feeLimitCostEl.textContent.replace(/\D/g, ''), 10) : 3000;
                    const overtimeVal = feeOvertimeCostEl ? parseInt(feeOvertimeCostEl.textContent.replace(/\D/g, ''), 10) : 70000;
                    const cleanVal = feeCleanCostEl ? parseInt(feeCleanCostEl.textContent.replace(/\D/g, ''), 10) : 80000;
                    const deodorVal = feeDeodorCostEl ? parseInt(feeDeodorCostEl.textContent.replace(/\D/g, ''), 10) : 500000;

                    const inLimit = document.getElementById('inlineFeeLimitInput');
                    const inLimitKm = document.getElementById('inlineFeeLimitKmInput');
                    const inOvertime = document.getElementById('inlineFeeOvertimeInput');
                    const inClean = document.getElementById('inlineFeeCleanInput');
                    const inDeodor = document.getElementById('inlineFeeDeodorInput');

                    if (inLimit) inLimit.value = limitVal || 3000;
                    if (inLimitKm) inLimitKm.value = (limitKmMatch ? parseInt(limitKmMatch[1], 10) : 300);
                    if (inOvertime) inOvertime.value = overtimeVal || 70000;
                    if (inClean) inClean.value = cleanVal || 80000;
                    if (inDeodor) inDeodor.value = deodorVal || 500000;
                }
            }
            break;
        }
    }
}

function closeAllSectionEditors() {
    ['location', 'description', 'price', 'collateral', 'terms', 'extra-fees'].forEach(sec => {
        toggleSectionEditor(sec, false);
    });
}

function toggleOwnerListingEditMode(enable) {
    if (typeof enable === 'boolean') {
        isOwnerEditModeActive = enable;
    } else {
        isOwnerEditModeActive = !isOwnerEditModeActive;
    }

    const banner = document.getElementById('ownerEditModeBanner');
    const manageBtn = document.getElementById('btnOwnerManageCar');
    const pencils = document.querySelectorAll('.btn-inline-pencil');

    if (isOwnerEditModeActive) {
        if (banner) banner.style.display = 'flex';
        pencils.forEach(p => p.style.display = 'inline-flex');
        if (manageBtn) {
            manageBtn.innerHTML = '<i class="fa-solid fa-check"></i> Hoàn tất chỉnh sửa';
            manageBtn.classList.add('active-edit-mode');
        }
    } else {
        if (banner) banner.style.display = 'none';
        pencils.forEach(p => p.style.display = 'none');
        closeAllSectionEditors();
        if (manageBtn) {
            manageBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Chỉnh sửa';
            manageBtn.classList.remove('active-edit-mode');
        }
    }
}

// Event Listeners for Owner Edit Mode
document.getElementById('btnOwnerManageCar')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentPopupCar) return;
    toggleOwnerListingEditMode();
});

document.getElementById('btnExitEditBanner')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleOwnerListingEditMode(false);
});

document.querySelectorAll('.btn-inline-pencil').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.dataset.target;
        if (target) {
            toggleSectionEditor(target, true);
        }
    });
});

document.querySelectorAll('.btn-inline-cancel').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.dataset.target;
        if (target) {
            toggleSectionEditor(target, false);
        }
    });
});

document.getElementById('inlineCollateralTypeSelect')?.addEventListener('change', (e) => {
    const customGroup = document.getElementById('inlineCollateralCustomGroup');
    if (customGroup) {
        customGroup.style.display = (e.target.value === 'custom') ? 'block' : 'none';
    }
});

document.querySelectorAll('.btn-inline-save').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const target = btn.dataset.target;
        if (!target || !currentPopupCar || !currentPopupCar.vehicleId) return;

        const originalBtnHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';

        try {
            if (target === 'location') {
                const city = document.getElementById('inlineCitySelect')?.value || 'TP. Đà Nẵng';
                const district = document.getElementById('inlineDistrictInput')?.value?.trim() || '';
                const location = document.getElementById('inlineLocationInput')?.value?.trim() || '';

                const payload = {
                    pricePerDay: currentPopupCar.pricePerDay || currentPopupCar.rawPrice || 524000,
                    city: city,
                    district: district,
                    location: location,
                    description: currentPopupCar.description || ''
                };

                const res = await fetch(`/api/vehicles/${currentPopupCar.vehicleId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (res.ok && result.isSuccess) {
                    currentPopupCar.city = city;
                    currentPopupCar.district = district;
                    currentPopupCar.location = location;

                    const displayLoc = location || (district ? `${district}, ${city}` : city);
                    const specificLoc = document.getElementById('popupCarSpecificLoc');
                    if (specificLoc) specificLoc.textContent = displayLoc;
                    const carLoc = document.getElementById('popupCarLoc');
                    if (carLoc) carLoc.textContent = displayLoc;
                    const hostLocEl = document.getElementById('bookHostLocation');
                    if (hostLocEl) hostLocEl.textContent = `${displayLoc} (Miễn phí)`;
                    const widgetCarLoc = document.getElementById('widgetCarLocShort');
                    if (widgetCarLoc) widgetCarLoc.textContent = displayLoc;

                    const carCard = Array.from(document.querySelectorAll('.car-card'))
                        .find(c => c.dataset.vehicleId == currentPopupCar.vehicleId);
                    if (carCard) {
                        carCard.dataset.city = city;
                        carCard.dataset.district = district;
                        carCard.dataset.location = location;
                        const cardLoc = carCard.querySelector('.car-location');
                        if (cardLoc) cardLoc.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${displayLoc}`;
                    }

                    toggleSectionEditor('location', false);
                    alert('Cập nhật vị trí xe thành công!');
                } else {
                    alert(result.message || 'Không thể cập nhật vị trí xe.');
                }
            } else if (target === 'description') {
                const description = document.getElementById('inlineEditDescText')?.value?.trim() || '';
                const payload = {
                    pricePerDay: currentPopupCar.pricePerDay || currentPopupCar.rawPrice || 524000,
                    city: currentPopupCar.city || 'TP. Đà Nẵng',
                    district: currentPopupCar.district || '',
                    location: currentPopupCar.location || '',
                    description: description
                };

                const res = await fetch(`/api/vehicles/${currentPopupCar.vehicleId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (res.ok && result.isSuccess) {
                    currentPopupCar.description = description;
                    const descEl = document.getElementById('popupCarDescription');
                    if (descEl) descEl.innerHTML = `<p>${(description || 'Chưa có mô tả chi tiết.').replace(/\n/g, '<br>')}</p>`;

                    const carCard = Array.from(document.querySelectorAll('.car-card'))
                        .find(c => c.dataset.vehicleId == currentPopupCar.vehicleId);
                    if (carCard) {
                        carCard.dataset.description = description;
                    }

                    toggleSectionEditor('description', false);
                    alert('Cập nhật mô tả xe thành công!');
                } else {
                    alert(result.message || 'Không thể cập nhật mô tả xe.');
                }
            } else if (target === 'price') {
                const newPrice = Number(document.getElementById('inlineEditPriceInput')?.value || 0);
                if (newPrice < 100000) {
                    alert('Giá thuê tối thiểu là 100.000đ/ngày.');
                    return;
                }

                const payload = {
                    pricePerDay: newPrice,
                    city: currentPopupCar.city || 'TP. Đà Nẵng',
                    district: currentPopupCar.district || '',
                    location: currentPopupCar.location || '',
                    description: currentPopupCar.description || ''
                };

                const res = await fetch(`/api/vehicles/${currentPopupCar.vehicleId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (res.ok && result.isSuccess) {
                    currentPopupCar.pricePerDay = newPrice;
                    currentPopupCar.rawPrice = newPrice;
                    currentPopupCar.price = (Number(newPrice) / 1000).toLocaleString('vi-VN') + 'K';

                    const widgetPriceBig = document.getElementById('widgetPriceBig');
                    if (widgetPriceBig) widgetPriceBig.textContent = currentPopupCar.price;

                    updatePricingCalculation(newPrice);

                    const carCard = Array.from(document.querySelectorAll('.car-card'))
                        .find(c => c.dataset.vehicleId == currentPopupCar.vehicleId);
                    if (carCard) {
                        carCard.dataset.rawPrice = newPrice;
                        carCard.dataset.priceK = Math.round(newPrice / 1000);
                        const cardPrice = carCard.querySelector('.price-number');
                        if (cardPrice) cardPrice.innerHTML = `${Number(newPrice).toLocaleString('vi-VN')}đ<span class="price-unit">/ngày</span>`;
                    }

                    toggleSectionEditor('price', false);
                    alert('Cập nhật đơn giá thuê thành công!');
                } else {
                    alert(result.message || 'Không thể cập nhật đơn giá thuê.');
                }
            } else if (target === 'collateral') {
                const type = document.getElementById('inlineCollateralTypeSelect')?.value || 'none';
                let colText = 'Không yêu cầu khách thuê thế chấp Tiền mặt hoặc Xe máy.';
                if (type === 'bike_or_cash') {
                    colText = 'Yêu cầu thế chấp: Xe máy (kèm cavet gốc chính chủ) hoặc 15.000.000đ Tiền mặt ký quỹ.';
                } else if (type === 'cash_only') {
                    colText = 'Yêu cầu thế chấp Tiền mặt ký quỹ: 15.000.000đ khi bàn giao nhận xe.';
                } else if (type === 'custom') {
                    colText = document.getElementById('inlineCollateralCustomInput')?.value?.trim() || colText;
                }

                const colEl = document.getElementById('popupCarCollateralText');
                if (colEl) colEl.textContent = colText;

                localStorage.setItem(`azu_car_collateral_${currentPopupCar.vehicleId}`, colText);
                toggleSectionEditor('collateral', false);
                alert('Cập nhật quy định thế chấp thành công!');
            } else if (target === 'terms') {
                const rawText = document.getElementById('inlineTermsTextarea')?.value || '';
                const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
                const termsUl = document.getElementById('popupCarTermsList');
                if (termsUl && lines.length > 0) {
                    termsUl.innerHTML = lines.map(item => `<li>${item}</li>`).join('');
                }

                localStorage.setItem(`azu_car_terms_${currentPopupCar.vehicleId}`, JSON.stringify(lines));
                toggleSectionEditor('terms', false);
                alert('Cập nhật điều khoản riêng thành công!');
            } else if (target === 'extra-fees') {
                const feeLimit = Number(document.getElementById('inlineFeeLimitInput')?.value || 3000);
                const limitKm = Number(document.getElementById('inlineFeeLimitKmInput')?.value || 300);
                const feeOvertime = Number(document.getElementById('inlineFeeOvertimeInput')?.value || 70000);
                const feeClean = Number(document.getElementById('inlineFeeCleanInput')?.value || 80000);
                const feeDeodor = Number(document.getElementById('inlineFeeDeodorInput')?.value || 500000);

                const dLimit = document.getElementById('extraFeeLimitDesc');
                const cLimit = document.getElementById('extraFeeLimitCost');
                if (dLimit) dLimit.textContent = `Phụ phí phát sinh nếu lộ trình di chuyển vượt quá ${limitKm}km/ngày.`;
                if (cLimit) cLimit.textContent = `${feeLimit.toLocaleString('vi-VN')}đ/km`;

                const dOvertime = document.getElementById('extraFeeOvertimeDesc');
                const cOvertime = document.getElementById('extraFeeOvertimeCost');
                if (cOvertime) cOvertime.textContent = `${feeOvertime.toLocaleString('vi-VN')}đ/giờ`;

                const cClean = document.getElementById('extraFeeCleanCost');
                if (cClean) cClean.textContent = `${feeClean.toLocaleString('vi-VN')}đ`;

                const cDeodor = document.getElementById('extraFeeDeodorCost');
                if (cDeodor) cDeodor.textContent = `${feeDeodor.toLocaleString('vi-VN')}đ`;

                const feesObj = { feeLimit, limitKm, feeOvertime, feeClean, feeDeodor };
                localStorage.setItem(`azu_car_extrafees_${currentPopupCar.vehicleId}`, JSON.stringify(feesObj));
                toggleSectionEditor('extra-fees', false);
                alert('Cập nhật các khoản phụ phí thành công!');
            }
        } catch (err) {
            console.error('Lỗi khi lưu thông tin bài đăng xe:', err);
            alert('Có lỗi xảy ra khi lưu thông tin.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalBtnHtml;
        }
    });
});

// ==========================================
// GIẢ LẬP THANH TOÁN (PAYMENT SIMULATION)
// ==========================================
let pendingBookingData = null;
let simCountdownTimer = null;

function openPaymentSimulationModal() {
    if (!pendingBookingData) return;
    const simModal = document.getElementById('paymentSimulationModal');
    if (!simModal) return;

    const paySimAmount = document.getElementById('paySimAmount');
    if (paySimAmount) paySimAmount.textContent = pendingBookingData.display.deposit;

    const paySimCarMeta = document.getElementById('paySimCarMeta');
    if (paySimCarMeta) {
        const sDate = new Date(pendingBookingData.payload.startDate);
        const eDate = new Date(pendingBookingData.payload.endDate);
        const sZero = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
        const eZero = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());
        const days = Math.max(1, Math.round((eZero.getTime() - sZero.getTime()) / 86400000) + 1);
        paySimCarMeta.textContent = `${pendingBookingData.display.carName} · Thuê ${days} ngày`;
    }

    const paySimTransferMemo = document.getElementById('paySimTransferMemo');
    if (paySimTransferMemo) {
        const memoCode = 'AZUPAY' + Date.now().toString().slice(-6);
        paySimTransferMemo.textContent = memoCode;
    }

    startSimCountdown(15 * 60);

    if (bookingModal) bookingModal.hidden = true;
    simModal.hidden = false;
}

function startSimCountdown(durationSeconds) {
    if (simCountdownTimer) clearInterval(simCountdownTimer);
    let remaining = durationSeconds;
    const countdownEl = document.getElementById('paySimCountdown');

    function updateDisplay() {
        if (!countdownEl) return;
        const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
        const secs = String(remaining % 60).padStart(2, '0');
        countdownEl.textContent = `${mins}:${secs}`;
    }

    updateDisplay();
    simCountdownTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(simCountdownTimer);
            updateDisplay();
            alert('Đã hết thời gian phiên thanh toán mô phỏng. Vui lòng thử lại.');
            closePaymentSimulationModal();
        } else {
            updateDisplay();
        }
    }, 1000);
}

function closePaymentSimulationModal() {
    if (simCountdownTimer) clearInterval(simCountdownTimer);
    const simModal = document.getElementById('paymentSimulationModal');
    if (simModal) simModal.hidden = true;
    if (bookingModal) bookingModal.hidden = false;
}

document.getElementById('closePaymentSimModal')?.addEventListener('click', closePaymentSimulationModal);
document.getElementById('btnCancelPaymentSimulation')?.addEventListener('click', closePaymentSimulationModal);
document.getElementById('paymentSimulationModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'paymentSimulationModal') closePaymentSimulationModal();
});

document.getElementById('btnConfirmPaymentSimulation')?.addEventListener('click', async () => {
    if (!pendingBookingData) return;
    const btn = document.getElementById('btnConfirmPaymentSimulation');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xác thực thanh toán ký quỹ...';
    }

    try {
        const resp = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingBookingData.payload)
        });
        const resData = await resp.json();

        if (resp.ok && resData.isSuccess) {
            if (simCountdownTimer) clearInterval(simCountdownTimer);
            const simModal = document.getElementById('paymentSimulationModal');
            if (simModal) simModal.hidden = true;
            closeBookingModal();
            closeCarModal();

            // sync store
            if (window.AzuStore?.addTrip) {
                window.AzuStore.addTrip({
                    id: resData.data?.bookingId || Date.now(),
                    vehicleId: pendingBookingData.payload.vehicleId,
                    listingId: pendingBookingData.payload.listingId,
                    car: pendingBookingData.display.carName,
                    image: pendingBookingData.display.image,
                    location: pendingBookingData.display.location,
                    price: pendingBookingData.display.price,
                    pickup: pendingBookingData.display.pickup,
                    return: pendingBookingData.display.return,
                    status: 'current',
                    total: pendingBookingData.display.totalPrice,
                    deposit: pendingBookingData.display.deposit,
                    renterName: pendingBookingData.display.renterName,
                    renterPhone: pendingBookingData.display.renterPhone,
                    renterEmail: pendingBookingData.display.renterEmail,
                    renterIdNumber: pendingBookingData.display.renterIdNumber,
                    deliveryType: pendingBookingData.display.deliveryType,
                    paymentMethod: pendingBookingData.display.paymentMethod,
                    notes: pendingBookingData.display.notes
                });
            }

            const bookingId = resData.data?.bookingId;
            const depositFormatted = resData.data?.depositAmount
                ? Number(resData.data.depositAmount).toLocaleString('vi-VN') + ' đ'
                : pendingBookingData.display.deposit;

            alert(`🎉 Thanh toán cọc & Đặt xe thành công!\n\n• Mã đơn: #${bookingId}\n• Ký quỹ thành công (25%): ${depositFormatted}\n• Đã ký Hợp đồng thuê xe điện tử AZU Car\n\nHệ thống sẽ chuyển bạn đến trang Quản lý đơn thuê chi tiết!`);

            window.location.href = `/booking/${bookingId}`;
        } else {
            const msg = resData?.message || 'Không thể tạo đơn đặt xe lúc này. Vui lòng thử lại sau.';
            alert('Lỗi đặt xe: ' + msg);
            closePaymentSimulationModal();
            const errorBanner = document.getElementById('bookingErrorBanner');
            if (errorBanner) {
                errorBanner.textContent = msg;
                errorBanner.style.display = 'block';
            }
        }
    } catch (err) {
        console.error('Lỗi khi gửi yêu cầu đặt xe:', err);
        alert('Lỗi kết nối máy chủ khi thực hiện thanh toán.');
        closePaymentSimulationModal();
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Xác nhận thanh toán mô phỏng';
        }
    }
});

// submit booking form -> triggers payment simulation
bookingCheckoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!bookingCheckoutForm.reportValidity() || !currentPopupCar) return;

    const errorBanner = document.getElementById('bookingErrorBanner');
    if (errorBanner) {
        errorBanner.style.display = 'none';
        errorBanner.textContent = '';
    }

    // 1. Verify contract agreement checkbox
    const agreeCheck = document.getElementById('checkAgreeContract');
    if (agreeCheck && !agreeCheck.checked) {
        if (errorBanner) {
            errorBanner.textContent = 'Vui lòng đọc và tích chọn đồng ý với Hợp đồng thuê xe điện tử và chính sách của AZU Car.';
            errorBanner.style.display = 'block';
        }
        agreeCheck.focus();
        return;
    }

    // 2. Verify electronic signature
    const signature = document.getElementById('bookElectronicSignature')?.value.trim();
    if (!signature) {
        if (errorBanner) {
            errorBanner.textContent = 'Vui lòng nhập Họ và tên để ký số điện tử trên hợp đồng thuê xe.';
            errorBanner.style.display = 'block';
        }
        document.getElementById('bookElectronicSignature')?.focus();
        return;
    }

    // 3. Verify driver license again
    const user = window.AzuStore?.getUser ? window.AzuStore.getUser() : null;
    const hasDl = user && (user.hasDriverLicense === true || sessionStorage.getItem('azuCarHasDriverLicense') === 'true');
    if (!hasDl) {
        const gplxModal = document.getElementById('gplxRequiredModal');
        if (gplxModal) gplxModal.hidden = false;
        return;
    }

    const name = document.getElementById('bookRenterName')?.value.trim();
    const phone = document.getElementById('bookRenterPhone')?.value.trim();
    const email = document.getElementById('bookRenterEmail')?.value.trim();
    const idNumber = document.getElementById('bookRenterId')?.value.trim();
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked')?.value || 'host';
    const deliveryAddress = document.getElementById('bookDeliveryAddress')?.value.trim();
    const notes = document.getElementById('bookRenterNotes')?.value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'qr';

    const dates = getSelectedBookingDates();
    const pickupTime = document.getElementById('bookPickupTime')?.textContent.trim() || '21:00, 15/10/2026';
    const returnTime = document.getElementById('bookReturnTime')?.textContent.trim() || '21:00, 16/10/2026';
    const totalPrice = document.getElementById('bookTotalPrice')?.textContent.trim() || `${currentPopupCar.price}/ngày`;
    const depositPrice = document.getElementById('bookDepositPrice')?.textContent.trim() || '0đ';

    if (phone) sessionStorage.setItem('azuCarPhone', phone);
    if (email) sessionStorage.setItem('azuCarEmail', email);

    pendingBookingData = {
        payload: {
            listingId: Number(currentPopupCar.listingId || 1),
            vehicleId: currentPopupCar.vehicleId ? Number(currentPopupCar.vehicleId) : null,
            startDate: dates.start.toISOString(),
            endDate: dates.end.toISOString(),
            deliveryMethod: deliveryMethod,
            deliveryAddress: deliveryAddress,
            notes: notes,
            renterName: name,
            renterPhone: phone,
            renterEmail: email,
            paymentMethod: paymentMethod
        },
        display: {
            carName: currentPopupCar.name,
            image: currentPopupCar.image,
            location: deliveryMethod === 'delivery' ? (deliveryAddress || currentPopupCar.location) : currentPopupCar.location,
            price: currentPopupCar.price,
            pickup: pickupTime,
            return: returnTime,
            totalPrice: totalPrice,
            deposit: depositPrice,
            renterName: name,
            renterPhone: phone,
            renterEmail: email,
            renterIdNumber: idNumber,
            deliveryType: deliveryMethod,
            paymentMethod: paymentMethod,
            notes: notes
        }
    };

    openPaymentSimulationModal();
});

carsGrid?.addEventListener('click', event => {
    const card = event.target.closest('.car-card');
    if (!card) return;
    const car = carFromCard(card);
    window.AzuStore.setSelectedCar(car);
    openCarPopup(car);
});
