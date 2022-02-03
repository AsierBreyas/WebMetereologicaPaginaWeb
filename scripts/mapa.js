// import $ from 'jquery';
window.$ = $;
var latLng = [43.3452544, -1.7967802];
var sNoCampos = '<p class="col-8">No hay localizaciones seleccionadas, por favor seleccione una</p>';
if (navigator.geolocation) navigator.geolocation.getCurrentPosition(function (pos) {

    //Si es aceptada guardamos lo latitud y longitud
    var lat = pos.coords.latitude;
    var lon = pos.coords.longitude;
    latLng = [lat, lon]

}, function (error) {

    //Si es rechazada enviamos de error por consola
    console.log('Ubicación no activada');
});

import L, { layerGroup } from 'leaflet';
var mymap = L.map('map').setView(latLng, 13);
var group = L.layerGroup();
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org/%22%3EOpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/%22%3ECC-BY-SA</a>, Imagery © <a href="http://cloudmade.com/%22%3ECloudMade</a>',
    minzoom: 13,
    maxZoom: 19
}).addTo(mymap);
L.control.scale().addTo(mymap);
fetch('https://localhost:5001/api/Tiempo').then(response => response.json()).then(registroTiempo => {
    aPrueba = registroTiempo;
    aPrueba.forEach(element => {
        var localidad = { 'localidad': element.municipio, 'Temperatura': true, 'Viento': false, 'Tiempo': true, 'Precipitacion': false };
        var marker = L.marker([parseFloat((element.latitud).replace(',', '.')), parseFloat((element.longitud).replace(',', '.'))]).on('click', function () { Añadir(localidad) });
        group.addLayer(marker);
        element.marker_id = group.getLayerId(marker);
        //Una vez terminado el mapa vamos a mirar si en el localStorage está algo guardado y lo metemos en el HTML
        localStorage.getItem(element.municipio) !=null ? GenerarDatos(element.municipio) : "";
    });
})
group.addTo(mymap);
$('#btnMapa').on('click', function () { $('#map').toggle('slow') })
$(".draggable").draggable({
    zIndex: 100,
    revert: true,
    revertDuration: 0,
    start: function(event, ui){
        $('.ui-droppable').css('background-color', '#19875')
    },
    stop: function(event, ui){
        $('.ui-droppable').css('background-color', '#939393')
    }
});
$("#campos").html() === '\n\n\n            ' ? $("#campos").html(sNoCampos) : "";
function activarDrop(id){
    $(`#${id}`).droppable({
        drop: function (event, ui) {
            var opcion = $(ui.draggable).attr("alt");
            localidad = JSON.parse(localStorage.getItem(id));
            localidad[opcion] = true;
            localStorage.setItem(localidad.localidad ,JSON.stringify(localidad));
            hacerOpciones(opcion, id);
        }
    });
}

function Añadir(oLocalidad) {
    // var localidad = { 'localidad': Nombre, 'Temperatura': true, 'Viento': false, 'Tiempo': true, 'Precipitacion': false };
    localStorage.getItem(oLocalidad.localidad) === null ? localStorage.setItem(oLocalidad.localidad, JSON.stringify(oLocalidad)) : localStorage.removeItem(oLocalidad.localidad);
    // localStorage.getItem(Codigo) === null ? localStorage.setItem(Codigo, Nombre) : localStorage.removeItem(Codigo);
    $(`#${oLocalidad.localidad}`).html() === undefined ? GenerarDatos(oLocalidad.localidad) : EliminarHtml(oLocalidad.localidad);
}
function activarBotones() {
    $(`.btn-close`).on("click", function () {
        $(`#${this.value}`).remove();
        localStorage.removeItem(this.value);
        $("#campos").html() === '' ? $("#campos").html(sNoCampos) : "";
    });
    $(`.opcion`).on('click', function(){
        opcion = $(this).attr('id');
        id = $(this).attr('alt');
        localidad = JSON.parse(localStorage.getItem(id));
        localidad[opcion] = false;
        localStorage.setItem(localidad.localidad ,JSON.stringify(localidad));
        hacerOpciones(opcion, id);
        activarDrop(id);
    });
}
function GenerarDatos(Codigo){
    fetch(`https://localhost:5001/api/Tiempo/${Codigo}`).then(response => response.json()).then(unRegistroTiempo => {
        sDatoNuevo = `<div class="card col " id="${Codigo}">  <div class="card-body>"> <h4 class="card-title"> ${unRegistroTiempo["municipio"]}</h4>`;
        sDatoNuevo += `<button class="btn-close" id="btn${Codigo}" value="${Codigo}" aria-label="Cerrar pestaña"></button>`;
        sDatoNuevo += `<div class="opciones" id='${unRegistroTiempo["municipio"]}Temperatura'><h5 class="bi bi-thermometer" role="img" alt="Temperatura"> ${unRegistroTiempo["temperatura"]} ºC </h5><h5 class='bi bi-x-octagon opcion' id="Temperatura" role="img" alt="${unRegistroTiempo["municipio"]}"></h5></div>`;
        sDatoNuevo += `<div class="opciones" id='${unRegistroTiempo["municipio"]}Viento'><h5 class="bi bi-wind"  role="img" alt="Viento"> ${unRegistroTiempo["velocidadViento"]} km/h </h5><h5 class='bi bi-x-octagon opcion' id="Viento" role="img" alt="${unRegistroTiempo["municipio"]}"></h5></div>`;
        sDatoNuevo += `<div class="opciones" id='${unRegistroTiempo["municipio"]}Tiempo'><h5 class="bi bi-cloud"  role="img" alt="Tiempo"> <img src='${unRegistroTiempo["pathImg"]}'></img></h5><h5 class='bi bi-x-octagon opcion' id="Tiempo" role="img" alt="${unRegistroTiempo["municipio"]}"></h5></div>`;
        sDatoNuevo += `<div class="opciones" id='${unRegistroTiempo["municipio"]}Precipitacion'><h5 class="bi bi-umbrella" role="img" alt="Precipitacion"> ${unRegistroTiempo["precipitacionAcumulada"]}% </h5><h5 class='bi bi-x-octagon opcion' id="Precipitacion" role="img" alt="${unRegistroTiempo["municipio"]}"></h5></div>`
        sDatoNuevo += "</div></div>";
        ponerCartas(sDatoNuevo, Codigo);
    });
}
function ponerCartas(html, Codigo){
    $("#campos").html() === sNoCampos ? $("#campos").html(html): $("#campos").html($("#campos").html() + html);
    hacerOpciones("Temperatura", Codigo);
    hacerOpciones("Viento", Codigo);
    hacerOpciones("Tiempo", Codigo);
    hacerOpciones("Precipitacion", Codigo);
    activarBotones();
    activarDrop(Codigo);
}
function hacerOpciones(opcion, Codigo){
    var refLocalidad = JSON.parse(localStorage.getItem(Codigo));
    refLocalidad[opcion] === false ? $(`#${Codigo}${opcion}`).hide(): $(`#${Codigo}${opcion}`).show();
}
function EliminarHtml(Codigo) {
    $(`#${Codigo}`).remove();
    $("#campos").html() === '' ? $("#campos").html(sNoCampos) : "";
}