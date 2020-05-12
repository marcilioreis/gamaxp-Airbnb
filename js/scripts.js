let map;

// Cria Elementos
const app = document.getElementById("residence");
const container = document.createElement("div");
const stay = document.getElementById("stay");
const city = document.getElementById("city").value;

// Cria botão de carregar mais
// TODO: implementar paginação com números
const loadMore = document.createElement("a");

// Funções
function init() {
  container.setAttribute("class", "container");
  loadMore.setAttribute("id", "loadMore");
  loadMore.setAttribute("data-index", 10);

  loadMore.textContent = "Carregar Mais";
  stay.textContent = `Stays in ${city}`;

  app.appendChild(container);
  app.appendChild(loadMore);
}

function initMap(latitude, longitude) {
  latitude = typeof latitude !== "undefined" ? latitude : 41.38189293967732;
  longitude = typeof longitude !== "undefined" ? longitude : 2.172397386530445;

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: latitude, lng: longitude },
    zoom: 12,
  });
}

function coordinatesMap(city) {
  let coordinates = {
    latitude: 0,
    longitude: 0
  };

  switch (city) {
    case 'Paris':
      coordinates.latitude = 48.8032
      coordinates.longitude = 2.3511
      break;
    case 'London':
      coordinates.latitude = 51.5072
      coordinates.longitude = -0.1275
      break;
    case 'Berlin':
      coordinates.latitude = 52.5186
      coordinates.longitude = 13.4081
      break;
    case 'Roma':
      coordinates.latitude = 41.8905
      coordinates.longitude = 12.4942
      break;
    case 'Barcelona':
      coordinates.latitude = 41.3879
      coordinates.longitude = 2.16992
      break;
    default:
      coordinates.latitude = 0
      coordinates.longitude = 0
      break;
  }

  return coordinates;
}

function loadResidence(dataIndex, city, guests, diffDays, destroy) {
  let request = new XMLHttpRequest();
  const coordinates = coordinatesMap(city);

  if (destroy === true) {
    container.innerHTML = "";
  }

  initMap(coordinates.latitude, coordinates.longitude);

  city = typeof city === "undefined" ? "" : "&refine.city=" + city;
  guests = typeof guests !== "undefined" ? guests : 1;

  request.open(
    "GET",
    `https://public.opendatasoft.com/api/records/1.0/search/?dataset=airbnb-listings&q=accommodates=${guests}&rows=10&start=${dataIndex}&sort=last_scraped${city}`,
    true
  );

  request.onload = function () {
    // Tratar o objeto JSON
    let data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
      data.records.forEach((residence) => {
        console.log(residence.fields);
        const item = residence.fields;

        if (typeof item.price !== "undefined") {
          const card = document.createElement("section");
          card.setAttribute("class", "card");
          card.setAttribute("data-lat", item.latitude);
          card.setAttribute("data-long", item.longitude);

          const h3 = document.createElement("h3");
          h3.textContent = item.name;

          const property_type = document.createElement("p");
          property_type.textContent = `Type: ${item.property_type}`;

          const imgResidence = document.createElement("div");
          imgResidence.setAttribute("class", "img-residence");

          const img = document.createElement("img");
          if (typeof item.medium_url !== "undefined") {
            img.setAttribute("src", item.xl_picture_url);
          } else {
            img.setAttribute(
              "src",
              "https://ichef.bbci.co.uk/news/1024/cpsprodpb/3E5D/production/_109556951_airbnb.png"
            );
          }

          const precoDiv = document.createElement("div");
          precoDiv.setAttribute("class", "preco");

          const totalDays = diffDays * guests;
          const preco = document.createElement("span");
          const formattedPrice =  (item.price * totalDays).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
          preco.textContent = formattedPrice;

          // GMaps Api
          let contentString = `<div class="box-info">
                                <h1>${item.name}</h1>
                                <p>Type: ${item.property_type}</p>
                                <p>Description: ${item.description}</p>
                                <p>Location: ${item.street}</p>
                                <p>Price: ${formattedPrice}</p>
                              </div>`;
          let infowindow = new google.maps.InfoWindow({
            content: contentString
          });
          let latLng = new google.maps.LatLng(item.latitude, item.longitude);
          let marker = new google.maps.Marker({
            position: latLng,
            map: map,
            label: formattedPrice,
            animation: google.maps.Animation.DROP,
            title: item.name,
          });

          marker.addListener('click', function() {
            infowindow.open(map, marker);
            map.setZoom(15);
            map.setCenter(marker.getPosition());
          });

          container.appendChild(card);
          card.appendChild(h3);
          card.appendChild(imgResidence);
          imgResidence.appendChild(img);
          card.appendChild(property_type);
          card.appendChild(precoDiv);
          precoDiv.appendChild(preco);
        }
      });

      panZoomCard();

    } else {
      const errorMessage = document.createElement("marquee");
      errorMessage.textContent = `Deu ruim!`;
      app.appendChild(errorMessage);
    }
  };

  // Envia o request
  request.send();
}

function panZoomCard() {
  const card = document.querySelectorAll(".card");
  card.forEach(item => {
    item.addEventListener("click", function () {
      const latitude = this.getAttribute("data-lat");
      const longitude = this.getAttribute("data-long");
      const panPoint = new google.maps.LatLng(latitude, longitude);

      map.setZoom(15); 
      map.panTo(panPoint);
      });
  })
  
}

function compareDates() {
  const from = document.getElementById("checkin").value;
  const to = document.getElementById("checkout").value;

  const splitFrom = from.split("/");
  const splitTo = to.split("/");

  const fromDate = Date.parse(splitFrom[0], splitFrom[1] - 1, splitFrom[2]);
  const toDate = Date.parse(splitTo[0], splitTo[1] - 1, splitTo[2]);

  return fromDate < toDate;
}

// Eventos
function loadMoreBtn() {
  document.getElementById("loadMore").addEventListener("click", function () {
    const dataIndex = this.getAttribute("data-index");
    loadResidence(dataIndex, city, 1, 1, false);
    loadMore.setAttribute("data-index", parseInt(dataIndex, 10) + 10);
  });
}

function submitFilter() {
  const btnSearch = document.getElementById("form-search");
  const currentDate = new Date(Date.now()).toISOString().substr(0, 10);
  const tomorrow = new Date(Date.now() + ( 3600 * 1000 * 24)).toISOString().substr(0, 10);
  const city = document.getElementById("city");
  const guests = document.getElementById("guests");
  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");
  const oneDay = 24 * 60 * 60 * 1000;

  guests.value = '1';
  checkin.value = currentDate;
  checkout.value = tomorrow;
  
  checkin.setAttribute("min", currentDate);
  checkout.setAttribute("min", tomorrow);

  btnSearch.addEventListener("submit", function (e) {
    e.preventDefault();

    const dayCompare = compareDates();
    const dateCheckin = new Date(checkin.value);
    const dateCheckout = new Date(checkout.value);
    const diffDays = Math.round(
      Math.abs((dateCheckin.getTime() - dateCheckout.getTime()) / oneDay)
    );

    if (dayCompare) {
      if (diffDays >= 1) {
        if (guests.value >= 1) {
          loadResidence(0, city.value, guests.value, diffDays, true);
        } else {
          alertify.warning("Selecione pelo menos 1 hóspede");
        }
      } else {
        alertify.warning("Selecione uma data maior que a do check-in");
      }
    } else {
      alertify.warning("Selecione uma data maior que a do check-in");
    }

    stay.textContent = `Stays in ${city.value}`;
  });
}

window.addEventListener("load", function () {
  init();

  submitFilter();

  loadResidence(0, city, 1, 1, true);

  loadMoreBtn();
});
