var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 55.70074897777983, lng: 12.500224174892924},
    zoom: 12
  });
}

const app = document.getElementById('residence')

const container = document.createElement('div')
container.setAttribute('class', 'container')

const loadMore = document.createElement('a')
loadMore.setAttribute('id', 'loadMore')
loadMore.setAttribute('data-index', 10)
loadMore.textContent = 'Carregar Mais'

app.appendChild(container)
app.appendChild(loadMore)

const loadMoreBtn = document.getElementById('loadMore');
loadMoreBtn.addEventListener('click', function(e){
  const dataIndex = this.getAttribute('data-index')
  loadRes(dataIndex)
  loadMore.setAttribute('data-index', parseInt(dataIndex, 10) + 10)
});

window.onload = loadRes(0)

function loadRes(dataIndex) {
  // Atribui um novo objeto XMLHttpRequest pra variável.
  var request = new XMLHttpRequest();
  
  // Abre uma nova conexão usando GET
  request.open(
    "GET",
    // "https://api.sheety.co/30b6e400-9023-4a15-8e6c-16aa4e3b1e72",
    // "https://public.opendatasoft.com/api/records/1.0/search/?dataset=airbnb-listings&q=&rows=10&start=0&sort=last_scraped&facet=host_response_time&facet=host_response_rate&facet=host_verifications&facet=city&facet=country&facet=property_type&facet=room_type&facet=bed_type&facet=amenities&facet=availability_365&facet=cancellation_policy&facet=features",
    `https://public.opendatasoft.com/api/records/1.0/search/?dataset=airbnb-listings&q=&rows=10&start=${dataIndex}&sort=last_scraped`,
    true
  );
  
  request.onload = function () {
    // Tratar o objeto JSON
    var data = JSON.parse(this.response);
    console.log(data);
  
    if (request.status >= 200 && request.status < 400) {
      data.records.forEach((residence) => {
        console.log(residence.fields);
        const item = residence.fields
  
        if (typeof item.price !== 'undefined' ) {
          const card = document.createElement('section')
          card.setAttribute('class', 'card')
    
          const h3 = document.createElement('h3')
          h3.textContent = item.name
    
          const property_type = document.createElement('p')
          property_type.textContent = `Tipo: ${item.property_type}`
    
          const imgResidence = document.createElement('div')
          imgResidence.setAttribute('class', 'img-residence')
  
          const img = document.createElement('img')
          if (typeof item.medium_url !== 'undefined') {
            img.setAttribute('src', item.medium_url)
          } else {
            img.setAttribute('src', 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/3E5D/production/_109556951_airbnb.png')
          }
  
          const precoDiv = document.createElement('div')
          precoDiv.setAttribute('class', 'preco')
  
          const preco = document.createElement('span')
          preco.textContent = item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  
          var latLng = new google.maps.LatLng(item.latitude, item.longitude);
          var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            label: item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            animation: google.maps.Animation.DROP,
            title: item.name
          });
  
          container.appendChild(card)
          card.appendChild(h3)
          card.appendChild(imgResidence)
          imgResidence.appendChild(img)
          card.appendChild(property_type)
          card.appendChild(precoDiv)
          precoDiv.appendChild(preco)
        }
  
      });
    } else {
      const errorMessage = document.createElement('marquee')
      errorMessage.textContent = `Deu ruim!`
      app.appendChild(errorMessage)
    }
  };
  
  // Envia o request
  request.send();
}
