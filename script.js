const sites = [
  {
    id: 1,
    nom: "Ecole Primaire",
    type: "Bâtiment scolaire",
    categorie: "École",
    code: "SC",
    score: 1.5,
    lat: 43.650322300491,
    lng: 3.6932355372709873,
    photo: "SIG/Photo_1.jpg",
    impact: "SIG/Impact_1.png",
    radar: "SIG/Radar_1.jpg"
  },
  {
    id: 2,
    nom: "Ecole Maternelle",
    type: "Bâtiment scolaire",
    categorie: "École",
    code: "SC",
    score: 2.5,
    lat: 43.641731168738815,
    lng: 3.6960720121619137,
    photo: "SIG/Photo_2.jpg",
    impact: "SIG/Impact_2.png",
    radar: "SIG/Radar_2.png"
  },
  {
    id: 3,
    nom: "Mairie",
    type: "Bâtiment administratif",
    categorie: "Administration",
    code: "AD",
    score: 2.5,
    lat: 43.6487945173187,
    lng: 3.6981382316378615,
    photo: "SIG/Photo_3.jpg",
    impact: "SIG/Impact_3.png",
    radar: "SIG/Radar_3.png"
  },
  {
    id: 4,
    nom: "Halle aux sports",
    type: "Équipement",
    categorie: "Sport",
    code: "EQ",
    score: 1.8,
    lat: 43.64163051389877,
    lng: 3.69777775923045,
    photo: "SIG/Photo_4.png",
    impact: "SIG/Impact_4.png",
    radar: "SIG/Radar_4.png"
  },
  {
    id: 5,
    nom: "Salle des fêtes",
    type: "Équipement",
    categorie: "Culture / événementiel",
    code: "EQ",
    score: 2.5,
    lat: 43.649183210261036,
    lng: 3.6993937793351033,
    photo: "SIG/Photo_5.png",
    impact: "SIG/Impact_5.png",
    radar: "SIG/Radar_5.png"
  },
  {
    id: 6,
    nom: "Bibliothèque",
    type: "Équipement",
    categorie: "Culture",
    code: "EQ",
    score: 2.3,
    lat: 43.65037929724254,
    lng: 3.699151412509178,
    photo: "SIG/Photo_6.png",
    impact: "SIG/Impact_6.png",
    radar: "SIG/Radar_6.png"
  },
  {
    id: 7,
    nom: "Espoir pour un Enfant",
    type: "Équipement",
    categorie: "Association / service",
    code: "EQ",
    score: 2.5,
    lat: 43.650222890069976,
    lng: 3.698481328378584,
    photo: "SIG/Photo_7.png",
    impact: "SIG/Impact_7.png",
    radar: "SIG/Radar_7.png"
  }
];

const map = L.map("map", {
  zoomControl: true
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const markersLayer = L.layerGroup().addTo(map);
let lastOpenedSite = null;

const typeCheckboxes = document.querySelectorAll(".type-filter");
const typeSelect = document.getElementById("typeSelect");
const detailCard = document.getElementById("detailCard");
const closeDetailCard = document.getElementById("closeDetailCard");
const openFullPopupBtn = document.getElementById("openFullPopup");
const buildingCount = document.getElementById("buildingCount");
const avgScore = document.getElementById("avgScore");

const techDashboardCard = document.getElementById("techDashboardCard");
const techDashboardImage = document.getElementById("techDashboardImage");

function getMarkerClass(type) {
  if (type === "Bâtiment scolaire") return "marker-school";
  if (type === "Bâtiment administratif") return "marker-admin";
  return "marker-equipment";
}

function createMarkerIcon(site) {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="marker-badge ${getMarkerClass(site.type)}">
        <span>${site.code}</span>
      </div>
    `,
    iconSize: [54, 54],
    iconAnchor: [27, 50],
    tooltipAnchor: [0, -42],
    popupAnchor: [0, -42]
  });
}

function createPopupContent(site) {
  return `
    <div class="popup-card">
      <h3>${site.nom}</h3>
      <div class="popup-line"><strong>Type :</strong> ${site.type}</div>
      <div class="popup-line"><strong>Catégorie :</strong> ${site.categorie}</div>
      <div class="popup-line"><strong>Impact énergétique :</strong> ${site.score.toFixed(1)}</div>

      <span class="popup-section-title">Photo du site</span>
      <img src="${site.photo}" alt="Photo de ${site.nom}">

      <span class="popup-section-title">Indicateur impact et usage</span>
      <img src="${site.impact}" alt="Impact de ${site.nom}">
    </div>
  `;
}

function updateDetailCard(site) {
  document.getElementById("detailHeaderTitle").textContent = site.nom;
  document.getElementById("detailPhoto").src = site.photo;
  document.getElementById("detailPhoto").alt = `Photo de ${site.nom}`;
  document.getElementById("detailTitle").textContent = site.nom;
  document.getElementById("detailType").textContent = site.type;
  document.getElementById("detailCategory").textContent = site.categorie;
  document.getElementById("detailScore").textContent = site.score.toFixed(1);

  techDashboardImage.src = site.radar;
  techDashboardImage.alt = `Indicateur technique de ${site.nom}`;
  techDashboardCard.classList.remove("hidden");

  detailCard.classList.remove("hidden");
  lastOpenedSite = site;
}

function getSelectedTypes() {
  return Array.from(typeCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function updateSummary(visibleSites) {
  buildingCount.textContent = visibleSites.length;

  if (visibleSites.length === 0) {
    avgScore.textContent = "0.0";
    return;
  }

  const total = visibleSites.reduce((sum, site) => sum + site.score, 0);
  avgScore.textContent = (total / visibleSites.length).toFixed(1);
}

function renderMarkers(filteredSites) {
  markersLayer.clearLayers();

  const bounds = [];

  filteredSites.forEach((site) => {
    const marker = L.marker([site.lat, site.lng], {
      icon: createMarkerIcon(site)
    });

    marker.bindTooltip(site.nom, {
      permanent: false,
      direction: "top",
      className: "map-tooltip",
      offset: [0, -18]
    });

    marker.bindPopup(createPopupContent(site), {
      maxWidth: 360
    });

    marker.on("click", () => {
      updateDetailCard(site);
    });

    marker.addTo(markersLayer);
    bounds.push([site.lat, site.lng]);
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] });
  } else {
    map.setView([43.6478, 3.6974], 15);
  }

  updateSummary(filteredSites);
}

function applyFilters() {
  const selectedTypes = getSelectedTypes();
  const selectedTypeFromSelect = typeSelect.value;

  const filteredSites = sites.filter((site) => {
    const checkboxMatch = selectedTypes.includes(site.type);
    const selectMatch =
      selectedTypeFromSelect === "all" || site.type === selectedTypeFromSelect;

    return checkboxMatch && selectMatch;
  });

  renderMarkers(filteredSites);

  if (
    lastOpenedSite &&
    !filteredSites.some((site) => site.id === lastOpenedSite.id)
  ) {
    detailCard.classList.add("hidden");
    techDashboardCard.classList.add("hidden");
    lastOpenedSite = null;
  }
}

typeCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", applyFilters);
});

typeSelect.addEventListener("change", applyFilters);

closeDetailCard.addEventListener("click", () => {
  detailCard.classList.add("hidden");
});

openFullPopupBtn.addEventListener("click", () => {
  if (!lastOpenedSite) return;

  markersLayer.eachLayer((layer) => {
    const latlng = layer.getLatLng();

    if (
      Math.abs(latlng.lat - lastOpenedSite.lat) < 0.000001 &&
      Math.abs(latlng.lng - lastOpenedSite.lng) < 0.000001
    ) {
      layer.openPopup();
    }
  });
});

map.setView([43.6478, 3.6974], 15);
applyFilters();