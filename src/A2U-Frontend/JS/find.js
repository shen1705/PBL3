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

// Ưu tiên: địa điểm đã lưu trong phiên làm việc > URL > mặc định TP. Đà Nẵng
let selectedLocation = savedLocation || urlLocation || document.getElementById('filterLocationText')?.textContent.trim() || 'TP. Đà Nẵng';

const sampleCars = [
    { name: 'TOYOTA VIOS G 2024', city: 'Hà Nội', district: 'Quận Cầu Giấy', price: '650K', rating: '4.9', trips: 18, year: 2024, seats: 5, image: 'photo-1552519507-da3b142c6e3d' },
    { name: 'HONDA CITY RS 2023', city: 'Hà Nội', district: 'Quận Đống Đa', price: '680K', rating: '5.0', trips: 12, year: 2023, seats: 5, image: 'photo-1541899481282-d53bffe3c35d' },
    { name: 'MAZDA CX-5 PREMIUM 2024', city: 'Hà Nội', district: 'Quận Nam Từ Liêm', price: '1.050K', rating: '4.8', trips: 21, year: 2024, seats: 5, image: 'photo-1511919884226-fd3cad34687c' },
    { name: 'MITSUBISHI XPANDER 2023', city: 'Hà Nội', district: 'Quận Long Biên', price: '850K', rating: '4.9', trips: 15, year: 2023, seats: 7, image: 'photo-1502877338535-766e1452684a' },
    { name: 'KIA SONET PREMIUM 2024', city: 'TP. Hồ Chí Minh', district: 'Quận 1', price: '720K', rating: '4.9', trips: 16, year: 2024, seats: 5, image: 'photo-1533473359331-0135ef1b58bf' },
    { name: 'TOYOTA VIOS G 2023', city: 'TP. Hồ Chí Minh', district: 'Quận Bình Thạnh', price: '630K', rating: '4.8', trips: 20, year: 2023, seats: 5, image: 'photo-1553440569-bcc63803a83d' },
    { name: 'HONDA CR-V L 2024', city: 'TP. Hồ Chí Minh', district: 'TP. Thủ Đức', price: '1.250K', rating: '5.0', trips: 11, year: 2024, seats: 7, image: 'photo-1617814076367-b759c7d7e738' },
    { name: 'FORD TERRITORY TITANIUM 2024', city: 'TP. Hồ Chí Minh', district: 'Quận 7', price: '1.100K', rating: '4.9', trips: 14, year: 2024, seats: 5, image: 'photo-1555215695-3004980ad54e' }
];

function createSampleCarCard(car) {
    const card = document.createElement('div');
    card.className = 'car-card';
    card.dataset.sampleListing = 'true';

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'car-img-wrapper';
    const image = document.createElement('img');
    image.src = `https://images.unsplash.com/${car.image}?auto=format&fit=crop&q=80&w=600`;
    image.alt = car.name;
    imageWrapper.appendChild(image);

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
    details.append(locationIcon, document.createTextNode(` ${car.district}, ${car.city}`));

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

if (carsGrid) {
    sampleCars.forEach(car => carsGrid.appendChild(createSampleCarCard(car)));
}

const carCards = carsGrid ? Array.from(carsGrid.querySelectorAll('.car-card')) : [];

function getCarLocation(card) {
    const locationLines = card.querySelector('.car-rating-loc')?.innerText
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
    return locationLines?.[locationLines.length - 1] || '';
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

function addLocationOption(label, description, count) {
    const button = document.createElement('button');
    button.className = 'location-option';
    button.type = 'button';
    button.dataset.location = label;

    const icon = document.createElement('span');
    icon.className = 'location-option-icon';
    icon.innerHTML = '<i class="fa-solid fa-location-dot"></i>';

    const details = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = label;
    const meta = document.createElement('small');
    meta.textContent = `${description} · ${count} xe`;
    details.append(name, meta);
    button.append(icon, details);
    locationOptions.appendChild(button);
}

function buildLocationOptions() {
    if (!locationOptions) return;

    const cityCounts = new Map();
    const addressCounts = new Map();
    const knownCities = ['TP. Đà Nẵng', 'Hà Nội', 'TP. Hồ Chí Minh'];
    carCards.forEach(card => {
        const address = getCarLocation(card);
        if (!address) return;

        addressCounts.set(address, (addressCounts.get(address) || 0) + 1);
        const parts = address.split(',').map(part => part.trim());
        const city = parts[parts.length - 1];
        if (city) cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    });

    locationOptions.replaceChildren();
    knownCities.forEach(city => {
        if (!cityCounts.has(city)) cityCounts.set(city, 0);
    });
    cityCounts.forEach((count, city) => addLocationOption(city, 'Toàn thành phố', count));
    addressCounts.forEach((count, address) => addLocationOption(address, 'Khu vực', count));
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

    // 1. Lưu lại địa điểm đang chọn vào sessionStorage để khi chuyển trang hoặc F5 luôn giữ nguyên
    sessionStorage.setItem('azuCarSelectedLocation', chosenLocation);

    // 2. Cập nhật thanh địa chỉ URL (replaceState) để URL đồng bộ đúng địa điểm, không bị dính Hà Nội cũ
    try {
        const url = new URL(window.location.href);
        url.searchParams.set('location', chosenLocation);
        window.history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
    } catch (e) {}

    applyAllFilters();
}

// --- BỘ LỌC NÂNG CAO (ADVANCED FILTER ENGINE) ---
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

// Đồng bộ giao diện pill với bộ lọc URL ban đầu (nếu có)
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

        // Reset 3 nút quick pill
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
    const text = card.querySelector('.car-price')?.textContent || '';
    const match = text.match(/([\d.]+)\s*k/i);
    if (!match) return 0;
    return parseInt(match[1].replace(/\./g, ''), 10) || 0;
}

function parseCardSeats(card) {
    const text = card.querySelector('.tag-seats')?.textContent || '';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 5;
}

function parseCardTrans(card) {
    const text = (card.querySelector('.tag-trans')?.textContent || '').toLowerCase();
    return text.includes('sàn') ? 'manual' : 'auto';
}

function parseCardFuel(card) {
    const text = (card.textContent || '').toLowerCase();
    if (text.includes('điện') || text.includes('vf3') || text.includes('vf 3') || text.includes('vfe34') || text.includes('vf8')) return 'electric';
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
    const chosenLocation = (document.getElementById('filterLocationText')?.textContent || '').trim();
    const normalizedChoice = normalizeLocation(chosenLocation);
    let visibleCount = 0;

    carCards.forEach(card => {
        // 1. Kiểm tra vị trí
        const carLocation = normalizeLocation(getCarLocation(card));
        const matchesLocation = !normalizedChoice || carLocation.includes(normalizedChoice);
        if (!matchesLocation) {
            card.hidden = true;
            return;
        }

        const carName = (card.querySelector('h3')?.textContent || '').trim();
        const seats = parseCardSeats(card);
        const cardText = card.textContent.toLowerCase();

        // 2. Kiểm tra Loại xe (carType từ nút pill Loại xe)
        if (currentFilters.carType !== 'all') {
            const bodyType = getCarBodyType(carName, seats);
            if (currentFilters.carType === '4-seats' && seats > 5) {
                card.hidden = true;
                return;
            }
            if (currentFilters.carType === '7-seats' && seats < 7) {
                card.hidden = true;
                return;
            }
            if (currentFilters.carType === 'sedan' && bodyType !== 'sedan') {
                card.hidden = true;
                return;
            }
            if (currentFilters.carType === 'suv' && bodyType !== 'suv') {
                card.hidden = true;
                return;
            }
            if (currentFilters.carType === 'mpv' && bodyType !== 'mpv') {
                card.hidden = true;
                return;
            }
            if (currentFilters.carType === 'pickup' && bodyType !== 'pickup') {
                card.hidden = true;
                return;
            }
            if (currentFilters.carType === 'electric' && bodyType !== 'electric' && !cardText.includes('điện') && !carName.toLowerCase().includes('vf')) {
                card.hidden = true;
                return;
            }
        }

        // 3. Kiểm tra Hãng xe (brand từ nút pill Hãng xe)
        if (currentFilters.brand !== 'all') {
            const carBrand = getCarBrand(carName);
            if (currentFilters.brand === 'other') {
                const majorBrands = ['toyota', 'hyundai', 'vinfast', 'mazda', 'honda', 'kia', 'ford', 'mitsubishi'];
                if (majorBrands.includes(carBrand)) {
                    card.hidden = true;
                    return;
                }
            } else if (carBrand !== currentFilters.brand) {
                card.hidden = true;
                return;
            }
        }

        // 4. Kiểm tra Đặt xe nhanh (instant từ nút pill Đặt xe nhanh)
        if (currentFilters.instant && !isInstantBookingCar(card)) {
            card.hidden = true;
            return;
        }

        // 5. Kiểm tra mức giá
        if (currentFilters.price !== 'all') {
            const priceK = parseCardPriceK(card);
            if (currentFilters.price === 'under-800' && priceK >= 800) {
                card.hidden = true;
                return;
            }
            if (currentFilters.price === '800-1200' && (priceK < 800 || priceK > 1200)) {
                card.hidden = true;
                return;
            }
            if (currentFilters.price === 'above-1200' && priceK <= 1200) {
                card.hidden = true;
                return;
            }
        }

        // 6. Kiểm tra số chỗ
        if (currentFilters.seats !== 'all') {
            if (currentFilters.seats === '4' && seats > 5) {
                card.hidden = true;
                return;
            }
            if (currentFilters.seats === '7' && seats < 7) {
                card.hidden = true;
                return;
            }
        }

        // 7. Kiểm tra truyền động
        if (currentFilters.trans !== 'all') {
            const trans = parseCardTrans(card);
            if (trans !== currentFilters.trans) {
                card.hidden = true;
                return;
            }
        }

        // 8. Kiểm tra nhiên liệu
        if (currentFilters.fuel !== 'all') {
            const fuel = parseCardFuel(card);
            if (fuel !== currentFilters.fuel) {
                card.hidden = true;
                return;
            }
        }

        // 9. Kiểm tra tính năng
        if (currentFilters.delivery && !cardText.includes('tận nơi')) {
            card.hidden = true;
            return;
        }
        if (currentFilters.deposit && !cardText.includes('thế chấp')) {
            card.hidden = true;
            return;
        }

        card.hidden = false;
        visibleCount++;
    });

    if (countText) countText.textContent = `Tìm thấy ${visibleCount} xe phù hợp với chuyến đi của bạn`;
    if (noCarsMessage) noCarsMessage.hidden = visibleCount > 0;
}

if (carsGrid && (selectedLocation || document.getElementById('filterLocationText'))) {
    initCarBadges();
    buildLocationOptions();
    applyLocationFilter(selectedLocation || document.getElementById('filterLocationText').textContent);
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
    const initialOrder = Array.from(carsGrid.querySelectorAll('.car-card'));

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

// --- XỬ LÝ 3 NÚT NHANH: LOẠI XE, HÃNG XE, ĐẶT XE NHANH ---
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

// 1. Toggle Dropdown Loại xe (bấm mở, bấm lại đóng)
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

// 2. Toggle Dropdown Hãng xe (bấm mở, bấm lại đóng)
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

// Đóng dropdown khi click ra ngoài hoặc bấm phím Escape
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

// Chọn mục trong Loại xe
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

// Chọn mục trong Hãng xe
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

// 3. Toggle Đặt xe nhanh
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
        name: card.querySelector('h3')?.textContent.trim() || 'Xe AZU Car',
        image: card.querySelector('img')?.src || '',
        location,
        price: priceText,
        rating: ratingMatch ? ratingMatch[1] : '5.0',
        trips: tripsMatch ? `${tripsMatch[1]} chuyến` : '24 chuyến',
        year: yearMatch ? yearMatch[1] : '2026',
        transmission: card.querySelector('.tag-trans')?.textContent.trim() || 'Số tự động',
        seats: card.querySelector('.tag-seats')?.textContent.trim() || '4 chỗ'
    };
}

// Modal Popup Chi tiết xe
const carDetailModal = document.getElementById('carDetailModal');
const closeCarPopup = document.getElementById('closeCarPopup');

let currentPopupCar = null;

function openCarPopup(car) {
    currentPopupCar = car;

    // Tên xe & header
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

    // Gallery images
    const mainImg = document.getElementById('popupMainImg');
    const thumb1 = document.getElementById('popupThumb1');
    const thumb2 = document.getElementById('popupThumb2');
    const thumb3 = document.getElementById('popupThumb3');

    if (mainImg) mainImg.src = car.image;
    if (thumb1) thumb1.src = car.image;
    if (thumb2) thumb2.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600';
    if (thumb3) thumb3.src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600';

    // Đặc điểm
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

    // Pricing
    let rawPrice = parseInt(String(car.price || '524').replace(/\D/g, ''), 10);
    if (!rawPrice || rawPrice < 100) rawPrice = 524;
    const priceK = `${rawPrice}K`;
    const priceVND = rawPrice * 1000;

    const widgetPriceBig = document.getElementById('widgetPriceBig');
    if (widgetPriceBig) widgetPriceBig.textContent = priceK;

    const calcBasePrice = document.getElementById('calcBasePrice');
    if (calcBasePrice) calcBasePrice.textContent = `${priceVND.toLocaleString('vi-VN')}đ /ngày`;

    // Pickup & Return dates from search or default
    const pickupTimeText = document.getElementById('pickupTimeText')?.textContent.trim() || '21:00, 15/10/2026';
    const returnTimeText = document.getElementById('returnTimeText')?.textContent.trim() || '21:00, 16/10/2026';
    const widgetPickup = document.getElementById('widgetPickupTime');
    const widgetReturn = document.getElementById('widgetReturnTime');
    if (widgetPickup) widgetPickup.textContent = pickupTimeText;
    if (widgetReturn) widgetReturn.textContent = returnTimeText;

    updatePricingCalculation(priceVND);

    // Mở popup
    if (carDetailModal) {
        carDetailModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }
}

function updatePricingCalculation(basePriceVND) {
    const insuranceFee = 66501;
    const passengerCheck = document.getElementById('passengerInsuranceCheck');
    const passengerFee = (passengerCheck && passengerCheck.checked) ? 30000 : 0;

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

    const totalPrice = basePriceVND + insuranceFee + passengerFee + deliveryFee;
    const calcTotalPrice = document.getElementById('calcTotalPrice');
    if (calcTotalPrice) calcTotalPrice.textContent = `${totalPrice.toLocaleString('vi-VN')}đ`;
}

// Lắng nghe thay đổi option bảo hiểm & giao xe
document.getElementById('passengerInsuranceCheck')?.addEventListener('change', () => {
    const rawPrice = parseInt(String(currentPopupCar?.price || '524').replace(/\D/g, ''), 10) || 524;
    updatePricingCalculation(rawPrice * 1000);
});

document.querySelectorAll('input[name="deliveryOption"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const rawPrice = parseInt(String(currentPopupCar?.price || '524').replace(/\D/g, ''), 10) || 524;
        updatePricingCalculation(rawPrice * 1000);
    });
});

// Đóng popup
function closeCarModal() {
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
    if (e.key === 'Escape' && carDetailModal && !carDetailModal.hidden) {
        closeCarModal();
    }
});

// ========================================================
// XỬ LÝ QUY TRÌNH ĐẶT XE & NHẬP THÔNG TIN (BOOKING MODAL)
// ========================================================
const bookingModal = document.getElementById('bookingModal');
const closeBookingModalBtn = document.getElementById('closeBookingModal');
const btnBackToCar = document.getElementById('btnBackToCar');
const bookingCheckoutForm = document.getElementById('bookingCheckoutForm');
const deliveryAddressGroup = document.getElementById('deliveryAddressGroup');
const bookDeliveryAddress = document.getElementById('bookDeliveryAddress');

function openBookingModal() {
    if (!currentPopupCar) return;

    // Điền thông tin người dùng từ sessionStorage nếu có
    const savedName = sessionStorage.getItem('azuCarDisplayName') || '';
    const savedPhone = sessionStorage.getItem('azuCarPhone') || '';
    const savedEmail = sessionStorage.getItem('azuCarEmail') || '';

    const nameInput = document.getElementById('bookRenterName');
    const phoneInput = document.getElementById('bookRenterPhone');
    const emailInput = document.getElementById('bookRenterEmail');

    if (nameInput) nameInput.value = savedName === 'Người dùng' ? '' : savedName;
    if (phoneInput) phoneInput.value = savedPhone;
    if (emailInput) emailInput.value = savedEmail;

    // Cập nhật tóm tắt thông tin xe bên cột phải
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
        // Tự động focus vào ô trống đầu tiên
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

// Chuyển đổi lựa chọn hình thức nhận xe (Tự lấy / Giao tận nơi)
document.querySelectorAll('input[name="deliveryMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.delivery-radio-label').forEach(lbl => {
            lbl.classList.toggle('active', lbl.contains(radio));
        });
        const isDelivery = radio.value === 'delivery';
        if (deliveryAddressGroup) deliveryAddressGroup.hidden = !isDelivery;
        if (bookDeliveryAddress) bookDeliveryAddress.required = isDelivery;
        if (isDelivery && bookDeliveryAddress) bookDeliveryAddress.focus();
    });
});

// Chuyển đổi phương thức thanh toán
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.payment-radio-label').forEach(lbl => {
            lbl.classList.toggle('active', lbl.contains(radio));
        });
    });
});

// Bấm nút CHỌN THUÊ ở popup chi tiết xe
document.getElementById('btnRentCarSubmit')?.addEventListener('click', () => {
    if (!currentPopupCar) return;

    // Kiểm tra đăng nhập
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

    // Mở modal nhập thông tin đặt xe
    openBookingModal();
});

// Đóng modal thông tin đặt xe
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

// Submit form hoàn tất đặt xe
bookingCheckoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!bookingCheckoutForm.reportValidity() || !currentPopupCar) return;

    const name = document.getElementById('bookRenterName')?.value.trim();
    const phone = document.getElementById('bookRenterPhone')?.value.trim();
    const email = document.getElementById('bookRenterEmail')?.value.trim();
    const idNumber = document.getElementById('bookRenterId')?.value.trim();
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked')?.value || 'host';
    const deliveryAddress = document.getElementById('bookDeliveryAddress')?.value.trim();
    const notes = document.getElementById('bookRenterNotes')?.value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash';

    const pickupTime = document.getElementById('bookPickupTime')?.textContent.trim() || '21:00, 15/10/2026';
    const returnTime = document.getElementById('bookReturnTime')?.textContent.trim() || '21:00, 16/10/2026';
    const totalPrice = document.getElementById('bookTotalPrice')?.textContent.trim() || `${currentPopupCar.price}/ngày`;

    // Lưu thông tin người dùng vào session để đồng bộ khắp trang
    if (phone) sessionStorage.setItem('azuCarPhone', phone);
    if (email) sessionStorage.setItem('azuCarEmail', email);

    // Lưu chuyến đi vào kho AzuStore
    if (window.AzuStore?.addTrip) {
        window.AzuStore.addTrip({
            id: Date.now(),
            car: currentPopupCar.name,
            image: currentPopupCar.image,
            location: deliveryMethod === 'delivery' ? (deliveryAddress || currentPopupCar.location) : currentPopupCar.location,
            price: currentPopupCar.price,
            pickup: pickupTime,
            return: returnTime,
            status: 'current',
            total: totalPrice,
            renterName: name,
            renterPhone: phone,
            renterEmail: email,
            renterIdNumber: idNumber,
            deliveryType: deliveryMethod,
            paymentMethod: paymentMethod,
            notes: notes
        });
    }

    closeBookingModal();
    closeCarModal();

    // Thông báo đặt xe thành công
    if (confirm(`🎉 Đặt xe ${currentPopupCar.name} thành công!\n\n• Khách thuê: ${name}\n• Số điện thoại nhận xe: ${phone}\n• Tổng tiền: ${totalPrice}\n\nChủ xe sẽ liên hệ sớm nhất để bàn giao xe.\nBạn có muốn chuyển sang trang 'Chuyến của tôi' để kiểm tra lịch trình không?`)) {
        window.location.href = 'my-trips.html#trips';
    }
});

carsGrid?.addEventListener('click', event => {
    const card = event.target.closest('.car-card');
    if (!card) return;
    const car = carFromCard(card);
    window.AzuStore.setSelectedCar(car);
    openCarPopup(car);
});
