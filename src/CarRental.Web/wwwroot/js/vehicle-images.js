(() => {
    const images = new Map([
        ['COROLLACROSS', 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Toyota_Corolla_Cross_Hybrid_1X7A1861.jpg'],
        ['XPANDER', 'https://upload.wikimedia.org/wikipedia/commons/3/38/Mitsubishi_Xpander_Sport_%28depan%29%2C_Palangkaraya.jpg'],
        ['VFE34', 'https://upload.wikimedia.org/wikipedia/commons/1/18/2024_VinFast_VFe34%2C_06-14-2024.jpg'],
        ['VF5', 'https://upload.wikimedia.org/wikipedia/commons/0/0e/2024_VinFast_VF5%2C_front_left%2C_06-14-2024.jpg'],
        ['VF8', 'https://vinfasthanoi247.com/wp-content/uploads/2025/03/e96dddcc-ac5e-4c84-ac0a-e3bbd9950979-800x600-1.jpeg'],
        ['CITY', 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Honda_City_2020.jpg'],
        ['SANTAFE', 'https://upload.wikimedia.org/wikipedia/commons/c/c8/2024_Hyundai_Santa_Fe_%28MX5%29_IMG_5295.jpg'],
        ['CARNIVAL', 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Kia_Carnival_KA4_3.5_LX_V6_Panthera_Metal_diplomatic.jpg'],
        ['CX8', 'https://upload.wikimedia.org/wikipedia/commons/a/a6/MAZDA_CX-8_China_%281%29.jpg'],
        ['VIOS', 'https://upload.wikimedia.org/wikipedia/commons/2/25/Toyota_Vios_%28XP150%29_sedan_front_view.jpg'],
        ['ACCENT', 'https://upload.wikimedia.org/wikipedia/commons/3/3e/HYUNDAI_ACCENT_SEDAN_%28MC%29_China.jpg'],
        ['CX5', 'https://upload.wikimedia.org/wikipedia/commons/4/43/Mazda_CX-5_Newground_1X7A6786.jpg'],
        ['CX30', 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Mazda_CX-30_XD_AWD_rear.jpg'],
        ['CRV', 'https://upload.wikimedia.org/wikipedia/commons/0/01/Honda_CR-V%2C_Auto_2024%2C_Zurich_%28PANA0740%29.jpg'],
        ['TUCSON', 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Hyundai_Tucson_Plug-in_N-Line_Auto_Zuerich_2021_IMG_0366.jpg'],
        ['EVEREST', 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Ford_Everest_U704_2.0_Turbo_Trend_Arctic_White_diplomatic.jpg'],
        ['TERRITORY', 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Ford_Territory_003.jpg'],
        ['TRANSIT', 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Ford_Transit_Custom_%282023%29_1X7A1605.jpg'],
        ['MORNING', 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Kia_Picanto_%28JA%3B_2017%29.jpg'],
        ['SONET', 'https://upload.wikimedia.org/wikipedia/commons/7/75/2021_Kia_Sonet_1.5_Premiere_%28Indonesia%29_front_view_02.jpg']
    ]);
    const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23f1f5f9'/%3E%3Cpath d='M140 230h360l-25-75c-8-24-29-40-54-40H220c-25 0-46 16-54 40z' fill='%2394a3b8'/%3E%3Ccircle cx='220' cy='235' r='34' fill='%23334155'/%3E%3Ccircle cx='420' cy='235' r='34' fill='%23334155'/%3E%3C/svg%3E";
    const normalize = value => String(value || '').toUpperCase().replace(/[\s-]+/g, '');

    function resolve(vehicleName, currentImage = '') {
        if (currentImage && !/\/seed\/car\d+-\d+\.jpg(?:\?.*)?$/i.test(currentImage)) {
            return currentImage;
        }

        const normalizedName = normalize(vehicleName);
        for (const [model, image] of images) {
            if (normalizedName.includes(model)) return image;
        }
        return placeholder;
    }

    window.AzuVehicleImages = { resolve, placeholder };

    document.querySelectorAll('img[data-vehicle-model]').forEach(image => {
        image.src = resolve(image.dataset.vehicleModel, image.dataset.vehicleImage || '');
        image.addEventListener('error', () => {
            image.onerror = null;
            image.src = placeholder;
        }, { once: true });
    });
})();